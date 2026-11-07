# API Operations — Public Overview

Oracle REST Data Services (ORDS) exposes the data operations needed by the website and chatbot. This is a functional interface description, **not** a list of deployed URLs, credentials or permission grants.

| Operation | Method category | Purpose |
|---|---|---|
| Rental property search | GET | Return matching rental listings. |
| Buying property search | GET | Return matching sale listings. |
| Single listing retrieval | GET | Return selected property information and linked agent. |
| Property image lookup | GET | Provide image content for catalogue and chatbot cards. |
| Viewing availability information | GET | Support viewing scheduling information; not a slot lock. |
| Viewing request submission | POST | Store/replay a selected-property request through the authorised workflow. |
| Client/viewing reporting | Restricted read | Display authorised agent records within the portal. |
| Viewing follow-up change | Restricted update | Persist permitted booking status and follow-up fields. |

The FAQ, cancellation and rescheduling chatbot buttons link to information on Page 11. They do not call a public cancellation/reschedule transaction. Request schemas, private URLs, credentials and error specifications are available only to authorised maintainers and assessors.
