/* =====================================================================
   Artwork: a small line-icon set (48-unit grid, stroked with currentColor)
   and the Bandit, the raccoon who plays every cyber criminal in the piece.
   All original, drawn for this explainer.
   ===================================================================== */
const ICONS = {
  laptop: '<rect x="9" y="10" width="30" height="21" rx="2.5"/><path d="M4 36h40l-3 4H7z"/>',
  monitor: '<rect x="5" y="7" width="38" height="26" rx="2.5"/><path d="M18 41h12M24 33v8"/>',
  phone: '<rect x="14" y="4" width="20" height="40" rx="4.5"/><path d="M21 38h6"/>',
  printer: '<path d="M14 18V6h20v12"/><rect x="6" y="18" width="36" height="16" rx="3"/><path d="M14 28h20v14H14z"/><path d="M35 23h1"/>',
  camera: '<path d="M5 15l26-6 3 12-26 6z"/><path d="M34 13l9-3 2 9-9 2"/><path d="M17 26l2 8H8"/>',
  router: '<rect x="5" y="26" width="38" height="12" rx="3"/><path d="M12 26V12M36 26V12"/><path d="M12 32h.5M18 32h.5M28 32h8"/>',
  drive: '<rect x="9" y="7" width="30" height="34" rx="4"/><circle cx="24" cy="21" r="7"/><path d="M15 34h5"/>',
  cloud: '<path d="M14 37h22a8.5 8.5 0 0 0 0-17A11.5 11.5 0 0 0 14 18a9.5 9.5 0 0 0 0 19z"/>',
  globe: '<circle cx="24" cy="24" r="18"/><path d="M6 24h36M24 6c7 7 7 29 0 36M24 6c-7 7-7 29 0 36"/>',
  bank: '<path d="M5 18L24 7l19 11z"/><path d="M10 22v13M19 22v13M29 22v13M38 22v13M5 40h38"/>',
  shop: '<path d="M8 19l3-10h26l3 10"/><path d="M8 19a5 5 0 0 0 10.7 0 5 5 0 0 0 10.6 0 5 5 0 0 0 10.7 0"/><path d="M10 24v17h28V24M20 41v-9h8v9"/>',
  candle: '<rect x="16" y="22" width="16" height="21" rx="2"/><path d="M24 22v-4"/><path d="M24 4c4 5 5 7 5 9.5a5 5 0 0 1-10 0C19 11 20 9 24 4z"/>',
  mail: '<rect x="5" y="10" width="38" height="28" rx="3.5"/><path d="M6 13l18 13 18-13"/>',
  lock: '<rect x="10" y="21" width="28" height="21" rx="3.5"/><path d="M16 21v-6a8 8 0 0 1 16 0v6"/><path d="M24 29v6"/>',
  unlock: '<rect x="10" y="21" width="28" height="21" rx="3.5"/><path d="M16 21v-6a8 8 0 0 1 15.4-3"/><path d="M24 29v6"/>',
  shield: '<path d="M24 4l17 6.5V22c0 10.5-7.3 18.2-17 22C14.3 40.2 7 32.5 7 22V10.5z"/>',
  shieldok: '<path d="M24 4l17 6.5V22c0 10.5-7.3 18.2-17 22C14.3 40.2 7 32.5 7 22V10.5z"/><path d="M16.5 23.5l5.5 5.5 10-11"/>',
  key: '<circle cx="15" cy="31" r="8.5"/><path d="M21 25L38 8M31 15l5 5M26.5 19.5l4 4"/>',
  finger: '<path d="M13 37c-2-4-3-8.5-3-13a14 14 0 0 1 28 0"/><path d="M19 41c-2.5-5-3.5-10-3.5-17a8.5 8.5 0 0 1 17 0c0 4-.3 8-1.5 12"/><path d="M24 24c0 7 1.4 12.5 4.5 17.5"/><path d="M38 31c0 3-.4 6-1 9"/>',
  person: '<circle cx="24" cy="15" r="8"/><path d="M8 42c0-9 7-15.5 16-15.5S40 33 40 42"/>',
  crown: '<path d="M8 36L5 15l11 9 8-14 8 14 11-9-3 21z"/><path d="M8 42h32"/>',
  doc: '<path d="M12 4h17l9 9v31H12z"/><path d="M29 4v9h9M18 23h14M18 30h14M18 37h9"/>',
  scales: '<path d="M24 6v34M14 42h20M9 12h30"/><path d="M9 12L3.5 25h11zM39 12l-5.5 13h11z"/>',
  umbrella: '<path d="M5 25a19 19 0 0 1 38 0z"/><path d="M24 25v12.5a4.5 4.5 0 0 1-9 0"/><path d="M24 4v2"/>',
  link: '<path d="M19 29l10-10"/><path d="M22 14l4-4a7.8 7.8 0 0 1 11 11l-4 4"/><path d="M26 34l-4 4a7.8 7.8 0 0 1-11-11l4-4"/>',
  clip: '<rect x="9" y="8" width="30" height="36" rx="3.5"/><path d="M18 8V4.5h12V8"/><path d="M16 20h2M23 20h9M16 28h2M23 28h9M16 36h2M23 36h9"/>',
  plan: '<rect x="9" y="8" width="30" height="36" rx="3.5"/><path d="M18 8V4.5h12V8"/><path d="M17 27l5 5 9-10"/>',
  trash: '<path d="M7 13h34M19 13V7h10v6M11 13l2 30h22l2-30"/><path d="M20 20v16M28 20v16"/>',
  cycle: '<path d="M39 19A16 16 0 0 0 10 15"/><path d="M9 6v9.5h9.5"/><path d="M9 29a16 16 0 0 0 29 4"/><path d="M39 42v-9.5h-9.5"/>',
  eye: '<path d="M3 24s7.5-13 21-13 21 13 21 13-7.5 13-21 13S3 24 3 24z"/><circle cx="24" cy="24" r="6.5"/>',
  bell: '<path d="M12 34V22a12 12 0 0 1 24 0v12l3.5 4h-31z"/><path d="M20 43h8"/>',
  siren: '<path d="M13 38V27a11 11 0 0 1 22 0v11"/><path d="M8 38h32v6H8z"/><path d="M24 4v5M8.5 10.5l3.5 3.5M39.5 10.5L36 14"/>',
  plug: '<path d="M17 5v10M31 5v10M11 15h26v6a13 13 0 0 1-26 0z"/><path d="M24 34v9"/>',
  restore: '<path d="M8 24a16 16 0 1 0 4.7-11.3"/><path d="M8 5v8h8"/><path d="M24 15v10l6.5 4"/>',
  pencil: '<path d="M8 40l3-10L32 9l7 7-21 21z"/><path d="M28 13l7 7"/>',
  warn: '<path d="M24 5l20.5 36h-41z"/><path d="M24 19v10M24 35v.5"/>',
  check: '<path d="M9 25l9.5 9.5L39 14"/>',
  x: '<path d="M12 12l24 24M36 12L12 36"/>',
  hook: '<circle cx="24" cy="6" r="2.5"/><path d="M24 8.5V29a8 8 0 0 1-16 0v-5l5 4"/>',
  card: '<rect x="4" y="10" width="40" height="28" rx="3.5"/><path d="M4 18h40M10 30h10"/>',
  search: '<circle cx="20" cy="20" r="12.5"/><path d="M29 29l13 13"/>',
  down: '<path d="M24 5v25M14 20l10 10 10-10M8 41h32"/>',
  call: '<path d="M13 5l7 9.5-4.5 4.5c2.5 5.5 6.5 9.5 12 12l4.5-4.5 9.5 7-3.5 7.5C22 41 7 26 5.5 9z"/>',
  cal: '<rect x="6" y="9" width="36" height="33" rx="3.5"/><path d="M6 18h36M15 4.5v8M33 4.5v8M14 26h4M22 26h4M30 26h4M14 33h4M22 33h4"/>',
  chartdn: '<path d="M5 10l13 14 8-7 17 18"/><path d="M43 25v10H33"/>',
  gift: '<rect x="6" y="17" width="36" height="9" rx="1.5"/><path d="M9 26v16h30V26M24 17v25"/><path d="M24 17c-4-9-13-8-11-2 1 2 6 2 11 2zM24 17c4-9 13-8 11-2-1 2-6 2-11 2z"/>',
  dollar: '<circle cx="24" cy="24" r="18"/><path d="M30.5 17.5c-1-2-3.4-3.5-6.5-3.5-4 0-6.5 2-6.5 5 0 7 14 3.5 14 10.5 0 3-3 5-7.5 5-3.3 0-5.8-1.4-6.8-3.6M24 10v4M24 34v4"/>',
  gavel: '<path d="M8 41h18"/><path d="M19 15l10-10 9 9-10 10z"/><path d="M24 20L9 35l4 4 15-15"/>',
  vault: '<rect x="5" y="7" width="38" height="34" rx="4"/><circle cx="24" cy="24" r="9"/><path d="M24 15v4M24 29v4M15 24h4M29 24h4M9 41v3M39 41v3"/>',
  wifi: '<path d="M5 18a27 27 0 0 1 38 0M11 25a18.5 18.5 0 0 1 26 0M17 32a10 10 0 0 1 14 0"/><path d="M24 39v.5"/>',
  hat: '<path d="M14 7h20v25H14z"/><path d="M14 25h20"/><path d="M3 33c6 6 36 6 42 0"/>',
  file: '<path d="M13 4h15l9 9v31H13z"/><path d="M28 4v9h9"/>',
  pin: '<path d="M24 44S9 29 9 19a15 15 0 0 1 30 0c0 10-15 25-15 25z"/><circle cx="24" cy="19" r="5.5"/>',
  passkey: '<circle cx="18" cy="15" r="8"/><path d="M4 41c0-8 6-14 14-14 3 0 5.5.8 7.5 2"/><circle cx="35" cy="30" r="5"/><path d="M35 35v9M35 40h4"/>',
};

