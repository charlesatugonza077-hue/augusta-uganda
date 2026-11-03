# Augusta backend deployment

## What this service does today

The Cloudflare Worker at `backend/enquiry-worker` validates public website enquiries and forwards them through Resend to Augusta's configured inbox. It does not yet write enquiries to a database. The existing Google Sheets CRM remains separate and is not modified by this service.

## Required accounts and configuration

The deployment workflow uses GitHub Actions secrets. Add these under the repository's **Settings → Secrets and variables → Actions → New repository secret**:

| Secret name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with permission to deploy Workers for the correct account |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `RESEND_API_KEY` | Resend API key |
| `ENQUIRY_FROM_EMAIL` | Verified sender identity in Resend, e.g. `Augusta <enquiries@your-verified-domain>` |
| `ENQUIRY_TO_EMAIL` | Inbox that should receive website enquiries |

Do not commit these values to GitHub, the website, or this repository. Do not send the token or API key in chat.

Create a Cloudflare API token with the minimum Workers deployment permissions required. The account ID is available in the Cloudflare dashboard account overview. In Resend, verify the sending domain before using a sender address on it.

## Deploy

After adding all five secrets, open **GitHub → Actions → Deploy Augusta enquiry backend → Run workflow** (or push a change to the worker). The workflow installs dependencies, runs syntax checks and tests, deploys the Worker, then configures the three mail secrets.

The Worker URL will be shown in the deployment log. Copy that URL into the website enquiry integration only after the Worker is deployed and tested.

## Current limitations / next phase

- The Worker currently sends enquiries by email; it does not persist them in a database.
- The Google Sheets CRM is not automatically synchronized by this Worker.
- A future database-backed media manager requires a database and object storage (for example Cloudflare D1 + R2) and an authenticated admin interface. Provision those resources only after the Cloudflare account is confirmed and the owner approves the required access.
- Never expose Cloudflare API tokens, Resend API keys, database credentials, or service-role keys in browser code.
