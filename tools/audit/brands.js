const { chromium } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr12', { recursive: true });
const css = fs.readFileSync('site/blocks/v1.css', 'utf8');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' })).newPage();
  await p.goto('https://shefiko.ru/', { waitUntil: 'load', timeout: 90000 }); await p.waitForTimeout(1500);
  const shot = async tag => { await p.evaluate(() => document.getElementById('rec4276894201').scrollIntoView({ block: 'start' })); await p.evaluate(() => window.scrollBy(0, -120)); await p.waitForTimeout(3500); await p.screenshot({ path: `hdr12/brands-${tag}.png` }); };
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(200); }
  await shot('before'); await p.addStyleTag({ content: css }); await p.waitForTimeout(800); await shot('after');
  try { const bx = await p.evaluate(() => { const l = [...document.querySelectorAll('.shefiko-brand')].find(e => { const r = e.getBoundingClientRect(); return r.left > 500 && r.left < 900 && r.top > 0 && r.top < 900; }); if (!l) return null; const r = l.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); if (bx) { await p.mouse.move(bx.x, bx.y); await p.waitForTimeout(600); await p.screenshot({ path: 'hdr12/brands-hover.png' }); } } catch (e) {}
  await b.close();
})();
