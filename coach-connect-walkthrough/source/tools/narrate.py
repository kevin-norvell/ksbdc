#!/usr/bin/env python3
"""Generate the walkthrough narration with ElevenLabs text-to-speech.

    python3 source/tools/narrate.py            # generate missing clips, rebuild the schedule
    python3 source/tools/narrate.py --voice ID # same script, different voice

Reads source/script.json and writes, under source/assets/audio/:

    clips/<cue>-<hash>.mp3 / .json   one clip per line, with character timings
    narration.json                   cue start times + word timings (drives the animation)
    narration.mp3                    the full narration track, embedded in the HTML
    narration.wav                    lossless track for the MP4 (not committed)
    narration.srt                    captions sidecar for video platforms

Clips are cached by a hash of their text, voice, model and settings, so
re-running only calls the API for lines that changed. Cue timing comes from
the clips themselves: each line starts `pre` seconds after the previous line's
last spoken character, so editing a gap or a line re-times everything after it.

API key: the ELEVENLABS_API_KEY environment variable, or that key in a
.env.local file at the repository root (written by `elevenlabs onboard`).
In a Claude Code cloud environment with the key saved as a network secret,
the proxy injects it, and any placeholder value works.
"""
import argparse
import base64
import difflib
import hashlib
import json
import os
import pathlib
import re
import subprocess
import sys
import urllib.error
import urllib.request

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parents[2]          # coach-connect-walkthrough/
SRC = ROOT / "source"
AUDIO = SRC / "assets" / "audio"
CLIPS = AUDIO / "clips"
SR = 44100
API = "https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128"


def api_key():
    key = os.environ.get("ELEVENLABS_API_KEY")
    if key:
        return key
    env = ROOT.parent / ".env.local"
    if env.exists():
        for line in env.read_text().splitlines():
            m = re.match(r"\s*ELEVENLABS_API_KEY\s*=\s*(.+?)\s*$", line)
            if m and m.group(1).strip("'\""):
                return m.group(1).strip("'\"")
    return "proxy-injected"


def tts_text(s):
    return s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')


def synth(cfg, voice_id, text, prev, nxt):
    body = {
        "text": text,
        "model_id": cfg["model"],
        "voice_settings": cfg["settings"],
        "seed": 7,
    }
    if prev:
        body["previous_text"] = prev
    if nxt:
        body["next_text"] = nxt
    req = urllib.request.Request(
        API.format(voice=voice_id),
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "xi-api-key": api_key()},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise SystemExit(f"ElevenLabs error {e.code}: {e.read().decode(errors='replace')[:400]}")


def decode(mp3):
    pcm = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(mp3), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(pcm, dtype=np.float32)


def words_from_alignment(al):
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    out, cur = [], None
    for c, a, b in zip(chars, st, en):
        if c.isspace():
            if cur:
                out.append(cur)
                cur = None
            continue
        if cur is None:
            cur = [c, a, b]
        else:
            cur[0] += c
            cur[2] = b
    if cur:
        out.append(cur)
    return out


def norm(w):
    return re.sub(r"[^a-z0-9]", "", w.lower().replace("’", "'"))


def map_caption(cap, say_words):
    """Give each caption word the timing of the spoken words it corresponds to."""
    cw = cap.split()
    a = [norm(w) for w in cw]
    b = [norm(w[0]) for w in say_words]
    out = [None] * len(cw)
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                out[i1 + k] = [cw[i1 + k], say_words[j1 + k][1], say_words[j1 + k][2]]
        elif i2 > i1:
            if j2 > j1:
                t0, t1 = say_words[j1][1], say_words[j2 - 1][2]
            else:  # caption-only words: pin to the neighbouring spoken word
                ref = say_words[min(j1, len(say_words) - 1)]
                t0 = t1 = ref[1]
            n = i2 - i1
            for k in range(n):
                out[i1 + k] = [cw[i1 + k], t0 + (t1 - t0) * k / n, t0 + (t1 - t0) * (k + 1) / n]
    return out


