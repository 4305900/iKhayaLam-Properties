const message = (
    attributeApi.get('lastReceivedTextMessage') || ''
).toString().trim();

const match = /^BOOK_VIEWING:([1-9][0-9]*)$/i.exec(message);

if (match) {
    attributeApi.set('website_listing_id', match[1]);
    attributeApi.set('website_entry', 'yes');
} else {
    attributeApi.set('website_entry', 'no');
}
