# Setup, Import and Configuration

**Required authorised access:** Oracle APEX workspace/Application 103, Oracle Autonomous Database and ORDS administration, Infobip Answers workspace, Zapier workspace, Google Calendar and email-connector permissions.

## 1. Export and back up

The current maintainer exports Application 103 through Oracle APEX App Builder and backs up only approved database DDL and **synthetic** example data. Keep production client records and all secrets out of the repository. Confirm ownership of the final CSS/HTML and chatbot configuration exports.

## 2. Import Oracle components

Import the APEX application into the approved workspace, verify its application ID if renumbered, set application-level authentication/authorisation, check the assigned database schema and install approved DDL. Configure both public and staff navigation and check the APEX Global Page shared Live Chat integration.

## 3. Styles and assets

Follow `frontend/ikhayalam_master_v6_installation.md`. Import `frontend/ikhayalam_master_v6.css` into Static Application Files and load one version only; retain APEX Universal Theme. Confirm images load from the intended Oracle image tables and that property card IDs are correct.

## 4. Connect external services

An authorised maintainer configures ORDS handlers and their permissions; then in Infobip maps existing search/listing and booking actions to the appropriate service contracts. In Zapier, configure the webhook input, request-key transformation, ORDS booking POST mapping, Google Calendar creation and customer/agent email. **Do not add private service URLs or secret values here.**

## 5. Staff security

Test Page 9999 and agent-specific Page 8/9/10 data restrictions. Do not rely on hiding navigation links alone; check SQL WHERE clauses and APEX authorisation schemes. Use dedicated test users.

## 6. Release validation

Run every scenario in `Test_Plan.md`, confirm no duplicate records on retry, check booking status/follow-up updates and verify FAQ buttons navigate to Page 11. Confirm accessible responsive layout and chat widget behaviour.

## 7. Live deployment

Approved public site: https://ge12da41765e3b0-ikhayalam.adb.me-jeddah-1.oraclecloudapps.com/ords/r/ikhayalam_ws/ikhayalam-properties/welcome-to-ikhayalam. This is a hosted Oracle APEX application, not a localhost service. Validate the address and public visibility before adding it to public project metadata.
