# Augusta Uganda — Repository Audit

**Audit date:** 3 November 2026  
**Repository:** `charlesatugonza077-hue/augusta-uganda`  
**Audited baseline:** `main`  
**Audit branch:** `audit/full-repository-review-2026-11-03`  
**Method:** Static source review of the published entry page, shared CSS and JavaScript, configuration, contact form, enquiry Worker and tests, Augusta Home pages, policy pages, README, sitemap and robots file.

## Executive summary

The site has a coherent visual direction and a useful multi-service structure, but it is **not ready to rely on as a complete enquiry and booking system**. The most serious issue is that the contact form, browser script, public endpoint configuration and Cloudflare Worker do not form one consistent integration. The Augusta Home page also contains three concatenated HTML documents, and the shared stylesheet repeats base rules.

No production application code was changed as part of this audit. This report is the only file added on the audit branch.

## Findings by severity

### Critical — Enquiry delivery is not reliably confirmed

**Evidence**
- `contact.html` submits fields named `name`, `service`, `location`, `timing` and `message`.
- `backend/enquiry-worker/src/index.js` validates a different schema: `name`, `business`, `contact`, `help`, `message` and `consent`.
- The form does not provide the Worker's required `business`, `contact`, `help` or `consent` fields.
- The form does not include the Worker's `website` honeypot field.
- `assets/js/config.js` currently points `enquiryEndpoint` at a Google Apps Script URL, while `README.md` says the Worker URL is intentionally blank and `docs/INQUIRY_SERVICE.md` describes Cloudflare Worker + Resend as the intended architecture.
- `assets/js/site.js` awaits fetch but does not check `response.ok` or the response body. Its catch block suppresses delivery errors. It then attempts to open WhatsApp regardless.
- `window.open` is called after an awaited network request; browsers may block this popup because it is no longer directly inside the original user gesture.

**Impact**  
The website can appear to accept an enquiry even when the configured endpoint failed or the Worker rejected the payload. WhatsApp may open, but that does not prove an email enquiry was delivered.

**Required fix**
1. Choose one production delivery architecture (Cloudflare Worker + Resend, or the existing Apps Script integration) and remove stale/conflicting configuration and documentation.
2. Define one shared payload contract and make the form and backend use it exactly.
3. Add explicit, informed privacy consent where required; do not fabricate consent in JavaScript.
4. Add the honeypot field and server-side validation, size limits and abuse controls.
5. Check HTTP status and response JSON; show a truthful success or failure state.
6. Make WhatsApp fallback a deliberate, clearly labelled user action and avoid relying on a delayed popup.
7. Test the entire browser-to-inbox path with a controlled test inbox before launch.

### High — Augusta Home page contains three complete HTML documents

**Evidence**
- `home-services.html` is 29,158 characters and contains three `<!doctype html>` declarations, three closing `</body>` tags and three closing `</html>` tags.
- The concatenated versions describe different scopes and pricing inclusions. One version says cleaning and related tasks are included in the apartment plan; another says those tasks are separately paid; another describes weekly visits as check-in/coordination only.

**Impact**  
Browsers may recover from malformed document structure inconsistently. Search engines and users can encounter duplicated or contradictory content, especially around what the monthly plans include.

**Required fix**  
Rebuild this file as exactly one valid HTML document. Select and approve one authoritative service scope and price schedule, then align the homepage, service detail pages, enquiry choices and policy wording to it.

### High — Privacy notice does not describe the observed data flow in enough detail

**Evidence**
- `privacy.html` says enquiry details are used only to respond, quote or arrange a booking.
- The browser script sends the form payload to the configured third-party endpoint and also prepares a WhatsApp message.
- The documented alternative architecture uses Cloudflare and Resend.
- The notice does not identify the actual service providers/processors, a retention period, a clear contact for privacy requests or a fuller explanation of how a customer can exercise data rights.
- The form has no explicit consent checkbox, while the Worker requires `consent === true`. The dynamically injected note in `config.js` is an acknowledgement of proposed policies, not a consent control.

**Impact**  
Customers may not receive a clear and accurate explanation of where their information goes and how it is handled. The current notice and implementation are not aligned.

**Required fix**  
Map the actual data flow first, then have the privacy notice and consent language reviewed for Uganda's applicable data-protection requirements. Disclose actual processors and purposes, define retention/deletion, restrict access and document how privacy requests are handled. Do not publish a statement that implies a privacy control exists when the form does not implement it.

### High — Shared stylesheet repeats base CSS

**Evidence**
- `assets/css/site.css` is 30,501 characters.
- The file contains two `:root` blocks, two base `body` rules and two reduced-motion media-query blocks. The base style system is repeated.

**Impact**  
Unnecessary file weight and cascade complexity make future visual changes harder to reason about and increase the chance that a later override behaves unexpectedly.

**Required fix**  
Deduplicate the base stylesheet, group the Augusta Home additions into a clearly separated section or file, and preserve a single source of truth for design tokens and responsive rules.

