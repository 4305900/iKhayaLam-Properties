const raw = (attributeApi.get('client_fname') || '').trim();

// Remove potential greetings
let text = raw
  .replace(/^(hi|hello|hey)[,!\s]*/i, '')
  .replace(/^(my\s+name\s+is|my\s+name's|my\s+name|i\s+am|i'm|im|it's|its|this\s+is|call\s+me|name\s+is)\s+/i, '')
  .replace(/[.,!?]+$/, '')   
  .trim();

const words = text.split(/\s+/).filter(Boolean);


let name = (words.length > 0 && words.length <= 3) ? words[0] : '';

// Normalise curly apostrophes to straight ones
name = name.replace(/[’‘]/g, "'");

// Letters, ' and - only
const letters = "A-Za-zÀ-ÖØ-öø-ÿ";
const validName = new RegExp("^[" + letters + "]+(?:['-][" + letters + "]+)*$");

// Symbols, digits, or bad hyphen/apostrophe placement
if (!validName.test(name)) {
  name = '';   
}

// Capitalise the first letter only
if (name) name = name.charAt(0).toUpperCase() + name.slice(1);

attributeApi.set('client_fname', name);
attributeApi.set('fname_valid', name ? 'true' : 'false');
