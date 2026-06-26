# RentOk Metabase Hardening Notes

This doc records the failure patterns we found while testing the skill against live RentOk Metabase data on June 26, 2026.

Use it as a stop-rule sheet.

If one of these conditions appears, the analyst should slow down, lower confidence, or refuse to present a neat answer without caveat.

## 1. Live numbers drift

Do not treat an old baseline in the package as timeless truth.

Always state the live verification date for drift-prone metrics.

Example:

- active non-deleted properties changed again during live testing
- package examples are useful anchors, not permanent truth

## 2. Property scope must be explicit

For property counts, always say whether the answer includes:

- all property rows
- only active non-deleted properties
- test properties
- deleted properties

The cleanest operational baseline is usually:

`coalesce(property.is_deleted, false) = false`

## 3. Unknown tenant statuses are a red flag

Verified tenant meanings exist only for:

- `0` evicted
- `1` tenant
- `2` booking
- `3` lead
- `4` invite
- `5` permanently deleted tenant
- `6` deleted invitation
- `7` deleted lead
- `8` deleted or rejected self invite

Live data also has:

- `15`
- `100`

Hardening finding:

- `status = 100` appears fully tied to `lead_source = 'genie'` in live sampling
- `status = 15` is mostly unlabeled in live sampling

Do not present either status as a settled lifecycle meaning unless the answer is newly grounded in backend logic.

## 4. Dues queries are formula-sensitive

Do not invent invoice logic from column guesses.

Live testing proved that `invoices` does **not** have:

- `is_deleted`
- `is_paid`

The approved unpaid-dues base is:

- `invoices.status = 0`
- `invoices.is_active = 1`

The approved paid-collections base is:

- `invoices.status = 1`
- `invoices.is_active = 1`
- joined to real payments with payment-mode exclusions when collection logic requires it

## 5. Dues joins are not intuitive

For approved dues joins, use:

- `inv.property = concat(property.pg_id, 'PG', property.pg_number)`
- `tenant.property_id = property.id`
- `tenant.firebase_id = inv.payer`

Do not assume `payer LIKE 'cust_%'`.

Live testing showed that this shortcut can wipe out valid dues results.

## 6. Dues-over-threshold answers need anomaly handling

The approved dues formula still surfaces extreme outliers in live data.

Live finding:

- count over 1 lakh was very large
- the 99th percentile was far below the maximum
- a small number of rows had absurd unpaid amounts

So before presenting a global threshold answer:

1. sort by highest unpaid amount
2. inspect the top 10 rows
3. compare `max` vs `p99`
4. if absurd outliers dominate, say that clearly
5. where useful, also show a practical bounded view such as `> 1 lakh and <= 50 lakh`

Do not flatten an anomaly-heavy result into a clean headline number without caveat.

## 7. One-property app cross-check stays mandatory

For high-impact dues questions, first run one real property and compare it in the manager app.

This does not prove the whole dataset is clean.

It only proves:

- the query shape is likely right
- the join path is likely right
- the teammate has one empirical trust loop

## 8. Occupancy logic is property-structure-aware

Do not say `tenant_room` is always the stronger truth in every case.

Live and backend grounding shows:

- old structure often relies on `tenant.room`
- new structure may use `tenant_room`
- newer logic can also use `tenant_stay_history` with fallback paths

For bed-level or room-level answers:

1. identify whether the property/question is old-structure or new-structure
2. prefer app-grounded or backend-grounded logic over a generic join slogan
3. if two plausible join paths disagree, mark confidence down and say why

## 9. Saved dashboards are hints, not shields

Even a live dashboard can carry:

- stale baselines
- client-specific formulas
- structure-specific joins

The analyst should reuse them for:

- business vocabulary
- likely filters
- likely join shape

But still verify the final answer live.

## 10. What “good” looks like now

A stronger answer should include:

- answer date
- exact counting unit
- exact scope
- table and field names
- why this formula was chosen
- whether an app cross-check happened
- whether anomaly checks were run
- a confidence label that actually reflects the risk
