#!/usr/bin/env node

const https = require("https");

const base = process.env.METABASE_URL || "https://metabase.rentok.com";
const email = process.env.METABASE_USER_EMAIL;
const password = process.env.METABASE_PASSWORD;
const dashboardId = Number(process.env.SALESHUB_DASHBOARD_ID || 217);
const collectionId = Number(process.env.SALESHUB_COLLECTION_ID || 4);
const databaseId = Number(process.env.METABASE_DATABASE_ID || 2);

if (!email || !password) {
  console.error("Missing METABASE_USER_EMAIL or METABASE_PASSWORD.");
  process.exit(1);
}

function req(path, method = "GET", body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(path, base);
    const request = https.request(
      url,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
          ...headers,
        },
      },
      (response) => {
        let out = "";
        response.on("data", (chunk) => {
          out += chunk;
        });
        response.on("end", () => {
          try {
            resolve({ status: response.statusCode, json: JSON.parse(out || "{}") });
          } catch {
            resolve({ status: response.statusCode, text: out });
          }
        });
      }
    );

    request.on("error", reject);
    if (data) request.write(data);
    request.end();
  });
}

const tags = {
  portfolio_manager_name: {
    type: "text",
    name: "portfolio_manager_name",
    id: "tag_pm_name",
    "display-name": "Portfolio Manager",
    required: false,
  },
  portfolio_bucket_id: {
    type: "text",
    name: "portfolio_bucket_id",
    id: "tag_bucket_id",
    "display-name": "Portfolio Bucket ID",
    required: false,
  },
  plan_name: {
    type: "text",
    name: "plan_name",
    id: "tag_plan_name",
    "display-name": "Plan Name",
    required: false,
  },
};

function baseCte() {
  return `
WITH scoped_portfolios AS (
    SELECT
        p.id,
        p.pg_id,
        p.pg_number,
        p.pg_name,
        p.eazypg_id
    FROM property p
    WHERE p.pg_id = 'Rt7Oa2L3A4PiHb0NvSh2rQvods93'
      AND p.pg_number NOT IN (1, 6, 7, 8, 9)
      AND p.pg_name NOT IN ('2026 Users', '2025 Users', '2024 Users', 'Users Older Than 2024', 'Test Account')
      [[AND p.pg_name = {{portfolio_manager_name}}]]
      [[AND p.eazypg_id = {{portfolio_bucket_id}}]]
),
accounts AS (
    SELECT
        p.pg_name AS portfolio_manager_name,
        p.eazypg_id AS portfolio_bucket_id,
        p.pg_id,
        p.pg_number,
        t.id AS account_row_id,
        t.firebase_id,
        t.name AS account_name,
        t.phone AS account_phone,
        t.room AS plan_name,
        t.checkout_date::date AS plan_end_date,
        CASE
            WHEN t.bed_sold ~ '^[0-9]+(\\.[0-9]+)?$' THEN t.bed_sold::numeric
            ELSE NULL
        END AS billed_beds,
        CASE
            WHEN t.active_tenants ~ '^[0-9]+(\\.[0-9]+)?$' THEN t.active_tenants::numeric
            ELSE NULL
        END AS active_tenants,
        plan.id AS linked_property_id,
        plan.pg_name AS linked_property_name,
        plan.eazypg_id AS linked_property_eazypg_id,
        plan.city AS linked_property_city
    FROM tenant t
    JOIN scoped_portfolios p
      ON t.property_id = p.id
    LEFT JOIN property plan
      ON t.firebase_id = plan.id::text
     AND LENGTH(t.firebase_id) = 36
    WHERE t.status IN (1, 2)
      AND t.room IN ('Basic', 'Silver', 'Trial', 'Gold', 'Enterprise')
      [[AND t.room = {{plan_name}}]]
),
dues AS (
    SELECT
        a.account_row_id,
        SUM(i.amount) FILTER (WHERE i.due_date::date <= CURRENT_DATE) AS current_due,
        MIN(i.due_date::date) FILTER (WHERE i.due_date::date <= CURRENT_DATE) AS first_overdue_date,
        MAX(CURRENT_DATE - i.due_date::date) FILTER (WHERE i.due_date::date <= CURRENT_DATE) AS max_days_overdue
    FROM accounts a
    JOIN invoices i
      ON i.property = a.pg_id || 'PG' || a.pg_number
     AND i.payer = a.firebase_id
    WHERE i.status = 0
      AND COALESCE(i.is_active, 1) = 1
      AND i.amount > 0
    GROUP BY a.account_row_id
),
paid AS (
    SELECT
        a.account_row_id,
        SUM(i.amount) FILTER (
            WHERE i.paid_date::date >= date_trunc('month', CURRENT_DATE)::date
              AND i.paid_date::date < (date_trunc('month', CURRENT_DATE) + interval '1 month')::date
        ) AS collected_this_month,
        SUM(i.amount) FILTER (
            WHERE i.paid_date::date >= (date_trunc('month', CURRENT_DATE) - interval '1 month')::date
              AND i.paid_date::date < date_trunc('month', CURRENT_DATE)::date
        ) AS collected_last_month
    FROM accounts a
    JOIN invoices i
      ON i.property = a.pg_id || 'PG' || a.pg_number
     AND i.payer = a.firebase_id
    WHERE i.status = 1
      AND i.amount > 0
      AND i.due_type ILIKE '%Plan%'
    GROUP BY a.account_row_id
),
base AS (
    SELECT
        a.*,
        COALESCE(d.current_due, 0) AS current_due,
        d.first_overdue_date,
        COALESCE(d.max_days_overdue, 0) AS max_days_overdue,
        COALESCE(paid.collected_this_month, 0) AS collected_this_month,
        COALESCE(paid.collected_last_month, 0) AS collected_last_month
    FROM accounts a
    LEFT JOIN dues d
      ON a.account_row_id = d.account_row_id
    LEFT JOIN paid
      ON a.account_row_id = paid.account_row_id
)`;
}

