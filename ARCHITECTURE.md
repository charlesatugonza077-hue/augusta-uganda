# Augusta architecture

## Source of truth
This repository is the single source of truth for Augusta’s website, user experience, front-end, back-end services, design assets, deployment configuration and technical documentation.

No production change is complete until its source, configuration and documentation are committed here.

## Current build
- Public site: GitHub Pages from the `main` branch
- Front end: static HTML, CSS and browser JavaScript in `index.html`
- Search support: `robots.txt`, `sitemap.xml` and Google Search Console verification file
- Enquiry form: currently interface-only; it does not yet transmit information to an inbox or database

## Planned full-stack layout
```
/
├── frontend/        # reusable interface code when the static site graduates
├── backend/         # server/API code, validation and integrations
├── design/          # UI design system, assets and user-flow notes
├── docs/            # architecture, deployment and operating documentation
├── public/          # published site assets
├── index.html       # current published website
├── robots.txt
├── sitemap.xml
└── README.md
```

## Delivery rules
1. Build every website, API, database schema, design decision and deployment configuration in this repository.
2. Keep credentials, keys, customer data and private form submissions out of GitHub. Store only an `.env.example` with placeholder variable names when a backend is added.
3. Use a separate branch and review for material changes once collaborators join.
4. Update this document whenever the technology, hosting or data flow changes.
5. The live site must always be reproducible from files in this repository.

## Next technical milestone
When Augusta needs working enquiry capture, add a documented backend or managed form integration here, with spam protection, consent wording, secure data handling and an export or CRM path.
