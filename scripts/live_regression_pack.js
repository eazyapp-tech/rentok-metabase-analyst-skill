#!/usr/bin/env node

const https = require("https");

const base = process.env.METABASE_URL || "https://metabase.rentok.com";
const email = process.env.METABASE_USER_EMAIL;
const password = process.env.METABASE_PASSWORD;

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

async function sql(token, query) {
  const payload = {
    database: 2,
    type: "native",
    native: { query, "template-tags": {} },
  };

  const response = await req("/api/dataset", "POST", payload, {
    "X-Metabase-Session": token,
  });

  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`Query failed with status ${response.status}`);
  }

  if (response.json?.via?.[0]?.status === "failed") {
    throw new Error(response.json.via[0].error || "Metabase query failed");
  }

  return response.json?.data?.rows || [];
}

function printSection(title, data) {
  console.log(`\n## ${title}`);
  console.log(JSON.stringify(data, null, 2));
}

(async () => {
  const login = await req("/api/session", "POST", { username: email, password });
  if (login.status !== 200 || !login.json?.id) {
    throw new Error("Metabase login failed.");
  }

  const token = login.json.id;
  const verifiedOn = new Date().toISOString().slice(0, 10);

  const propertyScope = await sql(
    token,
    `
    select
      count(*) filter (where coalesce(is_deleted,false)=false) as active_non_deleted,
      count(*) as all_rows,
      count(*) filter (where coalesce(is_test,false)=true and coalesce(is_deleted,false)=false) as active_test,
      count(*) filter (where coalesce(is_test,false)=false and coalesce(is_deleted,false)=false) as active_real,
      count(*) filter (where coalesce(is_deleted,false)=true) as deleted_rows
    from property;
  `
  );

  const tenantStatuses = await sql(
    token,
    `
    select status, count(*) as cnt
    from tenant
    group by status
    order by status;
  `
  );

  const statusProfiles = await sql(
    token,
    `
    select
      status,
      coalesce(lead_source, '') as lead_source,
      count(*) as cnt
    from tenant
    where status in (15, 100)
    group by 1, 2
    order by status, cnt desc
    limit 20;
  `
  );

  const duesThreshold = await sql(
    token,
    `
    with per_tenant as (
      select
        p.id as property_id,
        p.eazypg_id,
        p.pg_name,
        inv.payer,
        sum(coalesce(inv.amount::numeric, 0)) as unpaid_amount
      from invoices inv
      left join property p
        on inv.property = concat(p.pg_id, 'PG', p.pg_number)
      left join tenant t
        on t.property_id = p.id
       and t.firebase_id = inv.payer
      where inv.status = 0
        and inv.is_active = 1
        and t.status in (1, 2)
      group by 1, 2, 3, 4
    )
    select
      count(*) filter (where unpaid_amount > 100000) as over_1l,
      count(*) filter (where unpaid_amount > 100000 and unpaid_amount <= 5000000) as over_1l_upto_50l,
      percentile_cont(0.5) within group (order by unpaid_amount) filter (where unpaid_amount > 100000) as median_over_1l,
      percentile_cont(0.9) within group (order by unpaid_amount) filter (where unpaid_amount > 100000) as p90_over_1l,
      percentile_cont(0.99) within group (order by unpaid_amount) filter (where unpaid_amount > 100000) as p99_over_1l,
      max(unpaid_amount) as max_over_1l
    from per_tenant;
  `
  );

  const duesTop = await sql(
    token,
    `
    with per_tenant as (
      select
        p.id as property_id,
        p.eazypg_id,
        p.pg_name,
        inv.payer,
        sum(coalesce(inv.amount::numeric, 0)) as unpaid_amount
      from invoices inv
      left join property p
        on inv.property = concat(p.pg_id, 'PG', p.pg_number)
      left join tenant t
        on t.property_id = p.id
       and t.firebase_id = inv.payer
      where inv.status = 0
        and inv.is_active = 1
        and t.status in (1, 2)
      group by 1, 2, 3, 4
    )
    select eazypg_id, pg_name, payer, unpaid_amount
    from per_tenant
    where unpaid_amount > 100000
    order by unpaid_amount desc
    limit 10;
  `
  );

  const krsChecks = await sql(
    token,
    `
    with p as (
      select id, pg_id, pg_number, eazypg_id, pg_name
      from property
      where eazypg_id = '6793371525A'
      limit 1
    )
    select
      (select count(*) from tenant t join p on t.property_id = p.id where t.status = 1) as active_tenants,
      (select count(*) from tenant t join p on t.property_id = p.id where t.status in (1, 2)) as active_plus_booking,
      (select count(distinct t.id)
         from tenant t
         join room r on t.property_id = r.property_id and t.room = r.name
         join p on t.property_id = p.id
        where t.status in (1, 2)) as room_name_joined,
      (select count(distinct tr.tenant_id)
         from tenant_room tr
         join room r on tr.room_id = r.id
         join p on r.property_id = p.id
         join tenant t on t.id = tr.tenant_id
        where t.status in (1, 2)) as tenant_room_joined,
      (select sum(coalesce(i.amount::numeric, 0))
         from invoices i
         join p on i.property_fk_id = p.id
        where i.status = 0 and i.is_active = 1) as strict_unpaid_amount,
      (select sum(coalesce(i.amount::numeric, 0))
         from invoices i
         join p on i.property = (p.pg_id || 'PG' || p.pg_number)
        where i.status = 0 and i.is_active = 1) as strict_unpaid_amount_string_join;
  `
  );

  printSection("verified_on", { verified_on: verifiedOn });
  printSection("property_scope", propertyScope);
  printSection("tenant_statuses", tenantStatuses);
  printSection("status_15_100_profiles", statusProfiles);
  printSection("approved_dues_threshold", duesThreshold);
  printSection("approved_dues_top_rows", duesTop);
  printSection("krs_cross_checks", krsChecks);
})().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
