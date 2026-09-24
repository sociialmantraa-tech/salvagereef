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
  }
}

// 3. Pre-create required backend log and upload directories
const requiredDirs = [
  path.join(deployDir, 'backend', 'logs'),
  path.join(deployDir, 'backend', 'storage', 'logs', 'errors'),
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
  path.join(deployDir, 'backend', 'storage', 'logs', 'errors', 'error_log.txt'),
];

for (const f of errorLogFiles) {
  if (!fs.existsSync(f)) {
    const initialHeader = `=== SALVAGEREEF INITIALIZED LOG FILE (${path.basename(f)}) ===\n`;
    fs.writeFileSync(f, initialHeader, 'utf8');
  }
}

// 5. Automatically package ready-to-upload salvagereef_FULL_UPLOAD.zip using native tar
try {
  const fullZipPath = path.join(rootDir, 'salvagereef_FULL_UPLOAD.zip');
  const scrabZipPath = path.join(rootDir, 'scrab_dist.zip');
  const frontendZipPath = path.join(__dirname, 'scrab_dist.zip');

  const tarCmd = `tar -a -c -f "${fullZipPath}" -C "${deployDir}" .`;
  execSync(tarCmd, { stdio: 'inherit' });

  fs.copyFileSync(fullZipPath, scrabZipPath);
  fs.copyFileSync(fullZipPath, frontendZipPath);

  console.log('🚀 Successfully generated salvagereef_FULL_UPLOAD.zip for cPanel hosting!');
} catch (e) {
  console.warn('Zip creation notice:', e.message);
}
