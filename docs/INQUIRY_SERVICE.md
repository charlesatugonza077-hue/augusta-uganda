# Augusta enquiry service

## What this feature does
The published Augusta form sends a small, consented enquiry to a dedicated serverless endpoint. The endpoint validates the request, blocks unexpected browser origins, ignores a simple bot honeypot, and forwards valid enquiries to Augusta’s chosen inbox through Resend.

The complete source is kept in this repository under `backend/enquiry-worker/`.

## Architecture
```text
Visitor → GitHub Pages form → Cloudflare Worker → Resend → Augusta inbox
```

GitHub Pages remains the public website host. Cloudflare Workers runs the private server-side code. Resend holds the email-delivery credential. None of those credentials belong in GitHub.

## One-time deployment
1. Create a Cloudflare account and a Resend account owned by Augusta.
2. In Resend, verify the sending domain or a permitted sender address.
3. Deploy `backend/enquiry-worker` with Wrangler or the included GitHub Actions workflow.
4. Add these runtime secrets in Cloudflare, never in the repository:
   - `RESEND_API_KEY`
   - `ENQUIRY_FROM_EMAIL`
   - `ENQUIRY_TO_EMAIL`
5. Copy the Worker URL into `assets/js/config.js` as `enquiryEndpoint` and commit it.
6. Submit a real test enquiry and confirm it arrives at the chosen Augusta inbox.

## Data and safety
- Collect only what the existing form asks for.
- Do not ask for passwords, payment details or sensitive personal information.
- Keep inbox access limited to the people responsible for responding.
- Set a retention and deletion routine before beginning paid client work.
- The Worker does not store enquiries in GitHub, browser storage or a public database.

## Future improvement
When the CRM is ready, add a server-side integration after email delivery succeeds. Keep any API credentials in Cloudflare secrets and document the fields mapped to the CRM.
