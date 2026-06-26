# RentOk Metabase Analyst Skill

Read-only Metabase analyst package for RentOk teams.

This repo packages the skill, rollout docs, prompt pack, validation pack, and shared learning loop for non-technical teammates who need to ask plain-English analytics questions and still stay grounded in backend meaning, live Metabase data, and app-visible verification.

## What this includes

- `skill/rentok-metabase-analyst/`
  The reusable skill package for Codex-style clients.
- `docs/`
  The full rollout kit:
  analytics glossary, formula map, prompt pack, public dashboard guide, SalesHub guidance, validation workflow, pilot scorecard, learning loop, and quickstart.
- `docs/learnings/`
  Shared learning note template plus inbox/reviewed/rejected folders.

## Designed for

- Business
- Marketing
- Sales ops
- Product ops
- Product
- Design

## Core qualities

- Read-only by design
- Prefers explicit fields over heuristics
- Uses saved Metabase dashboards as hints, not final truth
- Handles SalesHub and portfolio questions separately from normal property analytics
- Uses public/user dashboards such as `User Dashboard`, `Yello Dashboard`, and `RentOk Optimization Dashboard` for query shape
- Suggests one-property manager app cross-checks for high-impact app-visible metrics
- Captures learnings so one teammate's fix can help the next teammate safely

## Fast start

Start here:

- [Rollout Quickstart](./docs/RENTOK_METABASE_ROLLOUT_QUICKSTART.md)

Then use:

- [Prompt Pack](./docs/RENTOK_METABASE_PROMPT_PACK.md)
- [Gold Pack](./docs/RENTOK_METABASE_GOLD_PACK.md)
- [Pilot Scorecard](./docs/RENTOK_METABASE_PILOT_SCORECARD.md)
- [Hardening Notes](./docs/RENTOK_METABASE_HARDENING_NOTES.md)

## Recommended proof loop

For high-impact queries, especially dues questions:

1. Run the query for one property first.
2. Check the same property in the RentOk Manager app.
3. If it matches, run the all-properties version.
4. If it does not match, capture a learning note and do not trust the global result yet.

This is the fastest non-technical trust-building workflow in the package.

## Live hardening

Use the live regression pack before wider rollout or after a teammate reports a bad answer:

```bash
node ./scripts/live_regression_pack.js
```

It checks drift-prone baselines, unknown tenant statuses, dues-threshold anomaly patterns, and a real property cross-check.

## Important note on private references

Some docs preserve private backend or local workspace paths as path hints, because the skill was grounded against real internal code and internal app behavior.

That is intentional.

- Internal RentOk backend paths are kept as evidence pointers.
- Metabase credentials are never stored in this repo.
- This repo is best kept private.

## Repo map

- [Skill](./skill/rentok-metabase-analyst/SKILL.md)
- [Analytics Glossary](./docs/RENTOK_ANALYTICS_GLOSSARY.md)
- [Formula Map](./docs/RENTOK_ANALYTICS_FORMULA_MAP.md)
- [Existing Assets Guide](./docs/RENTOK_METABASE_EXISTING_ASSETS_GUIDE.md)
- [Public User Dashboards](./docs/RENTOK_METABASE_PUBLIC_USER_DASHBOARDS.md)
- [Validation Workflow](./docs/RENTOK_METABASE_VALIDATION_WORKFLOW.md)
- [Learning Loop](./docs/RENTOK_METABASE_LEARNING_LOOP.md)

## Version

Current package version:

- `0.1.0`
