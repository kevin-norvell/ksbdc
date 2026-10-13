import sys, json
import numpy as np
from PIL import Image
import potrace
img_path, out_dir = sys.argv[1], sys.argv[2]
im = Image.open(img_path)
a = np.array(im)
# emblem region with padding (in full-logo pixel coords)
X0, Y0, X1, Y1 = 562, 106, 1187, 542
al = a[Y0:Y1, X0:X1, 3]
mask = ~(al > 127)
bm = potrace.Bitmap(mask)
plist = bm.trace(turdsize=8, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0, opticurve=True, opttolerance=0.2)
paths = []
for curve in plist:
    sp = curve.start_point
    d = [f"M{sp.x:.1f},{sp.y:.1f}"]
    pts = [(sp.x, sp.y)]
    for seg in curve.segments:
        if seg.is_corner:
            d.append(f"L{seg.c.x:.1f},{seg.c.y:.1f}L{seg.end_point.x:.1f},{seg.end_point.y:.1f}")
            pts += [(seg.c.x, seg.c.y), (seg.end_point.x, seg.end_point.y)]
        else:
            d.append(f"C{seg.c1.x:.1f},{seg.c1.y:.1f} {seg.c2.x:.1f},{seg.c2.y:.1f} {seg.end_point.x:.1f},{seg.end_point.y:.1f}")
            pts += [(seg.end_point.x, seg.end_point.y)]
    d.append("Z")
    p = np.array(pts)
    # signed area (shoelace) to detect holes
    x, y = p[:,0], p[:,1]
    area = 0.5*np.sum(x*np.roll(y,-1) - np.roll(x,-1)*y)
    paths.append({"d": "".join(d), "cx": float(x.mean()), "cy": float(y.mean()),
                  "minx": float(x.min()), "maxx": float(x.max()), "miny": float(y.min()), "maxy": float(y.max()),
                  "area": float(area)})
print("curves:", len(paths))
for i, p in enumerate(paths):
    print(i, f"c=({p['cx']:.0f},{p['cy']:.0f}) bbox=({p['minx']:.0f}-{p['maxx']:.0f},{p['miny']:.0f}-{p['maxy']:.0f}) area={p['area']:.0f} len={len(p['d'])}")
json.dump({"w": X1-X0, "h": Y1-Y0, "x0": X0, "y0": Y0, "paths": paths}, open(out_dir + "/emblem_paths.json", "w"))
# save an SVG for visual check
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {X1-X0} {Y1-Y0}" width="{(X1-X0)}" height="{(Y1-Y0)}"><rect width="100%" height="100%" fill="#FAF5EC"/>']
svg.append('<path fill="#A9631F" fill-rule="evenodd" d="' + " ".join(p["d"] for p in paths) + '"/>')
for i, p in enumerate(paths):
    svg.append(f'<text x="{p["cx"]:.0f}" y="{p["cy"]:.0f}" font-size="14" fill="#000" font-family="sans-serif">{i}</text>')
svg.append('</svg>')
open(out_dir + "/emblem_check.svg", "w").write("".join(svg))
# crop emblem png, pixel-exact
im.crop((X0, Y0, X1, Y1)).save(out_dir + "/emblem_crop.png")
