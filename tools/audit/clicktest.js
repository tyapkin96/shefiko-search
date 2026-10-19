const { chromium } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr5', { recursive: true });
const css = fs.readFileSync('site/header/v3.css', 'utf8');
const stack = () => { const d = x => [...document.elementsFromPoint(x, 97)].slice(0, 6).map(e => e.tagName + '.' + String(e.className).slice(0, 40) + (e.closest('.tn-elem') ? '#' + e.closest('.tn-elem').getAttribute('data-elem-id') : '') + (e.closest('a[href]') ? '→' + e.closest('a[href]').getAttribute('href') : '')); return { cart: d(1130), cartIcon: d(1062), acct: d(1268) }; };
(async () => {
  const b = await chromium.launch(); const res = {};
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' })).newPage();
  await p.goto('https://shefiko.ru/', { waitUntil: 'load', timeout: 90000 }); await p.waitForTimeout(2500);
  res.before = await p.evaluate(stack);
  await p.addStyleTag({ content: css }); await p.waitForTimeout(700);
  res.after = await p.evaluate(stack);
  res.outer = await p.evaluate(() => { const e = document.elementFromPoint(1130, 97); const o = []; for (let n = e; n && n !== document.body; n = n.parentElement) o.push(n.tagName + '#' + n.id + '.' + String(n.className).slice(0, 30)); return o; });
  fs.writeFileSync('hdr5/click.json', JSON.stringify(res, null, 1)); await b.close();
})();
