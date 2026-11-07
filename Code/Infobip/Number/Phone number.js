let raw = String(attributeApi.get('client_number') || '').trim();

// Normalise dash types and remove
raw = raw
  .replace(/[‐‑‒–—―]/g, '-')
  .replace(/\(0\)/g, '');

let result = '';

// Only digits, spaces, hyphens, dots, brackets and a "+" at the start are allowed
if (/^\+?[\d\s\-().]+$/.test(raw)) {
  let digits = raw.replace(/\D/g, '');   // keep digits only

  if (digits.startsWith('0027')) {
    digits = digits.slice(2);                      // 0027821234567 -> 27821234567
  } else if (digits.startsWith('0')) {
    digits = '27' + digits.slice(1);               // 0821234567 -> 27821234567
  } else if (digits.length === 9) {
    digits = '27' + digits;                        // 821234567 -> 27821234567
  }

  // South African mobile: 27 + [6, 7 or 8] + 8 more digits (11 digits total)
  if (/^27[678]\d{8}$/.test(digits)) {
    result = '+' + digits;
  }
}

if (result) {
  attributeApi.set('client_number', result);
  attributeApi.set('cell_valid', 'true');
} else {
  attributeApi.set('cell_valid', 'false');
}
