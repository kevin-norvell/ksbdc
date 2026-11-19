// Render stills of the tour at given times, for review.
//   NODE_PATH=$(npm root -g) node source/tools/frames.cjs <outDir> <t1,t2,...> [scale]

const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [, , out, spec, sc] = process.argv;
const html = path.join(__dirname, '..', '..', 'coach-connect-walkthrough.html');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: parseFloat(sc || '0.5') });
  const errs = [];
  p.on('pageerror', e => errs.push('[pageerror] ' + e.message));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(`[${m.type()}] ${m.text()}`); });
  await p.goto('file://' + path.resolve(html) + '?export');
  try { await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 }); }
  catch (e) { console.log(errs.join('\n')); throw e; }
  const times = spec.split(',').map(Number);
  for (const t of times) {
    await p.evaluate(t => window.__seek(t), t);
    await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await p.screenshot({ path: path.join(out, `t${t.toFixed(2).padStart(7, '0')}.jpg`), type: 'jpeg', quality: 80 });
  }
  console.log(errs.join('\n') || 'no console errors');
  await b.close();
})();
