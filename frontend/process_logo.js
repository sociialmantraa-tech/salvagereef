const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processLogo() {
  const inputPath = path.join(__dirname, 'public', 'logo_original.jpg');
  const logoPngPath = path.join(__dirname, 'public', 'logo.png');
  const faviconPngPath = path.join(__dirname, 'public', 'favicon.png');
  const faviconIcoPath = path.join(__dirname, 'public', 'favicon.ico');
  const faviconSvgPath = path.join(__dirname, 'public', 'favicon.svg');

  console.log('Processing original logo image with Sharp...');

  // 1. Get raw RGBA buffer
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;

  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 2. Turn white/light background transparent
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // If pixel is near white/grey background
    if (r > 220 && g > 220 && b > 220) {
      data[i + 3] = 0; // Set Alpha to 0 (Transparent)
    }
  }

  // 3. Create transparent PNG
  const transparentBuffer = await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .trim() // Crop bounding box tightly
    .png({ quality: 100 })
    .toBuffer();

  fs.writeFileSync(logoPngPath, transparentBuffer);
  console.log('Created high-res transparent logo.png');

  // 4. Create favicon PNG (128x128)
  const faviconBuffer = await sharp(transparentBuffer)
    .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  fs.writeFileSync(faviconPngPath, faviconBuffer);
  fs.writeFileSync(faviconIcoPath, faviconBuffer);
  console.log('Created favicon.png and favicon.ico');

  // 5. Create favicon SVG with embedded clean PNG
  const base64Png = faviconBuffer.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <image href="data:image/png;base64,${base64Png}" width="128" height="128" />
</svg>`;

  fs.writeFileSync(faviconSvgPath, svgContent);
  console.log('Created favicon.svg');

  console.log('Logo & Favicon processing complete!');
}

processLogo().catch(err => {
  console.error('Error processing logo:', err);
  process.exit(1);
});
