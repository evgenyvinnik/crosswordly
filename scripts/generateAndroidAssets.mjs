/**
 * Renders the Android launcher icons and the Google Play store icon from resources/app-icon.svg.
 * Run after changing the icon artwork: `node scripts/generateAndroidAssets.mjs`
 *
 * The launch screen needs no images: it is the plain page background colour
 * (android/app/src/main/res/drawable/splash.xml and the launch theme in values/styles.xml).
 */
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const res = resolve(root, 'android/app/src/main/res');
const playStore = resolve(root, 'resources/play-store');
const BACKGROUND = '#f6f5f0';

const iconSvg = await readFile(resolve(root, 'resources/app-icon.svg'), 'utf8');

// The tiles without the background square, centred and scaled to `scale` of the canvas. The tile
// motif spans 768 of the icon's 1024 units, centred on (512, 512).
const BACKGROUND_RECT = `<rect width="1024" height="1024" fill="${BACKGROUND}" />`;
if (!iconSvg.includes(BACKGROUND_RECT)) {
  throw new Error(`resources/app-icon.svg no longer starts with ${BACKGROUND_RECT}`);
}
const tilesSvg = (scale) => {
  const factor = (scale * 1024) / 768;
  return Buffer.from(
    iconSvg
      .replace(
        BACKGROUND_RECT,
        `<g transform="translate(512 512) scale(${factor}) translate(-512 -512)">`,
      )
      .replace('</svg>', '</g></svg>'),
  );
};

const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

// Adaptive icons (Android 8+) are a 108dp foreground over the background colour
// (values/ic_launcher_background.xml). Launchers mask them to circles, squircles or rounded
// squares, and only a 66dp circle is guaranteed to show. The tiles' outer corners have to sit
// inside it, which leaves the motif 47dp wide; 46dp keeps a little air.
const ADAPTIVE_SCALE = 46 / 108;
const foreground = await sharp(tilesSvg(ADAPTIVE_SCALE)).resize(432, 432).png().toBuffer();

// Legacy icons (Android 7) are drawn as-is: the iOS artwork as a rounded square, and a circle
// for launchers that ask for round icons, both 48dp with a 2dp margin
const legacySquare = await sharp(
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
    <rect x="43" y="43" width="938" height="938" rx="170" fill="#fff" /></svg>`),
)
  .composite([
    { input: await sharp(Buffer.from(iconSvg)).resize(1024, 1024).png().toBuffer(), blend: 'in' },
  ])
  .png()
  .toBuffer();
const legacyRound = await sharp(
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
    <circle cx="512" cy="512" r="469" fill="${BACKGROUND}" /></svg>`),
)
  .composite([{ input: await sharp(tilesSvg(0.62)).resize(1024, 1024).png().toBuffer() }])
  .png()
  .toBuffer();

for (const [density, factor] of Object.entries(DENSITIES)) {
  const dir = resolve(res, `mipmap-${density}`);
  await mkdir(dir, { recursive: true });
  const legacySize = Math.round(48 * factor);
  await sharp(foreground)
    .resize(Math.round(108 * factor))
    .toFile(resolve(dir, 'ic_launcher_foreground.png'));
  await sharp(legacySquare).resize(legacySize).toFile(resolve(dir, 'ic_launcher.png'));
  await sharp(legacyRound).resize(legacySize).toFile(resolve(dir, 'ic_launcher_round.png'));
}

// Google Play's listing icon: 512x512, opaque, full square (Play rounds the corners itself)
await mkdir(playStore, { recursive: true });
await sharp(Buffer.from(iconSvg))
  .resize(512, 512)
  .flatten({ background: BACKGROUND })
  .removeAlpha()
  .png()
  .toFile(resolve(playStore, 'icon-512.png'));

console.log('Android launcher icons written to', res);
console.log('Google Play icon written to', resolve(playStore, 'icon-512.png'));
