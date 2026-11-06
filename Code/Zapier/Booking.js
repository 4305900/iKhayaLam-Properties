// Read inputs with fallbacks; all values are strings
const email = (inputData.client_email || "").trim();
const propertyId = (inputData.selected_property_id || "").trim();
const date = (inputData.viewing_date || "").trim();
const time = (inputData.viewing_time || "").trim();
const submissionId = (inputData.submission_id || "").trim();

// Validation: required fields, numeric property ID, YYYY-MM-DD date, HH:MM 24-hour time
const errors = [];
if (!email) errors.push("client_email is required");
if (!/^\d+$/.test(propertyId)) errors.push("selected_property_id must be numeric");
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push("viewing_date must be YYYY-MM-DD");
if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) errors.push("viewing_time must be HH:MM (24-hour)");

if (errors.length > 0) {
  throw new Error(errors.join("; "));
}

// Use submission_id when present, otherwise fall back to the combined fields
const fingerprint = submissionId
  ? submissionId
  : `${email}|${propertyId}|${date}|${time}`;

// SHA-256 hash, first 32 hex characters, prefixed with "IK-"
const digest = await crypto.subtle.digest(
  "SHA-256",
  new TextEncoder().encode(fingerprint)
);
const hex = Array.from(new Uint8Array(digest))
  .map((b) => b.toString(16).padStart(2, "0"))
  .join("");
const request_key = `IK-${hex.slice(0, 32)}`;

return { request_key };
