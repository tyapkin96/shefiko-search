const { chromium } = require('playwright');
const fs = require('fs');
const OUT = 'audit';
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const report = {};
  for (const [name, vp, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1, locale: 'ru-RU' });
    const page = await ctx.newPage();
    const res = [], errs = [], cons = [];
    page.on('response', async r => { try { const h = r.headers(); res.push({ url: r.url(), status: r.status(), type: r.request().resourceType(), len: +(h['content-length'] || 0) }); } catch (e) {} });
    page.on('pageerror', e => errs.push(String(e.message).slice(0, 200)));
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') cons.push(m.text().slice(0, 200)); });
    const t0 = Date.now();
    await page.goto('https://shefiko.ru/', { waitUntil: 'load', timeout: 90000 });
    const tLoad = Date.now() - t0;
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/${name}-fold.jpg`, type: 'jpeg', quality: 70 });
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += vp.height * 0.7) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(350); }
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(800);
    // section-by-section screenshots
    const secs = await page.evaluate(() => [...document.querySelectorAll('#allrecords > .t-rec, .t-records > .t-rec')].map(e => { const r = e.getBoundingClientRect(); return { id: e.id, type: e.getAttribute('data-record-type'), top: Math.round(r.top + scrollY), h: Math.round(r.height), text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 90) }; }));
    let k = 0;
    for (const s of secs) { if (s.h < 40) continue; k++; if (k > 40) break; try { await page.evaluate(y => window.scrollTo(0, y), Math.max(0, s.top - 20)); await page.waitForTimeout(500); await page.screenshot({ path: `${OUT}/${name}-s${String(k).padStart(2, '0')}-${s.id}.jpg`, type: 'jpeg', quality: 55, clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, Math.max(60, s.h + 20)) } }); } catch (e) {} }
    const info = await page.evaluate(() => {
      const q = s => [...document.querySelectorAll(s)];
      const imgs = q('img');
      const m = n => (document.querySelector(`meta[name="${n}"],meta[property="${n}"]`) || {}).content || null;
      const fonts = [...new Set(q('body *').slice(0, 2500).map(e => getComputedStyle(e).fontFamily.split(',')[0].trim()))].slice(0, 15);
      return {
        title: document.title, h1: q('h1').map(e => e.innerText.slice(0, 80)), h2count: q('h2').length,
        description: m('description'), ogImage: m('og:image'), ogTitle: m('og:title'), viewport: m('viewport'),
        canonical: (document.querySelector('link[rel=canonical]') || {}).href || null,
        lang: document.documentElement.lang, images: imgs.length, imgNoAlt: imgs.filter(i => !i.getAttribute('alt')).length,
        zeroBlocks: q('.t396').length, tilda: { t396: q('.t396').length, records: q('.t-rec').length },
        scrollHeight: document.documentElement.scrollHeight, fonts,
        gsap: typeof window.gsap, scrollTrigger: typeof window.ScrollTrigger,
        links: q('a').length, buttons: q('.t-btn,button').length,
        htmlBytes: document.documentElement.outerHTML.length,
        nav: q('a[href]').filter(a => a.getBoundingClientRect().top < 120).map(a => a.innerText.trim()).filter(Boolean).slice(0, 20),
      };
    });
    const perf = await page.evaluate(() => new Promise(r => { let lcp = 0, cls = 0; try { new PerformanceObserver(l => { for (const e of l.getEntries()) lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch (e) {} setTimeout(() => { const n = performance.getEntriesByType('navigation')[0] || {}; r({ lcp: Math.round(lcp), cls: +cls.toFixed(3), dcl: Math.round(n.domContentLoadedEventEnd || 0), load: Math.round(n.loadEventEnd || 0) }); }, 600); }));
    const by = {}; let total = 0;
    for (const r of res) { by[r.type] = by[r.type] || { n: 0, bytes: 0 }; by[r.type].n++; by[r.type].bytes += r.len; total += r.len; }
    const big = res.filter(r => r.len > 250000).sort((a, b) => b.len - a.len).slice(0, 15).map(r => [r.len, r.url.slice(0, 140)]);
    const bad = res.filter(r => r.status >= 400).map(r => [r.status, r.url.slice(0, 140)]).slice(0, 15);
    report[name] = { tLoad, perf, info, requests: res.length, totalBytesKnown: total, byType: by, big, bad, errs, cons: cons.slice(0, 15), sections: secs.map(s => `${s.id} t${s.type} h${s.h} ${s.text}`) };
    await ctx.close();
  }
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
  await browser.close();
})();
