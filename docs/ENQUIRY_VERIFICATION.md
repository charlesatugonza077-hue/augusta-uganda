# Enquiry service verification

## Verified in repository

- The public site loads `assets/js/config.js` and `assets/js/enquiry.js`.
- The form collects only name, business, contact detail, requested support, situation and consent.
- A honeypot, browser-side required fields and a consent requirement are present.
- The Worker permits only POST and OPTIONS requests from `https://charlesatugonza077-hue.github.io`. It requires JSON, validates required fields, limits field lengths and HTML-escapes email content.
- Email delivery is server-side through Resend. The Worker reads `RESEND_API_KEY`, `ENQUIRY_FROM_EMAIL` and `ENQUIRY_TO_EMAIL` only from its runtime environment.
- `npm run check` and `npm test` cover syntax plus rejection of bad origins, missing consent, non-POST requests and honeypot submissions. The test also confirms a valid submission only reports success after the email provider accepts it.

## Not yet connected or evidenced

`assets/js/config.js` deliberately has an empty `enquiryEndpoint`. The live form therefore fails safely and does not send enquiries anywhere. No deployed Worker URL, Cloudflare account configuration, Resend sender verification, recipient inbox, CRM sheet connection or end-to-end delivery result is stored in this repository.

## Safe completion checklist

1. In Cloudflare, deploy `backend/enquiry-worker` and record the public `workers.dev` URL.
2. Add the three runtime secrets with `wrangler secret put`; never place their values in GitHub.
3. Verify the Resend sending address/domain and confirm the Augusta recipient inbox.
4. Commit only the Worker URL to `assets/js/config.js` as `enquiryEndpoint`.
5. Run `npm run check && npm test`, then deploy.
6. With Charles’s approval, submit one clearly marked test enquiry and confirm the inbox receives it.
7. If a CRM sheet is required, add a dedicated authenticated integration after the email path is proven; do not expose sheet credentials or use a public Apps Script URL.

## Required approval or private values

Charles must supply or approve access to the Cloudflare account, a Resend API key, a verified sender address, the Augusta recipient inbox, and the target CRM system or sheet. Those values must be set in the relevant provider dashboards, not committed to this repository.
