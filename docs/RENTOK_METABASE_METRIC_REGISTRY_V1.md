# RentOk Metabase Metric Registry v1

## What this is

This is the first structured registry for approved RentOk analytics metrics.

It is not complete yet.

It is the skeleton that turns the skill from:

- broad natural-language guessing

into:

- approved metrics
- approved formulas
- approved joins
- known caveats
- known validation paths

## Registry status labels

### Approved

Can be used in team rollout with normal live verification.

### Guarded

Usable, but only with caveats, anomaly checks, or app cross-checks.

### Draft

Not rollout-safe yet.

## Registry fields

Each metric should eventually contain:

- metric id
- user wording
- family
- status
- counting unit
- date anchor
- approved source tables
- approved joins
- approved filters
- anti-patterns
- dashboard evidence
- backend grounding
- app validation path
- confidence policy

## Core metrics v1

| Metric ID | User wording | Family | Status | Counting unit | Date anchor | Notes |
|---|---|---|---|---|---|---|
| `properties_test_vs_real_active_only` | What % of properties are test and what % are real? | property_scope | Approved | property row | now | must state active non-deleted scope |
| `properties_active_non_deleted_total` | How many active properties do we have? | property_scope | Approved | property row | now | use explicit deleted-scope wording |
| `tenants_active_total` | How many active tenants do we have? | tenant_lifecycle | Approved | tenant row | now | `tenant.status = 1` |
| `tenants_booking_total` | How many bookings do we have? | tenant_lifecycle | Approved | tenant row | now | `tenant.status = 2` |
| `tenants_lead_total` | How many leads do we have? | tenant_lifecycle | Guarded | tenant row | now | user may mean demo leads instead |
| `dues_total_global` | How much total dues do we have? | dues_finance | Guarded | invoice amount aggregate | due-side | approved invoice formula only |
| `dues_over_threshold_tenant_level` | How many tenants have dues above 1 lakh? | dues_finance | Guarded | tenant aggregate | due-side | requires anomaly scan |
| `dues_over_threshold_property_level` | How many properties have dues above 1 lakh? | dues_finance | Guarded | property aggregate | due-side | requires anomaly scan |
| `collections_current_month` | How much collection did we do this month? | collections_finance | Guarded | money aggregate | paid date | payment-mode caveats matter |
| `occupancy_current_status` | What is the current occupancy? | occupancy_rooms_beds | Guarded | room or bed occupancy | now | must clarify occupancy unit |
| `beds_vacant_total` | How many vacant beds do we have? | occupancy_rooms_beds | Guarded | bed slot | now | property structure matters |
| `move_ins_current_month` | How many move-ins happened this month? | lifecycle_movement | Guarded | tenant move-in | join date | duplicate cards exist in dashboards |
| `move_outs_current_month` | How many move-outs happened this month? | lifecycle_movement | Guarded | tenant move-out | checkout / eviction date | exact date field matters |
| `tenants_under_notice` | How many tenants are under notice? | lifecycle_movement | Draft | tenant row | now | state model still needs hard grounding |
| `tenants_under_eviction` | How many tenants are under eviction? | lifecycle_movement | Draft | tenant row | now | separate from notice logic |
| `saleshub_portfolio_manager_account_rows` | How many SalesHub accounts are under a portfolio manager? | saleshub_portfolio | Draft | SalesHub account row | now | not normal property analytics |
| `saleshub_portfolio_manager_real_properties` | How many real properties belong to a portfolio manager? | saleshub_portfolio | Draft | real customer property | now | requires plans-account join logic |
| `demo_leads_total` | How many demo leads do we have? | leads_demo | Guarded | demo lead row | created or demo date | must state chosen date anchor |
| `booking_bot_leads_total` | How many leads came from Booking Bot? | leads_demo | Draft | lead row | created date | current saved logic is risky |
| `feature_usage_top_properties` | Which properties are using the most features? | product_adoption | Guarded | property rollup | period-based | dashboard `194` is a strong source |

## Initial approved rules

### `properties_test_vs_real_active_only`

- use `property`
- use `is_test`
- state that the scope is active non-deleted properties
- stamp the live verification date

### `tenants_active_total`

- use `tenant.status = 1`
- do not silently include statuses `15` or `100`

### `tenants_booking_total`

- use `tenant.status = 2`

### `dues_total_global`

- use `invoices.status = 0`
- use `invoices.is_active = 1`
- do not invent invoice columns
- do not switch to payments

### `dues_over_threshold_*`

- clarify tenant-level vs property-level first
- use approved invoice formula
- inspect top rows
- compare max vs p99
- if anomaly-heavy, say so clearly
- prefer one real-property validation before broad trust

### `collections_current_month`

- use approved collection logic
- be explicit about paid date
- exclude fake or adjustment-like payment modes only when the approved formula says so

### `occupancy_current_status`

- clarify room-level vs bed-level
- identify whether the relevant structure is old-style or new-style
- do not blindly force `tenant_room`

## Registry build sequence

### Wave 1

Build fully first:

1. `properties_test_vs_real_active_only`
2. `properties_active_non_deleted_total`
3. `tenants_active_total`
4. `tenants_booking_total`
5. `dues_total_global`
6. `dues_over_threshold_tenant_level`
7. `dues_over_threshold_property_level`

### Wave 2

Then build:

1. `collections_current_month`
2. `occupancy_current_status`
3. `beds_vacant_total`
4. `move_ins_current_month`
5. `move_outs_current_month`

### Wave 3

Then build:

1. `saleshub_portfolio_manager_account_rows`
2. `saleshub_portfolio_manager_real_properties`
3. `demo_leads_total`
4. `booking_bot_leads_total`
5. `feature_usage_top_properties`

## Promotion rule

A metric should not move from Draft or Guarded to Approved unless it has:

1. backend grounding
2. live Metabase verification
3. known anti-patterns
4. dashboard evidence if relevant
5. one practical validation path if app-visible
