"use strict";
/* =====================================================================
   Coach Connect data and rules, ported from the live form
   (register.kentuckysbdc.com, captured 2026-11-19). The tour and the
   try-it sandbox both use these, so the demo routes ZIP codes, lists
   coaches, and validates answers exactly the way the real form does.
   ZIP table and agreement text: assets/live-form-data.json (LIVE).
   ===================================================================== */
const CC = (() => {
  const coach = (id, name, detail) => ({ id, name, detail });
  const andrea = coach("507", "Andrea Taylor");

  const CENTERS = {
    22: { name: "Berea SBDC", coaches: [coach("516", "Katie Startzman")] },
    23: { name: "Covington SBDC", coaches: [coach("502", "April Coffee")] },
    17: { name: "Eastern Kentucky SBDC", coaches: [andrea] },
    5: { name: "Elizabethtown SBDC", coaches: [coach("3", "Patricia Krausman")] },
    24: { name: "Frankfort SBDC", coaches: [coach("155", "Toni Sears")] },
    8: {
      name: "Lexington SBDC",
      coaches: [
        coach("330", "Fausto Sarmiento"), coach("451", "Stuart Arnold"), coach("463", "Tonya Parsons"),
        { ...andrea, id: "first-available", name: "First available coach", detail: "Schedule with Andrea Taylor at Eastern Kentucky SBDC." },
      ],
    },
    11: {
      name: "Louisville SBDC",
      coaches: [
        coach("314", "Dave Oetken", "Business planning, funding, financial projections and growth."),
        coach("465", "Rhonda Jones", "Business launches, SBA loans, risk management and growth."),
        coach("489", "Claire Bridges", "Business plans, financing, cash flow, restaurants and catering."),
      ],
    },
    25: { name: "Maysville SBDC", coaches: [coach("235", "Mike Jackson")] },
    7: { name: "Owensboro SBDC", coaches: [coach("555", "Meagan Cooley")] },
    19: { name: "Paducah SBDC", coaches: [coach("467", "Aaron Harned")] },
    6: { name: "South Central SBDC", coaches: [coach("496", "Brittanie Dawson")] },
    15: {
      name: "Southeastern Kentucky SBDC",
      coaches: [
        coach("450", "Rodney Kuhl", "Serving Clay, Jackson, Knox, Laurel, McCreary, Pulaski, Rockcastle, Wayne and Whitley counties."),
        coach("498", "Kyle Mann", "Serving Adair, Boyle, Casey, Clinton, Cumberland, Garrard, Lincoln, Pulaski and Russell counties."),
      ],
    },
  };

  /* Photo cards (Louisville and Lexington) */
  const PROFILES = {
    314: { photo: "dave-oetken", specialties: ["Write a business plan", "Register a new business", "Get SBA 7a & 504 loans", "Find startup funding", "Get growth funding", "Find a line of credit", "Buy a business", "Scale up your business", "Improve cash flow", "Financial projections", "Refinance your existing debt"] },
    465: { photo: "rhonda-jones", specialties: ["Growing your business", "Risk management", "SBA loans", "Business plans", "Financial projections", "Launching your new business", "Finding startup funding"] },
    489: { photo: "claire-bridges", specialties: ["Business plans", "Find financing for your startup or existing business", "SBA loans", "Improving cash flow", "Restaurant & catering operations", "Launch a new business"] },
    330: { photo: "fausto-sarmiento" },
    451: { photo: "stuart-arnold" },
    463: { photo: "tonya-parsons" },
  };

  const ZIP = new Map();
  for (const [id, zips] of LIVE.zipsByCenter) for (const z of zips) if (!ZIP.has(z)) ZIP.set(z, id);

  /** Center serving a ZIP, or the Eastern Kentucky intake team when the ZIP isn't mapped. */
  function center(zip) {
    const z = String(zip).trim().slice(0, 5);
    if (!/^\d{5}$/.test(z)) return null;
    const id = ZIP.get(z);
    const cid = id ?? "17";
    return { centerId: cid, ...CENTERS[cid], fallback: !id };
  }

  const STEP_OF = {
    first: 0, last: 0, email: 0, phone: 0, mailaddr: 0, mailcity: 0, mailst: 0, mailzip: 0,
    statusInit: 1, company: 1, estab: 1, ftEmps: 1, ptEmps: 1, product: 1, help: 1,
    gender: 1, ethnic: 1, hispanic: 1, veteran: 1, reservist: 1, handicapped: 1,
    consent: 2, certified: 2, signature: 2,
  };
  const stepOf = k => (k in STEP_OF ? STEP_OF[k] : 0);
  const firstErrorStep = errs => Math.min(...Object.keys(errs).map(stepOf), 2);

  const DEMOGRAPHICS = {
    gender: { label: "Sex", options: [["F", "Female"], ["M", "Male"]] },
    ethnic: {
      label: "Race",
      options: [["11", "Alaska Native"], ["2", "Asian"], ["3", "Black or African American"], ["12", "Middle Eastern"], ["1", "Native American"], ["4", "Native Hawaiian or Pacific Islander"], ["13", "North African"], ["5", "White/Caucasian"], ["NR", "Prefer not to say"]],
    },
    hispanic: { label: "Hispanic origin", options: [["Y", "Hispanic, Latino, or Spanish origin"], ["N", "Not of Hispanic, Latino, or Spanish origin"], ["R", "Prefer not to say"]] },
    veteran: { label: "Veteran status", options: [["NA", "Non-veteran"], ["VE", "Veteran"], ["DS", "Service-Disabled Veteran"], ["NR", "Prefer not to say"]] },
    reservist: {
      label: "Military status",
      options: [["A", "Active Duty"], ["SP", "Military Spouse"], ["G", "National Guard"], ["GA", "National Guard - Active Duty"], ["NA", "None"], ["R", "Reservist"], ["RA", "Reservist - Active Duty"], ["NR", "Prefer not to say"]],
    },
    handicapped: { label: "Disability status", options: [["N", "No"], ["Y", "Yes"], ["R", "Prefer not to say"]] },
  };

  const STATES = "AL AK AS AZ AR CA CO CT DE DC FM FL GA GU HI ID IL IN IA KS KY LA ME MH MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND MP OH OK OR PW PA PR RI SC SD TN TX UT VT VA VI WA WV WI WY AA AE AP".split(" ");
  const stateLabel = s => (s === "KY" ? "Kentucky" : s === "IN" ? "Indiana" : s);

  const EMPTY = {
    first: "", last: "", email: "", phone: "", mailaddr: "", mailcity: "", mailst: "KY", mailzip: "",
    statusInit: "", company: "", estab: "", ftEmps: "", ptEmps: "", product: "", help: "",
    gender: "", ethnic: "", hispanic: "", veteran: "", reservist: "", handicapped: "",
    signature: "", consent: false, certified: false, sba: false,
  };

  const LABELS = {
    first: "First name", last: "Last name", email: "Email address", phone: "Phone number",
    mailaddr: "Street address", mailcity: "City", mailst: "State", mailzip: "ZIP code",
    help: "How we can help", company: "Business name", estab: "Date established",
    product: "Products or services", ftEmps: "Full-time employees", ptEmps: "Part-time employees",
  };
  const EMP_RULE = "An operating business needs at least one full-time or part-time employee. Review both employee counts.";

  /** Same checks and messages as the live form. `step` limits checks to one step. */
  function validate(input, step) {
    const r = { ...EMPTY }, e = {};
    for (const k of Object.keys(r)) {
      if (typeof r[k] === "boolean") r[k] = input[k] === true;
      else r[k] = typeof input[k] === "string" ? input[k].trim() : "";
    }
    for (const [k, v] of Object.entries(r)) {
      const max = ["help", "product"].includes(k) ? 4000 : 320;
      if (typeof v === "string" && v.length > max) e[k] = `Shorten this answer to ${max} characters or fewer.`;
    }
    const on = s => step === undefined || step === s;
    if (on(0)) {
      for (const k of ["first", "last", "email", "phone", "mailaddr", "mailcity", "mailst", "mailzip"]) if (!r[k]) e[k] = `${LABELS[k]} is required.`;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) e.email = "Enter a valid email address.";
      const d = r.phone.replace(/\D/g, "");
      if (!(d.length === 10 || (d.length === 11 && d.startsWith("1")))) e.phone = "Enter a 10-digit US phone number.";
      if (!/^\d{5}(-\d{4})?$/.test(r.mailzip)) e.mailzip = "Enter a five-digit ZIP code or ZIP+4.";
      if (!STATES.includes(r.mailst)) e.mailst = "Select a valid state.";
    }
    if (on(1)) {
      if (!["B", "P"].includes(r.statusInit)) e.statusInit = "Choose whether you are in business or starting a business.";
      if (!r.help) e.help = "Tell us about your business idea and how we can help.";
      if (r.statusInit === "B") {
        for (const k of ["company", "estab", "product", "ftEmps", "ptEmps"]) if (!r[k]) e[k] = `${LABELS[k]} is required.`;
        const today = new Date().toISOString().slice(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(r.estab) || !Number.isFinite(Date.parse(r.estab)) ||
            new Date(r.estab).toISOString().slice(0, 10) !== r.estab || r.estab > today) e.estab = "Enter a valid date on or before today.";
        for (const k of ["ftEmps", "ptEmps"]) if (!/^\d{1,7}$/.test(r[k])) e[k] = "Enter a whole number from 0 to 9,999,999.";
        if (!e.ftEmps && !e.ptEmps && Number(r.ftEmps) + Number(r.ptEmps) === 0) e.ftEmps = EMP_RULE;
      }
      for (const [k, { label, options }] of Object.entries(DEMOGRAPHICS)) {
        if (!options.some(([v]) => v === r[k])) e[k] = k === "gender" ? "Select Male or Female for Sex." : `Choose an option for ${label.toLowerCase()}, or select “Prefer not to say.”`;
      }
    }
    if (on(2)) {
      if (!r.consent) e.consent = "Read the client agreement, then check its agreement box if you agree.";
      if (!r.certified) e.certified = "Read the certification, then check its box if every statement is true for you. If you cannot certify, call 1-888-414-7232 for help.";
      const norm = s => s.toLocaleLowerCase().replace(/\s+/g, " ");
      if (!r.signature) e.signature = "Type your full name to sign.";
      else if (norm(r.signature) !== norm(`${r.first} ${r.last}`)) e.signature = "Your signature must match the first and last name you entered.";
    }
    r.email = r.email.toLowerCase();
    return { data: r, errors: e };
  }

  const STEPS = ["Your details", "Your business", "Review & consent", "Your appointment"];
  const HEADINGS = ["Let’s get to know you.", "Tell us about your business.", "Review your registration."];
  const LEDES = [
    "Start with your contact information. Fields marked * are required.",
    "Whether you’re starting or growing, tell us where you are and what you need.",
    "Check your details, read the client agreement, and sign to request coaching.",
  ];

  /* The fictional client used in the tour and the "fill sample client" button. */
  const SAMPLE = {
    first: "Maya", last: "Brooks", email: "maya@example.com", phone: "(502) 555-0142",
    mailaddr: "123 Main Street", mailcity: "Louisville", mailst: "KY", mailzip: "40202",
    statusInit: "B", company: "Brooks Street Kitchen", estab: "2023-04-03", ftEmps: "2", ptEmps: "3",
    product: "Catering and weekly meal prep",
    help: "We want to open a storefront and need help with financing and a cash flow plan.",
    gender: "F", ethnic: "NR", hispanic: "R", veteran: "NA", reservist: "NA", handicapped: "N",
    signature: "Maya Brooks", consent: true, certified: true, sba: false,
  };

  return {
    CENTERS, PROFILES, center, stepOf, firstErrorStep, DEMOGRAPHICS, STATES, stateLabel,
    EMPTY, LABELS, validate, STEPS, HEADINGS, LEDES, SAMPLE,
    AGREEMENT: LIVE.agreement, CERTIFICATION: LIVE.certification,
    PHONE: "1-888-414-7232",
  };
})();