function query(body) {
  return `${baseCte()}\n${body}`;
}

function agingQuery() {
  return `
WITH scoped_portfolios AS (
    SELECT p.id, p.pg_id, p.pg_number, p.pg_name, p.eazypg_id
    FROM property p
    WHERE p.pg_id = 'Rt7Oa2L3A4PiHb0NvSh2rQvods93'
      AND p.pg_number NOT IN (1, 6, 7, 8, 9)
      AND p.pg_name NOT IN ('2026 Users', '2025 Users', '2024 Users', 'Users Older Than 2024', 'Test Account')
      [[AND p.pg_name = {{portfolio_manager_name}}]]
      [[AND p.eazypg_id = {{portfolio_bucket_id}}]]
),
accounts AS (
    SELECT p.pg_name AS portfolio_manager_name, p.pg_id, p.pg_number, t.firebase_id
    FROM tenant t
    JOIN scoped_portfolios p ON t.property_id = p.id
    WHERE t.status IN (1, 2)
      AND t.room IN ('Basic', 'Silver', 'Trial', 'Gold', 'Enterprise')
      [[AND t.room = {{plan_name}}]]
)
SELECT
    a.portfolio_manager_name,
    SUM(i.amount) FILTER (WHERE CURRENT_DATE - i.due_date::date BETWEEN 0 AND 7) AS due_0_7_days,
    SUM(i.amount) FILTER (WHERE CURRENT_DATE - i.due_date::date BETWEEN 8 AND 30) AS due_8_30_days,
    SUM(i.amount) FILTER (WHERE CURRENT_DATE - i.due_date::date BETWEEN 31 AND 60) AS due_31_60_days,
    SUM(i.amount) FILTER (WHERE CURRENT_DATE - i.due_date::date > 60) AS due_60_plus_days,
    SUM(i.amount) AS total_overdue
FROM accounts a
JOIN invoices i
  ON i.property = a.pg_id || 'PG' || a.pg_number
 AND i.payer = a.firebase_id
WHERE i.status = 0
  AND COALESCE(i.is_active, 1) = 1
  AND i.amount > 0
  AND i.due_date::date <= CURRENT_DATE
GROUP BY a.portfolio_manager_name
ORDER BY total_overdue DESC NULLS LAST;`;
}

