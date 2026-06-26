# RentOk Metabase Existing Assets Guide

## What this is

This doc explains how to use the dashboards and saved questions that already exist inside RentOk Metabase.

They are useful.

But they are not automatic source-of-truth.

Use them for:

- business vocabulary
- likely table relationships
- metric naming patterns
- already trusted slices of analysis

Do not use them blindly for:

- final numbers
- hard policy decisions
- finance truth without cross-checking current live queries

## The right mindset

Think of existing Metabase assets as:

1. a map of how RentOk teams already think about the business
2. a library of likely useful joins and filters
3. a hint system for what questions matter to which team

They are not enough on their own because:

- some assets are old
- some are duplicates
- some are client-specific
- some dashboard descriptions already show stale baselines

## Best rule

When an existing dashboard or question matches the user ask:

1. inspect it for business wording and logic shape
2. inspect the underlying query if available
3. reuse the logic only if it matches verified backend meaning
4. re-run the metric live before presenting it as current truth

## Important warning from live inspection

One current dashboard already shows why this matters:

- dashboard `01 — Health Pulse`
- description says baseline: `30,447 properties`

But the current live property count verified on June 26, 2026 is:

- total properties: `70,396`

So existing assets are useful context, but not automatically current truth.

## What I found useful already

## Product and feature-adoption dashboards

These are strong candidates for product, product ops, and design questions:

- `01 — Health Pulse`
- `02 — Feature Portfolio`
- `03 — Activation Gap`
- `04 — Workflow Health`
- `05 — Team Targets`
- `Feature Release Health — Jun 2026`
- `Property Data Quality Dashboard`
- `Tenant Profile Data Quality`

Why they matter:

- they use product-language that teams already understand
- they show workflow-level framing, not only raw tables
- they likely contain useful property-scoped logic patterns

## Marketing and growth dashboards

Good candidates for marketing and growth vocabulary:

- `Marketing Dashboard`
- `Anil Marketing Dashboards`
- `Funnel Optimisation`
- `Saleshub Data`

Why they matter:

- they capture funnel language
- they may define the current terms the business team already uses

## Sales and sales-ops dashboards

Good candidates for sales ops:

- `Sales Dashboard`
- `Anurag Daily Sheet for Inside Sales`
- `Saleshub Data`
- `Book Demo leads`
- `All Leads DB`

Why they matter:

- they can reveal what counts as a lead in practice
- they can show which lead-related tables are already in business use
- they may show the current portfolio-manager and inside-sales operating language

## SalesHub and portfolio context

SalesHub needs special handling.

The backend does not treat every SalesHub question as normal property analytics. It has a special RentOk plans account used for SalesHub plan, account, dues, collection, and portfolio-manager reporting.

### Backend-grounded meaning

SalesHub reports are available only for the internal RentOk plans PG id.

Current backend report labels include:

- `SalesHub Master Report`
- `SalesHub Collection Report`
- `SalesHub Dues Report`

These reports use fields such as:

- user name and contact
- portfolio manager
- bed count and tenant count
- current plan and bed price
- total paid and current due
- plan start and end date
- contract duration
- payment amount and mode
- UTR and proof links
- invoice type
- GST breakdown

### Important model shape

In the SalesHub master report:

- the internal RentOk plans property provides the portfolio-manager grouping
- the SalesHub account row is a `tenant` row
- `tenant.firebase_id` can point to the real customer `property.id`
- the real customer property gives customer property details such as RentOk ID, contact, city, pincode, state, and property count

So the analyst must not flatten SalesHub into a simple `property` count.

### SalesHub question routing

When the user asks about "portfolio", "portfolio users", "portfolio manager", "plan", "renewal", "customer account", or "sales follow-up", route the question first:

| User wording | Likely source | Caution |
|---|---|---|
| portfolio manager users | SalesHub master report logic | Count SalesHub account rows, not all properties |
| plan, renewal, expiry, blocked account | RentOk plans account plus invoices/payments | Check whether user asks account state or money state |
| demo leads, book demo | `demo_leads` and saved sales dashboards | Not the same as tenant-table leads |
| external leads | `external_leads` | Not the same as current product leads |
| property pipeline | may span `demo_leads`, `tenant`, `lead_users`, `property` | State the chosen source |
| current active users by portfolio | SalesHub plan/account rows plus real property join | Verify the active definition |

### SalesHub saved assets to inspect first

- `Saleshub Data`
- `Sales Dashboard`
- `Anurag Daily Sheet for Inside Sales`
- `Book Demo leads`
- `All Leads DB`

Use these to learn the team's live wording and filters, then verify through a fresh query.

### SalesHub answer rule

For any SalesHub or portfolio answer, always state:

- whether the unit is a SalesHub account row, real customer property, demo lead, or tenant lead
- whether the source is a saved dashboard, backend report logic, or a fresh Metabase query
- whether the number excludes internal/test properties

## Public/user dashboards

The public/user dashboard family is especially useful for complex joins because it already powers customer-facing or client-specific operational views.

High-value dashboards:

- `User Dashboard`
- `User Dashboard - Mobile`
- `User Dashboard - Star`
- `User Dashboard - Star Custom`
- `User Dashboard - Vilaasa`
- `Yello Dashboard`
- `Yello Dashboard - Only for Admins`
- `Yello! Final Dashboard`
- `RentOk Optimization Dashboard`

Why they matter:

- they contain many native SQL cards
- most are filtered by `property.eazypg_id`
- they cover rooms, beds, occupancy, tenants, bookings, move-ins, move-outs, complaints, KYC, PV, agreements, dues, revenue, and feature usage
- the Yello dashboards are strong references for short-term vs long-term room logic
- the Vilaasa dashboard shows bed-level `tenant_room` joins
- the optimization dashboard shows cross-feature property summaries

