# ============================================================
# SalvageReef — cPanel Hosting Deployment Guide
# Version: 2026 | Tested on: GoDaddy / HostGator / Namecheap
# ============================================================

---

## Folder Structure to Upload

```
public_html/
├── .htaccess                  ← Root Apache config (HTTPS + SPA routing + caching)
├── index.html                 ← React app entry point
├── favicon.ico
├── favicon.png
├── favicon.svg
├── logo.png
├── assets/
│   ├── index-*.js             ← All compiled JS chunks (content-hash named)
│   └── index-*.css            ← Compiled CSS bundle
├── uploads/
│   ├── .htaccess              ← Upload folder security (blocks PHP execution)
│   ├── index.html             ← Blank HTML (prevents directory listing)
│   ├── auction/               ← Auction lot images
│   ├── classified/            ← Classified listing images
│   ├── general/               ← General uploads
│   ├── hero/                  ← Hero/banner images
│   ├── logo/                  ← Logo uploads
│   └── footer-logo/           ← Footer logo uploads
└── backend/
    ├── .htaccess              ← Backend Apache config (API routing + CORS + PHP config)
    ├── .env                   ← ⚠️  RENAME .env.production → .env  (fill in values!)
    ├── server.php             ← Main PHP API handler (handles all /api/v1/* routes)
    ├── security_config.php    ← HMAC security keys and rate limiting config
    ├── index.php              ← Fallback PHP entry point
    ├── seed_db.php            ← Database seeder script
    ├── view_logs.php          ← Admin log viewer
    ├── database/
    │   └── database.sqlite    ← SQLite database (auto-created on first request)
    ├── storage/
    │   └── logs/              ← Server-side error and access logs
    └── logs/                  ← Detailed structured API logs
```

---

## Step-by-Step Upload Instructions

### STEP 1 — Log into cPanel File Manager
1. Go to your hosting control panel (cPanel)
2. Click **File Manager**
3. Navigate to **public_html** (or the root of your domain)
4. Delete or backup any existing `index.php` or `index.html` if present

---

### STEP 2 — Upload Frontend Files
Upload these files/folders directly into `public_html/`:

| File / Folder | Source Location |
|--------------|-----------------|
| `.htaccess` | `deploy_hosting/public_html/.htaccess` |
| `index.html` | `deploy_hosting/public_html/index.html` |
| `assets/` | `deploy_hosting/public_html/assets/` |
| `favicon.ico` | `deploy_hosting/public_html/favicon.ico` |
| `favicon.png` | `deploy_hosting/public_html/favicon.png` |
| `favicon.svg` | `deploy_hosting/public_html/favicon.svg` |
| `logo.png` | `deploy_hosting/public_html/logo.png` |

> **Tip**: Zip the `public_html/` folder and use cPanel → File Manager → Upload → Extract to save time.

---

### STEP 3 — Upload Uploads Folder
Upload the `uploads/` folder structure into `public_html/`:
- The `uploads/.htaccess` blocks PHP execution inside uploads
- Sub-folders (`auction/`, `classified/`, `hero/`, etc.) are auto-used by the backend

---

### STEP 4 — Upload Backend
1. Create a folder called `backend` inside `public_html/`
2. Upload all files from `deploy_hosting/public_html/backend/` into `public_html/backend/`

---

### STEP 5 — Configure Environment (.env)
1. In `public_html/backend/`, find the file `.env.production`
2. **Rename it** to `.env`
3. Open it and update these fields:

```env
APP_URL=https://yourdomain.com          ← Your actual live domain
MAIL_USERNAME=your@email.com            ← Your Brevo login email
MAIL_PASSWORD=xsmtp-key-here            ← Your Brevo SMTP key
MAIL_FROM_ADDRESS=no-reply@yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

> **Get Brevo SMTP key**: Go to https://app.brevo.com → Settings → SMTP & API → SMTP Settings → Generate master key

---

### STEP 6 — Set File Permissions (cPanel File Manager)
Right-click each path below → Permissions:

| Path | Permission | Notes |
|------|-----------|-------|
| `backend/` | `755` | Directory |
| `backend/server.php` | `644` | PHP file |
| `backend/security_config.php` | `644` | PHP file |
| `backend/.env` | `600` | **Private! Keep secret!** |
| `backend/database/` | `755` | Must be writable |
| `backend/database/database.sqlite` | `664` | Must be writable by web server |
| `backend/storage/` | `755` | Must be writable |
| `backend/storage/logs/` | `755` | Must be writable |
| `backend/logs/` | `755` | Must be writable |
| `uploads/` | `755` | Must be writable for uploads |
| `uploads/auction/` | `755` | |
| `uploads/classified/` | `755` | |
| `uploads/hero/` | `755` | |
| `uploads/general/` | `755` | |
| `uploads/logo/` | `755` | |

---

### STEP 7 — Enable SSL Certificate
1. In cPanel → **SSL/TLS** → **Let's Encrypt AutoSSL** (or **Install SSL**)
2. Install free SSL for your domain and www subdomain
3. The `.htaccess` HTTPS redirect is already configured — it will auto-activate

---

### STEP 8 — Initialize the Database (Optional)
If the SQLite database is empty and you want demo data:
1. Visit: `https://yourdomain.com/backend/seed_db.php`
2. This seeds the database with demo users, auctions, and classifieds
3. **Delete `seed_db.php` from the server after seeding!**

