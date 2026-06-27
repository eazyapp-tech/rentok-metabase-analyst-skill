# RentOk Metabase Question Inventory

## What this is

This doc lists the first high-value questions the Metabase analyst skill should handle systematically.

The goal is simple:

- do not start from random natural-language prompts
- start from real question families
- map each question to a risk level
- decide which ones need approved formulas before broad rollout

## Risk levels

### Low

Can usually be answered after live verification with limited ambiguity.

### Medium

Needs an approved counting unit, date rule, or join path.

### High

Can sound simple but is easy to get wrong without backend grounding, anomaly checks, or app validation.

## Team question inventory v1

| Team | Question | Metric family | Risk | Why |
|---|---|---|---|---|
| Business | What % of properties are test and what % are real? | property_scope | Low | explicit `property.is_test` exists |
| Business | How many active properties do we have right now? | property_scope | Medium | deleted vs non-deleted scope must be stated |
| Business | How many active tenants do we have? | tenant_lifecycle | Low | `tenant.status = 1` is grounded |
| Business | How many bookings do we have? | tenant_lifecycle | Low | `tenant.status = 2` is grounded |
| Business | How many leads do we have? | tenant_lifecycle | Medium | `tenant.status = 3` is clear, but user may mean demo leads instead |
| Business | How much total dues do we have? | dues_finance | High | invoice-side formula only |
| Business | How many tenants or properties have dues above 1 lakh? | dues_finance | High | grouping, joins, and anomaly handling matter |
| Business | How much collection did we do this month? | collections_finance | High | invoice-side vs payment-side must be explicit |
| Business | How much revenue and dues do we have this month? | collections_finance | High | dashboard wording may hide formula assumptions |
| Sales ops | How many SalesHub accounts are under a portfolio manager? | saleshub_portfolio | High | SalesHub unit is not normal property analytics |
| Sales ops | How many active customer properties belong to a portfolio manager? | saleshub_portfolio | High | account row vs real property must be separated |
| Sales ops | How many demo leads do we have? | leads_demo | Medium | source should usually be `demo_leads` |
| Sales ops | How many product leads do we have inside properties? | leads_demo | Medium | source should usually be `tenant.status = 3` |
| Sales ops | How many leads came from Booking Bot? | leads_demo | High | saved dashboard logic uses tricky statuses and lead sources |
| Marketing | How many book-demo leads did we get this period? | leads_demo | Medium | date anchor must be explicit |
| Marketing | What does the funnel look like from lead to booking to tenant? | leads_demo | High | multiple source systems may be involved |
| Product ops | Which properties are using the most features? | product_adoption | Medium | existing feature-adoption dashboard is a strong source |
| Product ops | Which properties are weak on workflow health or adoption? | product_adoption | Medium | relies on dashboard logic and naming consistency |
| Product ops | Which properties have the most complaints this month? | support_quality | Medium | complaint status/date logic matters |
| Product ops | Which properties have weak KYC/PV/LLA completion? | support_quality | Medium | dashboard logic is useful but should be verified live |
| Product | How many move-ins and move-outs happened this month? | lifecycle_movement | Medium | date field and duplicate card logic matter |
| Product | How many tenants are under notice or eviction? | lifecycle_movement | High | different notice and eviction states exist |
| Product | What is current occupancy? | occupancy_rooms_beds | High | active only vs active plus booking vs bed-level matters |
| Product | How many vacant beds do we have? | occupancy_rooms_beds | High | old structure vs new structure logic matters |
| Design | What do customers see on the user dashboard for a property? | customer_dashboard | Medium | dashboard-backed but still live-filtered |
| Design | Which operational cards matter most on customer dashboards? | customer_dashboard | Low | dashboard evidence is strong enough |

## Routing by family

### property_scope

Typical wording:

- test vs real properties
- active properties
- deleted properties
- property portfolio counts

### tenant_lifecycle

Typical wording:

- active tenants
- bookings
- leads
- invited users
- deleted tenants

### dues_finance

Typical wording:

- total dues
- overdue dues
- rent receivable
- dues above a threshold

### collections_finance

Typical wording:

- this month collection
- revenue and dues
- online vs offline collection
- expenses

### occupancy_rooms_beds

Typical wording:

- current occupancy
- vacant beds
- tenant vs booking
- short-term vs long-term occupancy

### lifecycle_movement

Typical wording:

- move-ins
- move-outs
- arrivals
- check-outs
- notice raised
- eviction

### leads_demo

Typical wording:

- demo leads
- booking bot leads
- product leads
- funnel questions

### saleshub_portfolio

Typical wording:

- portfolio manager
- portfolio users
- plan status
- SalesHub account
- real customer properties

### support_quality

Typical wording:

- complaints
- maintenance issues
- KYC
- PV
- signed agreement

### product_adoption

Typical wording:

- feature usage
- workflow health
- report downloads
- data quality

## Priority build order

Build these families first:

1. property_scope
2. tenant_lifecycle
3. dues_finance
4. collections_finance
5. occupancy_rooms_beds
6. saleshub_portfolio

Why:

- they are common
- they are business-important
- they are where wrong answers are most expensive

## What happens next

Each inventory item should become a metric-registry entry with:

- approved formula
- approved joins
- stop-rules
- confidence rules
- dashboard references
- backend references
- app validation path where relevant
