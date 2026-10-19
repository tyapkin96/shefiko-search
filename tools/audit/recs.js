const { chromium } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr7', { recursive: true });
(async () => {
  const b = await chromium.launch(); const out = {};
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' })).newPage();
  const info = () => p.evaluate(() => { const rec = document.querySelector('#rec1656705211,#rec1656713361'); const nav = rec && rec.querySelector('.t396__elem[data-elem-type="button"] .tn-atom'); const cs = nav ? getComputedStyle(nav) : null; const s = document.querySelector('.t396__elem[data-elem-id="1753355192462"] .tn-atom'); return { url: location.href, title: document.title, rec: rec && rec.id, varW: rec ? getComputedStyle(rec).getPropertyValue('--sf-nav-w') : null, navPos: cs && cs.position, searchBg: s && getComputedStyle(s).backgroundColor, css: [...document.querySelectorAll('link[rel=stylesheet]')].map(l => l.href).filter(h => /custom/.test(h)) }; });
  await p.goto('https://shefiko.ru/', { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(2500);
  out.home = await info();
  const t = p.locator('#rec1656705211 .t396__elem[data-elem-type="button"]', { hasText: 'Каталог продукции' }).first();
  await Promise.all([p.waitForNavigation({ waitUntil: 'load', timeout: 30000 }).catch(e => out.navErr = String(e).slice(0, 80)), t.click()]);
  await p.waitForTimeout(3000);
  out.afterNav = await info();
  await p.screenshot({ path: 'hdr7/nav-catalog.jpg', type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 1440, height: 400 } });
  // второй переход: со страницы раздела
  await p.goto('https://shefiko.ru/catalog/syry', { waitUntil: 'load' }); await p.waitForTimeout(2000);
  const t2 = p.locator('#rec1656713361 .t396__elem[data-elem-type="button"]', { hasText: 'Каталог продукции' }).first();
  await Promise.all([p.waitForNavigation({ waitUntil: 'load', timeout: 30000 }).catch(e => out.navErr2 = String(e).slice(0, 80)), t2.click()]);
  await p.waitForTimeout(3000); out.afterNav2 = await info();
  await p.screenshot({ path: 'hdr7/nav-catalog2.jpg', type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 1440, height: 400 } });
  fs.writeFileSync('hdr7/recs.json', JSON.stringify(out, null, 1)); await b.close();
})();
