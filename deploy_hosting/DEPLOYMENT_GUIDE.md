# SalvageReef — cPanel Hosting Deployment Guide

> **Version:** 3.0.0 | **Last Updated:** October 3, 2026  
> **Tested On:** GoDaddy cPanel, HostGator, Namecheap, LiteSpeed  
> **Domain:** salvagereef.com

---

## Quick Start (For Experienced Users)

```bash
# 1. Build everything & generate ZIP
node build_hosting_package.cjs

# 2. Upload salvagereef_FULL_UPLOAD.zip to cPanel → public_html/
# 3. Extract ZIP in cPanel
# 4. Rename backend/.env.production → backend/.env
# 5. Fill in domain + Brevo SMTP key in .env
# 6. Set permissions (database/ → 755, .env → 600)
# 7. Visit https://salvagereef.com ✓
```

---

## Complete Folder Structure

```
public_html/                              ← cPanel root
├── .htaccess                             ← HTTPS + SPA routing + API proxy + compression + security
├── index.html                            ← React SPA entry point (Vite build output)
├── favicon.ico                           ← Browser tab icon
├── favicon.png                           ← Apple touch icon
├── favicon.svg                           ← SVG favicon
├── logo.png                              ← Site logo
│
├── assets/                               ← Compiled JS/CSS bundles (content-hashed)
│   ├── index-CFk_1pBE.js                 ← Main app bundle
│   ├── index-CqVfHpbY.css               ← Compiled CSS
│   ├── AdminDashboard-CW5InR90.js        ← Admin dashboard chunk
│   ├── AuctionDetail-B27uEf2n.js         ← Auction detail page chunk
│   └── ... (70+ code-split chunks)
│
├── uploads/                              ← User-uploaded files (writable)
│   ├── .htaccess                         ← ⛔ Blocks PHP execution (critical security)
│   ├── index.html                        ← Prevents directory listing
│   ├── auction/                          ← Auction lot images
│   ├── classified/                       ← Classified listing images
│   ├── general/                          ← General uploads
│   ├── hero/                             ← Hero/banner images
│   ├── logo/                             ← Logo uploads
│   ├── footer-logo/                      ← Footer logo
│   ├── kyc/                              ← KYC documents (PAN, GST, cheque)
│   └── tender/                           ← Tender PDF documents
│
└── backend/                              ← PHP API backend
    ├── .htaccess                         ← API routing + CORS + PHP config + security
    ├── .env                              ← ⚠️ RENAME .env.production → .env (fill values!)
    ├── server.php                        ← Main API handler (all /api/v1/* routes)
    ├── security_config.php               ← HMAC security keys + rate limiting
    ├── index.php                         ← Laravel fallback entry point
    ├── seed_db.php                       ← Database seeder (delete after use!)
    ├── view_logs.php                     ← Admin log viewer
    ├── database/
    │   └── database.sqlite               ← SQLite DB (auto-created on first request)
    └── logs/                             ← Structured API logs (auto-created)
        ├── error.log
        ├── access.log
        ├── security.log
        └── fatal.log
```

---

## Step-by-Step Upload Instructions

### STEP 1 — Build the Hosting Package

Run the automated build script from the project root:

```powershell
node build_hosting_package.cjs
```

This will:
- ✅ Build the React frontend (production Vite build)
- ✅ Copy compiled assets to `deploy_hosting/public_html/assets/`
- ✅ Copy backend PHP files to `deploy_hosting/public_html/backend/`
- ✅ Create upload directory structure with security `.htaccess`
- ✅ Generate **`salvagereef_FULL_UPLOAD.zip`** (first-time deploy)
- ✅ Generate **`salvagereef_UPDATE_SAFE_NO_DATABASE.zip`** (code updates only)

---

### STEP 2 — Upload to cPanel

1. Log into your hosting **cPanel → File Manager**
2. Navigate to **`public_html/`** (root of your domain)
3. Delete or backup any existing `index.php` or `index.html`
4. Click **Upload** → Upload **`salvagereef_FULL_UPLOAD.zip`**
5. Right-click the uploaded ZIP → **Extract**
6. Verify all files are now in `public_html/` (not nested in a subfolder)

> **⚠️ IMPORTANT:** Make sure files are directly inside `public_html/`, NOT inside `public_html/public_html/`. If extracted into a subfolder, move everything up one level.

---

### STEP 3 — Configure Environment (.env)

1. In cPanel File Manager, navigate to `public_html/backend/`
2. Find **`.env.production`** → Right-click → **Rename** → `.env`
3. Click **Edit** on the `.env` file and fill in:

```env
# Your actual live domain
APP_URL=https://salvagereef.com

# Brevo SMTP credentials (get from https://app.brevo.com → Settings → SMTP & API)
MAIL_USERNAME=salvagereef@gmail.com
MAIL_PASSWORD=xsmtpsib-YOUR-ACTUAL-KEY-HERE

# Frontend domain for CORS
SANCTUM_STATEFUL_DOMAINS=salvagereef.com,www.salvagereef.com
FRONTEND_URL=https://salvagereef.com
```

