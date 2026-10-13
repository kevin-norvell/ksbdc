"use strict";
/* =====================================================================
   Motion engine
   Every animated value is a pure function of time t (seconds). Nothing
   accumulates between frames, so the piece can be played, paused,
   scrubbed in either direction, or rendered frame by frame with
   identical results.
   ===================================================================== */
const STAGE_W = 1920, STAGE_H = 1080;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const r2 = v => Math.round(v * 100) / 100;
const r4 = v => Math.round(v * 10000) / 10000;

function bez(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t;
  const sy = t => ((ay * t + by) * t + cy) * t;
  const dx = t => (3 * ax * t + 2 * bx) * t + cx;
  return p => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let t = p;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - p, d = dx(t);
      if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    if (t < 0 || t > 1 || Math.abs(sx(t) - p) > 1e-4) {
      let lo = 0, hi = 1;
      t = p;
      for (let i = 0; i < 30; i++) { if (sx(t) < p) lo = t; else hi = t; t = (lo + hi) / 2; }
    }
    return sy(t);
  };
}

const E = {
  lin: p => p,
  out: p => 1 - Math.pow(1 - p, 4),
  soft: p => 1 - Math.pow(1 - p, 3),
  expo: p => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  io: p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  io4: p => (p < 0.5 ? 8 * p * p * p * p : 1 - Math.pow(-2 * p + 2, 4) / 2),
  sine: p => -(Math.cos(Math.PI * p) - 1) / 2,
  in: p => p * p * p,
  in2: p => p * p,
  expoIn: p => (p <= 0 ? 0 : Math.pow(2, 10 * p - 10)),
  back: (s = 1.25) => p => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2),
  glide: bez(0.16, 1, 0.3, 1),
  camera: bez(0.65, 0, 0.25, 1),
};

const DEF = { x: 0, y: 0, s: 1, sx: 1, sy: 1, r: 0, o: 1, blur: 0, ct: 0, cr: 0, cb: 0, cl: 0, rad: 0, dash: 0, fo: 1, so: 1 };
const TF = ["x", "y", "s", "sx", "sy", "r"];
const CLIP = ["ct", "cr", "cb", "cl", "rad"];

class Timeline {
  constructor() {
    this.recs = new Map();
    this.fns = [];
    this.ticks = [];
    this.wins = [];
    this.dur = 0;
    this.seq = 0;
  }
  _els(el) {
    if (!el) throw new Error("Timeline: missing element");
    return el instanceof Element ? [el] : Array.from(el);
  }
  _rec(el) {
    let r = this.recs.get(el);
    if (!r) { r = { el, tw: {}, base: {}, c: {} }; this.recs.set(el, r); }
    return r;
  }
  _add(el, t0, dur, props, ease, ft) {
    for (const e of this._els(el)) {
      const r = this._rec(e);
      for (const k in props) {
        const v = props[k];
        (r.tw[k] || (r.tw[k] = [])).push({
          t0, t1: t0 + dur,
          from: ft ? v[0] : undefined,
          to: ft ? v[1] : v,
          ease: ease || E.out,
          seq: this.seq++,
        });
      }
    }
    this.dur = Math.max(this.dur, t0 + dur);
    return this;
  }
  /** tween from explicit start values: {prop: [from, to]} */
  ft(el, t0, dur, props, ease) { return this._add(el, t0, dur, props, ease, true); }
  /** tween from whatever the previous keyframe left behind */
  to(el, t0, dur, props, ease) { return this._add(el, t0, dur, props, ease, false); }
  set(el, t0, props) { return this._add(el, t0, 0, props, E.lin, false); }
  /** resting values before any tween runs */
  init(el, props) { for (const e of this._els(el)) Object.assign(this._rec(e).base, props); return this; }
  /** custom tween: f(progress, t) is called whenever eased progress changes */
  fn(t0, dur, f, ease = E.lin) {
    this.fns.push({ t0, t1: t0 + dur, f, ease, last: undefined });
    this.dur = Math.max(this.dur, t0 + dur);
    return this;
  }
  /** called on every render with the raw time */
  tick(f) { this.ticks.push(f); return this; }
  /** element is display:none outside [a, b) */
  window(el, a, b) { this.wins.push({ el, a, b, last: undefined }); return this; }

