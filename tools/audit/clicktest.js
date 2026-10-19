const { chromium } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr5', { recursive: true });
const css = fs.readFileSync('site/header/v3.css', 'utf8');
const probe = () => { const rec = document.querySelector('#rec1656705211,#rec1656713361'); return [...rec.querySelectorAll('.tn-elem')].filter(e => e.getBoundingClientRect().width > 0 && e.getAttribute('data-elem-type') !== 'html').map(e => { const r = e.getBoundingClientRect(); const pts = [[.5,.5],[.15,.5],[.85,.5]].map(([a,b]) => { const el = document.elementFromPoint(r.left + r.width*a, r.top + r.height*b); const el2 = el && el.closest('.tn-elem'); const link = el && el.closest('a[href]'); return (el2 ? el2.getAttribute('data-elem-id') : '-') + '|' + (link ? link.getAttribute('href') : ''); }); return { id: e.getAttribute('data-elem-id'), text: (e.innerText||'').trim().slice(0,18), pts }; }); };
(async () => {
  const b = await chromium.launch(); const res = {};
  for (const [name, url] of [['home', '/'], ['cat', '/catalog/syry']]) {
    const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' })).newPage();
    await p.goto('https://shefiko.ru' + url, { waitUntil: 'load', timeout: 90000 }); await p.waitForTimeout(2500);
    const before = await p.evaluate(probe);
    await p.addStyleTag({ content: css }); await p.waitForTimeout(700);
    const after = await p.evaluate(probe);
    res[name] = before.map((x, i) => ({ id: x.id, text: x.text, same: JSON.stringify(x.pts) === JSON.stringify(after[i].pts), before: x.pts, after: after[i].pts }));
    // реальный клик по меню с новым CSS
    if (name === 'home') { const el = await p.$('text=Контакты'); const [nav] = await Promise.all([p.waitForNavigation({ timeout: 15000 }).catch(() => null), el && el.click()]); res.click_contacts = p.url(); }
    await p.close();
  }
  fs.writeFileSync('hdr5/click.json', JSON.stringify(res, null, 1)); await b.close();
})();
