// Render the explainer to a 1920x1080 MP4 with the music track.
// Frames are captured in parallel workers, each writing its own segment,
// then the segments are joined and the music is muxed in.
// usage: NODE_PATH=$(npm root -g) node source/tools/render-mp4.mjs [workers] [fps]
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import url from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");

const here = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const workers = Number(process.argv[2] || Math.max(1, os.cpus().length));
const fps = Number(process.argv[3] || 30);
const html = path.join(root, "cybersecurity-basics-explainer.html");
const music = path.join(root, "source/assets/music.wav");
const out = path.join(root, "cybersecurity-basics-explainer.mp4");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "render-"));

function run(cmd, args, opts = {}) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio: ["pipe", "inherit", "inherit"], ...opts });
    p.on("close", c => (c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`))));
  });
}

async function segment(browser, k, f0, f1) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(url.pathToFileURL(html).href + "?export");
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  const file = path.join(tmp, `seg${k}.mp4`);
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-tune", "animation", "-pix_fmt", "yuv420p", "-threads", "1", file],
    { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => ff.on("close", c => (c === 0 ? res() : rej(new Error("ffmpeg " + c)))));
  const t0 = Date.now();
  for (let i = f0; i < f1; i++) {
    await page.evaluate(t => window.__seek(t), i / fps);
    const buf = await page.screenshot({ type: "jpeg", quality: 94 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if ((i - f0) % 300 === 0) console.log(`worker ${k}: ${i - f0}/${f1 - f0} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  ff.stdin.end();
  await done;
  await page.close();
  return file;
}

const browser = await chromium.launch();
const probe = await browser.newPage();
await probe.goto(url.pathToFileURL(html).href + "?export");
await probe.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
const dur = await probe.evaluate(() => window.__dur);
await probe.close();
const frames = Math.round(dur * fps);
const per = Math.ceil(frames / workers);
const segs = await Promise.all(Array.from({ length: workers }, (_, k) => segment(browser, k, k * per, Math.min(frames, (k + 1) * per))));
await browser.close();

const list = path.join(tmp, "list.txt");
fs.writeFileSync(list, segs.map(s => `file '${s}'`).join("\n"));
const silent = path.join(tmp, "video.mp4");
await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", silent]);
await run("ffmpeg", ["-y", "-loglevel", "error", "-i", silent, "-i", music,
  "-filter_complex", `[0:v]fade=t=out:st=${dur - 0.8}:d=0.8[v];[1:a]atrim=0:${dur},loudnorm=I=-18:TP=-1.5:LRA=7,afade=t=out:st=${dur - 2}:d=2[a]`,
  "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-tune", "animation", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", out]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log("wrote", out);
