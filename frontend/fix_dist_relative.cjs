const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distHtml = path.join(__dirname, 'dist', 'index.html');
if (fs.existsSync(distHtml)) {
  let content = fs.readFileSync(distHtml, 'utf8');

  // Replace absolute paths with relative ./ paths
  content = content.replace(/src="\/assets\//g, 'src="./assets/');
  content = content.replace(/href="\/assets\//g, 'href="./assets/');
  content = content.replace(/src="\/logo\.png"/g, 'src="./logo.png"');
  content = content.replace(/href="\/favicon/g, 'href="./favicon');

  fs.writeFileSync(distHtml, content, 'utf8');
  console.log('✔ Updated dist/index.html with relative ./ asset paths!');
}

// Also check and fix built JS bundle files in dist/assets
const assetsDir = path.join(__dirname, 'dist', 'assets');
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  for (const file of files) {
    if (file.endsWith('.js')) {
      const filePath = path.join(assetsDir, file);
      let jsContent = fs.readFileSync(filePath, 'utf8');
      if (jsContent.includes('"/logo.png"')) {
        jsContent = jsContent.replace(/"\/logo\.png"/g, '"./logo.png"');
        fs.writeFileSync(filePath, jsContent, 'utf8');
      }
    }
  }
}

// Automatically package ready-to-upload scrab_dist.zip
try {
  const frontendZip = path.join(__dirname, 'scrab_dist.zip');
  const rootZip = path.join(__dirname, '..', 'scrab_dist.zip');
  const distFiles = path.join(__dirname, 'dist', '*');

  const psCmd = `powershell -Command "Compress-Archive -Path '${distFiles}' -DestinationPath '${frontendZip}' -Force; Copy-Item -Path '${frontendZip}' -Destination '${rootZip}' -Force"`;
  execSync(psCmd, { stdio: 'inherit' });
  console.log('✔ Automatically packaged scrab_dist.zip for cPanel upload!');
} catch (e) {
  console.warn('Zip creation notice:', e.message);
}
