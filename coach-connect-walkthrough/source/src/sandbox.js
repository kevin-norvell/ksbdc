"use strict";
/* =====================================================================
   Try it yourself. The same replica with real inputs. Validation rules,
   error messages, ZIP routing, coaches and copy match the live form.
   Nothing is sent anywhere: the steps that call the server in the live
   form are simulated here and explained in the "Behind the scenes" panel.
   ===================================================================== */
function buildSandbox() {
  const view = $("#tryView"), log = $("#tpLog");
  let S = null, timers = [];
  const later = (ms, fn) => { const id = setTimeout(fn, ms); timers.push(id); };
  const rep = Replica({ interactive: true, id: "try", on: handle });
  view.appendChild(rep.root);
  rep.R.errors.tabIndex = -1;

  /* demo calendar: the next few weekdays, starting two days out */
  function demoMonth() {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + 2);
    // skip weekends and the big office-closed days so the demo calendar looks believable
    const holiday = (y, m, k) => {
      const wd = new Date(y, m, k).getDay();
      return (m === 0 && k === 1) || (m === 6 && k === 4) || (m === 11 && (k === 24 || k === 25 || k === 31)) ||
        (m === 10 && wd >= 4 && wd <= 5 && ((wd === 4 && k >= 22 && k <= 28) || (wd === 5 && k >= 23 && k <= 29))) ||
        (m === 4 && wd === 1 && k >= 25) || (m === 8 && wd === 1 && k <= 7);
    };
    const pick = (y, m, from) => {
      const days = new Date(y, m + 1, 0).getDate(), out = [];
      for (let k = from; k <= days && out.length < 10; k++) {
        const wd = new Date(y, m, k).getDay();
        if (wd > 0 && wd < 6 && k % 4 !== 1 && !holiday(y, m, k)) out.push(k);
      }
      return out;
    };
    let y = d.getFullYear(), m = d.getMonth(), avail = pick(y, m, d.getDate());
    if (avail.length < 4) { m += 1; if (m > 11) { m = 0; y += 1; } avail = pick(y, m, 1); }
    return { y, m, avail, times: ["9:00am", "10:30am", "1:00pm", "2:30pm"] };
  }

  function reset(keepLog) {
    timers.forEach(clearTimeout);
    timers = [];
    S = newState();
    S.cal.month = demoMonth();
    lastZip = "";
    if (!keepLog) log.innerHTML = "";
    render();
    view.scrollTop = 0;
  }
  const render = () => rep.render(S);
  const coachName = c => (c.id === "first-available" ? "Andrea Taylor (first available coach)" : c.name);

  /* ---------- the behind-the-scenes log ---------- */
  function note(icon, title, text) {
    log.querySelectorAll("li.new").forEach(li => li.classList.remove("new"));
    const li = document.createElement("li");
    li.className = "new";
    li.innerHTML = `<div class="ic">${ico(icon, 19)}</div><div><strong></strong><span></span></div>`;
    li.querySelector("strong").textContent = title;
    li.querySelector("span").textContent = text;
    log.prepend(li);
  }
  let lastZip = "", errorsExplained = false;
  function zipNote() {
    const z = S.data.mailzip.trim();
    if (!/^\d{5}(-\d{4})?$/.test(z)) return;
    const c = CC.center(z);
    const key = z.slice(0, 5);
    if (key === lastZip) return;
    lastZip = key;
    if (c.fallback) note("mapPin", `ZIP ${key} isn’t on the map`, "The form routes it to the Eastern Kentucky intake team, who connect the client with the right coach. This happens instantly, in the browser.");
    else note("mapPin", `ZIP ${key} → ${c.name}`, `Matched instantly from the ZIP code. ${c.coaches.length === 1 ? `Coach: ${coachName(c.coaches[0])}.` : `${c.coaches.length} coaching options.`} Nothing is sent yet.`);
  }

  /* ---------- step navigation ---------- */
  function goStep(n) {
    S.step = n;
    S.errors = {};
    S.busy = null;
    render();
    view.scrollTop = 0;
    rep.focusHeading();
  }
  function showErrors(errs) {
    S.errors = errs;
    render();
    rep.R.errors.focus({ preventScroll: true });
    rep.R.errors.scrollIntoView({ block: "center", behavior: "smooth" });
    if (!errorsExplained) {
      errorsExplained = true;
      note("info", "Answers need attention", "Like the live form, problems are listed at the top. Each one links straight to its field, and fixing a field clears its message.");
    }
  }

  function handle(action, p) {
    switch (action) {
      case "input": {
        S.data[p.name] = p.value;
        const keys = ["ftEmps", "ptEmps"].includes(p.name) ? ["ftEmps", "ptEmps"] : [p.name];
        if (keys.some(k => S.errors[k])) {
          const e = CC.validate(S.data, CC.stepOf(p.name)).errors, ne = { ...S.errors };
          for (const k of keys) { delete ne[k]; if (e[k]) ne[k] = e[k]; }
          S.errors = ne;
        }
        render();
        if (p.name === "mailzip") zipNote();
        break;
      }
      case "continue": {
        if (S.busy) return;
        if (S.step < 2) {
          const { errors } = CC.validate(S.data, S.step);
          if (Object.keys(errors).length) return showErrors(errors);
          S.busy = "save";
          S.errors = {};
          render();
          const from = S.step;
          later(650, () => {
            if (from === 0) note("save", "Contact details saved", "In the live form, Continue saves the client’s name, email, phone and address right away, so a registration that stops partway isn’t lost.");
            else note("save", "Progress saved", "Continue saves the contact details again, along with how far the client got.");
            goStep(from + 1);
          });
        } else {
          const { errors } = CC.validate(S.data);
          if (Object.keys(errors).length) {
            S.step = CC.firstErrorStep(errors);
            return showErrors(errors);
          }
          S.busy = "save";
          render();
          later(900, () => {
            const c = CC.center(S.data.mailzip);
            S.appt = { centerId: c.centerId, centerName: c.name, coaches: c.coaches, mode: "choose", selected: c.coaches.length === 1 ? c.coaches[0].id : "", sync: "pending" };
            note("database", "Registration recorded", "In the live form, this is when the registration is recorded in Neoserra. The appointment step opens with the coaches for the client’s center.");
            goStep(3);
          });
        }
        break;
      }
      case "back": if (S.step > 0 && S.step < 3) goStep(S.step - 1); break;
      case "edit": goStep(0); break;
      case "errorlink": {
        S.step = CC.stepOf(p.name);
        render();
        rep.focusField(p.name);
        break;
      }
      case "radioCoach": S.appt.selected = p.id; render(); break;
      case "coach": case "seeTimes": {
        const id = action === "coach" ? p.id : S.appt.selected;
        if (!id || S.busy) return;
        S.appt.selected = id;
        S.busy = id;
        render();
        later(700, () => {
          const c = S.appt.coaches.find(x => x.id === id);
          S.busy = null;
          S.appt.mode = "calendar";
          S.cal = { view: "date", date: null, time: null, month: demoMonth(), loading: true };
          render();
          note("calendar", `Coach selected: ${coachName(c)}`, "The live form saves the choice, then opens that coach’s Calendly right in the page with the client’s name and email filled in. Here, a simplified calendar stands in.");
          later(550, () => { S.cal.loading = false; render(); });
        });
        break;
      }
      case "changeCoach": S.appt.mode = "choose"; render(); break;
      case "calDate": S.cal.date = +p.v; S.cal.view = "time"; render(); break;
      case "calTime": S.cal.time = p.v; S.cal.view = "form"; render(); break;
      case "calConfirm": {
        S.appt.mode = "booked";
        S.appt.sync = "pending";
        goStep(3);
        later(1300, () => {
          S.appt.sync = "synced";
          render();
          note("clipboardCheck", "Booking noted", "Calendly confirms the booking and emails the details. The live form then notes the booking on the client’s Kentucky SBDC record. No appointment was booked in this demo.");
        });
        break;
      }
      case "retryNote": S.appt.sync = "pending"; render(); later(900, () => { S.appt.sync = "synced"; render(); }); break;
      case "again": {
        reset(true);
        note("userPlus", "New registration started", "Clears the form for the next client, which is handy when staff register a walk-in.");
        rep.focusHeading();
        break;
      }
    }
  }

  /* ---------- panel tools ---------- */
  $("#tpFill").addEventListener("click", () => {
    if (S.step === 3) reset(true);
    const keepZip = /^\d{5}(-\d{4})?$/.test(S.data.mailzip) ? S.data.mailzip : null;
    Object.assign(S.data, CC.SAMPLE, { consent: false, certified: false });
    if (keepZip) S.data.mailzip = keepZip;
    S.errors = {};
    render();
    zipNote();
    note("wand", "Sample client filled in", "Maya Brooks (fictional) is filled in on every step. The two required consent boxes are left for you to check on step 3.");
  });
  $("#tpReset").addEventListener("click", () => { reset(); rep.focusHeading(); });
  const ZIPS = [["40202", "Louisville"], ["40507", "Lexington"], ["42101", "Bowling Green"], ["41011", "Covington"], ["42001", "Paducah"], ["40701", "Corbin"], ["45202", "Cincinnati, OH"]];
  const zipBox = $("#tpZips");
  ZIPS.forEach(([z, city]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tp-zip";
    b.innerHTML = `<b>${z}</b> <span>${city}</span>`;
    b.addEventListener("click", () => {
      if (S.step === 3) reset(true);
      S.data.mailzip = z;
      if (S.step !== 0) goStep(0); else render();
      zipNote();
      rep.C.mailzip.focus();
      rep.C.mailzip.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    zipBox.appendChild(b);
  });

  reset();
}
