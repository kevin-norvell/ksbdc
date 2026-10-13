/* =====================================================================
   The piece: twelve scenes on one 128-second timeline.
   Times are absolute seconds. Coordinates are stage pixels (1920×1080).
   ===================================================================== */
const DUR = 128;
const POSTER_T = 6.9;

const CHAPTERS = [
  [0, "Open"],
  [8, "Meet the bakery"],
  [16, "The ask"],
  [26, "What it is"],
  [34, "What you need"],
  [44, "Build it"],
  [66, "Before you publish"],
  [76, "Go live"],
  [90, "Your own domain"],
  [100, "Keep it current"],
  [108, "Know your responsibilities"],
  [120, "Close"],
];

/* Narration, also shown as optional captions (press C). */
const CAPTIONS = [
  [0.5, 4.0, "Meet Rickhouse Row Bakery, a demo bakery in Bardstown, Kentucky."],
  [4.0, 7.9, "Let’s take it from idea to website with ChatGPT Sites."],
  [8.3, 11.6, "It’s at 123 Main Street and opens at 6 AM."],
  [11.6, 15.6, "What it doesn’t have is a website."],
  [16.3, 20.2, "So start by describing one. Say “website,” or mention @Sites."],
  [20.2, 25.4, "Attach your logo and photos, and list what the site needs."],
  [26.2, 30.4, "ChatGPT Sites lets you create, preview, publish, and share websites and lightweight apps,"],
  [30.4, 33.6, "just by describing them to ChatGPT."],
  [34.3, 38.6, "Sites is in public beta on Plus, Pro, Business, and Enterprise."],
  [38.6, 43.6, "Use Work on the web, or Work or Codex in the desktop app."],
  [45.2, 46.9, "Building is a loop. Describe what you want."],
  [46.9, 49.0, "Add your photos, files, and links."],
  [49.0, 52.0, "Review the private preview."],
  [52.0, 54.6, "Then ask for changes. “Add a map to 123 Main Street.”"],
  [54.6, 58.6, "The preview updates."],
  [58.6, 61.0, "“Put the cinnamon rolls at the top of the menu.”"],
  [61.0, 65.8, "Updated again. Keep going until it’s right."],
  [66.3, 70.0, "One thing to know: every deployment URL is a production URL."],
  [70.0, 75.6, "So save a version, review it, and then deploy."],
  [76.4, 79.6, "When it’s ready, select Share. A new site starts visible only to you."],
  [79.6, 83.0, "Under “Who has access,” choose “Anyone on the internet,” then Publish."],
  [83.0, 89.6, "Use Visit to open it, or Copy link to share it."],
  [90.2, 93.6, "Using your own domain? You must already own it."],
  [93.6, 99.6, "Add it in Site settings, paste the DNS records at your provider, then refresh the status."],
  [100.2, 103.6, "Open your live site, click Edit site, and describe the change."],
  [103.6, 107.8, "Nothing changes on the live site until you publish."],
  [108.4, 111.3, "Review everything before going public."],
  [111.3, 113.4, "Forms and their data are your responsibility."],
  [113.4, 115.5, "Take payments through a third-party processor."],
  [115.5, 117.6, "No health or card data."],
  [117.6, 119.9, "And deleting a site is permanent."],
  [121.0, 124.0, "Describe it. Preview it. Publish it."],
  [124.0, 127.9, "From idea to website."],
];

/* ---------- small builders ---------- */
function rectOf(el) {
  const s = $("#stage").getBoundingClientRect(), r = el.getBoundingClientRect();
  const x = r.left - s.left, y = r.top - s.top;
  return { x, y, w: r.width, h: r.height, cx: x + r.width / 2, cy: y + r.height / 2 };
}
const ctr = el => { const r = rectOf(el); return [r.cx, r.cy]; };

function mk(tag, cls, parent, style = {}) {
  const el = document.createElement(tag);
  el.className = cls;
  Object.assign(el.style, style);
  if (parent) parent.appendChild(el);
  return el;
}

/** appear instantly, then fade while growing (ripples, rings) */
function burst(tl, el, t0, d, { o = 0.9, s = [0.2, 1.6] } = {}) {
  tl.ft(el, t0, 0.04, { o: [0, o] }, E.lin);
  tl.to(el, t0 + 0.04, d, { o: 0 }, E.out);
  tl.ft(el, t0, d + 0.04, { s }, E.out);
}
function flash(tl, el, t0, hold) {
  tl.ft(el, t0, 0.3, { o: [0, 1] }, E.out);
  tl.to(el, t0 + hold, 0.4, { o: 0 }, E.in2);
}
function pop(tl, el, t0, hold) {
  tl.ft(el, t0, 0.45, { o: [0, 1], s: [0.8, 1] }, E.back(1.8));
  if (hold != null) tl.to(el, t0 + hold, 0.35, { o: 0 }, E.in2);
}
function press(tl, el, t) {
  tl.to(el, t, 0.1, { s: 0.88 }, E.out).to(el, t + 0.1, 0.32, { s: 1 }, E.back(2));
}
function siteHl(ws, r, pad = 6) {
  return mk("i", "ws-hl", ws, { left: r.x - pad + "px", top: r.y - pad + "px", width: r.w + pad * 2 + "px", height: r.h + pad * 2 + "px" });
}
function siteCallout(ws, text, x, y) {
  const el = mk("span", "ws-callout", ws, { left: x + "px", top: y + "px" });
  el.innerHTML = ico("check") + text;
  return el;
}
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The copper emblem lands, then opens like a window onto the next scene. */
function emblemWipe(tl, scene, t0, dur) {
  const stamp = $("#stamp");
  tl.ft(stamp, t0 - 0.5, 0.45, { o: [0, 1], s: [0.25, 0.62] }, E.back(1.5));
  tl.to(stamp, t0 + 0.02, 0.24, { o: 0 }, E.lin);
  const g = $("#embClip"); // transform lives on <clipPath>; a <g> is not valid clip content
  const s0 = 0.62, s1 = 34;
  tl.fn(t0, dur, p => {
    if (p >= 1) { scene.style.clipPath = "none"; scene.style.webkitClipPath = "none"; return; }
    const s = s0 * Math.pow(s1 / s0, p);
    g.setAttribute("transform", `translate(${r2(960 - EMBLEM.ax * s)} ${r2(540 - EMBLEM.ay * s)}) scale(${r4(s)})`);
    scene.style.clipPath = "url(#embClip)";
    scene.style.webkitClipPath = "url(#embClip)";
  }, E.in2);
}

