# Augusta backend

The current backend is a Cloudflare Worker in `enquiry-worker/`. It validates website enquiries and sends them through Resend to Augusta's configured inbox. Deployment instructions and required GitHub Actions secrets are in [docs/BACKEND_DEPLOYMENT.md](../../docs/BACKEND_DEPLOYMENT.md).

**Important:** this Worker currently sends email; it does not store enquiries in a database. The existing Google Sheets CRM remains separate. The private gallery manager will need a database and media storage integration as a separate implementation phase.

Never commit secrets, live customer data or private access tokens.