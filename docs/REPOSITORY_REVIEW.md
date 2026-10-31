# Repository review — 31 October 2026

## What is in GitHub now
- Published website source: `index.html`
- Search files: `robots.txt`, `sitemap.xml`, verification file
- UI system: `design/design-system.md`
- Visual source assets: `design/assets/`
- Enquiry frontend: `assets/js/config.js`, `assets/js/enquiry.js`
- Enquiry backend: `backend/enquiry-worker/`
- Deployment workflow: `.github/workflows/deploy-enquiry.yml`
- Operating documentation: `ARCHITECTURE.md`, `docs/`

## Structure verdict
The repository now separates product design, browser-facing code, private server-side code, deployment automation and operating documentation. It is suitable for a small business site while remaining simple enough to maintain.

## Deliberate boundary
The source and delivery workflow are ready in GitHub. The live enquiry endpoint is not switched on until the Augusta-owned Cloudflare and Resend secrets are added. This protects inbox credentials and avoids pretending that enquiries are delivered when they are not.

## Next repository changes
1. Add the Cloudflare deployment secrets in GitHub and deploy the Worker.
2. Put the resulting Worker URL into `assets/js/config.js`.
3. Send a real test enquiry and confirm delivery.
4. Add server-side CRM routing only after the email path is proven.
