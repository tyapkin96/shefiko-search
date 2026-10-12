const { chromium } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr3', { recursive: true });
const css = n => fs.readFileSync(`site/header/${n}.css`, 'utf8');
(async () => {
  const b = await chromium.launch();
  for (const skin of ['glass', 'white']) for (const [name, url] of [['home', '/'], ['cat', '/catalog/syry']]) for (const w of [1440, 1280]) {
    if (w === 1280 && skin === 'white') continue;
    const p = await (await b.newContext({ viewport: { width: w, height: 900 }, locale: 'ru-RU' })).newPage();
    await p.goto('https://shefiko.ru' + url, { waitUntil: 'load', timeout: 90000 }); await p.waitForTimeout(2500);
    await p.addStyleTag({ content: css('base') + css(skin) }); await p.waitForTimeout(600);
    await p.screenshot({ path: `hdr3/${skin}-${name}-${w}.jpg`, type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: w, height: 330 } });
    if (name === 'home' && w === 1440) {
      // демонстрация шестого пункта меню
      await p.evaluate(() => { const rec = document.querySelector('#rec1656705211'); const els = [...rec.querySelectorAll('.t396__elem[data-elem-type="button"]')].filter(e => /^(О компании|Каталог продукции|Доставка и оплата|Контакты|Регистрация)$/.test(e.innerText.trim())); els.forEach(e => { e.style.left = (parseFloat(e.style.left) - 78) + 'px'; }); const last = els[els.length - 1]; const c = last.cloneNode(true); c.style.left = (parseFloat(last.style.left) + 118) + 'px'; const a = c.querySelector('.tn-atom'); (a.querySelector('.tn-atom__text') || a).innerText = 'Полезное'; last.parentNode.appendChild(c); });
      await p.waitForTimeout(300);
      await p.screenshot({ path: `hdr3/${skin}-home-6items.jpg`, type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: w, height: 200 } });
    }
    await p.close();
  }
  await b.close();
})();
