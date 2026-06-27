# RentOk Metabase Dashboard Evidence Map

## What this is

This doc maps important Metabase dashboards to:

- the teams they help
- the metric families they support
- the kinds of joins and filters they reveal
- how much we should trust them

Use this to mine dashboards systematically instead of reading them ad hoc.

## Trust labels

### Strong hint

Useful for business wording, likely filters, and likely query shape.

### Operational reference

Useful for real working logic, but still needs live verification before being treated as current truth.

### Caution

Useful only as a clue. Client-specific, stale, duplicate, or structurally tricky.

## Dashboard coverage

| Dashboard | ID | Team fit | Main families | Trust | Notes |
|---|---:|---|---|---|---|
| User Dashboard | 88 | business, product ops, product, design | occupancy, lifecycle, support quality, basic money | Operational reference | broad customer-facing dashboard with many core cards |
| User Dashboard - Mobile | 90 | design, product | occupancy, lifecycle, support quality | Caution | mostly duplicate/mobile-shaped cards, older update date |
| User Dashboard - Star | 137 | business, product ops | occupancy, lifecycle, support quality | Operational reference | similar to user dashboard but client-specific |
| User Dashboard - Star Custom | 138 | business, product ops | occupancy, lifecycle, support quality | Operational reference | custom variant; useful for issue slices |
| User Dashboard - Vilaasa | 105 | business, product, design | occupancy, lifecycle, support quality | Strong hint | especially useful because it contains bed-level `tenant_room` logic |
| Yello Dashboard | 91 | business, product | occupancy, movement, short-term vs long-term | Caution | useful for structure and wording, but likely client-specific |
| Yello Dashboard - Only for Admins | 92 | business | movement, revenue | Caution | admin-only, includes potential revenue logic that must be verified |
| Yello! Final Dashboard | 95 | business, product ops | occupancy, complaints, arrivals, dues/revenue | Operational reference | strong for short-term and long-term operations but not generic finance truth |
| Harsh RentOk Feature Adoption Dashboard | 194 | product ops, product | feature usage, collection/expense slices, complaints, KYC | Strong hint | valuable for product ops and adoption questions |
| RentOk Optimization Dashboard | 196 | product ops, product | feature summary | Strong hint | small now, but useful as a compact operational summary |
| User Interaction Insights Dashboard | 193 | product | unknown | Caution | currently empty in live inspection |

## Evidence extracted from live inspection

Checked on June 27, 2026.

### User Dashboard family

Common card themes:

- Rooms
- Beds
- Current Occupancy Status
- Tenant Vs Booking
- Current Tenants
- Bookings
- Tenants joining this month
- Move-outs vs move-ins
- Tenants under eviction
- Notice raised
- Signed agreements
- PV verified vs not verified
- KYC verified vs not verified

Why this matters:

- it is the closest thing to a customer-operations starter pack
- it already expresses the terms non-tech teammates recognize
- it is a good source for occupancy, lifecycle, and support-quality question phrasing

### Yello family

Common card themes:

- short-term occupancy
- long-term occupancy
- short-term vs long-term pie chart
- revenue bifurcation
- tenants under notice
- upcoming arrivals
- upcoming check-outs
- complaints and maintenance issues
- current month revenue and dues

Why this matters:

- best current live clue for short-term vs long-term operations
- useful for arrivals, check-outs, and notice questions
- not safe as generic finance truth without formula review

### Feature-adoption family

Common card themes from dashboard `194`:

- Top properties by total feature usage
- Feature breakdown per property
- Detailed breakdown table
- Offline collection monthly
- Expenses monthly
- Payment transaction drill-down
- Report downloads by type monthly
- Complaints monthly
- eKYC monthly
- Smart attendance monthly

Why this matters:

- strong operational vocabulary for product ops
- gives reusable patterns for property-level rollups
- can help classify product ops questions before building new SQL

## Reusable signals by family

### occupancy_rooms_beds

Best dashboards:

- User Dashboard
- User Dashboard - Star
- User Dashboard - Vilaasa
- Yello Dashboard
- Yello! Final Dashboard

Evidence shape:

- rooms, beds, occupancy status
- tenant vs booking
- room-name joins
- Vilaasa bed-level `tenant_room` logic

### lifecycle_movement

Best dashboards:

- User Dashboard
- User Dashboard - Star
- Yello Dashboard
- Yello Dashboard - Only for Admins
- Yello! Final Dashboard

Evidence shape:

- joins using tenant plus property
- arrivals and check-outs
- notice raised and eviction cards

### support_quality

Best dashboards:

- User Dashboard
- User Dashboard - Star
- User Dashboard - Star Custom
- User Dashboard - Vilaasa
- Yello! Final Dashboard
- Harsh RentOk Feature Adoption Dashboard

Evidence shape:

- complaints
- maintenance issues
- KYC
- PV
- agreements

### product_adoption

Best dashboards:

- Harsh RentOk Feature Adoption Dashboard
- RentOk Optimization Dashboard
- 01 - Health Pulse
- 02 - Feature Portfolio
- 03 - Activation Gap
- 04 - Workflow Health

Evidence shape:

- property-level feature summary
- report download usage
- complaints, eKYC, stamp agreements, attendance

### dues_finance and collections_finance

Best dashboards:

- User Dashboard family
- Yello admin and final dashboards
- Harsh RentOk Feature Adoption Dashboard
- dedicated rent collection and payment dashboards from the existing-assets guide

Evidence shape:

- wording exists
- some working query shapes exist
- formulas must still be grounded in backend rules before promotion

## Dashboard mining workflow

When adding a new metric to the registry:

1. Search whether a saved dashboard or card already expresses the same business question.
2. Record the dashboard id, card name, and why it is relevant.
3. Extract the useful parts:
   - wording
   - filters
   - joins
   - date logic
4. Compare against backend meaning.
5. Mark the dashboard as:
   - safe wording source
   - safe shape hint
   - caution only
6. Run the metric live before promoting it.

## What dashboards should never do alone

Do not let a saved dashboard by itself settle:

- total dues
- collection truth
- portfolio-manager counts
- property test/real baselines
- tenant-status meanings
- bed-level occupancy on mixed property structures

These need backend and live-query grounding.