Observed reusable joins:

| Use case | Join pattern |
|---|---|
| tenant to property | `tenant.property_id = property.id` |
| room to property | `room.property_id = property.id` |
| tenant to room by name | `tenant.room = room.name AND tenant.property_id = room.property_id` |
| bed-level tenant relation | `tenant_room.room_id = room.id` and `tenant_room.tenant_id = tenant.id` |
| invoice to tenant | `invoices.payer = tenant.firebase_id` |
| invoice to property string | `invoices.property = property.pg_id || 'PG' || property.pg_number` |
| complaints to property | `complaints.property_id = property.id` |
| complaints to tenant | `complaints.tenant_id = tenant.id` |

Important caveats:

- room-name joins are useful but weaker than id-based joins
- some occupancy cards count only active tenants while others include bookings
- Yello-specific short-term/long-term logic should not be generalized without checking filters
- dashboard revenue cards are operational formulas, not automatically finance-final truth

For full detail, use:

- [RENTOK_METABASE_PUBLIC_USER_DASHBOARDS.md](./RENTOK_METABASE_PUBLIC_USER_DASHBOARDS.md)

## Money and collections dashboards

Strong candidates for business ops, finance ops, and product ops:

- `Rent Collection`
- `Rent Collection — May 2026`
- `Payment Reporting`
- `Payment Gateway`
- `Payment Gateway Routing`
- `MDR Collected from Tenants`
- `Dues and loss summary`
- `Dues/Loss Summary`

Why they matter:

- they show the actual money vocabulary used internally
- they can reveal whether the current question is payment-side or invoice-side

## Saved questions that look especially useful

These saved questions are likely high-value for schema understanding and team-facing use.

### Dues

- `All time pending dues`
- `Current Month Dues`
- `Current Month Rent Dues`

Observed useful pattern:

- unpaid invoices
- `i.status = 0`
- direct due-type filters
- property join from invoice property string to `property`

### Collections

- `50k rent collection`
- `Current Month Collection`
- `Current Month Rent Collection`
- `Difference in rent collection`

Observed useful pattern:

- collection logic is often money-side, but not always identical across saved assets

### Occupancy

- `Current Occupancy Status`
- `All Long Term Room with their categories & Occupancy Status`
- `All Short Term Room with their categories & Occupancy Status`

Observed useful pattern:

- room hierarchy and room category logic matter
- occupancy is not safely reducible to naive room count

### Tenant and booking lifecycle

- `Active Tenants`
- `Current Tenants`
- `Bookings`
- `Bookings (Upcoming Tenants)`
- `Booking Analytics`
- `Booking Details`
- `Booking Stats`
- `Active Tenant in Any Month For a Property`

Observed useful pattern:

- teams already report on tenant lifecycle slices separately
- these assets can help define how people naturally phrase status questions

### Leads

- `All Leads DB`
- `Book Demo leads`
- `FA — Leads monthly`

Observed useful pattern:

- lead reporting may span more than one operational source
- the analyst should still prefer verified backend meaning when the ask is specifically about `tenant.status = 3`

### Deposits

- `Deposit Tenant Details`

Observed useful pattern:

- deposit logic is already treated as a special reporting slice
- this supports the decision to keep deposit questions separate from general collections

## What existing assets are best for by team

### Business team

Best use:

- high-level dashboards
- product and revenue vocabulary
- current business language

Good starting assets:

- `01 — Health Pulse`
- `02 — Feature Portfolio`
- `03 — Activation Gap`
- `Rent Collection`
- `Payment Reporting`

### Marketing team

Best use:

- funnel language
- campaign vocabulary
- top-of-funnel and property-level growth slices

Good starting assets:

- `Marketing Dashboard`
- `Funnel Optimisation`
- `Book Demo leads`

### Sales ops

Best use:

- lead and demo reporting
- inside-sales operational slices

Good starting assets:

- `Sales Dashboard`
- `Anurag Daily Sheet for Inside Sales`
- `All Leads DB`

### Product ops

Best use:

- workflow health
- usage and activation logic
- property data quality

Good starting assets:

- `04 — Workflow Health`
- `Property Data Quality Dashboard`
- `Tenant Profile Data Quality`

### Product and design

Best use:

- feature-adoption framing
- workflow completion framing
- quality and activation gap framing

Good starting assets:

- `02 — Feature Portfolio`
- `03 — Activation Gap`
- `Feature Release Health — Jun 2026`

## Practical analyst rule

When a user asks a natural-language question, the analyst should do this:

### Step 1

Check whether a saved dashboard or question already covers a very similar business concept.

### Step 2

If yes, use that asset to learn:

- the business term
- the likely filters
- the likely joins

### Step 3

Then still verify the answer live.

### Step 4

If the saved asset conflicts with live data, trust the live query and mention that the saved asset appears stale.

## Recommended use inside the skill

The analyst should prefer this order:

1. backend entity meaning
2. formula map
3. existing Metabase asset as hint
4. live query for final answer

That keeps the system grounded without ignoring the real business context teams already use.

## What this changes in the rollout

This means the rollout package is now stronger in two ways:

- it can answer from schema and backend truth
- it can also borrow the business team's own reporting language from existing Metabase work

That is exactly the kind of thing that makes the eventual experience feel smart and familiar to non-technical users.

## Related rollout assets

- [RENTOK_METABASE_PROMPT_PACK.md](./RENTOK_METABASE_PROMPT_PACK.md)
- [RENTOK_METABASE_PILOT_SCORECARD.md](./RENTOK_METABASE_PILOT_SCORECARD.md)
