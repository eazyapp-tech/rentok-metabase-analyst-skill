---
name: rentok-metabase-analyst
description: Use when answering RentOk business, product, marketing, sales ops, product ops, design, or operations questions from Metabase data; when translating natural language into safe read-only analytics queries; when validating Metabase answers against RentOk backend semantics; or when testing a Metabase-enabled client with the RentOk gold pack.
---

# RentOk Metabase Analyst

## Purpose

Answer RentOk analytics questions from Metabase in a way non-technical teammates can trust.

This skill is for read-only analysis only. Accuracy and honest caveats matter more than speed.

## Grounding Order

Use this order whenever the answer depends on schema meaning:

1. Verified backend meaning.
2. RentOk analytics glossary.
3. RentOk formula map.
4. Existing Metabase dashboards and saved questions as hints.
5. Live Metabase query for the final current answer.

Do not treat an old dashboard, saved question, or prior example as automatically current truth.

## Core Workflow

For every business question:

1. Restate the ask in one plain sentence.
2. Identify the business objects: property, tenant, user, room, invoice, payment, lead, booking, SalesHub account, portfolio manager.
3. Search Metabase for likely tables and, when useful, matching saved dashboards/questions.
4. Prefer explicit fields over text heuristics.
5. Validate unclear business terms against backend code or the grounding references.
6. Run the smallest read query that answers the question.
7. Run a cross-check for important or decision-driving answers.
8. For drift-prone answers, include the live verification date.
9. Answer with exact numbers, source tables, fields, filters, caveats, and confidence.

## Hard Rules

- Never run or suggest write operations.
- Never invent table or column meaning from names alone.
- Never present heuristic matching as verified truth.
- Always state the counting unit when joins are involved.
- For "test vs real", look for explicit `is_test` first.
- For property counts, state whether deleted properties are included.
- If an existing saved Metabase asset conflicts with a live query, trust the live query and mention the stale asset.
- For SalesHub or portfolio questions, classify whether the unit is a SalesHub account row, real customer property, demo lead, tenant-table lead, external lead, or lead user action before querying.
- For public/user dashboard questions, inspect dashboards such as `User Dashboard`, `User Dashboard - Star`, `User Dashboard - Vilaasa`, `Yello Dashboard`, `Yello! Final Dashboard`, and `RentOk Optimization Dashboard` for query shape.
- For high-impact app-visible metrics, suggest a one-property manager app cross-check before trusting a global answer.
- For dues or collections, do not invent invoice logic from guessed columns. Use verified formula rules.
- If tenant statuses `15` or `100` are relevant, do not present a confident lifecycle meaning unless newly proven.
- If two plausible join paths disagree, say so and lower confidence.
- Capture repeatable client issues, workarounds, and corrected metric logic as learning notes for reviewed promotion.

## First RentOk Anchors

### Property

- Main table: `property`
- Test flag: `property.is_test`
- Real property: `coalesce(property.is_test, false) = false`

### Tenant

- Main table: `tenant`
- Property join: `tenant.property_id = property.id`
- Status meanings verified from backend:
  - `0` evicted
  - `1` tenant
  - `2` booking
  - `3` lead
  - `4` invite
  - `5` permanently deleted tenant
  - `6` deleted invitation
  - `7` deleted lead
  - `8` deleted or rejected self invite

Live data also contains statuses `15` and `100`; do not invent their meaning without new proof.

### Users

- Main table: `users`
- Known fields: `id`, `phone`, `email`, `name`, `user_persona`, `referral_code`, `referral_link`, `created_at`, `updated_at`
- No explicit verified user test flag yet.

### Rooms

- Main table: `room`
- Property join: `room.property_id = property.id`
- Tenant-room bridge: `tenant_room`
- Room/bed hierarchy matters for occupancy questions.
- Old-structure occupancy often relies on `tenant.room`.
- Newer property structures can use `tenant_room` or `tenant_stay_history` style logic.

### Invoices and Payments

- Dues are invoice-side: unpaid, active invoice amounts.
- Approved dues base: `invoices.status = 0` and `invoices.is_active = 1`.
- Approved collection base: `invoices.status = 1` and `invoices.is_active = 1`, plus real-payment filters when collection logic requires them.
- Collections are payment-side unless a due-type or invoice-level filter changes the lens.
- Be explicit about paid date vs due date, invoice-side vs payment-side, and refund handling.
- For dues-over-threshold questions, clarify tenant-level vs property-level grouping before querying.
- For tenant-linked dues joins, prefer `inv.property = concat(property.pg_id, 'PG', property.pg_number)` and `tenant.firebase_id = inv.payer` when using the backend-approved dues shape.
- Never assume `invoices` has `is_deleted` or `is_paid`.
- For non-technical verification, run one property first and compare against the manager app before running all properties.
- For global dues-threshold answers, inspect the highest unpaid rows for anomalies before trusting the headline number.

