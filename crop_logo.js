const sharp = require('sharp');
const path = require('path');

const srcPath = '/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7/logo_rosegold_black_1786137869957.jpg';

async function generate() {
  const publicDir = path.join(__dirname, 'public');
  const appDir = path.join(__dirname, 'src', 'app');
  const backendDir = path.join(__dirname, '..', 'ayezacosmetics-backend', 'public');
  const brainDir = '/Users/zain/.gemini/antigravity/brain/b0983520-7a75-41d7-a94a-4041f2cd77f7';

  // Create a circular SVG mask for a 1024x1024 image
  const mask = Buffer.from(
    '<svg width="1024" height="1024"><circle cx="512" cy="512" r="500" /></svg>'
  );

  // Process the source image: add the mask to create transparency
  const roundedCorners = sharp(srcPath)
    .resize(1024, 1024)
    .composite([{
      input: mask,
      blend: 'dest-in'
    }])
    .png();

  // Save the main preview
  await roundedCorners.toFile(path.join(brainDir, 'final_logo_preview.png'));

  // Save the required sizes
  await roundedCorners.clone().resize(512, 512).toFile(path.join(publicDir, 'logo.png'));
  await roundedCorners.clone().resize(512, 512).toFile(path.join(publicDir, 'icon-512.png'));
  await roundedCorners.clone().resize(192, 192).toFile(path.join(publicDir, 'icon-192.png'));
  await roundedCorners.clone().resize(512, 512).toFile(path.join(appDir, 'icon.png'));
  await roundedCorners.clone().resize(180, 180).toFile(path.join(appDir, 'apple-icon.png'));
  
  // Save for backend if directory exists
  try {
    await roundedCorners.clone().resize(512, 512).toFile(path.join(backendDir, 'icon.png'));
  } catch (e) {
    console.log("Backend public directory not found, skipping backend logo update.");
  }

  console.log("All circular logo PNGs have been generated successfully.");
}

generate().catch(console.error);
