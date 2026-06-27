#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

required_files=(
  "$ROOT/README.md"
  "$ROOT/CHANGELOG.md"
  "$ROOT/VERSION"
  "$ROOT/CONTRIBUTING.md"
  "$ROOT/docs/RENTOK_METABASE_DASHBOARD_EVIDENCE_MAP.md"
  "$ROOT/docs/RENTOK_METABASE_ROLLOUT_QUICKSTART.md"
  "$ROOT/docs/RENTOK_METABASE_PROMPT_PACK.md"
  "$ROOT/docs/RENTOK_METABASE_GOLD_PACK.md"
  "$ROOT/docs/RENTOK_METABASE_PILOT_SCORECARD.md"
  "$ROOT/docs/RENTOK_METABASE_VALIDATION_WORKFLOW.md"
  "$ROOT/docs/RENTOK_METABASE_LEARNING_LOOP.md"
  "$ROOT/docs/RENTOK_METABASE_HARDENING_NOTES.md"
  "$ROOT/docs/RENTOK_METABASE_METRIC_REGISTRY_V1.md"
  "$ROOT/docs/RENTOK_METABASE_PUBLIC_USER_DASHBOARDS.md"
  "$ROOT/docs/RENTOK_METABASE_QUESTION_INVENTORY.md"
  "$ROOT/docs/learnings/LEARNING_NOTE_TEMPLATE.md"
  "$ROOT/scripts/live_regression_pack.js"
  "$ROOT/skill/rentok-metabase-analyst/SKILL.md"
  "$ROOT/skill/rentok-metabase-analyst/agents/openai.yaml"
  "$ROOT/skill/rentok-metabase-analyst/references/grounding-map.md"
  "$ROOT/skill/rentok-metabase-analyst/references/gold-pack.md"
  "$ROOT/skill/rentok-metabase-analyst/references/rollout-pack.md"
  "$ROOT/skill/rentok-metabase-analyst/references/learning-loop.md"
)

for file in "${required_files[@]}"; do
  [[ -f "$file" ]] || { echo "Missing required file: $file"; exit 1; }
done

[[ -d "$ROOT/docs/learnings/inbox" ]] || { echo "Missing learnings inbox"; exit 1; }
[[ -d "$ROOT/docs/learnings/reviewed" ]] || { echo "Missing learnings reviewed"; exit 1; }
[[ -d "$ROOT/docs/learnings/rejected" ]] || { echo "Missing learnings rejected"; exit 1; }

grep -q "Read-only Metabase analyst package" "$ROOT/README.md" || { echo "README missing expected intro"; exit 1; }
grep -q "name: rentok-metabase-analyst" "$ROOT/skill/rentok-metabase-analyst/SKILL.md" || { echo "Skill frontmatter missing expected name"; exit 1; }
grep -q "90/110\\|99/110" "$ROOT/docs/RENTOK_METABASE_GOLD_PACK.md" || { echo "Gold pack missing pilot threshold"; exit 1; }
grep -Eqi "one-property|one property|single-property|single property" "$ROOT/docs/RENTOK_METABASE_ROLLOUT_QUICKSTART.md" || { echo "Quickstart missing app cross-check guidance"; exit 1; }
grep -q "learning note" "$ROOT/docs/RENTOK_METABASE_LEARNING_LOOP.md" || { echo "Learning loop missing learning note guidance"; exit 1; }
grep -q "status = 0" "$ROOT/docs/RENTOK_METABASE_HARDENING_NOTES.md" || { echo "Hardening notes missing dues status guidance"; exit 1; }
grep -q "verified_on" "$ROOT/scripts/live_regression_pack.js" || { echo "Live regression pack missing verified_on output"; exit 1; }
grep -q "Priority build order" "$ROOT/docs/RENTOK_METABASE_QUESTION_INVENTORY.md" || { echo "Question inventory missing build order"; exit 1; }
grep -q "Trust labels" "$ROOT/docs/RENTOK_METABASE_DASHBOARD_EVIDENCE_MAP.md" || { echo "Dashboard evidence map missing trust labels"; exit 1; }
grep -q "Registry status labels" "$ROOT/docs/RENTOK_METABASE_METRIC_REGISTRY_V1.md" || { echo "Metric registry missing status labels"; exit 1; }

echo "Repo validation passed."
