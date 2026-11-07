var count = Number(attributeApi.get('resend_count')) || 0;
attributeApi.set('resend_count', count + 1);
