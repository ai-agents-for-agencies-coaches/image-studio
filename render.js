#!/usr/bin/env node
/**
 * image-studio renderer
 * Renders an HTML file to a high-DPI PNG using headless Chromium.
 *
 * Usage:
 *   node render.js --input design.html --output out.png \
 *     [--width 1080] [--height 1080] [--scale 2] [--full-page] \
 *     [--selector "#card"] [--quality 100] [--format png|jpeg]
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);

  if (!args.input || !args.output) {
    console.error('Usage: node render.js --input <html> --output <png> [--width N] [--height N] [--scale N] [--full-page] [--selector "..."] [--format png|jpeg] [--quality 100]');
    process.exit(1);
  }

  const inputPath = path.resolve(args.input);
  const outputPath = path.resolve(args.output);

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const width = parseInt(args.width || '1080', 10);
  const height = parseInt(args.height || '1080', 10);
  const scale = parseFloat(args.scale || '2');
  const fullPage = !!args['full-page'];
  const selector = args.selector || null;
  const format = (args.format || 'png').toLowerCase();
  const quality = parseInt(args.quality || '100', 10);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
  });
  const page = await context.newPage();

  await page.goto('file://' + inputPath, { waitUntil: 'networkidle' });

  // Wait for web fonts and any pending async work
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const screenshotOpts = {
    path: outputPath,
    type: format === 'jpeg' || format === 'jpg' ? 'jpeg' : 'png',
    omitBackground: false,
  };
  if (screenshotOpts.type === 'jpeg') screenshotOpts.quality = quality;

  if (selector) {
    const el = await page.locator(selector).first();
    await el.screenshot(screenshotOpts);
  } else if (fullPage) {
    await page.screenshot({ ...screenshotOpts, fullPage: true });
  } else {
    await page.screenshot({ ...screenshotOpts, clip: { x: 0, y: 0, width, height } });
  }

  await browser.close();

  const stat = fs.statSync(outputPath);
  console.log(`Rendered ${outputPath} (${width}x${height} @${scale}x, ${(stat.size / 1024).toFixed(1)} KB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