---

### STEP 9 — Test Your Deployment
Visit each URL to verify everything works:

| URL | Expected Result |
|-----|----------------|
| `https://yourdomain.com` | SalvageReef homepage loads |
| `https://yourdomain.com/auctions` | Auctions listing page |
| `https://yourdomain.com/classifieds` | Classifieds listing page |
| `https://yourdomain.com/login` | Login page |
| `https://yourdomain.com/register` | Registration page |
| `https://yourdomain.com/backend/api/v1/system/status` | `{"status":"online","version":"1.0"}` |
| `https://yourdomain.com/backend/api/v1/auctions` | JSON array of auction lots |
| `http://yourdomain.com` | Auto-redirects to HTTPS ✓ |

---

## Quick API Test Commands

```bash
# System health check
curl https://yourdomain.com/backend/api/v1/system/status

# Auctions list
curl https://yourdomain.com/backend/api/v1/auctions

# Categories
curl https://yourdomain.com/backend/api/v1/categories

# Test login
curl -X POST https://yourdomain.com/backend/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@salvagereef.com","password":"sociial123"}'
```

---

## Admin Login Credentials

| Role | Email | Password | URL |
|------|-------|----------|-----|
| Master Admin | admin@salvagereef.com | sociial123 | /login?mode=admin |
| Executive Desk Admin | executive@salvagereef.com | execadmin123 | /login?mode=admin |
| Demo Seller | seller@salvagereef.com | SellerPass@2026 | /login |
| Demo Bidder | bidder@salvagereef.com | BidderPass@2026 | /login |

> **Change all passwords after going live!** Use the Admin Console → Change Admin Password.

---

## Maintenance Mode

- In Admin Console → **System Errors & Maintenance** tab
- Switch between `🟢 ONLINE`, `🟡 MAINTENANCE`, `🔴 TEMPORARILY CLOSED`
- Admin accounts bypass maintenance mode automatically

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank white page | Ensure `.htaccess` is uploaded and `mod_rewrite` is enabled in cPanel |
| React routes show 404 | `.htaccess` SPA routing rule is missing — re-upload root `.htaccess` |
| API returns 404 | Check `backend/.htaccess` exists and was uploaded correctly |
| Login fails | Check `backend/.env` has correct values and filename is exactly `.env` |
| Images not loading | Check `assets/` folder was uploaded, verify `index.html` asset paths |
| No HTTPS redirect | Enable SSL in cPanel first, then the `.htaccess` redirect activates |
| 500 error on backend | Check file permissions: `database/` must be `755`, `.sqlite` must be `664` |
| SQLite DB not found | Set `backend/database/` to `755` — the DB auto-creates on first request |
| Upload errors (images) | Set `uploads/` and subdirs to `755`, check `post_max_size` in `.htaccess` |
| CORS errors in browser | Update `Access-Control-Allow-Origin` in `backend/.htaccess` to your domain |
| Emails not sending | Verify Brevo SMTP key in `backend/.env`, check Brevo dashboard for quota |


## Folder Structure After Upload

```
public_html/
├── .htaccess              ← Root Apache config (SPA + HTTPS + API routing)
├── index.html             ← React frontend entry point
├── assets/
│   ├── index-*.js         ← Compiled JS bundle
│   └── index-*.css        ← Compiled CSS bundle
├── favicon.ico
├── favicon.png
├── favicon.svg
├── logo.png
└── backend/
    ├── .htaccess          ← Backend Apache config (API routing + security)
    ├── .env               ← ⚠️ RENAME .env.production → .env (fill in values!)
    ├── server.php         ← Main PHP API handler
    ├── security_config.php← Security keys and rate limit config
    ├── index.php          ← GoDaddy fallback entry point
    ├── database/
    │   └── database.sqlite← SQLite database (auto-created if missing)
    └── storage/
        └── logs/
            └── errors/    ← Error logs directory
```