const cards = [
  {
    name: "SalesHub Leadership - PM Review Table",
    display: "table",
    description: "Sales-head comparison table: load, dues, renewal pressure, and data-link coverage by portfolio manager.",
    query: query(`
SELECT
    portfolio_manager_name,
    COUNT(*) AS saleshub_accounts,
    COUNT(DISTINCT linked_property_id) AS linked_real_properties,
    ROUND(100.0 * COUNT(linked_property_id) / NULLIF(COUNT(*), 0), 2) AS linked_property_coverage_pct,
    SUM(COALESCE(billed_beds, 0)) AS billed_beds,
    SUM(COALESCE(active_tenants, 0)) AS active_tenants,
    SUM(current_due) AS current_due,
    COUNT(*) FILTER (WHERE current_due > 0) AS overdue_accounts,
    COUNT(*) FILTER (WHERE plan_end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + interval '30 days') AS expiring_30_days,
    SUM(collected_this_month) AS collected_this_month
FROM base
GROUP BY portfolio_manager_name
ORDER BY current_due DESC NULLS LAST, saleshub_accounts DESC;`),
    row: 26,
    col: 0,
    size_x: 24,
    size_y: 8,
  },
  {
    name: "SalesHub Leadership - Current Due by PM",
    display: "bar",
    description: "Current overdue amount by portfolio manager, excluding system buckets.",
    query: query(`
SELECT portfolio_manager_name, SUM(current_due) AS current_due
FROM base
GROUP BY portfolio_manager_name
HAVING SUM(current_due) > 0
ORDER BY current_due DESC NULLS LAST
LIMIT 20;`),
    row: 34,
    col: 0,
    size_x: 12,
    size_y: 8,
  },
  {
    name: "SalesHub Leadership - Overdue Accounts by PM",
    display: "bar",
    description: "Count of SalesHub account rows with current overdue dues by portfolio manager.",
    query: query(`
SELECT portfolio_manager_name, COUNT(*) AS overdue_accounts
FROM base
WHERE current_due > 0
GROUP BY portfolio_manager_name
ORDER BY overdue_accounts DESC, portfolio_manager_name
LIMIT 20;`),
    row: 34,
    col: 12,
    size_x: 12,
    size_y: 8,
  },
  {
    name: "SalesHub Leadership - Expiring Plans by PM",
    display: "bar",
    description: "Plans ending in the next 30 days by portfolio manager.",
    query: query(`
SELECT portfolio_manager_name, COUNT(*) AS expiring_30_days
FROM base
WHERE plan_end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + interval '30 days'
GROUP BY portfolio_manager_name
ORDER BY expiring_30_days DESC, portfolio_manager_name
LIMIT 20;`),
    row: 42,
    col: 0,
    size_x: 12,
    size_y: 8,
  },
  {
    name: "SalesHub Leadership - Linked Coverage by PM",
    display: "bar",
    description: "Percent of SalesHub account rows linked to real customer properties by portfolio manager.",
    query: query(`
SELECT
    portfolio_manager_name,
    ROUND(100.0 * COUNT(linked_property_id) / NULLIF(COUNT(*), 0), 2) AS linked_property_coverage_pct
FROM base
GROUP BY portfolio_manager_name
ORDER BY linked_property_coverage_pct ASC NULLS FIRST, portfolio_manager_name
LIMIT 20;`),
    row: 42,
    col: 12,
    size_x: 12,
    size_y: 8,
  },
  {
    name: "SalesHub Leadership - Top Due Accounts",
    display: "table",
    description: "Highest current due SalesHub accounts for collection follow-up.",
    query: query(`
SELECT
    portfolio_manager_name,
    account_name,
    linked_property_name,
    plan_name,
    current_due,
    first_overdue_date,
    max_days_overdue,
    billed_beds,
    active_tenants
FROM base
WHERE current_due > 0
ORDER BY current_due DESC NULLS LAST
LIMIT 50;`),
    row: 50,
    col: 0,
    size_x: 24,
    size_y: 10,
  },
  {
    name: "SalesHub Leadership - 30 Plus Day Overdue Accounts",
    display: "table",
    description: "Accounts overdue by more than 30 days, ordered by amount.",
    query: query(`
SELECT
    portfolio_manager_name,
    account_name,
    linked_property_name,
    plan_name,
    current_due,
    first_overdue_date,
    max_days_overdue,
    account_phone
FROM base
WHERE current_due > 0
  AND max_days_overdue > 30
ORDER BY current_due DESC NULLS LAST
LIMIT 50;`),
    row: 60,
    col: 0,
    size_x: 24,
    size_y: 10,
  },
  {
    name: "SalesHub Leadership - Plans Expiring in 30 Days",
    display: "table",
    description: "Renewal follow-up list for plans ending in the next 30 days.",
    query: query(`
SELECT
    portfolio_manager_name,
    account_name,
    linked_property_name,
    plan_name,
    plan_end_date,
    current_due,
    billed_beds,
    active_tenants,
    account_phone
FROM base
WHERE plan_end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + interval '30 days'
ORDER BY plan_end_date ASC, current_due DESC NULLS LAST
LIMIT 100;`),
    row: 70,
    col: 0,
    size_x: 24,
    size_y: 10,
  },
  {
    name: "SalesHub Leadership - Unlinked High Value Accounts",
    display: "table",
    description: "Large SalesHub accounts that do not currently link to a real customer property.",
    query: query(`
SELECT
    portfolio_manager_name,
    account_name,
    plan_name,
    billed_beds,
    active_tenants,
    current_due,
    plan_end_date,
    account_phone
FROM base
WHERE linked_property_id IS NULL
ORDER BY COALESCE(billed_beds, 0) DESC, current_due DESC NULLS LAST
LIMIT 50;`),
    row: 80,
    col: 0,
    size_x: 24,
    size_y: 10,
  },
  {
    name: "SalesHub Leadership - Due Aging by PM",
    display: "table",
    description: "Overdue amount by aging bucket and portfolio manager.",
    query: agingQuery(),
    row: 90,
    col: 0,
    size_x: 24,
    size_y: 8,
  },
  {
    name: "SalesHub Leadership - Collection Month Compare",
    display: "table",
    description: "This-month versus last-month SalesHub plan collections by portfolio manager.",
    query: query(`
SELECT
    portfolio_manager_name,
    SUM(collected_this_month) AS collected_this_month,
    SUM(collected_last_month) AS collected_last_month,
    SUM(collected_this_month) - SUM(collected_last_month) AS month_delta
FROM base
GROUP BY portfolio_manager_name
HAVING SUM(collected_this_month) > 0 OR SUM(collected_last_month) > 0
ORDER BY collected_this_month DESC NULLS LAST;`),
    row: 98,
    col: 0,
    size_x: 24,
    size_y: 8,
  },
];

