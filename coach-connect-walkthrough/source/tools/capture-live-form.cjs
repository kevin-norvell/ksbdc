// Capture reference screenshots of every Coach Connect screen WITHOUT creating any records.
//   node source/tools/capture-live-form.cjs <outDir>
// Every /api call is answered locally inside the headless browser, non-GET requests to the
// live host are blocked, and Calendly is mocked. Only static page assets are fetched.
// The data typed in is the fictional sample client. Needs network access to register.kentuckysbdc.com.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'https://register.kentuckysbdc.com/';

const CENTERS = {
  '11': { name: 'Louisville SBDC', coaches: [
    { id: '314', name: 'Dave Oetken', detail: 'Business planning, funding, financial projections and growth.' },
    { id: '465', name: 'Rhonda Jones', detail: 'Business launches, SBA loans, risk management and growth.' },
    { id: '489', name: 'Claire Bridges', detail: 'Business plans, financing, cash flow, restaurants and catering.' }] },
  '8': { name: 'Lexington SBDC', coaches: [
    { id: '330', name: 'Fausto Sarmiento' }, { id: '451', name: 'Stuart Arnold' }, { id: '463', name: 'Tonya Parsons' },
    { id: 'first-available', name: 'First available coach', detail: 'Schedule with Andrea Taylor at Eastern Kentucky SBDC.' }] },
  '6': { name: 'South Central SBDC', coaches: [{ id: '496', name: 'Brittanie Dawson' }] },
  '15': { name: 'Southeastern Kentucky SBDC', coaches: [
    { id: '450', name: 'Rodney Kuhl', detail: 'Serving Clay, Jackson, Knox, Laurel, McCreary, Pulaski, Rockcastle, Wayne and Whitley counties.' },
    { id: '498', name: 'Kyle Mann', detail: 'Serving Adair, Boyle, Casey, Clinton, Cumberland, Garrard, Lincoln, Pulaski and Russell counties.' }] },
};

const MOCK_WIDGET = `window.Calendly={initInlineWidget:function(o){var f=document.createElement('iframe');f.src=o.url;f.style.width='100%';f.style.height='640px';f.style.border='0';o.parentElement.appendChild(f);}};`;
const MOCK_CAL = `<!doctype html><html><body style="font-family:sans-serif;margin:0;padding:24px;background:#fff">
<h3 style="margin:0 0 12px">MOCK SCHEDULER (local screenshot only)</h3><p>Pick a time</p>
<button id="t" style="padding:12px 20px">10:00am</button>
<script>parent.postMessage({event:'calendly.page_height',payload:{height:'640'}},'*');
parent.postMessage({event:'calendly.event_type_viewed'},'*');
document.getElementById('t').onclick=function(){parent.postMessage({event:'calendly.event_scheduled',payload:{invitee:{uri:'https://api.calendly.com/scheduled_events/MOCK/invitees/MOCK'}}},'*');};</script></body></html>`;

const log = [];
async function setup(context, scenario) {
  await context.route('**/*', async (route) => {
    const req = route.request();
    const u = new URL(req.url());
    const method = req.method();
    if (u.hostname === 'register.kentuckysbdc.com') {
      if (u.pathname.startsWith('/api/')) {
        log.push(`${scenario.name}: ${method} ${u.pathname} (answered locally)`);
        const json = (obj, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(obj) });
        if (u.pathname === '/api/registration' && method === 'GET') {
          return json({ configuration: { ready: true, mode: 'live', backupEnabled: false }, registration: scenario.registration || null });
        }
        if (u.pathname === '/api/registration' && method === 'POST') {
          const c = CENTERS[scenario.center];
          return json({ registration: { status: 'complete', centerId: scenario.center, centerName: c.name, coaches: c.coaches, selectedCoachId: null, calendarUrl: null } });
        }
        if (u.pathname === '/api/coach') return json({ calendarUrl: 'https://calendly.com/mock-coach/initial-coaching-session' });
        if (u.pathname === '/api/booking') return json({ synced: true });
        if (u.pathname.startsWith('/api/intake')) return json({ ok: true });
        return json({ message: 'mock' }, 404);
      }
      if (method !== 'GET') { log.push(`BLOCKED ${method} ${u.href}`); return route.abort(); }
      return route.continue();
    }
    if (u.hostname === 'assets.calendly.com') return route.fulfill({ status: 200, contentType: 'text/javascript', body: MOCK_WIDGET });
    if (u.hostname === 'calendly.com') return route.fulfill({ status: 200, contentType: 'text/html', body: MOCK_CAL });
    log.push(`aborted external ${u.hostname}${u.pathname}`);
    return route.abort();
  });
}

async function shot(page, name, full = true) {
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: full });
}

async function pick(page, triggerSel, optionText) {
  await page.click(triggerSel);
  await page.getByRole('option', { name: optionText, exact: true }).click();
}

async function fillStep1(page, zip, city) {
  await page.fill('#first', 'Maya');
  await page.fill('#last', 'Brooks');
  await page.fill('#email', 'maya@example.com');
  await page.fill('#phone', '(502) 555-0142');
  await page.fill('#mailaddr', '123 Main Street');
  await page.fill('#mailcity', city);
  await page.fill('#mailzip', zip);
}

