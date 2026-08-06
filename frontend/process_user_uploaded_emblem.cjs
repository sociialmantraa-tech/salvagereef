const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processUserEmblem() {
  const brainDir = 'C:/Users/Designer/.gemini/antigravity-ide/brain/badb6675-aa6e-4899-b967-aff95dbc0bda';
  const inputPath = path.join(brainDir, 'media__1785243170416.png');

  console.log('Processing user uploaded image snippet:', inputPath);

  const image = sharp(inputPath);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Turn white/light background pixels transparent
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r > 210 && g > 210 && b > 210) {
      data[i + 3] = 0; // Alpha transparent
    }
  }

  // Trim empty margins tightly around the emblem
  const transparentPngBuffer = await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .trim()
    .png({ quality: 100 })
    .toBuffer();

  const logoPngPath = path.join(__dirname, 'public', 'logo.png');
  const faviconPngPath = path.join(__dirname, 'public', 'favicon.png');
  const faviconIcoPath = path.join(__dirname, 'public', 'favicon.ico');
  const faviconSvgPath = path.join(__dirname, 'public', 'favicon.svg');

  // 1. High-res logo PNG
  fs.writeFileSync(logoPngPath, transparentPngBuffer);
  console.log('Saved public/logo.png');

  // 2. Favicon PNG (128x128)
  const faviconBuffer = await sharp(transparentPngBuffer)
    .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  fs.writeFileSync(faviconPngPath, faviconBuffer);
  fs.writeFileSync(faviconIcoPath, faviconBuffer);
  console.log('Saved public/favicon.png & public/favicon.ico');

  // 3. Favicon SVG
  const base64Png = faviconBuffer.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <image href="data:image/png;base64,${base64Png}" width="128" height="128" />
</svg>`;

  fs.writeFileSync(faviconSvgPath, svgContent);
  console.log('Saved public/favicon.svg');

  const meta = await sharp(transparentPngBuffer).metadata();
  console.log('SUCCESS: Processed exact user uploaded image emblem!', meta.width, 'x', meta.height);
}

processUserEmblem().catch(console.error);