function ico(name, extra = "") {
  const d = ICONS[name];
  if (!d) throw new Error("missing icon " + name);
  return `<svg class="ico ${extra}" viewBox="0 0 48 48" aria-hidden="true">${d}</svg>`;
}

/* ---------- the Bandit ---------- */
const BANDIT_SVG = `
<svg class="bandit" viewBox="0 0 300 360" aria-hidden="true">
  <g class="b-tail">
    <path d="M206 310 C 280 316 304 248 276 196" fill="none" stroke="#8A909A" stroke-width="40" stroke-linecap="round"/>
    <path d="M206 310 C 280 316 304 248 276 196" fill="none" stroke="#2F343C" stroke-width="40" stroke-dasharray="18 22" stroke-dashoffset="6"/>
  </g>
  <g class="b-body">
    <clipPath id="bShirt"><ellipse cx="150" cy="296" rx="84" ry="68"/></clipPath>
    <ellipse cx="150" cy="296" rx="84" ry="68" fill="#F2F4F7"/>
    <g clip-path="url(#bShirt)" fill="#2F343C">
      <rect x="40" y="236" width="220" height="16"/><rect x="40" y="268" width="220" height="16"/>
      <rect x="40" y="300" width="220" height="16"/><rect x="40" y="332" width="220" height="16"/>
    </g>
    <g class="b-arm-l"><path d="M84 274 C 54 284 48 312 62 322" fill="none" stroke="#8A909A" stroke-width="26" stroke-linecap="round"/><circle cx="62" cy="322" r="15" fill="#2F343C"/></g>
    <g class="b-arm-r"><path d="M216 274 C 246 284 252 312 238 322" fill="none" stroke="#8A909A" stroke-width="26" stroke-linecap="round"/><circle cx="238" cy="322" r="15" fill="#2F343C"/></g>
  </g>
  <g class="b-head">
    <path d="M58 104 L66 24 L130 70 Z" fill="#8A909A"/><path d="M74 88 L78 46 L112 72 Z" fill="#2F343C"/>
    <path d="M242 104 L234 24 L170 70 Z" fill="#8A909A"/><path d="M226 88 L222 46 L188 72 Z" fill="#2F343C"/>
    <ellipse cx="150" cy="134" rx="110" ry="88" fill="#8A909A"/>
    <path d="M150 52 C 140 72 140 92 150 104 C 160 92 160 72 150 52Z" fill="#5E646D"/>
    <ellipse cx="150" cy="178" rx="80" ry="44" fill="#F2F4F7"/>
    <path class="b-brow-l" d="M70 98 Q106 74 138 98" stroke="#F2F4F7" stroke-width="11" fill="none" stroke-linecap="round"/>
    <path class="b-brow-r" d="M162 98 Q194 74 230 98" stroke="#F2F4F7" stroke-width="11" fill="none" stroke-linecap="round"/>
    <path d="M40 130 C 56 98 120 96 150 124 C 180 96 244 98 260 130 C 246 162 192 166 150 144 C 108 166 54 162 40 130Z" fill="#23272E"/>
    <g class="b-eyes">
      <circle cx="106" cy="128" r="18" fill="#fff"/><circle cx="194" cy="128" r="18" fill="#fff"/>
      <circle class="pupil" cx="110" cy="130" r="8.5" fill="#1B1E24"/><circle class="pupil" cx="198" cy="130" r="8.5" fill="#1B1E24"/>
      <circle cx="113.5" cy="125.5" r="2.8" fill="#fff"/><circle cx="201.5" cy="125.5" r="2.8" fill="#fff"/>
    </g>
    <ellipse cx="150" cy="164" rx="16" ry="11" fill="#1B1E24"/>
    <path class="m-smirk" d="M124 186 Q152 204 180 178" stroke="#1B1E24" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <path class="m-grin" d="M122 182 Q150 214 178 182 Z" fill="#1B1E24"/>
    <path class="m-sad" d="M126 198 Q150 180 174 198" stroke="#1B1E24" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <ellipse class="m-shock" cx="150" cy="192" rx="11" ry="13" fill="#1B1E24"/>
  </g>
</svg>`;

