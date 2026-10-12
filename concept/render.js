const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  fs.mkdirSync('concept_out', { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  for (const v of ['a', 'b', 'c']) {
    await p.goto('file://' + path.resolve('concept/index.html') + '?v=' + v, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
    await p.screenshot({ path: `concept_out/${v}.jpg`, type: 'jpeg', quality: 90 });
  }
  await b.close();
})();
