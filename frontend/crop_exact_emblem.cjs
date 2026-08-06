const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function cropExactEmblem() {
  const inputPath = path.join(__dirname, 'public', 'logo_original.jpg');

  // Extract candidate region containing the SR emblem
  const buffer = await sharp(inputPath)
    .extract({ left: 50, top: 100, width: 550, height: 360 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const data = buffer.data;
  const width = buffer.info.width;
  const height = buffer.info.height;

  // Turn white/grey background pixels transparent
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // White/grey background
    if (r > 200 && g > 200 && b > 200) {
      data[i + 3] = 0;
    }
  }

  // Trim empty margins tightly around ONLY the SR emblem circle
  const finalEmblemPng = await sharp(data, {
    raw: {
      width: width,
      height: height,
      channels: 4
    }
  })
    .trim()
    .png({ quality: 100 })
    .toBuffer();

  const logoPngPath = path.join(__dirname, 'public', 'logo.png');
  const faviconPngPath = path.join(__dirname, 'public', 'favicon.png');
  const faviconIcoPath = path.join(__dirname, 'public', 'favicon.ico');
  const faviconSvgPath = path.join(__dirname, 'public', 'favicon.svg');

  fs.writeFileSync(logoPngPath, finalEmblemPng);

  // Favicon (128x128)
  const faviconBuffer = await sharp(finalEmblemPng)
    .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  fs.writeFileSync(faviconPngPath, faviconBuffer);
  fs.writeFileSync(faviconIcoPath, faviconBuffer);

  const base64Png = faviconBuffer.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <image href="data:image/png;base64,${base64Png}" width="128" height="128" />
</svg>`;

  fs.writeFileSync(faviconSvgPath, svgContent);

  console.log('SUCCESS: Extracted ONLY the circular SR emblem!');
}

cropExactEmblem().catch(console.error);
