const hasAnything = ['location', 'property_type', 'bedrooms','price']
    .some(n => (attributeApi.get(n) || '').toString() !== '');
attributeApi.set('has_criteria', hasAnything ? 'yes' : 'no');
attributeApi.set('has_location', (attributeApi.get('location') || '').toString().trim() !== '' ? 'yes' : 'no');
