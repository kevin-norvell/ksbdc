/* =====================================================================
   The piece: twelve chapters on one 313-second timeline.
   Times are absolute seconds. Coordinates are stage pixels (1920×1080).
   Every fact on screen comes from NIST CSWP 50 (Nov. 2, 2026); the
   source tag in the top-right corner names the section for each beat.
   ===================================================================== */
const DUR = 313;
const POSTER_T = 10.2;

const CHAPTERS = [
  [0, "Open"],
  [12, "Why it matters"],
  [44, "The three goals"],
  [72, "Know what you have"],
  [100, "The framework"],
  [120, "Govern"],
  [138, "Identify"],
  [156, "Protect"],
  [220, "Spot the phish"],
  [252, "Ransomware"],
  [270, "Detect, respond, recover"],
  [296, "Your next step"],
];

/* Narration. Burned into the video as the caption band; C toggles it in the player. */
const CAPTIONS = [
  [0.9, 5.6, "Running a small business means wearing every hat."],
  [5.6, 11.7, "Today, let’s try on the security hat, with help from NIST’s newest small business guide."],
  [12.5, 18.2, "There are 34.8 million small businesses in the U.S. That’s 99% of all businesses."],
  [18.2, 23.6, "And 81.9% of them have no employees besides the owner."],
  [23.6, 29.6, "Like Sam, who runs Bluegrass Candle Co. from a spare room in Lexington."],
  [29.6, 35.4, "Meet the Bandit. He doesn’t care how small Sam’s shop is."],
  [35.4, 43.7, "One incident can stop sales, wipe out data, bring fines and legal fees, and even hurt your credit."],
  [44.5, 48.5, "Cybersecurity protects three things."],
  [48.5, 54.8, "<em>Confidentiality</em>: keep private data private. What if customer card numbers were stolen?"],
  [54.8, 61.2, "<em>Integrity</em>: keep data accurate. What if a product design changed without you knowing?"],
  [61.2, 67.4, "<em>Availability</em>: keep things running. What if customers couldn’t reach your website?"],
  [67.4, 71.7, "Security pros call this the CIA triad. No spies involved."],
  [72.5, 77.6, "Step one: know what you’re protecting. Sam’s shop is small, but it’s connected."],
  [77.6, 83.6, "Laptop, phone, printer, camera, router, a backup drive, and plenty of cloud accounts."],
  [83.6, 89.4, "Every device is a door. The Bandit tries the router’s factory password,"],
  [89.4, 94.4, "texts Sam a phishing link, and pokes at outdated website software."],
  [94.4, 99.7, "So start a simple inventory: what you have, how sensitive it is, and whether MFA is on."],
  [100.5, 106.0, "NIST’s Cybersecurity Framework 2.0 organizes the work into six functions:"],
  [106.0, 112.4, "Govern, Identify, Protect, Detect, Respond, and Recover."],
  [112.4, 119.7, "Think of it as a cycle, not a checklist. You keep improving as your business grows."],
  [120.5, 126.4, "<em>Govern</em> means setting ground rules. List the legal, regulatory, and contract requirements you must meet."],
  [126.4, 132.4, "Ask whether cyber insurance fits. It can help you recover, but it’s not a strategy by itself."],
  [132.4, 137.7, "And check your vendors. Your cloud and payment providers bring risk too."],
  [138.5, 143.6, "<em>Identify</em>: keep your inventory current, and note the risks to each asset."],
  [143.6, 149.6, "Write an incident response plan before you need it, and keep a printed contact list."],
  [149.6, 155.7, "Retiring an old laptop or phone? Wipe it first."],
  [156.5, 160.6, "<em>Protect</em> is where the Bandit starts having a bad day."],
  [160.6, 166.4, "Use passphrases at least 15 characters long, and a different one for every account."],
  [166.4, 172.4, "A password manager remembers them for you. Even better, use passkeys where you can."],
  [172.4, 178.4, "Turn on multi-factor authentication: something you know, something you have, something you are."],
  [178.4, 184.4, "Now, even with a stolen password, the Bandit gets stuck at the door."],
  [184.4, 190.2, "NIST calls MFA one of the most important steps you can take. Start with email and banking."],
  [190.2, 196.0, "Change default passwords on routers, printers, and cameras. Criminals know the factory ones."],
  [196.0, 202.4, "Stop clicking “remind me tomorrow.” Turn on automatic updates, and check at least monthly."],
  [202.4, 207.6, "Do daily work in a standard account, not an administrator account."],
  [207.6, 213.6, "Back up regularly, and keep at least one copy disconnected from your computer."],
  [213.6, 219.7, "Then test it. A backup only counts if you can actually restore it."],
  [220.5, 226.4, "Phishing is one of the biggest threats: a convincing message that tricks you into clicking."],
  [226.4, 232.4, "Super intelligence tools make fakes look more real than ever. So take a second, or third, look."],
  [232.4, 238.2, "Red flag: pressure to act fast. Stop and think, even if it looks legit."],
  [238.2, 244.0, "Red flag: a “bank” writing from a free email account. Check the sender."],
  [244.0, 251.7, "New routing number? Gift card request? Verify with contact info you already trust, never the message itself."],
  [252.5, 257.6, "Ransomware locks up your files and demands payment to unlock them."],
  [257.6, 263.6, "It can hit cloud accounts too. Your best defense is a secure, isolated, tested backup."],
  [263.6, 269.7, "Add updates, antivirus, and MFA, and keep contacts ready for law enforcement and legal help."],
  [270.5, 276.0, "<em>Detect</em>: run antivirus, and turn on alerts for new logins and bank transactions."],
  [276.0, 281.0, "Lock your screens, and turn on device tracking and remote wipe."],
  [281.0, 285.6, "<em>Respond</em>: follow your plan, write down what happened, and disconnect affected devices."],
  [285.6, 289.6, "Report cybercrime to the FBI at ic3.gov."],
  [289.6, 295.7, "<em>Recover</em>: make sure backups are clean before restoring, then capture lessons learned."],
  [296.5, 301.4, "Cybersecurity isn’t one and done. Start with these five, and keep improving."],
  [301.4, 307.4, "Kentucky SBDC business coaches can help you take the first step. No cost, and confidential."],
];

/* Source tag, top-right. */
const SOURCES = [
  [12.3, 23.6, "NIST CSWP 50 · Introduction, citing SBA Office of Advocacy"],
  [23.6, 35.4, "Example business and characters are fictional"],
  [35.4, 44, "NIST CSWP 50 · §1.4"],
  [44.3, 72, "NIST CSWP 50 · §1.1, Fig. 1"],
  [72.3, 100, "NIST CSWP 50 · §1.3, Fig. 2, Table 1"],
  [100.3, 120, "NIST CSWP 50 · §2, Table 3 · NIST CSF 2.0"],
  [120.3, 138, "NIST CSWP 50 · §3.1, Table 5"],
  [138.3, 156, "NIST CSWP 50 · §3.2, Table 6"],
  [156.3, 172.4, "NIST CSWP 50 · §1.1 · Table 7, PR.AA-03"],
  [172.4, 190.2, "NIST CSWP 50 · §3.3, MFA box, p. 15"],
  [190.2, 196, "NIST CSWP 50 · Table 7, PR.AA-01"],
  [196, 202.4, "NIST CSWP 50 · Table 7, PR.PS-02"],
  [202.4, 207.6, "NIST CSWP 50 · Table 7, PR.AA-05"],
  [207.6, 220, "NIST CSWP 50 · Table 7, PR.DS-11"],
  [220.3, 252, "NIST CSWP 50 · §3.3.1"],
  [252.3, 270, "NIST CSWP 50 · §3.3.2"],
  [270.3, 281, "NIST CSWP 50 · §3.4, Table 8"],
  [281, 289.6, "NIST CSWP 50 · §3.5, Table 9 · FBI IC3"],
  [289.6, 296, "NIST CSWP 50 · §3.6, Table 10"],
  [296.3, 301.4, "NIST CSWP 50 · §1.1, §1.6"],
];

/* ---------- small builders ---------- */
function mk(tag, cls, parent, style = {}) {
  const el = document.createElement(tag);
  el.className = cls;
  Object.assign(el.style, style);
  if (parent) parent.appendChild(el);
  return el;
}
/** HTML string -> element appended to parent, absolutely placed at (x, y). */
function H(parent, html, x, y, style = {}) {
  const d = document.createElement("div");
  d.innerHTML = html.trim();
  const el = d.firstElementChild;
  if (x !== undefined) { el.style.position = "absolute"; el.style.left = x + "px"; el.style.top = y + "px"; }
  Object.assign(el.style, style);
  parent.appendChild(el);
  return el;
}
function S(tl, a, b, dark = false) {
  const s = mk("section", "scene" + (dark ? " dark" : ""), $("#scenes"));
  tl.window(s, a, b);
  return s;
}
const q = (el, s) => el.querySelector(s);
const qa = (el, s) => Array.from(el.querySelectorAll(s));

