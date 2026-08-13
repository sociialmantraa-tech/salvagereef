import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

function devApiPlugin() {
  const settingsFilePath = path.resolve(__dirname, 'dev_system_settings.json');

  return {
    name: 'dev-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';

        // Handle GET /api/v1/system/settings
        if (req.method === 'GET' && url.includes('/system/settings')) {
          res.setHeader('Content-Type', 'application/json');
          if (fs.existsSync(settingsFilePath)) {
            try {
              const data = fs.readFileSync(settingsFilePath, 'utf-8');
              const parsed = JSON.parse(data);
              res.end(JSON.stringify({ success: true, settings: parsed }));
              return;
            } catch (e) {}
          }
          res.end(JSON.stringify({ success: true, settings: null }));
          return;
        }

        // Handle POST /api/v1/admin/settings
        if (req.method === 'POST' && url.includes('/admin/settings')) {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              let parsedNew = JSON.parse(body || '{}');
              let existing = {};
              if (fs.existsSync(settingsFilePath)) {
                try { existing = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8')); } catch (e) {}
              }
              const merged = { ...existing, ...parsedNew };
              fs.writeFileSync(settingsFilePath, JSON.stringify(merged, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Settings saved to dev database file' }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to write settings file' }));
            }
          });
          return;
        }

        // Handle GET /api/v1/auctions (dev persistence)
        const auctionsFilePath = path.resolve(__dirname, 'dev_auctions.json');
        if (req.method === 'GET' && url.includes('/auctions') && !url.includes('/admin/')) {
          if (fs.existsSync(auctionsFilePath)) {
            try {
              const data = fs.readFileSync(auctionsFilePath, 'utf-8');
              const parsed = JSON.parse(data);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, data: parsed }));
              return;
            } catch (e) {}
          }
        }

        // Handle POST /api/v1/admin/auctions (save edited auctions to dev database)
        if (req.method === 'POST' && url.includes('/admin/auctions')) {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              let parsedData = JSON.parse(body || '[]');
              let currentList = [];
              if (fs.existsSync(auctionsFilePath)) {
                try { currentList = JSON.parse(fs.readFileSync(auctionsFilePath, 'utf-8')); } catch (e) {}
              }

              let updatedList = [];
              if (Array.isArray(parsedData)) {
                updatedList = parsedData;
              } else if (parsedData && parsedData.id) {
                const idx = currentList.findIndex((a) => a.id === parsedData.id);
                if (idx >= 0) {
                  currentList[idx] = { ...currentList[idx], ...parsedData };
                  updatedList = currentList;
                } else {
                  updatedList = [parsedData, ...currentList];
                }
              }

              fs.writeFileSync(auctionsFilePath, JSON.stringify(updatedList, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Auctions updated live across whole platform', data: updatedList }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to write auctions file' }));
            }
          });
          return;
        }

        // Handle GET /api/v1/system/status
        if (req.method === 'GET' && url.includes('/system/status')) {
          let mode = 'online';
          let mMsg = 'SalvageReef is currently undergoing scheduled maintenance.';
          let tcMsg = 'SalvageReef operations are temporarily closed for standard maintenance.';

          if (fs.existsSync(settingsFilePath)) {
            try {
              const saved = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
              if (saved._system_mode) mode = saved._system_mode;
              if (saved._maintenance_message) mMsg = saved._maintenance_message;
              if (saved._temporary_closed_message) tcMsg = saved._temporary_closed_message;
            } catch (e) {}
          }

          let message = '';
          if (mode === 'maintenance') message = mMsg;
          if (mode === 'temporary_closed') message = tcMsg;

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            status: mode,
            system_mode: mode,
            maintenance_mode: mode !== 'online',
            message,
            maintenance_message: mMsg,
            temporary_closed_message: tcMsg,
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // Handle POST /api/v1/admin/maintenance/toggle
        if (req.method === 'POST' && url.includes('/admin/maintenance/toggle')) {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body || '{}');
              let existing = {};
              if (fs.existsSync(settingsFilePath)) {
                try { existing = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8')); } catch (e) {}
              }
              const updated = {
                ...existing,
                _system_mode: parsed.system_mode || 'online',
                _maintenance_message: parsed.maintenance_message,
                _temporary_closed_message: parsed.temporary_closed_message,
              };
              fs.writeFileSync(settingsFilePath, JSON.stringify(updated, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                system_mode: updated._system_mode,
                message: `System mode set to ${updated._system_mode.toUpperCase()}`
              }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to update system mode' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), devApiPlugin()],
  base: './', // Relative base for sub-directory hosting (e.g. /scrab/)
  build: {
    chunkSizeWarningLimit: 2000,
  },
});
