# SalesHub Portfolio Validation - Siddhant

## Validation date

June 27, 2026

## Why this slice

`Siddhant` is a named portfolio-manager bucket in live SalesHub data.

It is a better first validation slice than a system bucket such as:

- `2026 Users`
- `2025 Users`
- `2024 Users`
- `Users Older Than 2024`
- `Test Account`

## Filters used

- `property.pg_id = 'Rt7Oa2L3A4PiHb0NvSh2rQvods93'`
- `property.pg_name = 'Siddhant'`
- `tenant.status in (1, 2)`
- `tenant.room in ('Basic', 'Silver', 'Trial', 'Gold', 'Enterprise')`

## Live validated numbers

### Portfolio size

- SalesHub account rows: `358`
- distinct linked real properties: `327`
- unlinked SalesHub rows: `31`
- billed beds sum: `39,046`
- active tenants sum: `42,372`

### Money health

- total paid amount: `4,804,289`
- current due amount: `680,761`
- accounts expiring in next `30` days: `8`

### Plan mix

- `Gold Plan`: `159`
- `Trial Plan`: `79`
- `Silver Plan`: `70`
- `Basic Plan`: `45`
- `Onboarding Plan`: `3`
- `Enterprise Plan`: `2`

## Sample high-due accounts

Top sample rows from live data:

| Account | Linked property | Plan | Total paid | Current due | Plan end date |
|---|---|---|---:|---:|---|
| `VIRASAT RESIDENCY(3020204763A)` | unlinked | Gold Plan | 22,000 | 158,000 | 2027-06-14 |
| `Siddharth Majestic Boys Residency` | `4520016143A` | Gold Plan | 0 | 80,000 | - |
| `Le Bestow Living Private Limited` | `5000819059A` | Gold Plan | 0 | 36,001 | - |
| `Sukoon(2013015465A)` | unlinked | Gold Plan | 0 | 32,810 | - |
| `THAR GROUP BOY'S PG` | `3020192426A` | Silver Plan | 20,000 | 30,000 | 2027-03-31 |

## Important findings

### 1. The named PM slice is real and queryable

This confirms the first dashboard can be validated on a real PM-owned bucket.

### 2. Not every SalesHub row links to a real property

`31` rows were unlinked in this slice.

So the dashboard should show:

- linked real properties
- unlinked SalesHub rows

This should be visible, not hidden.

### 3. `active_tenants` is useful but incomplete

Live sampling showed many rows with `active_tenants = null`.

So:

- summing `active_tenants` is still useful operationally
- but it should be treated as nullable operational data, not perfect truth

### 4. The PM validation slice works best with plan-row filtering

The stable validation slice used:

- `tenant.room in ('Basic', 'Silver', 'Trial', 'Gold', 'Enterprise')`

That should remain in the first dashboard build.

## Confidence

### Base account-row shape

High

Why:

- PM bucket exists in live data
- row-level samples work
- money joins work
- link/unlink behavior is visible

### Active-tenant completeness

Medium

Why:

- field is operationally useful
- but many rows are null

### Dashboard rollout readiness

Medium-high

Why:

- the first named PM slice validated well
- but one more PM slice should be checked before broader rollout

## Recommended next step

Validate one more named PM bucket, ideally:

- `Ayush`
or
- `Pankaj`

If the second named PM slice behaves similarly, the master dashboard build can proceed with much higher confidence.