function cardPayload(card) {
  return {
    name: card.name,
    description: card.description,
    display: card.display,
    collection_id: collectionId,
    dataset_query: {
      database: databaseId,
      type: "native",
      native: {
        query: card.query,
        "template-tags": tags,
      },
    },
    visualization_settings: {},
  };
}

function mappings(cardId) {
  return [
    {
      parameter_id: "pm_name_param",
      card_id: cardId,
      target: ["variable", ["template-tag", "portfolio_manager_name"]],
    },
    {
      parameter_id: "bucket_id_param",
      card_id: cardId,
      target: ["variable", ["template-tag", "portfolio_bucket_id"]],
    },
    {
      parameter_id: "plan_name_param",
      card_id: cardId,
      target: ["variable", ["template-tag", "plan_name"]],
    },
  ];
}

function withoutOptionalClauses(sql) {
  return sql.replace(/\s*\[\[[\s\S]*?\]\]/g, "");
}

async function dataset(token, sql) {
  const response = await req(
    "/api/dataset",
    "POST",
    {
      database: databaseId,
      type: "native",
      native: { query: withoutOptionalClauses(sql), "template-tags": {} },
    },
    { "X-Metabase-Session": token }
  );

  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`Dataset failed ${response.status}: ${JSON.stringify(response.json || response.text).slice(0, 700)}`);
  }

  const status = response.json?.status || response.json?.via?.[0]?.status;
  if (status === "failed") {
    throw new Error(response.json?.error || response.json?.via?.[0]?.error || "Metabase dataset failed");
  }

  return response.json?.data?.rows || [];
}

async function findCardByExactName(token, name) {
  const response = await req(
    `/api/search?q=${encodeURIComponent(name)}`,
    "GET",
    null,
    { "X-Metabase-Session": token }
  );

  if (response.status !== 200) {
    return null;
  }

  return (response.json?.data || []).find((item) => item.model === "card" && item.name === name) || null;
}