---

## Step-by-Step Upload Instructions

### 1. Log into cPanel File Manager
- Go to **cPanel → File Manager → public_html**

### 2. Upload Frontend Files
Upload everything in the root of `public_html/` folder:
- `.htaccess`
- `index.html`
- `assets/` folder
- `favicon.ico`, `favicon.png`, `favicon.svg`, `logo.png`

### 3. Upload Backend Files
- Create a folder called `backend` inside `public_html`
- Upload all files from `public_html/backend/` into it

### 4. Configure Environment
- **Rename** `.env.production` → `.env`
- Open `.env` and update:
  - `APP_URL=https://yourdomain.com` ← your actual domain
  - `MAIL_USERNAME=` ← your Brevo login email
  - `MAIL_PASSWORD=` ← your Brevo SMTP key
  - `FRONTEND_URL=https://yourdomain.com`
  - `SANCTUM_STATEFUL_DOMAINS=yourdomain.com`

### 5. Set File Permissions (via cPanel File Manager)
Right-click each and set permissions:
| Path | Permission |
|------|-----------|
| `backend/database/` | `755` |
| `backend/database/database.sqlite` | `664` |
| `backend/storage/` | `755` |
| `backend/storage/logs/` | `755` |
| `backend/storage/logs/errors/` | `755` |
| `backend/server.php` | `644` |
| `backend/.env` | `600` (keep private!) |

### 6. Enable SSL Certificate
- In cPanel → **SSL/TLS → Let's Encrypt** (or AutoSSL)
- Install free SSL for your domain
- The `.htaccess` HTTPS redirect is already configured

### 7. Test Your Deployment
After upload, verify these URLs work:
- `https://yourdomain.com` → loads the SalvageReef homepage
- `https://yourdomain.com/auctions` → auctions listing
- `https://yourdomain.com/backend/api/v1/system/status` → `{"status":"online"}`
- `https://yourdomain.com/login` → login page
- `http://yourdomain.com` → auto-redirects to `https://` ✓

---

## Quick Test API Endpoints

```bash
# System status (should return {"status":"online"})
curl https://yourdomain.com/backend/api/v1/system/status

# Auctions list
curl https://yourdomain.com/backend/api/v1/auctions

# Categories
curl https://yourdomain.com/backend/api/v1/categories
```

---

## Maintenance Mode & Error Tracking System

### 1. Maintenance Mode & Operating Mode Control
- **Modes Available**: `🟢 ONLINE`, `🟡 MAINTENANCE`, `🔴 TEMPORARILY CLOSED`
- **Admin Bypass**: Admin routes (`/api/v1/admin/*`, `/admin`) and authenticated admin users (`admin`, `master_admin`, `desk_admin`) are **100% EXEMPT** from maintenance mode block. When you switch mode to Maintenance or Temporarily Closed, visitors will see the custom maintenance announcement, while your Admin Dashboard remains fully accessible without any backend errors.

### 2. Precise Hosting Error Logging & Line Number Tracking
- **Automatic Exception Capture**: Every PHP error, database exception, or unhandled runtime failure is automatically recorded with:
  - **Exact Hosting File Path**: e.g., `/home/username/public_html/backend/app/Http/Controllers/AuctionController.php`
  - **Exact Line Number**: e.g., `Line 124`
  - **Full Stack Trace**, **Request URL**, **Method**, **Client IP**, and **User Agent**
- **Admin Error Console**: View error entries under **Admin Console → System Errors & Maintenance**. The table includes a dedicated **Hosting File & Line Number** column with a distinct line badge, and the **Inspect Trace** modal highlights the exact server file and line of code where the hosting error occurred.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank white page | Check `.htaccess` is uploaded, mod_rewrite enabled |
| API returns 404 | Check `backend/.htaccess` exists and was uploaded |
| Login fails | Check `backend/.env` has correct values and was renamed |
| Images not loading | Check `assets/` folder uploaded correctly |
| No HTTPS redirect | Enable SSL in cPanel first, then `.htaccess` redirect works |
| 500 error on backend | Check file permissions on `database/` and `storage/` |
| SQLite DB not found | Set `backend/database/` permission to `755`, DB auto-creates |

