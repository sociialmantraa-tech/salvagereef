# ============================================================
# SalvageReef — cPanel Deployment Guide
# ============================================================

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
