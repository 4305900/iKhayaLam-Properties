function read(name) {
    try {
        const v = attributeApi.get(name);
        if (v !== undefined && v !== null) return v.toString().trim();
    } catch (e) {}
    return "";
}

// Different Price Formats
function parsePrices(text) {
    const t = text.toLowerCase().replace(/(\d)[ ,](?=\d{3}(?!\d))/g, "$1");
    const found = [];
    const re = /(\d+(?:\.\d+)?)\s?(million|m|k|mil|thousand|thou)?\b/g;
    let match;
    while ((match = re.exec(t)) !== null) {
        let n = parseFloat(match[1]);
        if (match[2] === "k") n *= 1000;
        else if (match[2] === "m" || match[2] === "million") n *= 1000000;
        found.push(n);
    }
    return found;
}

const SALE_MIN = 100000; // at or above = sale price
const RENT_MIN = 1000;   // between this and SALE_MIN = monthly rent

// User Message
let msg = "";
for (const name of ["lastReceivedTextMessage", "user_message", "message"]) {
    const v = read(name);
    if (v !== "") { msg = v; break; }
}
const lower = msg.toLowerCase();

// NER Price to static price
let price = Math.max(0, ...parsePrices(read("Price") || read("price")));
if (price < RENT_MIN) price = Math.max(0, ...parsePrices(msg));

// Determining listing type
let listingType = "";
if (/\b(rent|renting|to let|per month|pm|p\/m|monthly)\b/.test(lower)) listingType = "rent";
else if (/\b(buy|buying|purchase|for sale|bond)\b/.test(lower)) listingType = "buy";
else if (price >= SALE_MIN) listingType = "buy";
else if (price >= RENT_MIN) listingType = "rent";

attributeApi.set("listing_type", listingType);