function inn(tl, el, t, { dy = 26, dx = 0, d = 0.7, s = null, ease = E.glide } = {}) {
  const p = { o: [0, 1], y: [dy, 0] };
  if (dx) p.x = [dx, 0];
  if (s !== null) p.s = [s, 1];
  tl.ft(el, t, d, p, ease);
  return t + d;
}
function popIn(tl, el, t, d = 0.55) {
  tl.ft(el, t, d * 0.5, { o: [0, 1] }, E.out);
  tl.ft(el, t, d, { s: [0.55, 1] }, E.back(1.7));
  return t + d;
}
function out(tl, els, t, d = 0.4, dy = -14) {
  for (const el of [].concat(els)) tl.to(el, t, d, { o: 0, y: dy }, E.in2);
  return t + d;
}
function stagger(tl, els, t, gap, f = inn, opts) {
  els.forEach((el, i) => f(tl, el, t + i * gap, opts));
  return t + (els.length - 1) * gap;
}
function heading(parent, { x, y, w = 1200, eyebrow = "", lines = [], size = 76 }) {
  const el = H(parent, `<div class="hd">${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ""}<div class="title" style="font-size:${size}px">${lines.map(l => `<span class="ln"><span>${l}</span></span>`).join("")}</div></div>`, x, y, { width: w + "px" });
  return { el, eb: q(el, ".eyebrow"), spans: qa(el, ".ln > span") };
}
function showHeading(tl, h, t) {
  if (h.eb) inn(tl, h.eb, t, { dy: 14, d: 0.6 });
  return riseLines(tl, h.spans, t + 0.08, { stag: 0.1, dur: 0.85 });
}
/** text that changes over time: [[t0, t1, text]] types from t0 to t1; holds until the next entry */
function typeSched(tl, el, sched, caret = false) {
  let last = null;
  tl.tick(t => {
    let s = "";
    let typing = false;
    for (const [a, b, str] of sched) {
      if (t < a) break;
      if (t >= b) s = str;
      else { s = str.slice(0, Math.round(((t - a) / (b - a)) * str.length)); typing = true; }
    }
    const blink = caret && (typing || t % 1 < 0.55);
    const k = s + (blink ? "|" : "");
    if (k === last) return;
    last = k;
    el.textContent = s;
    if (caret) { const c = document.createElement("i"); c.className = "caret"; c.style.opacity = blink ? 1 : 0; el.appendChild(c); }
  });
}
/** discrete state (data-state attribute) from a schedule [[t, state], ...] */
function states(tl, el, sched, attr = "state") {
  let last;
  tl.tick(t => {
    let s = "";
    for (const [a, v] of sched) if (t >= a) s = v;
    if (s !== last) { el.dataset[attr] = s; last = s; }
  });
}
function counter(tl, el, t0, d, to, fmt) {
  tl.fn(t0, d, p => { el.textContent = fmt(to * p); }, E.soft);
}
function drawPath(tl, path, t0, d, ease = E.io) {
  const len = path.getTotalLength ? path.getTotalLength() : 1000;
  path.style.strokeDasharray = `${len} ${len}`;
  tl.init(path, { dash: len, so: 0 });
  tl.set(path, t0, { so: 1 });
  tl.ft(path, t0, d, { dash: [len, 0] }, ease);
}
function ripple(tl, parent, x, y, t, color = "var(--navy)") {
  const r = mk("i", "abs", parent, { left: x - 40 + "px", top: y - 40 + "px", width: "80px", height: "80px", borderRadius: "50%", border: `4px solid ${color}`, display: "block" });
  tl.init(r, { o: 0 });
  tl.ft(r, t, 0.05, { o: [0, 0.9] }, E.lin);
  tl.to(r, t + 0.05, 0.6, { o: 0 }, E.out);
  tl.ft(r, t, 0.65, { s: [0.3, 1.8] }, E.out);
}
function press(tl, el, t) {
  tl.to(el, t, 0.08, { s: 0.93 }, E.out).to(el, t + 0.08, 0.25, { s: 1 }, E.out);
}
function card(parent, { icon, h, p = "", ref = "", red = false, x, y, w = 520, col = false }) {
  const el = H(parent, `<div class="card" style="${col ? "flex-direction:column;gap:20px" : ""}"><div class="c-ico ${red ? "red" : ""}">${ico(icon)}</div><div><div class="c-h">${h}</div>${p ? `<div class="c-p">${p}</div>` : ""}${ref ? `<div class="c-ref">${ref}</div>` : ""}</div></div>`, x, y, { width: w + "px" });
  return el;
}
function chip(parent, html, x, y, cls = "") { return H(parent, `<div class="chip ${cls}">${html}</div>`, x, y); }
function fnHead(parent, { icon, k, t, d }) {
  return H(parent, `<div class="fnhead"><div class="fh-ico">${ico(icon)}</div><div><div class="fh-k">${k}</div><div class="fh-t">${t}</div><div class="fh-d">${d}</div></div></div>`);
}
const FN = ["Govern", "Identify", "Protect", "Detect", "Respond", "Recover"];
/** six-step tracker shown in the function chapters */
function fnTrack(parent, on, x = 1180, y = 196) {
  const el = H(parent, `<div style="display:flex;gap:10px">${FN.map((n, i) => `<div style="padding:10px 16px;border-radius:12px;font-size:22px;font-weight:700;${on.includes(i) ? "background:var(--navy);color:#fff" : "background:var(--g1);color:#8A93A8"}">${n}</div>`).join("")}</div>`, x, y);
  return el;
}
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* =====================================================================
   Shared layers: background drift, brand bug, source tag, captions, wipe
   ===================================================================== */
function chrome(tl) {
  const g1 = $(".g1"), g2 = $(".g2"), dots = $(".dots");
  tl.tick(t => {
    g1.style.transform = `translate(${r2(Math.sin(t * 0.07) * 160)}px, ${r2(Math.cos(t * 0.05) * 90)}px)`;
    g2.style.transform = `translate(${r2(Math.cos(t * 0.06) * -170)}px, ${r2(Math.sin(t * 0.045) * 100)}px)`;
    dots.style.transform = `translate(${r2((t * 6) % 40)}px, ${r2((t * 3) % 40)}px)`;
  });

  const bug = $("#bug");
  const DARK = [[0, 12], [100, 120], [252, 270], [296, 999]];
  let bd;
  tl.tick(t => {
    const d = DARK.some(([a, b]) => t >= a - 0.1 && t < b - 0.1);
    if (d !== bd) { bug.classList.toggle("on-dark", d); bd = d; }
  });
  tl.init(bug, { o: 0 });
  tl.to(bug, 12.4, 0.6, { o: 1 }, E.out);
  tl.to(bug, 295.6, 0.3, { o: 0 }, E.out);

  const src = $("#src"), sv = q(src, ".src-v");
  let cur = -2;
  tl.tick(t => {
    let k = -1;
    for (let i = 0; i < SOURCES.length; i++) if (t >= SOURCES[i][0] && t < SOURCES[i][1]) { k = i; break; }
    if (k === cur) return;
    cur = k;
    src.style.display = k < 0 ? "none" : "";
    if (k >= 0) sv.textContent = SOURCES[k][2];
  });

  const span = $("#cc span");
  let cc = -2;
  tl.tick(t => {
    let k = -1;
    for (let i = 0; i < CAPTIONS.length; i++) if (t >= CAPTIONS[i][0] && t < CAPTIONS[i][1]) { k = i; break; }
    if (k !== cc) { cc = k; span.innerHTML = k < 0 ? "" : CAPTIONS[k][2]; }
  });

  const wipe = $("#wipe"), wn = q(wipe, ".wipe-n"), wt = q(wipe, ".wipe-t");
  tl.init(wipe, { x: 2400 });
  CHAPTERS.slice(1).forEach(([b]) => {
    tl.ft(wipe, b - 0.5, 0.5, { x: [2400, 0] }, E.io);
    tl.ft(wipe, b + 0.22, 0.55, { x: [0, -2560] }, E.io);
  });
  let wl = -1;
  tl.tick(t => {
    let k = 1;
    CHAPTERS.forEach(([b], i) => { if (i > 0 && t >= b - 1.2) k = i; });
    if (k === wl) return;
    wl = k;
    wn.textContent = String(k + 1).padStart(2, "0");
    wt.textContent = CHAPTERS[k][1];
  });
}

/* =====================================================================
   1 · Open (0–12): every hat, then the security hat. Title card.
   ===================================================================== */
function scene1(tl) {
  const s = S(tl, 0, 12, true);
  const hat = H(s, `<div style="width:300px;height:300px;color:#fff;font-size:300px">${ico("hat")}</div>`, 810, 250);
  const shield = H(s, `<div style="width:120px;height:120px;color:var(--red);font-size:120px">${ico("shieldok")}</div>`, 900, 352);
  const label = H(s, `<div style="width:1000px;text-align:center;font-size:72px;font-weight:700;color:#fff"></div>`, 460, 600);
  const sub = H(s, `<div style="width:1000px;text-align:center;font-size:30px;font-weight:700;letter-spacing:.16em;color:var(--lnavy);text-transform:uppercase">Today’s hat</div>`, 460, 560);
  tl.init(shield, { o: 0 });
  popIn(tl, hat, 0.4, 0.8);
  inn(tl, sub, 0.8);
  const hats = [[1.0, "Owner"], [1.8, "Bookkeeper"], [2.6, "Marketer"], [3.4, "Customer service"], [4.3, "Security guard"]];
  let last;
  tl.tick(t => {
    let k = -1;
    hats.forEach(([a], i) => { if (t >= a) k = i; });
    if (k === last) return;
    last = k;
    label.textContent = k < 0 ? "" : hats[k][1];
    label.style.color = k === hats.length - 1 ? "#FF8A98" : "#fff";
  });
  hats.forEach(([a]) => tl.ft(label, a, 0.35, { y: [18, 0], o: [0.2, 1] }, E.out));
  tl.ft(hat, 4.3, 0.2, { r: [0, -8] }, E.out).to(hat, 4.5, 0.5, { r: 0 }, E.back(2));
  popIn(tl, shield, 4.4, 0.6);
  out(tl, [hat, shield, label, sub], 5.4, 0.45);

  // title card
  const lk = H(s, `<div class="lockup on-dark brand-lockup"></div>`, 0, 150, { width: "1920px", justifyContent: "center" });
  const big = H(s, `<div style="width:1920px;text-align:center;font-size:150px;font-weight:700;line-height:1;color:#fff"><span class="ln"><span>Lock It Down</span></span></div>`, 0, 330);
  const st = H(s, `<div style="width:1920px;text-align:center;font-size:52px;color:#fff"><span class="ln"><span>Cybersecurity basics for small business owners</span></span></div>`, 0, 500);
  const rule = H(s, `<i style="display:block;width:160px;height:6px;border-radius:3px;background:var(--red)"></i>`, 880, 600);
  const basis = H(s, `<div style="width:1920px;text-align:center;font-size:28px;line-height:1.45;color:var(--lnavy)">Based on NIST Cybersecurity White Paper 50<br><i style="font-style:italic">Small Business Cybersecurity: Non-Employer Firms</i> (Nov. 2026)</div>`, 0, 640);
  const sh = H(s, `<div style="width:90px;height:90px;color:#fff;font-size:90px;opacity:.95">${ico("shield")}</div>`, 915, 800);
  inn(tl, lk, 5.9, { dy: 20 });
  riseLines(tl, [q(big, ".ln>span")], 6.1, { dur: 1.0 });
  riseLines(tl, [q(st, ".ln>span")], 6.5, { dur: 0.9 });
  tl.ft(rule, 7.0, 0.7, { sx: [0, 1], o: [0, 1] }, E.glide);
  inn(tl, basis, 7.3);
  popIn(tl, sh, 7.8);
  tl.ft(s, 11.3, 0.7, { s: [1, 1.04] }, E.in2);
}

/* =====================================================================
   2 · Why it matters (12–44)
   ===================================================================== */
function scene2(tl) {
  const s = S(tl, 12, 44);
  const hd = heading(s, { x: 120, y: 150, eyebrow: "Why it matters", lines: ["Small business is most business"], size: 64 });
  showHeading(tl, hd, 12.4);
  const stats = [
    ["0", "small businesses<br>in the United States", 120, 12.8, v => (v / 10).toFixed(1) + "M", 348],
    ["0%", "of all U.S.<br>businesses", 720, 15.5, v => Math.round(v) + "%", 99],
    ["0%", "have no employees<br>besides the owner", 1240, 18.3, v => (v / 10).toFixed(1) + "%", 819],
  ];
  const els = stats.map(([n, l, x, t, fmt, to]) => {
    const el = H(s, `<div class="stat"><div class="st-n">${n}</div><div class="st-l">${l}</div></div>`, x, 310);
    inn(tl, el, t, { dy: 30 });
    counter(tl, q(el, ".st-n"), t, 1.5, to, fmt);
    return el;
  });
  tl.set(q(els[2], ".st-n"), 18.3, {});
  q(els[2], ".st-n").classList.add("r");
  // 8 of 10 people
  const ppl = H(s, `<div style="display:flex;gap:30px;align-items:flex-end">${Array.from({ length: 10 }, (_, i) => `<div class="pp" style="width:92px;height:92px;font-size:92px;color:${i < 8 ? "var(--navy)" : "#C3CAD8"}">${ico("person")}</div>`).join("")}</div>`, 120, 620);
  const pl = H(s, `<div style="font-size:30px;color:#4A5268;width:460px;line-height:1.3">About 8 in 10 are one-person shops: sole proprietors, freelancers, gig workers.</div>`, 1340, 616);
  stagger(tl, qa(ppl, ".pp"), 19.0, 0.09, popIn);
  inn(tl, pl, 20.0);
  out(tl, [hd.el, ...els, ppl, pl], 23.2);

  // Sam's shop
  const shop = H(s, `<div class="shop"><div class="sh-top"><div class="sh-ico">${ico("candle")}</div><div><div class="sh-n">Bluegrass Candle Co.</div><div class="sh-s">Sam, owner and only employee<br>Lexington, Kentucky</div></div></div><div class="sh-f">Fictional example</div></div>`, 220, 330);
  const gear = H(s, `<div style="display:flex;gap:22px">${["laptop", "phone", "card", "cloud"].map(n => `<div class="gg" style="display:grid;place-items:center;width:96px;height:96px;border-radius:24px;background:#fff;box-shadow:0 0 0 1.5px var(--g2);color:var(--navy);font-size:54px">${ico(n)}</div>`).join("")}</div>`, 250, 640);
  inn(tl, shop, 23.9, { dy: 40 });
  stagger(tl, qa(gear, ".gg"), 25.0, 0.12, popIn);

  // the Bandit arrives
  const b = bandit(tl, s, { x: 1380, y: 270, s: 1.15, moods: [[0, "smirk"], [36, "grin"]], look: [[0, -4, 0]] });
  tl.ft(b, 29.7, 1.1, { x: [700, 0] }, E.glide);
  tl.ft(b, 29.7, 0.2, { o: [0, 1] }, E.lin);
  bob(tl, b, 30.8, 44, 5, 1.2);
  const bub = H(s, `<div style="padding:18px 26px;border-radius:22px;background:var(--navy);color:#fff;font-size:34px;font-weight:700;white-space:nowrap">Small? Even better.</div>`, 1240, 180);
  tl.init(bub, { o: 0 });
  popIn(tl, bub, 31.6);
  out(tl, bub, 35.0, 0.3);

  // impacts
  const imp = [
    ["chartdn", "Can’t operate", 860, 210], ["trash", "Lost data", 860, 300], ["gavel", "Fines & penalties", 860, 390],
    ["scales", "Legal fees", 860, 480], ["dollar", "Lost income", 860, 570], ["warn", "Damaged reputation", 860, 660],
    ["bank", "Hurt credit & loans", 860, 750],
  ].map(([i, l, x, y]) => {
    const c = chip(s, `${ico(i)}${l}`, x, y, "red");
    tl.init(c, { o: 0 });
    return c;
  });
  stagger(tl, imp, 35.7, 0.42, (tl2, el, t) => inn(tl2, el, t, { dx: -40, dy: 0, d: 0.5 }));
  tl.ft(shop, 35.6, 0.08, { r: [0, -2.5] }, E.lin).to(shop, 35.68, 0.08, { r: 2 }, E.lin).to(shop, 35.76, 0.1, { r: -1 }, E.lin).to(shop, 35.86, 0.2, { r: 0 }, E.out);
}

/* =====================================================================
   3 · The three goals (44–72): the CIA triad
   ===================================================================== */
function scene3(tl) {
  const s = S(tl, 44, 72);
  const hd = heading(s, { x: 120, y: 150, w: 600, eyebrow: "The three goals", lines: ["What security", "protects"], size: 64 });
  showHeading(tl, hd, 44.4);
  const A = [960, 200], B = [740, 580], C = [1180, 580];
  const tri = H(s, `<svg width="1920" height="1080" style="position:absolute;left:0;top:0;overflow:visible">
    <path class="tf" d="M${A} L${C} L${B}Z" fill="var(--navy)"/>
    <path class="to" d="M${A} L${C} L${B}Z" fill="none" stroke="var(--navy)" stroke-width="8" stroke-linejoin="round"/>
    <path class="sd sd-a" d="M${B} L${A}" stroke="var(--red)" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path class="sd sd-i" d="M${A} L${C}" stroke="var(--red)" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path class="sd sd-c" d="M${C} L${B}" stroke="var(--red)" stroke-width="12" stroke-linecap="round" fill="none"/>
  </svg>`, 0, 0);
  const tf = q(tri, ".tf"), to = q(tri, ".to");
  tl.init(tf, { o: 0 });
  drawPath(tl, to, 44.6, 1.2);
  tl.ft(tf, 45.4, 0.6, { o: [0, 1] }, E.out);
  const mid = H(s, `<div style="width:300px;text-align:center;color:#fff;font-size:30px;font-weight:700;line-height:1.1;letter-spacing:.06em;text-transform:uppercase">Information<br>security</div>`, 810, 440);
  inn(tl, mid, 45.8);
  const lab = (txt, x, y, r) => H(s, `<div style="font-size:44px;font-weight:700;color:var(--navy);transform-origin:center;rotate:${r}deg;white-space:nowrap">${txt}</div>`, x, y);
  const lC = lab("Confidentiality", 830, 600, 0), lI = lab("Integrity", 1100, 345, 60), lA = lab("Availability", 685, 345, -60);
  [lC, lI, lA].forEach(l => tl.init(l, { o: 0 }));
  const cC = card(s, { icon: "card", red: true, h: "Keep private data private", p: "What if customer card numbers were stolen?", x: 700, y: 680, w: 520 });
  const cI = card(s, { icon: "doc", red: true, h: "Keep data accurate", p: "What if a product design changed without you knowing?", x: 1300, y: 300, w: 500 });
  const cA = card(s, { icon: "globe", red: true, h: "Keep things running", p: "What if customers couldn’t reach your website?", x: 120, y: 470, w: 500 });
  const sides = [[".sd-c", lC, cC, 48.6], [".sd-i", lI, cI, 54.9], [".sd-a", lA, cA, 61.3]];
  sides.forEach(([sel, l, c, t], i) => {
    const sd = q(tri, sel);
    tl.init(sd, { o: 0 });
    tl.set(sd, t, { o: 1 });
    drawPath(tl, sd, t, 0.7);
    if (i < 2) tl.to(sd, sides[i + 1][3], 0.4, { o: 0 }, E.out);
    inn(tl, l, t + 0.1, { dy: 10 });
    inn(tl, c, t + 0.35, { dy: 30 });
  });
  // the CIA joke
  const cia = H(s, `<div style="display:flex;gap:14px;align-items:center"><div class="chip navy" style="font-size:34px;height:66px;padding:0 30px;letter-spacing:.2em">C · I · A</div><div class="chip red" style="rotate:-4deg">No spies involved</div></div>`, 1300, 690);
  tl.init(cia, { o: 0 });
  popIn(tl, cia, 67.6);
  ["sd-a", "sd-i", "sd-c"].forEach(c => tl.to(q(tri, "." + c), 67.6, 0.5, { o: 1 }, E.out));
}

/* =====================================================================
   4 · Know what you have (72–100): Sam's connected shop
   ===================================================================== */
function scene4(tl) {
  const s = S(tl, 72, 100);
  const hd = heading(s, { x: 120, y: 150, w: 1400, eyebrow: "Step one", lines: ["Know what you’re protecting"], size: 64 });
  showHeading(tl, hd, 72.4);
  const net = mk("div", "abs", s, { left: "0", top: "0", width: "1920px", height: "1080px" });
  const R = [820, 560];
  const devs = [
    ["laptop", "Laptop", 230, 400], ["phone", "Phone", 230, 640], ["printer", "Printer", 470, 330],
    ["camera", "Camera", 470, 560], ["drive", "Backup drive", 470, 790],
  ];
  const cloudC = [1390, 560];
  const svc = [["globe", "Website", 1260, 430], ["bank", "Banking", 1520, 430], ["mail", "Email", 1260, 690], ["cloud", "Cloud apps", 1520, 690]];
  const lines = H(net, `<svg width="1920" height="1080" style="position:absolute;left:0;top:0">
    ${devs.map(([, , x, y], i) => `<path class="lk" d="M${x} ${y} L${R[0]} ${R[1]}" stroke="#AEB8CC" stroke-width="4" ${i === 4 ? "" : 'stroke-dasharray="3 12"'} stroke-linecap="round" fill="none"/>`).join("")}
    <path class="lk" d="M${R[0]} ${R[1]} L${cloudC[0] - 250} ${R[1]}" stroke="#AEB8CC" stroke-width="4" fill="none"/>
    <circle class="inet" cx="${cloudC[0]}" cy="${cloudC[1]}" r="250" fill="#fff" stroke="var(--g2)" stroke-width="3"/>
  </svg>`, 0, 0);
  const inetLabel = H(net, `<div style="width:500px;text-align:center;font-size:24px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)">The internet</div>`, cloudC[0] - 250, 340);
  const node = (icon, label, x, y, big = false) => {
    const sz = big ? 150 : 112;
    const el = H(net, `<div style="width:${sz}px"><div style="display:grid;place-items:center;width:${sz}px;height:${sz}px;border-radius:50%;background:${big ? "var(--navy)" : "#fff"};color:${big ? "#fff" : "var(--navy)"};box-shadow:0 0 0 3px ${big ? "var(--navy)" : "var(--g2)"};font-size:${big ? 80 : 58}px">${ico(icon)}</div><div style="position:absolute;left:50%;top:${sz + 8}px;translate:-50% 0;white-space:nowrap;font-size:24px;font-weight:700;color:var(--navy)">${label}</div></div>`, x - sz / 2, y - sz / 2);
    tl.init(el, { o: 0 });
    return el;
  };
  const dn = devs.map(([i, l, x, y]) => node(i, l, x, y));
  const rn = node("router", "Router", R[0], R[1], true);
  const sn = svc.map(([i, l, x, y]) => node(i, l, x, y));
  qa(lines, ".lk").forEach(p => drawPath(tl, p, 77.4, 1.4));
  const inet = q(lines, ".inet");
  tl.init(inet, { o: 0 });
  tl.ft(inet, 77.4, 0.6, { o: [0, 1] }, E.out);
  inn(tl, inetLabel, 78.0);
  popIn(tl, rn, 77.0);
  stagger(tl, dn, 77.7, 0.3, popIn);
  stagger(tl, sn, 80.0, 0.25, popIn);

  // the Bandit probes
  const b = bandit(tl, net, { x: 900, y: 470, s: 0.6, moods: [[0, "smirk"], [93, "grin"]], look: [[0, -3, -6], [89.4, -8, 0], [91.6, 8, -4]] });
  tl.init(b, { o: 0, s: 0.6 });
  tl.ft(b, 83.7, 0.6, { y: [180, 0], o: [0, 1] }, E.glide);
  const f1 = H(net, `<div class="flag">${ico("key")}Factory password: admin</div>`, 690, 380);
  const f2 = H(net, `<div class="flag">${ico("hook")}Text: “Tap here!”</div>`, 50, 500);
  const f3 = H(net, `<div class="flag">${ico("warn")}Outdated website software</div>`, 1150, 246);
  [f1, f2, f3].forEach(f => tl.init(f, { o: 0 }));
  popIn(tl, f1, 85.4);
  ripple(tl, net, R[0], R[1], 85.3, "var(--red)");
  popIn(tl, f2, 89.7);
  ripple(tl, net, 230, 640, 89.6, "var(--red)");
  popIn(tl, f3, 91.7);
  ripple(tl, net, 1260, 430, 91.6, "var(--red)");
  tl.to(net, 94.2, 0.5, { o: 0, s: 0.96 }, E.in2);

  // inventory table
  const rows = [
    ["Laptop", "Home office", "High", "Significant", "Yes", "Yes"],
    ["Router", "Home office", "Medium", "Significant", "Not yet", "n/a"],
    ["Website host", "Cloud", "Medium", "Moderate", "Yes", "Not yet"],
    ["Bank account", "Cloud", "High", "Significant", "Yes", "Yes"],
  ];
  const cols = ["Asset", "Location", "Sensitivity", "Impact if hit", "Unique password?", "MFA on?"];
  const w = [300, 260, 220, 250, 260, 200];
  const tbl = H(s, `<div class="win" style="width:1530px"><div class="w-bar"><i></i><i></i><i></i><b>Bluegrass Candle Co. · asset inventory</b></div>
    <div style="display:grid;grid-template-columns:${w.map(v => v + "px").join(" ")};padding:10px 24px 22px">
      ${cols.map(c => `<div style="padding:16px 12px;font-size:22px;font-weight:700;letter-spacing:.04em;color:#fff;background:var(--navy)">${c}</div>`).join("")}
      ${rows.map((r, i) => r.map((c, j) => `<div class="cell r${i}" style="padding:16px 12px;font-size:28px;border-bottom:1.5px solid var(--g2);color:${c === "Not yet" ? "var(--red)" : j === 0 ? "var(--navy)" : "var(--ink)"};font-weight:${j === 0 || c === "Not yet" ? 700 : 400}">${c}</div>`).join("")).join("")}
    </div></div>`, 195, 310);
  tl.init(tbl, { o: 0 });
  inn(tl, tbl, 94.6, { dy: 40 });
  rows.forEach((_, i) => qa(tbl, ".r" + i).forEach((c, j) => inn(tl, c, 95.3 + i * 0.55 + j * 0.06, { dy: 10, d: 0.4 })));
}

/* =====================================================================
   5 · The framework (100–120): CSF 2.0's six functions
   ===================================================================== */
function scene5(tl) {
  const s = S(tl, 100, 120, true);
  const hd = heading(s, { x: 120, y: 330, w: 640, eyebrow: "NIST Cybersecurity Framework 2.0", lines: ["Six functions,", "one cycle"], size: 84 });
  showHeading(tl, hd, 100.5);
  const C = [1240, 520], RAD = 270;
  const ring = H(s, `<svg width="1920" height="1080" style="position:absolute;left:0;top:0;overflow:visible">
    <circle class="rg" cx="${C[0]}" cy="${C[1]}" r="${RAD}" fill="none" stroke="rgba(160,176,208,.55)" stroke-width="5"/>
    <g class="arrows" style="transform-origin:${C[0]}px ${C[1]}px">${[0, 72, 144, 216, 288].map(a => `<path d="M${C[0] + RAD} ${C[1] - 22} l14 22 l14 -22" transform="rotate(${a + 36} ${C[0]} ${C[1]})" fill="none" stroke="#FF8A98" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}</g>
  </svg>`, 0, 0);
  drawPath(tl, q(ring, ".rg"), 101.4, 1.6);
  const arrows = q(ring, ".arrows");
  tl.init(arrows, { o: 0 });
  tl.ft(arrows, 112.5, 0.6, { o: [0, 1] }, E.out);
  tl.tick(t => { arrows.style.rotate = `${r2(Math.max(0, t - 112.5) * 14)}deg`; });
  const icons = ["scales", "search", "shield", "eye", "siren", "restore"];
  const nodes = FN.map((n, i) => {
    const big = i === 0;
    const a = ((i - 1) * 72 - 90) * Math.PI / 180;
    const x = big ? C[0] : C[0] + RAD * Math.cos(a), y = big ? C[1] : C[1] + RAD * Math.sin(a);
    const sz = big ? 200 : 150;
    const el = H(s, `<div style="width:${sz}px;height:${sz}px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:${big ? "var(--red)" : "#fff"};color:${big ? "#fff" : "var(--navy)"};box-shadow:0 0 0 6px rgba(255,255,255,.12)"><div style="font-size:${big ? 66 : 52}px">${ico(icons[i])}</div><div style="font-size:${big ? 30 : 24}px;font-weight:700">${n}</div></div>`, x - sz / 2, y - sz / 2);
    tl.init(el, { o: 0 });
    popIn(tl, el, 106.0 + i * 1.0, 0.6);
    return el;
  });
  const note = H(s, `<div style="width:600px;font-size:32px;line-height:1.35;color:var(--lnavy)">Govern sits at the center: it shapes how you handle the other five.</div>`, 120, 620);
  inn(tl, note, 107.0);
  out(tl, note, 112.0, 0.35);
  const chips = H(s, `<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start"><div class="chip ghost">${ico("x")}Not a one-time checklist</div><div class="chip red">${ico("cycle")}Revisit as your business grows</div></div>`, 120, 620);
  tl.init(chips, { o: 0 });
  inn(tl, chips, 112.8);
  void nodes;
}

