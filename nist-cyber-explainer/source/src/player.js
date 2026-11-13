/* =====================================================================
   Player: fit-to-window stage, play/pause, scrubber with chapters,
   keyboard control, captions (on by default), music in sync with the
   timeline, full screen, and a frame-export hook.
   ===================================================================== */
const MUSIC_SRC = "__MUSIC__";
const LOGO_SRC = "__LOGO__";

/** Brand lockup: the logo file when the build found one, otherwise a typographic wordmark. */
function fillLockups() {
  for (const el of $$(".brand-lockup, #bug")) {
    if (LOGO_SRC) {
      el.innerHTML = `<img src="${LOGO_SRC}" alt="Kentucky SBDC">`;
      el.classList.add("has-img");
    } else {
      el.innerHTML = '<div class="lk-mark"><span class="lk-ky">KENTUCKY</span><span class="lk-sbdc">SBDC</span></div><i class="lk-bar"></i><div class="lk-name">Small Business<br>Development Center</div>';
    }
  }
}
async function decodeImages() {
  const urls = new Set();
  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try { rules = sheet.cssRules; } catch (e) { continue; }
    for (const r of Array.from(rules)) {
      const bi = r.style && r.style.backgroundImage;
      const m = bi && bi.match(/^url\(["']?(data:[^"')]+)["']?\)$/);
      if (m) urls.add(m[1]);
    }
  }
  await Promise.all([...urls].map(u => { const im = new Image(); im.src = u; return im.decode().catch(() => {}); }));
}

