"use strict";
/* =====================================================================
   Coach Connect replica.
   One component, two modes:
     static       the tour drives it: render(state) is called every frame
                  with a state computed purely from time.
     interactive  the try-it sandbox: real inputs, events reported through
                  opts.on(action, payload); the sandbox owns the state.
   Markup and copy mirror the live form at register.kentuckysbdc.com.
   ===================================================================== */
const TOUR_MONTH = { y: 2026, m: 11, avail: [2, 3, 4, 8, 9, 10, 15, 16, 17], times: ["9:00am", "10:30am", "1:00pm", "2:30pm"] };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function newState() {
  return {
    step: 0, data: { ...CC.EMPTY }, errors: {}, focus: null, caret: false, hover: null, busy: null, hl: null,
    appt: null, cal: { view: "date", date: null, time: null, month: TOUR_MONTH, loading: false },
  };
}

function Replica(opts = {}) {
  const LIVE = !!opts.interactive;
  const uid = opts.id || "cc" + Math.random().toString(36).slice(2, 7);
  const emit = (a, p) => opts.on && opts.on(a, p || {});
  const fid = n => `${uid}-${n}`;
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const REQ = '<span class="cc-req"> *</span>';

  /* ---------- markup ---------- */
  function control(name, kind, o = {}) {
    if (!LIVE) {
      const inner = '<span class="v"></span><i class="cc-caret"></i>';
      if (kind === "select") return `<div class="cc-select"><div class="cc-input" data-c="${name}">${inner}</div>${ico("chevronDown", 16)}</div>`;
      if (kind === "date") return `<div class="cc-date"><div class="cc-input" data-c="${name}">${inner}</div>${ico("calendar", 17)}</div>`;
      return `<div class="cc-input${kind === "area" ? " area" : ""}" data-c="${name}">${inner}</div>`;
    }
    const common = `class="cc-input" data-c="${name}" id="${fid(name)}" name="${name}"`;
    if (kind === "select") {
      const list = (o.blank === false ? "" : '<option value="">Select an option</option>') +
        o.options.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("");
      return `<div class="cc-select"><select ${common}>${list}</select>${ico("chevronDown", 16)}</div>`;
    }
    if (kind === "area") return `<textarea ${common} maxlength="4000" placeholder="${esc(o.placeholder || "")}"></textarea>`;
    const type = { number: "number", date: "date", email: "email", tel: "tel" }[kind] || "text";
    const max = name === "phone" ? 30 : name === "mailzip" ? 10 : 320;
    const extra = [o.ac && `autocomplete="${o.ac}"`, o.im && `inputmode="${o.im}"`, kind === "number" && 'min="0" step="1"',
      kind === "date" && `max="${new Date().toISOString().slice(0, 10)}"`, kind !== "date" && kind !== "number" && `maxlength="${max}"`].filter(Boolean).join(" ");
    return `<input ${common} type="${type}" ${extra}>`;
  }
  function field(name, label, kind, o = {}) {
    const star = o.req === false ? "" : REQ;
    const lab = LIVE ? `<label for="${fid(name)}">${label}${star}</label>` : `<span>${label}${star}</span>`;
    return `<div class="cc-field${o.wide ? " wide" : ""}" data-f="${name}">${lab}${control(name, kind, o)}` +
      (o.hint ? `<small data-h="${name}">${o.hint}</small>` : "") +
      `<small class="cc-field-error" data-e="${name}" hidden></small></div>`;
  }
  const check = (name, html, required) =>
    `<label class="cc-check${required ? " req" : ""}" data-k="${name}"><span class="cc-box">${LIVE ? `<input type="checkbox" id="${fid(name)}" data-c="${name}">` : ""}${ico("check", 15)}</span><span>${html}</span></label>`;

  const D = CC.DEMOGRAPHICS;
  const html = `
  <div class="cc-pagewrap">
  <header class="cc-header">
    <div class="cc-brand"><img src="${ASSETS.logo}" alt="America’s SBDC Kentucky" width="900" height="542"></div>
    <a class="cc-banner" data-r="banner" ${LIVE ? 'href="https://kysbdc.ecenterdirect.com/events" target="_blank" rel="noopener noreferrer"' : ""}><img src="${ASSETS.banner}" alt="Not ready for one-on-one coaching? Start with a no-cost training session. View training calendar (opens in a new tab)." width="1086" height="362"></a>
  </header>
  <main class="cc-shell">
    <aside class="cc-sidebar">
      <div class="cc-intro">Business coaching</div>
      <h1>Coach Connect</h1>
      <p>Tell us about yourself and your business. We’ll connect you with a coach who serves your community.</p>
      <ol class="cc-steps">${CC.STEPS.map((s, i) => `<li data-step="${i}"><span class="cc-num">${i + 1}</span><span class="cc-lbl">${s.replace("&", "&amp;")}</span></li>`).join("")}</ol>
      <div class="cc-support"><strong>A local partner for your business.</strong>Confidential, no-cost coaching for Kentucky entrepreneurs.<br><br>Questions? Call <a ${LIVE ? 'href="tel:18884147232"' : ""}>1-888-414-7232</a>.<br>Monday–Friday, 8am–5pm.</div>
    </aside>
    <section class="cc-card" data-r="card">
      <div class="cc-eyebrow" data-r="eyebrow">Step 1 of 4</div>
      <div class="cc-progress" role="progressbar" aria-label="Registration progress"><i data-r="bar"></i></div>
      <h2 data-r="h2" tabindex="-1"></h2>
      <p class="cc-lede" data-r="lede"></p>
      <div class="cc-error" role="alert" data-r="errors" hidden></div>
      <form novalidate data-r="form">
        <div class="cc-pane" data-pane="0">
          <div class="cc-fields">
            ${field("first", "First name", "text", { ac: "given-name" })}
            ${field("last", "Last name", "text", { ac: "family-name" })}
            ${field("email", "Email address", "email", { ac: "email" })}
            ${field("phone", "Phone number", "tel", { ac: "tel" })}
            ${field("mailaddr", "Business or home address", "text", { wide: true, ac: "street-address", hint: "Use your home address if you’re not in business yet." })}
            ${field("mailcity", "City", "text", { ac: "address-level2" })}
            ${field("mailst", "State", "select", { options: CC.STATES.map(s => [s, CC.stateLabel(s)]), blank: false })}
            ${field("mailzip", "ZIP code", "text", { ac: "postal-code", im: "numeric" })}
            <div class="cc-info full" data-r="zipInfo" hidden>${ico("mapPin", 16)}<span></span></div>
          </div>
        </div>
        <div class="cc-pane" data-pane="1" hidden>
          <div class="cc-section" id="${fid("status-label")}">Where are you in your business journey? <span class="cc-req">*</span></div>
          <div class="cc-radios" role="radiogroup" aria-labelledby="${fid("status-label")}" data-r="journey">
            ${[["P", "Starting a business", "I have an idea or am planning a new business."], ["B", "Already in business", "I’ve started operating my business."]].map(([v, t, s]) =>
              `<label class="cc-choice" data-v="${v}">${LIVE ? `<input type="radio" name="${fid("statusInit")}" value="${v}" data-c="statusInit">` : ""}<span class="cc-radio"></span><span>${t}<small>${s}</small></span></label>`).join("")}
          </div>
          <small class="cc-field-error" data-e="statusInit" hidden></small>
          <p class="cc-muted" style="line-height:1.6;margin-top:12px">You are considered in business if you have acquired debt or equity, incurred business expenses, sold a product to customers other than friends or family, or paid employees or contractors.</p>
          <div class="cc-fields" style="margin-top:24px">
            <div data-r="biz" style="display:contents">
              ${field("company", "Business name", "text", { wide: true, ac: "organization" })}
              ${field("estab", "Date established", "date")}
              ${field("ftEmps", "Full-time employees", "number", { hint: "Zero is allowed here if you have at least one part-time employee." })}
              ${field("ptEmps", "Part-time employees", "number", { hint: "Zero is allowed here if you have at least one full-time employee." })}
              ${field("product", "Products or services", "text", { wide: true })}
            </div>
            ${field("help", "How can we help?", "area", { wide: true, placeholder: "Describe your business or idea in a sentence or two, and what you’d like help with." })}
          </div>
          <h3 class="cc-section" data-r="demoHead">Help us understand who we serve</h3>
          <p class="cc-muted" style="margin-bottom:20px;line-height:1.6">Your answers help Kentucky SBDC report who our programs reach and identify communities we may be missing. We encourage you to answer, but you may choose “Prefer not to say.” Your answers do not affect your coaching match. For Sex, please select Male or Female. “Prefer not to say” is available for the other questions.</p>
          <div class="cc-fields" data-r="demo">${Object.entries(D).map(([k, v]) => field(k, v.label, "select", { options: v.options })).join("")}</div>
        </div>
        <div class="cc-pane" data-pane="2" hidden>
          <dl class="cc-review" data-r="review"></dl>
          <p style="margin-top:14px"><button type="button" class="cc-link" data-a="edit">Edit your details</button></p>
          <h3 class="cc-section">Client rights and responsibilities</h3>
          <div class="cc-agreement" tabindex="0" role="region" aria-label="Client agreement" data-r="agreement">${CC.AGREEMENT.split("\n\n").map(p => `<p>${esc(p)}</p>`).join("")}</div>
          ${check("consent", `I have read and agree to the client rights, responsibilities, and request for consulting above. <span class="cc-req">*</span><small class="cc-field-error" data-e="consent" hidden></small>`, true)}
          ${check("certified", `${esc(CC.CERTIFICATION).replace(/\n/g, " ")} <span class="cc-req">*</span><small class="cc-field-error" data-e="certified" hidden></small>`, true)}
          ${field("signature", "Electronic signature", "text", { hint: "Type your full name as entered above. By submitting, you sign the agreement and certification electronically." })}
          ${check("sba", `I permit SBA or its agent the use of my name and address for SBA surveys and information mailings regarding SBA products and services. I understand that any information disclosed will be held in strict confidence. SBA will not provide your personal information to commercial entities.<small class="opt">Optional. This permission is not required to receive SBDC services.</small>`, false)}
          <p class="cc-muted" style="line-height:1.6">Submitting records your registration with Kentucky SBDC. On the next page, you can choose your coaching appointment through Calendly.</p>
        </div>
        <div class="cc-pane" data-pane="3" hidden><div data-r="appt"></div></div>
        <div class="cc-actions" data-r="actions">
          <button type="button" class="cc-btn secondary" data-a="back" data-r="back">${ico("arrowLeft", 16)} Back</button>
          <span class="cc-muted" data-r="hint">Your next step: business details</span>
          <button type="submit" class="cc-btn" data-a="next" data-r="next"><span data-r="nextLabel">Continue</span>${ico("arrowRight", 17)}</button>
        </div>
      </form>
      <div class="cc-actions" data-r="again" hidden>
        <span class="cc-muted">Registering another client?</span>
        <button type="button" class="cc-btn secondary" data-a="again" data-r="againBtn">Start a new registration</button>
      </div>
    </section>
  </main>
  <footer class="cc-footer">
    <div class="cc-footer-inner">
      <div class="cc-logos"><img class="k" src="${ASSETS.logo}" alt="America’s SBDC Kentucky"><img class="u" src="${ASSETS.uk}" alt="University of Kentucky Martin-Gatton College of Agriculture, Food and Environment"><img class="s" src="${ASSETS.sba}" alt="Powered by the U.S. Small Business Administration"></div>
      <p class="cc-disclaimer">Funded in part through a cooperative agreement with the U.S. Small Business Administration. All opinions, conclusions or recommendations expressed are those of the author(s) and do not necessarily reflect the views of SBA. Reasonable accommodations for persons with disabilities will be made if requested at least two weeks in advance. Contact your local service center to make accommodations. SBDC services are provided in a nondiscriminatory way to all legal residents and citizens in the US.</p>
      <p class="cc-privacy">${ico("lock", 14)}<span>Your information is used to connect you with Kentucky SBDC coaching services.</span></p>
    </div>
  </footer>
  </div>`;

  const root = document.createElement("div");
  root.className = "cc " + (LIVE ? "cc-live" : "cc-static");
  root.innerHTML = html;
  const R = {};
  root.querySelectorAll("[data-r]").forEach(el => { R[el.dataset.r] = el; });
  const C = {}, E = {}, F = {};
  root.querySelectorAll("[data-c]").forEach(el => { if (el.type !== "radio") C[el.dataset.c] = el; });
  root.querySelectorAll("[data-e]").forEach(el => { E[el.dataset.e] = el; });
  root.querySelectorAll("[data-f]").forEach(el => { F[el.dataset.f] = el; });
  const panes = [...root.querySelectorAll(".cc-pane")];
  const lis = [...root.querySelectorAll(".cc-steps li")];
  const choices = [...R.journey.querySelectorAll(".cc-choice")];
  const checks = {};
  root.querySelectorAll(".cc-check").forEach(el => { checks[el.dataset.k] = el; });

  /* ---------- appointment pane ---------- */
  function calHTML(S, coach) {
    const cal = S.cal, M = cal.month || TOUR_MONTH;
    const first = new Date(M.y, M.m, 1).getDay(), days = new Date(M.y, M.m + 1, 0).getDate();
    const dayName = d => DAYS[new Date(M.y, M.m, d).getDay()];
    let body;
    if (cal.view === "date") {
      let cells = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => `<span class="dow">${d}</span>`).join("");
      for (let i = 0; i < first; i++) cells += "<span></span>";
      for (let d = 1; d <= days; d++) {
        const av = M.avail.includes(d), sel = cal.date === d || cal.hoverDate === d;
        cells += av ? `<button type="button" class="d av${sel ? " sel" : ""}" data-a="calDate" data-v="${d}" aria-label="${dayName(d)}, ${MONTHS[M.m]} ${d}">${d}</button>` : `<span class="d">${d}</span>`;
      }
      body = `<h5>Select a Date &amp; Time</h5><div class="cc-cal-month"><b>${MONTHS[M.m]} ${M.y}</b><span>${ico("chevronLeft", 18)}${ico("chevronRight", 18)}</span></div><div class="cc-cal-grid">${cells}</div>`;
    } else if (cal.view === "time") {
      body = `<div class="cc-cal-when">${ico("calendar", 14)} ${dayName(cal.date)}, ${MONTHS[M.m]} ${cal.date}</div><h5>Select a time</h5><div class="cc-cal-times">${M.times.map(t =>
        `<button type="button" class="${cal.time === t || cal.hoverTime === t ? "sel" : ""}" data-a="calTime" data-v="${t}">${t}</button>`).join("")}</div>`;
    } else {
      body = `<div class="cc-cal-when">${ico("calendar", 14)} ${cal.time}, ${dayName(cal.date)}, ${MONTHS[M.m]} ${cal.date}</div><h5>Enter details</h5>
        <div class="cc-cal-form"><label>Name *<span class="v">${esc(`${S.data.first} ${S.data.last}`.trim())}</span></label><label>Email *<span class="v">${esc(S.data.email)}</span></label>
        <button type="button" class="cc-cal-go" data-a="calConfirm">Schedule event</button></div>`;
    }
    return `<div class="cc-cal" data-r2="cal"><div class="cc-cal-tag"><span>Calendly</span><span>Simplified for this demo</span></div>
      <div class="cc-cal-head"><div class="who">${esc(coach.name === "First available coach" ? "Andrea Taylor" : coach.name)}</div><div class="what">Coaching appointment</div>
      <div class="pre" data-r2="prefill"><span>${ico("userCheck", 14)} ${esc(`${S.data.first} ${S.data.last}`.trim())}</span><span>${ico("mail", 14)} ${esc(S.data.email)}</span></div></div>
      <div class="cc-cal-body">${body}</div></div>`;
  }

  function apptHTML(S) {
    const A = S.appt;
    if (!A) return "";
    if (A.mode === "booked") {
      const sync = A.sync === "pending" ? '<p class="cc-muted">Updating your registration with your booking…</p>'
        : A.sync === "synced" ? '<p class="cc-muted">Your Calendly booking has been noted in your Kentucky SBDC client record.</p>'
        : `<p class="cc-info block" data-r2="retry">Your appointment is booked. We couldn’t update the booking note yet. <button type="button" class="cc-link" data-a="retryNote">Retry the note update</button></p>`;
      return `<div class="cc-success" data-r2="success">${ico("check", 26)}</div><p class="cc-info block">Your registration is saved and Calendly has confirmed your booking. Use the links in your Calendly confirmation email if you need to reschedule or cancel.</p><div role="status" aria-live="polite">${sync}</div>`;
    }
    let h = `<div class="cc-info" data-r2="center">${ico("mapPin", 16)}<span>${esc(A.centerName)}</span></div>`;
    if (A.mode === "calendar") {
      const c = A.coaches.find(x => x.id === A.selected) || A.coaches[0];
      return h + `<div class="cc-picked"><strong>${esc(c.name)}</strong>${A.coaches.length > 1 ? '<button type="button" class="cc-link" data-a="changeCoach">Change coach</button>' : ""}</div>
        <p class="cc-muted" role="status">${S.cal.loading ? "Loading available appointments…" : "Choose an available day and time below."}</p>
        ${S.cal.loading ? `<div class="cc-cal cc-cal-loading"><div class="cc-cal-tag"><span>Calendly</span><span>Simplified for this demo</span></div><div class="sk"><i style="width:38%"></i><i style="width:64%"></i><i style="width:52%"></i><div class="skg">${"<b></b>".repeat(35)}</div></div></div>` : calHTML(S, c)}
        <p class="cc-muted">Having trouble with the calendar? <span class="cc-link">Open Calendly in a new tab</span> ${ico("external", 13, 'style="display:inline;vertical-align:-1px"')}</p>`;
    }
    if (A.centerId === "8" || A.centerId === "11") {
      const city = A.centerId === "11" ? "Louisville" : "Lexington";
      const list = A.coaches.filter(c => c.id !== "first-available"), fa = A.coaches.find(c => c.id === "first-available");
      const cards = list.map(c => {
        const p = CC.PROFILES[c.id];
        const spec = p && p.specialties ? `<div class="cc-spec"><p>I can help with</p><ul>${p.specialties.map(s => `<li data-spec="${esc(s)}">${esc(s)}</li>`).join("")}</ul></div>`
          : c.detail ? `<p class="cc-muted">${esc(c.detail)}</p>` : "";
        return `<article class="cc-coach" data-coach="${c.id}">${p ? `<img src="${ASSETS.coach[p.photo]}" alt="" width="300" height="300" decoding="${LIVE ? "async" : "sync"}">` : ""}<h4>${esc(c.name)}</h4>
          <button type="button" class="cc-btn" data-a="coach" data-id="${c.id}" data-label="Meet with ${esc(c.name.split(" ")[0])}" aria-label="Schedule with ${esc(c.name)}"><span>Meet with ${esc(c.name.split(" ")[0])}</span></button>${spec}</article>`;
      }).join("");
      return h + `<section class="cc-coach-choices"><h3>${city}: Choose your coach</h3><p class="cc-coach-intro">${A.centerId === "11"
        ? "Our coaches bring years of business experience to help you start, grow and thrive. Choose the experience that fits your needs. All coaching is available at no cost."
        : "Schedule with one of our Lexington-based coaches: Fausto, Stuart or Tonya."}</p><div class="cc-coach-grid">${cards}</div>
        ${fa ? `<div class="cc-first" data-r2="first"><div><h4>Prefer the first available coach?</h4><p>This option connects you with Andrea Taylor at Eastern Kentucky SBDC.</p></div><button type="button" class="cc-btn" data-a="coach" data-id="first-available" data-label="Meet with first available coach"><span>Meet with first available coach</span>${ico("calendar", 17)}</button></div>` : ""}
        <p class="cc-coach-note">Choose a coach to see available appointment times in Calendly.</p></section>`;
    }
    return h + `<h3 class="cc-section">${A.coaches.length === 1 ? "Your coach" : "Choose your coach"}</h3>
      <div class="cc-radios" role="radiogroup" aria-label="Choose your coach">${A.coaches.map(c => `<label class="cc-choice${A.selected === c.id ? " checked" : ""}" data-a="radioCoach" data-id="${c.id}">${LIVE ? `<input type="radio" name="${fid("coach")}" value="${c.id}"${A.selected === c.id ? " checked" : ""}>` : ""}<span class="cc-radio"></span><span>${esc(c.name)}${c.detail ? `<small>${esc(c.detail)}</small>` : ""}</span></label>`).join("")}</div>
      <div class="cc-actions"><span class="cc-muted">Appointment times are shown in Calendly.</span><button type="button" class="cc-btn" data-a="seeTimes" data-label="See available times"><span>See available times</span>${ico("calendar", 17)}</button></div>`;
  }

  /* ---------- render ---------- */
  const last = {};
  const put = (k, v, fn) => { if (last[k] !== v) { last[k] = v; fn(v); } };
  const show = (el, on) => { if (el.hidden === on) el.hidden = !on; };
  const fmtDate = v => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v.slice(5, 7)}/${v.slice(8, 10)}/${v.slice(0, 4)}` : v);

  function displayValue(name, v) {
    if (name === "mailst") return [CC.stateLabel(v), false];
    if (D[name]) { const o = D[name].options.find(([x]) => x === v); return o ? [o[1], false] : ["Select an option", true]; }
    if (name === "estab") return v ? [fmtDate(v), false] : ["mm/dd/yyyy", true];
    if (name === "help" && !v) return ["Describe your business or idea in a sentence or two, and what you’d like help with.", true];
    return [v, false];
  }

  function render(S) {
    const step = S.step;
    put("step", step, () => {
      panes.forEach((p, i) => show(p, i === step));
      R.eyebrow.textContent = `Step ${step + 1} of 4`;
      R.bar.style.width = (step + 1) * 25 + "%";
      lis.forEach((li, i) => {
        li.className = i < step ? "complete" : i === step ? "active" : "";
        if (i === step) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
        li.firstElementChild.innerHTML = i < step ? ico("check", 16) : String(i + 1);
      });
      show(R.banner, step === 0);
      show(R.actions, step < 3);
      show(R.again, step === 3);
      show(R.back, step > 0);
      show(R.hint, step === 0);
      R.card.classList.toggle("appointment", step === 3);
    });
    const booked = S.appt && S.appt.mode === "booked";
    const h2 = step < 3 ? CC.HEADINGS[step] : booked ? "You’re on the calendar." : "Make time for your business.";
    const lede = step < 3 ? CC.LEDES[step] : booked ? "Calendly will send your appointment details to the email address you provided." : "Your registration is complete. Choose an appointment with a coach serving your community.";
    put("h2", h2, v => { R.h2.textContent = v; });
    put("lede", lede, v => { R.lede.textContent = v; });

    const errs = S.errors || {};
    const ek = JSON.stringify(errs);
    put("errs", ek, () => {
      const list = Object.entries(errs);
      show(R.errors, list.length > 0);
      R.errors.innerHTML = list.length ? `<strong>Please check the following:</strong><ul>${list.map(([k, m]) => `<li><a href="#${fid(k)}" data-err="${k}">${esc(m)}</a></li>`).join("")}</ul>` : "";
      for (const [k, el] of Object.entries(E)) { show(el, !!errs[k]); el.textContent = errs[k] || ""; }
      for (const [k, el] of Object.entries(C)) el.setAttribute("aria-invalid", errs[k] ? "true" : "false");
      choices.forEach(c => c.classList.toggle("invalid", !!errs.statusInit));
    });

    // field values
    for (const [name, el] of Object.entries(C)) {
      const v = S.data[name];
      if (typeof v === "boolean") continue;
      if (LIVE) {
        if (el.value !== (v ?? "") && document.activeElement !== el) el.value = v ?? "";
        continue;
      }
      const [txt, ph] = displayValue(name, v ?? "");
      const focused = S.focus === name;
      put("v:" + name, txt + "|" + ph + "|" + focused + "|" + (focused && S.caret), () => {
        el.firstChild.textContent = txt;
        el.firstChild.className = ph ? "v ph" : "v";
        el.classList.toggle("focus", focused);
        el.lastChild.style.opacity = focused && S.caret ? 1 : 0;
      });
    }
    // ZIP routing
    const z = /^\d{5}(-\d{4})?$/.test(S.data.mailzip) ? CC.center(S.data.mailzip) : null;
    put("zip", z ? z.name + z.fallback : "", () => {
      show(R.zipInfo, !!z);
      if (z) R.zipInfo.lastChild.textContent = z.fallback ? "Our Eastern Kentucky intake team will help connect you with the right coach." : `Your coaching center: ${z.name}`;
    });
    // step 2
    put("status", S.data.statusInit, v => {
      choices.forEach(c => {
        const on = c.dataset.v === v;
        c.classList.toggle("checked", on);
        const r = c.querySelector("input");
        if (r) r.checked = on;
      });
      R.biz.style.display = v === "B" ? "contents" : "none";
    });
    put("hoverChoice", S.hover && S.hover.startsWith("choice-") ? S.hover : "", v => {
      choices.forEach(c => c.classList.toggle("hover", v === "choice-" + c.dataset.v));
    });
    // step 3
    if (step === 2) {
      const d = S.data, ctr = z ? z.name : "Kentucky SBDC";
      const rows = [["Name", `${d.first} ${d.last}`], ["Email", d.email], ["Phone", d.phone], ["Address", `${d.mailaddr}, ${d.mailcity}, ${d.mailst} ${d.mailzip}`],
        ["Business", d.statusInit === "B" ? d.company : "Starting a business"], ["Coaching center", ctr],
        ...(d.statusInit === "B" ? [["Date established", d.estab], ["Employees", `${d.ftEmps} full-time · ${d.ptEmps} part-time`], ["Products or services", d.product]] : [])];
      const rh = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("") + `<div class="full"><dt>How we can help</dt><dd>${esc(d.help)}</dd></div>`;
      put("review", rh, v => { R.review.innerHTML = v; });
    }
    for (const k of ["consent", "certified", "sba"]) {
      put("chk:" + k, !!S.data[k], on => {
        checks[k].classList.toggle("checked", on);
        const inp = checks[k].querySelector("input");
        if (inp) inp.checked = on;
      });
    }
    // step 4
    if (step === 3) {
      // Rebuild only when the layout changes; hover, busy and highlight states are toggled in place
      // so the coach photos are never re-created mid-animation.
      const A = S.appt || {};
      const key = JSON.stringify([A.centerId, A.mode, A.mode === "choose" && (A.centerId === "8" || A.centerId === "11") ? "" : A.selected, A.sync, S.cal.view, S.cal.date, S.cal.time,
        S.cal.hoverDate, S.cal.hoverTime, S.cal.loading, S.cal.month && S.cal.month.m, S.data.first, S.data.last, S.data.email]);
      put("appt", key, () => { R.appt.innerHTML = apptHTML(S); });
      put("apptDyn", JSON.stringify([key, S.hover, S.busy, S.hl, A.selected]), () => {
        R.appt.querySelectorAll("[data-a=coach],[data-a=seeTimes]").forEach(b => {
          const id = b.dataset.id || "see";
          b.classList.toggle("hover", S.hover === (b.dataset.a === "coach" ? "coach-" + id : "seeTimes"));
          b.disabled = !!S.busy || (b.dataset.a === "seeTimes" && !A.selected);
          const busyLabel = b.dataset.a === "seeTimes" ? "Saving your selection…" : "Saving selection…";
          b.firstElementChild.textContent = S.busy && (S.busy === id || b.dataset.a === "seeTimes") ? busyLabel : b.dataset.label;
        });
        R.appt.querySelectorAll("[data-spec]").forEach(li => li.classList.toggle("spec-hl", li.dataset.spec === S.hl));
        const go = R.appt.querySelector(".cc-cal-go");
        if (go) go.classList.toggle("hover", S.hover === "calConfirm");
      });
    }
    // actions
    const nextLabel = S.busy === "save" ? "Saving your registration…" : step === 2 ? "Register & choose appointment" : "Continue";
    put("next", nextLabel + "|" + (S.hover === "next") + "|" + !!S.busy, () => {
      R.nextLabel.textContent = nextLabel;
      R.next.lastElementChild.style.display = S.busy === "save" ? "none" : "";
      R.next.classList.toggle("hover", S.hover === "next");
      R.next.disabled = !!S.busy;
    });
    put("hov2", S.hover || "", v => {
      R.back.classList.toggle("hover", v === "back");
      R.againBtn.classList.toggle("hover", v === "again");
    });
  }

  /* ---------- positions (layout px, relative to the replica root) ---------- */
  function rect(target) {
    const el = typeof target === "string" ? root.querySelector(target) : target;
    if (!el) throw new Error("replica: no element for " + target);
    let x = 0, y = 0, n = el;
    while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    if (n !== root) {
      const a = el.getBoundingClientRect(), b = root.getBoundingClientRect();
      return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  }

  /* ---------- interactive wiring ---------- */
  if (LIVE) {
    root.addEventListener("input", e => {
      const n = e.target.dataset.c;
      if (!n) return;
      if (e.target.type === "checkbox") return;
      emit("input", { name: n, value: e.target.value });
    });
    root.addEventListener("change", e => {
      const n = e.target.dataset.c;
      if (e.target.type === "checkbox" && n) emit("input", { name: n, value: e.target.checked });
      else if (e.target.type === "radio" && n === "statusInit") emit("input", { name: n, value: e.target.value });
      else if (e.target.type === "radio") emit("radioCoach", { id: e.target.value });
      else if (n && e.target.tagName === "SELECT") emit("input", { name: n, value: e.target.value });
    });
    R.form.addEventListener("submit", e => { e.preventDefault(); emit("continue"); });
    root.addEventListener("click", e => {
      const err = e.target.closest("[data-err]");
      if (err) { e.preventDefault(); emit("errorlink", { name: err.dataset.err }); return; }
      const a = e.target.closest("[data-a]");
      if (!a || a.disabled) return;
      const act = a.dataset.a;
      if (act === "next") return; // handled by submit
      if (act === "radioCoach") return; // handled by the radio's change event
      e.preventDefault();
      emit(act, { id: a.dataset.id, v: a.dataset.v });
    });
  }

  function focusField(name) {
    const el = name === "statusInit" ? R.journey.querySelector("input") : C[name] || (checks[name] && checks[name].querySelector("input"));
    if (el) { el.focus(); el.scrollIntoView({ block: "center" }); }
  }
  function focusHeading() { R.h2.focus({ preventScroll: true }); }

  return { root, R, C, F, E, checks, choices, lis, panes, render, rect, focusField, focusHeading };
}
