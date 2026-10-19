const { chromium, devices } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr14', { recursive: true });
const html = fs.readFileSync('site/blocks/offer.html', 'utf8');
const inject = html => { const rec = document.getElementById('rec1181960346'); const d = document.createElement('div'); d.id = 'sf-offer-mount'; d.innerHTML = html; rec.style.display = 'none'; rec.parentNode.insertBefore(d, rec); const s = d.querySelectorAll('script'); s.forEach(o => { const n = document.createElement('script'); n.text = o.text; o.replaceWith(n); }); d.style.padding = '60px 0'; return true; };
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const [name, ctxOpts] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['mobile', { ...devices['iPhone 14'] }], ['tablet', { viewport: { width: 900, height: 900 } }]]) {
    const p = await (await b.newContext({ ...ctxOpts, locale: 'ru-RU' })).newPage();
    await p.goto('https://shefiko.ru/', { waitUntil: 'load', timeout: 90000 });
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 500) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(150); }
    await p.waitForTimeout(600);
    if (name === 'desktop') { const r = await p.evaluate(() => { const e = document.getElementById('rec1181960346').getBoundingClientRect(); return { y: e.top + scrollY, h: e.height }; }); await p.screenshot({ path: 'hdr14/before-desktop.png', fullPage: true, clip: { x: 0, y: r.y, width: 1440, height: r.h } }); }
    await p.evaluate(inject, html); await p.waitForTimeout(1500);
    const m = await p.evaluate(() => { const e = document.getElementById('sf-offer-mount'); const r = e.getBoundingClientRect(); return { y: r.top + scrollY, h: r.height, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }; });
    out[name] = m;
    await p.screenshot({ path: `hdr14/after-${name}.png`, fullPage: true, clip: { x: 0, y: m.y, width: ctxOpts.viewport ? ctxOpts.viewport.width : 390, height: m.h } });
    if (name === 'desktop') { await p.evaluate(() => document.getElementById('sf-offer-mount').scrollIntoView({ block: 'center' })); await p.click('.sf-offer__btn'); await p.waitForTimeout(1500); out.popup = await p.evaluate(() => { const pop = document.querySelector('.t-popup[data-tooltip-hook="#form"]'); return { shown: pop && pop.classList.contains('t-popup_show'), disp: pop && getComputedStyle(pop).display, hasFn: typeof t390_showPopup }; }); await p.screenshot({ path: 'hdr14/after-popup.png' }); await p.keyboard.press('Escape'); await p.evaluate(() => { const c = document.querySelector('.t-popup_show .t-popup__close'); if (c) c.click(); }); await p.waitForTimeout(500); await p.evaluate(() => document.getElementById('sf-offer-mount').scrollIntoView({ block: 'center' })); await p.context().grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {}); await p.click('.sf-offer__tel', { force: true }); await p.waitForTimeout(600); out.copied = await p.evaluate(() => ({ cls: document.querySelector('.sf-offer__tel').className, hash: location.href })); await p.screenshot({ path: 'hdr14/after-copied.png' }); }
    await p.close();
  }
  fs.writeFileSync('hdr14/res.json', JSON.stringify(out, null, 1)); await b.close();
})();