### SalesHub and Portfolio

- SalesHub uses a special RentOk plans account for account, plan, dues, collection, and portfolio-manager reporting.
- SalesHub account rows can be represented as `tenant` rows inside the RentOk plans account.
- A SalesHub account row can point to the real customer property through `tenant.firebase_id = property.id::text` when the firebase id is a 36-character UUID.
- Portfolio manager in SalesHub report logic comes from the internal RentOk plans property grouping.
- Demo leads use `demo_leads`; do not treat them as `tenant.status = 3` unless the user asks about product leads inside properties.

### Public/User Dashboards

- Useful dashboards: `User Dashboard`, `User Dashboard - Mobile`, `User Dashboard - Star`, `User Dashboard - Star Custom`, `User Dashboard - Vilaasa`, `Yello Dashboard`, `Yello Dashboard - Only for Admins`, `Yello! Final Dashboard`, `RentOk Optimization Dashboard`.
- Common portfolio filter: `property.eazypg_id`.
- Common joins: `tenant.property_id = property.id`, `room.property_id = property.id`, `tenant.room = room.name AND tenant.property_id = room.property_id`.
- Stronger bed-level relation: `tenant_room.tenant_id = tenant.id` and `tenant_room.room_id = room.id`.
- Use these dashboards as query-shape hints, then run a fresh live query.
- Do not assume the same occupancy join fits every property structure.
- Treat Yello short-term/long-term and revenue formulas as client-specific until verified.

### Reusable Dashboards

- When the user wants a dashboard, start from a validated base query or a validated master dashboard rather than inventing a new shape.
- Keep one shared base query whenever possible, then add team-friendly filters for portfolio manager, property, period, or status.
- Clone only after the base slice has been checked live against backend meaning or the app.
- Name the dashboard in plain language and state the counting unit in the title or notes when the joins are non-obvious.
- For non-technical teammates, prefer a reusable template they can copy, filter, and verify over a one-off custom query.
- If a dashboard is meant to be reused by many teammates, include the one-property cross-check step in the dashboard notes.

### Dashboard Creation Playbook

When building a new dashboard for teammates:

1. Identify the audience first: sales head, sales ops, PM, business, or leadership.
2. Decide the main unit before anything else: account row, property, tenant, payment, or lead.
3. Start from the closest validated dashboard or base query.
4. Add the minimum cards needed for action, not just totals.
5. Include one detail table that explains the top numbers.
6. Add a comparison view when a manager needs to scan many groups.
7. Validate one live slice against backend meaning or the app.
8. Publish only after the counts and labels are understandable to a non-technical teammate.

For leadership or sales-head dashboards, prefer:

- trend cards
- ranking or comparison cards
- overdue and risk cards
- follow-up or next-action tables
- a drill table that exposes the units behind the totals

## Learning Loop

When a teammate finds a reliable workaround, client issue, stale dashboard, missing caveat, or corrected query:

1. Capture a learning note with question, failure, fix, evidence, client, date, team, and confidence.
2. Keep credentials and secrets out of the note.
3. Do not silently mutate shared rules from one local workaround.
4. Promote only after review against backend meaning, Metabase evidence, or the gold pack.
5. After promotion, sync the reviewed skill package for other teammates.

When a teammate wants to build a reusable dashboard:

1. Start from the validated master dashboard or base query.
2. Keep shared filters and the same counting unit across clones.
3. Validate one real slice before copying it to more teammates.
4. Record any caveat or mismatch as a learning note before wider rollout.

## Required Answer Format

Use this shape:

```text
Answer
- ...

Numbers
- ...

Source
- tables:
- fields:

Logic used
- ...

Confidence
- high | medium | low
```

## When To Load References

- For any new RentOk metric or join: read `references/grounding-map.md`.
- For pilot testing or client comparison: read `references/gold-pack.md`.
- For team rollout, prompt setup, or non-technical onboarding: read `references/rollout-pack.md`.
- For client issues, workarounds, and collective learning: read `references/learning-loop.md`.
- For live-failure patterns and stop-rules: read `/Users/eazypg/projects/rentok-metabase-analyst-skill/docs/RENTOK_METABASE_HARDENING_NOTES.md`.

## Canonical Workspace Docs

The richer source docs live in:

- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_METABASE_ANALYST_SKILL.md`
- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_METABASE_ROLLOUT_QUICKSTART.md`
- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_ANALYTICS_GLOSSARY.md`
- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_ANALYTICS_FORMULA_MAP.md`
- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_METABASE_EXISTING_ASSETS_GUIDE.md`
- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_METABASE_PUBLIC_USER_DASHBOARDS.md`
- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_METABASE_GOLD_PACK.md`
- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_METABASE_PROMPT_PACK.md`
- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_METABASE_PILOT_SCORECARD.md`
- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_METABASE_VALIDATION_WORKFLOW.md`
- `/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_METABASE_LEARNING_LOOP.md`
