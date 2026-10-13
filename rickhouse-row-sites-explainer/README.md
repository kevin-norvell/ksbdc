# From Idea to Website with ChatGPT Sites

A 2:08 motion-graphic explainer that follows Rickhouse Row Bakery (a fictional bakery in Bardstown, KY) from a one-line request to a live website built with ChatGPT Sites.

| File | What it is |
|---|---|
| `rickhouse-row-sites-explainer.html` | The animation. One self-contained file with the photos, logo, and fonts embedded, so it plays offline. |
| `rickhouse-row-sites-explainer.mp4` | The same animation rendered to a 1920×1080, 30 fps video, for slides or uploads. |
| `narration-script.md` | Timestamped voiceover lines, what's on screen, and presenter notes. |
| `source/` | Editable source, brand assets, and the build and render tools. |

## Presenting it

1. Open `rickhouse-row-sites-explainer.html` in Chrome, Edge, Safari, or Firefox.
2. Press **F** for full screen, then **Space** to play. The stage letterboxes to fill any screen at 16:9.
3. The controls hide after a couple of seconds of no mouse movement, so the screen share stays clean. Move the mouse to bring them back.

| Key | Action |
|---|---|
| Space or K | Play or pause |
| ← / → | Back or forward 5 seconds (hold Shift for 1 second) |
| J / L | Back or forward 10 seconds |
| [ / ] | Previous or next chapter |
| Home / End | Start or end |
| F | Full screen |
| C | Captions (the narration lines) |

To open on a specific chapter, add `#chapter-N` to the address, for example `#chapter-6` for Build it.

## Notes

- **Icon mark:** only five images came through with the brief, and the standalone icon mark was not among them. The recurring icon (the opening draw-on, scene transitions, progress marker, and corner watermark) uses the wheat-and-loaf emblem from the full logo, unaltered. The crop lives in one place (`cropEmblem` in `source/src/engine.js`), so the separate icon file can be swapped in later.
- **Colors** were sampled from the logo: copper `#A9631F` and dark brown `#3C281C`, with cream `#FAF5EC` and tan `#EADCC8` from the brief.
- **Photos** are used as supplied: no recoloring, no distortion, and no crops that cut out food.
- **Fonts:** Cormorant Garamond for headings and Source Sans 3 for body text, both from Google Fonts, embedded in the file.

## Rebuilding

```sh
python3 source/tools/build.py            # writes rickhouse-row-sites-explainer.html
NODE_PATH=$(npm root -g) node source/tools/render-mp4.mjs   # writes the MP4 (needs Playwright + ffmpeg)
```

The animation engine evaluates every property as a pure function of time, so scrubbing, pausing, and frame-by-frame export all produce identical frames.
