# SalesHub Portfolio Validation - Ayush

## Validation date

June 27, 2026

## Why this slice

`Ayush` is a second named portfolio-manager bucket in live SalesHub data.

This was used to test whether the validated shape from `Siddhant` also holds on another real PM-owned bucket.

## Filters used

- `property.pg_id = 'Rt7Oa2L3A4PiHb0NvSh2rQvods93'`
- `property.pg_name = 'Ayush'`
- `tenant.status in (1, 2)`
- `tenant.room in ('Basic', 'Silver', 'Trial', 'Gold', 'Enterprise')`

## Live validated numbers

### Portfolio size

- SalesHub account rows: `342`
- distinct linked real properties: `296`
- unlinked SalesHub rows: `46`
- billed beds sum: `35,329`
- active tenants sum: `45,769`

### Money health

- total paid amount: `6,764,731`
- current due amount: `4,216,580`
- accounts expiring in next `30` days: `8`

### Plan mix

- `Gold Plan`: `158`
- `Silver Plan`: `87`
- `Basic Plan`: `52`
- `Trial Plan`: `37`
- `Enterprise Plan`: `8`

## Sample high-due accounts

Top sample rows from live data:

| Account | Linked property | Plan | Total paid | Current due | Plan end date |
|---|---|---|---:|---:|---|
| `Dhankawadi Boys 1` | `4121017555A` | Gold Plan | 0 | 826,000 | - |
| `Livesta A Block` | `5600781212A` | Gold Plan | 0 | 307,176 | - |
| `Pro4 Socio - Coliving Space & PG` | `5600371675A` | Gold Plan | 264,601 | 301,840 | 2026-12-31 |
| `AHPL Gulmohar Hostel` | `1100163982A` | Gold Plan | 200,000 | 257,701 | 2026-03-31 |
| `Lakshmi Niwas` | `1100314281A` | Gold Plan | 273,000 | 234,840 | 2026-03-31 |

## Important findings

### 1. The base account-row shape holds on a second named PM

This is the key rollout signal.

The same core slice worked again:

- named PM bucket
- status filter
- plan-row filter
- linked property join
- plan and money joins

### 2. Unlinked rows are still material

`46` rows were unlinked in this slice.

This again confirms that the dashboard must show:

- linked real properties
- unlinked SalesHub rows

### 3. `active_tenants` is again incomplete

Live sampling showed `47` rows with `active_tenants = null` in the most common bucket.

So the same rule holds:

- useful operational metric
- not complete enough to present as perfect truth

### 4. Dues concentration can be very large even on a validated PM slice

This slice has much higher due totals than `Siddhant`.

So dashboard money cards should always keep:

- drill-through to row detail
- visible top-due accounts
- anomaly-aware interpretation

## Confidence

### Base account-row shape

High

### Money join shape

High

### Active-tenant completeness

Medium

### Dashboard build readiness

High

Why:

- the same validated pattern worked on two real PM buckets
- the important caveats are now explicit

## Rollout implication

After `Siddhant` and `Ayush`, the master dashboard build can proceed.

The first release should still:

- show unlinked rows explicitly
- treat active-tenant totals as nullable operational data
- keep row-level drill tables visible
- avoid cloning PM dashboards until ownership mapping is finalized
