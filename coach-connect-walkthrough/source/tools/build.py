"""Build the single-file Coach Connect walkthrough.

Inlines the font, logos, coach photos, live-form data, narration timings
and narration audio into one HTML file that plays offline.

    python3 source/tools/build.py

Writes coach-connect-walkthrough.html next to the source folder.
"""
import base64
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / "source" / "src"
ASSETS = ROOT / "source" / "assets"
OUT = ROOT / "coach-connect-walkthrough.html"

SCRIPTS = ("engine.js", "icons.js", "data.js", "replica.js", "tour.js", "sandbox.js", "player.js")
COACHES = ("claire-bridges", "dave-oetken", "rhonda-jones", "fausto-sarmiento", "stuart-arnold", "tonya-parsons")


def uri(path, mime):
    return "data:%s;base64,%s" % (mime, base64.b64encode(path.read_bytes()).decode("ascii"))


def data_js(with_audio=True):
    img = ASSETS / "images"
    assets = {
        "logo": uri(img / "ksbdc-logo.webp", "image/webp"),
        "banner": uri(img / "training-banner.webp", "image/webp"),
        "uk": uri(img / "uk-martin-gatton-logo.webp", "image/webp"),
        "sba": uri(img / "powered-by-sba-logo.webp", "image/webp"),
        "coach": {c: uri(img / ("coach-%s.webp" % c), "image/webp") for c in COACHES},
    }
    live = json.loads((ASSETS / "live-form-data.json").read_text())
    live.pop("_source", None)
    narration = json.loads((ASSETS / "audio" / "narration.json").read_text())
    for c in narration["cues"]:
        c.pop("say", None)  # captions only need the caption words
    parts = [
        "const ASSETS = %s;" % json.dumps(assets),
        "const LIVE = %s;" % json.dumps(live, ensure_ascii=False),
        "const NARRATION = %s;" % json.dumps(narration, ensure_ascii=False, separators=(",", ":")),
        "const NARRATION_AUDIO = %s;" % json.dumps(uri(ASSETS / "audio" / "narration.mp3", "audio/mpeg") if with_audio else ""),
    ]
    return "\n".join(parts)


def font_css():
    return ('@font-face { font-family: "Geist"; font-style: normal; font-weight: 100 900; font-display: block; '
            'src: url(%s) format("woff2"); }' % uri(ASSETS / "fonts" / "geist-latin.woff2", "font/woff2"))


def build(out=OUT, scripts=SCRIPTS, body_file="body.html", with_audio=True):
    title = (SRC / "title.html").read_text().strip()
    styles = "<style>\n%s\n%s\n%s\n</style>" % (font_css(), (SRC / "styles.css").read_text(), (SRC / "replica.css").read_text())
    body = (SRC / body_file).read_text()
    code = "\n".join((SRC / n).read_text() for n in scripts)
    page = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            '%s\n%s\n</head>\n<body>\n%s\n<script>\n%s\n%s\n</script>\n</body>\n</html>\n') % (title, styles, body, data_js(with_audio), code)
    pathlib.Path(out).write_text(page)
    print("wrote %s (%.2f MB)" % (pathlib.Path(out).name, pathlib.Path(out).stat().st_size / 1e6))


if __name__ == "__main__":
    build()
    sys.exit(0)
