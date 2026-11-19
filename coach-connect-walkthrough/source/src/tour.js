"use strict";
/* =====================================================================
   The narrated tour. Every action is keyed to a word in the narration
   (W(cue, word) returns when that word is spoken), so a new voice or an
   edited line re-times the whole piece. The replica is rendered from a
   state computed purely from time; camera, cursor, highlights and
   overlays are engine tweens. Nothing here depends on wall-clock time.
   ===================================================================== */
const POSTER_T = 9.9;

function buildTour() {
  const tl = new Timeline();
  const stage = $("#stage"), browser = $("#browser"), page = $("#page"), hlLayer = $("#hlLayer"), bview = $("#bview");
  const rail = $("#rail"), overlays = $("#overlays"), caps = $("#captions"), capText = $("#capText");
  const DUR = NARRATION.duration;
  const el = (tag, cls, html = "") => { const e = document.createElement(tag); if (cls) e.className = cls; e.innerHTML = html; return e; };

  /* ---------- narration lookups ---------- */
  const CUE = {};
  NARRATION.cues.forEach(c => { CUE[c.id] = c; });
  const at = id => CUE[id].t, end = id => CUE[id].end;
  const nrm = s => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  function W(id, word, n = 1) {
    let k = 0;
    const q = nrm(word);
    for (const [w, t0] of CUE[id].words) if (nrm(w).startsWith(q) && ++k === n) return t0;
    throw new Error(`tour: "${word}" not found in cue ${id}`);
  }
  const CH = NARRATION.chapters.map(c => c.t);

  /* ---------- replica + time-driven state ---------- */
  const rep = Replica({ id: "tour" });
  page.insertBefore(rep.root, hlLayer);
  const CARD = rep.rect(rep.R.card), CX = 1 + CARD.x + CARD.w / 2;
  const EV = [];
  let sorted = true;
  const ev = (t, fn) => { EV.push({ t, fn }); sorted = false; };
  function stateAt(t) {
    if (!sorted) { EV.sort((a, b) => a.t - b.t); sorted = true; }
    const S = newState();
    S._typing = false;
    for (const e of EV) { if (e.t > t) break; e.fn(S, t); }
    S.caret = S._typing || Math.floor(t / 0.53) % 2 === 0;
    return S;
  }
  function type(t0, f, text, cps = 22) {
    const dur = text.length / cps;
    ev(t0, (S, now) => {
      S.data[f] = text.slice(0, Math.max(0, Math.min(text.length, Math.floor((now - t0) * cps) + 1)));
      if (now < t0 + dur) S._typing = true;
    });
    return t0 + dur;
  }
  const focus = (t, f) => ev(t, S => { S.focus = f; });
  const hover = (t, h) => ev(t, S => { S.hover = h; });
  const rectAt = (t, target) => { rep.render(stateAt(t)); return rep.rect(typeof target === "function" ? target() : target); };

  /* ---------- page scroll (inside the browser view) ---------- */
  const SCROLLS = [];
  function scrollAt(t) {
    let v = 0;
    for (const s of SCROLLS) {
      if (t >= s.t1) v = s.to;
      else if (t >= s.t0) v = s.from + (s.to - s.from) * E.camera((t - s.t0) / Math.max(1e-6, s.t1 - s.t0));
    }
    return v;
  }
  function scrollTo(t0, dur, y) {
    const from = scrollAt(t0);
    SCROLLS.push({ t0, t1: t0 + dur, from, to: y });
    tl.to(page, t0, dur, { y: -y }, dur < 0.05 ? E.lin : E.camera);
    return t0 + dur;
  }
  /** scroll so the target's top sits `top` px below the top of the browser view */
  const scrollFor = (t0, dur, target, top = 200) => scrollTo(t0, dur, Math.max(0, Math.round(rectAt(t0 + dur, target).y - top)));

  /* ---------- camera ---------- */
  tl.init(browser, { "--fx": 641, "--fy": 188, "--s": 0.92, o: 0 });
  function cam(t0, dur, fx, fy, s) {
    // keep the browser's edges outside the frame once zoomed in
    if (s > 1.11) fy = clamp(fy, 540 / s, 976 - 540 / s); else fy = 488;
    // horizontally, allow a small margin beside the rail so the form card can sit centered
    if (s > 1.08) fx = clamp(fx, 697 / s, 1282 - (687 - 150) / s); else fx = 641;
    tl.to(browser, t0, dur, { "--fx": fx, "--fy": fy, "--s": s }, E.camera);
    return t0 + dur;
  }
  function camOn(t0, dur, target, s, o = {}) {
    const t = t0 + dur, r = rectAt(t, target);
    const fx = o.cx ?? 1 + r.x + r.w * (o.ax ?? 0.5) + (o.dx || 0);
    return cam(t0, dur, fx, 51 + r.y + r.h * (o.ay ?? 0.5) - scrollAt(t) + (o.dy || 0), s);
  }

  /* ---------- cursor (browser-view coordinates) ---------- */
  const cur = makeCursor(tl, bview, [700, 640]);
  function point(t0, dur, target, ax = 0.5, ay = 0.5) {
    const t = t0 + dur, r = rectAt(t, target);
    cur.move(t0, dur, r.x + r.w * ax, r.y + r.h * ay - scrollAt(t));
    return t;
  }
  /** move so the pointer lands at time `t`, then click */
  function clickAt(t, target, o = {}) {
    const d = o.dur ?? 0.5;
    point(t - d - 0.05, d, target, o.ax ?? 0.5, o.ay ?? 0.5);
    cur.click(t);
    return t;
  }
  /** click a field, focus it, and type into it */
  function fill(t, name, text, cps = 22, o = {}) {
    clickAt(t, rep.C[name], { ax: 0.18, ay: 0.55, dur: o.dur ?? 0.42 });
    focus(t + 0.02, name);
    return type(t + 0.12, name, text, cps);
  }

  /* ---------- highlights + tags (page coordinates) ---------- */
  function tag(t0, t1, r, text, o = {}) {
    const pad = o.pad ?? 8;
    const t = el("div", "tag " + (o.side || "top") + (o.navy ? " navy" : ""));
    t.textContent = text;
    hlLayer.appendChild(t);
    const w = t.offsetWidth, h = t.offsetHeight;
    let x, y;
    switch (o.side || "top") {
      case "bottom": x = r.x - pad + (o.tx || 0); y = r.y + r.h + pad + 14; break;
      case "right": x = r.x + r.w + pad + 18; y = r.y + r.h / 2 - h / 2; break;
      case "left": x = r.x - pad - 18 - w; y = r.y + r.h / 2 - h / 2; break;
      default: x = r.x - pad + (o.tx || 0); y = r.y - pad - h - 14;
    }
    if (o.alignRight) x = r.x + r.w + pad - w;
    t.style.left = x + "px";
    t.style.top = y + (o.ty || 0) + "px";
    tl.ft(t, t0, 0.4, { o: [0, 1], y: [8, 0] }, E.out);
    tl.to(t, t1, 0.3, { o: 0 }, E.in2);
    return t;
  }
  function ring(t0, t1, target, o = {}) {
    const r = typeof target === "object" && "w" in target ? target : rectAt(t0, target);
    const pad = o.pad ?? 8;
    const h = el("div", "hl" + (o.navy ? " navy" : ""));
    Object.assign(h.style, { left: r.x - pad + "px", top: r.y - pad + "px", width: r.w + pad * 2 + "px", height: r.h + pad * 2 + "px", borderRadius: (o.radius ?? 12) + "px" });
    hlLayer.appendChild(h);
    tl.ft(h, t0, 0.45, { o: [0, 1], s: [1.05, 1] }, E.out);
    tl.to(h, t1, 0.35, { o: 0 }, E.in2);
    if (o.tag) tag(t0 + 0.15, t1, r, o.tag, o);
    return h;
  }
  const union = (a, b) => {
    const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
    return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
  };
  /** short card fade on step changes (the live form swaps instantly; this softens the cut) */
  const STEP_T = {};
  function stepChange(t, step, extra) {
    STEP_T[step] = t;
    tl.to(rep.R.card, t - 0.14, 0.14, { o: 0.25 }, E.in2);
    ev(t, S => { S.step = step; S.busy = null; S.hover = null; S.focus = null; if (extra) extra(S); });
    scrollTo(t, 0.01, 0);
    tl.to(rep.R.card, t, 0.35, { o: 1 }, E.out);
  }

  /* ---------- rail ---------- */
  tl.init(rail, { x: 560 });
  const railHead = $("#railHead"), railClient = $("#railClient"), railLog = $("#railLog");
  const LOG = [
    ["mapPin", "Center matched", "ZIP 40202 → Louisville SBDC, instantly, in the form."],
    ["save", "Contact details saved", "On Continue, before she finishes."],
    ["database", "Registration recorded", "Saved to Neoserra when she registers."],
    ["calendar", "Coach selected", "Claire’s Calendly opens with Maya’s name and email."],
    ["clipboardCheck", "Booking noted", "Added to her Kentucky SBDC client record."],
  ];
  const logLis = LOG.map(([icon, title, sub], i) => {
    const li = el("li", "", `<div class="ic">${ico(icon, 25)}<b>${i + 1}</b><i class="pulse"></i></div><div><strong>${title}</strong><span>${sub}</span></div>`);
    railLog.appendChild(li);
    return li;
  });
  const logTitle = $(".rail-log-title");
  function logAt(i, t) {
    if (i === 0) tl.ft(logTitle, t - 0.25, 0.6, { o: [0, 1] }, E.out);
    tl.ft(logLis[i], t, 0.7, { o: [0, 1], x: [36, 0] }, E.glide);
    const p = logLis[i].querySelector(".pulse");
    tl.ft(p, t + 0.1, 1.1, { o: [0.9, 0], s: [0.9, 1.35] }, E.out);
  }

  /* ---------- captions (two-line pages, karaoke words) ---------- */
  const pages = [];
  NARRATION.cues.forEach((c, ci) => {
    let cur2 = [];
    const flush = () => { if (cur2.length) pages.push({ ci, words: cur2 }); cur2 = []; };
    let len = 0;
    c.words.forEach((w, i) => {
      const add = w[0].length + 1;
      if (len + add > 86 && cur2.length) { flush(); len = 0; }
      cur2.push(w); len += add;
      const nextExists = i < c.words.length - 1;
      if (nextExists && len >= 34 && /[.?!:]$/.test(w[0])) { flush(); len = 0; }
    });
    flush();
  });
  pages.forEach((p, i) => {
    const cue = NARRATION.cues[p.ci], next = pages[i + 1];
    p.t0 = p.words[0][1] - 0.18;
    const sameCue = next && next.ci === p.ci;
    p.t1 = sameCue ? next.words[0][1] - 0.18 : Math.min(cue.end + 0.7, next ? next.words[0][1] - 0.25 : DUR);
    p.html = p.words.map(([w], k) => `<span class="w" data-k="${k}">${w.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`).join(" ");
  });
  let capShown = -1, capSpans = [];
  tl.tick(t => {
    let idx = -1;
    for (let i = 0; i < pages.length; i++) if (t >= pages[i].t0 && t < pages[i].t1) { idx = i; break; }
    if (idx !== capShown) {
      capShown = idx;
      capText.innerHTML = idx >= 0 ? pages[idx].html : "";
      capSpans = [...capText.querySelectorAll(".w")];
    }
    if (idx < 0) { capText.style.opacity = 0; return; }
    const p = pages[idx], prevSame = idx > 0 && pages[idx - 1].ci === p.ci && pages[idx - 1].t1 >= p.t0 - 0.01;
    const fin = prevSame ? 1 : clamp((t - p.t0) / 0.18);
    const nextSame = idx < pages.length - 1 && pages[idx + 1].ci === p.ci;
    const fout = nextSame ? 1 : clamp((p.t1 - t) / 0.25);
    capText.style.opacity = r4(Math.min(fin, fout));
    p.words.forEach(([, w0], k) => { const on = t >= w0 - 0.02; if (capSpans[k] && capSpans[k].classList.contains("on") !== on) capSpans[k].classList.toggle("on", on); });
  });
  tl.init(caps, { "--cx": 960 });

  /* =====================================================================
     Chapter 1 · Welcome
     ===================================================================== */
  const ovTitle = el("div", "ov ov-title", `
    <div class="t-logo"><img src="${ASSETS.logo}" alt=""></div>
    <div class="t-eb">Staff walkthrough</div>
    <div class="t-h"><span class="ln"><span>Coach Connect</span></span></div>
    <div class="t-sub">How clients register and book a coach in one visit, and what happens behind the scenes.</div>
    <div class="t-rule"></div>
    <div class="t-who">For <b>Kentucky SBDC staff and business coaches</b></div>
    <div class="t-steps"><div class="k">The new client flow</div><h3>Four steps</h3><ol>${CC.STEPS.map((s, i) => `<li><span class="n">${i + 1}</span>${s.replace("&", "&amp;")}</li>`).join("")}</ol></div>`);
  overlays.appendChild(ovTitle);
  const tWalk = W("walk", "walk") - 0.15;
  tl.set(ovTitle, 0, { o: 1 });
  tl.window(ovTitle, -1, tWalk + 1.2);
  fadeUp(tl, $(".t-logo", ovTitle), 0.15, 0.8, 16);
  fadeUp(tl, $(".t-eb", ovTitle), 0.45, 0.7, 12);
  tl.ft($(".t-h .ln > span", ovTitle), 0.6, 1.15, { y: [190, 0] }, E.glide);
  fadeUp(tl, $(".t-sub", ovTitle), W("welcome", "new") - 0.1, 0.9, 18);
  tl.ft($(".t-rule", ovTitle), 1.0, 0.9, { sx: [0, 1] }, E.glide);
  fadeUp(tl, $(".t-who", ovTitle), W("welcome", "book") - 0.2, 0.8, 12);
  const tSteps = $(".t-steps", ovTitle);
  tl.ft(tSteps, 1.1, 1.2, { o: [0, 1], x: [90, 0] }, E.glide);
  $$(".t-steps li", ovTitle).forEach((li, i) => {
    const t = W("welcome", "register") + i * 0.32;
    tl.fn(t, 0.01, p => li.classList.toggle("on", p >= 1));
  });
  tl.to(ovTitle, tWalk, 0.8, { o: 0, x: -70 }, E.in2);

  // the browser rises in and "loads" the form
  tl.to(browser, tWalk + 0.15, 0.9, { o: 1 }, E.out);
  cam(tWalk + 0.15, 1.4, 641, 488, 1);
  const urlText = $("#urlText"), urlCaret = $("#urlCaret"), URL_FULL = "register.kentuckysbdc.com";
  const tUrl = tWalk + 0.75;
  tl.fn(tUrl, URL_FULL.length / 34, p => { urlText.textContent = URL_FULL.slice(0, Math.round(p * URL_FULL.length)); });
  urlText.textContent = "";
  tl.tick(t => { urlCaret.style.opacity = t >= tUrl - 0.4 && t < tUrl + 1.3 && (t < tUrl + 0.75 || Math.floor(t / 0.4) % 2 === 0) ? 1 : 0; });
  const tLoad = tUrl + URL_FULL.length / 34 + 0.15;
  const loadbar = $("#loadbar");
  tl.init(loadbar, { sx: 0, o: 0 });
  tl.ft(loadbar, tLoad, 0.55, { sx: [0, 1], o: [1, 1] }, E.out);
  tl.to(loadbar, tLoad + 0.55, 0.25, { o: 0 }, E.lin);
  tl.init(page, { o: 0 });
  tl.to(page, tLoad + 0.3, 0.45, { o: 1 }, E.out);
  // rail slides in
  const tRail = W("walk", "behind") - 0.35;
  tl.to(rail, tRail, 1.0, { x: 0 }, E.glide);
  tl.to(caps, tRail, 0.9, { "--cx": 697 }, E.camera);

  /* rail headers switch the moment the form changes step (see buildHeads below) */
  function buildHeads() {
    const HEADS = [["Overview", "Four steps", tRail + 0.4], ["Step 1 of 4", "Your details", CH[2] + 0.1],
      ["Step 2 of 4", "Your business", STEP_T[1] + 0.05], ["Step 3 of 4", "Review &amp; consent", STEP_T[2] + 0.05], ["Step 4 of 4", "Your appointment", STEP_T[3] + 0.05]];
    HEADS.forEach(([eb, title, tIn], i) => {
      const d = el("div", "rh", `<span class="eb">${eb}</span><h2>${title}</h2>`);
      railHead.appendChild(d);
      tl.ft(d, tIn, 0.6, { o: [0, 1], y: [22, 0] }, E.glide);
      if (i < HEADS.length - 1) tl.to(d, HEADS[i + 1][2] - 0.32, 0.3, { o: 0, y: -14 }, E.in2);
    });
  }

  /* =====================================================================
     Chapter 2 · Four steps (the sidebar)
     ===================================================================== */
  camOn(CH[1] + 0.05, 1.4, ".cc-steps", 1.85, { dx: 40 });
  const stepWords = ["details", "business", "review", "appointment"];
  rep.lis.forEach((li, i) => {
    const t0 = W("steps", stepWords[i]) - 0.08;
    const t1 = i < 3 ? W("steps", stepWords[i + 1]) - 0.12 : end("steps") + 0.35;
    ring(t0, t1, li, { pad: 6, radius: 30, navy: false });
  });

  /* =====================================================================
     Chapter 3 · Step 1, your details
     ===================================================================== */
  const c2 = CH[2];
  camOn(end("steps") + 0.2, 1.3, rep.C.email, 1.2, { cx: CX, dy: 130 });
  tl.ft(railClient, W("maya", "Maya") - 0.2, 0.8, { o: [0, 1], y: [24, 0] }, E.glide);
  cur.show(c2 + 0.6);
  cur.move(c2 + 0.6, 0.01, 820, 330);
  let t = W("maya", "Maya") - 0.05;
  t = fill(t, "first", "Maya", 14) + 0.18;
  t = fill(t + 0.42, "last", "Brooks", 16) + 0.15;
  t = fill(t + 0.42, "email", "maya@example.com", 26) + 0.12;
  t = fill(t + 0.42, "phone", "(502) 555-0142", 26) + 0.12;
  t = fill(t + 0.42, "mailaddr", "123 Main Street", 26) + 0.12;
  t = fill(t + 0.42, "mailcity", "Louisville", 24);
  ev(t + 0.15, S => { S.focus = null; });
  ring(W("home", "Clients") + 0.15, end("home") + 0.2, rep.F.mailaddr.querySelector("small"), { pad: 7, tag: "No business yet? Home address is fine.", side: "bottom" });

  // the training-calendar banner
  camOn(at("banner") - 0.3, 1.25, rep.R.banner, 1.42, { dy: 60 });
  point(at("banner") + 0.4, 0.8, rep.R.banner, 0.7, 0.86);
  ring(W("banner", "banner") - 0.05, end("banner") - 0.25, rep.R.banner, { pad: 7, radius: 16, tag: "No-cost training calendar", side: "bottom", alignRight: true });

  // the ZIP code routes the client
  scrollTo(end("banner") - 0.35, 1.1, 240);
  camOn(end("banner") - 0.35, 1.25, rep.C.mailzip, 1.4, { cx: CX, dy: 40 });
  clickAt(W("zip", "ZIP") + 0.05, rep.C.mailzip, { ax: 0.2, dur: 0.55 });
  focus(W("zip", "ZIP") + 0.07, "mailzip");
  const tZip = type(W("zip", "typed") - 0.5, "mailzip", "40202", 10);
  tl.ft(rep.R.zipInfo, tZip, 0.55, { o: [0, 1], y: [10, 0] }, E.back(1.6));
  ev(tZip + 0.6, S => { S.focus = null; });
  ring(W("zip", "center") - 0.05, end("zip") + 0.3, rep.R.zipInfo, { pad: 6, tag: "Matched instantly from the ZIP", side: "bottom" });
  logAt(0, W("zip", "Louisville"));

  // what if the ZIP isn't on the map?
  {
    const rz = rectAt(W("fallback", "ZIPs"), rep.F.mailzip);
    const wi = el("div", "whatif", `<div class="wi-label">${ico("info", 15)} What if the ZIP isn’t on the map?</div>
      <div class="wi-zip">Example: <b>45202</b> (Cincinnati)</div>
      <div class="cc" style="background:none"><div class="cc-info block" style="margin:0">Our Eastern Kentucky intake team will help connect you with the right coach.</div></div>`);
    wi.style.left = rz.x + rz.w + 20 + "px";
    wi.style.top = rz.y - 18 + "px";
    wi.style.width = "382px";
    hlLayer.appendChild(wi);
    tl.ft(wi, W("fallback", "ZIPs") - 0.1, 0.6, { o: [0, 1], y: [16, 0], s: [0.97, 1] }, E.glide);
    tl.to(wi, end("fallback") + 0.25, 0.35, { o: 0, y: -8 }, E.in2);
  }

  // Continue saves the contact details
  {
    const t0 = end("fallback") + 0.15;
    scrollFor(t0, 1.0, rep.R.actions, 560);
    camOn(t0, 1.2, rep.R.next, 1.4, { cx: CX, dy: -90 });
    const tc = W("saved", "Continue") + 0.02;
    point(tc - 0.95, 0.75, rep.R.next, 0.42, 0.55);
    hover(tc - 0.2, "next");
    cur.click(tc);
    ev(tc + 0.04, S => { S.busy = "save"; S.hover = null; });
    logAt(1, W("saved", "saved") - 0.05);
    stepChange(tc + 1.05, 1);
    camOn(tc + 1.15, 1.2, rep.R.journey, 1.22, { cx: CX, dy: 90 });
    cur.move(tc + 1.15, 0.9, 760, 260);
  }

  /* =====================================================================
     Chapter 4 · Step 2, your business
     ===================================================================== */
  {
    const [pCard, bCard] = rep.choices;
    point(W("journey", "starting") - 0.65, 0.6, pCard, 0.35, 0.5);
    hover(W("journey", "starting") - 0.05, "choice-P");
    const tb = W("journey", "already") + 0.3;
    point(tb - 0.55, 0.5, bCard, 0.35, 0.5);
    hover(tb - 0.05, "choice-B");
    cur.click(tb);
    ev(tb + 0.02, S => { S.data.statusInit = "B"; S.hover = null; });

    let u = at("inbiz") - 0.25;
    scrollFor(u, 1.0, rep.F.company, 150);
    camOn(u, 1.15, rep.F.ftEmps, 1.24, { cx: CX, dy: 40 });
    u = fill(u + 1.12, "company", "Brooks Street Kitchen", 28) + 0.1;
    u = fill(u + 0.42, "estab", "04/03/2023", 20);
    ev(u + 0.05, S => { S.data.estab = "2023-04-03"; });
    u = fill(u + 0.47, "ftEmps", "2", 10) + 0.05;
    u = fill(u + 0.42, "ptEmps", "3", 10) + 0.05;
    const tl0 = W("inbiz", "least") - 0.1;
    ring(tl0, end("inbiz") + 0.35, rep.F.ftEmps, { pad: 7, tag: "At least one employee, full- or part-time", side: "top", alignRight: true });
    ring(tl0 + 0.15, end("inbiz") + 0.35, rep.F.ptEmps, { pad: 7 });
    u = Math.max(u, tl0 + 0.2);
    u = fill(u + 0.42, "product", "Catering and weekly meal prep", 30);
    ev(u + 0.1, S => { S.focus = null; });

    // in her own words
    const th = end("inbiz") + 0.1;
    scrollFor(th, 1.0, rep.F.help, 330);
    camOn(th, 1.1, rep.F.help, 1.3, { cx: CX, dy: 10 });
    fill(th + 1.18, "help", "We want to open a storefront and need help with financing and a cash flow plan.", 34, { dur: 0.5 });
    ev(end("help") + 0.6, S => { S.focus = null; });

    // demographic questions
    const td = end("help") + 0.25;
    scrollFor(td, 1.2, rep.R.demoHead, 120);
    camOn(td, 1.3, rep.R.demo, 1.24, { cx: CX, dy: -30 });
    const pick = (tt, name, value, label) => {
      clickAt(tt, rep.C[name], { ax: 0.25, dur: 0.45 });
      focus(tt + 0.02, name);
      ev(tt + 0.22, S => { S.data[name] = value; S.focus = null; });
    };
    pick(W("demo", "Prefer") + 0.05, "ethnic", "NR");
    pick(W("demo", "say") + 0.25, "hispanic", "R");
    pick(W("demo", "Sex") + 0.05, "gender", "F");
    pick(W("demo", "Male") + 0.05, "veteran", "NA");
    pick(W("demo", "Female") + 0.35, "reservist", "NA");
    pick(W("demo", "None") + 0.15, "handicapped", "N");
    ring(W("demo", "Prefer") - 0.05, W("demo", "Sex") - 0.15, rep.F.ethnic, { pad: 7, tag: "“Prefer not to say” is an option", side: "top", alignRight: true });
    ring(W("demo", "Sex") - 0.05, W("demo", "None") - 0.2, rep.F.gender, { pad: 7, tag: "Male or Female", side: "top" });
    ring(W("demo", "None") - 0.05, end("demo") + 0.1, rep.R.demo, { pad: 12, tag: "Doesn’t affect the coaching match", side: "top", navy: true });

    const tn = end("demo") - 0.35;
    scrollFor(tn - 1.15, 0.8, rep.R.actions, 600);
    point(tn - 0.65, 0.55, rep.R.next, 0.42, 0.55);
    hover(tn - 0.1, "next");
    cur.click(tn);
    ev(tn + 0.04, S => { S.busy = "save"; S.hover = null; });
    stepChange(tn + 0.75, 2);
    camOn(tn + 0.8, 1.2, rep.R.review, 1.22, { cx: CX, dy: 40 });
    cur.move(tn + 0.8, 0.9, 700, 300);
  }

  /* =====================================================================
     Chapter 5 · Step 3, review & consent
     ===================================================================== */
  {
    ring(W("review", "every") - 0.1, W("review", "link") - 0.2, rep.R.review, { pad: 14, radius: 14, navy: true });
    const edit = rep.root.querySelector("[data-a=edit]");
    point(W("review", "link") - 0.6, 0.55, edit, 0.5, 0.6);
    ring(W("review", "link") - 0.1, end("review") + 0.5, edit, { pad: 6, tag: "Jumps back to step 1", side: "right" });

    const tb = at("boxes") - 0.55;
    scrollFor(tb, 1.15, rep.checks.consent, 300);
    camOn(tb, 1.25, rep.checks.certified, 1.28, { cx: CX, dy: -40 });
    const tc1 = W("boxes", "client") + 0.05;
    clickAt(tc1, rep.checks.consent.querySelector(".cc-box"), { dur: 0.55 });
    ev(tc1 + 0.04, S => { S.data.consent = true; });
    ring(W("boxes", "required") - 0.05, W("boxes", "certification") - 0.15, rep.checks.consent, { pad: 6, tag: "Required", side: "top" });
    const tc2 = W("boxes", "certification") + 0.25;
    clickAt(tc2, rep.checks.certified.querySelector(".cc-box"), { dur: 0.5 });
    ev(tc2 + 0.04, S => { S.data.certified = true; });
    ring(W("boxes", "certification") - 0.05, end("boxes") + 0.3, rep.checks.certified, { pad: 6, tag: "Required: eligible for taxpayer-funded services", side: "top" });

    const ts = W("sign", "signature") - 1.75;
    scrollFor(ts, 1.0, rep.F.signature, 300);
    camOn(ts, 1.1, rep.F.signature, 1.3, { cx: CX, dy: 70 });
    fill(W("sign", "signature") - 0.15, "signature", "Maya Brooks", 15, { dur: 0.5 });
    ev(W("sign", "match") + 0.2, S => { S.focus = null; });
    ring(W("sign", "match") - 0.1, W("sign", "SBA") - 0.25, rep.C.signature, { pad: 6, tag: "Must match the name entered: Maya Brooks", side: "top" });
    ring(W("sign", "SBA") - 0.1, end("sign") + 0.35, rep.checks.sba, { pad: 6, tag: "Optional", side: "bottom", navy: true });
    point(W("sign", "SBA") - 0.2, 0.6, rep.checks.sba.querySelector(".cc-box"), 0.5, 0.5);

    const tr = W("register", "Register");
    scrollFor(tr - 1.15, 0.9, rep.R.actions, 600);
    camOn(tr - 1.15, 1.0, rep.R.next, 1.38, { cx: CX, dy: -60 });
    point(tr - 0.7, 0.6, rep.R.next, 0.45, 0.55);
    hover(tr - 0.12, "next");
    cur.click(tr);
    ev(tr + 0.04, S => { S.busy = "save"; S.hover = null; });
    logAt(2, W("register", "records"));
    const ctr = CC.center("40202");
    stepChange(tr + 1.95, 3, S => { S.appt = { centerId: ctr.centerId, centerName: ctr.name, coaches: ctr.coaches, mode: "choose", selected: "", sync: "pending" }; });
    cur.move(tr + 2.0, 0.9, 760, 420);
  }

  /* =====================================================================
     Chapter 6 · Step 4, your appointment
     ===================================================================== */
  {
    const t3 = W("register", "Register") + 1.95;
    scrollTo(t3 + 0.3, 1.2, Math.round(rectAt(t3 + 0.3, ".cc-coach-choices").y - 110));
    camOn(t3 + 0.3, 1.4, ".cc-coach-grid", 1.12, { cx: CX, dy: 40 });
    ring(W("pick", "Louisville") - 0.1, W("pick", "specialties") - 0.2, ".cc-coach-grid", { pad: 10, radius: 16, tag: "Photo cards: Louisville and Lexington", side: "top", navy: true });
    [0, 1, 2].forEach(i => ring(W("pick", "specialties") + i * 0.12, end("pick") + 0.4, `.cc-coach:nth-child(${i + 1}) .cc-spec`, { pad: 6, radius: 10 }));

    // Claire is the natural fit
    camOn(at("claire") - 0.2, 1.3, '[data-coach="489"]', 1.42, { dy: 60 });
    ev(W("claire", "restaurant") - 0.05, S => { S.hl = "Restaurant & catering operations"; });
    ring(W("claire", "restaurant") - 0.1, W("claire", "fit") + 0.5, '[data-spec="Restaurant & catering operations"]', { pad: 6, tag: "Matches Maya’s business", side: "left" });
    const tk = W("claire", "fit") + 0.05;
    point(tk - 1.3, 0.75, '[data-a=coach][data-id="489"]', 0.5, 0.55);
    hover(tk - 0.35, "coach-489");
    cur.click(tk);
    ev(tk + 0.04, S => { S.busy = "489"; S.hover = null; });
    ev(tk + 0.9, S => { S.busy = null; S.appt.mode = "calendar"; S.appt.selected = "489"; S.cal.loading = true; });
    ev(tk + 1.5, S => { S.cal.loading = false; });
    logAt(3, W("calendly", "saved"));

    // the scheduler
    const tc = tk + 0.95;
    scrollTo(tc, 0.9, Math.round(rectAt(tk + 1.6, ".cc-picked").y - 70));
    camOn(tk + 1.6, 1.1, ".cc-cal", 1.28, { cx: CX, dy: 10 });
    ring(W("calendly", "name") - 0.1, end("calendly") + 0.25, ".cc-cal-head .pre", { pad: 7, tag: "Filled in from the form", side: "right" });

    const td = W("booked", "picks") + 0.1;
    clickAt(td, '.cc-cal-grid [data-v="3"]', { dur: 0.6 });
    ev(td + 0.03, S => { S.cal.hoverDate = 3; });
    ev(td + 0.18, S => { S.cal.date = 3; S.cal.view = "time"; S.cal.hoverDate = null; });
    const tt = td + 0.75;
    clickAt(tt, '.cc-cal-times [data-v="10:30am"]', { dur: 0.45 });
    ev(tt + 0.03, S => { S.cal.hoverTime = "10:30am"; });
    ev(tt + 0.18, S => { S.cal.time = "10:30am"; S.cal.view = "form"; S.cal.hoverTime = null; });
    const tg = W("booked", "calendar") - 0.25;
    point(tg - 0.5, 0.42, ".cc-cal-go", 0.5, 0.5);
    hover(tg - 0.08, "calConfirm");
    cur.click(tg);
    ev(tg + 0.2, S => { S.appt.mode = "booked"; S.appt.sync = "pending"; S.hover = null; });
    scrollTo(tg + 0.2, 0.01, 0);
    tl.to(rep.R.card, tg + 0.06, 0.14, { o: 0.3 }, E.in2);
    tl.to(rep.R.card, tg + 0.2, 0.4, { o: 1 }, E.out);
    camOn(tg + 0.3, 1.2, rep.R.appt, 1.3, { cx: CX, dy: -20 });
    cur.move(tg + 0.4, 0.8, 1040, 700);
    // settle-in bump; resting value first so the pane is not offset before the bump
    tl.init(rep.R.appt, { y: 0 });
    tl.set(rep.R.appt, tg + 0.2, { y: 12 });
    tl.to(rep.R.appt, tg + 0.2, 0.6, { y: 0 }, E.glide);
    ring(W("booked", "emails") - 0.1, W("booked", "booking") - 0.2, ".cc-success + .cc-info", { pad: 6, tag: "Calendly emails the confirmation", side: "top", alignRight: true });
    ev(W("booked", "noted") - 0.05, S => { S.appt.sync = "synced"; });
    ring(W("booked", "noted") + 0.05, end("booked") + 0.5, () => rep.root.querySelector("[role=status] .cc-muted"), { pad: 6, tag: "Noted on her client record", side: "bottom" });
    logAt(4, W("booked", "noted"));
  }

  /* variants: Lexington picker and a simple list; then the retry state */
  {
    const scrim = el("div", "scrim");
    overlays.appendChild(scrim);
    const mkCard = (id, zip, head, small, mutate, crop, scale, x, y) => {
      const card = el("div", "vcard", `<div class="vc-head">${ico("mapPin", 22)}<span>${head}</span><small>${small}</small></div><div class="vc-win"></div>`);
      overlays.appendChild(card);
      const r = Replica({ id });
      card.querySelector(".vc-win").appendChild(r.root);
      const S = newState();
      Object.assign(S.data, CC.SAMPLE);
      const c = CC.center(zip);
      S.step = 3;
      S.appt = { centerId: c.centerId, centerName: c.name, coaches: c.coaches, mode: "choose", selected: c.coaches.length === 1 ? c.coaches[0].id : "", sync: "synced" };
      if (mutate) mutate(S);
      r.render(S);
      const a = r.rect(crop[0]), b = r.rect(crop[1]);
      const top = a.y - 18, bottom = b.y + b.h + 18, left = r.rect(r.R.card).x + 18, width = r.rect(r.R.card).w - 36;
      const win = card.querySelector(".vc-win");
      win.style.width = width * scale + "px";
      win.style.height = (bottom - top) * scale + "px";
      r.root.style.transform = `translate(${-left * scale}px, ${-top * scale}px) scale(${scale})`;
      card.style.left = x + "px";
      card.style.top = y + "px";
      return { card, r, scale, top, left };
    };
    const A = mkCard("lex", "40507", "Lexington SBDC", "Photo cards + first available", null, ["[data-r2=center]", ".cc-first"], 0.76, 56, 92);
    const B = mkCard("sc", "42101", "South Central SBDC", "A simple list", null, ["[data-r2=center]", "[data-r=appt] .cc-actions"], 0.76, 710, 300);
    const C = mkCard("fail", "40202", "If the record note fails", "The booking still stands", S => { S.appt.mode = "booked"; S.appt.sync = "failed"; }, [".cc-success", "[data-r2=retry]"], 1.0, 290, 300);
    const tv0 = at("variants") - 0.35, tv1 = at("retry") - 0.15, tr1 = end("retry") + 0.3;
    tl.window(scrim, tv0 - 0.1, tr1 + 0.6);
    tl.ft(scrim, tv0, 0.5, { o: [0, 1] }, E.out);
    tl.to(scrim, tr1, 0.45, { o: 0 }, E.in2);
    [A.card, B.card, C.card].forEach(c => tl.window(c, tv0 - 0.1, tr1 + 0.6));
    tl.ft(A.card, W("variants", "Lexington") - 0.15, 0.8, { o: [0, 1], y: [50, 0] }, E.glide);
    tl.ft(B.card, W("variants", "simple") - 0.55, 0.8, { o: [0, 1], y: [50, 0] }, E.glide);
    tl.to(A.card, tv1, 0.45, { o: 0, y: -30 }, E.in2);
    tl.to(B.card, tv1 + 0.05, 0.45, { o: 0, y: -30 }, E.in2);
    tl.ft(C.card, W("retry", "record") - 0.2, 0.8, { o: [0, 1], y: [50, 0] }, E.glide);
    tl.to(C.card, tr1, 0.45, { o: 0, y: -20 }, E.in2);
    // ring the first-available box and the retry link inside the mini cards
    const miniRing = (M, sel, t0, t1, label) => {
      const rr = M.r.rect(sel), win = M.card.querySelector(".vc-win");
      const h = el("div", "hl");
      Object.assign(h.style, { left: (rr.x - M.left) * M.scale - 6 + "px", top: (rr.y - M.top) * M.scale - 6 + "px", width: rr.w * M.scale + 12 + "px", height: rr.h * M.scale + 12 + "px", borderRadius: "10px", zIndex: 4 });
      win.appendChild(h);
      tl.ft(h, t0, 0.45, { o: [0, 1], s: [1.06, 1] }, E.out);
      tl.to(h, t1, 0.3, { o: 0 }, E.in2);
      void label;
    };
    miniRing(A, ".cc-first", W("variants", "first") - 0.05, tv1, "");
    miniRing(B, "[data-r=appt] .cc-radios", W("variants", "simple") + 0.35, tv1, "");
    miniRing(C, "[data-r2=retry] .cc-link", W("retry", "retry") - 0.1, tr1, "");
  }

  /* =====================================================================
     Chapter 7 · Behind the scenes: five handoffs
     ===================================================================== */
  const c6 = CH[6];
  tl.to(rail, c6, 0.9, { x: 560 }, E.camera);
  tl.to(caps, c6, 0.9, { "--cx": 960 }, E.camera);
  tl.to(browser, c6 + 0.05, 0.7, { o: 0 }, E.in2);
  cur.hide(c6);
  const ovPipe = el("div", "ov ov-pipe", `<div class="p-grid"></div>
    <div class="p-eb">${ico("eye", 26)} Behind the scenes</div>
    <div class="p-h"><span class="ln" style="display:block;overflow:hidden;padding-bottom:10px"><span style="display:block">Five handoffs, one visit</span></span></div>
    <svg class="p-line" viewBox="0 0 1920 1080"><line x1="240" y1="484" x2="1680" y2="484" stroke="#2c5585" stroke-width="4" stroke-dasharray="2 14" stroke-linecap="round"/><line id="pLine" x1="240" y1="484" x2="1680" y2="484" stroke="#ce0e40" stroke-width="5" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/></svg>`);
  overlays.appendChild(ovPipe);
  tl.window(ovPipe, c6 - 0.1, CH[7] + 1.0);
  tl.ft(ovPipe, c6 + 0.15, 0.8, { o: [0, 1] }, E.out);
  fadeUp(tl, $(".p-eb", ovPipe), c6 + 0.5, 0.6, 12);
  tl.ft($(".p-h .ln > span", ovPipe), W("handoffs", "five") - 0.55, 1.0, { y: [130, 0] }, E.glide);
  const NODES = [
    ["mapPin", "ZIP code", "Picks the center", "In the form", "ZIP"],
    ["save", "Continue", "Saves the contact", "Coach Connect", "Continue"],
    ["database", "Register", "Records the client", "Neoserra", "Register"],
    ["calendar", "Coach choice", "Opens their calendar", "Calendly", "calendar"],
    ["clipboardCheck", "Booking", "Lands on the record", "Neoserra", "booking"],
  ];
  const pLine = $("#pLine", ovPipe);
  const tAct = NODES.map(n => W("pipeline", n[4]) - 0.12);
  NODES.forEach(([icon, h, p, where], i) => {
    const node = el("div", "pnode", `<div class="pc"><span class="pn">${i + 1}</span>${ico(icon, 54)}<span class="on">${ico(icon, 54)}</span></div><h4>${h}</h4><p>${p}</p><span class="where">${where}</span>`);
    node.style.left = 240 + i * 360 - 150 + "px";
    ovPipe.appendChild(node);
    tl.ft(node, W("handoffs", "five") + i * 0.09, 0.7, { o: [0, 0.45], y: [30, 0] }, E.glide);
    tl.to(node, tAct[i], 0.35, { o: 1 }, E.out);
    tl.ft($(".on", node), tAct[i], 0.45, { o: [0, 1], s: [0.6, 1] }, E.back(1.8));
  });
  tl.fn(tAct[0], tAct[4] - tAct[0], (p, tt) => {
    let k = 0;
    for (let i = 0; i < 4; i++) if (tt >= tAct[i]) k = i;
    const seg = clamp((tt - tAct[k]) / Math.min(0.8, tAct[k + 1] - tAct[k]));
    const prog = tt >= tAct[4] ? 1 : (k + E.camera(seg)) / 4;
    pLine.style.strokeDashoffset = r4(1 - prog);
  });
  pLine.style.strokeDashoffset = 1;
  tl.to(ovPipe, CH[7] - 0.35, 0.4, { o: 0 }, E.in2);

  /* =====================================================================
     Chapter 8 · Staff tips
     ===================================================================== */
  const c7 = CH[7];
  const ovTips = el("div", "ov ov-tips", `<div class="tips-eb">For staff</div><div class="tips-h">Two things to know</div>
    <div class="tipcard" id="tip1"><div class="tc-ic">${ico("userPlus", 34)}</div><h3>Registering a client yourself?</h3><p>Finish their booking, then start fresh for the next person.</p>
      <div class="mini cc" style="background:none">
        <div class="ma"><div class="ttl"><span class="ok">${ico("check", 19)}</span>You’re on the calendar.</div><div class="row"><span class="lbl">Registering another client?</span><span class="cc-btn secondary" style="min-height:46px;padding:10px 18px;font-size:16px">Start a new registration</span></div></div>
        <div class="mb"><div class="lbl" style="letter-spacing:1.4px;text-transform:uppercase;font-weight:650;color:#002e5d;font-size:13px">Step 1 of 4</div><div class="ttl" style="margin-top:6px">Let’s get to know you.</div><div class="fake"><i></i><i></i></div></div>
      </div></div>
    <div class="tipcard" id="tip2"><div class="tc-ic">${ico("phone", 34)}</div><h3>Clients can call for help</h3><p>On a computer screen, it’s in the form’s sidebar on every step.</p>
      <div class="phone"><span>1-</span><span>888-</span><span>414-</span><span>7232</span></div><div class="hours">Monday–Friday, 8am–5pm</div></div>`);
  overlays.appendChild(ovTips);
  const tip1 = $("#tip1", ovTips), tip2 = $("#tip2", ovTips);
  tip1.style.left = "140px";
  tip2.style.left = "1000px";
  tl.window(ovTips, c7 - 0.2, CH[8] + 1.0);
  tl.ft(ovTips, c7 - 0.02, 0.55, { o: [0, 1] }, E.out);
  fadeUp(tl, $(".tips-eb", ovTips), c7 + 0.3, 0.6, 10);
  fadeUp(tl, $(".tips-h", ovTips), c7 + 0.45, 0.8, 18);
  tl.ft(tip1, at("walkin") - 0.3, 0.9, { o: [0, 1], y: [60, 0] }, E.glide);
  const ma = $(".ma", tip1), mb = $(".mb", tip1);
  tl.init(mb, { o: 0 });
  const tClr = W("walkin", "clears") - 0.1;
  const tipCur = makeCursor(tl, $(".mini", tip1), [420, 150]);
  tipCur.show(at("walkin") + 0.6);
  tipCur.move(W("walkin", "Start") - 0.6, 0.6, 560, 90);
  tipCur.click(tClr);
  tl.to($(".cc-btn", ma), tClr - 0.15, 0.1, { o: 0.75 }, E.lin);
  tl.to(ma, tClr + 0.15, 0.3, { o: 0 }, E.in2);
  tl.to(mb, tClr + 0.2, 0.4, { o: 1 }, E.out);
  tipCur.hide(tClr + 0.9);
  tl.ft(tip2, at("phone") - 0.4, 0.9, { o: [0, 1], y: [60, 0] }, E.glide);
  const digits = $$(".phone span", tip2);
  const tp0 = W("phone", "1"), tp1 = W("phone", "weekdays") - 0.35;
  digits.forEach((d, i) => {
    tl.init(d, { o: 0.25 });
    tl.to(d, tp0 + (tp1 - tp0) * (i / digits.length), 0.3, { o: 1 }, E.out);
  });
  tl.ft($(".hours", tip2), W("phone", "weekdays") - 0.1, 0.6, { o: [0.3, 1] }, E.out);
  tl.to(ovTips, CH[8] - 0.1, 0.5, { o: 0 }, E.in2);

  /* =====================================================================
     Chapter 9 · Wrap-up
     ===================================================================== */
  const c8 = CH[8];
  const ovEnd = el("div", "ov ov-end", `<div class="e-logo"><img src="${ASSETS.logo}" alt=""></div>
    <div class="e-h"><span class="ln" style="display:block;overflow:hidden;padding-bottom:16px"><span style="display:block">Coach Connect</span></span></div>
    <div class="e-tag"><span>Register.</span><span>Match.</span><span>Book.</span><span class="r">All in one visit.</span></div>
    <div class="e-url">${ico("globe", 32)}<span class="txt"></span></div>
    <div class="e-foot"><div class="e-logos"><img src="${ASSETS.logo}" style="width:118px" alt=""><img src="${ASSETS.uk}" style="width:228px" alt=""><img src="${ASSETS.sba}" style="width:196px" alt=""></div>
    <div class="e-line">Kentucky Small Business Development Center · Hosted by the University of Kentucky · Funded in part by the U.S. SBA · <b>1-888-414-7232</b></div></div>`);
  overlays.appendChild(ovEnd);
  tl.window(ovEnd, c8 - 0.2, DUR + 5);
  tl.ft(ovEnd, c8 + 0.05, 0.6, { o: [0, 1] }, E.out);
  fadeUp(tl, $(".e-logo", ovEnd), c8 + 0.35, 0.8, 14);
  tl.ft($(".e-h .ln > span", ovEnd), W("close", "Coach") - 0.35, 1.1, { y: [200, 0] }, E.glide);
  const tagWords = $$(".e-tag span", ovEnd);
  ["Register", "match", "book", "all"].forEach((w, i) => tl.ft(tagWords[i], W("close", w) - 0.1, 0.6, { o: [0, 1], y: [16, 0] }, E.glide));
  const urlPill = $(".e-url", ovEnd), urlTxt = $(".e-url .txt", ovEnd);
  urlTxt.textContent = URL_FULL;
  urlPill.style.width = urlPill.offsetWidth + "px";
  urlTxt.textContent = "";
  tl.ft(urlPill, W("url", "Send") - 0.1, 0.6, { o: [0, 1] }, E.out);
  const tu = W("url", "register") - 0.2;
  tl.fn(tu, 1.1, p => { urlTxt.textContent = URL_FULL.slice(0, Math.round(p * URL_FULL.length)); });
  fadeUp(tl, $(".e-foot", ovEnd), W("url", "register") + 1.2, 0.9, 14);

  buildHeads();

  /* ---------- per-frame replica render ---------- */
  const tB0 = tWalk - 0.2, tB1 = c6 + 1.0;
  tl.window(browser, tB0, tB1);
  tl.window(rail, tB0, tB1);
  let lastKey = null;
  tl.tick(tt => {
    if (tt < tB0 || tt >= tB1) return;
    rep.render(stateAt(tt));
    void lastKey;
  });

  // initial frame state for build-time measurements is no longer needed
  rep.render(stateAt(0));
  tl.compile();
  return { tl, DUR, CHAPTERS: NARRATION.chapters.map(c => [c.t, c.title]), POSTER_T };
}
