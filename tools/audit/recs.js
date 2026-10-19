const { chromium } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr7', { recursive: true });
(async () => {
  const b = await chromium.launch(); const out = {};
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' })).newPage();
  const reqs = []; p.on('response', r => { const u = r.url(); if (/\.css|shefiko\.ru\/?(catalog)?$/.test(u) && u.includes('shefiko.ru') || /tilda.*\.css/.test(u)) reqs.push(r.status() + ' ' + u.slice(0, 120)); });
  await p.goto('https://shefiko.ru/', { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(2500);
  const info = () => p.evaluate(() => { const rec = document.querySelector('#rec1656705211,#rec1656713361'); const e = document.querySelector('.t396__elem[data-elem-id="1753355192457"]'); const nav = rec && rec.querySelector('.t396__elem[data-elem-type="button"] .tn-atom'); const cs = nav ? getComputedStyle(nav) : null; return { url: location.href, title: document.title, rec: rec && rec.id, varW: rec ? getComputedStyle(rec).getPropertyValue('--sf-nav-w') : null, navPos: cs && cs.position, navBg: cs && cs.backgroundColor, sheets: [...document.styleSheets].map(s => { try { return (s.href || 'inline').slice(-60) + ':' + [...s.cssRules].some(r => r.cssText.includes('--sf-nav-w')); } catch (x) { return 'x'; } }), btnHref: e && (e.querySelector('a') ? e.querySelector('a').getAttribute('href') : 'nolink') }; });
  out.home = await info();
  await p.click('.t396__elem[data-elem-id="1753355192457"] .tn-atom'); await p.waitForTimeout(3500);
  out.afterClick = await info();
  await p.screenshot({ path: 'hdr7/afterclick.jpg', type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 1440, height: 400 } });
  out.reqs = reqs;
  fs.writeFileSync('hdr7/recs.json', JSON.stringify(out, null, 1)); await b.close();
})();
