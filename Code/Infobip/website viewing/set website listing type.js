const type = (
    attributeApi.get('website_listing_type') || ''
).toString().trim().toLowerCase();

if (type === 'rent' || type === 'buy') {
    attributeApi.set('listing_type', type);
}
