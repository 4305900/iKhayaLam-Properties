const raw = (attributeApi.get('selected_property_id') || '').toString().trim();

if (/^[0-9]+$/.test(raw)) {
    attributeApi.set('property_id', raw);
    attributeApi.set('valid_selection', 'yes');
    
} else {
    attributeApi.set('valid_selection', 'no');
}
