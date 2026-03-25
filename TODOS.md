# Future TODOs

## High priority

- **PDF export** — Reports page button shows "coming soon" alert. Implement with `@react-pdf/renderer` or `jsPDF`. CSV export already works.
- **CI/CD pipeline** — Add `.github/workflows/test.yml` to run `pnpm test:api` on push/PR. No automated test gate exists today.
- **SMS notifications** — Stub at `lib/notification-service.ts:103`. Wire in Twilio (or similar). Email via Resend already works end-to-end.

## Medium priority

- **Auto-trigger notifications on booking events** — Email works but only when sent manually from admin UI. Should fire automatically on confirm/cancel/complete, same trigger points as webhooks.
- **OpenAPI spec for Partner API v1** — No formal spec for `/api/v1/` endpoints. Partners integrating the API have no machine-readable reference.

## Low priority (E2E coverage gaps)

The following dashboard/mobile pages have no Playwright E2E tests:
- `/dashboard` (main home)
- `/reports`
- `/customers`
- `/notifications`
- `/settings` (top-level page; `/settings/api-keys` is covered)
- `/advanced-booking`
- `/manual` and `/manual-es`
- `/my-bookings` (mobile)