  compile() {
    for (const r of this.recs.values()) {
      for (const k in r.base) {
        if (!r.tw[k]) r.tw[k] = [{ t0: -1e9, t1: -1e9, from: r.base[k], to: r.base[k], ease: E.lin, seq: -1 }];
      }
      for (const k in r.tw) {
        const list = r.tw[k].sort((a, b) => a.t0 - b.t0 || a.seq - b.seq);
        let prev = k in r.base ? r.base[k] : k in DEF ? DEF[k] : 0;
        for (const tw of list) {
          if (tw.from === undefined) tw.from = prev;
          prev = tw.to;
        }
      }
      r.keys = Object.keys(r.tw);
      r.hasTf = r.keys.some(k => TF.includes(k));
      r.hasClip = r.keys.some(k => CLIP.includes(k));
    }
  }
  static val(list, t) {
    if (t < list[0].t0) return list[0].from;
    let i = list.length - 1;
    while (i > 0 && list[i].t0 > t) i--;
    const tw = list[i];
    if (t >= tw.t1) return tw.to;
    return tw.from + (tw.to - tw.from) * tw.ease((t - tw.t0) / (tw.t1 - tw.t0));
  }
  render(t) {
    for (const w of this.wins) {
      const on = t >= w.a && t < w.b;
      if (on !== w.last) { w.el.style.display = on ? "" : "none"; w.last = on; }
    }
    for (const r of this.recs.values()) {
      const v = {};
      for (const k of r.keys) v[k] = Timeline.val(r.tw[k], t);
      applyProps(r, v);
    }
    for (const f of this.fns) {
      const p = t < f.t0 ? 0 : t >= f.t1 ? 1 : f.ease((t - f.t0) / (f.t1 - f.t0));
      if (p !== f.last) { f.last = p; f.f(p, t); }
    }
    for (const f of this.ticks) f(t);
  }
}

function setPx(st, c, prop, val) {
  const v = r2(val);
  if (c[prop] !== v) { st[prop] = v + "px"; c[prop] = v; }
}

function applyProps(r, v) {
  const st = r.el.style, c = r.c;
  if (r.hasTf) {
    const s = v.s ?? 1;
    const tf = `translate(${r2(v.x ?? 0)}px,${r2(v.y ?? 0)}px) rotate(${r2(v.r ?? 0)}deg) scale(${r4((v.sx ?? 1) * s)},${r4((v.sy ?? 1) * s)})`;
    if (tf !== c.tf) { st.transform = tf; c.tf = tf; }
  }
  if ("o" in v) {
    const o = r4(clamp(v.o));
    if (o !== c.o) { st.opacity = o; st.visibility = o <= 0.001 ? "hidden" : ""; c.o = o; }
  }
  if ("blur" in v) {
    const b = v.blur > 0.05 ? `blur(${r2(v.blur)}px)` : "none";
    if (b !== c.b) { st.filter = b; c.b = b; }
  }
  if (r.hasClip) {
    const cp = `inset(${r2(v.ct ?? 0)}% ${r2(v.cr ?? 0)}% ${r2(v.cb ?? 0)}% ${r2(v.cl ?? 0)}% round ${r2(v.rad ?? 0)}px)`;
    if (cp !== c.cp) { st.clipPath = cp; st.webkitClipPath = cp; c.cp = cp; }
  }
  for (const k of r.keys) {
    if (k.charCodeAt(0) === 45) { // "--custom-property"
      const val = r4(v[k]);
      if (c[k] !== val) { st.setProperty(k, val); c[k] = val; }
      continue;
    }
    switch (k) {
      case "w": setPx(st, c, "width", v.w); break;
      case "h": setPx(st, c, "height", v.h); break;
      case "left": setPx(st, c, "left", v.left); break;
      case "top": setPx(st, c, "top", v.top); break;
      case "dash": if (c.dash !== v.dash) { st.strokeDashoffset = r4(v.dash); c.dash = v.dash; } break;
      case "fo": if (c.fo !== v.fo) { st.fillOpacity = r4(v.fo); c.fo = v.fo; } break;
      case "so": if (c.so !== v.so) { st.strokeOpacity = r4(v.so); c.so = v.so; } break;
    }
  }
}

