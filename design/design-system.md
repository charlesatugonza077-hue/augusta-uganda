# Augusta UI system

## Purpose
A calm, practical interface for Uganda’s small-business owners: clear choices, readable on a phone, and never overly corporate.

## Foundations
- **Type:** system sans-serif. Headings are bold and compact; body text is plain and comfortable to scan.
- **Colour:** Deep green `#14342d` for confidence, green `#16735c` for active/supporting elements, warm gold `#ffca58` for primary actions, paper `#fffdf8` for the page, mint `#d7f5de` for supportive panels.
- **Spacing:** 8px base unit. Use 16px minimum between related controls and 44px minimum interactive height.
- **Contrast:** body text uses dark green on paper; never convey meaning with colour alone.
- **Motion:** small transitions only. Respect `prefers-reduced-motion`.

## Components
| Component | Use | Rules |
|---|---|---|
| Primary button | the one next action | gold fill, dark border, clear verb |
| Secondary button | a useful alternative | paper fill, same border/shape |
| Form field | collecting one clear detail | label visible above, hint only when needed |
| Status message | send state or an error | live region, words first, colour second |
| Section label | orienting the reader | short, uppercase, never the only heading |
| Card | grouping a decision or offer | one purpose per card |

## Enquiry experience
1. Explain what information is needed and what not to share.
2. Ask for only name, business, a preferred contact, the kind of help and a short description.
3. Use a consent checkbox before sending.
4. Confirm only after the backend confirms receipt.
5. Do not claim a response time until Augusta decides one.

## Accessibility checks
- Every form input has a programmatic label.
- Keyboard focus is visible.
- Required fields use native browser validation.
- Sending state disables the submit button to prevent duplicates.
- The result is announced in an `aria-live` region.