def srt_time(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", help="ElevenLabs voice ID (overrides script.json)")
    args = ap.parse_args()
    cfg = json.loads((SRC / "script.json").read_text())
    voice_id = args.voice or cfg["voice"]["id"]
    cues = cfg["cues"]
    CLIPS.mkdir(parents=True, exist_ok=True)

    says = [tts_text(c.get("say", c["cap"])) for c in cues]
    keep = set()
    clips = []
    for i, c in enumerate(cues):
        prev = says[i - 1] if i > 0 else None
        nxt = says[i + 1] if i + 1 < len(cues) else None
        h = hashlib.sha1(json.dumps([voice_id, cfg["model"], cfg["settings"], says[i], prev, nxt]).encode()).hexdigest()[:10]
        stem = CLIPS / f"{c['id']}-{h}"
        mp3, js = stem.with_suffix(".mp3"), stem.with_suffix(".json")
        if not (mp3.exists() and js.exists()):
            print(f"  generating {c['id']} ({len(says[i])} chars)", flush=True)
            res = synth(cfg, voice_id, says[i], prev, nxt)
            mp3.write_bytes(base64.b64decode(res["audio_base64"]))
            js.write_text(json.dumps(res["alignment"]))
        keep.update({mp3.name, js.name})
        clips.append((mp3, json.loads(js.read_text())))
    for f in CLIPS.iterdir():
        if f.name not in keep:
            f.unlink()

    # lay out the timeline
    t = cfg["lead_in"]
    sched = []
    prev_end = None
    for c, (mp3, al) in zip(cues, clips):
        pcm = decode(mp3)
        sw = words_from_alignment(al)
        start = t if prev_end is None else prev_end + c["pre"]
        speech_end = start + sw[-1][2]
        sched.append((c, pcm, sw, start, speech_end))
        prev_end = speech_end
    total = round(prev_end + cfg["tail"], 3)

    track = np.zeros(int(total * SR) + SR, dtype=np.float32)
    out_cues = []
    for c, pcm, sw, start, end in sched:
        i0 = int(round(start * SR))
        track[i0:i0 + len(pcm)] += pcm[: max(0, len(track) - i0)]
        abs_say = [[w, round(start + a, 3), round(start + b, 3)] for w, a, b in sw]
        cap_words = [[w, round(a, 3), round(b, 3)] for w, a, b in map_caption(c["cap"], abs_say)]
        out_cues.append({
            "id": c["id"], "ch": c["ch"], "t": round(start, 3), "end": round(end, 3),
            "cap": c["cap"], "words": cap_words, "say": abs_say,
        })
    track = track[: int(total * SR)]
    peak = float(np.max(np.abs(track))) or 1.0
    if peak > 0.98:
        track *= 0.98 / peak

    # chapter starts: just after the previous chapter's last line ends
    chapters = []
    for k, title in enumerate(cfg["chapters"]):
        first = next(i for i, c in enumerate(out_cues) if c["ch"] == k)
        start = 0.0 if first == 0 else round(out_cues[first - 1]["end"] + 0.2, 3)
        chapters.append({"title": title, "t": start})

    wav = AUDIO / "narration.wav"
    pcm16 = (np.clip(track, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", str(wav)],
                   input=pcm16, check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "96k",
                    "-ac", "1", str(AUDIO / "narration.mp3")], check=True)

    (AUDIO / "narration.json").write_text(json.dumps({
        "voice": {"name": cfg["voice"]["name"] if not args.voice else args.voice, "id": voice_id},
        "model": cfg["model"], "duration": total, "chapters": chapters, "cues": out_cues,
    }, indent=1))

    # captions sidecar, paged the same way as the on-screen captions (two lines at most)
    pages = []
    for c in out_cues:
        cur, ln = [], 0
        for i, w in enumerate(c["words"]):
            if ln + len(w[0]) + 1 > 86 and cur:
                pages.append((c, cur)); cur, ln = [], 0
            cur.append(w); ln += len(w[0]) + 1
            if i < len(c["words"]) - 1 and ln >= 34 and w[0][-1] in ".?!:":
                pages.append((c, cur)); cur, ln = [], 0
        if cur:
            pages.append((c, cur))
    lines = []
    for n, (c, ws) in enumerate(pages):
        nxt = pages[n + 1] if n + 1 < len(pages) else None
        t0 = max(0.0, ws[0][1] - 0.1)
        t1 = nxt[1][0][1] - 0.1 if nxt and nxt[0] is c else c["end"] + 0.4
        if nxt:
            t1 = min(t1, nxt[1][0][1] - 0.15)
        lines += [str(n + 1), f"{srt_time(t0)} --> {srt_time(t1)}", " ".join(w[0] for w in ws), ""]
    (AUDIO / "narration.srt").write_text("\n".join(lines))

    print(f"\n{'cue':<10}{'start':>8}{'len':>7}{'wps':>6}  chapter")
    for c in out_cues:
        d = c["end"] - c["t"]
        print(f"{c['id']:<10}{c['t']:>8.2f}{d:>7.2f}{len(c['words']) / d:>6.2f}  {cfg['chapters'][c['ch']]}")
    print(f"\ntotal {total:.2f}s ({int(total // 60)}:{total % 60:05.2f}), "
          f"{sum(len(s) for s in says)} characters, track {os.path.getsize(AUDIO / 'narration.mp3') / 1e6:.2f} MB")


if __name__ == "__main__":
    sys.exit(main())