/* =====================================================================
   6 · Govern (120–138)
   ===================================================================== */
function functionScene(tl, a, b, { icon, k, t: title, d, idx, cards, extras }) {
  const s = S(tl, a, b);
  const fh = fnHead(s, { icon, k, t: title, d });
  const tr = fnTrack(s, [idx]);
  inn(tl, fh, a + 0.4, { dx: -40, dy: 0 });
  inn(tl, tr, a + 0.8, { dy: 12 });
  const els = cards.map(([c, t0], i) => {
    const el = card(s, { ...c, x: 120 + i * 570, y: 390, w: 530, col: true });
    el.style.minHeight = "420px";
    tl.init(el, { o: 0 });
    inn(tl, el, t0, { dy: 40 });
    return el;
  });
  if (extras) extras(s, els);
  return s;
}

function scene6(tl) {
  functionScene(tl, 120, 138, {
    icon: "scales", k: "Function 1 of 6", t: "Govern", d: "Set your strategy, expectations, and policy", idx: 0,
    cards: [
      [{ icon: "scales", h: "Know your requirements", p: "Legal, regulatory, and contract rules that apply to you.", ref: "GV.OC-03" }, 121.4],
      [{ icon: "umbrella", h: "Consider cyber insurance", p: "Helps you recover. Doesn’t replace a security plan.", ref: "GV.RM" }, 126.5],
      [{ icon: "link", h: "Check your vendors", p: "Cloud, payment, and IT providers bring risk too.", ref: "GV.SC" }, 132.5],
    ],
    extras(s, els) {
      const ex = [
        [els[0], ["HIPAA", "PCI DSS", "Contracts"], 123.0],
        [els[1], ["Exclusions", "Coverage limits", "Required controls"], 128.6],
        [els[2], ["Cloud storage", "Payments", "Managed IT"], 134.2],
      ];
      ex.forEach(([el, list, t0]) => {
        const row = H(el, `<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:6px">${list.map(l => `<div class="chip" style="height:44px;font-size:22px;padding:0 16px">${l}</div>`).join("")}</div>`);
        stagger(tl, Array.from(row.children), t0, 0.15, popIn);
      });
    },
  });
}

