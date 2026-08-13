// Render each diagram SVG to high-res PNG via system Chrome.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DIR = 'D:/dev/pro_digitalvillages/build/diagrams';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.join(DIR, 'png');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.svg')).sort();
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--force-color-profile=srgb'],
  });
  let done = 0;
  for (const f of files) {
    const svg = fs.readFileSync(path.join(DIR, f), 'utf-8');
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#fff}svg{display:block}</style></head><body>${svg}</body></html>`;
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'load', timeout: 15000 });
    await new Promise(r => setTimeout(r, 250));
    const outName = f.replace('.svg', '.png');
    await page.screenshot({ path: path.join(OUT, outName), fullPage: true, type: 'png' });
    await page.close();
    done++;
  }
  await browser.close();
  console.log('PNG_DONE', done);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
