# Infobip Vee chatbot — documented flow and validation

The conversation is configured in Infobip Answers and embedded in Oracle APEX. This document records the architecture observed in the team's screenshots and code excerpts; it is **not** an importable Infobip bot export.

## Property search and booking

1. A **Greeting** receives a property-search phrase or a website-originated `BOOK_VIEWING` selection.
2. **Website Viewing** validates a selected chatbot listing identifier and routes to the selected-listing lookup and the booking journey.
3. **Property Search** determines RENT vs BUY, extracts location / type / bedroom and bathroom counts / budget, and calls the corresponding private read service.
4. A database-backed **rent or buy carousel** offers each listed property for selection; the identifier is passed to the next dialog.
5. **Booking 1** / **First Name** / **Last Name** / **Number** / **Email** / **Confirm Details** / **Date** / **Time** collect booking information.
6. **Booking 2** sends the completed request to the separately configured Zapier automation and receives an acknowledgement; customer and estate agent receive notifications through the workflow.
7. Resend/confirmation logic helps avoid duplicate user-facing email sends. The Oracle booking POST additionally uses a request key for safe replay.

## Validation examples taken from the shared implementation

- Names allow alphabetic names with supported hyphens/apostrophes; surnames may contain spaces.
- Mobile numbers are normalised to South African E.164 (`+27…`) and checked for a valid 11-digit country-code/mobile structure.
- Dates may be supplied in natural language or DD/MM/YYYY and are normalised to `YYYY-MM-DD`.
- Times are converted to 24-hour format; viewing duration is **60 minutes**. The supplied time-validation code restricts starts to **08:00–16:00** so the appointment finishes by **17:00**, and rejects past date/times. These are chatbot constraints, not evidence that a slot is exclusively available.
- Extracted user phrases are cleaned before searching; a missing suburb or budget may reduce results.

## FAQ / enquiries / cancellation / rescheduling

The final accepted design is **informational**. Vee's FAQ-related **buttons** navigate directly to the appropriate sections of the APEX Page 11 FAQs & Enquiries page. Customers who need cancellation or rescheduling **email the responsible estate agent using the agent contact information in their booking confirmation**. There is no self-service cancel/reschedule update, automatic enquiry submission, or browser polling listener in the final FAQ journey.

## What is not committed publicly

This repository intentionally excludes webhook addresses, authenticated provider requests, provider API keys, Infobip workspace export and live visitor attributes. Configure these inside the authorised application consoles. An assessor-only endpoint inventory is distributed outside GitHub.