/* =====================================================================
   7 · Identify (138–156)
   ===================================================================== */
function scene7(tl) {
  functionScene(tl, 138, 156, {
    icon: "search", k: "Function 2 of 6", t: "Identify", d: "Understand your current cybersecurity risk", idx: 1,
    cards: [
      [{ icon: "clip", h: "Inventory and risks", p: "Hardware, software, data, and services, plus the risks to each.", ref: "ID.AM · ID.RA" }, 139.4],
      [{ icon: "plan", h: "Incident response plan", p: "Write it before you need it. Keep a printed copy of contacts.", ref: "ID.IM-04" }, 143.8],
      [{ icon: "trash", h: "Wipe before you retire", p: "Erase old laptops, phones, and drives. Close unused accounts.", ref: "ID.AM-08" }, 149.8],
    ],
    extras(s, els) {
      const list = H(els[1], `<div style="margin-top:4px;padding:14px 18px;border-radius:12px;background:var(--g1);font-size:22px;line-height:1.55;color:var(--ink)">${["Bank", "Attorney", "IT help", "Insurance agent", "Law enforcement"].map(l => `<div class="li">☐ ${l}</div>`).join("")}</div>`);
      tl.init(list, { o: 0 });
      inn(tl, list, 145.2, { dy: 10 });
      stagger(tl, qa(list, ".li"), 145.5, 0.25, (t2, el, t) => inn(t2, el, t, { dy: 6, d: 0.35 }));
      const wipeBox = H(els[2], `<div style="margin-top:8px"><div style="display:flex;justify-content:space-between;font-size:22px;color:var(--muted);margin-bottom:8px"><span>Erasing old laptop…</span><span class="pct">0%</span></div><div class="meter"><i style="background:var(--navy);transform:scaleX(0)"></i></div></div>`);
      const bar = q(wipeBox, ".meter i"), pct = q(wipeBox, ".pct");
      tl.init(wipeBox, { o: 0 });
      inn(tl, wipeBox, 151.2, { dy: 10 });
      tl.fn(151.6, 2.6, p => { bar.style.transform = `scaleX(${r4(p)})`; pct.textContent = Math.round(p * 100) + "%"; }, E.io);
    },
  });
}

