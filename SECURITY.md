# Security and Sensitive Data

## Public repository policy

Do not commit: real login details, personal access tokens, Infobip signing keys, REST API keys, Zapier webhook URL/token, `.env` files, Oracle wallet or database credentials, customer identity/contact data, private assessor access registers, test output with live records, or screenshot evidence containing these details.

## Access

The website exposes public property browsing. Staff access is authenticated in Oracle APEX and must be restricted by agent-specific authorisation and database query conditions, not only navigation visibility. ORDS GET/POST handlers must have permissions appropriate to the data exposed.

## Academic assessor access

Provide necessary access only through the restricted university handover, using existing authorised accounts or short-lived assessment accounts and a separate permission register. Revoke test keys after grading. Keep private credentials out of the GitHub version, even if the repository is initially private.

## Incidents

If a key leaks, notify the system owner promptly, rotate/revoke it and review access logs. Deleting a GitHub file does not remove its value from historical commits.
