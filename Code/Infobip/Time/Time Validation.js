let raw = String(attributeApi.get('viewing_time') || '').trim().toLowerCase()
  .replace(/[‐‑‒–—―]/g, '-')
  .replace(/\b([ap])\.\s?m\.?/g, '$1m')     
  .replace(/\s+/g, ' ')
  .replace(/[.,!?]+$/, '')
  .replace(/^(at|around|about|by|from|@) ?/, '')
  .trim();

let h = null, min = null, ap = null, is24 = false, m;

// Words
if (raw === 'noon' || raw === 'midday') {
  h = 12; min = 0; is24 = true;
} else if (raw === 'midnight') {
  h = 0; min = 0; is24 = true;

// Numeric formats
} else if ((m = raw.match(/^(\d{1,2})[:.](\d{2}) ?(am|pm)?$/))) {
  
  h = +m[1]; min = +m[2]; ap = m[3] || null;
  is24 = m[1].length === 2;
} else if ((m = raw.match(/^(\d{1,2})h(\d{2})?$/))) {
  // 15h30, 15h, 9h30 
  h = +m[1]; min = m[2] ? +m[2] : 0; is24 = true;
} else if ((m = raw.match(/^(\d{1,2}) ?(am|pm)$/))) {
  // 3pm, 3 pm, 11am
  h = +m[1]; min = 0; ap = m[2];
} else if ((m = raw.match(/^(\d{2})(\d{2})$/))) {
  // 1530, 0900
  h = +m[1]; min = +m[2]; is24 = true;
} else if ((m = raw.match(/^(\d{2})$/))) {
  // 15, 09 (two-digit hour only)
  h = +m[1]; min = 0; is24 = true;
}

// Validate and convert
let result = '';

if (h !== null && min >= 0 && min <= 59) {
  if (ap) {
    // 12-hour clock: hour must be 1-12
    if (h >= 1 && h <= 12) {
      if (ap === 'am') h = (h === 12) ? 0 : h;
      else h = (h === 12) ? 12 : h + 12;
      result = String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
    }
  } else if (is24 && h >= 0 && h <= 23) {
    // 24-hour clock
    result = String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
  }
 
}

// One-hour range
const DURATION_MINUTES = 60;

const pad = n => String(n).padStart(2, '0');
const fmt = ts => {
  const d = new Date(ts);
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) +
    ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':00';   // YYYY-MM-DD HH:MM:SS
};

let ok = false;
let error = result ? '' : 'format';      // 'format' = time not understood

const OPEN_MIN  = 8 * 60;     // 08:00, earliest start
const CLOSE_MIN = 17 * 60;    // 17:00, viewing must finish by then

if (result) {
  const date = String(attributeApi.get('viewing_date') || '').trim();   // YYYY-MM-DD from the date step
  const dm = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const tm = result.match(/^(\d{2}):(\d{2})$/);

  if (dm && tm) {
    const startMin = +tm[1] * 60 + +tm[2];

    if (startMin < OPEN_MIN || startMin + DURATION_MINUTES > CLOSE_MIN) {
      error = 'hours';                   // outside 08:00-17:00
    } else {
      // Current time in South Africa 
      const nowSA = Date.now() + 2 * 60 * 60 * 1000;
      const startTs = Date.UTC(+dm[1], +dm[2] - 1, +dm[3], +tm[1], +tm[2]);
      const endTs = startTs + DURATION_MINUTES * 60 * 1000;

      if (startTs > nowSA) {
        const start = fmt(startTs);
        const end = fmt(endTs);

        attributeApi.set('viewing_time', result);
        attributeApi.set('viewing_start', start);
        attributeApi.set('viewing_end', end);
        attributeApi.set('viewing_start_iso', start.replace(' ', 'T') + '+02:00');
        attributeApi.set('viewing_end_iso', end.replace(' ', 'T') + '+02:00');

        // Time only (HH:MM)
        attributeApi.set('viewing_start_time', start.slice(11, 16));
        attributeApi.set('viewing_end_time', end.slice(11, 16));

        ok = true;
      } else {
        error = 'past';                  // time understood, but already passed
      }
    }
  } else {
    error = 'date';                      // viewing_date is missing or malformed
  }
}

attributeApi.set('time_valid', ok ? 'true' : 'false');
attributeApi.set('time_error', ok ? '' : error);attributeApi.set('time_valid', ok ? 'true' : 'false');
attributeApi.set('time_error', ok ? '' : error);
