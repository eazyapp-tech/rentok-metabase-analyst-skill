# SalesHub Leadership Dashboard Plan

## What this plan is

This is the build plan for the next SalesHub dashboard layer.

The goal is to make the dashboard useful for people like Ayush, Pankaj, Siddhant, and other sales or portfolio leaders.

The current dashboard is a validated base. It proves the data shape.

This plan turns that base into a working sales-head view.

## Who this is for

Primary users:

- sales head
- portfolio manager
- sales ops lead

Secondary users:

- business team
- product ops
- founders or leadership reviewers

## What they should be able to answer

When a sales head opens the dashboard, they should quickly answer:

- Which portfolio manager needs attention today?
- Which accounts are causing the highest unpaid amount?
- Which plans are expiring soon?
- Which accounts have poor data links and need cleanup?
- Which PM has the largest portfolio load?
- Which PM has the highest dues concentration?
- Which accounts should be followed up first?

The dashboard should reduce review-meeting preparation, not create another data-checking task.

## Product principle

Do not build a prettier spreadsheet.

Build a review surface.

The dashboard should make the next action obvious:

- follow up for renewal
- follow up for dues
- clean broken account linkage
- check a suspicious outlier
- review a PM workload

## Current base

Live Metabase dashboard:

- `SalesHub Portfolio Master - Validated`
- dashboard id: `217`
- URL: `https://metabase.rentok.com/dashboard/217`

Current strengths:

- validated on `Siddhant`
- validated on `Ayush`
- shows account rows, linked properties, billed beds, active tenants, due, paid, expiring plans, plan mix, high due accounts, and drill rows

Current gap:

- it is useful for validation and audit, but not yet enough for a sales head to manage the team

## Build shape

Build one leadership summary layer on top of the validated master dashboard.

Do not create separate PM dashboards yet.

Separate PM dashboards should come only after the leadership layer proves useful and the PM ownership map is clean.

## Required filters

Keep these filters:

- portfolio manager
- portfolio bucket id
- plan name
- account status
- due date range
- paid date range

Add these if feasible:

- risk band
- expiring in days
- linked versus unlinked

## First dashboard sections

### 1. Sales review snapshot

Purpose:

- show whether the SalesHub portfolio is healthy at a glance

Cards:

- total active SalesHub accounts
- linked real properties
- unlinked account rows
- current due
- collected this month
- plans expiring in 30 days
- overdue accounts

### 2. PM comparison

Purpose:

- help a sales head compare portfolio managers quickly

Cards:

- account rows by PM
- current due by PM
- overdue accounts by PM
- expiring plans by PM
- billed beds by PM
- linked-property coverage by PM

This is the first section a sales head will care about.

### 3. Risk and follow-up queue

Purpose:

- turn the dashboard into an action list

Tables:

- top due accounts
- accounts overdue by `30+` days
- accounts expiring in the next `30` days
- high-value accounts with no linked real property
- accounts with unusually high due amounts

Each row should show:

- PM
- account name
- linked property name if available
- plan
- current due
- next due date
- plan end date
- billed beds
- active tenants

### 4. Collection health

Purpose:

- help sales ops and leadership understand money movement

Cards:

- collected this month
- collected last month
- current due
- due aging buckets
- paid versus due by PM

### 5. Plan and renewal health

Purpose:

- make renewals visible before they become missed follow-ups

Cards:

- plan mix by account rows
- plan mix by billed beds
- plans expiring in `7`, `15`, and `30` days
- expired but still active accounts

### 6. Data quality

Purpose:

- make trust issues visible instead of hiding them

Cards:

- unlinked SalesHub account rows
- linked-property coverage by PM
- rows missing plan end date
- rows with current due but no linked property

## Suggested visual layout

Top row:

- compact KPI tiles

Second row:

- PM comparison cards

Middle:

- risk and follow-up tables

Lower:

- collections and renewal detail

Bottom:

- audit drill table

Keep the dashboard dense and operational. Avoid decorative layout. A sales head should be able to scan it during a call.

## What not to build yet

Do not build these in the first leadership pass:

- separate dashboards for every `pg_name`
- heavy cohort analysis
- forecast models
- sales performance scoring
- finance-certified collection statements

Those may be useful later, but they require more validation.

## Validation gate

Before calling this ready:

1. Check `Pankaj`, `Ayush`, and `Siddhant` slices.
2. Compare at least one high-due account against the drill table.
3. Compare one linked real property against the manager app if available.
4. Confirm whether the PM comparison excludes system buckets like `2026 Users`, `2025 Users`, `2024 Users`, `Users Older Than 2024`, and `Test Account`.
5. Inspect top due outliers before trusting total due.
6. Confirm the labels are readable by a non-technical sales user.

## Build order

### Step 1. Add PM comparison cards

Build:

- account rows by PM
- current due by PM
- overdue accounts by PM
- expiring plans by PM
- linked-property coverage by PM

### Step 2. Add action queues

Build:

- top due accounts
- overdue `30+` day accounts
- expiring in `30` days
- unlinked high-value accounts

### Step 3. Add collection and renewal cards

Build:

- collected this month
- collected last month
- due aging buckets
- expired but active accounts

### Step 4. Polish the dashboard

Update:

- card titles
- dashboard descriptions
- section order
- helper notes
- dashboard filters

### Step 5. Validate and document

Create:

- validation result for `Pankaj`
- updated validation result for `Ayush`
- updated validation result for `Siddhant`
- build-status update

## Success criteria

The dashboard is successful when a sales head can use it to run a review without asking for a manual spreadsheet.

Minimum success:

- who needs attention is clear
- why they need attention is visible
- account-level rows support every headline number
- data quality caveats are visible
- one PM slice validates against live data

## Recommendation

Proceed with the leadership summary layer now.

Keep dashboard `217` as the master base and add the leadership sections there first.

Only create PM-specific dashboards after the leadership view is accepted by a sales head.
