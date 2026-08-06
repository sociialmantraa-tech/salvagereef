const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function cropEmblem() {
  const inputPath = path.join(__dirname, 'public', 'logo_original.jpg');
  const image = sharp(inputPath);
  const { width, height } = await image.metadata();

  console.log(`Original Size: ${width}x${height}`);

  // Get raw RGBA buffer
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Find bounding box of non-white pixels
  let minX = width, minY = height, maxX = 0, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Check if pixel is dark navy or amber gold logo mark
      const isDarkNavy = (r < 50 && g < 60 && b < 80);
      const isAmberGold = (r > 180 && g > 110 && b < 50);

      if (isDarkNavy || isAmberGold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log(`Detected Emblem Bounding Box: Left=${minX}, Top=${minY}, Width=${maxX - minX}, Height=${maxY - minY}`);

  // Add padding
  const padding = 10;
  const cropLeft = Math.max(0, minX - padding);
  const cropTop = Math.max(0, minY - padding);
  const cropWidth = Math.min(width - cropLeft, (maxX - minX) + padding * 2);
  const cropHeight = Math.min(height - cropTop, (maxY - minY) + padding * 2);

  // Extract the cropped SR emblem
  const croppedEmblemBuffer = await sharp(inputPath)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Remove white background inside the cropped box
  const cropData = croppedEmblemBuffer.data;
  for (let i = 0; i < cropData.length; i += 4) {
    const r = cropData[i];
    const g = cropData[i + 1];
    const b = cropData[i + 2];

    if (r > 215 && g > 215 && b > 215) {
      cropData[i + 3] = 0; // Transparent background
    }
  }

  const finalPngBuffer = await sharp(cropData, {
    raw: {
      width: croppedEmblemBuffer.info.width,
      height: croppedEmblemBuffer.info.height,
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

  fs.writeFileSync(logoPngPath, finalPngBuffer);

  // Favicon (128x128)
  const faviconBuffer = await sharp(finalPngBuffer)
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

  console.log('SUCCESS! Extracted and cropped ONLY the SR emblem circle!');
}

cropEmblem().catch(console.error);
