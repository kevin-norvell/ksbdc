"""Build the single-file explainer.

Inlines the fonts, the music track, and (when present) the logo into one
self-contained HTML file so it plays offline with no external requests.

    python3 source/tools/build.py

Logo: drop the official file at source/assets/logos/logo-ky-sbdc.png (or .jpg)
and rebuild. Without it, a typographic "KENTUCKY SBDC" wordmark is used.
Music: source/assets/music.mp3 (made by music.py, then encoded with ffmpeg).
"""
import base64
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / "source" / "src"
ASSETS = ROOT / "source" / "assets"
OUT = ROOT / "cybersecurity-basics-explainer.html"
FONTS = pathlib.Path("/usr/share/fonts/truetype/crosextra")


def b64(path):
    return base64.b64encode(path.read_bytes()).decode("ascii")


def font_css():
    out = []
    for weight, style, name in ((400, "normal", "Carlito-Regular.ttf"), (700, "normal", "Carlito-Bold.ttf"), (400, "italic", "Carlito-Italic.ttf")):
        f = ASSETS / "fonts" / name
        if not f.exists():
            f = FONTS / name
        out.append('@font-face { font-family: "Carlito"; font-style: %s; font-weight: %d; font-display: block; src: url(data:font/ttf;base64,%s) format("truetype"); }' % (style, weight, b64(f)))
    return "\n".join(out)


def main():
    logo = ""
    for ext, mime in (("png", "image/png"), ("jpg", "image/jpeg"), ("svg", "image/svg+xml")):
        p = ASSETS / "logos" / ("logo-ky-sbdc." + ext)
        if p.exists():
            logo = "data:%s;base64,%s" % (mime, b64(p))
            break
    music = ASSETS / "music.mp3"
    music_src = "data:audio/mpeg;base64,%s" % b64(music) if music.exists() else ""

    styles = "<style>\n%s\n%s\n</style>" % (font_css(), (SRC / "styles.css").read_text())
    body = (SRC / "body.html").read_text()
    js = "\n".join((SRC / n).read_text() for n in ("engine.js", "art.js", "scenes.js", "player.js"))
    js = js.replace('"__MUSIC__"', '"%s"' % music_src).replace('"__LOGO__"', '"%s"' % logo)
    html = (
        '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        "<title>Lock It Down</title>\n%s\n</head>\n<body>\n%s\n<script>\n%s\n</script>\n</body>\n</html>\n" % (styles, body, js)
    )
    OUT.write_text(html)
    print("wrote %s (%.2f MB)%s" % (OUT.name, OUT.stat().st_size / 1e6, "" if logo else "  [no logo file: using wordmark]"))


if __name__ == "__main__":
    main()
