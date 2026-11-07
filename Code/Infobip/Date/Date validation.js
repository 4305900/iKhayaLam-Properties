const raw = String(attributeApi.get('viewing_date') || '').trim().toLowerCase()
  .replace(/[‐‑‒–—―]/g, '-')
  .replace(/\s+/g, ' ')
  .replace(/[.,!?]+$/, '')
  .replace(/^(on|by|at|for) /, '')
  .replace(/^(the )/, '');

// "Today" in South Africa
const now = new Date(Date.now() + 2 * 60 * 60 * 1000);
const todayTs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
const DAY = 24 * 60 * 60 * 1000;
const dow = new Date(todayTs).getUTCDay();   

const MONTHS = {jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,jun:6,june:6,
  jul:7,july:7,aug:8,august:8,sep:9,sept:9,september:9,oct:10,october:10,nov:11,november:11,dec:12,december:12};
const WEEKDAYS = {sunday:0,sun:0,monday:1,mon:1,tuesday:2,tue:2,tues:2,wednesday:3,wed:3,
  thursday:4,thu:4,thur:4,thurs:4,friday:5,fri:5,saturday:6,sat:6};

const fromTs = ts => { const d = new Date(ts); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; };
const isReal = (y, m, d) => {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

let target = null;   // { y, m, d }
let m;

// Phrases
if (raw === 'today') {
  target = fromTs(todayTs);
} else if (raw === 'tomorrow') {
  target = fromTs(todayTs + DAY);
} else if (raw === 'day after tomorrow') {
  target = fromTs(todayTs + 2 * DAY);
} else if (raw === 'next week') {
  // Monday of next week
  const diff = ((8 - dow) % 7) || 7;
  target = fromTs(todayTs + diff * DAY);
} else if (/end of (the )?week/.test(raw)) {
  // Friday (this week, or next Friday if the week is already over)
  const diff = (5 - dow + 7) % 7;
  target = fromTs(todayTs + diff * DAY);
} else if (/^(this )?weekend$/.test(raw)) {
  // Upcoming Saturday
  const diff = (6 - dow + 7) % 7;
  target = fromTs(todayTs + diff * DAY);
} else if ((m = raw.match(/^in (\d{1,3}) (day|days|week|weeks)$/))) {
  const n = parseInt(m[1], 10) * (m[2].startsWith('week') ? 7 : 1);
  target = fromTs(todayTs + n * DAY);
} else if ((m = raw.match(/^(next |this )?([a-z]+)$/)) && WEEKDAYS[m[2]] !== undefined) {
  // "friday", "next friday": the next occurrence after today
  let diff = (WEEKDAYS[m[2]] - dow + 7) % 7;
  if (diff === 0) diff = 7;
  target = fromTs(todayTs + diff * DAY);
}

// Typed dates 
if (!target) {
  let y, mo, d, hasYear = true;

  if ((m = raw.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/))) {
    // 2026-10-14, 2026/10/14
    y = +m[1]; mo = +m[2]; d = +m[3];
  } else if ((m = raw.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2}|\d{4})$/))) {
    // 14/10/2026, 14-10-26 (dd/mm/yyyy)
    d = +m[1]; mo = +m[2]; y = +m[3];
    if (m[3].length === 2) y += 2000;
  } else if ((m = raw.match(/^(\d{1,2})(?:st|nd|rd|th)?(?: of)? ([a-z]+)(?: (\d{4}))?$/)) && MONTHS[m[2]]) {
    // 14 October 2026, 14th of Oct, 14 october
    d = +m[1]; mo = MONTHS[m[2]];
    if (m[3]) y = +m[3]; else hasYear = false;
  } else if ((m = raw.match(/^([a-z]+) (\d{1,2})(?:st|nd|rd|th)?(?:,? (\d{4}))?$/)) && MONTHS[m[1]]) {
    // October 14, 2026, oct 14
    mo = MONTHS[m[1]]; d = +m[2];
    if (m[3]) y = +m[3]; else hasYear = false;
  }

  if (mo) {
    if (!hasYear) {
      // No year given: use this year or next year if that date has already passed
      y = now.getUTCFullYear();
      if (isReal(y, mo, d) && Date.UTC(y, mo - 1, d) < todayTs) y += 1;
    }
    if (isReal(y, mo, d)) target = { y: y, m: mo, d: d };
  }
}

// Validate and save 
const pad = n => String(n).padStart(2, '0');
let result = '';

// Reject dates in the past
if (target && Date.UTC(target.y, target.m - 1, target.d) >= todayTs) {
  // Output format
  result = target.y + '-' + pad(target.m) + '-' + pad(target.d);   // YYYY-MM-DD
}

if (result) {
  attributeApi.set('viewing_date', result);
  attributeApi.set('date_valid', 'true');
} else {
  attributeApi.set('date_valid', 'false');
}
