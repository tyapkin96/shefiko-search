const { chromium } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr7', { recursive: true });
(async () => {
  const b = await chromium.launch(); const out = {};
  const urls = ['/', '/catalog', '/catalog/', '/catalog/myaso-i-ptitsa', '/catalog/syry', '/privacy'];
  for (const u of urls) {
    const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' })).newPage();
    const res = await p.goto('https://shefiko.ru' + u, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(2500);
    const html = await res.text();
    out[u] = { status: res.status(), url: p.url(), v3inHtml: html.includes('--sf-nav-w'), widgetDark: html.includes('t-search-widget__close-icon'), searchTheme: html.includes('sf-home') || html.includes('t838__input'), len: html.length,
      lastMod: res.headers()['last-modified'] || null, cache: res.headers()['cache-control'] || null,
      v3inDom: await p.evaluate(() => [...document.styleSheets].some(s => { try { return [...s.cssRules].some(r => r.cssText.includes('--sf-nav-w')); } catch (e) { return false; } })),
      headerRec: await p.evaluate(() => { const e = document.querySelector('.t396__elem[data-elem-id="1753355192457"]'); return e ? e.closest('.t-rec').id : null; }) };
    if (u === '/catalog') await p.screenshot({ path: 'hdr7/catalog.jpg', type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 1440, height: 260 } });
    await p.close();
  }
  fs.writeFileSync('hdr7/recs.json', JSON.stringify(out, null, 1)); await b.close();
})();
