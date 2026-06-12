import postgres from 'postgres';

const DATABASE_URL = 'postgresql://euro_arab_market_db_user:mUw8vjfam3DB6yG3uKENTGyBYUpfaFsc@dpg-d8jruuegvqtc73eodceg-a.oregon-postgres.render.com/euro_arab_market_db';
const sql = postgres(DATABASE_URL, { ssl: { rejectUnauthorized: false }, max: 1 });

// Israeli/non-Arabic keywords to remove
const forbiddenKeywords = [
  'israeli', 'israel', 'jewish', 'kosher', 'mazel tov',
  'إسرائيلي', 'يهودي', 'كوشر', 'حاخام',
  'shakshuka', 'sabich', 'jachnun', 'malawach',
];

async function main() {
  console.log('Scanning for non-Arabic/Israeli content...\n');
  
  let totalRemoved = 0;
  
  // Search in description, name, tags
  for (const keyword of forbiddenKeywords) {
    const found = await sql`
      SELECT id, business_name, business_name_ar, description, city 
      FROM merchants 
      WHERE LOWER(business_name) LIKE ${'%' + keyword + '%'}
         OR LOWER(description) LIKE ${'%' + keyword + '%'}
         OR LOWER(tags) LIKE ${'%' + keyword + '%'}
         OR LOWER(business_name_ar) LIKE ${'%' + keyword + '%'}
    `;
    
    if (found.length > 0) {
      console.log(`[${keyword}] Found ${found.length} records:`);
      for (const f of found) {
        console.log(`  ID ${f.id}: ${f.business_name} / ${f.business_name_ar} (${f.city})`);
        // Delete
        await sql`DELETE FROM merchants WHERE id = ${f.id}`;
        totalRemoved++;
      }
      console.log(`  => DELETED ${found.length}\n`);
    }
  }
  
  // Check specifically for Mazel Tov / Budapest case
  const mazel = await sql`
    SELECT id, business_name, business_name_ar, description, city 
    FROM merchants 
    WHERE business_name ILIKE '%mazel%' 
       OR business_name_ar ILIKE '%مازل%'
       OR business_name ILIKE '%byblos%'
  `;
  
  if (mazel.length > 0) {
    console.log('[Mazel Tov/Byblos check]');
    for (const m of mazel) {
      console.log(`  ID ${m.id}: ${m.business_name} / ${m.business_name_ar} (${m.city})`);
      // Byblos is a Lebanese city so keep it, but remove Israeli ones
      const isIsraeli = !m.business_name.toLowerCase().includes('byblos') && 
                        !m.description.toLowerCase().includes('lebanese');
      if (isIsraeli || m.business_name.toLowerCase().includes('mazel')) {
        await sql`DELETE FROM merchants WHERE id = ${m.id}`;
        console.log(`  => DELETED`);
        totalRemoved++;
      } else {
        console.log(`  => KEPT (Lebanese)`);
      }
    }
  }
  
  // Final count
  const mc = await sql`SELECT COUNT(*) as c FROM merchants`;
  console.log(`\n=== RESULTS ===`);
  console.log(`Removed: ${totalRemoved} non-Arabic records`);
  console.log(`Total merchants: ${mc[0].c}`);
  
  await sql.end();
}

main().catch(console.error);