/**
 * Place a Bandit. Moods come from a time schedule so scrubbing in either
 * direction always lands on the right face.
 *   moods: [[t, "smirk"|"sad"|"shock"|"grin"], ...]
 */
function bandit(tl, parent, { x, y, s = 1, moods = [[0, "smirk"]], look = null } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "abs b-wrap";
  wrap.style.left = x + "px";
  wrap.style.top = y + "px";
  wrap.style.width = "300px";
  wrap.style.height = "360px";
  wrap.style.transformOrigin = "150px 360px";
  wrap.innerHTML = BANDIT_SVG;
  parent.appendChild(wrap);
  const svg = wrap.firstElementChild;
  const eyes = svg.querySelector(".b-eyes");
  const pupils = svg.querySelectorAll(".pupil");
  tl.init(wrap, { x: 0, y: 0, s, r: 0 });
  let lastMood = null, lastBlink = null, lastLook = null;
  const seed = (x * 7 + y * 13) % 5;
  tl.tick(t => {
    let m = moods[0][1];
    for (const [mt, mm] of moods) if (t >= mt) m = mm;
    if (m !== lastMood) { svg.dataset.mood = m; lastMood = m; }
    const ph = (t + seed) % 3.4;
    const bl = ph < 0.13 ? 0.12 : 1;
    if (bl !== lastBlink) { eyes.style.transform = `scaleY(${bl})`; lastBlink = bl; }
    if (look) {
      let lx = 0, ly = 0;
      for (const [lt, a, b] of look) if (t >= lt) { lx = a; ly = b; }
      const k = lx + "," + ly;
      if (k !== lastLook) { pupils.forEach(p => { p.style.translate = `${lx}px ${ly}px`; }); lastLook = k; }
    }
  });
  return wrap;
}

/** small idle bob for characters and props */
function bob(tl, el, a, b, amp = 6, f = 1.6) {
  tl.tick(t => {
    if (t < a || t > b) return;
    el.style.translate = `0 ${r2(Math.sin((t - a) * f * Math.PI) * amp)}px`;
  });
}
