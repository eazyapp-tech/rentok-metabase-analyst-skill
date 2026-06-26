# RentOk Analytics Glossary

## What this is

This is the first grounding layer for AI-assisted analytics at RentOk.

It answers the practical questions non-technical teammates will hit first:

- what table likely holds this thing
- what column probably matters
- what joins are safe
- what can easily go wrong

Use this with:

- [RENTOK_METABASE_ANALYST_SKILL.md](./RENTOK_METABASE_ANALYST_SKILL.md)
- [RENTOK_METABASE_VALIDATION_WORKFLOW.md](./RENTOK_METABASE_VALIDATION_WORKFLOW.md)
- [RENTOK_ANALYTICS_FORMULA_MAP.md](./RENTOK_ANALYTICS_FORMULA_MAP.md)

This is not a full data dictionary yet. It is the smallest reliable version for pilot rollout.

## Grounding standard

Each entry below is based on current backend code and, where noted, live Metabase checks.

If a future answer depends on something outside this glossary, the analyst should inspect backend code or graph docs before treating it as settled.

## Core objects

### Property

**What it means**

A property record is one managed property or PG/business unit in RentOk.

**Main table**

- `property`

**Backend anchor**

- `property.ts` (`/Users/eazypg/rentok-backend/src/entities/property.ts:305`)

**High-value fields**

- `id`
- `pg_id`
- `eazypg_id`
- `city`
- `company_name`
- `owner_name`
- `personal_contact`
- `is_test`

**Important joins**

- `property.id -> tenant.property_id`
- `property.id -> room.property_id`

**Safe first questions**

- how many properties do we have
- how many test properties do we have
- how many real properties do we have
- property counts by city

**Known safe logic**

- test property: `property.is_test = true`
- real property: `property.is_test = false`

**Common mistake**

Do not guess test properties from names when `is_test` already exists.

### Tenant

**What it means**

A tenant record covers more than just current residents. It is also used for bookings, leads, invites, and deleted states.

**Main table**

- `tenant`

**Backend anchor**

- `tenant.ts` (`/Users/eazypg/rentok-backend/src/entities/tenant.ts:154`)

**High-value fields**

- `id`
- `firebase_id`
- `name`
- `phone`
- `property_id`
- `status`
- `date_of_joining`
- `security_deposit`

**Important joins**

- `tenant.property_id -> property.id`
- `tenant.id -> tenant_room.tenant_id`

**Verified status meanings**

- `0` = evicted
- `1` = tenant
- `2` = booking
- `3` = lead
- `4` = invite
- `5` = permanently deleted tenant
- `6` = deleted invitation
- `7` = deleted lead
- `8` = deleted or rejected self invite

**Safe first questions**

- how many active tenants do we have
- how many bookings do we have
- how many leads do we have
- tenant counts by property

**Known safe logic**

- active tenant: `tenant.status = 1`
- booking: `tenant.status = 2`
- lead: `tenant.status = 3`

**Common mistake**

Do not treat all non-evicted rows as active tenants.

### User

**What it means**

A user record represents a general user identity, but the current backend entity does not expose a clean test-user flag.

**Main table**

- `users`

**Backend anchor**

- `users.ts` (`/Users/eazypg/rentok-backend/src/entities/users.ts:3`)

**High-value fields**

- `id`
- `phone`
- `email`
- `name`
- `user_persona`
- `referral_code`
- `referral_link`
- `created_at`

**Safe first questions**

- total user count
- user growth over time

**Use with caution**

- test vs real users

**Known limitation**

No verified explicit `is_test` field has been found yet in the backend entity or live Metabase scan.

**Common mistake**

Do not present heuristic text matching as a clean business truth.

### Room

**What it means**

A room belongs to a property. The model also supports nested units, where a room can have child entries and unit types such as `ROOM` or `BED`.

**Main table**

- `room`

**Backend anchor**

- `room.ts` (`/Users/eazypg/rentok-backend/src/entities/room.ts:25`)

**High-value fields**

- `id`
- `property_id`
- `name`
- `rent`
- `sharing_type`
- `unit_type`
- `direct_parent_id`
- `publish_on_website`

**Important joins**

- `room.property_id -> property.id`
- `room.id -> tenant_room.room_id`

**Use with care**

Room-level counts can be misleading if parent rooms and bed-level child units are mixed together.

**Common mistake**

Do not assume one room row equals one rentable unit without checking `unit_type` and parent-child structure.

### Tenant-room link

**What it means**

This is the many-to-many bridge between tenants and rooms.

**Main table**

- `tenant_room`

**Backend anchor**

- `tenant_room.ts` (`/Users/eazypg/rentok-backend/src/entities/tenant_room.ts:3`)

**Fields**

- `room_id`
- `tenant_id`
- `created_at`

**Why it matters**

This is the safe bridge when the analyst needs to connect tenant records to room records.

**Common mistake**

If you count rows after joining through `tenant_room`, you may count links instead of distinct tenants.

