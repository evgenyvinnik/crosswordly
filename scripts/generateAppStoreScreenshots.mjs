/**
 * Composes the App Store screenshots: a headline over resources/app-store/background.png with a
 * real simulator capture (resources/app-store/captures/<device>/) framed underneath.
 * Run after replacing a capture: `node scripts/generateAppStoreScreenshots.mjs`
 *
 * Captures are taken with `xcrun simctl io <device> screenshot <file>.png` on an
 * iPhone 17 Pro Max (1320x2868) simulator. An iPad set (iPad Pro 13-inch, 2064x2752) needs its
 * own captures folder and a DEVICES entry with a layout sized for that canvas.
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assets = resolve(root, 'resources/app-store');

const PANELS = [
  {
    capture: '01-gameplay.png',
    slug: '01-every-word-has-its-place',
    title: ['Every word', 'has its place.'],
    sub: 'Choose from the word bank. Fill the grid.',
  },
  {
    capture: '02-connections.png',
    slug: '02-make-connections',
    title: ['Find the words.', 'Make connections.'],
    sub: 'Fit each answer where the letters meet.',
  },
  {
    capture: '03-levels.png',
    slug: '03-small-grids-big-possibilities',
    title: ['Small grids.', 'Big possibilities.'],
    sub: 'Explore puzzles with different shapes.',
  },
  {
    capture: '04-complete.png',
    slug: '04-that-just-fit-feeling',
    title: ['That just-fit', 'feeling.'],
    sub: 'Complete a puzzle. Share your solve.',
  },
];

// Layout values are in output pixels. `crops` cut the status bar and pick the part of each
// capture that fits the frame: { [capture]: [top, height] }, always full width.
const DEVICES = [
  {
    name: 'iphone-6.9',
    captures: 'iphone',
    width: 1320,
    height: 2868,
    layout: {
      brandY: 108,
      brandSize: 35,
      barY: 201,
      titleY: 262,
      titleSize: 91,
      subY: 534,
      subSize: 33,
      frameY: 690,
      frameWidth: 1120,
      taglineY: 2690,
      taglineSize: 27,
    },
    crops: {
      '01-gameplay.png': [190, 2110],
      '02-connections.png': [190, 2110],
      '03-levels.png': [610, 2110],
      '04-complete.png': [190, 2110],
    },
  },
];

const escapeHtml = (text) =>
  text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const dataUri = (buffer) => `data:image/png;base64,${buffer.toString('base64')}`;

const renderHtml = (device, panel, background, shot) => {
  const { width, height, layout: l } = device;
  return `<!doctype html>
<html><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Karla:wght@500;700;800&display=block">
<style>
  * { margin: 0; box-sizing: border-box; }
  body {
    width: ${width}px; height: ${height}px; overflow: hidden; position: relative;
    background: #f6f5f0 url('${background}') center / cover no-repeat;
    font-family: 'Karla', sans-serif; text-align: center;
  }
  .abs { position: absolute; left: 0; right: 0; }
  .brand { top: ${l.brandY}px; font-size: ${l.brandSize}px; font-weight: 700;
    letter-spacing: ${l.brandSize * 0.29}px; color: #30392d; }
  .bar { top: ${l.barY}px; left: 50%; right: auto; width: ${l.brandSize * 2.2}px;
    height: ${l.brandSize * 0.23}px; margin-left: -${l.brandSize * 1.1}px;
    border-radius: 99px; background: #6aaa64; }
  .title { top: ${l.titleY}px; font-size: ${l.titleSize}px; font-weight: 800;
    line-height: 1.2; letter-spacing: -${l.titleSize * 0.02}px; color: #1a1a1b; }
  .title span { color: #4f784a; }
  .sub { top: ${l.subY}px; font-size: ${l.subSize}px; font-weight: 500; color: #50564c; }
  .frame { top: ${l.frameY}px; left: 50%; right: auto; transform: translateX(-50%);
    padding: ${l.frameWidth * 0.011}px; border-radius: ${l.frameWidth * 0.027}px; background: #fff;
    box-shadow: 0 ${l.frameWidth * 0.016}px ${l.frameWidth * 0.04}px rgba(25, 38, 28, 0.13); }
  .frame img { display: block; width: ${l.frameWidth}px; border-radius: ${l.frameWidth * 0.018}px; }
  .tagline { top: ${l.taglineY}px; font-size: ${l.taglineSize}px; font-weight: 500;
    letter-spacing: ${l.taglineSize * 0.22}px; color: #30392d; }
</style></head>
<body>
  <div class="abs brand">CROSSWORDLY</div>
  <div class="abs bar"></div>
  <div class="abs title">${escapeHtml(panel.title[0])}<br><span>${escapeHtml(panel.title[1])}</span></div>
  <div class="abs sub">${escapeHtml(panel.sub)}</div>
  <div class="abs frame"><img src="${shot}"></div>
  <div class="abs tagline">A FRESH FIT FOR WORD LOVERS</div>
</body></html>`;
};

const background = dataUri(await readFile(resolve(assets, 'background.png')));
// Playwright's own Chromium (`npx playwright install chromium`), else the installed Google Chrome
const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));

for (const device of DEVICES) {
  const outDir = resolve(assets, 'screenshots', device.name);
  await mkdir(outDir, { recursive: true });
  const page = await browser.newPage({
    viewport: { width: device.width, height: device.height },
    deviceScaleFactor: 1,
  });

  for (const panel of PANELS) {
    const capturePath = resolve(assets, 'captures', device.captures, panel.capture);
    if (!existsSync(capturePath)) {
      console.warn(`skipping ${device.name}/${panel.slug}: no ${capturePath}`);
      continue;
    }
    const [top, height] = device.crops[panel.capture];
    const capture = sharp(capturePath);
    const { width } = await capture.metadata();
    const shot = await capture.extract({ left: 0, top, width, height }).png().toBuffer();

    await page.setContent(renderHtml(device, panel, background, dataUri(shot)), {
      waitUntil: 'networkidle',
    });
    await page.evaluate(() => document.fonts.ready);

    // App Store Connect rejects screenshots with an alpha channel
    const outPath = resolve(outDir, `${panel.slug}.png`);
    await sharp(await page.screenshot({ type: 'png' }))
      .flatten({ background: '#f6f5f0' })
      .removeAlpha()
      .png()
      .toFile(outPath);
    console.log('wrote', outPath);
  }
  await page.close();
}

await browser.close();
