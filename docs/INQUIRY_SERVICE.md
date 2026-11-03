# Augusta website enquiries — free-first setup

## Current approach
The public website is hosted by GitHub Pages. The contact form prepares a WhatsApp message using the click-to-chat link format. The visitor reviews the message and chooses whether to send it.

```text
Visitor → GitHub Pages form → WhatsApp opens with a prepared message → visitor presses Send
```

This design has no paid hosting, email API, database, Cloudflare deployment or API key. It is intentionally simple and keeps the website's monthly operating cost at zero.

## Important behaviour
- The website does not claim an enquiry has been submitted merely because the form was completed.
- The visitor must review and send the message in WhatsApp.
- If a browser blocks the new tab, the page displays a direct link the visitor can select.
- The form does not send enquiry details to Google Apps Script or another hidden endpoint.
- Do not ask customers to share passwords, payment credentials or sensitive information through the form.

## Hosting and deployment
GitHub Pages continues to publish the static website from the repository's configured publishing branch. Repository quality checks run through GitHub Actions. No paid hosting service is required for this static website.

## Optional future email integration
The source under `backend/enquiry-worker/` is retained as an optional future experiment. It is not deployed or called by the current website. It depends on an external email-delivery provider and is not required for the zero-budget WhatsApp workflow. Do not activate it or add paid services unless Augusta explicitly approves a budget change.

## Privacy
The privacy notice describes the WhatsApp handoff. A prepared message is not sent until the visitor presses Send. Keep the public form limited to information needed to respond.
