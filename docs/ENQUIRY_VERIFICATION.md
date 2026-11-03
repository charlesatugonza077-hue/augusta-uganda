# Enquiry flow verification

## Current public website behaviour
- The public contact page loads `assets/js/config.js` and `assets/js/site.js`.
- The form validates required fields in the browser and prepares a WhatsApp click-to-chat URL.
- The visitor reviews the message and must press Send in WhatsApp.
- The website does not send the form data to an email provider, database, CRM, Google Apps Script or Cloudflare Worker.
- A visible fallback link is provided if the browser does not open the WhatsApp handoff automatically.
- The configured public WhatsApp number is stored in `assets/js/config.js`; confirm it remains the approved Augusta contact number.

## What has been tested
- JavaScript syntax is checked in GitHub Actions.
- The repository's static checks validate HTML structure, local references and sitemap entries.
- These checks do not prove that WhatsApp opens correctly on every mobile browser or that Augusta receives a message.

## Dormant backend experiment
`backend/enquiry-worker/` contains an optional, inactive prototype. It is not deployed or referenced by the current website. Its email-provider dependencies and credentials are not part of the zero-budget setup. The deployment workflow has been removed so a routine push cannot deploy it accidentally.

## Manual end-to-end test still required
1. Open the live contact page on an iPhone and an Android device.
2. Submit a clearly marked test enquiry using non-sensitive test details.
3. Confirm WhatsApp opens with the correct service, location, timing and message text.
4. Confirm the fallback link works if the initial handoff is blocked.
5. Press Send manually and verify Augusta receives the message in the intended WhatsApp account.
6. Repeat from a service page that preselects a service in the contact form.

Never use real customer personal data for test submissions.
