"""Build the single-file explainer.

Inlines the brand images, fonts, and traced emblem paths into one
self-contained HTML file so it plays offline with no external requests.

    python3 source/tools/build.py [--artifact OUT_PATH]

Writes rickhouse-row-sites-explainer.html (a complete standalone document).
With --artifact, also writes a copy without the <html>/<head>/<body> wrapper
for hosts that supply their own document skeleton.
"""
import argparse
import base64
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / "source" / "src"
ASSETS = ROOT / "source" / "assets"
OUT = ROOT / "rickhouse-row-sites-explainer.html"

HEAD_OPEN = (
    '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
)


def b64(path):
    return base64.b64encode(path.read_bytes()).decode("ascii")


def build_parts():
    images = {
        "LOGO": ("image/png", ASSETS / "images" / "logo-full.png"),
        "HERO": ("image/webp", ASSETS / "images" / "hero.webp"),
        "ROLL": ("image/webp", ASSETS / "images" / "cinnamon-roll.webp"),
        "LOAF": ("image/webp", ASSETS / "images" / "sourdough.webp"),
        "COOKIE": ("image/webp", ASSETS / "images" / "cookies.webp"),
    }
    fonts = {
        "F_SERIF": ASSETS / "fonts" / "cormorant-garamond-latin.woff2",
        "F_SERIF_I": ASSETS / "fonts" / "cormorant-garamond-italic-latin.woff2",
        "F_SANS": ASSETS / "fonts" / "source-sans-3-latin.woff2",
    }
    emblem = json.loads((ASSETS / "emblem-paths.json").read_text())
    emblem_js = json.dumps([p["d"] for p in emblem["paths"]])

    assets_css = (SRC / "assets.css").read_text()
    for key, (mime, path) in images.items():
        assets_css = assets_css.replace("{{%s}}" % key, "data:%s;base64,%s" % (mime, b64(path)))
    for key, path in fonts.items():
        assets_css = assets_css.replace("{{%s}}" % key, "data:font/woff2;base64,%s" % b64(path))

    title = (SRC / "title.html").read_text().strip()
    styles = "<style>\n%s\n</style>\n<style>\n%s\n</style>" % ((SRC / "styles.css").read_text(), assets_css)
    body = (SRC / "body.html").read_text()
    scripts = "\n".join((SRC / n).read_text() for n in ("engine.js", "site.js", "scenes.js", "player.js"))
    scripts = "<script>\n%s\n</script>" % scripts.replace("__EMBLEM_PATHS__", emblem_js)
    for part in (styles, body, scripts):
        if "{{" in part:
            raise SystemExit("unreplaced placeholder in build output")
    return title, styles, body, scripts


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--artifact", help="also write a wrapper-free copy here")
    args = ap.parse_args()
    title, styles, body, scripts = build_parts()

    standalone = "%s%s\n%s\n</head>\n<body>\n%s\n%s\n</body>\n</html>\n" % (HEAD_OPEN, title, styles, body, scripts)
    OUT.write_text(standalone)
    print("wrote %s (%.2f MB)" % (OUT.name, OUT.stat().st_size / 1e6))

    if args.artifact:
        out = pathlib.Path(args.artifact)
        out.write_text("%s\n%s\n%s\n%s\n" % (title, styles, body, scripts))
        print("wrote %s (%.2f MB)" % (out, out.stat().st_size / 1e6))


if __name__ == "__main__":
    main()
