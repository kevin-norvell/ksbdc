# Lock It Down: Cybersecurity Basics for Small Business

A 5:13 animated explainer for Kentucky small business owners, built from NIST Cybersecurity White Paper 50, *Small Business Cybersecurity: Non-Employer Firms* (Nov. 2, 2026, doi.org/10.6028/NIST.CSWP.50). Kentucky SBDC branding, an original corporate music bed, on-screen citations for every claim, and a recurring raccoon villain, the Bandit, to keep it light.

| File | What it is |
|---|---|
| `cybersecurity-basics-explainer.mp4` | 1920×1080, 30 fps video with music and burned-in narration captions. Ready for YouTube, LinkedIn, a workshop, or a lobby screen. |
| `cybersecurity-basics-explainer.html` | The same piece as one self-contained file (fonts and music embedded) with a player: chapters, scrubbing, captions toggle, mute. Plays offline. |
| `narration-script.md` | Every narration line with its timestamp and the CSWP 50 section shown on screen. Use it to record a voiceover. |
| `source/` | Editable source and the build, music, and render tools. |

## Chapters

1. Open (0:00) · 2. Why it matters (0:12) · 3. The three goals (0:44) · 4. Know what you have (1:12) · 5. The framework (1:40) · 6. Govern (2:00) · 7. Identify (2:18) · 8. Protect (2:36) · 9. Spot the phish (3:40) · 10. Ransomware (4:12) · 11. Detect, respond, recover (4:30) · 12. Your next step (4:56)

## Citations

- A **Source** tag in the top-right corner names the CSWP 50 section, table, or figure behind each beat.
- The end card lists the full reference, NIST CSF 2.0, the SBA Office of Advocacy figures (as cited in CSWP 50), and ic3.gov.
- CSWP 50 says "super intelligence (SI)" where most people say "AI" (its footnote 6 explains why). The phishing chapter uses the paper's term and explains it on screen.
- Sam, Bluegrass Candle Co., "Commonwealth Bank," and the Bandit are fictional and labeled as such.

## Branding notes

- **Logo:** the brand skill's logo files were not available in this environment, so the KY SBDC mark is a typographic wordmark ("KENTUCKY SBDC" in navy/white with the red bar). To use the official logo, put it at `source/assets/logos/logo-ky-sbdc.png` (or `.jpg`/`.svg`), run the build, then re-render. Every lockup in the piece updates.
- **Colors:** navy `#1B2D5B` leads, red `#C8102E` for emphasis only, grays from the brand palette. No off-brand blues.
- **Type:** Calibri metrics via Carlito (embedded), per the brand guide's HTML stack.
- **Contact and disclaimer:** www.KentuckySBDC.com, 1-888-414-7232, "no-cost, confidential," hosted-by and SBA funding lines on the end card.

## Music

`source/tools/music.py` synthesizes the track from scratch with numpy: D major, 104 BPM, piano, plucked arpeggio, pad, bass, light drums, a lighter breakdown mid-video, and a ringing final chord. No samples or third-party loops, so there are no licensing questions. The video mixes it to -18 LUFS.

## Rebuilding

```sh
python3 source/tools/music.py 309.5 source/assets/music.wav
ffmpeg -i source/assets/music.wav -b:a 160k source/assets/music.mp3
python3 source/tools/build.py
NODE_PATH=$(npm root -g) node source/tools/render-mp4.mjs 4
node source/tools/script-md.mjs
```

`music.wav` is not committed (55 MB); the first command regenerates it identically. Rendering needs Playwright's Chromium and ffmpeg. The animation is a pure function of time, so every render is frame-identical.
