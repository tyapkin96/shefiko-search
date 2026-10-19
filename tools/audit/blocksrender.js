const { chromium } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr11', { recursive: true });
const css = fs.readFileSync('site/blocks/v2.css', 'utf8');
const groups = { a_cards: ['rec1181746166'], b_cat: ['rec1181767201', 'rec1181862091'], c_brands: ['rec4276894201', 'rec1181903041'], d_benefits: ['rec1181939976'], e_faq: ['rec1182124861', 'rec1182129806'] };
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' })).newPage();
  await p.goto('https://shefiko.ru/', { waitUntil: 'load', timeout: 90000 });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(250); }
  await p.evaluate(() => { const c = document.querySelector('[class*=cookie],#tilda-cookie'); }); await p.waitForTimeout(800);
  const shot = async tag => { for (const [k, ids] of Object.entries(groups)) { const r = await p.evaluate(ids => { const a = document.getElementById(ids[0]).getBoundingClientRect(), z = document.getElementById(ids[ids.length - 1]).getBoundingClientRect(); return { y: a.top + scrollY, h: z.bottom - a.top }; }, ids); await p.screenshot({ path: `hdr11/${k}-${tag}.png`, fullPage: true, clip: { x: 0, y: r.y, width: 1440, height: Math.min(r.h, 1300) } }); } };
  await shot('before'); await p.addStyleTag({ content: css }); await p.waitForTimeout(800); await shot('after');
  await b.close();
})();
