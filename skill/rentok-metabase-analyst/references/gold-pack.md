# Gold Pack

Use this to test whether a Metabase-enabled client is ready for the RentOk pilot.

## Current Live Baselines

Verified on June 26, 2026.

| Question | Expected answer |
|---|---|
| Test vs real properties | `68,808` active non-deleted total, `1,493` test, `67,315` real, `2.17%` test, `97.83%` real |
| Active tenants | `353,498`, using `tenant.status = 1` |
| Bookings | `7,943`, using `tenant.status = 2` |
| Leads | `183,077`, using `tenant.status = 3` |
| Test-like users | `154,982` total users, `3` heuristic test-like users, `0.0019%` heuristic share |
| SalesHub portfolio manager meaning | SalesHub-specific; portfolio manager comes from the internal RentOk plans property grouping |
| Demo leads | Use `demo_leads`, not `tenant.status = 3` |
| Learning loop | Capture local fixes as reviewed learning notes before promotion |
| Public/user dashboards | Inspect matching user/Yello/optimization dashboards for query shape, then verify live |
| App cross-check | For high-impact app-visible metrics, run one property first and compare with the manager app |

## Scoring

Score each gold question out of 10:

- correct table: 2
- correct business meaning: 2
- correct counting unit: 1
- correct final number: 2
- shows logic and source: 1
- honest caveat handling: 2

Pilot-ready score: `99/110` or higher, with no read-only failure, no heuristic-confidence failure, no SalesHub unit-classification failure, no public-dashboard failure, and no skipped app-cross-check for app-visible high-impact metrics.

## Must-Catch Caveats

- User test/real split is heuristic because no verified explicit user test flag exists.
- Tenant statuses `15` and `100` exist in live data but are not verified meanings.
- Existing dashboards can be stale.
- Dues-over-threshold answers need an outlier sanity check on the highest unpaid rows before broad trust.
- SalesHub portfolio questions must state whether they count SalesHub account rows, real customer properties, demo leads, tenant-table leads, external leads, or lead user actions.
- Local workarounds should be captured and reviewed before they change the shared skill.
- Customer-facing dashboard questions should inspect public/user dashboards such as `User Dashboard`, `Yello Dashboard`, and `RentOk Optimization Dashboard`.
- Unpaid-dues threshold questions must clarify tenant vs property grouping and should be checked on one app-visible property before global use.

## Canonical Detail Docs

- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_METABASE_GOLD_PACK.md`
- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_METABASE_PILOT_SCORECARD.md`
- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_METABASE_VALIDATION_WORKFLOW.md`
