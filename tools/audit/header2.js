const { chromium } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr2', { recursive: true });
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' })).newPage();
  const out = {};
  for (const u of ['/catalog', '/catalog/syry', '/catalog/molochnaya-gastronomiya']) {
    await p.goto('https://shefiko.ru' + u, { waitUntil: 'load', timeout: 90000 }); await p.waitForTimeout(2500);
    out[u] = await p.evaluate(() => {
      const recs = [...document.querySelectorAll('.t-rec')].filter(r => /Каталог продукции/.test(r.innerText || '') && r.querySelector('.tn-elem'));
      return recs.slice(0, 3).map(rec => {
        const r0 = rec.getBoundingClientRect(), art = rec.querySelector('.t396__artboard');
        return { id: rec.id, top: Math.round(r0.top + scrollY), h: Math.round(r0.height), artBg: art ? getComputedStyle(art).backgroundColor : null, els: [...rec.querySelectorAll('.tn-elem')].map(e => { const r = e.getBoundingClientRect(), a = e.querySelector('.tn-atom'), ac = a ? getComputedStyle(a) : {}; const link = e.querySelector('a[href]') || (e.tagName === 'A' ? e : null); return { id: e.getAttribute('data-elem-id'), type: e.getAttribute('data-elem-type'), x: Math.round(r.left), y: Math.round(r.top + scrollY - r0.top - scrollY), w: Math.round(r.width), h: Math.round(r.height), text: (e.innerText || '').trim().slice(0, 30), href: link ? link.getAttribute('href') : null, bg: ac.backgroundColor, color: ac.color, border: ac.border, radius: ac.borderRadius, fs: ac.fontSize }; }) };
      });
    });
    out[u + '#fixed'] = await p.evaluate(() => [...document.querySelectorAll('.t-rec')].filter(r => getComputedStyle(r).position === 'fixed' || r.getAttribute('data-bg-color') || (r.querySelector('.t396__artboard') && r.querySelector('.t396__artboard').getAttribute('data-artboard-fixed'))).slice(0, 5).map(r => r.id));
    await p.screenshot({ path: 'hdr2/' + u.replace(/\W+/g, '_') + '.jpg', type: 'jpeg', quality: 70, clip: { x: 0, y: 0, width: 1440, height: 200 } });
  }
  fs.writeFileSync('hdr2/info.json', JSON.stringify(out, null, 1));
  await b.close();
})();
