# Repository review — 3 November 2026

## Confirmed current structure
- Static public website: root HTML pages and `services/`.
- Shared browser assets: `assets/css/site.css`, `assets/js/config.js`, `assets/js/site.js`.
- Search files: `robots.txt`, `sitemap.xml` and the Google verification file.
- Design system and source visuals: `design/`.
- Optional, dormant backend experiment: `backend/enquiry-worker/`.
- Operating and technical documentation: `docs/`, `ARCHITECTURE.md` and `README.md`.

## Confirmed technical state
- GitHub Pages is configured to build from `main`; the Pages build/deployment workflow succeeded for commit `693833ed9a23140c775317e709361a2974b26f82`.
- The current contact form is WhatsApp-first. It does not submit to an inbox or database automatically.
- The public site does not require a paid API, email service or backend.
- Free GitHub Actions checks validate repository structure and JavaScript syntax.

## Issues found in the deeper audit
1. An old Cloudflare Worker deployment workflow remained active even though the current architecture says the Worker is dormant. It could deploy on future backend changes or manual dispatch. It should remain disabled unless a separate budget and approval are given.
2. The homepage had duplicate Open Graph type metadata.
3. Several policy pages and the 404 page were missing skip-navigation and/or a main landmark identifier.
4. The client policy centre repeated an old Home package description that conflicted with the currently published Augusta Home page.
5. Older internal Home operations, pricing and sales drafts describe different visit frequencies, included tasks and prices from the public pages. These commercial details require Director confirmation; do not quote the older drafts.
6. The privacy notice is a basic disclosure, not a complete legal review or proof of compliance with Uganda's data-protection requirements.
7. Live device testing of the WhatsApp handoff, accessibility review and performance testing remain outstanding.

## Do not change without approval
- Augusta Home visit frequency, included cleaning tasks, add-on scope and published prices.
- The proposed UGX 30,000 commitment payment or cancellation/refund rules.
- The approved WhatsApp contact number.
- Any legal policy wording that has not been approved by the Director and reviewed by Ugandan counsel.

## Next checks
- Run the expanded local-link, sitemap and accessibility-structure checks in CI.
- Test the WhatsApp flow on real iOS and Android devices.
- Review page performance and accessibility with browser-based tools.
- Reconcile remaining historical sales/operations drafts against `docs/AUGUSTA_HOME_CURRENT_MODEL.md` before using them; approve a fixed all-inclusive laundry package price before advertising it.
