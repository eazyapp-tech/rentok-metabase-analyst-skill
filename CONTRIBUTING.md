# Contributing

This repo is a shared skill package for RentOk teams.

The goal is not just to collect ideas. The goal is to improve the skill without weakening trust.

## Core rules

- Keep the skill read-only.
- Prefer explicit fields over heuristics.
- Treat existing dashboards as hints, not final truth.
- Keep credentials and secrets out of the repo.
- Preserve the learning loop: local fix first, reviewed promotion second.

## Before changing anything

Read these first:

- [README.md](./README.md)
- [Rollout Quickstart](./docs/RENTOK_METABASE_ROLLOUT_QUICKSTART.md)
- [Learning Loop](./docs/RENTOK_METABASE_LEARNING_LOOP.md)
- [Learning Note Template](./docs/learnings/LEARNING_NOTE_TEMPLATE.md)

## What belongs here

Good contributions:

- tighter metric definitions
- better prompt wording
- safer caveats
- better dashboard/query references
- clearer rollout guidance
- validated new common-question patterns

Bad contributions:

- credentials
- one-person local hacks
- unverified finance formulas
- stale dashboard numbers presented as truth
- prompt changes that weaken caveat honesty

## Workflow

1. Reproduce the issue or confirm the improvement.
2. Create or update a learning note if the change came from real usage.
3. Patch the relevant docs or skill files.
4. Run the local validator.
5. Update `CHANGELOG.md` and `VERSION` if the change should ship.
6. Open a PR or commit with a short plain message.

## Validation

Run:

```bash
./scripts/validate_repo.sh
```

This validator checks that the key files exist and that core repo links and structure are still intact.

## Versioning

Use simple semver-like bumps:

- `0.1.x` for pilot improvements
- `0.2.x` for expanded persona or workflow coverage
- `1.0.0` after broad internal rollout proof

## Review standard

A change is ready when:

- it improves the skill for more than one teammate
- it keeps read-only safety intact
- it is evidence-backed
- it does not hide uncertainty
- the validator still passes