---

### STEP 4 — Set File Permissions

In cPanel File Manager, right-click each path → **Change Permissions**:

| Path | Permission | Why |
|------|:---------:|-----|
| `backend/` | `755` | Directory must be traversable |
| `backend/server.php` | `644` | PHP file — read by web server |
| `backend/security_config.php` | `644` | PHP file |
| `backend/.env` | `600` | **🔒 PRIVATE — owner read/write only** |
| `backend/database/` | `755` | SQLite needs write access |
| `backend/database/database.sqlite` | `664` | Writable by web server |
| `backend/logs/` | `755` | Writable for server logs |
| `uploads/` | `755` | Writable for file uploads |
| `uploads/auction/` | `755` | Image uploads |
| `uploads/classified/` | `755` | Image uploads |
| `uploads/hero/` | `755` | Banner images |
| `uploads/kyc/` | `755` | KYC document uploads |
| `uploads/tender/` | `755` | Tender PDF uploads |
| `uploads/general/` | `755` | General uploads |
| `uploads/logo/` | `755` | Logo uploads |

---

### STEP 5 — Enable SSL Certificate

1. In cPanel → **SSL/TLS** → **Let's Encrypt / AutoSSL**
2. Install free SSL for both `salvagereef.com` and `www.salvagereef.com`
3. The `.htaccess` HTTPS redirect activates automatically after SSL is installed

---

### STEP 6 — Database Setup (Choose Option A or Option B)

SalvageReef supports **both SQLite and MySQL / MariaDB** seamlessly out-of-the-box:

#### 🟢 Option A: SQLite (Default — Zero Config, Recommended for cPanel)
> **Best for:** Fast deployment, GoDaddy/HostGator shared hosting, zero maintenance.

1. **Pre-configured:** The pre-seeded database file `backend/database/database.sqlite` is already packaged in your ZIP.
2. **Zero Database Setup:** You do NOT need to create a MySQL database, database user, or import tables in phpMyAdmin.
3. **Permissions:** Ensure `backend/database/` is `755` and `database.sqlite` is `664` (or `644`).
4. **Self-Healing:** If `database.sqlite` is ever absent, `server.php` automatically creates the file and builds all 19 tables with default Master Admin and seed data.
5. In your `backend/.env`, simply keep:
   ```env
   DB_CONNECTION=sqlite
   DB_DATABASE=database/database.sqlite
   ```

---

#### 🔵 Option B: MySQL / MariaDB (via cPanel phpMyAdmin)
> **Best for:** High concurrent traffic or if your company policy mandates MySQL.

1. **Create MySQL Database & User in cPanel:**
   - In cPanel, click **MySQL® Databases**
   - Create a new database: e.g. `cpaneluser_salvagereef`
   - Create a new user: e.g. `cpaneluser_srdbuser` with a strong password
   - Under **Add User to Database**, select both, click **Add**, and grant **ALL PRIVILEGES**.
2. **Import Schema via phpMyAdmin:**
   - In cPanel, open **phpMyAdmin**
   - Click on your newly created database in the left sidebar
   - Click the **Import** tab at the top
   - Click **Choose File** → select `backend/database/salvagereef_mysql.sql` (also available in `deploy_hosting/salvagereef_mysql.sql`)
   - Click **Import** at the bottom (all 19 tables, indexes, and seed records will be imported instantly).
3. **Update `backend/.env`:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=cpaneluser_salvagereef
   DB_USERNAME=cpaneluser_srdbuser
   DB_PASSWORD=YourStrongPasswordHere
   ```
4. *Fallback safety:* If MySQL ever goes down or credentials fail, the backend automatically falls back to SQLite safely without crashing!

---

### STEP 7 — Verify Deployment

| URL | Expected Result |
|-----|----------------|
| `https://salvagereef.com` | Homepage loads with hero banner |
| `https://salvagereef.com/auctions` | Auctions listing page |
| `https://salvagereef.com/classifieds` | Classifieds page |
| `https://salvagereef.com/login` | Login page |
| `https://salvagereef.com/register` | Registration page |
| `https://salvagereef.com/admin` | Admin dashboard (after login) |
| `https://salvagereef.com/backend/server.php/api/v1/system/status` | `{"status":"online"}` |
| `https://salvagereef.com/backend/server.php/api/v1/auctions` | JSON array of auctions |
| `http://salvagereef.com` | Auto-redirects to `https://` ✓ |

---

## API Endpoint Reference

All API endpoints are routed through `backend/server.php`:

```bash
# System health check
curl https://salvagereef.com/backend/server.php/api/v1/system/status

# List auctions
curl https://salvagereef.com/backend/server.php/api/v1/auctions

# List categories
curl https://salvagereef.com/backend/server.php/api/v1/categories

# Admin login test
curl -X POST https://salvagereef.com/backend/server.php/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@salvagereef.com","password":"sociial123"}'
```

