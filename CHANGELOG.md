# Changelog

## 0.1.1 - 2026-06-26

- Added a live regression pack at `scripts/live_regression_pack.js` for drift-prone baselines, unknown tenant statuses, dues-threshold anomaly checks, and a real property cross-check.
- Added `RENTOK_METABASE_HARDENING_NOTES.md` with stop-rules for status drift, dues schema mistakes, outlier-heavy finance answers, and occupancy join ambiguity.
- Tightened the core skill so it stamps live verification dates, treats statuses `15` and `100` as unverified, and lowers confidence when join paths conflict.
- Replaced loose dues-threshold guidance with backend-approved invoice rules using `invoices.status = 0`, `invoices.is_active = 1`, and the approved property plus tenant join path.
- Softened the blanket `tenant_room` guidance so occupancy logic stays property-structure-aware instead of pretending one join fits every case.

## 0.1.0 - 2026-06-26

- Packaged the RentOk Metabase analyst skill as a standalone GitHub-ready repo.
- Added grounded docs for properties, tenants, users, rooms, invoices, payments, SalesHub, demo leads, external leads, and lead-user actions.
- Added formula guidance for dues, collections, deposits, occupancy, and dues-over-threshold questions.
- Added public/user dashboard guidance for `User Dashboard`, `User Dashboard - Star`, `User Dashboard - Vilaasa`, `Yello Dashboard`, `Yello! Final Dashboard`, and `RentOk Optimization Dashboard`.
- Added rollout quickstart, prompt pack, validation workflow, gold pack, and pilot scorecard.
- Added shared learning loop with learning-note template and inbox/reviewed/rejected folders.
- Added one-property manager app cross-check guidance for high-impact app-visible metrics.
- Added repo maintenance guardrails: `CONTRIBUTING.md`, issue template, and GitHub Actions validation workflow.
