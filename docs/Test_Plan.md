# Acceptance Test Plan

The team reports successful manual end-to-end tests. Mark each item with fresh assessor evidence where needed; these are not claims that every test was independently rerun during packaging.

| ID | Scenario | Expected result |
|---|---|---|
| T01 | Open public welcome page | Welcome text, readable buy/rent controls and chat launcher. |
| T02 | Search rental filters | Correct matching RENT cards and property images. |
| T03 | Search buying filters | Correct BUY results and correct location, including Noordhoek sample where configured. |
| T04 | Open rental/buying detail | Correct selected record, price, description and gallery. |
| T05 | Start viewing from a property card | Correct property/listing context reaches Vee. |
| T06 | Vee natural-language query | Property type/location/price search criteria applied. |
| T07 | Vee booking form | Validate first name, surname, SA phone, email, date and time. |
| T08 | Time boundaries | A valid viewing lasts 60 minutes; permitted daytime range is enforced by chatbot logic. |
| T09 | Complete synthetic booking | Oracle record, unique reference, Calendar event and two notification paths. |
| T10 | Retry same booking | Duplicate prevention via request_key. |
| T11 | Agent access | Only assigned requests visible; unauthorised staff access blocked. |
| T12 | Manage Viewing | Booking status/follow-up changes persist; no uncontrolled changes to owner. |
| T13 | Client leads report | Assigned contacts appear in Page 10, with search/filter. |
| T14 | FAQ buttons | Cancel, reschedule and enquiry buttons navigate to Page 11 information. |
| T15 | Online cancellation/rescheduling | Not offered; customer directed to responsible agent by email. |
| T16 | Slot conflict | Multiple same-time requests may exist; no exclusive lock is claimed. |
| T17 | Responsive/accessibility | Keyboard/focus, readable buttons, different screen sizes; record results. |
| T18 | Confidentiality | Screenshots show no real client details; public repository has no keys. |

## Evidence to capture

Capture synthetic booking response with secrets hidden; Zapier task status; example Google Calendar entry (synthetic); redacted customer/agent email notifications; APEX Page 8/9/10 controls; FAQ section navigation. Never commit real names, phone numbers, email addresses, live access tokens or private webhook addresses.
