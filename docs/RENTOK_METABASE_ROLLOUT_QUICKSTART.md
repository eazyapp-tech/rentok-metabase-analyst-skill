# RentOk Metabase Rollout Quickstart

## What this is

This is the day-one setup guide for teammates who will use the RentOk Metabase analyst from Codex, Claude Code, Antigravity, OpenCode, or another AI coding client.

The goal is simple:

- connect Metabase in read-only mode
- install or paste the RentOk analyst skill
- run the same pilot checks
- capture learnings in a shared place

## Non-negotiable rules

- Use read-only Metabase access.
- Do not paste passwords or tokens into skill files.
- Store Metabase credentials in environment variables or the client's secret manager.
- Use existing dashboards as hints, not final truth.
- Run a fresh live query before giving a final number.
- Capture repeatable issues as learning notes.

## Required Metabase environment

Use these variable names where the client supports environment variables:

```bash
METABASE_URL=https://metabase.rentok.com
METABASE_USER_EMAIL=<team-member-email>
METABASE_PASSWORD=<team-member-password-or-secret-ref>
METABASE_READ_ONLY_MODE=true
```

Do not commit these values.

## Community MCP package

Use the community MCP:

```bash
npx -y @jerichosequitin/metabase-mcp
```

The MCP should receive Metabase credentials through environment variables.

## Codex setup

Use the global skill when available:

```text
rentok-metabase-analyst
```

Expected global path on this machine:

```text
/Users/eazypg/.codex/skills/rentok-metabase-analyst
```

Minimum Codex MCP shape:

```toml
[mcp_servers.metabase]
command = "npx"
args = ["-y", "@jerichosequitin/metabase-mcp"]
startup_timeout_sec = 120

[mcp_servers.metabase.env]
METABASE_URL = "{env:METABASE_URL}"
METABASE_USER_EMAIL = "{env:METABASE_USER_EMAIL}"
METABASE_PASSWORD = "{env:METABASE_PASSWORD}"
METABASE_READ_ONLY_MODE = "true"
```

## Claude Code setup

Use the same MCP package and the prompt from:

- [RENTOK_METABASE_PROMPT_PACK.md](/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_METABASE_PROMPT_PACK.md)

If Claude Code supports local skills in that teammate's setup, install the same skill body and references.

If not, paste:

- base prompt
- relevant team add-on
- gold-pack warning examples

## Antigravity and OpenCode setup

Use the same order:

1. configure the community Metabase MCP
2. attach the base prompt
3. attach the relevant team add-on
4. attach the glossary, formula map, existing assets guide, public dashboard guide, and gold pack if the client supports file references

If the client cannot attach files, use the short fallback prompt plus the team add-on.

## First test after install

Ask:

```text
What % of properties are test and what % are real?
```

Expected current verified answer from June 26, 2026 for active non-deleted properties:

- total properties: `68,808`
- test properties: `1,493`
- real properties: `67,315`
- test share: `2.17%`
- real share: `97.83%`

Must say:

- table: `property`
- field: `is_test`
- confidence: high

## Single-property app cross-check

This is the fastest trust loop for non-technical teammates.

Use it when a question matters and the user can verify one property in the RentOk Manager app.

Example question:

```text
How many tenants have unpaid dues worth more than 1 lakh?
```

Recommended workflow:

1. Pick one property that the user can open in the manager app.
2. Ask the analyst for the answer for only that property first.
3. Ask the analyst to show the exact filters used.
4. Open the same property in the app.
5. Check whether the app's dues screen shows the same tenants or count.
6. If it matches, run the same query for all properties.
7. If it does not match, capture a learning note and do not trust the global query yet.
8. If the all-properties result shows absurd unpaid amounts, inspect the top rows and call out likely data outliers before presenting the final answer.

What this proves:

- the query shape is likely aligned with the app
- the join/filter choice is probably right
- the teammate has a practical confidence check without reading SQL

What this does not prove:

- every property edge case is covered
- old, deleted, test, short-term, or SalesHub-specific records are handled correctly
- finance-final reporting is certified

For stronger proof, test:

- one normal property
- one property with many dues
- one property with bookings or short-term rooms, if relevant

The analyst should proactively suggest this workflow for high-impact questions.

## Required pilot sequence

Run these in every client before broad team use:

1. `What % of properties are test and what % are real?`
2. `How many active tenants do we have?`
3. `How many bookings do we have?`
4. `How many leads do we have?`
5. `What % of users are test and what % are real?`
6. `For SalesHub, what does portfolio manager mean?`
7. `How should demo leads be counted?`
8. `How should customer-facing user dashboard questions be handled?`
9. `How should we verify a dues query against the manager app before running it globally?`
10. `What should happen when a teammate finds a client-specific workaround?`

Score with:

- [RENTOK_METABASE_PILOT_SCORECARD.md](/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/RENTOK_METABASE_PILOT_SCORECARD.md)

## Team add-ons

Use the team add-ons from the prompt pack.

Recommended mapping:

| Team | Add-on |
|---|---|
| Business | business team add-on |
| Marketing | marketing team add-on |
| Sales ops | sales ops add-on |
| Product ops | product ops add-on |
| Product | product add-on |
| Design | design add-on |

## What to do when an answer seems wrong

Do not silently fix it only in chat.

Create a learning note in:

```text
docs/ai/learnings/inbox/
```

Use:

- [LEARNING_NOTE_TEMPLATE.md](/Users/eazypg/RentOk_Manager_App/rentokmanagerflutter/docs/ai/learnings/LEARNING_NOTE_TEMPLATE.md)

Then review and promote only if it is backed by evidence.

## Promotion checklist

Before a learning becomes part of the shared skill:

- [ ] issue is likely to recur
- [ ] evidence is included
- [ ] no credentials are included
- [ ] backend or dashboard source is named
- [ ] read-only safety is preserved
- [ ] gold-pack checks still pass
- [ ] the update belongs in the skill, glossary, formula map, dashboard guide, or prompt pack

## Rollout owner daily routine

During pilot:

1. Review `docs/ai/learnings/inbox/`.
2. Move accepted notes to `docs/ai/learnings/reviewed/`.
3. Move rejected notes to `docs/ai/learnings/rejected/`.
4. Patch the relevant shared docs or skill references.
5. Run skill validation.
6. Ask teammates to sync the reviewed package.

## Current validation command

On this machine:

```bash
python3 /Users/eazypg/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/eazypg/.codex/skills/rentok-metabase-analyst
```

Expected output:

```text
Skill is valid!
```