/* =====================================================================
   8 · Protect (156–220)
   ===================================================================== */
function scene8(tl) {
  const s = S(tl, 156, 220);
  const fh = fnHead(s, { icon: "shield", k: "Function 3 of 6", t: "Protect", d: "Use safeguards to prevent or reduce risk" });
  const tr = fnTrack(s, [2]);
  inn(tl, fh, 156.4, { dx: -40, dy: 0 });
  inn(tl, tr, 156.8, { dy: 12 });

  const b = bandit(tl, s, {
    x: 1450, y: 400, s: 1.0,
    moods: [[0, "smirk"], [164.6, "shock"], [166.4, "sad"], [178.6, "grin"], [181.3, "shock"], [182.2, "sad"], [184.4, "smirk"]],
    look: [[0, -8, 0], [181.3, -10, 4]],
  });
  tl.init(b, { o: 0 });
  tl.ft(b, 156.9, 0.8, { x: [500, 0], o: [0, 1] }, E.glide);
  bob(tl, b, 157.7, 184, 4, 1.1);
  tl.to(b, 172.0, 0.4, { o: 0 }, E.in2);

  // --- passwords (160.6–172.4)
  const pw = H(s, `<div style="width:1080px"><div style="font-size:24px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:12px">New password</div><div class="field"><span class="tx"></span></div>
    <div style="display:flex;align-items:center;gap:20px;margin-top:20px"><div class="meter" style="flex:1"><i class="m1" style="background:var(--red)"></i></div><div class="ml" style="width:420px;font-size:28px;font-weight:700"></div></div></div>`, 160, 390);
  tl.init(pw, { o: 0 });
  inn(tl, pw, 160.7);
  typeSched(tl, q(pw, ".tx"), [[161.0, 161.7, "Fluffy1!"], [163.0, 163.0, ""], [163.2, 164.5, "porch-swing-bourbon-sunset"]], true);
  const m1 = q(pw, ".m1"), ml = q(pw, ".ml");
  tl.tick(t => {
    const strong = t >= 164.5, weak = t >= 161.7 && t < 163.0;
    const v = strong ? 1 : weak ? 0.22 : t >= 163 && t < 164.5 ? (t - 163.2) / 1.3 : 0;
    m1.style.transform = `scaleX(${r4(clamp(v))})`;
    m1.style.background = t >= 163 ? "var(--navy)" : "var(--red)";
    const txt = strong ? "Strong: 26 characters" : weak ? "Weak: short and guessable" : "";
    if (ml.textContent !== txt) { ml.textContent = txt; ml.style.color = strong ? "var(--navy)" : "var(--red)"; }
  });
  const len = chip(s, `${ico("check")}15+ characters`, 160, 640, "red");
  const uni = chip(s, `${ico("check")}Unique for every account`, 470, 640, "navy");
  [len, uni].forEach(c => tl.init(c, { o: 0 }));
  popIn(tl, len, 164.7);
  popIn(tl, uni, 165.2);
  const pm = card(s, { icon: "vault", h: "Password manager", p: "Creates and remembers strong passwords.", x: 160, y: 470, w: 520 });
  const pk = card(s, { icon: "passkey", h: "Passkeys", p: "Sign in without a password at all.", x: 720, y: 470, w: 520 });
  [pm, pk].forEach(c => tl.init(c, { o: 0 }));
  tl.to(pw, 166.2, 0.4, { o: 0, y: -20 }, E.in2);
  tl.to(len, 166.2, 0.6, { y: 110 }, E.glide);
  tl.to(uni, 166.2, 0.6, { y: 110 }, E.glide);
  out(tl, [len, uni], 171.8);
  inn(tl, pm, 166.6, { dy: 30 });
  inn(tl, pk, 168.6, { dy: 30 });
  out(tl, [pm, pk], 171.9);

  // --- MFA factors (172.4–178.4)
  const f = [
    ["key", "Something you know", "Password or PIN", 172.7],
    ["phone", "Something you have", "Phone or security key", 174.4],
    ["finger", "Something you are", "Fingerprint or face", 176.1],
  ].map(([i, h, p, t], k) => {
    const el = card(s, { icon: i, h, p, x: 120 + k * 570, y: 440, w: 530, col: true });
    tl.init(el, { o: 0 });
    inn(tl, el, t, { dy: 40 });
    return el;
  });
  const mfaT = H(s, `<div style="font-size:40px;font-weight:700;color:var(--navy)">Multi-factor authentication (MFA): <span class="r">two or more</span> of these</div>`, 120, 360);
  tl.init(mfaT, { o: 0 });
  inn(tl, mfaT, 172.5);
  out(tl, [...f, mfaT], 178.1);

  // --- the Bandit at the door (178.4–184.4)
  const login = H(s, `<div class="win" style="width:700px"><div class="w-bar"><i></i><i></i><i></i><b>Sign in · Email</b></div><div style="padding:30px 36px">
      <div style="font-size:22px;color:var(--muted)">Email</div><div class="field" style="height:70px;font-size:30px;margin:8px 0 18px">sam@bluegrasscandle.example</div>
      <div style="font-size:22px;color:var(--muted)">Password</div><div class="field" style="height:70px;font-size:30px;margin-top:8px">••••••••••••••••••</div>
      <div class="st" style="margin-top:22px;height:64px;border-radius:14px;display:grid;place-items:center;font-size:28px;font-weight:700"></div></div></div>`, 160, 340);
  const st = q(login, ".st");
  tl.init(login, { o: 0 });
  inn(tl, login, 178.5, { dy: 30 });
  tl.tick(t => {
    const m = t < 179.4 ? 0 : t < 181.2 ? 1 : 2;
    if (st.dataset.m === String(m)) return;
    st.dataset.m = m;
    st.textContent = ["", "Waiting for approval on your phone…", "Access denied"][m];
    st.style.background = ["transparent", "var(--g1)", "var(--red)"][m];
    st.style.color = ["", "var(--navy)", "#fff"][m];
  });
  const b2 = bandit(tl, s, { x: 880, y: 470, s: 0.85, moods: [[0, "grin"], [181.3, "shock"], [182.0, "sad"]], look: [[0, -10, 2], [181.2, -12, 8]] });
  tl.init(b2, { o: 0, s: 0.85 });
  tl.ft(b2, 178.7, 0.6, { y: [60, 0], o: [0, 1] }, E.glide);
  const note = H(s, `<div style="padding:12px 18px;background:#FFF3B0;color:#5A4A00;font-size:24px;font-weight:700;rotate:-6deg;box-shadow:0 10px 20px -10px rgba(0,0,0,.4)">stolen password ✓</div>`, 930, 430);
  tl.init(note, { o: 0 });
  popIn(tl, note, 179.0);
  const phone = H(s, `<div style="width:340px;height:560px;border-radius:46px;background:var(--coal);padding:16px"><div style="width:100%;height:100%;border-radius:32px;background:var(--g1);padding:70px 20px 20px;position:relative">
      <div style="border-radius:20px;background:#fff;padding:20px;box-shadow:0 10px 30px -14px rgba(27,45,91,.5)"><div style="display:flex;gap:10px;align-items:center;color:var(--navy);font-size:20px;font-weight:700"><span style="font-size:28px">${ico("shield")}</span>Sign-in request</div>
      <div style="margin-top:10px;font-size:26px;font-weight:700;color:var(--ink);line-height:1.2">Is this you signing in?</div><div style="margin-top:6px;font-size:20px;color:var(--muted)">New device · Unknown location</div>
      <div style="display:flex;gap:10px;margin-top:18px"><div style="flex:1;height:56px;border-radius:12px;background:var(--g1);display:grid;place-items:center;font-size:22px;font-weight:700;color:var(--navy)">Approve</div><div class="deny" style="flex:1;height:56px;border-radius:12px;background:var(--red);display:grid;place-items:center;font-size:22px;font-weight:700;color:#fff">Deny</div></div></div></div></div>`, 1380, 330);
  tl.init(phone, { o: 0 });
  inn(tl, phone, 179.4, { dy: 60 });
  press(tl, q(phone, ".deny"), 180.9);
  ripple(tl, s, 1380 + 16 + 20 + 20 + 225, 330 + 16 + 70 + 210, 180.9, "var(--red)");
  out(tl, [login, b2, note, phone], 184.1);

  // --- NIST quote + where to start (184.4–190.2)
  const quote = H(s, `<div style="width:1640px;padding:36px 44px;border-radius:24px;background:var(--cta);border-top:8px solid var(--red)"><div style="font-size:40px;line-height:1.3;color:var(--navy);font-weight:700">“Enabling MFA on all accounts that offer it is one of the most important steps one can take to protect their business from cybersecurity risks.”</div><div style="margin-top:14px;font-size:24px;color:var(--muted)">NIST CSWP 50, p. 15 · Phishing-resistant MFA, like passkeys, is strongest.</div></div>`, 140, 360);
  tl.init(quote, { o: 0 });
  inn(tl, quote, 184.6, { dy: 30 });
  const start = H(s, `<div style="display:flex;gap:16px;align-items:center"><div style="font-size:30px;font-weight:700;color:var(--navy);margin-right:8px">Start with:</div>${[["mail", "Email"], ["bank", "Banking"], ["vault", "Password manager"], ["cloud", "Cloud storage"]].map(([i, l]) => `<div class="chip navy sc">${ico(i)}${l}</div>`).join("")}</div>`, 140, 690);
  tl.init(start, { o: 0 });
  inn(tl, start, 186.3, { dy: 10 });
  stagger(tl, qa(start, ".sc"), 186.6, 0.3, popIn);
  out(tl, [quote, start], 189.9);

  // --- default passwords (190.2–196)
  const dev = [["router", "Router"], ["printer", "Printer"], ["camera", "Security camera"]].map(([i, l], k) => {
    const el = H(s, `<div style="width:500px;padding:30px;border-radius:24px;background:#fff;box-shadow:0 0 0 1.5px var(--g2),0 24px 50px -30px rgba(27,45,91,.45)"><div style="display:flex;align-items:center;gap:20px"><div style="width:80px;height:80px;font-size:80px;color:var(--navy)">${ico(i)}</div><div style="font-size:36px;font-weight:700;color:var(--navy)">${l}</div></div>
      <div style="position:relative;margin-top:24px;height:62px"><div class="old" style="position:absolute;inset:0;display:flex;align-items:center;gap:12px;font-size:30px;color:var(--ink)"><span style="color:var(--muted)">Password:</span><b style="position:relative;font-family:Consolas,monospace">admin<i class="strike" style="position:absolute;left:-6px;right:-6px;top:52%;height:5px;background:var(--red);display:block;transform-origin:0 50%"></i></b></div>
      <div class="new chip navy" style="position:absolute;left:0;top:0">${ico("check")}Unique password</div></div></div>`, 120 + k * 570, 400);
    tl.init(el, { o: 0 });
    inn(tl, el, 190.4 + k * 0.3, { dy: 40 });
    const strike = q(el, ".strike"), oldE = q(el, ".old"), nw = q(el, ".new");
    tl.init(strike, { sx: 0 });
    tl.ft(strike, 192.0 + k * 0.25, 0.4, { sx: [0, 1] }, E.out);
    tl.to(oldE, 193.0 + k * 0.25, 0.3, { o: 0 }, E.in2);
    tl.init(nw, { o: 0 });
    popIn(tl, nw, 193.2 + k * 0.25);
    return el;
  });
  const crim = H(s, `<div style="font-size:32px;color:#4A5268">Factory passwords are easy to find, and criminals know them.</div>`, 120, 690);
  tl.init(crim, { o: 0 });
  inn(tl, crim, 191.2);
  out(tl, [...dev, crim], 195.7);

  // --- updates (196–202.4)
  const dlg = H(s, `<div class="win" style="width:820px"><div class="w-bar"><i></i><i></i><i></i><b>Software Update</b></div><div style="padding:34px 40px">
      <div style="display:flex;gap:22px;align-items:center"><div style="width:70px;height:70px;font-size:70px;color:var(--navy)">${ico("down")}</div><div><div style="font-size:36px;font-weight:700;color:var(--navy)">Security updates are ready</div><div style="font-size:26px;color:#4A5268;margin-top:4px">Install now to fix known vulnerabilities.</div></div></div>
      <div style="display:flex;gap:16px;margin-top:34px;justify-content:flex-end"><div class="later" style="height:64px;padding:0 28px;border-radius:14px;background:var(--g1);display:grid;place-items:center;font-size:26px;font-weight:700;color:var(--ink)">Remind me tomorrow</div><div style="height:64px;padding:0 28px;border-radius:14px;background:var(--navy);display:grid;place-items:center;font-size:26px;font-weight:700;color:#fff">Install now</div></div></div></div>`, 140, 380);
  tl.init(dlg, { o: 0 });
  inn(tl, dlg, 196.2, { dy: 30 });
  const later = q(dlg, ".later");
  const cnt = H(s, `<div style="min-width:110px;height:64px;padding:0 18px;border-radius:32px;background:var(--red);color:#fff;display:grid;place-items:center;font-size:34px;font-weight:700">×1</div>`, 560, 650);
  tl.init(cnt, { o: 0 });
  popIn(tl, cnt, 196.6, 0.35);
  for (let i = 0; i < 9; i++) press(tl, later, 196.6 + i * 0.16);
  tl.fn(196.6, 1.5, p => { cnt.textContent = "×" + Math.max(1, Math.round(1 + p * 46)); }, E.in2);
  tl.to(dlg, 198.3, 0.5, { o: 0.35, s: 0.96 }, E.out);
  tl.to(cnt, 198.3, 0.3, { o: 0 }, E.out);
  const sw = H(s, `<div style="display:flex;align-items:center;gap:22px;padding:28px 34px;border-radius:22px;background:#fff;box-shadow:0 0 0 1.5px var(--g2),0 24px 50px -30px rgba(27,45,91,.45)"><div class="tg" style="position:relative;width:110px;height:60px;border-radius:30px;background:#C3CAD8"><i class="kn" style="position:absolute;left:6px;top:6px;width:48px;height:48px;border-radius:50%;background:#fff;display:block"></i></div><div style="font-size:34px;font-weight:700;color:var(--navy)">Automatic updates</div><div class="onl" style="font-size:28px;font-weight:700;color:var(--red)">ON</div></div>`, 1060, 360);
  tl.init(sw, { o: 0 });
  inn(tl, sw, 198.5);
  const tg = q(sw, ".tg"), kn = q(sw, ".kn"), onl = q(sw, ".onl");
  tl.ft(kn, 198.9, 0.3, { x: [0, 50] }, E.out);
  tl.init(onl, { o: 0 });
  tl.set(onl, 199.0, { o: 1 });
  states(tl, tg, [[0, "off"], [199.0, "on"]]);
  tl.tick(t => { tg.style.background = t >= 199.0 ? "var(--navy)" : "#C3CAD8"; });
  const mo = chip(s, `${ico("cal")}Check for updates at least monthly`, 1060, 520, "");
  const eol = chip(s, `${ico("trash")}Replace devices that no longer get updates`, 1060, 600, "");
  [mo, eol].forEach(c => tl.init(c, { o: 0 }));
  inn(tl, mo, 199.7);
  inn(tl, eol, 200.5);
  out(tl, [dlg, sw, mo, eol], 202.1);

  // --- standard vs admin (202.4–207.6)
  const adm = card(s, { icon: "crown", h: "Administrator", p: "Only for installing software and changing settings.", x: 160, y: 390, w: 760 });
  const std = card(s, { icon: "person", h: "Standard user", p: "For email, browsing, and everyday work.", x: 1000, y: 390, w: 760 });
  tl.init(adm, { o: 0 }); tl.init(std, { o: 0 });
  inn(tl, adm, 202.6, { dy: 30 });
  inn(tl, std, 203.2, { dy: 30 });
  tl.to(adm, 204.4, 0.5, { o: 0.45 }, E.out);
  const daily = chip(s, `${ico("check")}Daily driver`, 1040, 610, "red");
  tl.init(daily, { o: 0 });
  popIn(tl, daily, 204.4);
  const lp = H(s, `<div style="font-size:32px;color:#4A5268;width:1600px">Least privilege: give every account only the access it needs.</div>`, 160, 700);
  tl.init(lp, { o: 0 });
  inn(tl, lp, 205.0);
  out(tl, [adm, std, daily, lp], 207.3);

  // --- backups (207.6–220)
  const bk = mk("div", "abs", s, { left: "0", top: "0", width: "1920px", height: "1080px" });
  const L = [360, 560], CL = [940, 400], DR = [940, 720];
  const bl = H(bk, `<svg width="1920" height="1080" style="position:absolute;left:0;top:0"><path class="a1" d="M${L[0] + 110} ${L[1] - 30} L${CL[0] - 100} ${CL[1]}" stroke="var(--navy)" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round" fill="none"/><path class="a2" d="M${L[0] + 110} ${L[1] + 30} L${DR[0] - 100} ${DR[1]}" stroke="var(--navy)" stroke-width="6" stroke-linecap="round" fill="none"/></svg>`, 0, 0);
  const a2 = q(bl, ".a2");
  const big = (i, l, x, y, sub) => H(bk, `<div style="width:220px;text-align:center"><div style="display:grid;place-items:center;width:200px;height:200px;margin:0 auto;border-radius:44px;background:#fff;box-shadow:0 0 0 2px var(--g2),0 24px 50px -30px rgba(27,45,91,.45);color:var(--navy);font-size:110px">${ico(i)}</div><div style="margin-top:14px;font-size:30px;font-weight:700;color:var(--navy)">${l}</div>${sub ? `<div style="font-size:24px;color:var(--muted)">${sub}</div>` : ""}</div>`, x - 110, y - 100);
  const lap = big("laptop", "Sam’s laptop", L[0], L[1]);
  const cl = big("cloud", "Cloud backup", CL[0], CL[1]);
  const drv = big("drive", "External drive", DR[0], DR[1] - 40);
  [lap, cl, drv].forEach(e => tl.init(e, { o: 0 }));
  inn(tl, lap, 207.8, { s: 0.9 });
  drawPath(tl, q(bl, ".a1"), 208.4, 0.8);
  drawPath(tl, a2, 208.6, 0.8);
  inn(tl, cl, 208.9, { s: 0.9 });
  inn(tl, drv, 209.2, { s: 0.9 });
  // unplug: the drive slides away and the cable fades
  tl.to(drv, 210.8, 0.7, { x: 150 }, E.glide);
  tl.to(a2, 210.8, 0.5, { so: 0.15 }, E.out);
  const disc = chip(bk, `${ico("plug")}Disconnected copy`, 1150, 600, "red");
  tl.init(disc, { o: 0 });
  popIn(tl, disc, 211.4);
  // restore test
  const rt = H(bk, `<div style="width:520px;padding:26px 30px;border-radius:22px;background:#fff;box-shadow:0 0 0 1.5px var(--g2),0 24px 50px -30px rgba(27,45,91,.45)"><div style="display:flex;justify-content:space-between;font-size:28px;font-weight:700;color:var(--navy);margin-bottom:14px"><span>Test restore</span><span class="pc">0%</span></div><div class="meter"><i style="background:var(--navy);transform:scaleX(0)"></i></div><div class="ok" style="margin-top:16px;font-size:28px;font-weight:700;color:var(--red)">Restored. Backup works ✓</div></div>`, 1250, 300);
  tl.init(rt, { o: 0 });
  inn(tl, rt, 213.8, { dy: 20 });
  const rbar = q(rt, ".meter i"), rpc = q(rt, ".pc"), ok = q(rt, ".ok");
  tl.fn(214.2, 1.8, p => { rbar.style.transform = `scaleX(${r4(p)})`; rpc.textContent = Math.round(p * 100) + "%"; }, E.io);
  tl.init(ok, { o: 0 });
  popIn(tl, ok, 216.1);
  const b3 = bandit(tl, bk, { x: 1500, y: 560, s: 0.75, moods: [[0, "smirk"], [216.2, "sad"]], look: [[0, -8, -4]] });
  tl.init(b3, { o: 0, s: 0.75 });
  tl.ft(b3, 214.4, 0.6, { y: [120, 0], o: [0, 1] }, E.glide);
  tl.to(b3, 217.6, 0.8, { x: 500 }, E.in2);
}

