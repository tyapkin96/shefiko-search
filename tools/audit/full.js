const { chromium } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr9', { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' })).newPage();
  await p.goto('https://shefiko.ru/', { waitUntil: 'load', timeout: 90000 });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(250); }
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(1200);
  const blocks = await p.evaluate(() => [...document.querySelectorAll('.t-rec')].map(r => { const b = r.getBoundingClientRect(); return { id: r.id, y: Math.round(b.top + scrollY), h: Math.round(b.height), cls: (r.querySelector('[class^=t]') || {}).className ? String(r.querySelector('[class^=t]').className).split(' ')[0] : '', txt: (r.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80) }; }).filter(x => x.h > 30));
  fs.writeFileSync('hdr9/blocks.json', JSON.stringify({ h, blocks }, null, 1));
  await p.screenshot({ path: 'hdr9/full.png', fullPage: true });
  await b.close();
})();
