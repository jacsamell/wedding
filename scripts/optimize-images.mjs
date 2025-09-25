#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

const IMAGES_ROOT = path.resolve('public', 'images');
const DEFAULT_CONFIG = {
  maxWidth: 1600,
  maxHeight: 1600,
  png: { compressionLevel: 9, quality: 80, effort: 10, palette: true },
  jpeg: { quality: 75, mozjpeg: true, progressive: true },
  webp: { quality: 78, alphaQuality: 85, smartSubsample: true },
  webpPhotoQuality: 72
};
const OVERRIDES = new Map([
  ['elm.png', { maxWidth: 1400 }],
  ['pres.png', { maxWidth: 1024 }],
  ['pres-original.png', { maxWidth: 1536, webp: { quality: 80, alphaQuality: 90 } }]
]);

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(entryPath));
    } else {
      files.push(entryPath);
    }
  }
  return files;
}

function buildConfig(relPath) {
  const base = { ...DEFAULT_CONFIG };
  const override = OVERRIDES.get(relPath) || OVERRIDES.get(relPath.replace(/\\/g, '/'));
  if (override) {
    if (override.maxWidth) base.maxWidth = override.maxWidth;
    if (override.maxHeight) base.maxHeight = override.maxHeight;
    if (override.png) base.png = { ...base.png, ...override.png };
    if (override.jpeg) base.jpeg = { ...base.jpeg, ...override.jpeg };
    if (override.webp) base.webp = { ...base.webp, ...override.webp };
    if (override.webpPhotoQuality) base.webpPhotoQuality = override.webpPhotoQuality;
  }
  return base;
}

async function optimizeImage(absPath) {
  const relFromImages = path.relative(IMAGES_ROOT, absPath).replace(/\\/g, '/');
  const ext = path.extname(relFromImages).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return { skipped: true, rel: relFromImages };

  const config = buildConfig(relFromImages);
  const dir = path.dirname(absPath);
  const parsed = path.parse(absPath);
  const webpPath = path.join(dir, `${parsed.name}.webp`);
  const tempOriginal = `${absPath}.tmp`;
  const tempWebp = `${webpPath}.tmp`;

  const originalStat = await fs.stat(absPath);
  const pipeline = sharp(absPath).resize({
    width: config.maxWidth,
    height: config.maxHeight,
    fit: 'inside',
    withoutEnlargement: true
  });

  if (ext === '.png') {
    await pipeline.clone().png(config.png).toFile(tempOriginal);
  } else {
    await pipeline.clone().jpeg(config.jpeg).toFile(tempOriginal);
  }
  await fs.rename(tempOriginal, absPath);

  const webpOptions = { ...config.webp };
  if (ext !== '.png') {
    webpOptions.quality = config.webpPhotoQuality ?? webpOptions.quality;
    delete webpOptions.alphaQuality;
  }

  await pipeline.clone().webp(webpOptions).toFile(tempWebp);
  await fs.rename(tempWebp, webpPath);

  const optimizedStat = await fs.stat(absPath);
  const webpStat = await fs.stat(webpPath);
  return {
    rel: relFromImages,
    originalSize: originalStat.size,
    optimizedSize: optimizedStat.size,
    webpSize: webpStat.size
  };
}

(async () => {
  try {
    const files = await walk(IMAGES_ROOT);
    const results = await Promise.all(files.map(optimizeImage));
    for (const result of results) {
      if (result.skipped) continue;
      const change = result.originalSize - result.optimizedSize;
      const savedLabel = change > 0 ? `saved ${formatSize(change)}` : 'no change';
      console.log(`${result.rel.padEnd(40)} ${formatSize(result.originalSize)} → ${formatSize(result.optimizedSize)} (${savedLabel}, webp ${formatSize(result.webpSize)})`);
    }
    console.log('Image optimization complete.');
  } catch (error) {
    console.error('Image optimization failed:', error);
    process.exit(1);
  }
})();
