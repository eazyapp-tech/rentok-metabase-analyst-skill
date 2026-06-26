# RentOk Metabase Learning Loop

## What this is

This doc defines how the RentOk Metabase analyst skill should learn from real team usage.

The goal is collective wisdom:

- one teammate finds a fix
- the fix is captured with evidence
- the fix is reviewed
- the shared skill improves
- the next teammate benefits

The goal is not uncontrolled auto-editing.

Analytics rules affect business decisions. A local workaround should not silently become truth for everyone until it is checked.

## The safe learning model

Use a reviewed shared loop:

1. Capture local learning.
2. Store it in a shared learning log.
3. Review it against backend code, Metabase assets, and live queries.
4. Promote it into the shared skill or reference docs.
5. Sync teammate clients from the reviewed shared version.

## What should be captured

Capture a learning note when any of these happen:

- a Metabase MCP client fails in a repeatable way
- a saved dashboard or question is hard to find
- a query gives a wrong number until a specific filter is added
- a team-specific term has a hidden meaning
- a dashboard is stale
- a table or join meaning is clarified from backend code
- a persona asks a common question not covered by the gold pack
- a workaround makes Codex, Claude Code, Antigravity, or OpenCode behave better

## Learning note format

Every note should use this shape:

```markdown
# Learning Note

Date:
Author:
Client:
Team:

## User question

Plain question the teammate asked.

## What failed

What the skill or client did wrong.

## Working fix

The prompt, query, table, filter, or workflow that fixed it.

## Evidence

Metabase card, dashboard, query result, backend file, or screenshot reference.

## Confidence

High, medium, or low.

## Proposed promotion

Where this should go:
- skill prompt
- grounding map
- formula map
- existing assets guide
- gold pack
- client setup guide
```

Use the copyable template:

- [LEARNING_NOTE_TEMPLATE.md](./learnings/LEARNING_NOTE_TEMPLATE.md)

## Promotion rules

Promote a learning into the shared skill only when all are true:

- the issue is likely to recur
- the fix is understandable to non-technical users or can be hidden inside the skill
- the fix is backed by evidence
- the fix does not weaken read-only safety
- the fix does not turn a heuristic into fake certainty
- at least one regression or gold-pack question still passes after the change

## Do not promote

Do not promote:

- one-off local hacks that depend on one laptop path
- credentials or secret-bearing config
- guesses about schema meaning
- stale dashboard numbers
- client-specific phrasing that would confuse other tools
- finance formulas that have not been checked against backend logic

## Shared storage options

The best shared location depends on rollout maturity.

### Pilot phase

Use a shared repo folder:

- `docs/ai/learnings/inbox/`
- `docs/ai/learnings/reviewed/`
- `docs/ai/learnings/rejected/`

This is simple, auditable, and works across Codex, Claude Code, Antigravity, and OpenCode.

### Team rollout phase

Use a small central Git repo or Notion/Obsidian page as the intake layer, then generate the skill files from reviewed notes.

Recommended source of truth:

- reviewed markdown notes
- reviewed skill prompt
- reviewed references
- version number
- changelog

## Sync model

Each teammate's local setup should be able to pull the latest reviewed skill package.

Recommended command shape:

```bash
rentok-metabase-skill sync
```

What sync should do:

- pull the reviewed skill bundle
- validate required files exist
- run a quick skill validation
- show the skill version installed
- never print secrets

## Suggested versioning

Use simple semantic versions:

- `0.1.x` for pilot fixes
- `0.2.x` for expanded persona coverage
- `1.0.0` only after team rollout passes

Every promoted learning should add one changelog entry:

```markdown
## 0.1.3 - 2026-06-26

- Added SalesHub portfolio-manager routing rule.
- Added demo lead vs tenant lead distinction.
```

## Self-healing behavior inside the skill

When a teammate reports an issue, the skill should:

1. classify whether it is a data issue, schema issue, client issue, or prompt issue
2. attempt a safe workaround if it can stay read-only
3. explain the workaround
4. capture a learning note
5. recommend promotion if the issue is likely to recur

The skill should not:

- edit shared files silently
- push changes without review
- hide uncertainty
- make Metabase write operations
- store credentials in notes

## Minimum rollout loop

For the first rollout, do this:

1. Each team member uses the same base skill prompt.
2. Every failed or corrected answer creates a learning note.
3. One owner reviews notes daily during pilot.
4. Reviewed fixes are merged into the shared skill package.
5. Everyone syncs before the next usage block.
6. Gold-pack questions are rerun after each promoted change.

Use the rollout guide:

- [RENTOK_METABASE_ROLLOUT_QUICKSTART.md](./RENTOK_METABASE_ROLLOUT_QUICKSTART.md)

## Why this matters

The analyst skill will become useful only if it learns from real business questions.

But it will stay trusted only if learning is evidence-backed and reviewed.