### Invoice

**What it means**

An invoice is a due or bill item. It has amount fields, due type, dates, and payment links. It also connects to payments through a many-to-many relation.

**Main table**

- `invoices`

**Backend anchor**

- `invoices.ts` (`/Users/eazypg/rentok-backend/src/entities/invoices.ts:18`)

**High-value fields**

- `id`
- `payer`
- `property`
- `property_fk_id`
- `amount`
- `net_amount`
- `paid_amount`
- `status`
- `due_date`
- `paid_date`
- `invoice_date`
- `due_type`
- `invoice_id`
- `tax_invoice_id`
- `is_active`

**Verified status meanings**

- `0` = not paid
- `1` = paid
- `2` = partially paid
- `3` = refunded
- `4` = loss

**Important joins**

- `invoices.property_fk_id -> property.id`
- `invoices.id <-> payments.id` through `payments_invoices`

**Use with care**

The entity contains both `property` and `property_fk_id`. For precise joins, prefer the explicit foreign-key style field when available.

**Common mistake**

Do not assume one invoice has exactly one payment in general analytics unless the use case explicitly guarantees that.

### Payment

**What it means**

A payment is a money inflow record. It can link to multiple invoices through `payments_invoices`.

**Main table**

- `payments`

**Backend anchor**

- `payments.ts` (`/Users/eazypg/rentok-backend/src/entities/payments.ts:20`)

**High-value fields**

- `id`
- `property`
- `property_fk_id`
- `net_amount`
- `status`
- `payment_mode`
- `payment_gateway`
- `gateway_charges`
- `bank_reference_no`
- `created_at`
- `paid_date`

**Verified status meanings**

- `0` = failed
- `1` = success
- `2` = pending
- `3` = refunded

**Important joins**

- `payments.property_fk_id -> property.id`
- `payments.id <-> invoices.id` through `payments_invoices`

**Use with care**

Collection analytics can easily double-count money if the same payment is exploded across linked invoices without a clear rule.

**Common mistake**

Do not sum payment amounts after joining to invoices unless you know whether you want payment totals or invoice allocations.

## SalesHub and portfolio objects

### SalesHub account records

**What it means**

SalesHub is not just a dashboard label. Backend code uses a special RentOk plans property to store customer account and plan records.

This matters because a SalesHub "user" can be represented as a `tenant` row inside the RentOk plans account, while the real customer property is still a `property` row.

**Main tables**

- `tenant`
- `property`
- `invoices`
- `payments`

**Backend anchors**

- `salesHubOwner.ts` (`/Users/eazypg/rentok-backend/src/v1/utility/salesHubOwner.ts:1`)
- `reports.ts` (`/Users/eazypg/rentok-backend/src/controllers/reports.ts:12773`)
- `tenant.ts` (`/Users/eazypg/rentok-backend/src/controllers/tenant.ts:7262`)

**Known safe logic from backend**

- SalesHub plan/account reports are gated to the internal RentOk plans PG id.
- SalesHub account records use `tenant.status IN (1, 2)` in the master report.
- `tenant.firebase_id` can point to the real customer `property.id` when it is a 36-character UUID.
- The real customer property can then provide `pg_name`, `pg_id`, `pg_number`, `email`, `owner_name`, and `eazypg_id`.
- Portfolio manager in SalesHub reports comes from the RentOk plans `property.pg_name`.

**Important joins**

- SalesHub plan row to internal portfolio manager property: `tenant.property_id = property.id`
- SalesHub plan row to real customer property: `tenant.firebase_id = property.id::text` when `length(tenant.firebase_id) = 36`
- SalesHub invoice/payment reporting often joins invoice property strings to property with `invoices.property = property.pg_id || 'PG' || property.pg_number`

**Use with care**

SalesHub "portfolio" questions must first decide whether the user means:

- customer properties in normal RentOk product data
- internal SalesHub plan/account records
- demo leads
- sales follow-up messages or events

These are related but not the same counting unit.

**Common mistake**

Do not answer a SalesHub portfolio question by counting all `property` rows unless the user explicitly asks for real customer properties.

### Demo leads

**What it means**

A demo lead is a sales/demo request captured before or around manager signup and sales outreach.

**Main table**

- `demo_leads`

**Backend anchors**

- `demo_leads.ts` (`/Users/eazypg/rentok-backend/src/entities/demo_leads.ts:9`)
- `leads.ts` (`/Users/eazypg/rentok-backend/src/services/leads/leads.ts:1`)
- `leads.ts` (`/Users/eazypg/rentok-backend/src/controllers/leads.ts:35`)

**High-value fields**

- `name`
- `phone`
- `no_of_units`
- `email`
- `source`
- `city`
- `pincode`
- `demo_date`
- `demo_time`
- `eazypg_id`
- `utm_data`
- `created_at`

**Safe first questions**

- demo leads by source
- demo leads by city
- demo leads by created date
- scheduled demos by demo date

**Use with care**

