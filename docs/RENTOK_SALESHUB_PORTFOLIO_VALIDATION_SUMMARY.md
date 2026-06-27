# SalesHub Portfolio Validation Summary

## Validation date

June 27, 2026

## What was validated

Two named SalesHub portfolio-manager buckets were validated live:

- `Siddhant`
- `Ayush`

Both used the same first-build slice:

- `property.pg_id = 'Rt7Oa2L3A4PiHb0NvSh2rQvods93'`
- `tenant.status in (1, 2)`
- `tenant.room in ('Basic', 'Silver', 'Trial', 'Gold', 'Enterprise')`

## Side-by-side result

| Metric | Siddhant | Ayush |
|---|---:|---:|
| SalesHub account rows | `358` | `342` |
| distinct linked real properties | `327` | `296` |
| unlinked SalesHub rows | `31` | `46` |
| billed beds sum | `39,046` | `35,329` |
| active tenants sum | `42,372` | `45,769` |
| total paid amount | `4,804,289` | `6,764,731` |
| current due amount | `680,761` | `4,216,580` |
| accounts expiring in next `30` days | `8` | `8` |

## What this proves

### 1. The base account-row dashboard shape is real

It works on more than one named PM bucket.

That is enough to proceed with the master dashboard build.

### 2. Unlinked rows are part of the real operating picture

Both PM buckets had meaningful unlinked counts.

So the dashboard must show:

- linked real properties
- unlinked SalesHub rows

### 3. `active_tenants` is operationally useful but incomplete

Both slices had many null rows in `active_tenants`.

So:

- keep the metric
- do not oversell it as perfect truth

### 4. Money shape is usable, but due amounts need drill-through

The second PM slice had a much larger due total.

So row-level detail is not optional.

The dashboard should include:

- current due summary
- high-due detail table
- visible sample rows or drill-through path

## Verdict

The master SalesHub portfolio dashboard is ready to move from validation to build.

Recommended confidence:

- base account-row shape: **high**
- money join shape: **high**
- active-tenant completeness: **medium**
- PM cloning readiness: **not yet**

## Recommended next step

Build the actual Metabase master dashboard from the validated base query and first-release card set.
