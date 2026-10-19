const { chromium } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr13', { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' })).newPage();
  await p.goto('https://shefiko.ru/', { waitUntil: 'load', timeout: 90000 });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(200); }
  await p.waitForTimeout(800);
  const d = await p.evaluate(() => {
    const r = document.getElementById('rec1181960346');
    const els = [...r.querySelectorAll('.tn-elem')].map(e => { const a = e.querySelector('.tn-atom'), cs = a ? getComputedStyle(a) : {}; const lk = e.querySelector('a[href]') || (e.tagName === 'A' ? e : null); return { id: e.getAttribute('data-elem-id'), t: e.getAttribute('data-elem-type'), href: lk && lk.getAttribute('href'), ff: cs.fontFamily, fw: cs.fontWeight, fs: cs.fontSize, lh: cs.lineHeight, c: cs.color, bgi: (cs.backgroundImage || '').slice(0, 200), bg: cs.backgroundColor, br: cs.borderRadius, txt: (e.innerText || '').slice(0, 60), attrs: [...(a ? a.attributes : [])].map(x => x.name + '=' + x.value.slice(0, 60)).filter(s => !s.startsWith('class') && !s.startsWith('style')) }; });
    const popups = [...document.querySelectorAll('a[href*="#popup"],a[href*="#order"],[data-tooltip-hook]')].slice(0, 12).map(a => ({ href: a.getAttribute('href'), hook: a.getAttribute('data-tooltip-hook'), txt: (a.innerText || '').slice(0, 30) }));
    const forms = [...document.querySelectorAll('.t-popup,.t-form')].slice(0, 8).map(x => ({ cls: String(x.className).slice(0, 50), id: x.id || '', hook: x.getAttribute('data-tooltip-hook') }));
    return { els, popups, forms, bodyFont: getComputedStyle(document.body).fontFamily, heading: (() => { const e = document.querySelector('#rec1181960346 .t396__elem[data-elem-id="1753347315152"] .tn-atom'); return e ? e.outerHTML.slice(0, 600) : null; })() };
  });
  fs.writeFileSync('hdr13/offer.json', JSON.stringify(d, null, 1));
  await b.close();
})();