/* ---------- DOM + text helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/** Split text nodes into per-character spans (words kept intact for wrapping). */
function splitChars(el) {
  const out = [];
  const walk = node => {
    for (const n of Array.from(node.childNodes)) {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const part of n.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            for (const ch of part) {
              const s = document.createElement("span");
              s.className = "ch";
              s.textContent = ch;
              frag.appendChild(s);
              out.push(s);
            }
            continue;
          }
          const w = document.createElement("span");
          w.className = "wd";
          for (const ch of part) {
            const s = document.createElement("span");
            s.className = "ch";
            s.textContent = ch;
            w.appendChild(s);
            out.push(s);
          }
          frag.appendChild(w);
        }
        n.replaceWith(frag);
      } else if (n.nodeType === 1) {
        walk(n);
      }
    }
  };
  walk(el);
  return out;
}

/** Split text nodes into inline-block word spans for word-by-word motion. */
function splitWords(el) {
  const out = [];
  const walk = node => {
    for (const n of Array.from(node.childNodes)) {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const part of n.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); continue; }
          const s = document.createElement("span");
          s.className = "w";
          s.textContent = part;
          frag.appendChild(s);
          out.push(s);
        }
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains("w")) {
        walk(n);
      }
    }
  };
  walk(el);
  return out;
}

/**
 * Typewriter over a text element. Characters keep their layout slot while
 * hidden, so lines never re-wrap as they type. Segments may pause between.
 */
function typist(tl, textEl, caretEl) {
  const cs = splitChars(textEl);
  const full = cs.map(c => c.textContent).join("");
  const segs = [];
  let idx = 0;
  const api = {
    cs, full, segs,
    win: [0, 0],
    pos: null,
    seg(t0, count, cps) {
      const a = idx, b = Math.min(cs.length, idx + count), n = b - a, dur = n / cps;
      let shown = -1;
      tl.fn(t0, dur, p => {
        const k = Math.round(p * n);
        if (k === shown) return;
        for (let i = 0; i < n; i++) cs[a + i].classList.toggle("on", i < k);
        shown = k;
      });
      segs.push({ a, b, t0, t1: t0 + dur });
      idx = b;
      return t0 + dur;
    },
    through(str, t0, cps) {
      const j = full.indexOf(str, idx);
      if (j < 0) throw new Error("typist: text not found: " + str);
      return api.seg(t0, j + str.length - idx, cps);
    },
    rest(t0, cps) { return api.seg(t0, cs.length - idx, cps); },
    countAt(t) {
      let count = 0, typing = false;
      for (const s of segs) {
        if (t >= s.t1) count = s.b;
        else if (t >= s.t0) { count = s.a + Math.round(((t - s.t0) / (s.t1 - s.t0)) * (s.b - s.a)); typing = true; }
      }
      return [count, typing];
    },
  };
  if (caretEl) {
    tl.tick(t => {
      const [a, b] = api.win;
      if (t < a || t >= b) { caretEl.style.opacity = 0; return; }
      if (!api.pos) api.pos = cs.map(c => [c.offsetLeft, c.offsetTop, c.offsetWidth, c.offsetHeight]);
      const [count, typing] = api.countAt(t);
      const p = api.pos[Math.max(0, count - 1)];
      const x = count === 0 ? p[0] : p[0] + p[2];
      caretEl.style.transform = `translate(${x}px, ${p[1]}px)`;
      caretEl.style.height = p[3] + "px";
      caretEl.style.opacity = typing || (t - a) % 1.06 < 0.62 ? 1 : 0;
    });
  }
  return api;
}

