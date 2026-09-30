const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(__dirname, 'dist');
const deployDir = path.join(rootDir, 'deploy_hosting', 'public_html');
const distHtml = path.join(distDir, 'index.html');

console.log('📦 Starting SalvageReef Hosting Package Build...');

// 1. Process dist/index.html
if (fs.existsSync(distHtml)) {
  let content = fs.readFileSync(distHtml, 'utf8');

  // Ensure <base href="/" /> is present for sub-route asset loading
  if (!content.includes('<base href="/"')) {
    content = content.replace('<head>', '<head>\n    <base href="/" />');
  }

  fs.writeFileSync(distHtml, content, 'utf8');
  console.log('✔ Updated dist/index.html with <base href="/" />!');
}

// 2. Sync built dist/ files into deploy_hosting/public_html/
if (fs.existsSync(deployDir)) {
  const assetsSrc = path.join(distDir, 'assets');
  const assetsDest = path.join(deployDir, 'assets');

  // Copy assets folder
  if (fs.existsSync(assetsSrc)) {
    if (fs.existsSync(assetsDest)) {
      fs.rmSync(assetsDest, { recursive: true, force: true });
    }
    fs.mkdirSync(assetsDest, { recursive: true });

    const files = fs.readdirSync(assetsSrc);
    for (const file of files) {
      fs.copyFileSync(path.join(assetsSrc, file), path.join(assetsDest, file));
    }
    console.log(`✔ Copied ${files.length} compiled assets to deploy_hosting/public_html/assets/!`);
  }

  // Copy root index.html and favicons
  if (fs.existsSync(distHtml)) {
    fs.copyFileSync(distHtml, path.join(deployDir, 'index.html'));
  }

  // Sync latest backend PHP scripts
  const backendSrc = path.join(rootDir, 'backend');
  const backendDest = path.join(deployDir, 'backend');
  const backendFilesToSync = ['server.php', 'security_config.php', 'seed_db.php', 'view_logs.php', 'index.php'];
  if (fs.existsSync(backendSrc) && fs.existsSync(backendDest)) {
    for (const bf of backendFilesToSync) {
      const srcPath = path.join(backendSrc, bf);
      const destPath = path.join(backendDest, bf);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✔ Synced ${bf} to deploy_hosting/public_html/backend/${bf}`);
      }
    }
    // Sync database file
    const dbSrc = path.join(backendSrc, 'database', 'database.sqlite');
    const dbDestDir = path.join(backendDest, 'database');
    const dbDest = path.join(dbDestDir, 'database.sqlite');
    if (fs.existsSync(dbSrc)) {
      if (!fs.existsSync(dbDestDir)) fs.mkdirSync(dbDestDir, { recursive: true });
      fs.copyFileSync(dbSrc, dbDest);
      console.log('✔ Synced database.sqlite to deploy_hosting/public_html/backend/database/database.sqlite');
    }
  }
}

// 3. Pre-create required backend log and upload directories
const requiredDirs = [
  path.join(deployDir, 'backend', 'logs'),
  path.join(deployDir, 'uploads', 'auction'),
  path.join(deployDir, 'uploads', 'classified'),
  path.join(deployDir, 'uploads', 'logo'),
  path.join(deployDir, 'uploads', 'hero'),
  path.join(deployDir, 'uploads', 'footer-logo'),
  path.join(deployDir, 'uploads', 'general'),
];

for (const dir of requiredDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    const gitkeep = path.join(dir, '.gitkeep');
    if (!fs.existsSync(gitkeep)) fs.writeFileSync(gitkeep, '');
  }
}
console.log('✔ Pre-created all backend log and upload subdirectories!');

// 4. Create initial error log files if missing
const errorLogFiles = [
  path.join(deployDir, 'backend', 'logs', 'error.log'),
  path.join(deployDir, 'backend', 'logs', 'access.log'),
  path.join(deployDir, 'backend', 'logs', 'security.log'),
  path.join(deployDir, 'backend', 'logs', 'upload.log'),
  path.join(deployDir, 'backend', 'logs', 'fatal.log'),
];

for (const f of errorLogFiles) {
  if (!fs.existsSync(f)) {
    const initialHeader = `=== SALVAGEREEF INITIALIZED LOG FILE (${path.basename(f)}) ===\n`;
    fs.writeFileSync(f, initialHeader, 'utf8');
  }
}

// 5. Package both Fresh Install and Safe-Update (No Database Overwrite) ZIPs
try {
  const fullZipPath = path.join(rootDir, 'salvagereef_FULL_UPLOAD.zip');
  const safeUpdateZipPath = path.join(rootDir, 'salvagereef_UPDATE_SAFE_NO_DATABASE.zip');
  const scrabZipPath = path.join(rootDir, 'scrab_dist.zip');
  const frontendZipPath = path.join(__dirname, 'scrab_dist.zip');
  const deployZipPath = path.join(rootDir, 'deploy_hosting', 'salvagereef_FULL_UPLOAD.zip');
  const deploySafeZipPath = path.join(rootDir, 'deploy_hosting', 'salvagereef_UPDATE_SAFE_NO_DATABASE.zip');

  // 5a. Build Full Upload ZIP (with database for fresh server setup)
  const tarCmdFull = `tar -a -c -f "${fullZipPath}" -C "${deployDir}" .`;
  execSync(tarCmdFull, { stdio: 'inherit' });

  fs.copyFileSync(fullZipPath, scrabZipPath);
  fs.copyFileSync(fullZipPath, frontendZipPath);
  fs.copyFileSync(fullZipPath, deployZipPath);
  console.log('🚀 Generated salvagereef_FULL_UPLOAD.zip (For 1st-time fresh server installation)');

  // 5b. Build Safe Update ZIP (EXCLUDES database.sqlite and uploads/ so live auctions & users are NEVER reset!)
  const tempUpdateDir = path.join(rootDir, 'deploy_hosting', '_temp_safe_update');
  if (fs.existsSync(tempUpdateDir)) {
    fs.rmSync(tempUpdateDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempUpdateDir, { recursive: true });

  // Copy everything except database.sqlite and user uploads
  const copyRecursive = (src, dest) => {
    const items = fs.readdirSync(src);
    for (const item of items) {
      const sPath = path.join(src, item);
      const dPath = path.join(dest, item);
      const stat = fs.statSync(sPath);

      if (stat.isDirectory()) {
        // Skip user uploads directory content in update zip to preserve all user uploaded photos
        if (sPath.includes(path.join('public_html', 'uploads'))) {
          fs.mkdirSync(dPath, { recursive: true });
          continue;
        }
        // Skip database directory content to preserve live database
        if (sPath.includes(path.join('public_html', 'backend', 'database'))) {
          fs.mkdirSync(dPath, { recursive: true });
          continue;
        }
        fs.mkdirSync(dPath, { recursive: true });
        copyRecursive(sPath, dPath);
      } else {
        // Do NOT copy database.sqlite into update zip
        if (item === 'database.sqlite') {
          continue;
        }
        fs.copyFileSync(sPath, dPath);
      }
    }
  };

  copyRecursive(deployDir, tempUpdateDir);

  const tarCmdSafe = `tar -a -c -f "${safeUpdateZipPath}" -C "${tempUpdateDir}" .`;
  execSync(tarCmdSafe, { stdio: 'inherit' });
  try {
    fs.rmSync(tempUpdateDir, { recursive: true, force: true });
  } catch {}

  console.log('🛡️  SUCCESS! Generated salvagereef_UPDATE_SAFE_NO_DATABASE.zip (Extract this for future updates — Live auctions & Users are NEVER reset!)');
} catch (e) {
  console.warn('Zip creation notice:', e.message);
}
