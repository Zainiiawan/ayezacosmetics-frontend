const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgCode = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <circle cx="256" cy="256" r="240" fill="#e8c4c4" stroke="#b76e79" stroke-width="20" />
  <text x="256" y="250" font-family="Georgia, serif" font-size="200" font-weight="bold" fill="#0a0a0a" text-anchor="middle" dominant-baseline="middle">AC</text>
  <text x="256" y="380" font-family="Arial, sans-serif" font-size="45" font-weight="bold" fill="#0a0a0a" text-anchor="middle" letter-spacing="2">AYEZA COSMETICS</text>
</svg>
`;

async function generate() {
  const publicDir = path.join(__dirname, 'public');
  const appDir = path.join(__dirname, 'src', 'app');

  await sharp(Buffer.from(svgCode)).resize(512, 512).png().toFile(path.join(publicDir, 'logo.png'));
  await sharp(Buffer.from(svgCode)).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(Buffer.from(svgCode)).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(Buffer.from(svgCode)).resize(512, 512).png().toFile(path.join(appDir, 'icon.png'));
  await sharp(Buffer.from(svgCode)).resize(180, 180).png().toFile(path.join(appDir, 'apple-icon.png'));

  console.log("All logo PNGs have been regenerated successfully.");
}

generate().catch(console.error);
