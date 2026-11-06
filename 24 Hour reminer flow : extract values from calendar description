const description = inputData.description || '';

// Extract the value for a line such as "Label: value", matching a label exactly (case-insensitive)
// and requiring a colon right after it so that "Property Name:" does not match "Property:".
function getValue(labels) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^\\s*${escaped}\\s*:\\s*(.*)$`, 'im');
    const match = description.match(regex);
    if (match && match[1].trim()) return match[1].trim();
  }
  return '';
}

// Booking reference: labelled value, otherwise the first token starting with "IK-MS"
let bookingReference = getValue(['Booking Reference', 'Booking Ref', 'Ref']);
if (!bookingReference) {
  const tokenMatch = description.match(/\bIK-MS[\w-]*/);
  bookingReference = tokenMatch ? tokenMatch[0] : '';
}

// Client first name: first word of the client name value
const clientName = getValue(['Client Name', 'Client', 'Name']);
const clientFirstName = clientName ? clientName.split(/\s+/)[0] : '';

// Client email: labelled value, otherwise the first email address in the text
let clientEmail = getValue(['Client Email', 'Email']);
if (!clientEmail) {
  const emailMatch = description.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  clientEmail = emailMatch ? emailMatch[0] : '';
}

// Property name: exact "Property" label followed by a colon (not "Property Name:")
const propertyName = getValue(['Property']);

// Viewing date and time
const viewingDate = getValue(['Viewing Date', 'Date']);
const viewingTime = getValue(['Viewing Time', 'Time']);

return {
  booking_reference: bookingReference,
  client_first_name: clientFirstName,
  client_email: clientEmail,
  property_name: propertyName,
  viewing_date: viewingDate,
  viewing_time: viewingTime,
};
