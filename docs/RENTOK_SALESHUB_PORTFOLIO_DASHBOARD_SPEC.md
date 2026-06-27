# RentOk SalesHub Portfolio Dashboard Spec

## What this dashboard is for

This dashboard is for Sales Hub portfolio tracking.

It should let a portfolio manager or sales ops teammate answer:

- which SalesHub customer accounts sit under this portfolio
- which real customer properties those accounts map to
- what plan each account is on
- what is paid, unpaid, due soon, or overdue
- how many tenants and billed beds sit under that portfolio

## The key definition

This is **not** a normal property dashboard.

The main counting unit is a **SalesHub account row**.

Backend-grounded shape:

- the row starts from `tenant t`
- the SalesHub grouping comes from the internal plans `property p`
- the real customer property is linked by `t.firebase_id = plan.id::text` when the firebase id is a 36-character UUID
- portfolio manager comes from `p.pg_name`
- portfolio bucket id comes from `p.eazypg_id`

So the dashboard must always say whether a number is:

- SalesHub account rows
- distinct linked real properties
- summed active tenants
- summed billed beds
- invoice money

## Live findings from June 27, 2026

From live Metabase inspection:

- dashboard `197` `Saleshub Data` exists but is empty right now
- card `977` `Saleshub Daily Performance` exists and uses the SalesHub plans account shape
- live SalesHub plan rows currently group into `23` `pg_name` buckets
- only `18` of those look like human-owned groups
- `5` look like system or bucket groups such as `2026 Users`, `2025 Users`, `2024 Users`, `Users Older Than 2024`, and `Test Account`

Important consequence:

Do **not** start by cloning one dashboard per `pg_name`.

That would create dashboards for bucket groups that are not real portfolio-manager owners.

## Recommended first version

Build **one master dashboard** first.

Add filters for:

- `portfolio_manager_name` from `p.pg_name`
- `portfolio_bucket_id` from `p.eazypg_id`
- `plan_name` from `t.room`
- `account_status` from `t.status`
- `due_date_range`
- `paid_date_range`

Then validate it.

Only after validation should we decide whether to clone private dashboards for a smaller set of true PM-owned groups.

## Why one master dashboard is better first

It is better because:

- the live grouping includes non-human buckets
- we still need to confirm which groups are operational owners
- one master dashboard is easier to validate against backend logic
- one dashboard reduces drift because fixes happen once
- later, separate PM dashboards can be simple filtered clones of the validated base

## Dashboard sections

## 1. Portfolio snapshot

Cards:

- SalesHub account rows
- distinct linked real properties
- total billed beds
- summed active tenants
- accounts with no linked real property

Purpose:

- tell the viewer how large the portfolio is
- make broken or partial linking visible early

## 2. Plan mix

Cards:

- account rows by `t.room`
- billed beds by plan
- accounts by plan start month
- accounts expiring in next `30` days
- expired but still active rows

Purpose:

- show current plan distribution
- surface renewals and likely follow-up work

## 3. Money health

Cards:

- current unpaid amount
- collected this month
- total paid amount
- overdue accounts count
- due aging buckets: `0-7`, `8-30`, `31-60`, `60+` days

Purpose:

- give PMs and sales ops a clean money status view

Guardrail:

- use backend-approved invoice logic only
- inspect top overdue outliers before trusting headline totals

## 4. Collection detail

Table:

- account name
- linked real property name
- portfolio manager
- plan
- invoice type
- paid amount
- paid date
- payment mode
- UTR
- proof links when available

Purpose:

- support collection follow-up and audit

## 5. Dues detail

Table:

- account name
- linked real property name
- portfolio manager
- plan
- due type
- unpaid amount
- due date
- days overdue
- billed beds
- active tenants

Purpose:

- support recovery follow-up

Guardrail:

- show highest dues rows separately
- if absurd outliers dominate, call that out in the dashboard notes

## 6. Account drill table

One row per SalesHub account row:

- portfolio bucket id
- portfolio manager
- account name
- linked real property id
- linked real property name
- city
- state
- contact
- plan
- plan start date
- expected end date
- actual end date
- billed beds
- active tenants
- total paid
- current due
- next due date

Purpose:

- this is the main audit table
- it should be the source for spot-checks and exports

## 7. Leadership summary view

Cards:

- portfolio size by PM
- unpaid amount by PM
- due aging by PM
- expiring plans by PM
- top 10 risk accounts
- top 10 collections overdue

Purpose:

- let a sales head scan who needs attention first
- show which portfolio managers are healthy and which are slipping
- make the dashboard useful for review meetings, not just audits

Rule:

- this view should stay plain and decision-facing
- it should always include a drill table underneath so the user can inspect the counts

## Validation rules before rollout

## Rule 1. Validate one real PM group

Pick one likely human-owned group such as a named PM bucket.

Check:

- account rows
- dues total
- collections total
- 5 sample accounts

## Rule 2. Cross-check against backend logic

For the same slice, compare against the backend-grounded SalesHub report shape:

- master report logic
- dues report logic
- collection report logic

If numbers disagree, do not ship the dashboard yet.

## Rule 3. Cross-check one linked real property in the app

For one linked real property:

- run the filtered dues or plan query
- open the same property in the manager app
- confirm the account and dues story makes sense

This does not prove the whole dataset.

It does prove that the join path is likely sane.

## Rule 4. Separate human PMs from system buckets

Before cloning dashboards:

- label which `pg_name` groups are true PM ownership groups
- label which are system, migration, year, or test buckets

Do not give system buckets the same dashboard treatment as a true PM owner.

## Current recommendation on rollout shape

Phase 1:

- one master SalesHub portfolio dashboard
- shared with sales ops and internal reviewers
- validated against 1 to 3 PM groups

Phase 2:

- filtered clones only for true PM-owned groups
- only after ownership mapping is confirmed

Phase 3:

- optional role-specific variants:
  - PM view
  - sales ops collection view
  - leadership summary view

## What a sales head would still want

The current build is a strong base, but a sales head would usually want more than the current snapshot:

- a PM comparison view
- due aging and overdue concentration
- top risky accounts and action lists
- trend over time, not just current totals
- a clear way to move from total numbers to account-level detail

So the best next dashboard step is not to add random cards. It is to add a leadership summary layer on top of the validated master dashboard.

## Open questions we should settle before cloning

- Does `2024 Users`, `2025 Users`, `2026 Users`, and `Users Older Than 2024` represent backlog buckets, migration buckets, or active operating ownership?
- Which named groups are still active PM owners today?
- Should a PM dashboard include only plan/account data, or also linked real property operational data?
- Which money numbers are decision-driving enough to require a mandatory sample cross-check each month?

## Practical next step

The next build step should be:

1. write the base native SQL for the master account table
2. derive the summary cards from that base shape
3. validate one named PM group end to end
4. only then decide whether to create separate PM dashboards