/* =====================================================================
   9 · Spot the phish (220–252)
   ===================================================================== */
function scene9(tl) {
  const s = S(tl, 220, 252);
  const em = H(s, `<div class="win" style="width:1060px"><div class="w-bar"><i></i><i></i><i></i><b>Inbox</b></div><div style="padding:30px 40px 36px;position:relative">
      <div class="from" style="font-size:26px;color:var(--ink)"><span style="color:var(--muted)">From:</span> <b style="color:var(--navy)">Commonwealth Bank Security</b> <span class="addr">&lt;secure.alerts.cwbank@freemail.example&gt;</span></div>
      <div class="subj" style="margin-top:14px;font-size:34px;font-weight:700;color:var(--ink)">URGENT: Your account will be LOCKED in 1 hour!!</div>
      <div class="body" style="margin-top:22px;font-size:28px;line-height:1.45;color:#4A5268">Dear valued customer,<br>We detected unusual activity. To avoid suspension, <b style="color:var(--ink)">update your payment routing number</b> right away.</div>
      <div class="btn" style="display:inline-grid;place-items:center;margin-top:26px;height:68px;padding:0 34px;border-radius:14px;background:var(--navy);color:#fff;font-size:28px;font-weight:700">Verify my account</div>
      <div style="margin-top:22px;font-size:20px;color:var(--muted)">Fictional example. Not a real bank.</div></div></div>`, 130, 170);
  tl.init(em, { o: 0 });
  inn(tl, em, 220.6, { dy: 50 });

  // Bandit fishing from the top-right
  const b = bandit(tl, s, { x: 1560, y: 120, s: 0.62, moods: [[0, "smirk"], [244.5, "grin"], [249.6, "shock"], [250.3, "sad"]], look: [[0, -10, 8]] });
  tl.init(b, { o: 0, s: 0.62 });
  tl.ft(b, 221.2, 0.7, { x: [400, 0], o: [0, 1] }, E.glide);
  const rod = H(s, `<svg width="1920" height="1080" style="position:absolute;left:0;top:0;overflow:visible"><path class="pole" d="M1640 380 L1240 120" stroke="#5E646D" stroke-width="10" stroke-linecap="round"/><path class="line" d="M1240 120 L520 120 L520 610" stroke="#5E646D" stroke-width="2.5" fill="none"/><g class="hk" style="color:#5E646D"><svg x="490" y="600" width="60" height="60" viewBox="0 0 48 48" class="ico" style="font-size:60px">${ICONS.hook}</svg></g></svg>`, 0, 0);
  const line = q(rod, ".line"), hk = q(rod, ".hk"), pole = q(rod, ".pole");
  tl.init(pole, { o: 0 });
  tl.ft(pole, 221.8, 0.4, { o: [0, 1] }, E.out);
  drawPath(tl, line, 222.0, 1.0, E.out);
  tl.init(hk, { o: 0 });
  tl.ft(hk, 222.9, 0.3, { o: [0, 1] }, E.out);
  tl.tick(t => { hk.style.transform = `translateY(${r2(Math.sin(t * 2.4) * 8)}px)`; });
  // snip
  tl.to(hk, 249.6, 0.6, { y: 500, o: 0 }, E.in);
  tl.to(line, 249.6, 0.3, { so: 0 }, E.out);
  tl.to(pole, 250.6, 0.4, { o: 0 }, E.out);

  const si = H(s, `<div style="width:520px;padding:24px 28px;border-radius:20px;background:#fff;box-shadow:0 0 0 1.5px var(--g2)"><div style="display:flex;gap:14px;align-items:center;font-size:30px;font-weight:700;color:var(--navy)"><span style="font-size:40px;color:var(--red)">${ico("warn")}</span>Fakes look real now</div><div style="margin-top:10px;font-size:22px;line-height:1.35;color:var(--muted)">“Super intelligence” (SI) is the federal term for AI since Sept. 2026. CSWP 50, fn. 6.</div></div>`, 1270, 420);
  tl.init(si, { o: 0 });
  inn(tl, si, 226.6, { dy: 30 });
  out(tl, si, 232.0);

  const flags = [
    [".subj", "Pressure to act fast", "Stop and think, even if it looks legit.", 232.6, 360],
    [".addr", "A “bank” on free email", "Check the sender’s address.", 238.4, 520],
    [".body b", "Asks to change payment info", "Verify with contact info you already trust.", 244.2, 680],
  ];
  flags.forEach(([sel, h, p, t, y], i) => {
    const target = q(em, sel);
    const hl = mk("div", "hl", s);
    // place the highlight around the target once layout is known
    const place = () => {
      const st = $("#stage").getBoundingClientRect(), r = target.getBoundingClientRect();
      Object.assign(hl.style, { left: r.left - st.left - 10 + "px", top: r.top - st.top - 8 + "px", width: r.width + 20 + "px", height: r.height + 16 + "px" });
    };
    place();
    tl.init(hl, { o: 0 });
    tl.ft(hl, t, 0.3, { o: [0, 1] }, E.out);
    tl.ft(hl, t, 0.45, { s: [1.15, 1] }, E.glide);
    const fl = H(s, `<div style="width:540px;padding:20px 24px;border-radius:18px;background:#fff;box-shadow:0 0 0 2px var(--red),0 20px 40px -24px rgba(200,16,46,.6)"><div style="display:flex;gap:14px;align-items:center;font-size:30px;font-weight:700;color:var(--red)"><span class="tick red">${i + 1}</span>${h}</div><div style="margin-top:6px;font-size:25px;color:var(--ink)">${p}</div></div>`, 1260, y);
    tl.init(fl, { o: 0 });
    inn(tl, fl, t + 0.2, { dx: 40, dy: 0 });
  });
  const verify = H(s, `<div style="display:flex;gap:14px"><div class="chip navy">${ico("call")}Call the number you already have</div><div class="chip">${ico("gift")}Gift card request? Verify first.</div></div>`, 130, 870 - 70);
  tl.init(verify, { o: 0 });
  inn(tl, verify, 246.6);
  const nope = H(s, `<div class="chip red" style="font-size:34px;height:66px;rotate:-4deg">Not today, Bandit.</div>`, 1430, 200);
  tl.init(nope, { o: 0 });
  popIn(tl, nope, 250.0);
}

