let count = 0;

try {
    const results = attributeApi.get('search_results');

    if (Array.isArray(results)) {
        count = results.length;
    } else if (results !== undefined && results !== null) {
        const text = results.toString().trim();
        if (text !== "" && text !== "[]") {
            try {
                const parsed = JSON.parse(text);
                count = Array.isArray(parsed) ? parsed.length : 1;
            } catch (e) {
                count = 1;
            }
        }
    }
} catch (e) {
    count = 0;
}

attributeApi.set('has_results', count > 0 ? 'yes' : 'no');
