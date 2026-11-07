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


 // NER Location
let location = firstOf(["Location", "location"]);

// Checking for location
if (!location) {
    const message = firstOf([
        "lastReceivedTextMessage",
        "user_message",
        "message"
    ]).toLowerCase();

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

// Save the location for the rental search
attributeApi.set("location", location);

attributeApi.set("property_type", firstOf(["Property_Type", "property_type"]));
attributeApi.set("bedrooms", digits(firstOf(["Bedrooms", "bedrooms"])));
attributeApi.set("bathrooms", digits(firstOf(["Bathrooms", "bathrooms"])));
attributeApi.set("max_rent", digits(firstOf(["Price", "max_rent", "price"])));


// Fallback: find a price in the raw message if NER missed it
if ((attributeApi.get("max_rent") || "").toString() === "") {
    let msg = "";
    for (const name of ["lastReceivedTextMessage", "user_message", "message"]) {
        try {
            const v = attributeApi.get(name);
            if (v !== undefined && v !== null && v.toString().trim() !== "") { msg = v.toString().toLowerCase(); break; }
        } catch (e) {}
    }
    const m = msg.match(/\$?\s?(\d{1,3}(?:[ ,]\d{3})+|\d+)\s?(k)?\b/g);
    // Take the largest number found 
    let best = 0;
    (m || []).forEach(x => {
        const n = parseFloat(x.replace(/[^0-9]/g, "")) * (/k/.test(x) ? 1000 : 1);
        if (n > best) best = n;
    });
    if (best >= 100) attributeApi.set("max_rent", String(best));
}
