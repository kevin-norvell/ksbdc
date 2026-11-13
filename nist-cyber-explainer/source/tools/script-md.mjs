// Write narration-script.md from the CAPTIONS, CHAPTERS, and SOURCES in scenes.js,
// so the script always matches the video.  usage: node source/tools/script-md.mjs
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import vm from "node:vm";

const here = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const src = fs.readFileSync(path.join(root, "source/src/scenes.js"), "utf8");
const pick = name => {
  const m = src.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\n\\]);`));
  return vm.runInNewContext(m[1]);
};
const DUR = Number(src.match(/const DUR = ([\d.]+)/)[1]);
const CHAPTERS = pick("CHAPTERS"), CAPTIONS = pick("CAPTIONS"), SOURCES = pick("SOURCES");
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const strip = s => s.replace(/<[^>]+>/g, "");
const srcAt = t => (SOURCES.find(([a, b]) => t >= a && t < b) || [0, 0, "n/a"])[2];

let md = `# Lock It Down: Cybersecurity Basics for Small Business

**Narration script** · Run time ${fmt(DUR)} · 16:9, 1920×1080 · Kentucky SBDC

Source document: Eliot, D., Marron, J. A., & Thorn, S. (2026). *Small Business Cybersecurity: Non-Employer Firms* (NIST Cybersecurity White Paper 50). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.CSWP.50

The video carries this narration as an on-screen caption band, so it works with the sound off. To add a voiceover, read each line in its time window (about 150 words per minute) and mix it over the music; the timings already leave room to breathe.

| Time | Narration | Source shown on screen |
|---|---|---|
`;
let ch = -1;
for (const [a, b, text] of CAPTIONS) {
  let k = 0;
  CHAPTERS.forEach(([t], i) => { if (a >= t) k = i; });
  if (k !== ch) {
    ch = k;
    md += `| **${fmt(CHAPTERS[k][0])}** | **${String(k + 1).padStart(2, "0")} · ${CHAPTERS[k][1]}** | |\n`;
  }
  md += `| ${fmt(a)}–${fmt(b)} | ${strip(text)} | ${srcAt(a + 0.5)} |\n`;
}
md += `
## Notes on accuracy

- **Statistics** (34.8 million small businesses, 99% of U.S. businesses, 81.9% non-employer firms) are from CSWP 50's Introduction, which cites the U.S. SBA Office of Advocacy.
- **"Super intelligence (SI)."** CSWP 50 uses this term in place of "artificial intelligence," following the Sept. 29, 2026 executive order cited in its footnote 6. The video notes this on screen.
- **15-character passphrases**, **MFA as "one of the most important steps,"** monthly update checks, disconnected and tested backups, and the phishing red flags all come from CSWP 50 §1.1 and §3.3 (quoted on screen where marked).
- **ic3.gov** (FBI Internet Crime Complaint Center) is listed in CSWP 50's Respond and Recover resources.
- **Fictional:** Sam, Bluegrass Candle Co., "Commonwealth Bank," and the Bandit. The phishing email and inventory table are illustrations.
- The video is educational. It is not legal advice and not a compliance checklist (CSWP 50 makes the same point about its own tables).
`;
fs.writeFileSync(path.join(root, "narration-script.md"), md);
console.log("wrote narration-script.md");
