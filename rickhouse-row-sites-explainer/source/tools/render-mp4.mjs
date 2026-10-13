// Render the explainer to a 1920x1080 MP4, frame by frame.
// usage: NODE_PATH=$(npm root -g) node source/tools/render-mp4.mjs [fps] [out.mp4]
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import path from "node:path";
import url from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright"); // resolves via NODE_PATH

const here = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const fps = Number(process.argv[2] || 30);
const out = path.resolve(process.argv[3] || path.join(root, "rickhouse-row-sites-explainer.mp4"));
const html = path.join(root, "rickhouse-row-sites-explainer.html");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(url.pathToFileURL(html).href + "?export");
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
const dur = await page.evaluate(() => window.__dur);

// warm every scene once so images are decoded before capture
for (let t = 0; t < dur; t += 2) await page.evaluate(t => window.__seek(t), t);

const ff = spawn("ffmpeg", [
  "-y", "-loglevel", "error",
  "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
  "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-tune", "animation",
  "-pix_fmt", "yuv420p", "-movflags", "+faststart", out,
], { stdio: ["pipe", "inherit", "inherit"] });

const frames = Math.round(dur * fps);
const t0 = Date.now();
for (let i = 0; i <= frames; i++) {
  await page.evaluate(t => window.__seek(t), Math.min(i / fps, dur));
  const buf = await page.screenshot({ type: "jpeg", quality: 95 }); // PNG encoding is ~8x slower
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
  if (i % 150 === 0) console.log(`frame ${i}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on("close", c => (c === 0 ? res() : rej(new Error("ffmpeg exited " + c)))));
await browser.close();
console.log("wrote", out);
