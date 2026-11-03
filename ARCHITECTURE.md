# Augusta architecture

## Source of truth
This repository is the source of truth for Augusta's public website, interface, front-end code, optional backend experiments, design assets, deployment configuration and operating documentation.

## Current production setup
- Public site: static HTML, CSS and browser JavaScript.
- Hosting: GitHub Pages, published from the `main` branch.
- Enquiries: the contact form prepares a WhatsApp message; the visitor reviews it and presses Send in WhatsApp.
- No website form submission is sent to an Augusta database, email API or CRM.
- No Cloudflare Worker or external email-delivery service is part of the active website flow.
- Automated quality checks run through GitHub Actions.

## Optional backend experiments
The source under `backend/enquiry-worker/` is dormant reference code only. It is not deployed, called by the public website, or part of the zero-budget production setup. Do not activate its deployment or add provider credentials without explicit approval of a budget and data-handling plan.

## Delivery rules
1. Keep production source, configuration and documentation in this repository.
2. Never commit passwords, API keys, customer data or private enquiries.
3. Make material changes on a branch and validate them before merging.
4. Update this document whenever hosting, enquiry handling or data flows change.
5. Do not claim a form enquiry was received until the visitor has sent it and Augusta has actually received it.

## Outstanding work
- Keep the Augusta Home website, sales scripts and operating documents aligned with `docs/AUGUSTA_HOME_CURRENT_MODEL.md`; obtain approval before changing prices or defining a fixed all-inclusive laundry package.
- Complete real-device checks for mobile layout and WhatsApp handoff.
- Review privacy and client policy wording with the Director and Ugandan counsel before treating proposed terms as effective.
