# SalesHub Leadership Dashboard Build Result

## Status date

June 27, 2026

## Dashboard updated

- dashboard: `SalesHub Portfolio Master - Validated`
- dashboard id: `217`
- URL: `https://metabase.rentok.com/dashboard/217`

## What was added

The leadership layer was added to the existing validated SalesHub dashboard.

New leadership cards:

- `SalesHub Leadership - PM Review Table`
- `SalesHub Leadership - Current Due by PM`
- `SalesHub Leadership - Overdue Accounts by PM`
- `SalesHub Leadership - Expiring Plans by PM`
- `SalesHub Leadership - Linked Coverage by PM`
- `SalesHub Leadership - Top Due Accounts`
- `SalesHub Leadership - 30 Plus Day Overdue Accounts`
- `SalesHub Leadership - Plans Expiring in 30 Days`
- `SalesHub Leadership - Unlinked High Value Accounts`
- `SalesHub Leadership - Due Aging by PM`
- `SalesHub Leadership - Collection Month Compare`

Live dashboard card count after build:

- total dashboard cards: `22`
- leadership cards: `11`

## Build script

The live build used:

- `scripts/build_saleshub_leadership_dashboard.js`

The script:

- logs in with `METABASE_USER_EMAIL` and `METABASE_PASSWORD`
- creates or updates saved Metabase cards
- validates each card query before saving the dashboard layout
- attaches missing leadership cards to dashboard `217`
- reuses existing leadership cards by exact name on rerun

No credentials are stored in the script.

## Live PM validation

The PM comparison query was checked for:

- `Ayush`
- `Pankaj`
- `Siddhant`

Validation output:

| PM | accounts | linked properties | unlinked accounts | linked coverage | billed beds | active tenants | current due | overdue accounts | max account due | expiring 30 days | collected this month | collected last month |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Ayush | 342 | 296 | 46 | 86.55% | 35,329 | 45,769 | 4,216,580 | 70 | 826,000 | 24 | 1,412,346 | 1,017,215 |
| Pankaj | 239 | 204 | 35 | 85.36% | 44,659 | 40,952 | 811,860 | 13 | 346,360 | 7 | 742,194 | 996,342 |
| Siddhant | 358 | 327 | 31 | 91.34% | 39,046 | 42,372 | 680,761 | 23 | 158,000 | 13 | 846,808 | 1,398,511 |

## What this means

The dashboard now supports sales-head review better than the first validated base.

It can show:

- which PM has the largest due exposure
- which PM has the most overdue accounts
- which plans need renewal follow-up
- which accounts need dues follow-up
- which large accounts have broken property links
- whether PM-level account links are clean enough to trust

## Important caveats

- This is still based on the SalesHub plans account shape.
- System buckets are excluded from leadership cards:
  - `2026 Users`
  - `2025 Users`
  - `2024 Users`
  - `Users Older Than 2024`
  - `Test Account`
- `bed_sold` and `active_tenants` are text-shaped in the database, so the script casts only numeric-looking values.
- The PM slices were validated through live Metabase queries, not through a browser-filtered visual session.
- One linked real property should still be cross-checked in the manager app before calling this fully rollout-ready for sales leadership.

## Recommended next check

Open dashboard `217` in Metabase and review it as a sales head.

Check:

- Are the PM comparison cards visible enough?
- Do the action queues answer what Pankaj, Ayush, and Siddhant would ask in a review?
- Does any card need to move above the old validation cards?
- Are the labels plain enough for non-technical sales users?

If the answer is yes, the next step is visual polish and one app cross-check.
