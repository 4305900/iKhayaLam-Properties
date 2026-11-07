const raw = (attributeApi.get('client_lname') || '').trim();

// Remove extra words
let text = raw
  .replace(/^(my\s+(sur|last|family)\s*name\s+is|my\s+(sur|last|family)\s*name's|my\s+(sur|last|family)\s*name|(sur|last|family)\s*name\s+is|(sur|last|family)\s*name|it's|its|i\s+am|i'm|im|this\s+is)\s+/i, '')
  .replace(/[.,!?]+$/, '')   
  .trim();

// Normalise curly apostrophes 
text = text
  .replace(/[’‘]/g, "'")
  .replace(/[‐‑‒–—―]/g, "-")
  .replace(/\s+/g, " ");      

// Letters, ' or - only
// Single spaces allowed BETWEEN words (e.g. "van der Merwe")
const letters = "A-Za-zÀ-ÖØ-öø-ÿ";
const word = "[" + letters + "]+(?:['-][" + letters + "]+)*";
const validSurname = new RegExp("^" + word + "(?: " + word + ")*$");

let surname = text;

// Reject if invalid or if too long to be a surname (more than 5 words)
if (!validSurname.test(surname) || surname.split(" ").length > 5) {
  surname = '';
}

attributeApi.set('client_lname', surname);
attributeApi.set('lname_valid', surname ? 'true' : 'false');
