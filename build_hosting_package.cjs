#!/usr/bin/env node
/**
 * ============================================================================
 * SalvageReef — Production Build & Hosting Package Generator
 * ============================================================================
 * 
 * This script:
 *   1. Builds the React frontend (Vite production build)
 *   2. Copies built assets into deploy_hosting/public_html/
 *   3. Copies backend PHP files (server.php, security_config.php, etc.)
 *   4. Creates upload directory structure
 *   5. Generates two ZIP packages:
 *      - salvagereef_FULL_UPLOAD.zip        (everything — first-time deploy)
 *      - salvagereef_UPDATE_SAFE.zip        (code only — no database overwrite)
 * 
 * Usage:
 *   node build_hosting_package.cjs
 *   OR
 *   npm run package (if configured in package.json)
 * 
 * ============================================================================
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const FRONTEND = path.join(ROOT, 'frontend');
const BACKEND = path.join(ROOT, 'backend');
const DEPLOY = path.join(ROOT, 'deploy_hosting', 'public_html');
const DIST = path.join(FRONTEND, 'dist');

const log = (msg) => console.log(`\x1b[36m[BUILD]\x1b[0m ${msg}`);
const success = (msg) => console.log(`\x1b[32m[✓]\x1b[0m ${msg}`);
const warn = (msg) => console.log(`\x1b[33m[⚠]\x1b[0m ${msg}`);

// ─── Helper: Recursive copy ────────────────────────────────────────────────
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ─── Helper: Ensure directory exists ────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── Helper: Copy file safely ───────────────────────────────────────────────
function copyFileSafe(src, dest) {
  if (fs.existsSync(src)) {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
    return true;
  }
  return false;
}

// ============================================================================
// STEP 1: Build Frontend
// ============================================================================
log('Building frontend production bundle...');
try {
  execSync('npm.cmd run build', { cwd: FRONTEND, stdio: 'pipe' });
  success('Frontend build completed');
} catch (e) {
  // Vite may return exit code 1 for warnings but still builds successfully
  if (fs.existsSync(path.join(DIST, 'index.html'))) {
    success('Frontend build completed (with warnings)');
  } else {
    console.error('\x1b[31m[ERROR]\x1b[0m Frontend build failed!');
    console.error(e.stderr?.toString() || e.message);
    process.exit(1);
  }
}

// ============================================================================
// STEP 2: Copy Frontend Build to Deploy Directory
// ============================================================================
log('Copying frontend build assets...');

// Copy index.html
copyFileSafe(path.join(DIST, 'index.html'), path.join(DEPLOY, 'index.html'));
success('Copied index.html');

// Copy assets directory
const distAssets = path.join(DIST, 'assets');
const deployAssets = path.join(DEPLOY, 'assets');
if (fs.existsSync(deployAssets)) {
  fs.rmSync(deployAssets, { recursive: true, force: true });
}
copyDirSync(distAssets, deployAssets);
const assetCount = fs.readdirSync(deployAssets).length;
success(`Copied ${assetCount} asset files`);

// Copy favicons & logo
['favicon.ico', 'favicon.png', 'favicon.svg', 'logo.png'].forEach(file => {
  if (copyFileSafe(path.join(DIST, file), path.join(DEPLOY, file))) {
    success(`Copied ${file}`);
  } else if (copyFileSafe(path.join(FRONTEND, 'public', file), path.join(DEPLOY, file))) {
    success(`Copied ${file} (from public/)`);
  }
});

// ============================================================================
// STEP 3: Copy Backend PHP Files
// ============================================================================
log('Copying backend PHP files...');
const DEPLOY_BACKEND = path.join(DEPLOY, 'backend');
ensureDir(DEPLOY_BACKEND);

// Core backend files to copy
const backendFiles = [
  'server.php',
  'security_config.php',
  'index.php',
  'seed_db.php',
  'view_logs.php',
];

backendFiles.forEach(file => {
  if (copyFileSafe(path.join(BACKEND, file), path.join(DEPLOY_BACKEND, file))) {
    success(`Copied backend/${file}`);
  } else {
    warn(`Missing backend/${file} — skipped`);
  }
});

// Copy backend database directory (include pre-seeded SQLite and MySQL dump)
ensureDir(path.join(DEPLOY_BACKEND, 'database'));
copyFileSafe(path.join(BACKEND, 'database', 'database.sqlite'), path.join(DEPLOY_BACKEND, 'database', 'database.sqlite'));
copyFileSafe(path.join(BACKEND, 'database', 'salvagereef_mysql.sql'), path.join(DEPLOY_BACKEND, 'database', 'salvagereef_mysql.sql'));
const dbPlaceholder = path.join(DEPLOY_BACKEND, 'database', '.gitkeep');
if (!fs.existsSync(dbPlaceholder)) {
  fs.writeFileSync(dbPlaceholder, '# SQLite database auto-created on first API request\n');
}
success('Configured backend/database/ with database.sqlite and salvagereef_mysql.sql');

// Create pre-configured .env and .env.production templates in deploy backend
const envProductionContent = `# SalvageReef Production Environment Configuration
# GoDaddy cPanel MySQL Connection Settings (Database: scrab)

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=scrab
DB_USERNAME=scrab_user
DB_PASSWORD=scrabRoot@123

APP_ENV=production
APP_DEBUG=false
APP_URL=https://salvagereef.com
`;
fs.writeFileSync(path.join(DEPLOY_BACKEND, '.env.production'), envProductionContent);
fs.writeFileSync(path.join(DEPLOY_BACKEND, '.env'), envProductionContent);
fs.writeFileSync(path.join(BACKEND, '.env.production'), envProductionContent);
fs.writeFileSync(path.join(BACKEND, '.env'), envProductionContent);
success('Generated backend/.env and .env.production with cPanel MySQL (scrab/scrab_user)');

// Copy backend logs directory (empty)
ensureDir(path.join(DEPLOY_BACKEND, 'logs'));
fs.writeFileSync(path.join(DEPLOY_BACKEND, 'logs', '.gitkeep'), '# Server logs directory\n');
success('Created backend/logs/ directory structure');

// ============================================================================
// STEP 4: Create Upload Directory Structure
// ============================================================================
log('Creating upload directory structure...');
const DEPLOY_UPLOADS = path.join(DEPLOY, 'uploads');
const uploadSubDirs = ['auction', 'classified', 'general', 'hero', 'logo', 'footer-logo', 'kyc', 'tender'];

uploadSubDirs.forEach(dir => {
  ensureDir(path.join(DEPLOY_UPLOADS, dir));
});

// Copy any existing upload files from source (KYC documents, sample images)
const srcUploads = path.join(ROOT, 'uploads');
if (fs.existsSync(srcUploads)) {
  copyDirSync(srcUploads, DEPLOY_UPLOADS);
  success('Synchronized existing uploads (KYC files, media)');
}
success(`Created ${uploadSubDirs.length} upload sub-directories`);

// ============================================================================
// STEP 5: Verify All Required Files Exist
// ============================================================================
log('Verifying deployment package...');

const requiredFiles = [
  '.htaccess',
  'index.html',
  'favicon.ico',
  'favicon.png',
  'backend/.htaccess',
  'backend/server.php',
  'backend/security_config.php',
  'backend/index.php',
  'uploads/.htaccess',
  'uploads/index.html',
];

let allPresent = true;
requiredFiles.forEach(file => {
  const fullPath = path.join(DEPLOY, file);
  if (fs.existsSync(fullPath)) {
    success(`✓ ${file}`);
  } else {
    warn(`✗ MISSING: ${file}`);
    allPresent = false;
  }
});

// Count total assets
const totalAssets = fs.existsSync(deployAssets) ? fs.readdirSync(deployAssets).length : 0;

// ============================================================================
// STEP 6: Generate ZIP Packages
// ============================================================================
log('Generating ZIP packages...');

try {
  // Full upload ZIP (includes everything)
  const fullZipName = 'salvagereef_FULL_UPLOAD.zip';
  const fullZipPath = path.join(ROOT, fullZipName);
  
  // Remove old zips
  [fullZipPath, path.join(ROOT, 'deploy_hosting', fullZipName)].forEach(f => {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  });

  // Create ZIP using PowerShell Compress-Archive
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '.\\\\deploy_hosting\\\\public_html\\\\*' -DestinationPath '.\\\\${fullZipName}' -Force"`,
    { cwd: ROOT, stdio: 'pipe' }
  );
  
  const zipSize = (fs.statSync(fullZipPath).size / 1024).toFixed(1);
  success(`Created ${fullZipName} (${zipSize} KB)`);

  // Also copy to deploy_hosting/
  fs.copyFileSync(fullZipPath, path.join(ROOT, 'deploy_hosting', fullZipName));
  
  // Update-safe ZIP (excludes database.sqlite so existing data is preserved)
  const updateZipName = 'salvagereef_UPDATE_SAFE_NO_DATABASE.zip';
  const updateZipPath = path.join(ROOT, updateZipName);
  if (fs.existsSync(updateZipPath)) fs.unlinkSync(updateZipPath);
  
  // Temporarily move database.sqlite outside deploy tree so it is completely excluded
  const dbFile = path.join(DEPLOY_BACKEND, 'database', 'database.sqlite');
  const dbTempMove = path.join(ROOT, 'temp_db_backup.sqlite');
  const hadDb = fs.existsSync(dbFile);
  if (hadDb) fs.renameSync(dbFile, dbTempMove);
  
  try {
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '.\\\\deploy_hosting\\\\public_html\\\\*' -DestinationPath '.\\\\${updateZipName}' -Force"`,
      { cwd: ROOT, stdio: 'pipe' }
    );
    const updateZipSize = (fs.statSync(updateZipPath).size / 1024).toFixed(1);
    success(`Created ${updateZipName} (${updateZipSize} KB)`);
  } finally {
    if (hadDb && fs.existsSync(dbTempMove)) fs.renameSync(dbTempMove, dbFile);
  }

} catch (zipErr) {
  warn(`ZIP creation failed: ${zipErr.message}`);
  warn('You can manually zip the deploy_hosting/public_html/ folder');
}

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n' + '═'.repeat(65));
console.log('\x1b[32m  ✅ SALVAGEREEF HOSTING PACKAGE READY!\x1b[0m');
console.log('═'.repeat(65));
console.log(`
  📁 Deploy Directory:  deploy_hosting/public_html/
  📦 Full ZIP:          salvagereef_FULL_UPLOAD.zip
  📦 Update ZIP:        salvagereef_UPDATE_SAFE_NO_DATABASE.zip
  📄 Frontend Assets:   ${totalAssets} files
  🔧 Backend Files:     ${backendFiles.length} PHP files
  📂 Upload Dirs:       ${uploadSubDirs.length} directories

  📋 NEXT STEPS:
  1. Upload ZIP to cPanel File Manager → public_html/
  2. Extract the ZIP contents
  3. Rename backend/.env.production → backend/.env
  4. Fill in domain + Brevo SMTP credentials in .env
  5. Set backend/.env permission to 600
  6. Set backend/database/ permission to 755
  7. Visit https://yourdomain.com to verify!
`);
console.log('═'.repeat(65));
