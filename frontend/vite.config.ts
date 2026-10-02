import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

function devApiPlugin(): Plugin {
  const settingsFilePath = path.resolve(__dirname, 'dev_system_settings.json');
  const usersFilePath = path.resolve(__dirname, 'dev_users.json');
  const auctionsFilePath = path.resolve(__dirname, 'dev_auctions.json');
  const bidsFilePath = path.resolve(__dirname, 'dev_bids.json');
  const classifiedsFilePath = path.resolve(__dirname, 'dev_classifieds.json');
  const scrapRequestsFilePath = path.resolve(__dirname, 'dev_sell_scrap_requests.json');
  const errorsFilePath = path.resolve(__dirname, 'dev_errors.json');
  const emailLogsFilePath = path.resolve(__dirname, 'dev_email_logs.json');

  // JSON Read/Write Helpers
  const readJson = (file: string, fallback: any = []): any => {
    if (fs.existsSync(file)) {
      try {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
      } catch (e) {}
    }
    return fallback;
  };

  const writeJson = (file: string, data: any) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  };

  const uploadsRootDir = path.resolve(__dirname, '../uploads');
  const uploadsPublicDir = path.resolve(__dirname, 'public/uploads');

  const saveUploadedBase64 = (base64Str: string, type = 'general', customName?: string): string => {
    try {
      if (!base64Str || typeof base64Str !== 'string') return '';
      if (!base64Str.startsWith('data:') && !base64Str.startsWith('/uploads/')) {
        return base64Str;
      }
      if (base64Str.startsWith('/uploads/')) return base64Str;

      const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let ext = 'jpg';
      let buffer: Buffer;

      if (matches && matches.length === 3) {
        const mime = matches[1].toLowerCase();
        if (mime.includes('png')) ext = 'png';
        else if (mime.includes('svg')) ext = 'svg';
        else if (mime.includes('webp')) ext = 'webp';
        else if (mime.includes('pdf')) ext = 'pdf';
        else ext = 'jpg';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(base64Str.replace(/^data:[^;]+;base64,/, ''), 'base64');
      }

      const filename = customName || `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const targetDirs = [
        path.join(uploadsRootDir, type),
        path.join(uploadsPublicDir, type)
      ];

      targetDirs.forEach((dir) => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, filename), buffer);
      });

      return `/uploads/${type}/${filename}`;
    } catch (err) {
      console.error('Error saving uploaded file in dev server:', err);
      return '';
    }
  };

  return {
    name: 'dev-api-plugin',
    configureServer(server) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.originalUrl || req.url || '';
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // 0. STATIC UPLOADS SERVING: GET /uploads/*
        if (req.method === 'GET' && url.startsWith('/uploads/')) {
          const cleanPath = url.split('?')[0].replace(/^\/uploads\//, '');
          const candidatePaths = [
            path.join(uploadsPublicDir, cleanPath),
            path.join(uploadsRootDir, cleanPath),
          ];

          for (const targetPath of candidatePaths) {
            if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
              const ext = path.extname(targetPath).toLowerCase();
              const mimeMap: Record<string, string> = {
                '.svg': 'image/svg+xml; charset=utf-8',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.webp': 'image/webp',
                '.gif': 'image/gif',
                '.pdf': 'application/pdf',
              };
              res.statusCode = 200;
              res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
              res.setHeader('Cache-Control', 'public, max-age=86400');
              res.setHeader('Access-Control-Allow-Origin', '*');
              return res.end(fs.readFileSync(targetPath));
            }
          }
        }

        const sendJson = (data: any, status = 200) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        const getBody = (): Promise<any> => {
          return new Promise((resolve) => {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              try {
                resolve(JSON.parse(body || '{}'));
              } catch {
                resolve({});
              }
            });
          });
        };

        // 0b. UNIVERSAL FILE UPLOAD: POST /api/v1/admin/upload OR POST /api/v1/upload
        if (req.method === 'POST' && (url.includes('/admin/upload') || url.endsWith('/upload') || url.includes('/upload?'))) {
          getBody().then((body) => {
            const uploadType = body.type || 'general';
            const fileData = body.file || body.dataUrl || body.data || '';
            const filename = body.filename || body.name;

            let fileUrl = '';
            if (fileData) {
              fileUrl = saveUploadedBase64(fileData, uploadType, filename);
            }
            if (!fileUrl) {
              fileUrl = `/uploads/${uploadType}/doc_${Date.now()}.jpg`;
            }

            return sendJson({
              success: true,
              message: 'File uploaded successfully and saved to storage directory.',
              url: fileUrl,
              filename: path.basename(fileUrl),
              type: uploadType,
            }, 201);
          });
          return;
        }

        // 1. AUTH: POST /api/v1/auth/register
        if (req.method === 'POST' && url.includes('/auth/register')) {
          getBody().then((body) => {
            const users = readJson(usersFilePath, []);
            const email = (body.email || '').trim().toLowerCase();
            if (!email || !body.password) {
              return sendJson({ success: false, message: 'Email and password are required' }, 422);
            }

            const existing = users.find((u: any) => (u.email || '').toLowerCase() === email);
            if (existing) {
              return sendJson({ success: false, message: 'This email address is already registered. Please sign in.' }, 422);
            }

            const savedPanUrl = body.pan_file ? (saveUploadedBase64(body.pan_file, 'kyc', `pan_card_${Date.now()}.jpg`) || body.pan_file) : '';
            const savedGstUrl = body.gst_file ? (saveUploadedBase64(body.gst_file, 'kyc', `gst_cert_${Date.now()}.jpg`) || body.gst_file) : '';
            const savedChequeUrl = body.cheque_file ? (saveUploadedBase64(body.cheque_file, 'kyc', `cheque_${Date.now()}.jpg`) || body.cheque_file) : '';

            const newUser = {
              id: Date.now(),
              name: body.name || body.spoc_name || 'Registered Bidder',
              email: email,
              login_id: 'SR-' + Math.floor(100000 + Math.random() * 900000),
              phone: body.phone || body.mobile_number || '9820123456',
              role: body.role || 'bidder',
              company_name: body.company_name || body.vendor_name || 'Enterprise Scrap Co',
              entity_type: body.entity_type || 'Proprietorship',
              pan_number: body.pan_number || '',
              gst_number: body.gst_number || '',
              registered_address: body.registered_address || '',
              city: body.city || 'Mumbai',
              state: body.state || 'Maharashtra',
              pincode: body.pincode || '',
              spoc_name: body.spoc_name || body.name || '',
              bank_name: body.bank_name || '',
              bank_account_number: body.bank_account_number || '',
              bank_ifsc_code: body.bank_ifsc_code || '',
              pan_file: savedPanUrl,
              gst_file: savedGstUrl,
              cheque_file: savedChequeUrl,
              password: body.password,
              is_verified: true,
              is_active: true,
              created_at: new Date().toISOString().split('T')[0],
            };

            users.unshift(newUser);
            writeJson(usersFilePath, users);

            return sendJson({
              success: true,
              message: 'Vendor registration completed successfully.',
              user: newUser,
              token: 'token_' + newUser.id,
            }, 201);
          });
          return;
        }

        // 2. AUTH: POST /api/v1/auth/login
        if (req.method === 'POST' && url.includes('/auth/login')) {
          getBody().then((body) => {
            const users = readJson(usersFilePath, []);
            const input = (body.email || '').trim().toLowerCase();
            const pass = (body.password || '').trim();

            // Admin emergency/master override
            if (
              (input === 'admin@salvagereef.com' || input === 'sr-admin' || input === 'admin') &&
              ['sociial123', 'admin123', 'sociialmantraa', 'admin@123'].includes(pass)
            ) {
              const master = users.find((u: any) => u.id === 3 || u.role === 'master_admin') || {
                id: 3,
                name: 'Master Admin',
                email: 'admin@salvagereef.com',
                login_id: 'SR-ADMIN',
                role: 'master_admin',
                company_name: 'SalvageReef Master Operations',
                city: 'Mumbai',
                state: 'Maharashtra',
                is_verified: true,
                is_active: true,
              };
              return sendJson({ success: true, message: 'Master Admin login successful', user: master, token: 'sr_master_admin_token' });
            }

            const matched = users.find(
              (u: any) =>
                ((u.email || '').toLowerCase() === input || (u.login_id || '').toLowerCase() === input) &&
                String(u.password).trim() === pass
            );

            if (matched) {
              if (matched.is_active === false) {
                return sendJson({ success: false, message: 'Account is currently suspended by Administrator.' }, 403);
              }
              const safeUser = { ...matched };
              return sendJson({ success: true, message: 'Login successful', user: safeUser, token: 'token_' + safeUser.id });
            }

            return sendJson({ success: false, message: 'Invalid email, Login ID, or password.' }, 422);
          });
          return;
        }

        // 3. AUTH: GET /api/v1/auth/me
        if (req.method === 'GET' && url.includes('/auth/me')) {
          const authHeader = req.headers['authorization'] || '';
          const users = readJson(usersFilePath, []);
          let user = users[0];
          if (authHeader.includes('token_')) {
            const id = Number(authHeader.replace(/.*token_/, ''));
            const found = users.find((u: any) => u.id === id);
            if (found) user = found;
          }
          return sendJson({ success: true, user });
        }

        // 4. ADMIN USERS: GET /api/v1/admin/users
        if (req.method === 'GET' && (url.endsWith('/admin/users') || url.endsWith('/admin/users/'))) {
          const users = readJson(usersFilePath, []);
          return sendJson({
            success: true,
            data: users,
            total: users.length,
            active: users.filter((u: any) => u.is_active !== false).length,
            suspended: users.filter((u: any) => u.is_active === false).length,
            verified: users.filter((u: any) => u.is_verified).length,
          });
        }

        // 5. ADMIN USERS: POST /api/v1/admin/users
        if (req.method === 'POST' && (url.endsWith('/admin/users') || url.endsWith('/admin/users/'))) {
          getBody().then((body) => {
            let users = readJson(usersFilePath, []);
            if (Array.isArray(body)) {
              users = body;
            } else if (body && body.name) {
              const newUser = {
                id: body.id || Date.now(),
                name: body.name,
                email: body.email,
                phone: body.phone || '9820123456',
                role: body.role || 'bidder',
                company_name: body.company_name || 'Individual Buyer',
                city: body.city || 'Mumbai',
                state: body.state || 'Maharashtra',
                pan_file: body.pan_file ? (saveUploadedBase64(body.pan_file, 'kyc', `pan_card_${Date.now()}.jpg`) || body.pan_file) : '',
                gst_file: body.gst_file ? (saveUploadedBase64(body.gst_file, 'kyc', `gst_cert_${Date.now()}.jpg`) || body.gst_file) : '',
                cheque_file: body.cheque_file ? (saveUploadedBase64(body.cheque_file, 'kyc', `cheque_${Date.now()}.jpg`) || body.cheque_file) : '',
                password: body.password || 'seller123',
                is_verified: body.is_verified !== false,
                is_active: body.is_active !== false,
                created_at: body.created_at || new Date().toISOString().split('T')[0],
              };
              users = [newUser, ...users.filter((u: any) => u.id !== newUser.id)];
            }
            writeJson(usersFilePath, users);
            return sendJson({ success: true, message: 'User updated across all browsers', data: users });
          });
          return;
        }

        // 6. ADMIN USERS: PUT/POST /api/v1/admin/users/:id
        if ((req.method === 'PUT' || req.method === 'POST') && url.includes('/admin/users/')) {
          const match = url.match(/\/admin\/users\/(\d+)/);
          const userId = match ? Number(match[1]) : null;
          const isVerify = url.endsWith('/verify');
          const isToggleActive = url.endsWith('/toggle-active');
          const isRole = url.endsWith('/role');

          getBody().then((parsed) => {
            let users = readJson(usersFilePath, []);
            const idx = users.findIndex((u: any) => u.id === userId);
            if (idx !== -1) {
              if (isVerify) {
                users[idx].is_verified = !users[idx].is_verified;
              } else if (isToggleActive) {
                users[idx].is_active = !users[idx].is_active;
              } else if (isRole) {
                users[idx].role = parsed.role || users[idx].role;
              } else {
                if (parsed.pan_file && parsed.pan_file.startsWith('data:')) {
                  parsed.pan_file = saveUploadedBase64(parsed.pan_file, 'kyc', `pan_card_${userId}_${Date.now()}.jpg`) || parsed.pan_file;
                }
                if (parsed.gst_file && parsed.gst_file.startsWith('data:')) {
                  parsed.gst_file = saveUploadedBase64(parsed.gst_file, 'kyc', `gst_cert_${userId}_${Date.now()}.jpg`) || parsed.gst_file;
                }
                if (parsed.cheque_file && parsed.cheque_file.startsWith('data:')) {
                  parsed.cheque_file = saveUploadedBase64(parsed.cheque_file, 'kyc', `cheque_${userId}_${Date.now()}.jpg`) || parsed.cheque_file;
                }
                users[idx] = { ...users[idx], ...parsed };
              }
              writeJson(usersFilePath, users);
            }
            return sendJson({ success: true, message: 'User updated across all browsers', user: idx !== -1 ? users[idx] : null, data: users });
          });
          return;
        }

        // 7. ADMIN USERS: DELETE /api/v1/admin/users/:id
        if (req.method === 'DELETE' && url.includes('/admin/users/')) {
          const match = url.match(/\/admin\/users\/(\d+)/);
          const userId = match ? Number(match[1]) : null;
          let users = readJson(usersFilePath, []);
          users = users.filter((u: any) => u.id !== userId);
          writeJson(usersFilePath, users);
          return sendJson({ success: true, message: 'User deleted across all browsers', data: users });
        }

        // 8. BIDDING: POST /api/v1/auctions/:id/bid
        if (req.method === 'POST' && url.includes('/auctions/') && url.endsWith('/bid')) {
          const match = url.match(/\/auctions\/(\d+)\/bid/);
          const auctionId = match ? Number(match[1]) : null;

          getBody().then((body) => {
            const amount = Number(body.amount || 0);
            if (!auctionId || amount <= 0) {
              return sendJson({ success: false, message: 'Valid auction and bid amount required' }, 422);
            }

            const auctions = readJson(auctionsFilePath, []);
            const bids = readJson(bidsFilePath, []);
            const users = readJson(usersFilePath, []);

            const authHeader = req.headers['authorization'] || '';
            let currentUser = users[0];
            if (authHeader.includes('token_')) {
              const uId = Number(authHeader.replace(/.*token_/, ''));
              const fUser = users.find((u: any) => u.id === uId);
              if (fUser) currentUser = fUser;
            }

            const aucIdx = auctions.findIndex((a: any) => Number(a.id) === Number(auctionId));
            const auction = aucIdx !== -1 ? auctions[aucIdx] : null;

            // RULE: Check if user already has an APPROVED bid on THIS specific auction
            const hasApprovedBidOnThisAuction = bids.some(
              (b: any) =>
                Number(b.auction_id) === Number(auctionId) &&
                (Number(b.user_id) === Number(currentUser?.id) || (b.bidder_email && b.bidder_email === currentUser?.email)) &&
                b.status === 'approved'
            );

            const isFirstBid = !hasApprovedBidOnThisAuction;
            const bidStatus = isFirstBid ? 'pending' : 'approved';

            const newBid = {
              id: Date.now(),
              auction_id: auctionId,
              auction_title: auction?.title || `Auction Lot #${auctionId}`,
              amount: amount,
              user_id: currentUser?.id || 2,
              bidder_name: currentUser?.name || 'Registered Bidder',
              bidder_email: currentUser?.email || 'bidder@salvagereef.com',
              bidder_company: currentUser?.company_name || 'Metals & Scrap Trader',
              status: bidStatus,
              created_at: new Date().toISOString(),
            };

            bids.unshift(newBid);
            writeJson(bidsFilePath, bids);

            // If already approved, update auction's current_highest_bid & anti-sniping
            let timeExtended = false;
            let newEndTime = auction?.end_time;

            let autoClosed = false;
            let approvedBidsCount = 0;

            if (bidStatus === 'approved' && aucIdx !== -1) {
              const approvedBids = bids.filter((b: any) => Number(b.auction_id) === Number(auctionId) && b.status === 'approved');
              approvedBidsCount = approvedBids.length;

              if (approvedBidsCount >= 5) {
                autoClosed = true;
                approvedBids.sort((a: any, b: any) => Number(b.amount) - Number(a.amount));
                const h1 = approvedBids[0];
                const h2 = approvedBids[1];
                const h3 = approvedBids[2];

                auctions[aucIdx].status = 'closed';
                auctions[aucIdx].winner_confirmed = true;
                auctions[aucIdx].winner_user_id = h1 ? h1.user_id : null;
                auctions[aucIdx].winner_h1_user_id = h1 ? h1.user_id : null;
                auctions[aucIdx].winner_h2_user_id = h2 ? h2.user_id : null;
                auctions[aucIdx].winner_h3_user_id = h3 ? h3.user_id : null;
                auctions[aucIdx].awarded_winner_type = 'H1';
                auctions[aucIdx].awarded_winner_id = h1 ? h1.user_id : null;
                auctions[aucIdx].current_highest_bid = amount;
                auctions[aucIdx].end_time = new Date().toISOString();
                newEndTime = auctions[aucIdx].end_time;
              } else {
                if (amount > (auctions[aucIdx].current_highest_bid || auctions[aucIdx].starting_price)) {
                  auctions[aucIdx].current_highest_bid = amount;
                }
                if (auctions[aucIdx].end_time) {
                  const endTs = new Date(auctions[aucIdx].end_time).getTime();
                  const nowTs = Date.now();
                  const remainingSecs = (endTs - nowTs) / 1000;
                  if (remainingSecs > 0 && remainingSecs <= 120) {
                    timeExtended = true;
                    newEndTime = new Date(Math.max(endTs + 120 * 1000, nowTs + 120 * 1000)).toISOString();
                    auctions[aucIdx].end_time = newEndTime;
                  }
                }
              }

              if (!auctions[aucIdx].bids) auctions[aucIdx].bids = [];
              auctions[aucIdx].bids.unshift({
                id: newBid.id,
                amount: amount,
                user: { name: newBid.bidder_name },
                created_at: newBid.created_at,
              });

              writeJson(auctionsFilePath, auctions);
            } else if (aucIdx !== -1 && auctions[aucIdx].end_time) {
              const endTs = new Date(auctions[aucIdx].end_time).getTime();
              const nowTs = Date.now();
              const remainingSecs = (endTs - nowTs) / 1000;
              if (remainingSecs > 0 && remainingSecs <= 120) {
                timeExtended = true;
                newEndTime = new Date(Math.max(endTs + 120 * 1000, nowTs + 120 * 1000)).toISOString();
                auctions[aucIdx].end_time = newEndTime;
                writeJson(auctionsFilePath, auctions);
              }
            }

            // Broadcast email notification to all registered users
            const emailLogs = readJson(emailLogsFilePath, []);
            const validUsers = users.filter((u: any) => u.email && u.email.includes('@'));
            const lotCode = auction?.lot_code || `LOT-${auctionId}`;
            const mailSubject = `🔥 New High Bid (₹${amount.toLocaleString('en-IN')}) Placed on ${auction?.title || 'Scrap Lot'} [${lotCode}]`;
            
            validUsers.forEach((u: any) => {
              emailLogs.unshift({
                id: `mail_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                to_email: u.email,
                to_name: u.name || 'Registered Bidder',
                auction_id: auctionId,
                lot_code: lotCode,
                bid_amount: amount,
                subject: mailSubject,
                sent_at: new Date().toISOString(),
                status: 'dispatched',
              });
            });
            writeJson(emailLogsFilePath, emailLogs.slice(0, 100));

            if (isFirstBid) {
              return sendJson({
                success: true,
                status: 'pending',
                requires_admin_approval: true,
                is_first_bid: true,
                time_extended: timeExtended,
                new_end_time: newEndTime,
                extension_seconds: 120,
                email_notifications_dispatched: validUsers.length,
                message: timeExtended
                  ? `Your initial bid of ₹${amount.toLocaleString('en-IN')} is submitted for Admin Acceptance. Dynamic anti-sniping: auction timer extended by +2 minutes! Email alerts sent to all registered buyers.`
                  : `Your initial bid of ₹${amount.toLocaleString('en-IN')} has been submitted for Admin Acceptance. Once accepted, you can increase your bid freely on this lot! Email alerts sent to registered buyers.`,
                bid: newBid,
              });
            } else {
              const msg = autoClosed
                ? `Bid of ₹${amount.toLocaleString('en-IN')} placed! 5 consecutive bidding rounds completed — this auction has now officially closed, and H1 Highest Bidder is selected.`
                : (timeExtended
                    ? `Bid of ₹${amount.toLocaleString('en-IN')} placed! Auction extended by +2 mins (Anti-Sniping Rule). Email alerts sent to all registered buyers.`
                    : `Bid of ₹${amount.toLocaleString('en-IN')} placed successfully! Email alerts sent to all registered buyers.`);

              return sendJson({
                success: true,
                status: 'approved',
                requires_admin_approval: false,
                is_first_bid: false,
                auction_closed: autoClosed,
                is_closed: autoClosed,
                new_status: autoClosed ? 'closed' : 'live',
                auction_status: autoClosed ? 'closed' : 'live',
                total_approved_bids: approvedBidsCount,
                message: msg,
                current_highest_bid: amount,
                time_extended: autoClosed ? false : timeExtended,
                extension_seconds: autoClosed ? 0 : 120,
                new_end_time: autoClosed ? new Date().toISOString() : newEndTime,
                email_notifications_dispatched: validUsers.length,
                bid: newBid,
              });
            }
          });
          return;
        }

        // 8b. AUCTION PDF DOSSIER DOWNLOAD: GET /api/v1/auctions/:id/pdf
        if (req.method === 'GET' && url.includes('/auctions/') && url.endsWith('/pdf')) {
          const match = url.match(/\/auctions\/([^\/]+)\/pdf/);
          const auctionIdOrSlug = match ? match[1] : null;
          const auctions = readJson(auctionsFilePath, []);
          const auction = auctions.find((a: any) => String(a.id) === String(auctionIdOrSlug) || a.slug === auctionIdOrSlug);

          if (!auction) {
            return sendJson({ success: false, message: 'Auction lot not found' }, 404);
          }

          return sendJson({
            success: true,
            auction: auction,
            dossier: {
              lot_code: auction.lot_code || `LOT-${auction.id}`,
              title: auction.title,
              starting_price: auction.starting_price,
              emd_amount: auction.emd_amount || 50000,
              bid_increment: auction.bid_increment || 1000,
              current_highest_bid: auction.current_highest_bid || auction.starting_price,
              quantity: `${auction.quantity} ${auction.unit || 'MT'}`,
              location: `${auction.location_city}, ${auction.location_state}`,
              condition: auction.condition || 'As is where is basis',
              description: auction.description,
              start_time: auction.start_time,
              end_time: auction.end_time,
              images: auction.images || [auction.primary_image],
              generated_at: new Date().toISOString(),
            }
          });
        }

        // 8c. EMAIL NOTIFICATIONS LOGS: GET /api/v1/admin/email-logs
        if (req.method === 'GET' && url.includes('/admin/email-logs')) {
          const emailLogs = readJson(emailLogsFilePath, []);
          return sendJson({
            success: true,
            logs: emailLogs,
            total: emailLogs.length,
          });
        }

        // 9. BIDS MANAGEMENT: GET /api/v1/admin/bids OR /api/v1/bids
        if (req.method === 'GET' && (url.includes('/admin/bids') || url.endsWith('/bids'))) {
          const bids = readJson(bidsFilePath, []);
          return sendJson({
            success: true,
            data: bids,
            bids: bids,
            total: bids.length,
            pending_count: bids.filter((b: any) => b.status === 'pending').length,
            approved_count: bids.filter((b: any) => b.status === 'approved').length,
          });
        }

        // 10. BIDS STATUS UPDATE: PUT /api/v1/admin/bids/:id/status OR /api/v1/bids/:id/status
        if (req.method === 'PUT' && (url.includes('/admin/bids/') || url.includes('/bids/')) && url.includes('/status')) {
          const match = url.match(/\/bids\/(\d+)\/status/);
          const bidId = match ? Number(match[1]) : null;

          getBody().then((body) => {
            const newStatus = body.status || 'approved';
            let bids = readJson(bidsFilePath, []);
            let auctions = readJson(auctionsFilePath, []);

            const bIdx = bids.findIndex((b: any) => Number(b.id) === Number(bidId));
            if (bIdx !== -1) {
              bids[bIdx].status = newStatus;
              const aucId = bids[bIdx].auction_id;
              const bidAmt = bids[bIdx].amount;

              // If approved, update highest bid on the auction
              if (newStatus === 'approved') {
                const aIdx = auctions.findIndex((a: any) => Number(a.id) === Number(aucId));
                if (aIdx !== -1) {
                  if (bidAmt > (auctions[aIdx].current_highest_bid || 0)) {
                    auctions[aIdx].current_highest_bid = bidAmt;
                  }
                  if (!auctions[aIdx].bids) auctions[aIdx].bids = [];
                  auctions[aIdx].bids = [
                    { id: bids[bIdx].id, amount: bidAmt, user: { name: bids[bIdx].bidder_name }, created_at: bids[bIdx].created_at },
                    ...auctions[aIdx].bids.filter((ob: any) => ob.id !== bids[bIdx].id),
                  ];

                  // Check if approved bids reach 5
                  const approvedBids = bids.filter((b: any) => Number(b.auction_id) === Number(aucId) && b.status === 'approved');
                  if (approvedBids.length >= 5) {
                    approvedBids.sort((a: any, b: any) => Number(b.amount) - Number(a.amount));
                    const h1 = approvedBids[0];
                    const h2 = approvedBids[1];
                    const h3 = approvedBids[2];

                    auctions[aIdx].status = 'closed';
                    auctions[aIdx].winner_confirmed = true;
                    auctions[aIdx].winner_user_id = h1 ? h1.user_id : null;
                    auctions[aIdx].winner_h1_user_id = h1 ? h1.user_id : null;
                    auctions[aIdx].winner_h2_user_id = h2 ? h2.user_id : null;
                    auctions[aIdx].winner_h3_user_id = h3 ? h3.user_id : null;
                    auctions[aIdx].awarded_winner_type = 'H1';
                    auctions[aIdx].awarded_winner_id = h1 ? h1.user_id : null;
                    auctions[aIdx].end_time = new Date().toISOString();
                  }

                  writeJson(auctionsFilePath, auctions);
                }
              }
              writeJson(bidsFilePath, bids);
            }

            return sendJson({
              success: true,
              message: `Bid #${bidId} status updated to '${newStatus}' across all browsers.`,
            });
          });
          return;
        }

        // 11. BIDS DELETE: DELETE /api/v1/admin/bids/:id
        if (req.method === 'DELETE' && (url.includes('/admin/bids/') || url.includes('/bids/'))) {
          const match = url.match(/\/bids\/(\d+)/);
          const bidId = match ? Number(match[1]) : null;
          let bids = readJson(bidsFilePath, []);
          bids = bids.filter((b: any) => Number(b.id) !== Number(bidId));
          writeJson(bidsFilePath, bids);
          return sendJson({ success: true, message: `Bid #${bidId} deleted successfully` });
        }

        // 12. AUCTIONS: GET /api/v1/auctions OR /api/v1/admin/auctions/all
        if (req.method === 'GET' && (url.includes('/auctions') || url.includes('/admin/auctions'))) {
          const auctions = readJson(auctionsFilePath, []);
          const singleMatch = url.match(/\/auctions\/([^/?]+)/);
          if (singleMatch && singleMatch[1] && singleMatch[1] !== 'all' && !url.includes('/top-bidders') && !url.includes('/confirm-winner')) {
            const param = singleMatch[1];
            const item = auctions.find((a: any) => String(a.id) === param || a.slug === param);
            if (item) {
              return sendJson({ success: true, auction: item, data: item });
            }
          }
          if (!url.includes('/top-bidders') && !url.includes('/confirm-winner')) {
            return sendJson({ success: true, data: auctions, total: auctions.length });
          }
        }

        // 13. AUCTIONS: POST/PUT /api/v1/admin/auctions OR /api/v1/auctions
        if ((req.method === 'POST' || req.method === 'PUT') && (url.includes('/admin/auctions') || url.includes('/auctions')) && !url.includes('/bid') && !url.includes('/confirm-winner')) {
          getBody().then((body) => {
            let auctions = readJson(auctionsFilePath, []);
            const targetId = url.match(/\/auctions\/(\d+)/)?.[1] || body.id;

            if (Array.isArray(body)) {
              auctions = body;
            } else if (targetId) {
              const idx = auctions.findIndex((a: any) => Number(a.id) === Number(targetId) || String(a.id) === String(targetId));
              if (idx >= 0) {
                auctions[idx] = { ...auctions[idx], ...body, id: auctions[idx].id };
              } else {
                auctions = [body, ...auctions];
              }
            } else if (body.title) {
              const newAuction = {
                id: Date.now(),
                lot_code: 'LOT-' + Math.floor(100 + Math.random() * 900),
                title: body.title,
                slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: body.description || '',
                category_id: body.category_id || 1,
                starting_price: Number(body.starting_price || 0),
                current_highest_bid: Number(body.starting_price || 0),
                bid_increment: Number(body.bid_increment || 1000),
                status: body.status || 'live',
                quantity: Number(body.quantity || 1),
                unit: body.unit || 'MT',
                location_city: body.location_city || 'Mumbai',
                location_state: body.location_state || 'Maharashtra',
                start_time: body.start_time || new Date().toISOString(),
                end_time: body.end_time || new Date(Date.now() + 7 * 86400000).toISOString(),
                images: body.images || [{ id: 1, image_path: body.image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800' }],
                primary_image: { id: 1, image_path: body.image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800' },
              };
              auctions.unshift(newAuction);
            }
            writeJson(auctionsFilePath, auctions);
            return sendJson({ success: true, message: 'Auctions updated live across whole platform', data: auctions });
          });
          return;
        }

        // 14. TOP BIDDERS (H1, H2, H3): GET /api/v1/admin/auctions/:id/top-bidders
        if (req.method === 'GET' && url.includes('/top-bidders')) {
          const match = url.match(/\/auctions\/(\d+)\/top-bidders/);
          const aucId = match ? Number(match[1]) : 999;
          const auctions = readJson(auctionsFilePath, []);
          const bids = readJson(bidsFilePath, []);
          const targetAuc = auctions.find((a: any) => Number(a.id) === Number(aucId));

          const aucBids = bids
            .filter((b: any) => Number(b.auction_id) === Number(aucId) && b.status === 'approved')
            .sort((a: any, b: any) => Number(b.amount) - Number(a.amount));

          const baseAmt = targetAuc?.current_highest_bid || targetAuc?.starting_price || 500000;
          const h1 = aucBids[0] || { bid_id: 1, bid_amount: baseAmt, bidder_name: 'Neelkanth Sharma (H1 Winner)', user_id: 2, rank: 'H1' };
          const h2 = aucBids[1] || { bid_id: 2, bid_amount: Math.round(baseAmt * 0.94), bidder_name: 'Bharat Scrap Traders (H2 Winner)', user_id: 1, rank: 'H2' };
          const h3 = aucBids[2] || { bid_id: 3, bid_amount: Math.round(baseAmt * 0.88), bidder_name: 'Western Heavy Recyclers (H3 Winner)', user_id: 4, rank: 'H3' };

          return sendJson({
            success: true,
            auction: targetAuc,
            h1: { ...h1, rank: 'H1' },
            h2: { ...h2, rank: 'H2' },
            h3: { ...h3, rank: 'H3' },
            top_bidders: [{ ...h1, rank: 'H1' }, { ...h2, rank: 'H2' }, { ...h3, rank: 'H3' }],
          });
        }

        // 15. CONFIRM WINNER: POST /api/v1/auctions/:id/confirm-winner
        if (req.method === 'POST' && url.includes('/confirm-winner')) {
          const match = url.match(/\/auctions\/(\d+)\/confirm-winner/);
          const aucId = match ? Number(match[1]) : null;

          getBody().then((body) => {
            let auctions = readJson(auctionsFilePath, []);
            const aIdx = auctions.findIndex((a: any) => Number(a.id) === Number(aucId));
            if (aIdx !== -1) {
              auctions[aIdx].winner_confirmed = true;
              auctions[aIdx].status = 'closed';
              auctions[aIdx].awarded_winner_type = body.winner_type || 'H1';
              auctions[aIdx].winner_user_id = body.winner_user_id || 2;
              writeJson(auctionsFilePath, auctions);
            }
            return sendJson({
              success: true,
              message: `Winner (${body.winner_type || 'H1'}) confirmed successfully! Email notification dispatched.`,
            });
          });
          return;
        }

        // 16. SELL SCRAP REQUESTS: GET / POST / PUT / DELETE
        if (url.includes('/sell-scrap-requests')) {
          if (req.method === 'GET') {
            const reqs = readJson(scrapRequestsFilePath, []);
            return sendJson({ success: true, data: reqs, total: reqs.length });
          }
          if (req.method === 'POST') {
            getBody().then((body) => {
              const reqs = readJson(scrapRequestsFilePath, []);
              const newReq = {
                id: Date.now(),
                title: body.title || 'Scrap Pickup Request',
                category_id: body.category_id || 1,
                category_name: body.category_name || 'General Scrap',
                price: Number(body.price || 0),
                quantity: Number(body.quantity || 1),
                unit: body.unit || 'MT',
                location_state: body.location_state || 'Maharashtra',
                location_city: body.location_city || 'Mumbai',
                site_address: body.site_address || '',
                gst_number: body.gst_number || '',
                seller_name: body.seller_name || 'Guest Seller',
                seller_phone: body.seller_phone || '9820123456',
                seller_email: body.seller_email || 'seller@example.com',
                description: body.description || '',
                image_url: body.image_url || '',
                status: 'pending',
                created_at: new Date().toISOString(),
              };
              reqs.unshift(newReq);
              writeJson(scrapRequestsFilePath, reqs);
              return sendJson({ success: true, id: newReq.id, message: 'Scrap request submitted successfully to Admin Desk', data: newReq });
            });
            return;
          }
          if (req.method === 'PUT' && url.includes('/status')) {
            const match = url.match(/\/sell-scrap-requests\/(\d+)\/status/);
            const reqId = match ? Number(match[1]) : null;
            getBody().then((body) => {
              let reqs = readJson(scrapRequestsFilePath, []);
              const idx = reqs.findIndex((r: any) => Number(r.id) === Number(reqId));
              if (idx !== -1) {
                reqs[idx].status = body.status || 'approved';
                writeJson(scrapRequestsFilePath, reqs);
              }
              return sendJson({ success: true, message: 'Status updated successfully' });
            });
            return;
          }
          if (req.method === 'DELETE') {
            const match = url.match(/\/sell-scrap-requests\/(\d+)/);
            const reqId = match ? Number(match[1]) : null;
            let reqs = readJson(scrapRequestsFilePath, []);
            reqs = reqs.filter((r: any) => Number(r.id) !== Number(reqId));
            writeJson(scrapRequestsFilePath, reqs);
            return sendJson({ success: true, message: 'Scrap request deleted permanently' });
          }
        }

        // 17. CLASSIFIEDS: GET / POST / DELETE
        if (url.includes('/classifieds')) {
          if (req.method === 'GET') {
            const cl = readJson(classifiedsFilePath, []);
            return sendJson({ success: true, data: cl, total: cl.length });
          }
          if (req.method === 'POST') {
            getBody().then((body) => {
              let cl = readJson(classifiedsFilePath, []);
              if (Array.isArray(body)) {
                cl = body;
              } else if (body.title) {
                const newCl = {
                  id: Date.now(),
                  title: body.title,
                  slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  description: body.description || '',
                  category_id: body.category_id || 1,
                  price: Number(body.price || 0),
                  quantity: Number(body.quantity || 1),
                  unit: body.unit || 'nos',
                  location_city: body.location_city || 'Mumbai',
                  location_state: body.location_state || 'Maharashtra',
                  status: body.status || 'available',
                  primary_image: { id: 1, image_path: body.image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800' },
                };
                cl.unshift(newCl);
              }
              writeJson(classifiedsFilePath, cl);
              return sendJson({ success: true, message: 'Classified listing saved successfully', data: cl });
            });
            return;
          }
          if (req.method === 'DELETE') {
            const match = url.match(/\/classifieds\/(\d+)/);
            const clId = match ? Number(match[1]) : null;
            let cl = readJson(classifiedsFilePath, []);
            cl = cl.filter((c: any) => Number(c.id) !== Number(clId));
            writeJson(classifiedsFilePath, cl);
            return sendJson({ success: true, message: 'Classified deleted successfully' });
          }
        }

        // 18. ADMIN DASHBOARD STATS: GET /api/v1/admin/dashboard/stats
        if (req.method === 'GET' && url.includes('/admin/dashboard/stats')) {
          const users = readJson(usersFilePath, []);
          const auctions = readJson(auctionsFilePath, []);
          const bids = readJson(bidsFilePath, []);
          const classifieds = readJson(classifiedsFilePath, []);
          const scrapReqs = readJson(scrapRequestsFilePath, []);

          return sendJson({
            success: true,
            stats: {
              total_auctions: auctions.length,
              total_auctions_live: auctions.filter((a: any) => a.status === 'live').length,
              total_classifieds: classifieds.length,
              total_registered_users: users.length,
              total_bids: bids.length,
              total_bids_today: bids.length,
              new_users_this_week: users.length,
              pending_approvals: bids.filter((b: any) => b.status === 'pending').length + scrapReqs.filter((s: any) => s.status === 'pending').length,
              active_users: users.filter((u: any) => u.is_active !== false).length,
              suspended_users: users.filter((u: any) => u.is_active === false).length,
              kyc_verified_users: users.filter((u: any) => u.is_verified).length,
            },
          });
        }

        // 19. SYSTEM SETTINGS
        if (req.method === 'GET' && url.includes('/system/settings')) {
          const parsed = readJson(settingsFilePath, null);
          return sendJson({ success: true, settings: parsed });
        }
        if (req.method === 'POST' && url.includes('/admin/settings')) {
          getBody().then((parsedNew) => {
            const existing = readJson(settingsFilePath, {});
            const merged = { ...existing, ...parsedNew };
            writeJson(settingsFilePath, merged);
            return sendJson({ success: true, message: 'Settings saved to dev database file' });
          });
          return;
        }

        // 20. SYSTEM STATUS & MAINTENANCE
        if (req.method === 'GET' && url.includes('/system/status')) {
          let mode = 'online';
          let mMsg = 'SalvageReef is currently undergoing scheduled maintenance.';
          let tcMsg = 'SalvageReef operations are temporarily closed for standard maintenance.';
          const saved = readJson(settingsFilePath, {});
          if (saved._system_mode) mode = saved._system_mode;
          if (saved._maintenance_message) mMsg = saved._maintenance_message;
          if (saved._temporary_closed_message) tcMsg = saved._temporary_closed_message;

          let message = '';
          if (mode === 'maintenance') message = mMsg;
          if (mode === 'temporary_closed') message = tcMsg;

          return sendJson({
            success: true,
            status: mode,
            system_mode: mode,
            maintenance_mode: mode !== 'online',
            message,
            maintenance_message: mMsg,
            temporary_closed_message: tcMsg,
            timestamp: new Date().toISOString(),
          });
        }

        if (req.method === 'POST' && url.includes('/admin/maintenance/toggle')) {
          getBody().then((parsed) => {
            const existing = readJson(settingsFilePath, {});
            const updated = {
              ...existing,
              _system_mode: parsed.system_mode || 'online',
              _maintenance_message: parsed.maintenance_message,
              _temporary_closed_message: parsed.temporary_closed_message,
            };
            writeJson(settingsFilePath, updated);
            return sendJson({
              success: true,
              system_mode: updated._system_mode,
              message: `System mode set to ${updated._system_mode.toUpperCase()}`,
            });
          });
          return;
        }

        // 21. ERROR DIAGNOSTICS
        if (req.method === 'GET' && url.includes('/admin/errors/stats')) {
          const errs = readJson(errorsFilePath, []);
          const todayStr = new Date().toISOString().split('T')[0];
          return sendJson({
            success: true,
            stats: {
              total_errors: errs.length,
              unresolved_errors: errs.filter((e: any) => e.status === 'unresolved').length,
              resolved_errors: errs.filter((e: any) => e.status === 'resolved').length,
              today_errors: errs.filter((e: any) => (e.created_at || '').startsWith(todayStr)).length,
              critical_errors: errs.filter((e: any) => e.severity === 'critical' || e.severity === 'fatal').length,
              system_mode: 'online',
              is_maintenance: false,
            },
          });
        }
        if (req.method === 'GET' && (url.endsWith('/admin/errors') || url.includes('/admin/errors?'))) {
          const errs = readJson(errorsFilePath, []);
          return sendJson({ success: true, data: { data: errs, total: errs.length } });
        }
        if (req.method === 'POST' && (url.includes('/errors/report') || url.includes('/admin/errors/report'))) {
          getBody().then((parsed) => {
            const newErr = {
              id: parsed.id || Date.now(),
              severity: parsed.severity || 'error',
              message: parsed.message || 'Client Exception',
              exception_class: parsed.exception_class || 'RuntimeError',
              file: parsed.file || 'frontend',
              line: parsed.line || 1,
              url: parsed.url || '/admin',
              method: parsed.method || 'POST',
              status: parsed.status || 'unresolved',
              user: parsed.user || null,
              created_at: parsed.created_at || new Date().toISOString(),
              stack_trace: parsed.stack_trace || '',
              source: parsed.source || 'frontend',
            };
            let currentErrors = readJson(errorsFilePath, []);
            currentErrors = [newErr, ...currentErrors.filter((e: any) => e.id !== newErr.id)];
            writeJson(errorsFilePath, currentErrors.slice(0, 300));
            return sendJson({ success: true, message: 'Error logged to dev_errors.json', error: newErr });
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
