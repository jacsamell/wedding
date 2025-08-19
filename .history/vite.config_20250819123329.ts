import { defineConfig } from 'vite';
import { resolve } from 'path';
import type { Plugin } from 'vite';
import { searchSpotifyTracks } from './server/spotify-api';

// Custom plugin to handle API requests during development
function devApiPlugin(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Handle Spotify search API
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
        }
        // Handle Spotify add song API
        else if (req.url === '/api/spotify/add-song' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const songRequest = JSON.parse(body);
              console.log('Song request received:', songRequest);
              // For development, just return success
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Song request received' }));
            } catch (error) {
              console.error('Song request error:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to process song request' }));
            }
          });
        }
        // Handle RSVP API
        else if (req.url === '/api/rsvp/guests' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const guestData = JSON.parse(body);
              console.log('Guest RSVP received:', guestData);
              // For development, just return success
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, id: guestData.id }));
            } catch (error) {
              console.error('RSVP error:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to save RSVP' }));
            }
          });
        }
        else {
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


