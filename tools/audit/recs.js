const { chromium } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr7', { recursive: true });
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' });
  const p = await ctx.newPage(); const out = {};
  const probe = () => { const found = {}; document.querySelectorAll('.t396__elem[data-elem-id="1753355192457"], .t396__elem[data-elem-id="1753355192462"], .t396__elem[data-elem-id="1753355192551"]').forEach(e => { const r = e.closest('.t-rec'); if (r) found[r.id] = (found[r.id] || 0) + 1; });
    const navs = {}; document.querySelectorAll('.t396__elem[data-elem-type="button"]').forEach(e => { const t = (e.innerText || '').trim(); if (/^(О компании|Каталог продукции|Контакты)$/.test(t)) { const r = e.closest('.t-rec'); if (r) { navs[r.id] = navs[r.id] || []; navs[r.id].push(e.getAttribute('data-elem-id')); } } });
    return { found, navs }; };
  const seen = new Set(); const queue = ['/', '/catalog'];
  await p.goto('https://shefiko.ru/', { waitUntil: 'load', timeout: 90000 }); await p.waitForTimeout(2000);
  const links = await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => h && h.startsWith('/') && !h.startsWith('//') && !h.includes('tproduct')).map(h => h.split('#')[0]).filter(h => h && h.length > 1))]);
  for (const l of links) queue.push(l);
  await p.goto('https://shefiko.ru/catalog', { waitUntil: 'load', timeout: 90000 }); await p.waitForTimeout(2000);
  const cl = await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => h && h.startsWith('/catalog') && !h.includes('tproduct')).map(h => h.split('#')[0]))]);
  for (const l of cl.slice(0, 12)) queue.push(l);
  for (const u of queue) { if (seen.has(u) || seen.size > 40) continue; seen.add(u);
    try { await p.goto('https://shefiko.ru' + u, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(1500); out[u] = await p.evaluate(probe); } catch (e) { out[u] = 'ERR ' + e.message.slice(0, 60); } }
  fs.writeFileSync('hdr7/recs.json', JSON.stringify(out, null, 1)); await b.close();
})();
