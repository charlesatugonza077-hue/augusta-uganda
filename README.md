# Augusta Uganda

Practical business support for small businesses in Uganda.

## Repository rule
This repository is Augusta’s single source of truth for the public website, user-interface design, front-end code, server-side services, visual source assets, deployment configuration and technical documentation.

## Where things live
- `index.html` — published GitHub Pages website
- `assets/js/` — browser-side functionality
- `design/` — UI system and approved visual assets
- `backend/` — optional server-side service experiments
- `docs/` — architecture, operating and deployment guidance
- `.github/workflows/` — automated free quality checks

## Current live site
GitHub Pages publishes the static website from `main`. The project is designed to use free hosting and free repository checks; no paid hosting dependency is required.

## Enquiry service
The contact form prepares a WhatsApp message for the visitor to review and send. It requires no paid API, email provider, database or server. See `docs/INQUIRY_SERVICE.md`. The Cloudflare Worker source is retained as an optional future experiment and is not deployed or called by the public website.

## Safety
Never commit passwords, API keys, customer data or private enquiries. Use GitHub secrets for credentials if a future approved workflow needs them and keep `.env` files local.
