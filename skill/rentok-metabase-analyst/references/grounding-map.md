# Grounding Map

Use this for RentOk table meaning, joins, and formula cautions.

## Core Tables

| Business object | Main table | Key logic |
|---|---|---|
| Property | `property` | `is_test` is the clean test flag |
| Tenant | `tenant` | lifecycle is `status` |
| User | `users` | no verified explicit test flag |
| Room | `room` | has room/bed hierarchy |
| Tenant-room | `tenant_room` | bridge table, count distinct tenants after joins |
| Invoice | `invoices` | dues are `status = 0` and `is_active = 1` |
| Payment | `payments` | collections are payment-side unless using invoice-level filters |
| SalesHub account | `tenant` inside RentOk plans account | account rows can point to real customer property through `tenant.firebase_id = property.id::text` |
| Demo lead | `demo_leads` | sales/demo source, not the same as `tenant.status = 3` |
| External lead | `external_leads` | outside lead source, not tenant lifecycle |
| Lead user action | `lead_users` | microsite or website lead action linked to property |
| Public/user dashboard portfolio | `property.eazypg_id` | customer dashboard filter |

## Tenant Status

- `0` evicted
- `1` tenant
- `2` booking
- `3` lead
- `4` invite
- `5` permanently deleted tenant
- `6` deleted invitation
- `7` deleted lead
- `8` deleted or rejected self invite

Live data has unverified statuses `15` and `100`.
- June 26, 2026 live sample: `status = 100` was entirely tied to `lead_source = 'genie'`.
- June 26, 2026 live sample: `status = 15` was mostly unlabeled.

## Formula Cautions

- Total dues: invoice-side, unpaid active invoice amounts.
- Approved dues base: `invoices.status = 0` and `invoices.is_active = 1`.
- Approved collections base: `invoices.status = 1` and `invoices.is_active = 1`, plus real-payment filters when collection logic requires them.
- Current month dues: unpaid active invoices filtered by due date and due type.
- Collections: state whether the answer is payment-side or invoice-side.
- Deposits: separate deposit dues collected from deposit balance adjusted.
- Occupancy: prefer bed occupancy and say whether it is app-contract grounded or raw-SQL proven.
- Do not assume invoice columns like `is_deleted` or `is_paid`.
- For dues joins, `inv.property = concat(property.pg_id, 'PG', property.pg_number)` and `tenant.firebase_id = inv.payer` are the approved anchors.

## Existing Metabase Assets

Use saved dashboards/questions as hints for vocabulary and query shape, not final truth.

Known useful assets include:

- `01 - Health Pulse`
- `02 - Feature Portfolio`
- `03 - Activation Gap`
- `04 - Workflow Health`
- `Rent Collection`
- `Payment Reporting`
- `All time pending dues`
- `Current Occupancy Status`
- `Active Tenants`
- `Bookings`
- `Deposit Tenant Details`
- `Saleshub Data`
- `Sales Dashboard`
- `Anurag Daily Sheet for Inside Sales`
- `Book Demo leads`
- `All Leads DB`
- `User Dashboard`
- `User Dashboard - Star`
- `User Dashboard - Star Custom`
- `User Dashboard - Vilaasa`
- `Yello Dashboard`
- `Yello Dashboard - Only for Admins`
- `Yello! Final Dashboard`
- `RentOk Optimization Dashboard`

Known stale signal:

- `01 - Health Pulse` mentions `30,447` properties, while live verified active non-deleted property count on June 26, 2026 is `68,808`.

## Canonical Detail Docs

For full detail, read:

- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_ANALYTICS_GLOSSARY.md`
- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_ANALYTICS_FORMULA_MAP.md`
- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_METABASE_EXISTING_ASSETS_GUIDE.md`

## SalesHub Rules

- For SalesHub or portfolio questions, first classify the counting unit.
- Valid units include SalesHub account row, real customer property, demo lead, tenant-table lead, external lead, and lead user action.
- SalesHub report logic is not generic property analytics.
- Demo leads are not tenant-table leads.
- Portfolio manager in SalesHub report logic comes from the internal RentOk plans property grouping.

## Public/User Dashboard Rules

- Search public/user dashboards for customer-facing portfolio, occupancy, movement, complaints, KYC/PV/LLA, and optimization questions.
- Most are filtered by `property.eazypg_id`.
- Room-name joins are common but weaker than id-based joins.
- Old-structure properties often still rely on `tenant.room`.
- Newer property structures can use `tenant_room` or `tenant_stay_history` style logic.
- Prefer property-structure-aware occupancy logic over a universal join rule.
- Some occupancy cards use `tenant.status = 1`; others use `tenant.status IN (1, 2)`.
- Treat Yello short-term/long-term and revenue formulas as client-specific until verified.
