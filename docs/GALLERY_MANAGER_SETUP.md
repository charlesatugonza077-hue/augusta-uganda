# Augusta private gallery manager

The manager is served from `/admin/` on the existing GitHub Pages website. Supabase provides password authentication, the media database and file storage. The browser uses only the Supabase project URL and public anon/publishable key. Never put a service-role key in website files.

## Categories supported

Photography, videography, photo editing, video editing, content/media, home cleaning and organisation, laundry and ironing, wardrobe organisation, events and general portfolio. Both images and videos are supported. Items can be saved as drafts, published, unpublished, edited or deleted.

## One-time setup

1. Create a free project at https://supabase.com/.
2. Open the SQL Editor and run `supabase/gallery-manager-schema.sql`.
3. In Supabase Authentication, create an administrator account using your email and password. Keep public sign-ups disabled; create accounts only from the Supabase dashboard.
4. Copy the administrator's Auth user UUID. In SQL Editor, run the final commented INSERT statement in the schema file, replacing the sample UUID and email with your exact details.
5. In Project Settings → API, copy the Project URL and anon/publishable key. Put these into `admin/config.js`. Never use the service-role/secret key.
6. Commit the config file to the repository and publish the website.
7. Open `https://charlesatugonza077-hue.github.io/augusta-uganda/admin/` and sign in.

## File size and video guidance

The starter storage bucket allows files up to 50 MB. Compress video before uploading; MP4/H.264 is a good compatibility choice. Supabase free storage and bandwidth quotas apply and may change. A substantial video library may require a dedicated video host or paid storage. Upload only client media approved for storage and public display.

## Implementation status

The private login, upload, category, draft/publish, edit and delete interface is implemented in this branch. It is not operational until Supabase is connected and the administrator is registered. The public gallery and individual service pages must also be wired to read published records from Supabase before uploads appear on the live public pages. That integration is the next step once the project URL and public key are configured.

## Security

The dashboard URL is not the security boundary. Supabase Auth and database/storage access policies restrict write operations to the registered administrator. The storage bucket is public so approved portfolio media can be viewed by visitors; never store confidential, unreleased or private client media there. Do not commit passwords or service-role keys.
