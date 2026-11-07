# iKhayaLam Properties — User Guide

**IFS325 / Use Case 6**
A practical walkthrough for property seekers and estate agents.

| | |
| --- | --- |
| **Audience** | Customers, estate agents, academic assessors |
| **Release** | Version 1.0 • 06 November 2026 |
| **Sharing** | Project documentation • Sensitive configuration intentionally excluded |

Designed for a complete handover of the completed academic prototype, with space for evidence, approved diagrams and future extensions.

---

## Contents

1. [Purpose and access](#01-purpose-and-access)
2. [Browsing properties](#02-browsing-properties)
3. [Using the Vee chatbot](#03-using-the-vee-chatbot)
4. [Requesting a viewing](#04-requesting-a-viewing)
5. [FAQs, cancellations and changes](#05-faqs-cancellations-and-changes)
6. [Staff portal access](#06-staff-portal-access)
7. [Dashboard and viewing management](#07-dashboard-and-viewing-management)
8. [Client leads and daily use](#08-client-leads-and-daily-use)
9. [Troubleshooting and privacy](#09-troubleshooting-and-privacy)
10. [Screenshots and handover inserts](#10-screenshots-and-handover-inserts)
11. [Project team and responsibilities](#project-team-and-responsibilities)

---

## 01 Purpose and access

iKhayaLam Properties is a web-based property discovery and viewing-request prototype. Visitors can browse properties available to rent or buy, use the Vee chatbot, and request a viewing. Authorised estate agents manage the resulting requests through a separate staff portal.

> **⚠️ Important distinction**
> Submitting a viewing is a **request**. The creation of an email or calendar entry does not, by itself, guarantee that an estate agent has confirmed the appointment.

### 1.1 Who uses the application?

| User | What they can do |
| --- | --- |
| Public visitor | Browse rentals and properties for sale; filter listings; view photos/details; access FAQs; open Vee and request a viewing. |
| Estate agent | Sign in through Staff Portal, review assigned viewing requests, update status/follow-up information, and view client leads. |
| System administrator | Maintain approved user access, listings, chatbot configuration and integrations through the relevant authorised consoles. |

### 1.2 What you need

- An internet-connected phone, tablet, or computer with a current browser.
- No public login is required for normal property browsing.
- Staff users need an account assigned by an administrator; never share credentials.
- Live application address (verify deployment before submission): <https://ge12da41765e3b0-ikhayalam.adb.me-jeddah-1.oraclecloudapps.com/ords/r/ikhayalam_ws/ikhayalam-properties/welcome-to-ikhayalam>

---

## 02 Browsing properties

1. **Open the website** — Choose **Home** from the left navigation to reach the main welcome page. The website offers separate options for renting and buying.
2. **Choose Rent or Buy** — Select **Rent a Property** or **Buy a Property** on the welcome page, or use the matching navigation item. The rental and purchase searches are separate.
3. **Filter the catalogue** — Use Property Type, Location, Budget/Maximum Price and Bedrooms to narrow the results. Choose **Search** to apply the selected filters. Choose **Clear Filters** to restore the default list.
4. **Open a property** — Select **View Property** beneath a card. The details page displays price in rands, address/location, bedrooms, bathrooms, description, availability, estate agent details and images when present.
5. **Check suitability** — Review the property details and photos before opening the booking chatbot. Property information reflects the prototype dataset and should be confirmed with the agent.

> **💡 Search tip**
> Use plain-language requests in the chatbot, such as "two-bedroom apartment in Bellville up to R15 000 per month." The catalogue is filtered to matching available listings; if none are found, try a different location or price range.

---

## 03 Using the Vee chatbot

The pink chat icon opens the Infobip Live Chat assistant (Vee). The chatbot is available as an assisted route for property discovery and viewing requests.

1. **Open Vee** — Select the chat icon and read the greeting. Choose a buying or renting journey, or describe the type of home you want.
2. **Describe your preferred property** — Provide a suburb, property type, approximate price and number of bedrooms/bathrooms. The chatbot interprets the request and searches the Oracle-backed catalogue.
3. **Review matching cards** — Matching property cards show images and essential details. Select a listing to carry the correct property information into the booking process.
4. **Start from a property page instead** — On a property details page, use its viewing/enquiry button. Vee should open with that specific listing as the selected property rather than requiring a fresh search.
5. **Leave or change your mind** — Use the chat close button or follow the bot's available choices. A closed chat does not cancel a viewing already submitted.

If the bot cannot find a listing or does not understand an answer, follow its retry or fallback prompts. Try a simpler phrase if the location or price is not interpreted correctly.

---

## 04 Requesting a viewing

1. **Select your property** — Choose the matching listing from the chatbot or open Vee from the correct property details page.
2. **Enter contact details** — Supply first name, surname, South African mobile number and email address when asked. Check spelling, as booking notifications rely on these details.
3. **Choose a date and time** — Supply a future date and a valid local viewing time. The configured prototype accepts one-hour appointments that start no earlier than 08:00 and finish no later than 17:00 (South African local time).
4. **Review and submit** — Confirm the chosen property, contact information and appointment details, then submit the request through the chatbot.
5. **Check notifications** — The integrated workflow records the request, creates a one-hour Google Calendar event and sends a customer email plus an agent notification when the automation succeeds.
6. **Wait for the agent** — The responsible agent can confirm, update or follow up on the viewing. Multiple people can request the same time because the prototype does not reserve exclusive slots.

> **📧 If you did not receive an email**
> Check the email address you entered and your spam/junk folder. Contact the estate agent using previously received agent details; do not repeatedly submit the same booking solely to force an email.

---

## 05 FAQs, cancellations and changes

From the navigation menu, open **FAQs & Enquiries** (Page 11). Its informational sections cover the platform, buying/renting, property viewings, confirmations, privacy, contact guidance, cancellation and rescheduling.

1. **Open a guidance section** — Select a question to expand its answer, or follow a chatbot FAQ button to the relevant part of Page 11.
2. **Request cancellation** — Find the responsible agent's contact information in the original booking-confirmation email and email the agent directly. Include your booking reference, full name, property and scheduled viewing date/time.
3. **Request rescheduling** — Email the same agent with your existing booking reference, scheduled viewing details and preferred new date/time. The agent considers the request and responds.
4. **Ask a general question** — Use Vee's FAQ/inquiry buttons to open the website's appropriate guidance section. The FAQ does not submit an enquiry form or automatically contact an agent.

> **⚠️ Changes are not automatic**
> Opening the cancellation or rescheduling FAQ, or clicking a chatbot guidance button, does **not** cancel, move or amend an appointment. Only the responsible agent processes such requests.

---

## 06 Staff portal access

1. **Select Staff Portal** — Choose **Staff Portal** in the website navigation. The application displays the staff sign-in page.
2. **Sign in** — Enter the credentials issued for your staff account. Authorised users reach the Estate Agent Dashboard; public users must not be able to access protected staff functions.
3. **Confirm the account** — Check the user indicator and verify that the displayed requests belong to your assigned properties. Contact the administrator if an account or assignment is incorrect.
4. **Sign out** — Use the application's user/session menu to sign out after working, especially on shared computers.

---

## 07 Dashboard and viewing management

The agent-specific dashboard (Page 8) summarises Rental Properties, Buying Properties, Recorded Clients and Viewing Requests, and displays a report of scheduled/requested property viewings.

1. **Read overview cards** — Check the totals for the signed-in agent. These values depend on catalogue and viewing records associated with the account and may change as new requests arrive.
2. **Locate a request** — Use the report search or sorting controls to find a client, property or booking. Review the relevant identifying fields before making changes.
3. **Open Manage Viewing** — Select the edit icon beside the correct request. Page 9 displays booking reference, listing/property data, client contact information, agent name, date/time, and status information.
4. **Update authorised fields** — Change Booking Status, Follow-up Status or Follow-up Notes where permitted; the property and client fields are used as reference details.
5. **Apply Changes** — Select **Apply Changes**, then confirm the updated record shows the intended values. The page is for managing existing requests, not creating or deleting client bookings.

> **🧾 Agent responsibility**
> Statuses and follow-up notes are administrative records. Changing them does not trigger an automatic cancellation/reschedule email to the customer unless a separately configured integration exists.

---

## 08 Client leads and daily use

Page 10 (Client Leads) displays relevant client names and contact information from chatbot viewing requests. Use the report search or filtering tools and select **Back to Dashboard** when finished.

| Daily activity | Action |
| --- | --- |
| Review new requests | Open Page 8, review viewing counts and the requests report. |
| Contact customer | Use the relevant client phone/email from the assigned booking. |
| Record follow-up | Open Page 9, update status and follow-up notes, then Apply Changes. |
| Review leads | Open Page 10 and use report search; protect customer contact data. |
| End the session | Sign out of the staff portal when finished. |

---

## 09 Troubleshooting and privacy

| Issue | What to try |
| --- | --- |
| No properties returned | Clear filters; broaden location, property type or budget; confirm the listing is available. |
| Chatbot cannot interpret my request | Use a shorter phrase with a clearly stated suburb and price; use website filters if needed. |
| No confirmation email received | Check the email entered and junk folder; contact the property agent. |
| Cannot open Staff Portal | Use the proper sign-in page; verify account access with the administrator. |
| Viewing details appear incorrect | Do not change unrelated records. Verify the booking reference and notify the responsible agent/administrator. |
| Page does not load or chat fails | Reload the browser once, check connectivity and test in a current browser. Escalate persistent integration errors. |

**Privacy:** booking details and contact information should be used only for property-viewing services and authorised follow-up. Screenshots included in academic submissions must use synthetic or appropriately anonymised customer data.

---

## 10 Screenshots and handover inserts

The following blocks can be filled with approved screenshots after the final demonstration recording has been compiled. Remove or blur any customer names, emails, phone numbers, booking IDs or session identifiers.

> **[ INSERT: HOME AND PROPERTY LISTINGS ]**
> Show the final V6 design and the rent/buy filtering screen.

> **[ INSERT: CHATBOT BOOKING SEQUENCE ]**
> Show the selected listing, contact-data validation and request acknowledgement.

> **[ INSERT: STAFF DASHBOARD AND MANAGE VIEWING ]**
> Show agent-specific cards, a redacted booking form and follow-up update.

> **[ INSERT: FAQ NAVIGATION ]**
> Show one working cancellation/reschedule/FAQ button opening Page 11.

---

## Project Team and Responsibilities

The following role assignments come from the project team's roles and responsibilities register. These are reported project responsibilities, not a claim that each member wrote every application component.

| Team member | Project role |
| --- | --- |
| Hluma Mahlasela | Project Manager / Integration Lead |
| Magedi Thokwane | Business Analyst / Research Lead |
| Munashe Machaka | Process Analyst / Tester |
| Mvelo Shange | Requirements & Quality Assurance Lead |
| Siphesihle Skosana | Systems Architect / Developer |

Individual tasks and commits should be attributed to the relevant member once the group has approved the final contribution record.

---

*IFS325 • UC6 | 06 NOV 2026*
