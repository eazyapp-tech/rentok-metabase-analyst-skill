# RentOk SalesHub Portfolio Base Query

## What this is

This is the recommended base native SQL for the first SalesHub portfolio dashboard.

It is meant to produce the main drill table:

- one row per SalesHub account row
- enriched with linked real property details
- enriched with current plan, paid, due, and next due fields

The summary cards on the dashboard should be derived from this same base shape whenever possible.

That keeps the dashboard easier to validate and less likely to drift.

## Grounding source

This query is derived from the backend SalesHub report logic:

- `generateSalesHubMasterReport`
- `generateSalesHubCollectionReport`
- `generateSalesHubDuesReport`

It keeps the same core joins and scope rules.

## Important scope rules

- Scope is based on the first `10` characters of a SalesHub `eazypg_id`
- Internal/test `pg_number` values `1, 6, 7, 8, 9` are excluded by default
- Main row unit is a SalesHub account row from `tenant`
- Real customer property is linked through `tenant.firebase_id = property.id::text` when the firebase id is UUID-shaped
- Active account rows are currently `tenant.status in (1, 2)`

## Metabase variables to use

Recommended variables:

- `{{saleshub_eazypg_id}}`
- `{{portfolio_manager_name}}`
- `{{portfolio_bucket_id}}`
- `{{plan_name}}`

Optional later:

- `{{linked_property_eazypg_id}}`
- `{{account_name}}`

## Recommended base query

```sql
WITH scope_property AS (
    SELECT
        p.id,
        p.pg_id,
        p.pg_number,
        p.pg_name,
        p.eazypg_id,
        p.personal_contact,
        LEFT(p.eazypg_id, 10) AS eazypg_prefix
    FROM property p
    WHERE p.pg_id = 'Rt7Oa2L3A4PiHb0NvSh2rQvods93'
      AND p.eazypg_id = {{saleshub_eazypg_id}}
),
scoped_portfolios AS (
    SELECT
        p.id,
        p.pg_id,
        p.pg_number,
        p.pg_name,
        p.eazypg_id,
        p.personal_contact
    FROM property p
    JOIN scope_property s
      ON p.pg_id = s.pg_id
     AND p.eazypg_id LIKE s.eazypg_prefix || '%'
    WHERE p.pg_number NOT IN (1, 6, 7, 8, 9)
      [[AND p.pg_name = {{portfolio_manager_name}}]]
      [[AND p.eazypg_id = {{portfolio_bucket_id}}]]
),
active_plan AS (
    SELECT DISTINCT ON (i.payer)
        i.payer,
        i.due_type AS plan_name,
        i.due_start_date::date AS plan_start_date,
        i.due_end_date::date AS plan_end_date,
        imd.unit_cost AS plan_bed_price
    FROM invoices i
    JOIN scoped_portfolios p
      ON i.property = p.pg_id || 'PG' || p.pg_number
    LEFT JOIN invoice_meta_data imd
      ON i.id = imd.invoice_uuid
    WHERE i.status = 1
      AND i.amount > 0
      AND i.due_type ILIKE '%Plan%'
    ORDER BY i.payer, i.due_end_date DESC
),
total_paid AS (
    SELECT
        i.payer,
        SUM(i.amount) AS total_paid_amount
    FROM invoices i
    JOIN scoped_portfolios p
      ON i.property = p.pg_id || 'PG' || p.pg_number
    WHERE i.status = 1
      AND i.amount > 0
      AND i.due_type ILIKE '%Plan%'
    GROUP BY i.payer
),
current_due AS (
    SELECT
        i.payer,
        SUM(i.amount) AS current_due_amount
    FROM invoices i
    JOIN scoped_portfolios p
      ON i.property = p.pg_id || 'PG' || p.pg_number
    WHERE i.status = 0
      AND i.amount > 0
      AND i.due_date <= CURRENT_DATE
    GROUP BY i.payer
),
next_due AS (
    SELECT DISTINCT ON (i.payer)
        i.payer,
        i.due_date::date AS next_due_date
    FROM invoices i
    JOIN scoped_portfolios p
      ON i.property = p.pg_id || 'PG' || p.pg_number
    WHERE i.status = 0
      AND i.amount > 0
    ORDER BY i.payer, i.due_date ASC
),
linked_property_count AS (
    SELECT
        pg_id,
        COUNT(*) AS linked_property_count
    FROM property
    WHERE COALESCE(is_deleted, false) = false
    GROUP BY pg_id
)
SELECT
    p.eazypg_id AS portfolio_bucket_id,
    p.pg_number AS portfolio_pg_number,
    p.pg_name AS portfolio_manager_name,
    p.personal_contact AS portfolio_contact,

    t.id AS saleshub_account_row_id,
    t.firebase_id AS saleshub_account_firebase_id,
    t.name AS saleshub_account_name,
    t.phone AS saleshub_account_phone,
    t.status AS saleshub_account_status,
    t.room AS fallback_plan_name,
    t.date_of_joining::date AS tenant_plan_start_date,
    t.checkout_date::date AS tenant_expected_end_date,
    t.date_of_eviction::date AS tenant_actual_end_date,
    t.bed_sold AS billed_beds,
    t.active_tenants AS active_tenant_count,
    t.kyc_credit_balance AS kyc_credit_balance,
    t.rent_amount AS fallback_bed_price,

    plan.id AS linked_property_id,
    plan.pg_id AS linked_property_pg_id,
    plan.pg_name AS linked_property_name,
    plan.eazypg_id AS linked_property_eazypg_id,
    plan.personal_contact AS linked_property_contact,
    plan.city AS linked_property_city,
    plan.pincode AS linked_property_pincode,
    plan.state AS linked_property_state,
    lpc.linked_property_count,

    COALESCE(ap.plan_name, CONCAT(t.room, ' Plan')) AS current_plan_name,
    COALESCE(ap.plan_bed_price, t.rent_amount) AS current_bed_price,
    ap.plan_start_date,
    ap.plan_end_date,
    CASE
        WHEN ap.plan_start_date IS NOT NULL
         AND ap.plan_end_date IS NOT NULL
        THEN CEIL((ap.plan_end_date - ap.plan_start_date) / 30.44)::int
        ELSE NULL
    END AS contract_duration_months,
    tp.total_paid_amount,
    cd.current_due_amount,
    nd.next_due_date,

    CASE
        WHEN LENGTH(COALESCE(t.firebase_id, '')) = 36 THEN true
        ELSE false
    END AS has_uuid_link,
    CASE
        WHEN plan.id IS NOT NULL THEN true
        ELSE false
    END AS has_linked_real_property
FROM tenant t
JOIN scoped_portfolios p
  ON t.property_id = p.id
LEFT JOIN property plan
  ON t.firebase_id = plan.id::text
 AND LENGTH(t.firebase_id) = 36
LEFT JOIN active_plan ap
  ON t.firebase_id = ap.payer
LEFT JOIN total_paid tp
  ON t.firebase_id = tp.payer
LEFT JOIN current_due cd
  ON t.firebase_id = cd.payer
LEFT JOIN next_due nd
  ON t.firebase_id = nd.payer
LEFT JOIN linked_property_count lpc
  ON plan.pg_id = lpc.pg_id
WHERE t.status IN (1, 2)
  [[AND t.room = {{plan_name}}]]
  [[AND plan.eazypg_id = {{linked_property_eazypg_id}}]]
  [[AND COALESCE(plan.pg_name, t.name) = {{account_name}}]]
ORDER BY
    p.pg_name,
    COALESCE(plan.pg_name, t.name);
```

