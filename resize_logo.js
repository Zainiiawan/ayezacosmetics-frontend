const sharp = require('sharp');
const path = require('path');

const srcPath = '/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/edited_logo.png';

async function resize() {
  const publicDir = path.join(__dirname, 'public');
  const appDir = path.join(__dirname, 'src', 'app');

  // Generate 512x512 logo.png
  await sharp(srcPath).resize(512, 512).png().toFile(path.join(publicDir, 'logo.png'));
  await sharp(srcPath).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(srcPath).resize(512, 512).png().toFile(path.join(appDir, 'icon.png'));

  // Generate 192x192 icon
  await sharp(srcPath).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));

  // Generate apple-icon.png
  await sharp(srcPath).resize(180, 180).png().toFile(path.join(appDir, 'apple-icon.png'));

  console.log("All logo PNGs have been resized and copied successfully.");
}

resize().catch(console.error);
