# RentOk Metabase Gold Pack

## What this is

This is the fixed evaluation pack for the RentOk Metabase analyst.

Use it to test:

- Codex
- Claude Code
- Antigravity
- OpenCode
- any other client connected to the community Metabase MCP

The goal is simple:

every client should be judged against the same questions, the same expected logic, and the same pass/fail standard.

## How to use it

For each question:

1. Ask it in plain English.
2. Save the raw answer.
3. Score it against the rubric in this doc.
4. Compare clients on correctness, honesty, and clarity.

## Global pass rules

An answer passes only if it does all of these:

- uses the right main table
- uses the right business meaning
- uses the right counting unit
- gives the correct number
- states the logic used
- labels caveats honestly when needed

## Gold questions

### G1. What % of properties are test and what % are real?

**Expected main table**

- `property`

**Expected logic**

- explicit `is_test`

**Expected counting unit**

- property row

**Current verified answer on June 26, 2026**

- total properties: `68,808`
- test properties: `1,493`
- real properties: `67,315`
- test share: `2.17%`
- real share: `97.83%`

**Must say**

- this is based on explicit `property.is_test`

**Fail examples**

- guesses test properties from names
- uses `users` instead of `property`
- gives counts without percentages

### G2. How many active tenants do we have?

**Expected main table**

- `tenant`

**Expected logic**

- `status = 1`

**Expected counting unit**

- tenant row or `COUNT(DISTINCT tenant.id)` if joins are used

**Current verified answer on June 26, 2026**

- active tenants: `353,498`

**Must say**

- active tenant means `tenant.status = 1`

**Important caveat**

- live data also contains statuses `15` and `100`
- these are not part of the currently verified backend status map
- the analyst should not silently reinterpret them as active tenants

**Fail examples**

- counts all non-evicted tenants
- merges bookings or leads into active tenants

### G3. How many bookings do we have?

**Expected main table**

- `tenant`

**Expected logic**

- `status = 2`

**Expected counting unit**

- tenant row or `COUNT(DISTINCT tenant.id)` if joins are used

**Current verified answer on June 26, 2026**

- bookings: `7,943`

**Must say**

- booking means `tenant.status = 2`

**Fail examples**

- uses a booking table without proving it is the source-of-truth
- merges bookings into leads or active tenants

### G4. How many leads do we have?

**Expected main table**

- `tenant`

**Expected logic**

- `status = 3`

**Expected counting unit**

- tenant row or `COUNT(DISTINCT tenant.id)` if joins are used

**Current verified answer on June 26, 2026**

- leads: `183,077`

**Must say**

- lead means `tenant.status = 3`

**Fail examples**

- uses text search instead of status logic
- merges leads with bookings

### G5. What % of users are test and what % are real?

**Expected main table**

- `users`

**Expected logic**

- check for explicit test flag first
- if none exists, clearly label the answer as heuristic

**Expected counting unit**

- user row

**Current verified heuristic answer on June 26, 2026**

- total users: `154,982`
- heuristic test-like users: `3`
- heuristic test share: `0.0019%`

**Must say**

- no explicit test-user flag is currently verified
- this is heuristic, not clean source-of-truth business logic

**Fail examples**

- presents heuristic text matching as a high-confidence truth
- hides the lack of explicit `is_test`

### G6. What are the tenant status meanings?

**Expected source**

- backend tenant entity meaning

**Expected answer**

- `0` evicted
- `1` tenant
- `2` booking
- `3` lead
- `4` invite
- `5` permanently deleted tenant
- `6` deleted invitation
- `7` deleted lead
- `8` deleted or rejected self invite

**Must say**

- these meanings come from backend code

**Bonus honesty**

- mention that live data also shows statuses `15` and `100` whose meaning is not yet verified

**Fail examples**

- invents meanings for `15` and `100`
- omits the verified source

### G7. For SalesHub, what does a portfolio manager mean?

**Expected source**

- backend SalesHub report logic

**Expected answer**

- SalesHub portfolio manager is not a generic property owner field
- in SalesHub report logic, portfolio manager comes from the internal RentOk plans property row
- SalesHub account rows are represented through `tenant` records in the RentOk plans account
- the real customer property can be reached through `tenant.firebase_id = property.id::text` when `tenant.firebase_id` is a 36-character UUID

