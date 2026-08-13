// -*- coding: utf-8 -*-
// Screenshot all html prototypes full-page using puppeteer + system Chrome.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = 'D:/dev/pro_digitalvillages';
const HTML_DIR = path.join(ROOT, 'html');
const OUT_DIR = path.join(ROOT, 'build', 'screenshots');
fs.mkdirSync(OUT_DIR, { recursive: true });

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const VIEWPORT = {
  admin:    { width: 1440, height: 960,  scale: 1 },
  dashboard:{ width: 1920, height: 1080, scale: 1 },
  villager: { width: 420,  height: 896,  scale: 2 },
  cadre:    { width: 420,  height: 896,  scale: 2 },
  shared:   { width: 1440, height: 960,  scale: 1 },
};

function deviceOf(rel) {
  if (rel.includes('admin')) return 'admin';
  if (rel.includes('dashboard')) return 'dashboard';
  if (rel.includes('villager')) return 'villager';
  if (rel.includes('cadre')) return 'cadre';
  if (rel.includes('shared')) return 'shared';
  return 'admin';
}

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
}

function shotName(rel) {
  return rel.replace(/^html[\\/]/, '').replace(/[\\/]/g, '_').replace('.html', '.png');
}

(async () => {
  const files = [];
  walk(HTML_DIR, files);
  console.log('TOTAL HTML:', files.length);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
           '--disable-gpu', '--force-color-profile=srgb'],
  });

  let done = 0, skip = 0;
  for (const f of files.sort()) {
    const rel = path.relative(ROOT, f).split(path.sep).join('/');
    const dev = deviceOf(rel);
    const vp = VIEWPORT[dev];
    const outName = shotName(rel);
    const outPath = path.join(OUT_DIR, outName);
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.scale });
    try {
      await page.goto('file://' + f, { waitUntil: 'load', timeout: 8000 });
    } catch (e) {
      // CDN/asset may be slow or offline; DOM is still rendered, proceed.
    }
    // give charts / lazy content a moment
    await new Promise(r => setTimeout(r, 1500));
    // ensure white background
    await page.evaluate(() => {
      document.documentElement.style.background = '#ffffff';
      if (document.body) document.body.style.background = '#ffffff';
    });
    try {
      await page.screenshot({ path: outPath, fullPage: true, type: 'png' });
      done++;
    } catch (e) {
      // fallback: viewport screenshot
      try {
        await page.screenshot({ path: outPath, type: 'png' });
        done++;
      } catch (e2) {
        skip++;
        console.log('FAIL', rel, e2.message);
      }
    }
    await page.close();
  }
  await browser.close();
  console.log('SCREENSHOTS_DONE', done, 'SKIP', skip);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
