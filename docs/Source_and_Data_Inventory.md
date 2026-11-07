# Source, database and evidence inventory

| Asset | What is represented here | Source of truth |
|---|---|---|
| APEX Application 103 | Page map, excerpts and operating procedures | Oracle APEX App Builder / verified export |
| Master V6 styling | CSS and installation guide | APEX application/shared static files |
| Main property data | `PROPERTY`, `BUYING`, `AGENT`, `CLIENT`, `VIEWING`, images | Oracle Autonomous Database |
| Chatbot data | `CHATBOT_LISTINGS`, `CHATBOT_VIEWINGS` | Oracle Autonomous Database |
| Vee | Dialog and validation summary | Infobip project export/dashboard |
| REST operations | Purpose and GET/POST categories **only** | Private ORDS module and assessor package |
| Automation | Booking → Oracle persistence → Google Calendar/email | Restricted Zapier configuration |
| BPMN/architecture | Conceptual flow only; team-approved diagrams pending | Final team deliverables |

**Sample data:** `examples/synthetic_listing.json` is an illustrative fixture only. It must never be mistaken for an actual property listing, a test-pass result, or an export of the team's production/test records. Provide a scrubbed Oracle seed script separately once the team approves it.

**Repository limitation:** This ZIP is a documentation/source-excerpt repository, not a self-running mirror of the cloud application. APEX application export, database DDL and Infobip/Zapier exports must come from their designated owners, and must be checked for secrets before commit.
