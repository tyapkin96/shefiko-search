const { chromium, devices } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr8', { recursive: true });
const css = fs.readFileSync('site/header/v3.css', 'utf8'); const res = {};
(async () => {
  const b = await chromium.launch();
  for (const [name, url] of [['home', '/'], ['cat', '/catalog/myaso-i-ptitsa']]) for (const mode of ['before', 'after']) {
    const ctx = await b.newContext({ ...devices['iPhone 14'], locale: 'ru-RU' }); const p = await ctx.newPage();
    await p.route(/custom\.css/, async r => { const resp = await r.fetch(); let t = await resp.text(); const k = t.indexOf('ШЕФиКО · шапка v3'); if (k > -1) t = t.slice(0, k); await r.fulfill({ response: resp, body: t }); });
    await p.goto('https://shefiko.ru' + url, { waitUntil: 'load', timeout: 90000 }); await p.waitForTimeout(2500);
    if (mode === 'after') { await p.addStyleTag({ content: css }); await p.waitForTimeout(600); }
    res[name + '-' + mode] = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    await p.screenshot({ path: `hdr8/${name}-${mode}.jpg`, type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 390, height: 260 } });
    await ctx.close();
  }
  // планшет 1024
  const t = await (await b.newContext({ viewport: { width: 1024, height: 768 }, locale: 'ru-RU' })).newPage();
  await t.route(/custom\.css/, async r => { const resp = await r.fetch(); let x = await resp.text(); const k = x.indexOf('ШЕФиКО · шапка v3'); if (k > -1) x = x.slice(0, k); await r.fulfill({ response: resp, body: x }); });
  await t.goto('https://shefiko.ru/', { waitUntil: 'load', timeout: 90000 }); await t.waitForTimeout(2500); await t.addStyleTag({ content: css }); await t.waitForTimeout(600);
  await t.screenshot({ path: 'hdr8/tablet-1024.jpg', type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 1024, height: 260 } });
  fs.writeFileSync('hdr8/res.json', JSON.stringify(res)); await b.close();
})();
