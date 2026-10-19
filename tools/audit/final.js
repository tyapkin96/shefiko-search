const { chromium } = require('playwright'); const fs = require('fs');
fs.mkdirSync('hdr6', { recursive: true });
const css = fs.readFileSync('site/header/v3.css', 'utf8');
(async () => {
  const b = await chromium.launch();
  const pages = [['home', '/'], ['cat', '/catalog/syry'], ['about', '/#about']];
  for (const [name, url] of pages) {
    const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' })).newPage();
    await p.goto('https://shefiko.ru' + url, { waitUntil: 'load', timeout: 90000 }); await p.waitForTimeout(2500);
    await p.addStyleTag({ content: css }); await p.waitForTimeout(600);
    if (name !== 'about') {
      await p.screenshot({ path: `hdr6/${name}.jpg`, type: 'jpeg', quality: 85, clip: { x: 0, y: 0, width: 1440, height: 200 } });
      const inp = await p.$('.t838__input'); if (inp) { await inp.click(); await p.keyboard.type('соль', { delay: 80 }); await p.waitForTimeout(1500); await p.screenshot({ path: `hdr6/${name}-search.jpg`, type: 'jpeg', quality: 85, clip: { x: 0, y: 0, width: 1440, height: 560 } }); }
    }
    if (name === 'cat') { // страница товара
      const href = await p.evaluate(() => { const a = document.querySelector('a[href*="/tproduct/"]'); return a && a.getAttribute('href'); });
      if (href) { const q = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); await q.goto(href.startsWith('http') ? href : 'https://shefiko.ru' + href, { waitUntil: 'load', timeout: 90000 }); await q.waitForTimeout(2500); await q.addStyleTag({ content: css }); await q.waitForTimeout(600); await q.screenshot({ path: 'hdr6/product.jpg', type: 'jpeg', quality: 85, clip: { x: 0, y: 0, width: 1440, height: 260 } }); fs.writeFileSync('hdr6/product.txt', href); }
    }
    await p.close();
  }
  await b.close();
})();
