const { chromium } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr10', { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' })).newPage();
  await p.goto('https://shefiko.ru/', { waitUntil: 'load', timeout: 90000 });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(250); }
  await p.waitForTimeout(1000);
  const recs = ['rec1181746166', 'rec1181767201', 'rec1181862091', 'rec4276894201', 'rec1181903041', 'rec1181939976', 'rec1181960346', 'rec1182124861', 'rec1182129806', 'rec1182263836'];
  const out = await p.evaluate(recs => recs.map(id => { const r = document.getElementById(id); const r0 = r.getBoundingClientRect(); const ab = r.querySelector('.t396__artboard'); return { id, h: Math.round(r0.height), artBg: ab ? getComputedStyle(ab).backgroundColor : null, els: [...r.querySelectorAll('.tn-elem')].map(e => { const b = e.getBoundingClientRect(), a = e.querySelector('.tn-atom'), cs = a ? getComputedStyle(a) : {}; return { id: e.getAttribute('data-elem-id'), t: e.getAttribute('data-elem-type'), x: Math.round(b.left), y: Math.round(b.top - r0.top), w: Math.round(b.width), h: Math.round(b.height), txt: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 28), bg: cs.backgroundColor, bgi: (cs.backgroundImage || '').slice(0, 30), br: cs.borderRadius, bd: cs.border && cs.border.slice(0, 30), c: cs.color, fs: cs.fontSize, ff: (cs.fontFamily || '').slice(0, 16) }; }) }; }), recs);
  const brands = await p.evaluate(() => { const r = document.getElementById('rec4276894201'); return { html: r.innerHTML.replace(/\s+/g, ' ').slice(0, 2500), imgs: [...r.querySelectorAll('img')].map(i => ({ src: (i.currentSrc || i.src).slice(-50), w: i.naturalWidth, h: i.naturalHeight, rw: Math.round(i.getBoundingClientRect().width), rh: Math.round(i.getBoundingClientRect().height) })) }; });
  const faq = await p.evaluate(() => { const r = document.getElementById('rec1182129806'); return { html: r.innerHTML.replace(/\s+/g, ' ').slice(0, 1200), cls: [...r.querySelectorAll('[class]')].slice(0, 12).map(e => e.className.slice(0, 60)) }; });
  fs.writeFileSync('hdr10/blocks.json', JSON.stringify({ out, brands, faq }, null, 1));
  await b.close();
})();
