const { chromium } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr4', { recursive: true });
const cssFile = process.env.CSS || 'site/header/v3.css';
const css = fs.existsSync(cssFile) ? fs.readFileSync(cssFile, 'utf8') : '';
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const [name, url] of [['home', '/'], ['cat', '/catalog/syry']]) for (const w of [1440, 1280]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 }, locale: 'ru-RU' })).newPage();
    await p.goto('https://shefiko.ru' + url, { waitUntil: 'load', timeout: 90000 }); await p.waitForTimeout(2500);
    if (w === 1440) out[name] = await p.evaluate(() => { const rec = document.querySelector('#rec1656705211,#rec1656713361'); const r0 = rec.getBoundingClientRect(); return { rec: rec.id, h: Math.round(r0.height), els: [...rec.querySelectorAll('.tn-elem')].map(e => { const r = e.getBoundingClientRect(), a = e.querySelector('.tn-atom'), ar = a ? a.getBoundingClientRect() : r, cs = getComputedStyle(e); return { id: e.getAttribute('data-elem-id'), t: e.getAttribute('data-elem-type'), x: Math.round(r.left), y: Math.round(r.top - r0.top), w: Math.round(r.width), h: Math.round(r.height), ax: Math.round(ar.left), aw: Math.round(ar.width), ah: Math.round(ar.height), z: cs.zIndex, text: (e.innerText || '').trim().slice(0, 30) }; }) }; });
    if (css) { await p.addStyleTag({ content: css }); await p.waitForTimeout(700); }
    await p.screenshot({ path: `hdr4/${name}-${w}.jpg`, type: 'jpeg', quality: 85, clip: { x: 0, y: 0, width: w, height: 260 } });
    if (w === 1440) { // состояния наведения
      const t = await p.$('.t396__elem[data-elem-type="button"]:not([data-elem-id="1753355192457"]) .tn-atom'); if (t) { await t.hover(); await p.waitForTimeout(400); await p.screenshot({ path: `hdr4/${name}-hover.jpg`, type: 'jpeg', quality: 85, clip: { x: 0, y: 0, width: w, height: 160 } }); }
    }
    await p.close();
  }
  fs.writeFileSync('hdr4/geom.json', JSON.stringify(out, null, 1));
  await b.close();
})();