**Must say**

- this is SalesHub-specific and should not be applied to normal property analytics without checking the question

**Fail examples**

- counts all properties by `owner_name`
- treats demo leads as portfolio users without saying so
- answers from a dashboard name without checking backend meaning

### G8. How should demo leads be counted?

**Expected main table**

- `demo_leads`

**Expected logic**

- use `created_at`, `source`, `city`, `demo_date`, or `demo_time` depending on the question
- do not use `tenant.status = 3` unless the user asks about product leads inside properties

**Expected counting unit**

- demo lead row

**Must say**

- demo leads are a sales/demo source, not the same as tenant-table leads

**Fail examples**

- uses `tenant.status = 3` for "book demo leads"
- joins to property through `eazypg_id` without checking data quality

### G9. What should happen when a teammate finds a workaround or fix during rollout?

**Expected answer**

- capture it as a learning note with the question, failing behavior, working fix, evidence, client, date, and confidence
- do not silently mutate everyone else's skill from an unreviewed local workaround
- promote it to the shared skill only after review and a gold-pack or regression check

**Must say**

- the skill should be self-learning through a reviewed shared knowledge loop, not uncontrolled auto-editing

**Fail examples**

- tells users to edit their local prompt casually
- says every local workaround should auto-sync immediately
- has no way for the next teammate to benefit from the first teammate's fix

### G10. How should the analyst answer customer-facing user dashboard questions?

**Expected source**

- existing public/user Metabase dashboards plus backend grounding

**Expected behavior**

- inspect matching dashboards such as `User Dashboard`, `User Dashboard - Star`, `User Dashboard - Vilaasa`, `Yello Dashboard`, `Yello! Final Dashboard`, or `RentOk Optimization Dashboard`
- use their joins and filters as hints
- verify the final answer with a fresh live query
- state whether the answer is filtered by `property.eazypg_id`

**Must say**

- dashboard logic is useful but not automatically final truth
- room-name joins are weaker than id-based or `tenant_room` joins
- Yello short-term/long-term and revenue formulas may be client-specific

**Fail examples**

- ignores public dashboards and invents a naive room/tenant query
- uses a Yello formula for every customer without checking assumptions
- gives a portfolio answer without saying how `eazypg_id` was filtered

### G11. How should unpaid-dues threshold queries be verified?

**Example question**

`How many tenants or properties have unpaid dues worth more than 1 lakh?`

**Expected source**

- unpaid active invoices
- formula map
- manager app cross-check for one property before broad trust

**Expected behavior**

- clarify whether the grouping unit is tenant or property
- clarify whether scope is one property, selected properties, or all properties
- use unpaid active invoice totals
- suggest running one property first and checking the manager app
- only treat the global version as trusted after the single-property check matches
- inspect the highest unpaid rows before trusting the global result, because anomalous invoice values can exist

**Must say**

- one matching property proves the query shape is likely right, not that every edge case is covered
- if the app does not match, capture a learning note and do not trust the global query yet
- if the top grouped rows show impossible unpaid amounts, call out the outliers and avoid presenting that total without caveat

**Fail examples**

- immediately runs all properties without defining tenant vs property grouping
- gives a global number without app-check caveat
- treats a single-property match as complete finance certification

## Scoring rubric

Use this 10-point rubric per question.

| Check | Points |
|---|---:|
| Correct main table | 2 |
| Correct business meaning | 2 |
| Correct counting unit | 1 |
| Correct final number | 2 |
| Shows logic and source fields | 1 |
| Honest caveat handling | 2 |

## Overall client rating

### Ready for pilot

- `>= 99/110`
- no read-only failure
- no caveat-honesty failure

### Needs prompt work

- `83/110` to `98/110`

### Not ready

- `< 83/110`
- or any answer that confidently misstates heuristic logic as verified truth

## What good looks like

A strong answer is not just numerically right.

It should:

- name the table
- name the field
- explain the filter
- state confidence
- reveal uncertainty instead of smoothing it over

## What this pack does not cover yet

This first pack is about schema grounding and safe business counts.

It does not yet fully certify:

- finance leadership metrics
- final collection reporting formulas
- occupancy truth beyond the current dashboard contract
- settlement or payout truth

Those belong in the next pack.
