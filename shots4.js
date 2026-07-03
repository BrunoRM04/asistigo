const puppeteer = require('puppeteer-core');
const EDGE_PATH = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe';

async function run() {
  const browser = await puppeteer.launch({ executablePath: EDGE_PATH, headless: 'new' });
  for (const width of [768, 1024, 1194, 1280, 1440]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 800 });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 300));
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    console.log(`width=${width}`, JSON.stringify(metrics));
    await page.close();
  }
  await browser.close();
}
run().catch((e) => { console.error(e); process.exit(1); });