function dashcardPayload(dashcard) {
  return {
    id: dashcard.id,
    card_id: dashcard.card_id,
    row: dashcard.row,
    col: dashcard.col,
    size_x: dashcard.size_x,
    size_y: dashcard.size_y,
    parameter_mappings: dashcard.parameter_mappings || [],
    visualization_settings: dashcard.visualization_settings || {},
    series: dashcard.series || [],
  };
}

async function main() {
  const login = await req("/api/session", "POST", { username: email, password });
  if (login.status !== 200 || !login.json?.id) {
    throw new Error("Metabase login failed.");
  }

  const token = login.json.id;
  const headers = { "X-Metabase-Session": token };

  const dashboard = await req(`/api/dashboard/${dashboardId}`, "GET", null, headers);
  if (dashboard.status !== 200) {
    throw new Error(`Dashboard ${dashboardId} not found or not writable.`);
  }

  const existingDashcards = dashboard.json.dashcards || [];
  const existingByName = new Map(
    existingDashcards
      .filter((dashcard) => dashcard.card?.name)
      .map((dashcard) => [dashcard.card.name, dashcard])
  );

  const results = [];

  for (const card of cards) {
    const sampleRows = await dataset(
      token,
      `SELECT * FROM (${card.query.replace(/;\s*$/, "")}) validation_sample LIMIT 1`
    );
    const existingDashcard = existingByName.get(card.name);
    let cardId = existingDashcard?.card_id;
    let action = "updated";

    if (!cardId) {
      const existingSavedCard = await findCardByExactName(token, card.name);
      cardId = existingSavedCard?.id;
    }

    if (cardId) {
      const update = await req(`/api/card/${cardId}`, "PUT", cardPayload(card), headers);
      if (update.status !== 200) {
        throw new Error(`Failed updating card ${card.name}: ${update.status} ${JSON.stringify(update.json || update.text).slice(0, 700)}`);
      }
      if (!existingDashcard) action = "updated_unattached";
    } else {
      const create = await req("/api/card", "POST", cardPayload(card), headers);
      if (create.status !== 200 && create.status !== 201) {
        throw new Error(`Failed creating card ${card.name}: ${create.status} ${JSON.stringify(create.json || create.text).slice(0, 700)}`);
      }
      cardId = create.json.id;
      action = "created";
    }

    results.push({
      name: card.name,
      card_id: cardId,
      action,
      sample_rows: sampleRows.length,
    });
  }

  const currentDashboard = await req(`/api/dashboard/${dashboardId}`, "GET", null, headers);
  const currentDashcards = currentDashboard.json.dashcards || [];
  const attachedCardIds = new Set(currentDashcards.map((dashcard) => dashcard.card_id));
  const finalCards = currentDashcards.map(dashcardPayload);

  for (const card of cards) {
    const result = results.find((item) => item.name === card.name);
    if (!result || attachedCardIds.has(result.card_id)) continue;

    finalCards.push({
      id: -result.card_id,
      card_id: result.card_id,
      row: card.row,
      col: card.col,
      size_x: card.size_x,
      size_y: card.size_y,
      parameter_mappings: mappings(result.card_id),
      visualization_settings: {},
      series: [],
    });
  }

  const saveDashboard = await req(
    `/api/dashboard/${dashboardId}/cards`,
    "PUT",
    { cards: finalCards },
    headers
  );

  if (saveDashboard.status !== 200) {
    throw new Error(`Failed saving dashboard card list: ${saveDashboard.status} ${JSON.stringify(saveDashboard.json || saveDashboard.text).slice(0, 700)}`);
  }

  const after = await req(`/api/dashboard/${dashboardId}`, "GET", null, headers);
  const leadershipCards = (after.json.dashcards || [])
    .filter((dashcard) => dashcard.card?.name?.startsWith("SalesHub Leadership -"))
    .map((dashcard) => ({
      name: dashcard.card.name,
      card_id: dashcard.card_id,
      row: dashcard.row,
      col: dashcard.col,
      size_x: dashcard.size_x,
      size_y: dashcard.size_y,
    }))
    .sort((a, b) => a.row - b.row || a.col - b.col);

  console.log(
    JSON.stringify(
      {
        dashboard_id: dashboardId,
        dashboard_name: after.json.name,
        leadership_card_count: leadershipCards.length,
        results,
        leadership_cards: leadershipCards,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