/* =====================================================================
   10 · Ransomware (252–270)
   ===================================================================== */
function scene10(tl) {
  const s = S(tl, 252, 270, true);
  const hd = heading(s, { x: 120, y: 150, w: 900, eyebrow: "Ransomware", lines: ["Locked files, ransom demand"], size: 60 });
  showHeading(tl, hd, 252.4);
  const names = ["invoices.xlsx", "customers.csv", "orders.pdf", "logo.png", "taxes-2026.pdf", "product-photos", "recipes.docx", "contracts.pdf"];
  const files = names.map((n, i) => {
    const x = 130 + (i % 4) * 210, y = 300 + Math.floor(i / 4) * 250;
    const el = H(s, `<div style="width:180px;text-align:center"><div style="position:relative;display:grid;place-items:center;width:150px;height:170px;margin:0 auto;border-radius:18px;background:#fff;color:var(--navy);font-size:90px">${ico("file")}<div class="lk" style="position:absolute;right:-16px;bottom:-14px;display:grid;place-items:center;width:70px;height:70px;border-radius:50%;background:var(--red);color:#fff;font-size:40px;box-shadow:0 0 0 5px var(--navy)">${ico("lock")}</div></div><div style="margin-top:10px;font-size:21px;color:var(--lnavy)">${n}</div></div>`, x, y);
    tl.init(el, { o: 0 });
    inn(tl, el, 252.7 + i * 0.08, { dy: 20, d: 0.5 });
    const lk = q(el, ".lk");
    tl.init(lk, { o: 0 });
    popIn(tl, lk, 253.6 + i * 0.22, 0.4);
    tl.to(lk, 259.3 + i * 0.1, 0.35, { o: 0, s: 0.3, y: 20 }, E.in2);
    return el;
  });
  void files;
  const noteEl = H(s, `<div style="width:560px;padding:34px 38px;border-radius:20px;background:#fff;box-shadow:0 30px 60px -20px rgba(0,0,0,.5)"><div style="display:flex;gap:14px;align-items:center;font-size:36px;font-weight:700;color:var(--red)"><span style="font-size:46px">${ico("lock")}</span>Your files are locked.</div><div style="margin-top:12px;font-size:28px;line-height:1.35;color:var(--ink)">Pay up to get them back.<br><b>— The Bandit</b></div><div class="tm" style="margin-top:18px;font-size:44px;font-weight:700;color:var(--navy);font-family:Consolas,monospace">23:59:59</div></div>`, 1060, 300);
  tl.init(noteEl, { o: 0 });
  inn(tl, noteEl, 254.4, { dy: 40 });
  const tm = q(noteEl, ".tm");
  tl.tick(t => {
    const left = Math.max(0, 86399 - Math.floor(Math.max(0, t - 254.4) * 37));
    const v = `${String(Math.floor(left / 3600)).padStart(2, "0")}:${String(Math.floor(left / 60) % 60).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
    if (tm.textContent !== v) tm.textContent = v;
  });
  tl.to(noteEl, 259.6, 1.0, { y: 700, r: 18, o: 0 }, E.in);
  const b = bandit(tl, s, { x: 1520, y: 520, s: 0.8, moods: [[0, "grin"], [258.8, "shock"], [259.8, "sad"]], look: [[0, -10, 0]] });
  tl.init(b, { o: 0, s: 0.8 });
  tl.ft(b, 254.8, 0.6, { y: [100, 0], o: [0, 1] }, E.glide);
  tl.to(b, 261.4, 0.8, { x: 500, o: 0 }, E.in2);
  const cloudC = chip(s, `${ico("cloud")}Cloud accounts can be hit too`, 130, 820, "ghost");
  tl.init(cloudC, { o: 0 });
  inn(tl, cloudC, 257.8);
  const save = H(s, `<div style="width:600px;padding:30px 34px;border-radius:24px;background:#fff;color:var(--navy)"><div style="display:flex;gap:20px;align-items:center"><div style="width:90px;height:90px;font-size:90px">${ico("drive")}</div><div><div style="font-size:36px;font-weight:700">Your backup</div><div style="font-size:26px;color:#4A5268">Secure · Isolated · Tested</div></div></div></div>`, 1100, 330);
  tl.init(save, { o: 0 });
  tl.ft(save, 258.4, 0.8, { o: [0, 1], x: [500, 0] }, E.glide);
  const more = H(s, `<div style="display:flex;flex-direction:column;gap:14px;align-items:flex-start">${[["down", "Keep software updated"], ["shield", "Antivirus, always on"], ["key", "MFA everywhere"], ["call", "Contacts: law enforcement, legal help"]].map(([i, l]) => `<div class="chip ghost mm">${ico(i)}${l}</div>`).join("")}</div>`, 1100, 520);
  stagger(tl, qa(more, ".mm"), 263.8, 0.45, (t2, el, t) => inn(t2, el, t, { dx: 30, dy: 0, d: 0.5 }));
}

/* =====================================================================
   11 · Detect, respond, recover (270–296)
   ===================================================================== */
function scene11(tl) {
  const s = S(tl, 270, 296);
  const tr = fnTrack(s, [3, 4, 5], 1180, 150);
  inn(tl, tr, 270.6, { dy: 12 });
  const hd = heading(s, { x: 120, y: 120, w: 1000, eyebrow: "Functions 4 to 6", lines: ["When something goes wrong"], size: 56 });
  showHeading(tl, hd, 270.4);
  const cols = [
    { x: 120, t: 270.5, icon: "eye", h: "Detect", rows: [["Antivirus, always on", 271.6], ["Alerts for new logins and bank transactions", 272.8], ["Screen locks, device tracking, remote wipe", 276.2]] },
    { x: 700, t: 281.0, icon: "siren", h: "Respond", rows: [["Follow your incident response plan", 281.6], ["Write down what happened", 282.6], ["Disconnect affected devices", 283.6], ["Report it: <b class='r'>ic3.gov</b> (FBI)", 285.8]] },
    { x: 1280, t: 289.6, icon: "restore", h: "Recover", rows: [["Check backups are clean before restoring", 290.2], ["Review account settings and forwarding rules", 291.4], ["Write down lessons learned", 292.8]] },
  ];
  cols.forEach(c => {
    const el = H(s, `<div class="col"><div class="col-h"><div class="fh-ico">${ico(c.icon)}</div><div class="col-t">${c.h}</div></div>${c.rows.map(([r]) => `<div class="row"><span class="tick">${ico("check")}</span><span>${r}</span></div>`).join("")}</div>`, c.x, 270);
    const hdr = q(el, ".col-h");
    tl.init(hdr, { o: 0 });
    inn(tl, hdr, c.t, { dy: 20 });
    qa(el, ".row").forEach((r, i) => { tl.init(r, { o: 0 }); inn(tl, r, c.rows[i][1], { dx: -20, dy: 0, d: 0.5 }); });
  });
  // detect: alerts pop on the right while the other columns are still empty
  const t1 = H(s, `<div class="toast"><div class="t-ico">${ico("bell")}</div><div><div class="t-h">New sign-in to your email</div><div class="t-p">Unrecognized device · Was this you?</div></div></div>`, 1240, 340);
  const t2 = H(s, `<div class="toast"><div class="t-ico red">${ico("bank")}</div><div><div class="t-h">Bank alert: $2,400 transfer</div><div class="t-p">Tap to review this transaction.</div></div></div>`, 1240, 480);
  const t3 = H(s, `<div class="toast"><div class="t-ico">${ico("pin")}</div><div><div class="t-h">Laptop located</div><div class="t-p">Remote wipe available</div></div></div>`, 1240, 620);
  [t1, t2, t3].forEach(e => tl.init(e, { o: 0 }));
  inn(tl, t1, 273.2, { dx: 60, dy: 0 });
  inn(tl, t2, 274.4, { dx: 60, dy: 0 });
  inn(tl, t3, 277.0, { dx: 60, dy: 0 });
  out(tl, [t1, t2, t3], 288.9);
}

/* =====================================================================
   12 · Your next step (296–313)
   ===================================================================== */
function scene12(tl) {
  const s = S(tl, 296, DUR + 1, true);
  const hd = heading(s, { x: 140, y: 150, w: 1000, eyebrow: "Your first five", lines: ["Start here this week"], size: 72 });
  showHeading(tl, hd, 296.4);
  const five = ["Turn on MFA, starting with email and banking", "Use long, unique passphrases and a password manager", "Turn on automatic updates", "Back up, disconnect a copy, and test it", "Pause before you click, and verify requests"];
  const list = H(s, `<div>${five.map(f => `<div class="ff" style="display:flex;gap:20px;align-items:center;margin-bottom:22px;font-size:38px;color:#fff"><span class="tick red" style="width:52px;height:52px;font-size:30px">${ico("check")}</span>${f}</div>`).join("")}</div>`, 140, 330);
  stagger(tl, qa(list, ".ff"), 297.0, 0.45, (t2, el, t) => inn(t2, el, t, { dx: -30, dy: 0, d: 0.5 }));
  const b = bandit(tl, s, { x: 1460, y: 380, s: 0.95, moods: [[0, "sad"]], look: [[0, -6, 6]] });
  tl.init(b, { o: 0, s: 0.95 });
  tl.ft(b, 296.8, 0.5, { o: [0, 1] }, E.out);
  tl.to(b, 299.0, 1.6, { x: 700 }, E.in2);
  tl.tick(t => { if (t > 299 && t < 300.8) b.style.rotate = `${r2(Math.sin((t - 299) * 14) * 4)}deg`; });
  out(tl, [hd.el, list], 301.0, 0.45);

  // end card
  const lk = H(s, `<div class="lockup on-dark brand-lockup"></div>`, 0, 170, { width: "1920px", justifyContent: "center" });
  const lead = H(s, `<div style="width:1920px;text-align:center;font-size:58px;font-weight:700;color:#fff">Talk with a business coach</div>`, 0, 360);
  const sub = H(s, `<div style="width:1920px;text-align:center;font-size:34px;color:var(--lnavy)">No-cost, confidential help for Kentucky small businesses</div>`, 0, 440);
  const contact = H(s, `<div style="width:1920px;display:flex;justify-content:center;gap:26px;align-items:center;font-size:44px;font-weight:700;color:#fff"><span>www.KentuckySBDC.com</span><i style="width:6px;height:46px;background:var(--red);border-radius:3px;display:block"></i><span>1-888-414-7232</span></div>`, 0, 520);
  const src = H(s, `<div style="width:1500px;padding:26px 34px;border-radius:18px;background:rgba(255,255,255,.07);box-shadow:0 0 0 1.5px rgba(160,176,208,.35);font-size:21px;line-height:1.5;color:var(--lnavy)">
      <div style="font-size:18px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#fff;margin-bottom:6px">Sources</div>
      Eliot, D., Marron, J. A., &amp; Thorn, S. (2026). <i style="font-style:italic">Small Business Cybersecurity: Non-Employer Firms</i> (NIST Cybersecurity White Paper 50). National Institute of Standards and Technology. doi.org/10.6028/NIST.CSWP.50<br>
      NIST Cybersecurity Framework (CSF) 2.0. · Small business figures: U.S. SBA Office of Advocacy, as cited in CSWP 50. · FBI Internet Crime Complaint Center: ic3.gov<br>
      Sam, Bluegrass Candle Co., Commonwealth Bank, and the Bandit are fictional. This video is educational and not legal advice.</div>`, 210, 640);
  const foot = H(s, `<div style="width:1920px;text-align:center;font-size:20px;line-height:1.5;color:var(--lnavy)">Kentucky Small Business Development Center · Hosted by the University of Kentucky Martin-Gatton College of Agriculture, Food and Environment<br>Funded in part through a Cooperative Agreement with the U.S. Small Business Administration.</div>`, 0, 960);
  [lk, lead, sub, contact, src, foot].forEach(e => tl.init(e, { o: 0 }));
  inn(tl, lk, 301.5);
  inn(tl, lead, 301.9);
  inn(tl, sub, 302.2);
  inn(tl, contact, 302.6);
  inn(tl, src, 303.4);
  inn(tl, foot, 307.6);
}

function buildPiece() {
  const tl = new Timeline();
  [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11, scene12].forEach(f => f(tl));
  fillLockups();
  chrome(tl);
  tl.compile();
  tl.dur = DUR;
  return tl;
}
