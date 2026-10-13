/* =====================================================================
   Generic UI icons and the mock Rickhouse Row Bakery homepage that
   appears inside the preview and browser frames.
   ===================================================================== */
const ICONS = {
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 2.9 2.8 15.1 0 18M12 3c-2.8 2.9-2.8 15.1 0 18"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.2 4.5-6 8-6s6.5 1.8 8 6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  bookmark: '<path d="M7 3h10a1 1 0 0 1 1 1v17l-6-4-6 4V4a1 1 0 0 1 1-1z"/>',
  pencil: '<path d="M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
  browser: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.4"/>',
  share: '<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9z"/>',
  cup: '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3.5c0 1 1 1.4 1 2.5M11.5 3.5c0 1 1 1.4 1 2.5"/>',
  rocket: '<path d="M12 3c3 2 4.5 5.5 4 10l-4 3-4-3c-.5-4.5 1-8 4-10z"/><circle cx="12" cy="9.5" r="1.6"/><path d="M8 13l-3 3 3.5.5M16 13l3 3-3.5.5"/>',
};
const ico = (name, cls = "") =>
  `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

const MAP_SVG = `<svg viewBox="0 0 122 96" aria-hidden="true">
  <rect width="122" height="96" fill="#EFE4D3"/>
  <path d="M0 0h34v24H0zM50 0h34v19H50zM98 0h24v15H98zM0 38h30v18H0zM52 31h30v20H52zM96 28h26v21H96zM0 78h40v18H0zM50 72h32v24H50zM94 70h28v26H94z" fill="#E6D7C1"/>
  <path d="M-4 30 128 20" stroke="#fff" stroke-width="7"/>
  <path d="M-4 68 128 58" stroke="#fff" stroke-width="11"/>
  <path d="M40 -4 46 100M90 -4 86 100" stroke="#fff" stroke-width="6"/>
  <text x="6" y="74" transform="rotate(-4.3 6 74)" font-family="Source Sans 3, sans-serif" font-size="7.5" font-weight="700" letter-spacing=".8" fill="#9A8069">MAIN ST</text>
</svg>`;
const PIN_SVG = '<svg viewBox="0 0 24 32" aria-hidden="true"><path d="M12 31s10-10.2 10-18A10 10 0 0 0 2 13c0 7.8 10 18 10 18z" fill="#A9631F"/><circle cx="12" cy="12.5" r="4" fill="#FAF5EC"/></svg>';

const SITE_W = 1120;
const MENU = {
  loaf: ["bg-loaf", "Sourdough bread", ""],
  cookie: ["bg-cookie", "Chocolate chunk cookies", "with sea salt"],
  roll: ["bg-roll", "Cinnamon rolls", ""],
  coffee: ["ws-cup", "Coffee", ""],
};

function siteMarkup({ final = false, special = false } = {}) {
  const order = final ? ["roll", "loaf", "cookie", "coffee"] : ["loaf", "cookie", "roll", "coffee"];
  const row = k =>
    `<div class="ws-item" data-k="${k}"><i class="ws-thumb ${MENU[k][0]}">${k === "coffee" ? ico("cup") : ""}</i>` +
    `<div><b>${MENU[k][1]}</b>${MENU[k][2] ? `<small>${MENU[k][2]}</small>` : ""}</div></div>`;
  return `<div class="ws${final ? " final" : ""}">
  <header class="ws-nav" data-b="nav"><i class="ws-emb"></i><nav><span>Menu</span><span>Visit</span><span>Contact</span></nav></header>
  <section class="ws-hero">
    <div class="ws-copy" data-b="copy">
      <div class="ws-logo-wrap"><i class="ws-logo"></i></div>
      <h1>Bread, pastries, and a little Kentucky warmth.</h1>
      <div class="ws-btns"><span class="ws-btn pri">Explore the menu</span><span class="ws-btn">Plan your visit</span></div>
    </div>
    <div class="ws-photo bg-hero" data-b="photo" role="img" aria-label="Cinnamon rolls, sourdough, cookies, and coffee on a rustic table"></div>
  </section>
  ${special ? `<div class="ws-special"><div class="ws-special-in"><i class="ws-sp-ph bg-cookie"></i><div><small>Saturday special</small><b>Sea salt chocolate chunk cookies</b></div></div></div>` : ""}
  <section class="ws-lower">
    <div class="ws-col" data-b="menu"><h3>Menu</h3><div class="ws-list">${order.map(row).join("")}</div></div>
    <div class="ws-col" data-b="visit"><h3>Visit</h3>
      <div class="ws-card"><small>Hours</small><b>Monday–Saturday, 6 AM–2 PM</b><span>Closed Sunday</span></div>
      <div class="ws-card ws-addr"><div class="ws-map"><div class="ws-map-in">${MAP_SVG}<i class="ws-pin">${PIN_SVG}</i></div></div>
        <div><small>Address</small><b>123 Main Street</b><span>Bardstown, KY</span></div></div>
    </div>
    <div class="ws-col" data-b="contact"><h3>Contact</h3>
      <div class="ws-field">Name</div><div class="ws-field">Email</div><div class="ws-field tall">Message</div>
      <span class="ws-btn pri ws-send">Send</span>
    </div>
  </section>
  <footer class="ws-foot" data-b="foot">Fictional business • Training demonstration</footer>
</div>`;
}

/** Render the homepage into a slot; returns the .ws root. */
function mountSite(slot, opts = {}) {
  slot.innerHTML = siteMarkup(opts);
  const ws = slot.firstElementChild;
  cropEmblem($(".ws-emb", ws), 50);
  placeLogo($(".ws-logo", ws), 290, 0, 0);
  return ws;
}

/** Offset of el inside the .ws root, in unscaled site pixels. */
function siteRect(el, root) {
  let x = 0, y = 0, n = el;
  while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}
