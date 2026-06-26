# RentOk Analytics Formula Map

## What this is

This doc defines the first verified formulas and counting rules that the RentOk Metabase analyst should trust.

It exists because some business questions sound simple but are not.

Examples:

- "collections this month"
- "total dues"
- "occupied beds"
- "deposit collected"

If the analyst answers those without a formula map, it can easily mix:

- invoices vs payments
- paid date vs due date
- room rows vs bed occupancy
- deposit collected vs deposit adjusted

Use this with:

- [RENTOK_ANALYTICS_GLOSSARY.md](./RENTOK_ANALYTICS_GLOSSARY.md)
- [RENTOK_METABASE_ANALYST_SKILL.md](./RENTOK_METABASE_ANALYST_SKILL.md)
- [RENTOK_METABASE_VALIDATION_WORKFLOW.md](./RENTOK_METABASE_VALIDATION_WORKFLOW.md)

## Confidence levels

### High confidence

Use directly in pilot answers.

### Medium confidence

Allowed with a caveat.

### Low confidence

Do not present as a settled business truth without manual review.

## Formula 1: Total dues

**Business question**

`How much money is currently owed?`

**Meaning**

Total dues is an aggregate of unpaid invoices.

**Verified source**

- `dues.md` (`/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/memory-web/modules/money/dues.md:18`)
- backend dues helper filter logic: `helpers.ts` (`/Users/eazypg/rentok-backend/src/v1/list_screens/dues/helpers.ts:126`)

**Current safe formula**

- invoice must be unpaid
- invoice amount must be positive
- invoice must be active
- tenant-facing dues list groups these invoices by tenant

Plain form:

`total_dues = SUM(unpaid active invoice amounts in scope)`

**Operational interpretation**

- unit of money: invoice amount
- unit of grouping on the dues screen: tenant
- unit of truth underneath: invoice

**What the app docs confirm**

- dues rows are built from unpaid invoices
- one due row is a per-tenant aggregate
- total amount is the sum of those unpaid invoice amounts

**Safe answer rule**

If asked for total dues:

- answer from unpaid invoices
- do not use payments
- say whether the number is per property, selected properties, or global

**Confidence**

- `high`

## Formula 1A: Tenants or properties with dues over a threshold

**Business question**

`How many tenants or properties have unpaid dues worth more than 1 lakh?`

**Meaning**

This is a threshold question over unpaid active invoice totals.

The analyst must first choose the grouping unit:

- tenant-level: tenants whose total unpaid dues exceed the threshold
- property-level: properties whose total unpaid dues exceed the threshold

These are different answers.

**Current safe formula**

Tenant-level:

```sql
GROUP BY tenant.id
HAVING SUM(unpaid active invoice amount) > 100000
```

Property-level:

```sql
GROUP BY property.id
HAVING SUM(unpaid active invoice amount) > 100000
```

**Safe answer rule**

Before answering, state:

- threshold amount
- grouping unit
- selected property or all properties
- whether the query is app-cross-checked

**Recommended app cross-check**

For non-technical verification:

1. run the query for one property first
2. open that same property in the manager app
3. compare the dues screen tenant count and tenant names
4. only then run the all-properties version

If the one-property result does not match the app, do not trust the global query yet.

**Confidence**

- `high` for the formula
- `medium` until the selected implementation is app-cross-checked

## Formula 2: Overdue dues

**Business question**

`How much is overdue right now?`

**Meaning**

Overdue dues are unpaid active invoices whose due date is before tomorrow.

**Verified source**

- backend dues filter code: `helpers.ts` (`/Users/eazypg/rentok-backend/src/v1/list_screens/dues/helpers.ts:126`)

**Current safe formula**

`overdue_dues = SUM(unpaid active invoice amounts where due_date < tomorrow)`

**Confidence**

- `high`

## Formula 3: Current month dues buckets

**Business question**

`How much current-month rent dues do we have?`

**Meaning**

These are unpaid active invoices whose due date falls inside the current month, optionally filtered by due type.

**Verified source**

- backend dues filter code: `helpers.ts` (`/Users/eazypg/rentok-backend/src/v1/list_screens/dues/helpers.ts:130`)

**Current verified due-type buckets**

- Rent: `due_type = 'Rent'`
- Electricity: `due_type LIKE 'Electricity%'`
- Mess/Food: `due_type LIKE 'Mess%' OR 'Food%'`
- Deposit bucket: `due_type IN ('Security Deposit', 'Caution Money')`
- Late fine: `due_type = 'Automatic Late Fine' OR 'Manual Late Fine'`
- Short-term: `tenant.is_short_term = true`
- Long-term: `tenant.is_short_term = false`

**Safe answer rule**

If a user asks for a due bucket:

- use unpaid active invoices
- filter by due date window first
- then apply the due-type rule

**Confidence**

- `high`

## Formula 4: Collections

**Business question**

`How much collection did we do?`

**Meaning**

Collections are payment-side, not dues-side.

The app’s collections list is payment-centric, but some totals switch to invoice-level sums depending on filters.

**Verified source**

- `collections.md` (`/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/memory-web/modules/money/collections.md:10`)
- backend collection helper query: `helpers.ts` (`/Users/eazypg/rentok-backend/src/v1/list_screens/collections/helpers.ts:930`)

**Current safe core rules**

