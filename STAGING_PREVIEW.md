# Augusta gallery staging preview

This branch uses the separate **Augusta Media** Supabase project in eu-west-1. It is isolated from the production gallery project and must never be merged into `main` without replacing the staging configuration.

The public page can be checked with an empty gallery immediately. Admin upload, draft, publish, unpublish and delete need a staging-only Auth administrator registered in `gallery_admins`.
