const { chromium } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr', { recursive: true });
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' });
  const p = await ctx.newPage();
  const out = {};
  await p.goto('https://shefiko.ru/', { waitUntil: 'load', timeout: 90000 }); await p.waitForTimeout(2500);
  const info = await p.evaluate(() => {
    const rec = document.querySelector('#rec1656705211'); if (!rec) return null;
    const r0 = rec.getBoundingClientRect();
    const els = [...rec.querySelectorAll('.tn-elem')].map(e => {
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e), a = e.querySelector('.tn-atom'), ac = a ? getComputedStyle(a) : {};
      const link = e.querySelector('a[href]') || (e.tagName === 'A' ? e : null);
      return { cls: e.className.replace(/\s+/g, ' ').slice(0, 120), id: e.getAttribute('data-elem-id'), type: e.getAttribute('data-elem-type'), x: Math.round(r.left), y: Math.round(r.top - r0.top), w: Math.round(r.width), h: Math.round(r.height), z: cs.zIndex, text: (e.innerText || '').trim().slice(0, 40), href: link ? link.getAttribute('href') : null, bg: ac.backgroundColor, color: ac.color, radius: ac.borderRadius, border: ac.border, fs: ac.fontSize, ff: (ac.fontFamily || '').slice(0, 30) };
    });
    const art = rec.querySelector('.t396__artboard'); const ab = art.getBoundingClientRect();
    return { recH: Math.round(r0.height), artH: Math.round(ab.height), artPos: getComputedStyle(art).position, artZ: getComputedStyle(art).zIndex, els, recStyle: getComputedStyle(rec).position, headerFixed: getComputedStyle(rec).position, tn: rec.className };
  });
  out.home = info;
  const hrefs = [...new Set((info.els || []).map(e => e.href).filter(h => h && !h.startsWith('#') && !h.startsWith('tel') && !h.startsWith('mailto')))];
  out.hrefs = hrefs;
  const pages = ['/', '/catalog/syry', ...hrefs].filter((v, i, a) => a.indexOf(v) === i).slice(0, 8);
  let k = 0;
  for (const u of pages) {
    try {
      await p.goto(new URL(u, 'https://shefiko.ru/').href, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(2000);
      const bg = await p.evaluate(() => { const rec = document.querySelector('#rec1656705211'); if (!rec) return null; const r = rec.getBoundingClientRect(); const x = document.elementsFromPoint(300, 40).map(e => getComputedStyle(e).backgroundColor).filter(c => c !== 'rgba(0, 0, 0, 0)').slice(0, 3); return { hasHeader: true, bgUnder: x, bodyBg: getComputedStyle(document.body).backgroundColor, title: document.title }; });
      out['p' + k] = { u, bg };
      await p.screenshot({ path: `hdr/p${k}.jpg`, type: 'jpeg', quality: 75, clip: { x: 0, y: 0, width: 1440, height: 260 } });
      k++;
    } catch (e) { out['p' + k] = { u, err: String(e).slice(0, 100) }; k++; }
  }
  fs.writeFileSync('hdr/info.json', JSON.stringify(out, null, 1));
  await b.close();
})();