- only successful, active payments count
- collection rows are built from `payments` linked to paid invoices
- refunds are subtracted in the backend helper when net invoice amount is derived

**Important split**

There are two different money lenses in current collection logic:

### A. Payment-level lens

Used when no widget/due-type/due-date special case forces invoice-level behavior.

Plain form:

`payment_collection_amount = payment.net_amount - payment.gateway_charges`

### B. Invoice-level lens

Used in filter/widget scenarios where invoice allocation is what matters.

Plain form:

`invoice_collection_amount = invoice.amount - refunded_amount`

**Why this matters**

The displayed total can change meaning depending on the filters used.

So the analyst must not answer "collections" without stating:

- paid-date based or due-date based
- payment-level or invoice-level
- refund-adjusted or not

**Safe answer rule**

For a first pilot, the safest default meaning of "collection this month" is:

- successful active payments
- filtered by `paid_date`
- with the paid-date window stated clearly

If the user asks a due-type or invoice-bucket collection question, label it as invoice-level collection.

**Confidence**

- `medium`

Because the logic is verified, but the business meaning can still drift depending on which lens is intended.

## Formula 5: Deposit-adjusted vs deposit-collected

**Business question**

`How much deposit did we collect?`

This is dangerous because there are two different ideas:

1. deposit dues collected today
2. deposit balance adjusted against other dues

They are not the same.

**Verified source**

- `collections.md` (`/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/memory-web/modules/money-collections.md:242`)
- [caution_money.md](/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/caution_money.md:39)

**Current verified rules**

- deposit due bucket includes `Security Deposit` and `Caution Money`
- deposit-type adjustments cannot pay deposit dues
- deposit-type adjustments can only be applied to non-deposit dues

**Safe answer rule**

If asked about deposit:

- first clarify whether they mean deposit dues collected or deposit balance adjusted
- never merge those into one number

**Confidence**

- `medium`

## Formula 6: Occupied beds and vacant beds

**Business question**

`What is our occupancy?`

**Meaning**

The existing dashboard contract defines occupancy as bed-based, not room-count-based.

**Verified source**

- dashboard field map: `dashboard.md` (`/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/memory-web/modules/people/dashboard.md:145`)

**Current safe formulas**

- `occupied_beds` = currently occupied beds
- `vacant_beds = beds_count - occupied_beds`

**Safe answer rule**

If asked for occupancy:

- prefer bed occupancy, not raw room count
- explicitly say whether the answer is bed occupancy or room occupancy

**Known limitation**

This doc verifies the dashboard contract, but not the raw SQL used to compute those fields. So it is safe for app-aligned reporting, but not yet a backend-independent source-of-truth proof.

**Confidence**

- `medium`

## Formula 7: Active tenants, bookings, leads

**Business question**

`How many active tenants / bookings / leads do we have?`

**Meaning**

These come from `tenant.status`, not from separate tables.

**Verified source**

- `tenant.ts` (`/Users/eazypg/rentok-backend/src/entities/tenant.ts:154`)

**Current safe formulas**

- active tenants: `tenant.status = 1`
- bookings: `tenant.status = 2`
- leads: `tenant.status = 3`

**Confidence**

- `high`

## Unsafe simplifications

The analyst should refuse or caveat these shortcuts.

### Unsafe shortcut

`collections = sum of invoice.amount for paid invoices`

**Why unsafe**

This ignores refund adjustment, payment lens differences, and gateway-charge behavior.

### Unsafe shortcut

`occupancy = occupied rooms / total rooms`

**Why unsafe**

The current app contract uses beds, and the room model supports room/bed hierarchy.

### Unsafe shortcut

`test users = users whose email contains test`

**Why unsafe**

This is only heuristic text matching, not a verified business flag.

## What the analyst should say out loud

For finance and occupancy questions, the analyst should always expose:

1. counting unit
2. date field used
3. whether the number is invoice-side or payment-side
4. whether deposit adjustment is included
5. confidence level

## Recommended pilot-safe question set

These are now safer for pilot use:

- total dues
- overdue dues
- current month rent dues
- current month electricity dues
- active tenants
- bookings
- leads
- test vs real properties

These should still carry a caveat:

- collection this month
- deposit collected vs adjusted
- occupancy
- test vs real users

## Public/user dashboard formula hints

The public/user dashboards add useful formula hints for customer-facing analysis:

- portfolio/customer dashboard filters usually use `property.eazypg_id`
- room and tenant cards often join by `tenant.room = room.name` plus matching property
- bed-level cards may use `tenant_room` for stronger room/bed grounding
- occupancy cards differ on whether they include only active tenants or active tenants plus bookings
- Yello short-term and long-term formulas should be treated as client-specific until the room category filters are verified
- dashboard revenue/dues formulas are operational references and must be cross-checked before finance use

Detailed reference:

- [RENTOK_METABASE_PUBLIC_USER_DASHBOARDS.md](./RENTOK_METABASE_PUBLIC_USER_DASHBOARDS.md)

## Next proof layer

Before broad rollout, the next validation pass should prove:

- the exact SQL/source used for dashboard occupancy fields
- the final business definition of collections for leadership reporting
- the exact treatment of refunds, credits, advances, and gateway charges in reporting numbers
- which public/user dashboard formulas are generic and which are client-specific
