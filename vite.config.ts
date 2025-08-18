import { defineConfig } from 'vite';
import { resolve } from 'path';
import type { Plugin } from 'vite';
import { searchSpotifyTracks } from './server/spotify-api';

// Custom plugin to handle Spotify API requests
function spotifyApiPlugin(): Plugin {
  return {
    name: 'spotify-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/spotify/search' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const { query } = JSON.parse(body);
              const tracks = await searchSpotifyTracks(query);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ tracks }));
            } catch (error) {
              console.error('Spotify search error:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Search failed' }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [spotifyApiPlugin()],
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  css: {
    postcss: './postcss.config.js',
  },
});


