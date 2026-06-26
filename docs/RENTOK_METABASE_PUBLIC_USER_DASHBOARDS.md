# RentOk Metabase Public User Dashboards

## What this is

This doc captures the Metabase dashboards that look closest to customer-facing or public user reporting.

These dashboards are valuable because they contain many working joins and product-facing metric shapes.

Use them as query-shape references, not as automatic source-of-truth.

## Dashboards inspected

Checked on June 26, 2026:

| Dashboard | ID | Why it matters |
|---|---:|---|
| `User Dashboard` | `88` | Broad customer-facing property operations dashboard |
| `User Dashboard - Mobile` | `90` | Mobile-shaped variant of the user dashboard |
| `User Dashboard - Star` | `137` | Client-specific variant with the same core patterns |
| `User Dashboard - Star Custom` | `138` | Custom user dashboard with complaints and NPS-style slices |
| `User Dashboard - Vilaasa` | `105` | Client-specific user dashboard with bed-level joins |
| `Yello Dashboard` | `91` | Short-term and long-term occupancy and tenant movement |
| `Yello Dashboard - Only for Admins` | `92` | Yello admin dashboard with revenue logic |
| `Yello! Final Dashboard` | `95` | Final Yello dashboard with occupancy, complaints, arrivals, check-outs, and revenue |
| `RentOk Optimization Dashboard` | `196` | Feature/usage summary across operational tables |

## What they are good for

Use these dashboards when the user asks about:

- customer-facing property dashboard numbers
- property portfolio views by `eazypg_id`
- rooms and beds
- occupancy
- tenants vs bookings
- move-ins and move-outs
- tenants under notice
- short-term vs long-term rooms
- complaints and maintenance issues
- KYC, police verification, and rental agreement completion
- current month revenue and dues
- feature usage or operational adoption

## Common filter pattern

Most user dashboards filter by property portfolio using `property.eazypg_id`.

Observed patterns:

- single value: `p.eazypg_id LIKE {{eazypg_id}}`
- multi-value list: `p.eazypg_id LIKE ANY (string_to_array({{eazypg_id}}, ','))`
- fuzzy optimization filter: `CAST(p.eazypg_id AS text) ILIKE '%' || {{eazypg_id}} || '%'`

Analyst rule:

- if the user asks about a portfolio/user dashboard, look for `eazypg_id` filtering first
- state whether the answer is filtered to one property group or all properties

## Reusable join patterns

### Tenant to property

Use:

```sql
tenant.property_id = property.id
```

This is used across current tenants, bookings, move-ins, move-outs, eviction, and tenant status cards.

### Room to property

Use:

```sql
room.property_id = property.id
```

This is used for room and bed counts.

### Tenant to room by room name

Common dashboard pattern:

```sql
tenant.room = room.name
AND tenant.property_id = room.property_id
```

Some cards use:

```sql
room.name = tenant.room
AND tenant.property_id = property.id
AND room.property_id = property.id
```

Use with care because room names are not as clean as ids. Prefer property-structure-aware logic when the exact bed-level relation matters: old structures may still rely on `tenant.room`, while newer ones can use `tenant_room` or history-backed logic.

### Bed-level tenant relation

The Vilaasa dashboard uses the stronger bed-level bridge:

```sql
tenant_room.room_id = room.id
AND room.unit_type = 'BED'
tenant_room.tenant_id = tenant.id
```

Use this pattern when a bed-level answer needs stronger grounding than room-name matching.

### Invoice to tenant/property

Observed patterns:

```sql
invoices.payer = tenant.firebase_id
```

and:

```sql
invoices.property = property.pg_id || 'PG' || property.pg_number
```

Yello admin also uses:

```sql
tenant.firebase_id = invoices.payer
AND tenant.property_id = invoices.property_fk_id
```

Analyst rule:

- state whether the money answer is invoice-side or payment-side
- do not reuse a revenue dashboard formula as finance truth without checking the formula map

### Complaints to property and tenant

Observed patterns:

```sql
complaints.property_id = property.id
complaints.tenant_id = tenant.id
complaints.team_member_id = team_member.id
```

Use this for customer support, maintenance, complaint-status, and issue-category questions.

## Metric families found

### Core property operations

Examples:

- `Rooms`
- `Beds`
- `Current Occupancy Status`
- `Tenant Vs Booking`
- `Current Tenants`
- `Bookings`

Useful rules:

- active tenants use `tenant.status = 1`
- bookings use `tenant.status = 2`
- some occupancy cards include bookings with `tenant.status IN (1, 2)`
- long-term-only occupancy may use active tenants only

### Movement and notice

Examples:

- `Tenants moving out this month`
- `Tenants joining this month`
- `Expected Move-outs V/S Move-ins this month`
- `Tenants Under Eviction`
- `Long Term tenants under notice`
- `Short Term tenants under notice`
- `Upcoming arrivals`
- `Upcoming check-outs`

Useful date fields:

- `tenant.date_of_joining`
- `tenant.checkout_date`
- `tenant.date_of_eviction`

### Short-term and long-term rooms

Examples:

- `Short Term Occupancy Chart`
- `Long-term occupancy chart`
- `Short Term and Long Term Pie Chart`
- `All Long Term Room with their categories & Occupancy Status`
- `All Short Term Room with their categories & Occupancy Status`

Useful join family:

- `tenant -> property`
- `room -> property`
- `tenant.room = room.name`

Use with care:

- room category logic may depend on room fields and dashboard-specific filters
- verify exact `stay_types`, `unit_type`, and room category logic before giving a final number

### Verification and agreements

Examples:

- `Signed Rental Agreements of Current Tenants`
- `Signed Rental Agreements Historically`
- `Verified Police Agreements for Current Tenants`
- `Tenants with verified KYC`
- `Signed vs Unsigned LLA`
- `PV verified V/S PV not verified`
- `KYC verified vs not verified`

Useful fields/tables:

- `tenant.rental_agreement_url`
- `tenant.police_verification_url`
- `tenant.is_aadhar_verified`
- `stamp_agreements.tenant_id`
- `stamp_agreements.agreement_file_url`

### Complaints and maintenance

Examples:

- `Current Month's All Issues`
- `Current Month All Issues' Details`
- `All Issues' Status`

Useful fields/tables:

- `complaints`
- `complaints.property_id`
- `complaints.tenant_id`
- `complaints.first_level`
- `complaints.second_level`
- `complaints.status`
- `team_member`

### Revenue and dues

Examples:

- `Current Month Potential Revenue`
- `Current Month Revenue and Dues`

Useful patterns:

- `tenant.firebase_id = invoices.payer`
- `tenant.property_id = invoices.property_fk_id`
- room/tenant/property joins to separate short-term and long-term rows

Important caveat:

- these are operational dashboard formulas, not automatically finance-final formulas
- for finance decisions, cross-check with the formula map and payment/invoice status rules

### Feature and optimization summary

Dashboard `RentOk Optimization Dashboard` includes a broad property summary across:

- `property`
- `complaints`
- `kyc_requests`
- `tenant`
- `tenant_attendance`
- `task_instance`
- `payments`
- `late_checkins`
- `stamp_agreements`

Use this as a strong hint for product ops and feature adoption questions.

## Skill rule

When a user asks a customer-facing or public-user dashboard question:

1. Search these dashboard names first.
2. Inspect the matching card query for join/filter shape.
3. Reuse only the logic that matches verified backend meaning.
4. Run a fresh live query for the final answer.
5. State whether the answer is based on a dashboard pattern, backend meaning, or both.

## Do not do this

- Do not treat room-name joins as perfect if bed-level accuracy is needed.
- Do not use a Yello-specific formula for all properties without checking whether the same room/category assumptions apply.
- Do not present dashboard revenue formulas as CFO-grade revenue.
- Do not ignore `eazypg_id` filtering when answering portfolio/user-dashboard questions.