## What this query gives us

This base query supports:

- account count
- linked real property count
- plan mix
- billed beds
- active tenants
- current due
- total paid
- next due
- expiring accounts
- unlinked account rows

## Cards to derive from this query

Good first cards:

- count of SalesHub account rows
- count of distinct linked real properties
- sum of billed beds
- sum of active tenants
- sum of current due
- sum of total paid
- count of rows with no linked real property
- count of accounts with plan end date in next `30` days

## Validation slice to use first

Start with one named PM group, not a year bucket.

Good first candidates from live data:

- `Siddhant`
- `Ayush`
- `Pankaj`

Do not start with:

- `2026 Users`
- `2025 Users`
- `2024 Users`
- `Users Older Than 2024`
- `Test Account`

## Known cautions

### 0. PM validation slice needs plan-row filtering

During live validation for a named PM bucket, the stable slice was:

- `t.status in (1, 2)`
- `t.room in ('Basic', 'Silver', 'Trial', 'Gold', 'Enterprise')`

Without the plan-row filter, some Metabase validations became inconsistent or noisy.

So for PM validation and first dashboard build:

- keep the plan-row filter in place
- widen only after we prove a broader SalesHub slice is intended

### 1. Human PM versus system bucket

`p.pg_name` is the live grouping field, but it includes both:

- likely human portfolio owners
- system or migration buckets

So `pg_name` is useful, but not enough on its own for dashboard cloning decisions.

### 2. Money outliers

Global dues totals can be distorted by absurd outliers.

Before leadership or finance-style use:

- inspect highest rows
- compare `max` versus `p99`
- show bounded views when useful

### 3. App cross-check

For one linked real property under a named PM:

1. run this base query filtered to that property
2. inspect due and plan fields
3. compare against the manager app

That is the fastest trust loop for non-technical users.

## Recommended next step

Use this base query to create:

1. the main account drill table
2. a small summary dashboard on top of it
3. one validation run for a named PM group