### Medium — SEO coverage is incomplete

**Evidence**
- `sitemap.xml` includes the main pages and Augusta Home pages but omits the creative service detail pages and policy pages.
- The inspected service detail pages and policy pages do not include canonical links or Open Graph title metadata.
- Policy pages have titles but no meta description.
- No `404.html` or web app manifest was found at the expected repository-root paths during this review.

**Impact**  
Important service pages may be less discoverable and social previews may be inconsistent. A missing custom not-found page can produce a poor user experience on GitHub Pages.

**Required fix**
- Add every intended indexable public page to the sitemap and keep it synchronized.
- Add canonical URLs and consistent Open Graph/Twitter metadata to public pages.
- Add unique meta descriptions to policy pages where appropriate.
- Add and test a custom `404.html`.
- Confirm the production site URL and any custom-domain configuration before generating canonical URLs.

### Medium — Policy status and operational publication need control

**Evidence**
- `terms-of-service.html`, `booking-policy.html` and `legal.html` explicitly say the policies are proposed and pending legal review and Director approval.
- `config.js` dynamically inserts a “Before you book” panel and links to proposed policies on service pages.

**Impact**  
The pages correctly signal their proposed status, but the website should not imply that proposed terms are already approved or binding. Dynamic insertion also makes the final page content less obvious when reviewing the HTML source alone.

**Required fix**  
Keep the proposed status visible until approval. Record the approving person, effective date and version; publish the final wording consistently; remove or update the proposed label only after approval and operational readiness.

### Medium — No dependable automated quality gate was confirmed

**Evidence**
- The Worker package defines `check` and `test` scripts.
- The repository README describes automated deployment checks.
- Common workflow paths checked during the audit (`.github/workflows/deploy.yml`, `pages.yml`, `deploy-pages.yml`, `worker.yml`, `ci.yml`) were not found.
- The latest main commit returned no combined status checks.

**Impact**  
There is no confirmed automated gate in the reviewed evidence to prevent malformed HTML, broken links, failing Worker tests or accidental deployment regressions.

**Required fix**  
Confirm the actual workflow inventory, then add or repair CI to run HTML validation, link checks, JavaScript syntax checks, Worker unit tests and deployment checks. Require the checks to pass before merging.

### Low — Navigation and shared-code maintainability

**Evidence**
- Navigation and footer markup is repeated across multiple standalone HTML files.
- `config.js` dynamically appends policy navigation and footer content. On pages that already contain a policy footer section, the selector may not recognize that existing section and can append another one.
- The CSS declaration `font:700 14px inherit` in the navigation rule is not a valid font shorthand.

**Impact**  
Repeated markup increases maintenance cost; dynamic injection can create inconsistent or duplicated navigation; invalid CSS declarations are ignored by browsers.

**Required fix**  
Use a shared page template/build step or carefully maintain one common navigation/footer pattern. Make dynamic injection idempotent using stable data attributes. Replace the invalid font shorthand with explicit `font-family`, `font-size` and `font-weight` declarations.

## Positive controls observed

- The Worker uses an origin allowlist and rejects non-POST requests and non-JSON payloads.
- The Worker validates required fields and requires an explicit `consent: true` value.
- Email HTML values are escaped before insertion.
- Credentials are documented as Cloudflare secrets rather than repository files.
- `.gitignore` excludes environment files, local secrets and build outputs.
- The Worker includes tests for origin rejection, consent, method restrictions, honeypot behaviour and escaped email content.
- The website includes a skip link, labelled navigation, responsive layout rules and a reduced-motion media query.

These controls are useful, but they do not compensate for the frontend/backend contract mismatch or prove successful production delivery.

## Recommended remediation order

1. **Stabilise enquiry delivery:** choose one backend, align the payload, implement consent and truthful success/failure handling, then verify a real test email.
2. **Repair Augusta Home content:** reduce `home-services.html` to one document and settle the authoritative package scope/pricing.
3. **Align privacy and policy publication:** disclose the real data flow and complete review/approval before treating proposed terms as active.
4. **Deduplicate CSS and clean shared navigation:** reduce cascade duplication and make injection safe/idempotent.
5. **Complete SEO and site hygiene:** sitemap, canonical metadata, social previews, custom 404 and link validation.
6. **Add CI and release controls:** automated tests and a staging/test path before production changes.

## Audit limitations

This is a static source audit of the files retrieved from the repository. The live GitHub Pages site could not be independently loaded in this review environment. No browser-based cross-device testing, Lighthouse performance run, axe accessibility scan, end-to-end form submission, live inbox verification, dependency vulnerability scan or exhaustive secret scan was performed. Therefore, those items remain **unverified**, not passed.

The earlier branch `audit/enquiry-repair-and-site-hardening` is diverged from `main` (two commits ahead and one behind at the time of review). This audit was therefore recorded on a fresh branch based on current `main`, rather than building on that stale branch.
