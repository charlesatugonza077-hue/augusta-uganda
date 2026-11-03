# Augusta website publishing checklist

## Before a pull request
- [ ] Confirm approved service wording and pricing.
- [ ] Keep Augusta Home plan prices and four weekly visits accurate.
- [ ] Keep mobile laundry separate from Home plans at UGX 45,000 per standard load.
- [ ] Agree special requests, large loads and access limitations before booking.
- [ ] Keep the proposed UGX 30,000 commitment-fee wording lawful and cautious.
- [ ] Do not expose credentials, private contacts or delivery endpoints.

## Validate
- [ ] Run the site checker, whitespace check and JavaScript syntax check.
- [ ] Search affected pages for stale prices or contradictory scope.
- [ ] Review the complete pull-request diff, including booking and policy pages.

## Publish and verify
- [ ] Open a pull request against main and confirm it has no conflicts.
- [ ] Merge only after wording and pricing review is complete.
- [ ] Wait for GitHub Pages, then check the live homepage, Home overview, laundry, cleaning, booking-policy and client-policy pages.
- [ ] Confirm enquiry links work and no customer-facing errors appear.

## Roll back
- [ ] Revert through a new pull request if a customer-facing error appears, then revalidate live pages.