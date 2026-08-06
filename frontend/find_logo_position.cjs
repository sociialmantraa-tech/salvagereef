const sharp = require('sharp');
const path = require('path');

async function findLogoPosition() {
  const inputPath = path.join(__dirname, 'public', 'logo_original.jpg');
  const image = sharp(inputPath);
  const { width, height } = await image.metadata();

  const { data } = await image.raw().toBuffer({ resolveWithObject: true });

  console.log(`Image Size: ${width} x ${height}`);

  // Divide image into 10x10 grid and count dark navy/amber pixels in each cell
  const gridX = 10, gridY = 10;
  const cellW = Math.floor(width / gridX);
  const cellH = Math.floor(height / gridY);

  for (let gy = 0; gy < gridY; gy++) {
    let rowStr = '';
    for (let gx = 0; gx < gridX; gx++) {
      let count = 0;
      for (let y = gy * cellH; y < (gy + 1) * cellH; y++) {
        for (let x = gx * cellW; x < (gx + 1) * cellW; x++) {
          const idx = (y * width + x) * 3;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];

          // Check if dark navy or amber gold
          const isNavy = (r < 60 && g < 70 && b < 100);
          const isAmber = (r > 170 && g > 100 && b < 60);

          if (isNavy || isAmber) count++;
        }
      }
      rowStr += count.toString().padStart(5, ' ') + ' ';
    }
    console.log(`Row ${gy}: ${rowStr}`);
  }
}

findLogoPosition().catch(console.error);
