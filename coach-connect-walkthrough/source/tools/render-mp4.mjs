// Render the tour to a 1920x1080 MP4 with the narration track.
//
//   NODE_PATH=$(npm root -g) node source/tools/render-mp4.mjs [--fps 30] [--jobs 3] [--nocap] [--out file.mp4]
//
// Frames are rendered in parallel segments (one browser page each, piped
// straight into ffmpeg), then joined and muxed with narration.wav.
// The engine is a pure function of time, so segments line up exactly.
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import url from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");

const here = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const fps = Number(arg("--fps", 30));
const jobs = Number(arg("--jobs", Math.max(1, Math.min(3, os.cpus().length - 1))));
const nocap = process.argv.includes("--nocap");
const out = path.resolve(arg("--out", path.join(root, nocap ? "coach-connect-walkthrough-no-captions.mp4" : "coach-connect-walkthrough.mp4")));
const html = path.join(root, "coach-connect-walkthrough.html");
const wav = path.join(root, "source", "assets", "audio", "narration.wav");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cc-render-"));

const run = (cmd, args) => new Promise((res, rej) => {
  const p = spawn(cmd, args, { stdio: ["ignore", "inherit", "inherit"] });
  p.on("close", c => (c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`))));
});

const browser = await chromium.launch();
const probe = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await probe.goto(url.pathToFileURL(html).href + "?export");
await probe.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
const dur = await probe.evaluate(() => window.__dur);
await probe.close();
const frames = Math.round(dur * fps);
const per = Math.ceil((frames + 1) / jobs);
console.log(`${frames + 1} frames at ${fps} fps, ${jobs} segment(s), duration ${dur}s`);

const t0 = Date.now();
let done = 0;
async function segment(k) {
  const a = k * per, b = Math.min(frames + 1, a + per);
  if (a >= b) return null;
  const file = path.join(tmp, `seg${k}.mp4`);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(url.pathToFileURL(html).href + "?export" + (nocap ? "&nocap" : ""));
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  for (let t = 0; t < dur; t += 1.5) await page.evaluate(t => window.__seek(t), t); // warm images and layout
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-tune", "animation", "-pix_fmt", "yuv420p", "-threads", "2", file],
    { stdio: ["pipe", "inherit", "inherit"] });
  const closed = new Promise((res, rej) => ff.on("close", c => (c === 0 ? res() : rej(new Error("ffmpeg exited " + c)))));
  for (let i = a; i < b; i++) {
    await page.evaluate(t => window.__seek(t), Math.min(i / fps, dur));
    const buf = await page.screenshot({ type: "jpeg", quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (++done % 300 === 0) console.log(`  ${done}/${frames + 1} frames (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  ff.stdin.end();
  await closed;
  await page.close();
  return file;
}
const files = (await Promise.all([...Array(jobs).keys()].map(segment))).filter(Boolean);
await browser.close();

const list = path.join(tmp, "list.txt");
fs.writeFileSync(list, files.map(f => `file '${f}'`).join("\n"));
const video = path.join(tmp, "video.mp4");
await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", video]);
await run("ffmpeg", ["-y", "-loglevel", "error", "-i", video, "-i", wav, "-map", "0:v", "-map", "1:a",
  "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-ar", "44100", "-shortest", "-movflags", "+faststart", out]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`wrote ${out} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