async function fillStep2(page) {
  await page.locator('label.choice-card', { hasText: 'Already in business' }).click();
  await page.fill('#company', 'Brooks Street Kitchen');
  await page.fill('#estab', '2023-04-03');
  await page.fill('#ftEmps', '2');
  await page.fill('#ptEmps', '3');
  await page.fill('#product', 'Catering and weekly meal prep');
  await page.fill('#help', 'We want to open a storefront and need help with financing and a cash flow plan.');
  await pick(page, '#gender', 'Female');
  await pick(page, '#ethnic', 'Prefer not to say');
  await pick(page, '#hispanic', 'Prefer not to say');
  await pick(page, '#veteran', 'Non-veteran');
  await pick(page, '#reservist', 'None');
  await pick(page, '#handicapped', 'No');
}

(async () => {
  const browser = await chromium.launch();
  const mk = async (scenario, viewport = { width: 1440, height: 900 }) => {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    await setup(context, scenario);
    const page = await context.newPage();
    page.on('console', (m) => { if (m.type() === 'error') log.push(`${scenario.name} console: ${m.text()}`); });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    return { context, page };
  };

  // Main Louisville run
  {
    const { context, page } = await mk({ name: 'louisville', center: '11' });
    await shot(page, '01-step1-empty');
    await shot(page, '01-step1-empty-viewport', false);
    await page.click('button[type=submit]');
    await shot(page, '02-step1-errors');
    await page.reload({ waitUntil: 'networkidle' });
    await fillStep1(page, '40202', 'Louisville');
    await shot(page, '03-step1-filled');
    await page.click('button[type=submit]');
    await page.waitForSelector('text=Tell us about your business.');
    await shot(page, '04-step2-empty');
    await fillStep2(page);
    await shot(page, '05-step2-filled');
    await page.click('button[type=submit]');
    await page.waitForSelector('text=Review your registration.');
    await shot(page, '06-step3-review');
    await page.locator('label.check-row', { hasText: 'I have read and agree' }).locator('[role=checkbox]').click();
    await page.locator('label.check-row', { hasText: 'I certify that I am NOT suspended' }).locator('[role=checkbox]').click();
    await page.fill('#signature', 'Maya Brooks');
    await shot(page, '07-step3-signed');
    await page.click('button[type=submit]');
    await page.waitForSelector('text=Make time for your business.');
    await shot(page, '08-step4-louisville');
    await shot(page, '08-step4-louisville-viewport', false);
    await page.getByRole('button', { name: 'Schedule with Claire Bridges' }).click();
    await page.waitForTimeout(1500);
    await shot(page, '09-step4-calendar');
    const frame = page.frameLocator('.calendar iframe');
    await frame.locator('#t').click();
    await page.waitForSelector('text=You’re on the calendar.');
    await page.waitForTimeout(800);
    await shot(page, '10-step4-booked');
    await context.close();
  }
  // Signature mismatch + validation on step 2/3
  {
    const { context, page } = await mk({ name: 'errors', center: '11' });
    await fillStep1(page, '40202', 'Louisville');
    await page.click('button[type=submit]');
    await page.waitForSelector('text=Tell us about your business.');
    await page.locator('label.choice-card', { hasText: 'Already in business' }).click();
    await page.fill('#ftEmps', '0');
    await page.fill('#ptEmps', '0');
    await page.click('button[type=submit]');
    await shot(page, '11-step2-errors');
    await context.close();
  }
  // Lexington picker
  {
    const { context, page } = await mk({ name: 'lexington', center: '8', registration: { status: 'complete', centerId: '8', centerName: 'Lexington SBDC', coaches: CENTERS['8'].coaches, selectedCoachId: null, calendarUrl: null } });
    await shot(page, '12-step4-lexington');
    await context.close();
  }
  // South Central single coach
  {
    const { context, page } = await mk({ name: 'southcentral', center: '6', registration: { status: 'complete', centerId: '6', centerName: 'South Central SBDC', coaches: CENTERS['6'].coaches, selectedCoachId: null, calendarUrl: null } });
    await shot(page, '13-step4-southcentral');
    await context.close();
  }
  // Southeastern two coaches
  {
    const { context, page } = await mk({ name: 'southeastern', center: '15', registration: { status: 'complete', centerId: '15', centerName: 'Southeastern Kentucky SBDC', coaches: CENTERS['15'].coaches, selectedCoachId: null, calendarUrl: null } });
    await shot(page, '14-step4-southeastern');
    await context.close();
  }
  // Fallback ZIP (outside map) + mobile
  {
    const { context, page } = await mk({ name: 'fallback', center: '17' });
    await fillStep1(page, '45202', 'Cincinnati');
    await shot(page, '15-step1-fallback-zip', false);
    await context.close();
  }
  {
    const { context, page } = await mk({ name: 'mobile', center: '11' }, { width: 390, height: 844 });
    await shot(page, '16-mobile-step1');
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'request-log.txt'), log.join('\n') + '\n');
  console.log(log.join('\n'));
})().catch((e) => { console.error(e); fs.writeFileSync(path.join(OUT, 'request-log.txt'), log.join('\n') + '\nERROR ' + e.stack); process.exit(1); });