`demo_leads.eazypg_id` may be populated from request data and should be checked before using it as a guaranteed property join key.

### Lead users

**What it means**

`lead_users` stores microsite or website lead actions linked to a property.

**Main table**

- `lead_users`

**Backend anchor**

- `leadUsers.ts` (`/Users/eazypg/rentok-backend/src/entities/leadUsers.ts:16`)

**Known fields**

- `user_id`
- `property_id`
- `type`
- `visit_date`
- `visit_time`
- `visit_type`
- `move_in_date`
- `room`
- `amount`
- `paid_date`
- `payment_key`

**Important joins**

- `lead_users.property_id = property.id`

**Known status hint**

Backend comment says `type = 1` is booking and `type = 2` is payment.

### External leads

**What it means**

`external_leads` stores lead data from outside sources.

**Main table**

- `external_leads`

**Backend anchor**

- `externalLeads.ts` (`/Users/eazypg/rentok-backend/src/entities/externalLeads.ts:4`)

**High-value fields**

- `name`
- `phone`
- `alternate_phone`
- `eazypg_id`
- `source`
- `budget_range`
- `room_type`
- `move_in_date`
- `created_at`

**Use with care**

External leads are not the same as tenant-table leads where `tenant.status = 3`.

### Lead status history

**What it means**

`lead_status` stores status history rows for tenant leads.

**Main table**

- `lead_status`

**Backend anchor**

- `lead_status.ts` (`/Users/eazypg/rentok-backend/src/entities/lead_status.ts:10`)

**Important joins**

- `lead_status.tenant_id = tenant.id`

**Use with care**

This is history/context around a tenant lead, not the same as the current lifecycle field `tenant.status`.

## High-value joins

These are the first joins the analyst should trust.

| Business question | Preferred join |
|---|---|
| tenant to property | `tenant.property_id = property.id` |
| room to property | `room.property_id = property.id` |
| tenant to room | `tenant.id = tenant_room.tenant_id` then `tenant_room.room_id = room.id` |
| invoice to property | `invoices.property_fk_id = property.id` |
| payment to property | `payments.property_fk_id = property.id` |
| invoice to payment | `invoices.id <-> payments.id` via `payments_invoices` |
| SalesHub plan row to real customer property | `tenant.firebase_id = property.id::text` only when `length(tenant.firebase_id) = 36` |
| demo lead to property | do not assume; inspect `eazypg_id` quality first |
| public/user dashboard portfolio filter | `property.eazypg_id` |
| tenant to room by dashboard convention | `tenant.room = room.name AND tenant.property_id = room.property_id` |
| bed-level tenant relation | `tenant_room.tenant_id = tenant.id` and `tenant_room.room_id = room.id` |

## Public/user dashboard caveats

The public/user dashboards contain useful working SQL, especially for Yello, Star, Vilaasa, and general user dashboards.

Use them for query shape when the question is customer-facing or portfolio-scoped.

Important rules:

- `property.eazypg_id` is usually the user/portfolio filter.
- room-name joins are common, but bed-level answers should prefer `tenant_room` when possible.
- some occupancy cards count only `tenant.status = 1`; others include bookings with `tenant.status IN (1, 2)`.
- Yello short-term/long-term formulas may be client-specific.
- revenue and dues cards from dashboards are operational references, not final finance rules.

## Counting rules

These rules matter more than clever SQL.

### When counting properties

Use:

- `COUNT(*)` or `COUNT(DISTINCT property.id)`

Avoid:

- counting after joining to tenant or room unless you re-deduplicate

### When counting tenants

Use:

- `COUNT(DISTINCT tenant.id)` when joins are involved

Avoid:

- raw joined row counts through `tenant_room`

### When counting users

Use:

- `COUNT(DISTINCT users.id)`

Avoid:

- calling heuristic test-user counts a clean source-of-truth metric

### When counting money

Decide first whether the unit is:

- invoice amount
- payment amount
- refunded amount
- allocated amount

Do not mix them in one number without saying so.

## Green, yellow, red question zones

### Green

These are good first rollout questions:

- property counts
- test vs real properties
- tenant counts by status
- property counts by city

### Yellow

These are allowed, but must show assumptions:

- test vs real users
- room occupancy questions that depend on room hierarchy
- invoice or payment questions that use `due_type` buckets without a reviewed formula map

### Red

These should stay under manual review until a fuller formula map exists:

- revenue
- collections with refunds, advances, and allocations mixed together
- payout or settlement truth
- any CFO-style number where invoice and payment logic can diverge

## What this glossary does not settle yet

These are still open for the next pass:

- full `due_type` meaning map
- payment mode meaning map beyond the inline status comments
- settled revenue vs collected cash rules
- exact occupancy logic when bed-level inventory is involved

## Related next layer

For harder money and occupancy questions, use:

- [RENTOK_ANALYTICS_FORMULA_MAP.md](./RENTOK_ANALYTICS_FORMULA_MAP.md)