/** Masked line rise: each .ln > span slides up from below its own clip. */
function riseLines(tl, spans, t0, { dy = 1.05, dur = 1.0, stag = 0.12, ease = E.glide } = {}) {
  spans.forEach((s, i) => {
    const h = s.offsetHeight || 80;
    tl.ft(s, t0 + i * stag, dur, { y: [h * dy, 0] }, ease);
  });
  return t0 + (spans.length - 1) * stag + dur;
}

function fadeUp(tl, el, t0, dur = 0.7, dy = 18, ease = E.out) {
  tl.ft(el, t0, dur, { o: [0, 1], y: [dy, 0] }, ease);
  return t0 + dur;
}

function fadeOut(tl, el, t0, dur = 0.45, dy = -12) {
  tl.to(el, t0, dur, { o: 0, y: dy }, E.in2);
  return t0 + dur;
}

/** Pointer that eases between targets and "clicks" with a copper ripple. */
function makeCursor(tl, parent, start) {
  const cur = document.createElement("div");
  cur.className = "cursor";
  cur.innerHTML = '<svg viewBox="0 0 28 36" aria-hidden="true"><path d="M2 2 L2 28 L9 21.5 L13.6 32.5 L18.2 30.6 L13.7 19.8 L23 19.8 Z" fill="#fff" stroke="#2F2B28" stroke-width="2.2" stroke-linejoin="round"/></svg>';
  parent.appendChild(cur);
  tl.init(cur, { x: start[0], y: start[1], o: 0 });
  let at = [start[0], start[1]];
  return {
    el: cur,
    show(t, d = 0.3) { tl.ft(cur, t, d, { o: [0, 1] }, E.out); return this; },
    hide(t, d = 0.3) { tl.to(cur, t, d, { o: 0 }, E.in2); return this; },
    move(t, d, x, y) { tl.to(cur, t, d, { x, y }, E.io4); at = [x, y]; return this; },
    click(t) {
      tl.to(cur, t, 0.09, { s: 0.84 }, E.out).to(cur, t + 0.09, 0.22, { s: 1 }, E.out);
      const rp = document.createElement("i");
      rp.className = "ripple";
      rp.style.left = at[0] + "px";
      rp.style.top = at[1] + "px";
      parent.insertBefore(rp, cur);
      tl.ft(rp, t, 0.65, { s: [0.2, 1.6], o: [0.9, 0] }, E.out);
      return this;
    },
  };
}

/* ---------- Emblem (traced from the supplied logo artwork) ---------- */
const EMBLEM = { w: 625, h: 436, ax: 210, ay: 338, paths: __EMBLEM_PATHS__ };
const LOGO_PX = { w: 1774, h: 887, emb: [562, 106, 625, 436], content: [71, 116, 1639, 672] };

/** Show only the wheat-and-loaf emblem of the full logo image (pixel crop, unaltered). */
function cropEmblem(el, w) {
  const k = w / EMBLEM.w;
  el.classList.add("bg-logo", "emb");
  el.style.width = r2(w) + "px";
  el.style.height = r2(EMBLEM.h * k) + "px";
  el.style.backgroundSize = `${r2(LOGO_PX.w * k)}px ${r2(LOGO_PX.h * k)}px`;
  el.style.backgroundPosition = `${r2(-LOGO_PX.emb[0] * k)}px ${r2(-LOGO_PX.emb[1] * k)}px`;
}

/** Place the full logo so its visible artwork spans `contentW` px, top-left at (x, y). */
function placeLogo(el, contentW, x, y) {
  const k = contentW / LOGO_PX.content[2];
  el.classList.add("bg-logo");
  Object.assign(el.style, {
    position: "absolute",
    width: r2(LOGO_PX.w * k) + "px",
    height: r2(LOGO_PX.h * k) + "px",
    left: r2(x - LOGO_PX.content[0] * k) + "px",
    top: r2(y - LOGO_PX.content[1] * k) + "px",
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
  });
  return { k, h: LOGO_PX.content[3] * k };
}

function emblemPathsMarkup(attrs = "") {
  return EMBLEM.paths.map(d => `<path d="${d}" ${attrs}/>`).join("");
}
