// Render stills from the explainer at given times.
// usage: node frames.mjs <html> <outDir> <t1,t2,...|start:end:step> [scale]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // resolves via NODE_PATH
import fs from "node:fs";
import path from "node:path";

const [, , html, outDir, spec, scaleArg] = process.argv;
const scale = parseFloat(scaleArg || "0.5");
let times = [];
if (spec.includes(":")) {
  const [a, b, s] = spec.split(":").map(Number);
  for (let t = a; t <= b + 1e-9; t += s) times.push(Math.round(t * 1000) / 1000);
} else times = spec.split(",").map(Number);
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: ["--disable-web-security"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
const errors = [];
page.on("console", m => { if (m.type() === "error" || m.type() === "warning") errors.push(`[${m.type()}] ${m.text()}`); });
page.on("pageerror", e => errors.push(`[pageerror] ${e.message}`));
await page.goto("file://" + path.resolve(html) + "?export", { waitUntil: "load" });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
for (const t of times) {
  await page.evaluate(t => window.__seek(t), t);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const name = `t${t.toFixed(2).padStart(7, "0")}.jpg`;
  await page.screenshot({ path: path.join(outDir, name), type: "jpeg", quality: 82 });
}
if (errors.length) console.log(errors.join("\n"));
console.log(`rendered ${times.length} frames`);
await browser.close();
