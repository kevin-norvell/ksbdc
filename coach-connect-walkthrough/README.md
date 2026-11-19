# Coach Connect: A Staff Walkthrough

A narrated, interactive walkthrough of the Kentucky SBDC Coach Connect form (register.kentuckysbdc.com) for staff and business coaches. It runs 3:31 and shows how a client registers and books a coach in one visit, plus what the form does behind the scenes at each step.

| File | What it is |
|---|---|
| `coach-connect-walkthrough.html` | The walkthrough. One self-contained file with the narration, font, logos, and coach photos embedded, so it plays offline. Two tabs: **Watch the tour** and **Try it yourself**. |
| `coach-connect-walkthrough.mp4` | The tour rendered to a 1920×1080, 30 fps video with narration and burned-in captions, for Teams, email, slides, or an LMS. |
| `narration-script.md` | Timestamped narration, what's on screen, presenter notes, and open questions to confirm before training. |
| `source/` | Editable source, assets, narration clips, and the build, narration, and render tools. |

## Watch the tour

1. Open `coach-connect-walkthrough.html` in Chrome, Edge, Safari, or Firefox.
2. Press **Space** to play. Press **F** for full screen.
3. The controls hide after a couple of seconds of no mouse movement, so a screen share stays clean.

| Key | Action |
|---|---|
| Space or K | Play or pause |
| ← / → | Back or forward 5 seconds (hold Shift for 1 second) |
| J / L | Back or forward 10 seconds |
| [ / ] | Previous or next chapter |
| Home / End | Start or end |
| F | Full screen |
| C | Captions on or off (on by default) |
| M | Mute or unmute |

To open on a chapter, add `#chapter-N` to the address, for example `#chapter-6` for Step 4. To open straight into the hands-on mode, add `#try`.

## Try it yourself

The second tab is a working copy of the form. It uses the live form's ZIP routing, coach roster, validation rules, and error messages, so staff can practice the real flow: enter any Kentucky ZIP to see which center and coaches a client would get, trigger the same errors a client would see, and book a practice appointment. A **Behind the scenes** panel explains what the live form does at each step. **Fill in the sample client** and the ZIP shortcuts speed things up.

Nothing typed there leaves the page. The file makes no network requests at all, and no registration or appointment is created.

## What's real and what's a stand-in

- **The form screens** are a faithful rebuild of the live form: same layout, copy, colors, validation messages, and coach cards. They're rebuilt rather than screen-recorded so every state can be shown without creating real records.
- **The calendar** is a simplified stand-in for the coach's Calendly page, labeled "Simplified for this demo." Real availability is never shown.
- **The client**, Maya Brooks of Brooks Street Kitchen, is fictional. Her email (example.com) and phone (555-01xx) are reserved test values.
- **The coaches** are the real names and photos the live form shows. If staffing changes, update the roster (see below) and rebuild.
- **The palette and type** follow the live Coach Connect form (navy #002E5D, red #CE0E40, Geist), not the print style guide's Calibri, so the demo looks like what clients actually see.

## Updating it

Run everything from this folder. The tools need Python 3 with numpy, ffmpeg, and, for the MP4, Node with Playwright.

**Edit a line or change the voice.** Lines live in `source/script.json`. Each line has a `cap` (the caption) and, where pronunciation differs, a `say` (what the narrator reads). To change the voice, put an ElevenLabs voice ID in `voice.id`. Then:

```sh
python3 source/tools/narrate.py            # calls ElevenLabs only for lines that changed
python3 source/tools/build.py              # rebuilds the HTML
python3 source/tools/write_script_doc.py   # refreshes narration-script.md timings
NODE_PATH=$(npm root -g) node source/tools/render-mp4.mjs   # re-renders the MP4 (about 4 minutes)
```

Every on-screen action is keyed to a spoken word, so the animation re-times itself to the new audio. The ElevenLabs key is read from `ELEVENLABS_API_KEY` or from a `.env.local` file at the repository root (git ignores it).

**Coach roster or ZIP routing changes.** The ZIP table and agreement text are in `source/assets/live-form-data.json`. Coaches, photos, and specialties are in `source/src/data.js`; photos go in `source/assets/images/`. Rebuild afterward.

**A captions-free MP4** (for platforms that add their own captions from `source/assets/audio/narration.srt`):

```sh
NODE_PATH=$(npm root -g) node source/tools/render-mp4.mjs --nocap
```

## How it's built

The tour runs on the same animation engine as the Rickhouse Row explainer in this repository: every property is a pure function of time, so playing, scrubbing, and frame-by-frame export produce identical frames. The narration track is the playback clock, and each line's word timings (from ElevenLabs) place the clicks, typing, and callouts on the word that names them. Rebuilding `narration.wav` for the MP4 needs no API calls, since the clips are cached in `source/assets/audio/clips/`.
