# SalesHub Dashboard Build Status

## Status date

June 27, 2026

## Current state

The first live Metabase dashboard build is created.

Dashboard:

- `SalesHub Portfolio Master - Validated`
- dashboard id: `217`
- URL: `https://metabase.rentok.com/dashboard/217`

Collection:

- `Sanchay Raj's Personal Collection`
- collection id: `4`

## What is already done

### Grounding

- backend SalesHub report logic reviewed
- existing Metabase SalesHub assets reviewed
- public/user dashboards reviewed as query-shape references

### Validation

Named PM slices validated live:

- `Siddhant`
- `Ayush`

Validation docs:

- `RENTOK_SALESHUB_PORTFOLIO_VALIDATION_SIDDHANT.md`
- `RENTOK_SALESHUB_PORTFOLIO_VALIDATION_AYUSH.md`
- `RENTOK_SALESHUB_PORTFOLIO_VALIDATION_SUMMARY.md`

### Dashboard assets created

Saved question cards created in Metabase:

- `SalesHub Portfolio - Account Rows`
- `SalesHub Portfolio - Linked Real Properties`
- `SalesHub Portfolio - Unlinked Rows`
- `SalesHub Portfolio - Current Due`
- `SalesHub Portfolio - Total Paid`
- `SalesHub Portfolio - Expiring in 30 Days`
- `SalesHub Portfolio - Plan Mix`
- `SalesHub Portfolio - High Due Accounts`
- `SalesHub Portfolio - Account Drill Table`

These are attached to dashboard `217`.

## Important build rules discovered live

- Use the SalesHub plans account scope.
- Keep `tenant.status in (1, 2)`.
- Keep `tenant.room in ('Basic', 'Silver', 'Trial', 'Gold', 'Enterprise')` for the first release.
- Show unlinked rows explicitly.
- Treat `active_tenants` as nullable operational data, not perfect truth.
- Keep drill-through detail for dues.

## Browser verification state

Verified:

- dashboard `217` exists
- dashboard `217` renders in Metabase
- all `9` cards are attached
- unfiltered dashboard page shows live values

Not fully verified yet:

- filtered deep-link browser pass for PM-specific URL states in headless mode

Observed quirk:

- headless browser auth sometimes falls back to login for filtered deep links
- this looked like a session/auth quirk, not a missing dashboard problem

## Best next steps

1. polish dashboard card titles and descriptions inside Metabase
2. improve visual layout if needed
3. verify `Siddhant` and `Ayush` again in an interactive browser session or non-headless flow
4. decide whether to add:
   - billed beds tile
   - active tenants tile
   - note text about unlinked rows and nullable tenant counts
5. only then consider PM-specific filtered clones

## Continuation note

If this work resumes in Claude Code or another client, start from:

- this file
- `RENTOK_SALESHUB_PORTFOLIO_DASHBOARD_SPEC.md`
- `RENTOK_SALESHUB_PORTFOLIO_BASE_QUERY.md`
- `RENTOK_SALESHUB_PORTFOLIO_VALIDATION_SUMMARY.md`

Then inspect live Metabase dashboard `217` and continue from the current board rather than rebuilding it.
