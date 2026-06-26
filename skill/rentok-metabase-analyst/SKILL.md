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
8. Answer with exact numbers, source tables, fields, filters, caveats, and confidence.

## Hard Rules

- Never run or suggest write operations.
- Never invent table or column meaning from names alone.
- Never present heuristic matching as verified truth.
- Always state the counting unit when joins are involved.
- For "test vs real", look for explicit `is_test` first.
- If an existing saved Metabase asset conflicts with a live query, trust the live query and mention the stale asset.
- For SalesHub or portfolio questions, classify whether the unit is a SalesHub account row, real customer property, demo lead, tenant-table lead, external lead, or lead user action before querying.
- For public/user dashboard questions, inspect dashboards such as `User Dashboard`, `User Dashboard - Star`, `User Dashboard - Vilaasa`, `Yello Dashboard`, `Yello! Final Dashboard`, and `RentOk Optimization Dashboard` for query shape.
- For high-impact app-visible metrics, suggest a one-property manager app cross-check before trusting a global answer.
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

### Invoices and Payments

- Dues are invoice-side: unpaid, active invoice amounts.
- Collections are payment-side unless a due-type or invoice-level filter changes the lens.
- Be explicit about paid date vs due date, invoice-side vs payment-side, and refund handling.
- For dues-over-threshold questions, clarify tenant-level vs property-level grouping before querying.
- For non-technical verification, run one property first and compare against the manager app before running all properties.

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
- Treat Yello short-term/long-term and revenue formulas as client-specific until verified.

## Learning Loop

When a teammate finds a reliable workaround, client issue, stale dashboard, missing caveat, or corrected query:

1. Capture a learning note with question, failure, fix, evidence, client, date, team, and confidence.
2. Keep credentials and secrets out of the note.
3. Do not silently mutate shared rules from one local workaround.
4. Promote only after review against backend meaning, Metabase evidence, or the gold pack.
5. After promotion, sync the reviewed skill package for other teammates.

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
