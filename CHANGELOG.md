# Changelog

## 0.1.2 - 2026-06-27

- Added `RENTOK_METABASE_QUESTION_INVENTORY.md` to classify the first high-value business, sales ops, product ops, product, and design questions by metric family and risk.
- Added `RENTOK_METABASE_DASHBOARD_EVIDENCE_MAP.md` to map current Metabase dashboards to teams, metric families, trust labels, and reusable evidence.
- Added `RENTOK_METABASE_METRIC_REGISTRY_V1.md` as the first structured registry skeleton for approved, guarded, and draft metrics.
- Linked the new planning docs from `README.md`.
- Updated repo validation so the inventory, dashboard evidence map, and metric registry become required project artifacts.

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
