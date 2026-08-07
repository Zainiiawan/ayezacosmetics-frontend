const sharp = require('sharp');
const path = require('path');

const srcPath = '/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/logo_final_rose_black_ring.png';

async function generate() {
  const publicDir = path.join(__dirname, 'public');
  const appDir = path.join(__dirname, 'src', 'app');

  // The image is already a perfect circle with transparency.
  // We just need to resize it and distribute it to the correct paths.
  const src = sharp(srcPath);

  // Save the required sizes
  await src.clone().resize(512, 512).toFile(path.join(publicDir, 'logo.png'));
  await src.clone().resize(512, 512).toFile(path.join(publicDir, 'icon-512.png'));
  await src.clone().resize(192, 192).toFile(path.join(publicDir, 'icon-192.png'));
  await src.clone().resize(512, 512).toFile(path.join(appDir, 'icon.png'));
  await src.clone().resize(180, 180).toFile(path.join(appDir, 'apple-icon.png'));
  
  console.log("All circular logo PNGs have been resized and replaced successfully.");
}

generate().catch(console.error);
