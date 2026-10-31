# Augusta Uganda

Practical business support for small businesses in Uganda.

## Repository rule
This repository is Augusta’s single source of truth for the public website, user-interface design, front-end code, server-side services, visual source assets, deployment configuration and technical documentation.

## Where things live
- `index.html` — published GitHub Pages website
- `assets/js/` — browser-side functionality
- `design/` — UI system and approved visual assets
- `backend/` — API and server-side services
- `docs/` — architecture, operating and deployment guidance
- `.github/workflows/` — automated deployment checks

## Current live site
GitHub Pages publishes the website from `main`.

## Enquiry service
The enquiry form’s UI and Cloudflare Worker source are both in this repository. See `docs/INQUIRY_SERVICE.md` for the one-time secure activation steps. The Worker URL is intentionally blank until the Augusta-owned email delivery account and Cloudflare secrets are configured.

## Safety
Never commit passwords, API keys, customer data or private enquiries. Use GitHub or Cloudflare secrets for credentials and keep `.env` files local.
