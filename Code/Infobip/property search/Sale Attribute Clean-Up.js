function read(name) {
    try {
        const v = attributeApi.get(name);
        if (v !== undefined && v !== null) return v.toString().trim();
    } catch (e) {}
    return "";
}

// Return the first non-empty value from a list of attribute names
function firstOf(names) {
    for (const n of names) {
        const v = read(n);
        if (v !== "") return v;
    }
    return "";
}

// Keep digits only
function digits(text) {
    return text.replace(/[^0-9]/g, "");
}

// "R1.5m", "1 500 000", "950k", "$2000000" -> list of numbers
function parsePrices(text) {
    const t = text.toLowerCase().replace(/(\d)[ ,](?=\d{3}(?!\d))/g, "$1");
    const found = [];
    const re = /(\d+(?:\.\d+)?)\s?(million|m|k)?\b/g;
    let match;
    while ((match = re.exec(t)) !== null) {
        let n = parseFloat(match[1]);
        if (match[2] === "k") n *= 1000;
        else if (match[2] === "m" || match[2] === "million") n *= 1000000;
        found.push(n);
    }
    return found;
}

const SALE_MIN = 100000; // anything below this is not treated as a sale price


 // Get the location already recognised by Infobip
let location = firstOf(["Location", "location"]);

// If no location was recognised, check the customer's message
if (!location) {
    const message = firstOf([
        "lastReceivedTextMessage",
        "user_message",
        "message"
    ]).toLowerCase();

    // Known locations
    const locations = [
        "Bellville",
        "Sea Point",
        "Durbanville",
        "Brackenfell",
        "Century City",
        "Cape Town",
        "Parow",
        "Goodwood",
        "Table View",
        "Stellenbosch",
        "Somerset West",
        "Milnerton",
        "Blouberg",
        "Hout Bay",
        "Kommetjie",
        "Cape Town CBD",
        "Waterfront",
        "Paarl",
        "Constantia",
        "Noordhoek"
    ];

    location = locations.find(area =>
        message.includes(area.toLowerCase())
    ) || "";
}

// Save location for the existing search criteria
attributeApi.set("location", location);

attributeApi.set("property_type", firstOf(["Property_Type", "property_type"]));
attributeApi.set("bedrooms", digits(firstOf(["Bedrooms", "bedrooms"])));
attributeApi.set("bathrooms", digits(firstOf(["Bathrooms", "bathrooms"])));

// Price
let price = Math.max(0, ...parsePrices(firstOf(["Price", "price", "price"])));
if (price < SALE_MIN) {
    let msg = "";
    for (const name of ["lastReceivedTextMessage", "user_message", "message"]) {
        const v = read(name);
        if (v !== "") { msg = v; break; }
    }
    price = Math.max(0, ...parsePrices(msg));
}
attributeApi.set("price", price >= SALE_MIN ? String(Math.round(price)) : "");
