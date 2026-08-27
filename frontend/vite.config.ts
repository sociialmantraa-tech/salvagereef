import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

function devApiPlugin(): Plugin {
  const settingsFilePath = path.resolve(__dirname, 'dev_system_settings.json');

  return {
    name: 'dev-api-plugin',
    configureServer(server) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.originalUrl || req.url || '';
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

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
          req.on('data', (chunk: any) => { body += chunk; });
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

        // Handle Users Database Persistence (dev_users.json)
        const usersFilePath = path.resolve(__dirname, 'dev_users.json');

        // Helper to read users from file
        const readDevUsers = (): any[] => {
          if (fs.existsSync(usersFilePath)) {
            try {
              return JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
            } catch (e) {}
          }
          return [];
        };

        // Helper to write users to file
        const writeDevUsers = (users: any[]) => {
          fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
        };

        // GET /api/v1/admin/users (exact list)
        if (req.method === 'GET' && (url.endsWith('/admin/users') || url.endsWith('/admin/users/'))) {
          res.setHeader('Content-Type', 'application/json');
          const users = readDevUsers();
          res.end(JSON.stringify({
            success: true,
            data: users,
            total: users.length,
            active: users.filter((u: any) => u.is_active !== false).length,
            suspended: users.filter((u: any) => u.is_active === false).length,
            verified: users.filter((u: any) => u.is_verified).length,
          }));
          return;
        }

        // POST /api/v1/admin/users (create user or save list)
        if (req.method === 'POST' && (url.endsWith('/admin/users') || url.endsWith('/admin/users/'))) {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body || '{}');
              let users = readDevUsers();
              if (Array.isArray(parsed)) {
                users = parsed;
              } else if (parsed && parsed.name) {
                const newUser = {
                  id: parsed.id || Date.now(),
                  name: parsed.name,
                  email: parsed.email,
                  phone: parsed.phone || '9820123456',
                  role: parsed.role || 'bidder',
                  company_name: parsed.company_name || 'Individual Buyer',
                  city: parsed.city || 'Mumbai',
                  state: parsed.state || 'Maharashtra',
                  password: parsed.password || 'seller123',
                  is_verified: parsed.is_verified !== false,
                  is_active: parsed.is_active !== false,
                  created_at: parsed.created_at || new Date().toISOString().split('T')[0],
                };
                users = [newUser, ...users.filter((u: any) => u.id !== newUser.id)];
              }
              writeDevUsers(users);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'User created & saved across all browsers', data: users }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to save user' }));
            }
          });
          return;
        }

        // PUT/POST /api/v1/admin/users/:id
        if ((req.method === 'PUT' || req.method === 'POST') && url.includes('/admin/users/')) {
          const match = url.match(/\/admin\/users\/(\d+)/);
          const userId = match ? Number(match[1]) : null;
          const isVerify = url.endsWith('/verify');
          const isToggleActive = url.endsWith('/toggle-active');
          const isRole = url.endsWith('/role');

          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body || '{}');
              let users = readDevUsers();
              const idx = users.findIndex((u: any) => u.id === userId);
              if (idx !== -1) {
                if (isVerify) {
                  users[idx].is_verified = !users[idx].is_verified;
                } else if (isToggleActive) {
                  users[idx].is_active = !users[idx].is_active;
                } else if (isRole) {
                  users[idx].role = parsed.role || users[idx].role;
                } else {
                  users[idx] = { ...users[idx], ...parsed };
                }
                writeDevUsers(users);
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'User updated across all browsers', user: idx !== -1 ? users[idx] : null, data: users }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to update user' }));
            }
          });
          return;
        }

        // DELETE /api/v1/admin/users/:id
        if (req.method === 'DELETE' && url.includes('/admin/users/')) {
          const match = url.match(/\/admin\/users\/(\d+)/);
          const userId = match ? Number(match[1]) : null;
          let users = readDevUsers();
          users = users.filter((u: any) => u.id !== userId);
          writeDevUsers(users);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, message: 'User deleted across all browsers', data: users }));
          return;
        }

        // Handle GET /api/v1/auctions (dev persistence)
        const auctionsFilePath = path.resolve(__dirname, 'dev_auctions.json');
        if (req.method === 'GET' && url.includes('/auctions') && !url.includes('/admin/')) {
          if (fs.existsSync(auctionsFilePath)) {
            try {
              const data = fs.readFileSync(auctionsFilePath, 'utf-8');
              const parsed = JSON.parse(data);
              if (Array.isArray(parsed) && parsed.length > 0) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, data: parsed }));
                return;
              }
            } catch (e) {}
          }
        }

        // Handle POST /api/v1/admin/auctions (save edited auctions to dev database)
        if (req.method === 'POST' && url.includes('/admin/auctions')) {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              let parsedData = JSON.parse(body || '[]');
              let currentList: any[] = [];
              if (fs.existsSync(auctionsFilePath)) {
                try { currentList = JSON.parse(fs.readFileSync(auctionsFilePath, 'utf-8')); } catch (e) {}
              }

              let updatedList: any[] = [];
              if (Array.isArray(parsedData)) {
                updatedList = parsedData;
              } else if (parsedData && parsedData.id) {
                const idx = currentList.findIndex((a: any) => a.id === parsedData.id);
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

        // Handle GET /api/v1/system/db-status
        if (req.method === 'GET' && url.includes('/system/db-status')) {
          res.setHeader('Content-Type', 'application/json');
          const users = readDevUsers();
          res.end(JSON.stringify({
            success: true,
            connected: true,
            driver: 'sqlite',
            engine: 'SQLite 3 (Self-Contained Database)',
            database_name: 'database.sqlite',
            database_host: 'Local Server (public_html/backend/database)',
            table_count: 11,
            total_users: users.length,
            total_auctions: 5,
            status_text: 'CONNECTED & OPERATIONAL',
            timestamp: new Date().toISOString(),
          }));
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
          req.on('data', (chunk: any) => { body += chunk; });
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), devApiPlugin()],
  base: './', // Relative base for sub-directory hosting (e.g. /scrab/)
  build: {
    chunkSizeWarningLimit: 2000,
  },
});
