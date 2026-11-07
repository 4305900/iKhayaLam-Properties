# Architecture and Data Flow

## Implementation summary

The front end is Oracle APEX Application 103, which reads the original rental/property and buying/property tables. A separate `CHATBOT_LISTINGS` data layer supports uniform rental and buying searches in Infobip. The chatbot retrieves selected listing context before collecting customer details and preferred viewing time. The booking integration sends records through Zapier and persists them in `CHATBOT_VIEWINGS`. The agent portal queries booking data with agent-specific access conditions.

## System integration boundaries

1. **Browser ↔ APEX:** catalogue, property details, staff pages, page-level HTML and V6 CSS.
2. **Infobip ↔ ORDS:** searches for RENT/BUY, listing selected from carousel, fetches matching property details.
3. **Infobip ↔ Zapier:** booking details are transmitted to the workflow when the customer confirms.
4. **Zapier ↔ ORDS:** booking is created or safely replayed using a request-key mechanism.
5. **Zapier ↔ Calendar/email:** one-hour calendar event, customer email, agent notification.
6. **Agent ↔ APEX:** authorised record inspection and follow-up/status changes.
7. **FAQ buttons ↔ APEX Page 11:** direct navigation to on-page information; no listener or polling dependency.

## Primary database areas

- `PROPERTY`, `BUYING`, `PROPERTY_IMAGE`, agent/clients/viewing source entities — original application data areas.
- `CHATBOT_LISTINGS` — unified listings, RENT/BUY fields, images and stable listing keys.
- `CHATBOT_VIEWINGS` — booking reference, customer data, selected property, agent, viewing start/end, status and follow-up.

Database schema DDL is controlled by the project DBA and must be exported without real client records, passwords or secrets. A final approved team architecture diagram and to-be BPMN are pending; this note is *descriptive*, not the approved diagram.
