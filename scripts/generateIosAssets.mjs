/**
 * Renders the iOS app icon and launch-screen images from resources/app-icon.svg.
 * Run after changing the icon artwork: `node scripts/generateIosAssets.mjs`
 */
import sharp from 'sharp';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assets = resolve(root, 'ios/App/App/Assets.xcassets');
const BACKGROUND = '#f6f5f0';

// App Store icons must be 1024x1024 and fully opaque
await sharp(resolve(root, 'resources/app-icon.svg'))
  .resize(1024, 1024)
  .flatten({ background: BACKGROUND })
  .removeAlpha()
  .png()
  .toFile(resolve(assets, 'AppIcon.appiconset/AppIcon-512@2x.png'));

// The launch screen is a plain background matching the web splash, so the hand-off is seamless
const splash = sharp({
  create: { width: 2732, height: 2732, channels: 3, background: BACKGROUND },
}).png();
for (const name of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) {
  await splash.clone().toFile(resolve(assets, 'Splash.imageset', name));
}

console.log('iOS icon and launch images written to', assets);
