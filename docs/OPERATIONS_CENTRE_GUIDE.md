# Augusta Operations Centre

The private management centre is available at:

`https://charlesatugonza077-hue.github.io/augusta-uganda/admin/`

Sign in using the approved Augusta administrator account. Do not share the password or create public administrator accounts.

## Main sections

- **Overview:** quick counts for new enquiries, customers, active projects and open tasks, plus recent activity.
- **Enquiries:** record conversations that arrive through WhatsApp, calls, referrals or other channels. Track each one as New, Contacted, Qualified, Converted or Closed. Set a priority to highlight urgent follow-up.
- **Customers:** save customer names, business details, contact information, location and internal notes. Keep notes factual and relevant to service delivery.
- **Projects:** create a delivery record after work is agreed. Link it to a customer and, where relevant, the enquiry that produced it. Record service, start and due dates, quote amount and currency.
- **Tasks:** break a project into actions, set due dates and update each task as To do, In progress or Done.
- **Media library:** upload images and video, save drafts, publish approved work to the public portfolio, edit descriptions and remove media.

## Recommended daily workflow

1. When a new enquiry arrives, record it in **Enquiries** and set its priority.
2. Create or find the person in **Customers**, then link the enquiry to that customer.
3. Follow up and update the enquiry status as the conversation progresses.
4. Once the work is agreed, create a **Project**, link the customer and originating enquiry, and enter the agreed scope and dates.
5. Add practical next steps under **Tasks** and update them as work is completed.
6. Upload only media Augusta has permission to publish. Keep unapproved client work as a draft or outside the public portfolio.

## Important current limitation

The public contact form prepares an enquiry in WhatsApp. The visitor reviews the message and presses Send themselves. It does **not** automatically create a record in the operations database. Record incoming WhatsApp enquiries manually in the Enquiries section until a secure, configured intake integration is added.

## Privacy and access

Customer, enquiry, project and task records are private. Row Level Security is enabled on these tables, and the database grants row access only to approved Augusta administrators. Anonymous website visitors cannot read these records.

Do not store passwords, payment-card details, national ID numbers or unnecessary sensitive personal information in customer notes. Use the minimum information needed to deliver the service.

## Security setting still to enable

In Supabase Dashboard, open **Authentication → Settings → Password Security** and enable **Leaked Password Protection**. The current Supabase security advisor still flags this setting as disabled.