The root `.htaccess` also maps `/api/v1/*` directly to `backend/server.php`, so these also work:

```bash
curl https://salvagereef.com/api/v1/system/status
curl https://salvagereef.com/api/v1/auctions
```

---

## Admin Login Credentials

| Role | Email | Password | Login URL |
|------|-------|----------|-----------|
| 🔴 Master Admin | admin@salvagereef.com | sociial123 | /login?mode=admin |
| 🟡 Executive Desk | executive@salvagereef.com | execadmin123 | /login?mode=admin |
| 🟢 Demo Seller | seller@salvagereef.com | SellerPass@2026 | /login |
| 🔵 Demo Bidder | bidder@salvagereef.com | BidderPass@2026 | /login |

> **⚠️ CHANGE ALL PASSWORDS AFTER GOING LIVE!** Use Admin Console → Users tab.

---

## Updating Code (Without Losing Data)

For code-only updates that preserve your existing database and uploads:

```bash
# 1. Rebuild
node build_hosting_package.cjs

# 2. Upload salvagereef_UPDATE_SAFE_NO_DATABASE.zip to cPanel
# 3. Extract (overwrites code files but NOT database.sqlite)
# 4. Verify site loads correctly
```

**What's preserved:**
- ✅ `backend/database/database.sqlite` (all your data)
- ✅ `uploads/` (all uploaded images/PDFs)
- ✅ `backend/.env` (your credentials)

**What's updated:**
- ✅ `index.html` + `assets/` (new frontend code)
- ✅ `backend/server.php` (new API code)
- ✅ `.htaccess` files (updated configs)

---

## .htaccess Files Summary

| File | Purpose |
|------|---------|
| `public_html/.htaccess` | HTTPS redirect, API routing to `backend/server.php`, SPA fallback, Gzip, browser caching, security headers |
| `public_html/backend/.htaccess` | API routing, CORS preflight (OPTIONS), sensitive file blocking, PHP config |
| `public_html/uploads/.htaccess` | **Blocks ALL PHP/script execution**, only allows safe media types |

---

## Maintenance Mode

- In Admin Console → **System Errors & Maintenance** tab
- Switch between:
  - `🟢 ONLINE` — Normal operations
  - `🟡 MAINTENANCE` — Shows maintenance message to public
  - `🔴 TEMPORARILY CLOSED` — Shows closed message
- Admin accounts bypass maintenance mode automatically

---

## Error Tracking

All PHP errors, exceptions, and API failures are automatically logged:

| Log File | Contents |
|----------|----------|
| `backend/logs/error.log` | Application errors, exceptions |
| `backend/logs/access.log` | Every API request with response time |
| `backend/logs/security.log` | Auth failures, rate limits, blocked IPs |
| `backend/logs/upload.log` | File upload activity |
| `backend/logs/fatal.log` | Fatal PHP errors |

View errors in: **Admin Console → System Errors & Maintenance** tab

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank white page | Ensure `.htaccess` is uploaded and `mod_rewrite` is enabled in cPanel |
| React routes show 404 | Root `.htaccess` SPA routing rule is missing — re-upload |
| API returns 404 | Check `backend/.htaccess` exists; verify `mod_rewrite` is on |
| API returns HTML instead of JSON | GoDaddy `mod_layout` is injecting scripts — `backend/.htaccess` disables it |
| Login fails | Check `backend/.env` exists (renamed from `.env.production`) with correct values |
| Images not loading | Check `assets/` folder was uploaded; verify `index.html` has correct asset paths |
| No HTTPS redirect | Enable SSL in cPanel first, then the `.htaccess` redirect activates |
| 500 error on backend | Check file permissions: `database/` → `755`, `.sqlite` → `664` |
| SQLite DB not found | Set `backend/database/` to `755`; DB auto-creates on first request |
| Upload errors (images) | Set `uploads/` and subdirs to `755`; check `post_max_size` in backend `.htaccess` |
| CORS errors in browser | Update CORS origin in `backend/.htaccess` or `security_config.php` |
| Emails not sending | Verify Brevo SMTP key in `backend/.env`; check Brevo dashboard for quota |
| DELETE method blocked | Backend supports both `DELETE` and `POST /delete` routes for cPanel compatibility |
| Rate limit errors | Adjust thresholds in `backend/security_config.php` |

---

## Hosting Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| PHP Version | 7.4 | 8.1+ |
| Apache | 2.4 | 2.4+ (or LiteSpeed) |
| mod_rewrite | ✅ Required | ✅ |
| SQLite3 extension | ✅ Required | ✅ |
| Memory Limit | 128MB | 256MB |
| Upload Max Size | 10MB | 20MB |
| SSL Certificate | ✅ Required | Let's Encrypt (free) |
