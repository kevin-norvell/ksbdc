"use strict";
/* =====================================================================
   Player and app shell: Watch / Try tabs, fit-to-window stage, narration
   audio as the master clock, chapters, captions, keyboard control, and
   a frame-export hook (?export) used to render the MP4.
   ===================================================================== */
async function decodeAll() {
  const imgs = Array.from(document.images);
  await Promise.all(imgs.map(im => (im.decode ? im.decode().catch(() => {}) : Promise.resolve())));
}

async function audioURL() {
  if (!NARRATION_AUDIO) return "";
  try {
    const b = await (await fetch(NARRATION_AUDIO)).blob();
    return URL.createObjectURL(b);
  } catch (e) {
    return NARRATION_AUDIO;
  }
}

(async function main() {
  const app = document.getElementById("app");
  app.innerHTML = app.innerHTML.replace(/__ICON_([A-Za-z]+)__/g, (m, n) => ico(n, 20));
  $("#tbLogo").src = ASSETS.logo;
  const params = new URLSearchParams(location.search);
  const EXPORT = params.has("export");
  if (EXPORT) document.body.classList.add("export");

  const stage = $("#stage"), viewport = $("#viewport"), poster = $("#poster"), ctrl = $("#ctrl"), endcta = $("#endcta");
  const bPlay = $("#bPlay"), bCC = $("#bCC"), bMute = $("#bMute"), scrub = $("#scrub"), track = $("#track");
  const fillEl = $("#fill"), knob = $("#knob"), tip = $("#tip"), tm = $("#tm"), chapEl = $("#chap");

  try { await document.fonts.ready; } catch (e) { /* system fallback */ }
  await decodeAll();

  stage.style.transform = "none";
  const { tl, DUR, CHAPTERS, POSTER_T } = buildTour();
  await decodeAll();

  let T = 0, playing = false, last = 0, started = false, lastChap = -1;
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const chapterAt = t => { let i = 0; CHAPTERS.forEach(([c], k) => { if (t >= c - 0.001) i = k; }); return i; };
  scrub.setAttribute("aria-valuemax", Math.round(DUR));

  /* ---------- audio ---------- */
  const audio = new Audio();
  audio.preload = "auto";
  let audioOK = false;
  if (!EXPORT && NARRATION_AUDIO) {
    audio.src = await audioURL();
    audioOK = true;
    audio.addEventListener("error", () => { audioOK = false; });
  }
  const audioLive = () => audioOK && !audio.paused && !audio.ended && audio.readyState >= 2;

  function ui() {
    const p = (T / DUR) * 100;
    fillEl.style.width = p + "%";
    knob.style.left = p + "%";
    tm.textContent = `${fmt(T)} / ${fmt(DUR)}`;
    const c = chapterAt(T);
    if (c !== lastChap) { chapEl.textContent = `${c + 1} · ${CHAPTERS[c][1]}`; lastChap = c; }
    scrub.setAttribute("aria-valuenow", Math.round(T));
    scrub.setAttribute("aria-valuetext", `${fmt(T)}, ${CHAPTERS[c][1]}`);
    endcta.hidden = !(started && !playing && T >= DUR - 0.05);
  }
  function draw() { stage.classList.toggle("no-cap", !started || params.has("nocap")); tl.render(T); ui(); }
  function frame(now) {
    if (!playing) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (audioLive() && Math.abs(audio.currentTime - T) < 1.5) T = Math.min(DUR, audio.currentTime);
    else T = Math.min(DUR, T + dt);
    draw();
    if (T >= DUR) { pause(); return; }
    requestAnimationFrame(frame);
  }
  function begin() { if (!started) { started = true; poster.hidden = true; } }
  function syncAudio() {
    if (!audioOK) return;
    try { if (Math.abs(audio.currentTime - T) > 0.08) audio.currentTime = T; } catch (e) { /* not seekable yet */ }
    if (playing && audio.paused && T < DUR - 0.05) { const p = audio.play(); if (p && p.catch) p.catch(() => {}); }
  }
  function play() {
    if (!started) { begin(); T = 0; }
    if (T >= DUR - 0.05) T = 0;
    if (playing) return;
    playing = true;
    app.classList.add("playing");
    bPlay.setAttribute("aria-label", "Pause");
    last = performance.now();
    syncAudio();
    requestAnimationFrame(frame);
    keepAwake();
    wakeUI();
    ui();
  }
  function pause() {
    playing = false;
    app.classList.remove("playing");
    bPlay.setAttribute("aria-label", "Play");
    if (audioOK) audio.pause();
    wakeUI();
    ui();
  }
  const toggle = () => (playing ? pause() : play());
  function seek(t) { begin(); T = clamp(t, 0, DUR); draw(); if (playing) syncAudio(); else if (audioOK) { try { audio.currentTime = T; } catch (e) { /* ignore */ } } }
  function nextChap() { const c = chapterAt(T); if (c < CHAPTERS.length - 1) seek(CHAPTERS[c + 1][0]); }
  function prevChap() { const c = chapterAt(T), s = CHAPTERS[c][0]; seek(T - s > 1.5 || c === 0 ? s : CHAPTERS[c - 1][0]); }
  audio.addEventListener("ended", () => { if (playing) { T = DUR; draw(); pause(); } });

  let lock = null;
  async function keepAwake() {
    try {
      if (!lock && navigator.wakeLock) { lock = await navigator.wakeLock.request("screen"); lock.addEventListener("release", () => { lock = null; }); }
    } catch (e) { /* not granted */ }
  }

  function fit() {
    if (EXPORT) { stage.style.transform = "none"; return; }
    // outside full screen, keep the control bar below the picture so it never covers captions
    const full = !!(document.fullscreenElement || document.webkitFullscreenElement);
    const w = viewport.clientWidth, h = viewport.clientHeight - (full ? 0 : 80), s = Math.min(w / STAGE_W, h / STAGE_H);
    stage.style.transform = `translate(${r2((w - STAGE_W * s) / 2)}px, ${r2((h - STAGE_H * s) / 2)}px) scale(${r4(s)})`;
  }
  addEventListener("resize", fit);
  fit();

  const ticks = $("#ticks");
  CHAPTERS.slice(1).forEach(([t]) => { const i = document.createElement("i"); i.style.left = (t / DUR) * 100 + "%"; ticks.appendChild(i); });

  // controls hide while playing so a screen share stays clean
  let idleTimer = 0, scrubbing = false, resume = false;
  function wakeUI() {
    app.classList.remove("idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { if (playing && !scrubbing && !ctrl.matches(":hover")) app.classList.add("idle"); }, 2400);
  }
  viewport.addEventListener("mousemove", wakeUI);
  viewport.addEventListener("pointerdown", wakeUI);

  $("#bigPlay").addEventListener("click", e => { e.stopPropagation(); play(); });
  poster.addEventListener("click", () => play());
  stage.addEventListener("click", () => { if (started) toggle(); });
  bPlay.addEventListener("click", toggle);
  $("#bPrev").addEventListener("click", prevChap);
  $("#bNext").addEventListener("click", nextChap);
  $("#ctaReplay").addEventListener("click", () => { seek(0); play(); });
  $("#ctaTry").addEventListener("click", () => setMode("try"));

  let ccOn = true;
  function toggleCC() { ccOn = !ccOn; stage.classList.toggle("cc-off", !ccOn); bCC.setAttribute("aria-pressed", String(ccOn)); }
  bCC.addEventListener("click", toggleCC);
  function toggleMute() {
    audio.muted = !audio.muted;
    app.classList.toggle("muted", audio.muted);
    bMute.setAttribute("aria-pressed", String(audio.muted));
    bMute.setAttribute("aria-label", audio.muted ? "Unmute" : "Mute");
  }
  bMute.addEventListener("click", toggleMute);

  function fullscreen() {
    const d = document;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else { const req = viewport.requestFullscreen || viewport.webkitRequestFullscreen; const r = req && req.call(viewport); if (r && r.catch) r.catch(() => {}); }
    } catch (e) { /* not available */ }
  }
  $("#bFS").addEventListener("click", fullscreen);
  document.addEventListener("fullscreenchange", () => setTimeout(fit, 50));

  const tFromX = x => { const r = track.getBoundingClientRect(); return clamp((x - r.left) / r.width) * DUR; };
  scrub.addEventListener("pointerdown", e => {
    scrubbing = true; resume = playing;
    if (playing) pause();
    try { scrub.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    seek(tFromX(e.clientX));
  });
  scrub.addEventListener("pointermove", e => {
    const t = tFromX(e.clientX);
    tip.textContent = `${fmt(t)} · ${CHAPTERS[chapterAt(t)][1]}`;
    tip.style.left = (t / DUR) * 100 + "%";
    if (scrubbing) seek(t);
  });
  const endScrub = () => { if (!scrubbing) return; scrubbing = false; if (resume) play(); };
  scrub.addEventListener("pointerup", endScrub);
  scrub.addEventListener("pointercancel", endScrub);

  /* ---------- Watch / Try tabs ---------- */
  const tabWatch = $("#tabWatch"), tabTry = $("#tabTry"), secWatch = $("#watch"), secTry = $("#try");
  let mode = "watch", sandboxReady = false;
  function setMode(m, fromHash) {
    mode = m;
    const tryOn = m === "try";
    if (tryOn && playing) pause();
    tabWatch.setAttribute("aria-selected", String(!tryOn));
    tabTry.setAttribute("aria-selected", String(tryOn));
    tabWatch.tabIndex = tryOn ? -1 : 0;
    tabTry.tabIndex = tryOn ? 0 : -1;
    secWatch.hidden = tryOn;
    secTry.hidden = !tryOn;
    if (tryOn && !sandboxReady) { buildSandbox(); sandboxReady = true; }
    if (!tryOn) fit();
    if (!fromHash) { try { history.replaceState(null, "", tryOn ? "#try" : "#watch"); } catch (e) { /* file:// */ } }
  }
  tabWatch.addEventListener("click", () => setMode("watch"));
  tabTry.addEventListener("click", () => setMode("try"));
  $(".tb-tabs").addEventListener("keydown", e => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); const next = mode === "watch" ? "try" : "watch"; setMode(next); (next === "try" ? tabTry : tabWatch).focus(); }
  });

  addEventListener("keydown", e => {
    if (mode !== "watch") return;
    const k = e.key;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = e.target && e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if ((tag === "BUTTON" || e.target.getAttribute("role") === "tab") && (k === " " || k === "Enter")) return;
    let handled = true;
    if (k === " " || k === "k" || k === "K") toggle();
    else if (k === "ArrowRight") seek(T + (e.shiftKey ? 1 : 5));
    else if (k === "ArrowLeft") seek(T - (e.shiftKey ? 1 : 5));
    else if (k === "l" || k === "L") seek(T + 10);
    else if (k === "j" || k === "J") seek(T - 10);
    else if (k === "]" || k === "PageDown") nextChap();
    else if (k === "[" || k === "PageUp") prevChap();
    else if (k === "Home") seek(0);
    else if (k === "End") seek(DUR);
    else if (k === "f" || k === "F") fullscreen();
    else if (k === "c" || k === "C") toggleCC();
    else if (k === "m" || k === "M") toggleMute();
    else handled = false;
    if (handled) { e.preventDefault(); wakeUI(); }
  });

  /* ---------- first frame ---------- */
  const hashChap = /^#chapter-(\d+)$/.exec(location.hash || "");
  if (EXPORT) {
    poster.hidden = true;
    started = true;
    stage.classList.toggle("no-cap", params.has("nocap"));
    window.__seek = t => tl.render(t);
    window.__dur = DUR;
    window.__chapters = CHAPTERS;
    tl.render(0);
  } else if (location.hash === "#try") {
    T = POSTER_T; draw();
    setMode("try", true);
  } else if (params.has("t")) {
    seek(parseFloat(params.get("t")) || 0);
  } else if (hashChap && CHAPTERS[+hashChap[1] - 1]) {
    seek(CHAPTERS[+hashChap[1] - 1][0]);
  } else {
    T = POSTER_T;
    draw();
    endcta.hidden = true;
  }
  app.classList.add("ready");
  window.__ready = true;
})();