(async function main() {
  const app = document.getElementById("app");
  const params = new URLSearchParams(location.search);
  const EXPORT = params.has("export");
  const stage = $("#stage"), poster = $("#poster"), ctrl = $("#ctrl");
  const bPlay = $("#bPlay"), bCC = $("#bCC"), bMute = $("#bMute"), music = $("#music"), scrub = $("#scrub"), track = $("#track");
  const fillEl = $("#fill"), knob = $("#knob"), tip = $("#tip"), tm = $("#tm"), chapEl = $("#chap");

  try { await document.fonts.ready; } catch (e) { /* fall back to system faces */ }
  await decodeImages();

  stage.style.transform = "none";
  const tl = buildPiece();

  let T = 0, playing = false, last = 0, started = false, lastChap = -1;
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const chapterAt = t => { let i = 0; CHAPTERS.forEach(([c], k) => { if (t >= c - 0.001) i = k; }); return i; };

  function ui() {
    const p = (T / DUR) * 100;
    fillEl.style.width = p + "%";
    knob.style.left = p + "%";
    tm.textContent = `${fmt(T)} / ${fmt(DUR)}`;
    const c = chapterAt(T);
    if (c !== lastChap) { chapEl.textContent = `${c + 1} · ${CHAPTERS[c][1]}`; lastChap = c; }
    scrub.setAttribute("aria-valuenow", Math.round(T));
    scrub.setAttribute("aria-valuetext", `${fmt(T)}, ${CHAPTERS[c][1]}`);
  }
  function draw() { tl.render(T); ui(); }
  function frame(now) {
    if (!playing) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    T = Math.min(DUR, T + dt);
    if (music.src && !music.paused && Math.abs(music.currentTime - T) > 0.25 && T < music.duration) music.currentTime = T;
    draw();
    if (T >= DUR) { pause(); return; }
    requestAnimationFrame(frame);
  }
  function begin() { if (!started) { started = true; poster.hidden = true; } }
  function play() {
    if (!started) { begin(); T = 0; }
    if (T >= DUR) T = 0;
    if (playing) return;
    playing = true;
    app.classList.add("playing");
    bPlay.setAttribute("aria-label", "Pause");
    last = performance.now();
    syncMusic(true);
    requestAnimationFrame(frame);
    keepAwake();
    wakeUI();
  }
  function syncMusic(start) {
    if (!music.src) return;
    try { music.currentTime = T; } catch (e) { /* not seekable yet */ }
    if (start) { const p = music.play(); if (p && p.catch) p.catch(() => {}); }
  }
  function pause() {
    playing = false;
    music.pause();
    app.classList.remove("playing");
    bPlay.setAttribute("aria-label", "Play");
    wakeUI();
  }
  const toggle = () => (playing ? pause() : play());
  function seek(t) { begin(); T = clamp(t, 0, DUR); if (playing) syncMusic(false); draw(); }
  function nextChap() { const c = chapterAt(T); if (c < CHAPTERS.length - 1) seek(CHAPTERS[c + 1][0]); }
  function prevChap() {
    const c = chapterAt(T), start = CHAPTERS[c][0];
    seek(T - start > 1.5 || c === 0 ? start : CHAPTERS[c - 1][0]);
  }

  let lock = null;
  async function keepAwake() {
    try {
      if (!lock && navigator.wakeLock) {
        lock = await navigator.wakeLock.request("screen");
        lock.addEventListener("release", () => { lock = null; });
      }
    } catch (e) { /* not granted; playback is unaffected */ }
  }

  function fit() {
    if (EXPORT) { stage.style.transform = "none"; return; }
    const w = app.clientWidth, h = app.clientHeight, s = Math.min(w / STAGE_W, h / STAGE_H);
    stage.style.transform = `translate(${r2((w - STAGE_W * s) / 2)}px, ${r2((h - STAGE_H * s) / 2)}px) scale(${r4(s)})`;
  }
  addEventListener("resize", fit);
  fit();

  // chapter ticks on the scrubber
  const ticks = $("#ticks");
  CHAPTERS.slice(1).forEach(([t]) => { const i = document.createElement("i"); i.style.left = (t / DUR) * 100 + "%"; ticks.appendChild(i); });

  // controls auto-hide so a screen share stays clean
  let idleTimer = 0, scrubbing = false, resume = false;
  function wakeUI() {
    app.classList.remove("idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { if (!scrubbing && started && !ctrl.matches(":hover")) app.classList.add("idle"); }, 2400);
  }
  addEventListener("mousemove", wakeUI);
  addEventListener("pointerdown", wakeUI);

  $("#bigPlay").addEventListener("click", e => { e.stopPropagation(); play(); });
  poster.addEventListener("click", () => play());
  stage.addEventListener("click", () => { if (started) toggle(); });
  bPlay.addEventListener("click", toggle);
  $("#bPrev").addEventListener("click", prevChap);
  $("#bNext").addEventListener("click", nextChap);

  function toggleMute() { music.muted = !music.muted; bMute.setAttribute("aria-pressed", String(music.muted)); }
  bMute.addEventListener("click", toggleMute);
  if (MUSIC_SRC && !EXPORT) music.src = MUSIC_SRC;

  let ccOn = true;
  stage.classList.add("cc-on");
  function toggleCC() { ccOn = !ccOn; stage.classList.toggle("cc-on", ccOn); bCC.setAttribute("aria-pressed", String(ccOn)); }
  bCC.addEventListener("click", toggleCC);

  function fullscreen() {
    const d = document;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else {
        const req = app.requestFullscreen || app.webkitRequestFullscreen;
        const r = req && req.call(app);
        if (r && r.catch) r.catch(() => {});
      }
    } catch (e) { /* full screen not available here */ }
  }
  $("#bFS").addEventListener("click", fullscreen);

  const tFromX = x => { const r = track.getBoundingClientRect(); return clamp((x - r.left) / r.width) * DUR; };
  scrub.addEventListener("pointerdown", e => {
    scrubbing = true;
    resume = playing;
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

  addEventListener("keydown", e => {
    const k = e.key;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target && e.target.tagName === "BUTTON" && (k === " " || k === "Enter")) return;
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

  // first frame: a poster of the finished title card
  const hashChap = /^#chapter-(\d+)$/.exec(location.hash || "");
  if (EXPORT) {
    poster.hidden = true;
    ctrl.hidden = true;
    started = true;
    window.__seek = t => tl.render(t);
    window.__dur = DUR;
    window.__captions = CAPTIONS;
    window.__chapters = CHAPTERS;
    tl.render(0);
  } else if (params.has("t")) {
    seek(parseFloat(params.get("t")) || 0);
  } else if (hashChap && CHAPTERS[+hashChap[1] - 1]) {
    seek(CHAPTERS[+hashChap[1] - 1][0]);
  } else {
    T = POSTER_T;
    draw();
  }
  document.body.classList.add("ready");
  app.classList.add("ready");
  window.__ready = true;
})();
