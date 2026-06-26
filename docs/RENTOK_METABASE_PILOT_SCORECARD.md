# RentOk Metabase Pilot Scorecard

## What this is

This is the scorecard for comparing how well different AI clients perform with the RentOk Metabase analyst setup.

Use it for:

- Codex
- Claude Code
- Antigravity
- OpenCode
- any future client

## How to use it

1. Pick one client.
2. Install or configure the community Metabase MCP.
3. Apply the chosen prompt from the prompt pack.
4. Run the gold question set.
5. Fill this scorecard.
6. Repeat for the next client.

Use the setup guide:

- [RENTOK_METABASE_ROLLOUT_QUICKSTART.md](./RENTOK_METABASE_ROLLOUT_QUICKSTART.md)

## Setup block

| Field | Fill |
|---|---|
| Client name |  |
| Client version |  |
| Date tested |  |
| Prompt variant used |  |
| MCP connected successfully | Yes / No |
| Read-only mode verified | Yes / No |
| Tester name |  |

## Question scoring

Use the gold pack:

- [RENTOK_METABASE_GOLD_PACK.md](./RENTOK_METABASE_GOLD_PACK.md)

### G1. Test vs real properties

| Check | Score |
|---|---:|
| Correct main table | /2 |
| Correct logic | /2 |
| Correct counting unit | /1 |
| Correct final number | /2 |
| Shows logic and source | /1 |
| Honest caveat handling | /2 |
| **Total** | **/10** |

Notes:

### G2. Active tenants

| Check | Score |
|---|---:|
| Correct main table | /2 |
| Correct logic | /2 |
| Correct counting unit | /1 |
| Correct final number | /2 |
| Shows logic and source | /1 |
| Honest caveat handling | /2 |
| **Total** | **/10** |

Notes:

### G3. Bookings

| Check | Score |
|---|---:|
| Correct main table | /2 |
| Correct logic | /2 |
| Correct counting unit | /1 |
| Correct final number | /2 |
| Shows logic and source | /1 |
| Honest caveat handling | /2 |
| **Total** | **/10** |

Notes:

### G4. Leads

| Check | Score |
|---|---:|
| Correct main table | /2 |
| Correct logic | /2 |
| Correct counting unit | /1 |
| Correct final number | /2 |
| Shows logic and source | /1 |
| Honest caveat handling | /2 |
| **Total** | **/10** |

Notes:

### G5. Test vs real users

| Check | Score |
|---|---:|
| Correct main table | /2 |
| Correct logic | /2 |
| Correct counting unit | /1 |
| Correct final number | /2 |
| Shows logic and source | /1 |
| Honest caveat handling | /2 |
| **Total** | **/10** |

Notes:

### G6. Tenant status meanings

| Check | Score |
|---|---:|
| Correct main table/source | /2 |
| Correct business meaning | /2 |
| Correct counting or interpretation unit | /1 |
| Correct final answer | /2 |
| Shows logic and source | /1 |
| Honest caveat handling | /2 |
| **Total** | **/10** |

Notes:

### G7. SalesHub portfolio-manager meaning

| Check | Score |
|---|---:|
| Correct main table/source | /2 |
| Correct business meaning | /2 |
| Correct counting or interpretation unit | /1 |
| Correct final answer | /2 |
| Shows logic and source | /1 |
| Honest caveat handling | /2 |
| **Total** | **/10** |

Notes:

### G8. Demo leads counting

| Check | Score |
|---|---:|
| Correct main table/source | /2 |
| Correct business meaning | /2 |
| Correct counting unit | /1 |
| Correct final answer | /2 |
| Shows logic and source | /1 |
| Honest caveat handling | /2 |
| **Total** | **/10** |

Notes:

### G9. Learning loop behavior

| Check | Score |
|---|---:|
| Correct capture workflow | /2 |
| Correct promotion safety | /2 |
| Correct shared-learning unit | /1 |
| Correct final recommendation | /2 |
| Shows evidence requirement | /1 |
| Honest caveat handling | /2 |
| **Total** | **/10** |

Notes:

### G10. Public/user dashboard behavior

| Check | Score |
|---|---:|
| Finds matching public/user dashboard | /2 |
| Uses dashboard logic as hint, not final truth | /2 |
| States counting/filtering unit | /1 |
| Runs or asks for fresh verification | /2 |
| Shows source dashboard/tables | /1 |
| Honest caveat handling | /2 |
| **Total** | **/10** |

Notes:

### G11. App cross-check for unpaid-dues threshold queries

| Check | Score |
|---|---:|
| Clarifies tenant vs property grouping | /2 |
| Uses unpaid active invoice logic | /2 |
| States scope and threshold | /1 |
| Recommends one-property app cross-check first | /2 |
| Explains what the app check proves and does not prove | /1 |
| Honest caveat handling | /2 |
| **Total** | **/10** |

Notes:

## Roll-up score

| Metric | Value |
|---|---|
| G1 total | /10 |
| G2 total | /10 |
| G3 total | /10 |
| G4 total | /10 |
| G5 total | /10 |
| G6 total | /10 |
| G7 total | /10 |
| G8 total | /10 |
| G9 total | /10 |
| G10 total | /10 |
| G11 total | /10 |
| **Overall** | **/110** |

## Rating

| Range | Meaning |
|---|---|
| `99-110` | Ready for pilot |
| `83-98` | Needs prompt work |
| `<83` | Not ready |

Automatic failure conditions:

- any write behavior
- any confident presentation of heuristic logic as verified truth
- any fabricated schema meaning
- any SalesHub portfolio answer that hides its counting unit
- any customer-facing dashboard answer that ignores relevant public/user dashboards
- any high-impact app-visible query that skips practical app cross-check when feasible
- any advice to sync unreviewed local workarounds into every teammate's skill

## Qualitative review

### Strengths

- 

### Weak spots

- 

### Most common failure mode

- 

### Best fit team

- business
- marketing
- sales ops
- product ops
- product
- design

### Recommendation

- use as-is
- use with prompt tweaks
- use only for limited green-zone questions
- do not roll out yet

## Pilot operator checklist

Before marking a client ready:

- [ ] MCP connection works reliably
- [ ] answers stay read-only
- [ ] gold pack score is at least `99/110`
- [ ] heuristic caveats are handled honestly
- [ ] property test-vs-real answer is correct
- [ ] active tenants, bookings, and leads are correct
- [ ] SalesHub and portfolio answers state their unit clearly
- [ ] public/user dashboard questions inspect relevant existing dashboards
- [ ] high-impact app-visible queries suggest one-property app cross-check first
- [ ] learning-loop answer captures fixes without unsafe auto-mutation
- [ ] tester would trust this for green-zone questions

## Related assets

- [RENTOK_METABASE_PROMPT_PACK.md](./RENTOK_METABASE_PROMPT_PACK.md)
- [RENTOK_METABASE_ROLLOUT_QUICKSTART.md](./RENTOK_METABASE_ROLLOUT_QUICKSTART.md)
- [RENTOK_METABASE_GOLD_PACK.md](./RENTOK_METABASE_GOLD_PACK.md)
- [RENTOK_METABASE_VALIDATION_WORKFLOW.md](./RENTOK_METABASE_VALIDATION_WORKFLOW.md)
- [RENTOK_METABASE_LEARNING_LOOP.md](./RENTOK_METABASE_LEARNING_LOOP.md)
