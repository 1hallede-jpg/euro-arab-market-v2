import postgres from 'postgres';

const DATABASE_URL = 'postgresql://euro_arab_market_db_user:mUw8vjfam3DB6yG3uKENTGyBYUpfaFsc@dpg-d8jruuegvqtc73eodceg-a.oregon-postgres.render.com/euro_arab_market_db';
const sql = postgres(DATABASE_URL, { ssl: { rejectUnauthorized: false }, max: 1 });

async function main() {
  console.log('=== CATEGORY COUNTS ===\n');
  
  // Get all categories with counts
  const cats = await sql`
    SELECT category, COUNT(*) as c FROM merchants GROUP BY category ORDER BY c DESC
  `;
  for (const c of cats) {
    console.log(`${c.category}: ${c.c}`);
  }
  
  // Check for embassies still in merchants
  console.log('\n=== EMBASSIES IN MERCHANTS ===');
  const emb = await sql`
    SELECT COUNT(*) as c FROM merchants
    WHERE business_name ILIKE '%embassy%' OR business_name_ar ILIKE '%سفارة%'
    OR "businessName" ILIKE '%embassy%' OR "businessNameAr" ILIKE '%سفارة%'
    OR subcategory ILIKE '%embassy%' OR subcategory ILIKE '%سفارة%'
  `;
  console.log(`Embassies still in merchants: ${emb[0].c}`);
  
  // Show embassy IDs if any
  if (emb[0].c > 0) {
    const embList = await sql`
      SELECT id, business_name, business_name_ar, city FROM merchants
      WHERE business_name ILIKE '%embassy%' OR business_name_ar ILIKE '%سفارة%'
      OR "businessName" ILIKE '%embassy%' OR "businessNameAr" ILIKE '%سفارة%'
      OR subcategory ILIKE '%embassy%' OR subcategory ILIKE '%سفارة%'
    `;
    for (const e of embList) {
      console.log(`  ID ${e.id}: ${e.business_name_ar || e.businessNameAr} (${e.city})`);
    }
  }
  
  // Check by city
  console.log('\n=== BY CITY ===');
  const cities = await sql`
    SELECT city, COUNT(*) as c FROM merchants GROUP BY city ORDER BY c DESC
  `;
  for (const c of cities.slice(0, 10)) {
    console.log(`${c.city}: ${c.c}`);
  }
  
  // Check country-level mapping
  console.log('\n=== COUNTRIES ===');
  const countries = await sql`
    SELECT country, COUNT(*) as c FROM merchants GROUP BY country ORDER BY c DESC
  `;
  for (const c of countries) {
    console.log(`${c.country}: ${c.c}`);
  }

  await sql.end();
}

main().catch(console.error);