/* ---------- atmosphere that runs under everything ---------- */
function atmosphere(tl) {
  const l1 = $(".l1"), l2 = $(".l2");
  tl.tick(t => {
    l1.style.transform = `translate(${r2(Math.sin(t * 0.07) * 140)}px, ${r2(Math.cos(t * 0.05) * 90)}px)`;
    l2.style.transform = `translate(${r2(Math.cos(t * 0.06) * -160)}px, ${r2(Math.sin(t * 0.045) * 100)}px)`;
  });

  const wm = $("#wm");
  cropEmblem(wm, 76);
  tl.init(wm, { o: 0 });
  tl.to(wm, 8.7, 0.8, { o: 0.3 }, E.out);
  tl.to(wm, 118.7, 0.4, { o: 0 }, E.out);

  const cv = $("#dust"), ctx = cv.getContext("2d"), rnd = mulberry32(11);
  const P = Array.from({ length: 80 }, () => ({
    x: rnd() * 1920, y: rnd() * 1080, r: 0.7 + rnd() * 2.1,
    vx: (rnd() - 0.5) * 16, vy: -5 - rnd() * 12, a: 0.12 + rnd() * 0.35, ph: rnd() * 6.283, f: 0.3 + rnd() * 0.9,
  }));
  let drawn = null;
  tl.init(cv, { o: 1 });
  tl.to(cv, 7.3, 0.8, { o: 0 }, E.out);
  tl.to(cv, 120.6, 1.4, { o: 1 }, E.sine);
  tl.tick(t => {
    if (!(t < 8.2 || t > 120.5) || t === drawn) return;
    drawn = t;
    ctx.clearRect(0, 0, 1920, 1080);
    ctx.fillStyle = "#F6E3C6";
    for (const p of P) {
      const x = (((p.x + p.vx * t + Math.sin(t * p.f + p.ph) * 14) % 1920) + 1920) % 1920;
      const y = (((p.y + p.vy * t) % 1080) + 1080) % 1080;
      ctx.globalAlpha = p.a * (0.55 + 0.45 * Math.sin(t * p.f * 1.7 + p.ph));
      ctx.beginPath();
      ctx.arc(x, y, p.r, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });

  const span = $("#cc span");
  let cur = -1;
  tl.tick(t => {
    let k = -1;
    for (let i = 0; i < CAPTIONS.length; i++) if (t >= CAPTIONS[i][0] && t < CAPTIONS[i][1]) { k = i; break; }
    if (k !== cur) { cur = k; span.textContent = k < 0 ? "" : CAPTIONS[k][2]; }
  });
}

/* =====================================================================
   1 · Open (0–8): the emblem draws itself, resolves into the full logo.
   ===================================================================== */
function scene1(tl) {
  const s1 = $("#s1");
  tl.window(s1, 0, 8.1);
  const rig = $("#rig");
  tl.window(rig, 0, 15.8);
  const g = $(".trace-paths", rig);
  g.innerHTML = emblemPathsMarkup('pathLength="1"');
  $("#rigClip").innerHTML = emblemPathsMarkup();
  const paths = $$("path", g);
  tl.init(rig, { x: 0, y: 0, s: 0.96 });
  tl.init(paths, { dash: 1, fo: 0, so: 1 });

  // stems and loaf first, then each wheat leaf from the bottom up
  const order = [
    [0, 0.35, 1.5], [1, 0.45, 1.5], [2, 0.7, 1.4],
    ...[4, 6, 9, 11, 14, 15, 16, 17, 18].map((k, i) => [k, 0.95 + i * 0.11, 0.75]),
    ...[3, 7, 5, 10, 8, 12, 13].map((k, i) => [k, 1.05 + i * 0.11, 0.75]),
  ];
  for (const [k, t0, d] of order) {
    tl.ft(paths[k], t0, d, { dash: [1, 0] }, E.io);
    tl.ft(paths[k], t0 + d - 0.3, 0.6, { fo: [0, 1] }, E.out);
  }
  tl.to(paths, 3.0, 0.4, { so: 0 }, E.out);
  tl.ft($(".rig-em", rig), 2.8, 0.45, { o: [0, 1] }, E.out);
  tl.to(g, 3.15, 0.35, { o: 0 }, E.out);
  tl.ft($(".sheen", rig), 3.05, 0.95, { x: [0, 820] }, E.io);

  const panel = $(".s1-panel", s1);
  tl.init(panel, { w: 0, o: 0 });
  tl.to(panel, 3.35, 0.15, { o: 1 }, E.lin);
  tl.to(panel, 3.35, 1.0, { w: 860 }, E.glide);
  tl.to(rig, 3.3, 1.25, { x: -537.04, y: -56.28, s: 0.4397 }, E.camera);
  tl.ft($(".rig-wm", rig), 4.25, 1.0, { "--w": [0, 1] }, E.io);

  const spans = $$(".s1-title .ln > span", s1);
  riseLines(tl, spans.slice(0, 2), 4.6, { stag: 0.16, dur: 1.1 });
  riseLines(tl, [spans[2]], 5.15, { dur: 1.0 });
  tl.ft($(".s1-rule", s1), 5.45, 0.8, { sx: [0, 1] }, E.glide);
  riseLines(tl, [spans[3]], 5.6, { dur: 1.0 });

  // the cream panel becomes scene 2's page; the logo settles into its corner
  tl.to(panel, 7.25, 0.85, { w: 1920 }, E.camera);
  tl.to($(".s1-title", s1), 7.15, 0.55, { o: 0, x: 60 }, E.in2);
  tl.to(rig, 7.25, 0.85, { x: -633.71, y: -241.78, s: 0.23185 }, E.camera);
}

/* =====================================================================
   2 · Meet the bakery (8–16)
   ===================================================================== */
const CARD_H = { roll: 408, loaf: 408, cookie: 408, hero: 263.7, logo: 243 };
const cardAt = (k, cx, cy) => ({ x: cx - 179, y: cy - CARD_H[k] / 2 });
const CARDS = () => ({ logo: $("#pcLogo"), hero: $("#pcHero"), roll: $("#pcRoll"), loaf: $("#pcLoaf"), cookie: $("#pcCookie") });
const TRAY = { logo: [1715, 300, -4], hero: [1748, 432, 3], roll: [1692, 566, -3], loaf: [1750, 706, 4], cookie: [1700, 846, -2] };

function scene2(tl) {
  const s2 = $("#s2");
  tl.window(s2, 7.9, 16.3);
  tl.ft($(".eyebrow", s2), 8.3, 0.7, { o: [0, 1], x: [-16, 0] }, E.out);
  const spans = $$(".s2-lines .ln > span", s2);
  riseLines(tl, [spans[0]], 8.9, { dur: 1.0 });
  riseLines(tl, [spans[1]], 10.25, { dur: 1.0 });
  riseLines(tl, [spans[2]], 11.6, { dur: 1.0 });

  const under = $(".s2-under", s2), em = $(".s2-lines em", s2), box = $(".s2-text", s2);
  const er = em.getBoundingClientRect(), br = box.getBoundingClientRect();
  Object.assign(under.style, { width: er.width + 12 + "px", left: er.left - br.left - 4 + "px", top: er.bottom - br.top - 4 + "px" });
  tl.ft($("path", under), 12.35, 0.8, { dash: [1, 0] }, E.io);

  tl.to(box, 15.15, 0.5, { o: 0, y: -24 }, E.in2);
  tl.to($("#rig"), 15.15, 0.5, { o: 0, y: -261.78 }, E.in2);

  const C = CARDS();
  const S2POS = { roll: [1130, 322, -5], loaf: [1556, 398, 3.5], cookie: [1262, 772, -2] };
  ["roll", "loaf", "cookie"].forEach((k, i) => {
    const [cx, cy, r] = S2POS[k], a = cardAt(k, cx, cy), from = cardAt(k, cx + 900, cy + 160);
    tl.window(C[k], 8.0, 21.6);
    tl.ft(C[k], 8.4 + i * 0.16, 1.3, { x: [from.x, a.x], y: [from.y, a.y], r: [14, r] }, E.glide);
    tl.ft(C[k], 8.4 + i * 0.16, 0.4, { o: [0, 1] }, E.out);
    // gather into a tray of "your stuff" for the next scene
    const [tx, ty, tr] = TRAY[k], ta = cardAt(k, tx, ty);
    tl.to(C[k], 15.25 + i * 0.07, 0.95, { x: ta.x, y: ta.y, r: tr, s: 0.4 }, E.camera);
    tl.to($("b", C[k]), 15.2, 0.3, { o: 0 }, E.in2);
  });
  ["logo", "hero"].forEach((k, i) => {
    const [tx, ty, tr] = TRAY[k], ta = cardAt(k, tx, ty);
    tl.window(C[k], 15.4, 21.6);
    tl.ft(C[k], 15.55 + i * 0.1, 0.8, { x: [ta.x + 120, ta.x], y: [ta.y - 70, ta.y], r: [tr + 8, tr], s: [0.4, 0.4] }, E.glide);
    tl.ft(C[k], 15.55 + i * 0.1, 0.35, { o: [0, 1] }, E.out);
  });
}

/* =====================================================================
   3 · The ask (16–26)
   ===================================================================== */
function scene3(tl) {
  const s3 = $("#s3");
  tl.window(s3, 15.6, 25.6);
  fadeUp(tl, $(".s3-head .eyebrow", s3), 16.0, 0.6, 12);
  riseLines(tl, [$(".s3-head .ln > span", s3)], 16.1, { dur: 1.0 });
  const trayLabel = $(".tray-label", s3);
  fadeUp(tl, trayLabel, 16.3, 0.6, 10);
  tl.to(trayLabel, 19.95, 0.4, { o: 0 }, E.in2);

  const box = $(".cmp-box", s3), txt = $(".cmp-text", s3);
  tl.init(box, { top: 570, h: 260 });
  tl.ft([box, $(".cmp-plus", s3), $(".cmp-send", s3), txt], 16.2, 0.8, { o: [0, 1], y: [30, 0] }, E.glide);
  tl.to($(".cmp-ph", s3), 16.85, 0.15, { o: 0 }, E.lin);

  placeLogo($(".th-logo-img", s3), 150, 14, (100 - 150 * 672 / 1639) / 2);

  const kw = $(".kw", s3);
  const kwX = 204 + kw.offsetLeft, kwW = kw.offsetWidth;
  const ty = typist(tl, $(".cmp-typed", s3), $(".caret", s3));
  ty.win = [16.8, 24.6];
  const e1 = ty.through("KY. ", 16.9, 34);
  tl.ft(kw, 17.38, 0.5, { "--hl": [0, 1] }, E.out);

  const call = $(".callout", s3);
  Object.assign(call.style, { left: kwX + kwW / 2 - 43 + "px", top: "492px" });
  tl.ft(call, 17.55, 0.55, { o: [0, 1], s: [0.85, 1], y: [10, 0] }, E.back(1.6));
  tl.to(call, 19.8, 0.3, { o: 0, y: -8 }, E.in2);

  ty.through("photos. ", e1 + 0.12, 34);

  // the composer grows and the files fly in
  tl.to(box, 19.95, 0.6, { top: 440, h: 390 }, E.glide);
  const thumbs = $$(".cmp-att .th", s3), C = CARDS();
  ["logo", "hero", "roll", "loaf", "cookie"].forEach((k, i) => {
    const r = rectOf(thumbs[i]);
    const sc = k === "logo" ? 0.5 : r.w / 330;
    const a = cardAt(k, r.cx, r.cy + 25 * sc);
    const t0 = 20.05 + i * 0.12, d = 0.75;
    tl.to(C[k], t0, d, { x: a.x, y: a.y, r: 0, s: sc }, E.io);
    tl.to(C[k], t0 + d - 0.12, 0.14, { o: 0 }, E.lin);
    tl.ft(thumbs[i], t0 + d - 0.14, 0.14, { o: [0, 1] }, E.lin);
  });

  ty.rest(21.05, 33);
  tl.to($(".s3-cam", s3), 21.35, 1.5, { x: 130 }, E.io);

  const send = $(".cmp-send", s3);
  press(tl, send, 24.45);
  const rp = mk("i", "ripple", $(".s3-cam", s3), { left: 1452 + "px", top: 790 + "px" });
  burst(tl, rp, 24.45, 0.6);
  tl.to(s3, 24.8, 0.65, { o: 0, y: -40 }, E.in2);
}

/* =====================================================================
   4 · What it is (26–34): the homepage assembles from blocks.
   ===================================================================== */
const WIREFRAME = {
  nav: '<i class="sk-c"></i><span class="sp"></span><i class="sk-b" style="width:60px"></i><i class="sk-b" style="width:60px"></i><i class="sk-b" style="width:70px"></i>',
  copy: '<i class="sk-blk" style="width:290px;height:110px"></i><i class="sk-b" style="width:92%"></i><i class="sk-b" style="width:70%"></i><span class="row"><i class="sk-pill"></i><i class="sk-pill"></i></span>',
  photo: "__PHOTO__",
  menu: '<i class="sk-b" style="width:30%"></i>' + '<span class="row"><i class="sk-sq"></i><i class="sk-b" style="width:55%"></i></span>'.repeat(4),
  visit: '<i class="sk-b" style="width:30%"></i><i class="sk-card"></i><i class="sk-card"></i>',
  contact: '<i class="sk-b" style="width:36%"></i><i class="sk-field"></i><i class="sk-field"></i><i class="sk-field tall"></i><i class="sk-pill"></i>',
  foot: '<i class="sk-b" style="width:240px"></i>',
};

function scene4(tl) {
  const s4 = $("#s4");
  tl.window(s4, 25.3, 34.3);
  const frame = $(".s4-frame", s4);
  tl.ft(frame, 25.35, 1.1, { o: [0, 1], y: [90, 0], s: [0.95, 1] }, E.glide);
  fadeUp(tl, $(".eyebrow", s4), 25.8, 0.6, 12);
  riseLines(tl, [$(".s4-title > span", s4)], 25.95, { dur: 1.05 });
  splitWords($(".s4-def", s4)).forEach((w, i) => tl.ft(w, 26.55 + i * 0.045, 0.55, { o: [0, 1], y: [16, 0] }, E.out));
  fadeUp(tl, $(".s4-note", s4), 28.2, 0.6, 10);

  const slot = $("#site4"), ws = mountSite(slot, {});
  tl.init(slot, { s: 1060 / SITE_W });
  const blocks = $$("[data-b]", ws);
  const wfs = blocks.map(b => {
    const r = siteRect(b, ws), kind = b.dataset.b;
    const wf = mk("div", "wf wf-" + kind, ws, { left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px" });
    wf.innerHTML = kind === "photo" ? ico("browser") : WIREFRAME[kind];
    return wf;
  });
  wfs.forEach((wf, i) => tl.ft(wf, 25.75 + i * 0.11, 0.55, { o: [0, 1], s: [0.97, 1] }, E.out));
  const T = { nav: 28.1, copy: 28.45, photo: 28.8, menu: 29.25, visit: 29.85, contact: 30.4, foot: 30.95 };
  blocks.forEach((b, i) => {
    const t = T[b.dataset.b];
    tl.ft(b, t, 0.7, { o: [0, 1], y: [14, 0] }, E.glide);
    tl.to(wfs[i], t + 0.15, 0.45, { o: 0 }, E.out);
  });
  tl.ft($(".ws-photo", ws), 28.8, 1.2, { s: [1.04, 1] }, E.glide);
  $$(".ws-item", ws).forEach((it, j) => tl.ft(it, T.menu + 0.15 + j * 0.1, 0.5, { o: [0, 1], x: [-12, 0] }, E.out));
  $$(".ws-card", ws).forEach((c, j) => tl.ft(c, T.visit + 0.15 + j * 0.14, 0.5, { o: [0, 1], y: [10, 0] }, E.out));
  $$(".ws-field, .ws-send", ws).forEach((f, j) => tl.ft(f, T.contact + 0.12 + j * 0.08, 0.45, { o: [0, 1], y: [8, 0] }, E.out));

  // "private" gets a gentle nudge
  const pill = $(".pill", frame), pr = rectOf(pill), fr = rectOf(frame);
  const ring = mk("i", "ring-pulse", frame, { left: pr.x - fr.x - 5 + "px", top: pr.y - fr.y - 5 + "px", width: pr.w + 10 + "px", height: pr.h + 10 + "px", borderRadius: "999px" });
  burst(tl, ring, 31.7, 0.9, { o: 1, s: [1, 1.25] });
  burst(tl, ring, 32.5, 0.9, { o: 0.8, s: [1, 1.25] });

  tl.to(s4, 33.3, 0.7, { o: 0, x: -90 }, E.in2);
}

/* =====================================================================
   5 · What you need (34–44)
   ===================================================================== */
function scene5(tl) {
  const s5 = $("#s5");
  tl.window(s5, 33.6, 45.4);
  fadeUp(tl, $(".s5-head .eyebrow", s5), 33.8, 0.6, 12);
  riseLines(tl, [$(".s5-title .ln > span", s5)], 33.9, { dur: 1.0 });

  const plans = $$(".plan", s5);
  plans.forEach((p, i) => tl.ft(p, 34.35 + i * 0.07, 0.75, { o: [0, 1], y: [28, 0] }, E.glide));
  const pr = plans.map(rectOf);
  const na = $(".plan-note.na", s5), wsp = $(".plan-note.wsp", s5);
  Object.assign(na.style, { left: pr[0].x + "px", width: pr[1].x + pr[1].w - pr[0].x + "px" });
  Object.assign(wsp.style, { left: pr[4].x + "px", width: pr[5].x + pr[5].w - pr[4].x + "px" });
  plans.slice(0, 2).forEach((p, i) => {
    const b = $("b", p), st = $(".strike", p), w = b.offsetWidth;
    Object.assign(st.style, { left: b.offsetLeft - 10 + "px", width: w + 20 + "px" });
    tl.to(p, 35.5 + i * 0.1, 0.6, { o: 0.4 }, E.out);
    tl.ft(st, 35.6 + i * 0.1, 0.45, { sx: [0, 1] }, E.out);
  });
  plans.slice(2).forEach((p, i) => {
    const t = 35.75 + i * 0.25;
    tl.ft($(".lit", p), t, 0.45, { o: [0, 1] }, E.out);
    tl.ft($(".chk", p), t + 0.05, 0.55, { s: [0, 1] }, E.back(1.8));
    tl.to(p, t, 0.18, { s: 1.06 }, E.out).to(p, t + 0.18, 0.5, { s: 1 }, E.out);
  });
  tl.ft($(".beta", s5), 36.7, 0.55, { o: [0, 1], s: [0.6, 1] }, E.back(1.8));
  fadeUp(tl, $(".plan-note.na", s5), 36.1, 0.5, 8);
  tl.ft($(".brk", wsp), 36.95, 0.45, { sy: [0, 1] }, E.out);
  tl.ft($("span", wsp), 37.1, 0.5, { o: [0, 1], y: [8, 0] }, E.out);

  fadeUp(tl, $(".where .eyebrow", s5), 38.3, 0.6, 10);
  $$(".wcard", s5).forEach((c, i) => tl.ft(c, 38.5 + i * 0.15, 0.8, { o: [0, 1], y: [34, 0] }, E.glide));
  $$(".chips > *", s5).forEach((c, i) => tl.ft(c, 39.35 + i * 0.13, 0.5, { o: [0, 1], s: [0.7, 1] }, E.back(1.6)));
  fadeUp(tl, $(".s5-foot", s5), 40.5, 0.7, 10);
}

/* =====================================================================
   6 · Build it (44–66): the four-step loop, with two live revisions.
   ===================================================================== */
function scene6(tl) {
  const s6 = $("#s6");
  tl.window(s6, 44.0, 66.4);
  emblemWipe(tl, s6, 44.0, 1.3);

  // tracker
  const NX = [260, 727, 1193, 1660];
  const nodes = $$(".trk-node", s6), labs = $$(".trk-lab", s6);
  nodes.forEach((n, i) => { n.style.left = NX[i] + "px"; n.innerHTML = '<i class="on"></i>'; });
  labs.forEach((l, i) => { l.style.left = NX[i] + "px"; });
  tl.init(labs, { o: 0.42 });
  const fill = $(".trk-fill", s6);
  tl.init(fill, { sx: 0 });
  const marker = $(".trk-marker", s6);
  cropEmblem(marker, 66);
  tl.init(marker, { x: NX[0] - 33, y: 56, o: 0 });
  tl.ft(marker, 45.3, 0.55, { o: [0, 1], y: [36, 56] }, E.back(1.5));
  [45.4, 46.9, 49.0, 52.0].forEach((t, i) => {
    if (i > 0) {
      tl.to(marker, t, 0.8, { x: NX[i] - 33 }, E.io);
      tl.to(fill, t, 0.8, { sx: i / 3 }, E.io);
    }
    const on = t + (i > 0 ? 0.62 : 0.1);
    tl.ft($(".on", nodes[i]), on, 0.5, { s: [0, 1] }, E.back(2));
    tl.to(labs[i], on, 0.5, { o: 1 }, E.out);
  });

  // chat column
  const chat = $(".chat", s6);
  placeLogo($(".m1-att .th-logo-img", s6), 80, 8, (54 - 80 * 672 / 1639) / 2);
  const b1 = $(".b1", s6), st1 = $(".st1", s6), b2 = $(".b2", s6), st2 = $(".st2", s6), b3 = $(".b3", s6), st3 = $(".st3", s6);
  let y = b1.offsetTop + b1.offsetHeight + 18;
  for (const [el, gap] of [[st1, 28], [b2, 14], [st2, 28], [b3, 14], [st3, 0]]) { el.style.top = y + "px"; y += el.offsetHeight + gap; }

  const ringB1 = mk("i", "hl-ring", chat, { left: b1.offsetLeft - 7 + "px", top: b1.offsetTop - 7 + "px", width: b1.offsetWidth + 14 + "px", height: b1.offsetHeight + 14 + "px", borderRadius: "24px" });
  flash(tl, ringB1, 45.55, 1.1);
  const att = $(".m1-att", s6);
  const ringAtt = mk("i", "hl-ring", chat, { left: att.offsetLeft - 8 + "px", top: att.offsetTop - 8 + "px", width: att.offsetWidth + 16 + "px", height: att.offsetHeight + 16 + "px", borderRadius: "14px" });
  flash(tl, ringAtt, 47.45, 1.2);
  $$(".m1-att .th", s6).forEach((th, i) => {
    const t = 47.6 + i * 0.09;
    tl.to(th, t, 0.18, { s: 1.14 }, E.out).to(th, t + 0.18, 0.4, { s: 1 }, E.out);
  });

  // preview
  const frame = $(".s6-frame", s6), zoomer = $(".zoomer", frame);
  const slot = $("#site6"), ws = mountSite(slot, {});
  const VW = 1020, VH = 760 - 52, SH = ws.offsetHeight;
  const k = Math.min(VW / SITE_W, VH / SH), x0 = (VW - SITE_W * k) / 2;
  tl.init(slot, { s: k, x: x0 });
  const focus = (q, Z) => {
    let x = VW / 2 - Z * (x0 + k * q.x), yy = VH / 2 - Z * k * q.y;
    x = Math.min(0, Math.max(VW * (1 - Z), x));
    yy = Math.min(0, Math.max(VH - Z * k * SH, yy));
    return { x, y: yy, s: Z };
  };

  // review step: a lens glides over the preview
  const pill = $(".pill", frame), pr = rectOf(pill), fr = rectOf(frame);
  const ring = mk("i", "ring-pulse", frame, { left: pr.x - fr.x - 5 + "px", top: pr.y - fr.y - 5 + "px", width: pr.w + 10 + "px", height: pr.h + 10 + "px", borderRadius: "999px" });
  burst(tl, ring, 49.65, 0.9, { o: 1, s: [1, 1.25] });
  const lens = $(".review-lens", frame);
  tl.init(lens, { x: 140, y: 420, o: 0 });
  tl.to(lens, 49.7, 0.3, { o: 1 }, E.out);
  tl.to(lens, 49.7, 1.1, { x: 520, y: 170 }, E.io);
  tl.to(lens, 50.8, 1.0, { x: 760, y: 470 }, E.io);
  tl.to(lens, 51.65, 0.3, { o: 0 }, E.in2);

  const mc = $(".mc", s6), mcPh = $(".mc-ph", s6), send = $(".mc-send", s6);
  const caret2 = $(".mc-caret", s6), caret3 = caret2.cloneNode();
  mc.appendChild(caret3);
  const t2 = $(".mc-t2", s6), t3 = $(".mc-t3", s6);
  const ty2 = typist(tl, t2, caret2);
  ty2.win = [52.9, 54.6];
  ty2.rest(53.05, 22);
  const ty3 = typist(tl, t3, caret3);
  ty3.win = [58.55, 60.85];
  ty3.rest(58.7, 24);
  tl.to(mcPh, 52.95, 0.2, { o: 0 }, E.lin).to(mcPh, 54.9, 0.3, { o: 1 }, E.out).to(mcPh, 58.55, 0.2, { o: 0 }, E.lin).to(mcPh, 61.1, 0.3, { o: 1 }, E.out);
  tl.to(t2, 54.62, 0.12, { o: 0 }, E.lin);
  tl.to(t3, 60.87, 0.12, { o: 0 }, E.lin);
  press(tl, send, 54.5);
  press(tl, send, 60.75);
  tl.ft(b2, 54.65, 0.55, { o: [0, 1], y: [18, 0] }, E.glide);
  tl.ft(b3, 60.9, 0.55, { o: [0, 1], y: [18, 0] }, E.glide);
  tl.ft(st2, 56.7, 0.5, { o: [0, 1], x: [-10, 0] }, E.out);
  tl.ft(st3, 63.3, 0.5, { o: [0, 1], x: [-10, 0] }, E.out);

  const shimmer = $(".shimmer", frame);
  tl.init(shimmer, { x: -320 });
  tl.ft(shimmer, 54.8, 0.8, { x: [-320, 1100] }, E.io);
  tl.ft(shimmer, 61.0, 0.8, { x: [-320, 1100] }, E.io);

  // revision 1: add a map to 123 Main Street
  const addr = $(".ws-addr", ws), map = $(".ws-map", ws);
  map.style.width = "136px"; map.style.height = "96px";
  const addrR = siteRect(addr, ws);
  map.style.width = ""; map.style.height = "";
  tl.to(zoomer, 55.0, 0.9, focus({ x: addrR.x + addrR.w / 2, y: addrR.y + addrR.h / 2 - 30 }, 1.45), E.camera);
  tl.ft(map, 55.55, 0.75, { w: [0, 136], h: [0, 96] }, E.glide);
  tl.ft($(".ws-map-in", ws), 55.65, 0.6, { o: [0, 1], s: [0.85, 1] }, E.out);
  tl.ft($(".ws-pin", ws), 56.05, 0.55, { o: [0, 1], y: [-36, 0] }, E.back(2.2));
  flash(tl, siteHl(ws, addrR, 6), 56.3, 1.5);
  pop(tl, siteCallout(ws, "Map added", addrR.x + addrR.w - 118, addrR.y - 20), 56.4, 1.6);
  tl.to(zoomer, 58.0, 0.9, { x: 0, y: 0, s: 1 }, E.camera);

  // revision 2: cinnamon rolls to the top of the menu
  const list = $(".ws-list", ws), rows = $$(".ws-item", ws), listR = siteRect(list, ws);
  const [loaf, cookie, roll] = rows;
  roll.style.zIndex = 2;
  tl.to(zoomer, 61.1, 0.9, focus({ x: listR.x + listR.w / 2 + 120, y: listR.y + 100 }, 1.45), E.camera);
  tl.to(roll, 61.95, 0.25, { s: 1.03, "--lift": 1 }, E.out);
  tl.to(roll, 62.05, 0.95, { y: -112 }, E.io);
  tl.to([loaf, cookie], 62.12, 0.9, { y: 56 }, E.io);
  tl.to(roll, 62.95, 0.35, { s: 1, "--lift": 0 }, E.out);
  flash(tl, siteHl(ws, { x: listR.x - 4, y: listR.y, w: listR.w + 8, h: 56 }, 4), 63.0, 1.4);
  pop(tl, siteCallout(ws, "Moved to the top", listR.x + listR.w - 158, listR.y + 12), 63.05, 1.5);
  tl.to(zoomer, 64.4, 0.8, { x: 0, y: 0, s: 1 }, E.camera);

  // the loop closes
  const loop = $(".trk-loop", s6);
  tl.ft($(".arc", loop), 64.6, 0.8, { dash: [1, 0] }, E.io);
  tl.ft($(".head", loop), 65.25, 0.3, { o: [0, 1] }, E.out);

  // exit: the preview shrinks into scene 7's version card
  tl.to([$(".trk", s6), chat], 65.4, 0.5, { o: 0 }, E.in2);
  tl.to(frame, 65.45, 0.85, { x: 440 - 1250, y: 0, s: 360 / 1020 }, E.camera);
  tl.to(frame, 66.15, 0.2, { o: 0 }, E.lin);
}

/* =====================================================================
   7 · Before you publish (66–76)
   ===================================================================== */
function scene7(tl) {
  const s7 = $("#s7");
  tl.window(s7, 65.6, 76.4);
  const STX = [440, 960, 1480], CY = 640;
  const mini = $(".mini", s7), slot = $("#site7");
  mountSite(slot, { final: true });
  tl.init(slot, { s: 360 / SITE_W });
  const at = (cx, cy) => ({ x: cx - 180, y: cy - 125 });
  tl.init(mini, at(STX[0], CY));
  tl.ft(mini, 66.05, 0.25, { o: [0, 1] }, E.lin);

  fadeUp(tl, $(".s7-head .eyebrow", s7), 66.3, 0.6, 12);
  const call = $(".s7-call", s7);
  const dot = $(".live-dot", s7);
  const callWords = splitWords(call);
  const lastWord = callWords[callWords.length - 1];
  dot.style.left = lastWord.offsetLeft + lastWord.offsetWidth + 22 + "px";
  callWords.forEach((w, i) => tl.ft(w, 66.4 + i * 0.14, 0.9, { o: [0, 1], y: [50, 0] }, E.glide));
  tl.ft(dot, 67.4, 0.5, { s: [0, 1] }, E.back(2));
  const lr = mk("i", "live-ring", dot);
  tl.tick(t => {
    if (t < 67.6 || t > 76.4) { lr.style.opacity = 0; return; }
    const f = ((t - 67.6) * 0.75) % 1;
    lr.style.opacity = r4(0.7 * (1 - f));
    lr.style.transform = `scale(${r4(1 + f * 1.6)})`;
  });
  fadeUp(tl, $(".s7-sub", s7), 67.85, 0.7, 10);

  const track = $(".s7-track", s7), fill = $(".s7-fill", s7);
  tl.ft(track, 68.35, 0.6, { o: [0, 1] }, E.out);
  tl.init(fill, { sx: 0 });
  const nodes = $$(".s7-node", s7);
  nodes.forEach((n, i) => { n.style.left = STX[i] + "px"; n.innerHTML = '<i class="on"></i>'; });
  tl.ft(nodes, 68.35, 0.6, { o: [0, 1] }, E.out);
  [69.3, 71.35, 73.75].forEach((t, i) => tl.ft($(".on", nodes[i]), t, 0.45, { s: [0, 1] }, E.back(2)));
  const st = $$(".st", s7);
  st.forEach((e, i) => { e.style.left = STX[i] + "px"; tl.ft(e, 68.5 + i * 0.12, 0.6, { o: [0, 1], y: [14, 0] }, E.out); });
  const ons = st.map(e => {
    const icon = $(".st-ico", e), html = icon.innerHTML;
    const on = mk("i", "on", icon);
    on.innerHTML = html;
    return on;
  });
  const browser = $(".s7-browser", s7);
  tl.ft(browser, 68.8, 0.7, { o: [0, 1], s: [0.96, 1] }, E.out);

  // 1 · save a version
  tl.ft(ons[0], 69.3, 0.4, { o: [0, 1], s: [0.6, 1] }, E.back(1.6));
  tl.ft($(".vtag", s7), 69.4, 0.55, { o: [0, 1], y: [-22, 0], s: [1.15, 1] }, E.back(1.6));
  // 2 · review it
  tl.to(mini, 70.6, 0.9, at(STX[1], CY), E.io);
  tl.to(fill, 70.6, 0.9, { sx: 0.5 }, E.io);
  tl.ft(ons[1], 71.35, 0.4, { o: [0, 1], s: [0.6, 1] }, E.back(1.6));
  const lens = $(".lens", s7);
  tl.init(lens, { x: STX[1] - 220, y: CY - 120, o: 0 });
  tl.to(lens, 71.45, 0.25, { o: 1 }, E.out);
  tl.to(lens, 71.45, 1.15, { x: STX[1] + 70, y: CY - 30 }, E.io);
  tl.to(lens, 72.5, 0.25, { o: 0 }, E.in2);
  tl.ft($(".rtag", s7), 72.6, 0.5, { o: [0, 1], s: [0.7, 1] }, E.back(1.8));
  // 3 · deploy
  tl.to(mini, 73.0, 0.9, at(STX[2], CY + 22), E.io);
  tl.to(fill, 73.0, 0.9, { sx: 1 }, E.io);
  tl.ft(ons[2], 73.75, 0.4, { o: [0, 1], s: [0.6, 1] }, E.back(1.6));
  tl.to([$(".vtag", s7), $(".rtag", s7)], 73.8, 0.35, { o: 0 }, E.in2);
  const live = $(".live-pill", s7);
  tl.init(live, { x: STX[2] - live.offsetWidth / 2, y: 452 });
  tl.ft(live, 74.1, 0.55, { o: [0, 1], s: [0.6, 1] }, E.back(1.8));

  // exit into scene 8's window
  tl.to([$(".s7-head", s7), track, fill, ...nodes, ...st, live], 75.4, 0.45, { o: 0 }, E.in2);
  tl.to([browser, mini], 75.52, 0.22, { o: 0 }, E.lin);
}

/* =====================================================================
   8 · Go live (76–90): Share, audience, Publish, Copy link.
   ===================================================================== */
function scene8(tl) {
  const s8 = $("#s8");
  tl.window(s8, 75.55, 90.4);
  const win = $(".win", s8);
  tl.init(win, { left: 110, top: 120, w: 1140, h: 840 });
  tl.ft(win, 75.66, 0.95, { x: [800, 0], y: [100, 0], s: [460 / 1140, 1] }, E.camera);
  tl.ft(win, 75.5, 0.24, { o: [0, 1] }, E.lin);
  const slot = $("#site8");
  mountSite(slot, { final: true });
  tl.init(slot, { s: 1140 / SITE_W, x: 0, y: 0 });
  const appBar = $(".app-bar", s8), brBar = $(".br-bar", s8);
  tl.init(brBar, { o: 0 });

  const share = $(".share", s8), opts = $(".sh-opts", s8), rings = $(".rings", s8);
  const pShare = ctr($(".btn-share", s8)), pDD = ctr($(".sh-dd", s8)), pO2 = ctr($(".o2", s8));
  const pPub = ctr($(".sh-publish", s8)), pCopy = ctr($(".b-copy", s8));
  const cur = makeCursor(tl, s8, [1520, 1010]);

  cur.show(76.55).move(76.6, 0.75, ...pShare).click(77.45);
  tl.ft(share, 77.6, 0.5, { o: [0, 1], s: [0.94, 1], y: [-12, 0] }, E.glide);

  // audience: from "Only me" outward to "Anyone on the internet"
  tl.ft($(".r-in", rings), 78.2, 0.6, { s: [0, 1], o: [0, 1] }, E.back(1.6));
  tl.ft($(".rl-in", rings), 78.45, 0.5, { o: [0, 1], y: [8, 0] }, E.out);
  tl.ft($(".r-out", rings), 78.65, 1.0, { s: [0.33, 1], o: [0, 1] }, E.glide);
  tl.ft($(".rl-out", rings), 79.25, 0.5, { o: [0, 1], y: [8, 0] }, E.out);

  cur.move(78.15, 0.6, ...pDD).click(78.85);
  tl.init(opts, { o: 0 });
  tl.ft(opts, 78.95, 0.35, { o: [0, 1], sy: [0.92, 1], y: [-8, 0] }, E.out);
  tl.init($(".o2 .tick", s8), { o: 0 });
  cur.move(79.6, 0.65, ...pO2);
  tl.ft($(".o2", s8), 80.15, 0.2, { "--hov": [0, 1] }, E.out);
  cur.click(80.45);
  tl.to($(".o1 .tick", s8), 80.5, 0.2, { o: 0 }, E.out);
  tl.to($(".o2 .tick", s8), 80.5, 0.25, { o: 1 }, E.out);
  tl.to($(".sh-dd .v1", s8), 80.55, 0.25, { o: 0 }, E.out);
  tl.ft($(".sh-dd .v2", s8), 80.55, 0.3, { o: [0, 1] }, E.out);
  tl.to($(".sh-note", s8), 80.55, 0.25, { o: 0 }, E.out);
  tl.to(opts, 80.8, 0.3, { o: 0, y: -6 }, E.in2);
  tl.ft($(".ring-fill", rings), 80.6, 0.6, { o: [0, 1], s: [0.92, 1] }, E.out);
  burst(tl, $(".ring-wave", rings), 80.65, 1.5, { o: 0.8, s: [1, 3.2] });

  // publish
  cur.move(81.25, 0.6, ...pPub).click(81.95);
  const pub = $(".sh-publish", s8), spin = $(".spin", pub);
  tl.to($(".pt", pub), 82.0, 0.15, { o: 0 }, E.lin);
  tl.ft(spin, 82.05, 0.15, { o: [0, 1] }, E.lin);
  tl.to(spin, 82.55, 0.15, { o: 0 }, E.lin);
  tl.fn(82.0, 0.75, p => { spin.style.transform = `rotate(${r2(p * 540)}deg)`; });
  tl.ft($(".pd", pub), 82.65, 0.35, { o: [0, 1], s: [0.85, 1] }, E.back(1.6));
  tl.ft(pub, 82.6, 0.3, { "--done": [0, 1] }, E.out);
  tl.to(pub, 83.25, 0.3, { o: 0 }, E.in2);
  tl.ft($(".sh-after", s8), 83.35, 0.4, { o: [0, 1], y: [10, 0] }, E.out);
  tl.ft($(".sh-status", s8), 83.3, 0.4, { o: [0, 1], y: [6, 0] }, E.out);
  cur.move(83.5, 0.5, ...pCopy).click(84.1);
  const toast = $(".toast", s8);
  tl.ft(toast, 84.2, 0.4, { o: [0, 1], y: [10, 0] }, E.back(1.4));
  tl.to(toast, 85.4, 0.3, { o: 0 }, E.in2);
  cur.hide(85.0);

  // the public site, in a browser
  tl.to(share, 85.2, 0.45, { o: 0, s: 0.96 }, E.in2);
  tl.to(rings, 85.2, 0.5, { o: 0 }, E.in2);
  tl.to(win, 85.4, 1.1, { left: 160, top: 90, w: 1600, h: 900 }, E.camera);
  tl.to(appBar, 85.45, 0.4, { o: 0 }, E.out);
  tl.ft(brBar, 85.6, 0.5, { o: [0, 1] }, E.out);
  tl.to(slot, 85.4, 1.1, { s: 1, x: 240 }, E.camera);
  tl.ft($(".pub-badge", s8), 86.4, 0.5, { o: [0, 1], s: [0.8, 1] }, E.back(1.6));
  // push into the address bar
  tl.to(win, 89.3, 0.9, { s: 2.4, y: (118 - 540) * (1 - 2.4) }, E.in);
  tl.to(win, 89.6, 0.6, { o: 0 }, E.in2);
}

/* =====================================================================
   9 · Your own domain (90–100)
   ===================================================================== */
function scene9(tl) {
  const s9 = $("#s9");
  tl.window(s9, 89.7, 100.5);
  fadeUp(tl, $(".s9-head .eyebrow", s9), 89.85, 0.6, 12);
  riseLines(tl, [$(".s9-head .ln > span", s9)], 89.95, { dur: 1.0 });
  tl.ft($(".own-tag", s9), 90.45, 0.6, { o: [0, 1], y: [12, 0] }, E.out);
  const d = $$(".dc", s9);
  [90.6, 92.45, 93.95, 95.4].forEach((t, i) => tl.ft(d[i], t, 0.8, { o: [0, 1], y: [40, 0] }, E.glide));

  const cur = makeCursor(tl, s9, [560, 1010]);
  const add = $(".add", s9), inp = $(".ui-input", s9);
  cur.show(91.0).move(91.05, 0.5, ...ctr(add)).click(91.6);
  tl.ft(inp, 91.7, 0.4, { o: [0, 1], y: [8, 0] }, E.out);
  const tyD = typist(tl, $(".dom", s9), $(".ui-input .caret", s9));
  tyD.win = [91.75, 93.3];
  tyD.rest(91.85, 22);

  const recs = $$(".d2 .rec", s9), cp = $(".cp", s9);
  recs.forEach((r, i) => tl.ft(r, 92.85 + i * 0.15, 0.45, { o: [0, 1], x: [-14, 0] }, E.out));
  tl.ft(cp, 93.05, 0.4, { o: [0, 1] }, E.out);
  cur.move(93.15, 0.45, ...ctr(cp)).click(93.7);
  tl.to($(".c1", cp), 93.75, 0.2, { o: 0 }, E.out);
  tl.ft($(".c2", cp), 93.75, 0.25, { o: [0, 1] }, E.out);

  const prs = $$(".pr", s9);
  $$(".ghost", s9).forEach((g, i) => {
    const a = rectOf(recs[i]), b = rectOf(prs[i]);
    g.style.width = a.w + "px";
    tl.init(g, { o: 0, x: a.x, y: a.y });
    const t0 = 94.15 + i * 0.12;
    tl.ft(g, t0, 0.15, { o: [0, 1] }, E.lin);
    tl.to(g, t0, 0.8, { x: b.x, y: b.y + (b.h - a.h) / 2, w: b.w }, E.io);
    tl.to(g, t0 + 0.75, 0.2, { o: 0 }, E.lin);
    tl.ft(prs[i], t0 + 0.7, 0.35, { o: [0, 1] }, E.out);
  });

  const hands = $$(".hand", s9);
  tl.fn(95.6, 1.5, p => {
    hands[0].style.transform = `rotate(${r2(p * 720)}deg)`;
    hands[1].style.transform = `rotate(${r2(p * 60)}deg)`;
  }, E.io);
  const refresh = $(".refresh", s9);
  cur.move(96.55, 0.55, ...ctr(refresh)).click(97.2);
  const rIco = $(".ico", refresh);
  tl.fn(97.2, 0.6, p => { rIco.style.transform = `rotate(${r2(p * 360)}deg)`; }, E.out);
  tl.to($(".pend", s9), 97.55, 0.2, { o: 0 }, E.out);
  tl.ft($(".conn", s9), 97.55, 0.45, { o: [0, 1], s: [0.8, 1] }, E.back(1.8));
  cur.hide(97.8);

  const pill = $(".addr-pill", s9);
  tl.ft(pill, 98.0, 0.7, { o: [0, 1], y: [30, 0] }, E.glide);
  tl.ft($(".ok", pill), 98.5, 0.5, { s: [0, 1] }, E.back(2));
  tl.to([$(".s9-head", s9), ...d], 99.35, 0.45, { o: 0 }, E.in2);
}

/* =====================================================================
   10 · Keep it current (100–108)
   ===================================================================== */
function scene10(tl) {
  const s10 = $("#s10");
  tl.window(s10, 99.6, 108.4);
  const live = $(".bw-live", s10), prev = $(".bw-prev", s10);
  tl.init(live, { left: 160, top: 230, w: 1600, h: 800 });

  // the domain pill from scene 9 lands in this address bar
  const pill = $("#s9 .addr-pill"), pr = rectOf(pill), ar = rectOf($(".addr", live));
  tl.to(pill, 99.5, 0.8, { x: ar.cx - pr.cx, y: ar.cy - pr.cy, s: ar.h / pr.h }, E.camera);
  tl.to(pill, 100.15, 0.3, { o: 0 }, E.lin);
  tl.ft(live, 99.75, 0.8, { o: [0, 1], s: [0.97, 1] }, E.glide);
  fadeUp(tl, $(".s10-head .eyebrow", s10), 99.95, 0.6, 12);
  riseLines(tl, [$(".s10-head .ln > span", s10)], 100.05, { dur: 1.0 });

  const slotA = $("#site10a"), wsA = mountSite(slotA, { final: true, special: true });
  tl.init(slotA, { s: 1, x: 240 });
  const editBtn = $(".edit-btn", s10), bar = $(".edit-bar", s10), sendE = $(".eb-send", s10);
  tl.ft(editBtn, 100.6, 0.5, { o: [0, 1], s: [0.8, 1] }, E.back(1.6));
  const cur = makeCursor(tl, s10, [1500, 1060]);
  cur.show(100.65).move(100.7, 0.55, ...ctr(editBtn)).click(101.35);
  tl.ft(bar, 101.4, 0.45, { o: [0, 1], y: [24, 0] }, E.glide);
  tl.to($(".eb-ph", s10), 101.68, 0.15, { o: 0 }, E.lin);
  const tyE = typist(tl, $(".eb-text", s10), $(".edit-bar .caret", s10));
  tyE.win = [101.65, 103.9];
  tyE.rest(101.75, 31);
  cur.move(103.1, 0.5, ...ctr(sendE)).click(103.72);
  tl.to([bar, editBtn], 103.92, 0.3, { o: 0 }, E.in2);

  // split: the live site stays put while the edit waits in preview
  tl.to(live, 103.98, 0.85, { left: 110, top: 300, w: 820, h: 560 }, E.camera);
  tl.to(slotA, 103.98, 0.85, { s: 820 / SITE_W, x: 0 }, E.camera);
  const slotB = $("#site10b"), wsB = mountSite(slotB, { final: true, special: true });
  tl.init(slotB, { s: 820 / SITE_W });
  tl.ft(prev, 104.55, 0.6, { o: [0, 1], x: [60, 0] }, E.glide);
  const spB = $(".ws-special", wsB), spA = $(".ws-special", wsA);
  tl.ft(spB, 104.9, 0.75, { h: [0, 112] }, E.glide);
  tl.ft($(".ws-special-in", wsB), 105.05, 0.6, { o: [0, 1], x: [-20, 0] }, E.out);
  spB.style.height = "112px";
  const spR = siteRect($(".ws-special-in", wsB), wsB);
  spB.style.height = "";
  flash(tl, siteHl(wsB, spR, 6), 105.3, 1.4);
  tl.ft($(".fl-live", s10), 104.5, 0.5, { o: [0, 1], y: [8, 0] }, E.out);
  tl.ft($(".fl-prev", s10), 104.6, 0.5, { o: [0, 1], y: [8, 0] }, E.out);
  tl.init($(".fl-live .u2", s10), { o: 0 });
  fadeUp(tl, $(".s10-note", s10), 104.8, 0.6, 10);

  const pub = $(".pub-btn", s10);
  cur.move(105.1, 0.6, ...ctr(pub)).click(105.8);
  tl.ft(spA, 106.05, 0.75, { h: [0, 112] }, E.glide);
  tl.ft($(".ws-special-in", wsA), 106.2, 0.6, { o: [0, 1], x: [-20, 0] }, E.out);
  tl.to($(".fl-live .u1", s10), 106.05, 0.25, { o: 0 }, E.out);
  tl.to($(".fl-live .u2", s10), 106.1, 0.35, { o: 1 }, E.out);
  const ring = mk("i", "bw-ring", s10, { left: "104px", top: "294px", width: "832px", height: "572px" });
  burst(tl, ring, 106.1, 0.9, { o: 1, s: [1, 1.04] });
  cur.hide(106.4);
  tl.to(s10, 107.45, 0.6, { o: 0, y: -30 }, E.in2);
}

/* =====================================================================
   11 · Know your responsibilities (108–120)
   ===================================================================== */
function scene11(tl) {
  const s11 = $("#s11");
  tl.window(s11, 107.6, 120.8);
  fadeUp(tl, $(".s11-head .eyebrow", s11), 108.1, 0.6, 12);
  riseLines(tl, $$(".s11-head .ln > span", s11), 108.2, { stag: 0.14, dur: 1.0 });
  tl.ft($(".ck", s11), 108.4, 0.9, { o: [0, 1], y: [40, 0] }, E.glide);
  $$(".ck-row", s11).forEach((row, i) => {
    const t = 109.15 + i * 2.1;
    tl.ft(row, t, 0.6, { o: [0, 1], x: [24, 0] }, E.glide);
    const box = $(".box", row);
    const fillEl = mk("i", "box-fill", null);
    box.insertBefore(fillEl, box.firstChild);
    tl.ft(fillEl, t + 0.5, 0.45, { s: [0, 1] }, E.back(1.8));
    const path = $(".ico path", box);
    path.setAttribute("pathLength", "1");
    tl.ft(path, t + 0.62, 0.35, { dash: [1, 0] }, E.out);
  });
}

/* =====================================================================
   12 · Close (120–128)
   ===================================================================== */
function scene12(tl) {
  const s12 = $("#s12");
  tl.window(s12, 119.4, DUR + 1);
  emblemWipe(tl, s12, 119.4, 1.35);
  tl.ft($(".s12-photo", s12), 119.4, 8.6, { s: [1.1, 1.0] }, E.soft);
  tl.ft($(".s12-scrim", s12), 120.4, 1.2, { o: [0, 1] }, E.sine);
  riseLines(tl, $$(".s12-tag .ln > span", s12), 121.0, { stag: 0.8, dur: 1.1 });
  const plate = $(".s12-plate", s12);
  placeLogo($(".s12-logo", s12), 360, 40, (206 - 360 * 672 / 1639) / 2);
  tl.ft(plate, 124.3, 1.0, { o: [0, 1], y: [30, 0] }, E.glide);
  tl.ft($(".s12-logo", s12), 124.6, 0.9, { o: [0, 1] }, E.out);
}

function buildPiece() {
  const tl = new Timeline();
  $("#stamp").innerHTML = emblemPathsMarkup();
  $("#embClip").innerHTML = emblemPathsMarkup();
  tl.init($("#stamp"), { x: 960 - EMBLEM.ax, y: 540 - EMBLEM.ay, o: 0 });
  placeLogo($("#pcLogo .ph-logo"), 300, 15, (165 - 300 * 672 / 1639) / 2);
  atmosphere(tl);
  [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11, scene12].forEach(f => f(tl));
  tl.compile();
  return tl;
}
