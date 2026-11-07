const raw = (
    attributeApi.get('website_listing_id') || ''
).toString().trim();

// ID validation
if (/^[1-9][0-9]*$/.test(raw)) {

    // Saving the selected chatbot listing ID
    attributeApi.set('selected_property_id', raw);

    // Keep compatibility with the existing booking flow
    attributeApi.set('property_id', raw);

    // Mark the identifier as valid in format
    attributeApi.set('valid_selection', 'yes');

} else {
    attributeApi.set('valid_selection', 'no');
}
