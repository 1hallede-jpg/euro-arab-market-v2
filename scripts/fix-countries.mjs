import postgres from 'postgres';

const DATABASE_URL = 'postgresql://euro_arab_market_db_user:mUw8vjfam3DB6yG3uKENTGyBYUpfaFsc@dpg-d8jruuegvqtc73eodceg-a.oregon-postgres.render.com/euro_arab_market_db';
const sql = postgres(DATABASE_URL, { ssl: { rejectUnauthorized: false }, max: 1 });

// Normalize country names: Arabic → English
const countryMap = {
  'فرنسا': 'France', 'ألمانيا': 'Germany', 'بريطانيا': 'UK',
  'إسبانيا': 'Spain', 'هولندا': 'Netherlands', 'إيطاليا': 'Italy',
  'النمسا': 'Austria', 'بلجيكا': 'Belgium', 'السويد': 'Sweden',
  'الدنمارك': 'Denmark', 'اليونان': 'Greece', 'سويسرا': 'Switzerland',
  'المملكة المتحدة': 'UK', 'المجر': 'Hungary', 'أيرلندا': 'Ireland',
  'البرتغال': 'Portugal', 'التشيك': 'Czech Republic', 'النرويج': 'Norway',
  'فنلندا': 'Finland', 'رومانيا': 'Romania', 'بولندا': 'Poland',
  'أوروبا': 'Europe',
};

async function main() {
  console.log('=== NORMALIZING COUNTRY NAMES ===\n');
  
  let totalFixed = 0;
  for (const [ar, en] of Object.entries(countryMap)) {
    const r = await sql`UPDATE merchants SET country = ${en} WHERE country = ${ar}`;
    if (r.count > 0) {
      console.log(`  ${ar} → ${en}: ${r.count} rows`);
      totalFixed += r.count;
    }
  }
  console.log(`\nTotal normalized: ${totalFixed}`);

  // Now check what's in "other" category
  console.log('\n=== CHECKING "other" CATEGORY ===');
  const otherItems = await sql`
    SELECT id, business_name, business_name_ar, city, country, subcategory
    FROM merchants WHERE category = 'other' LIMIT 30
  `;
  for (const o of otherItems) {
    console.log(`  [${o.city}] ${o.business_name_ar || o.businessNameAr || o.business_name} | ${o.subcategory || ''}`);
  }

  // Move non-merchant items from "other" to appropriate categories
  console.log('\n=== CLEANING "other" CATEGORY ===');
  
  // Check if any are embassies
  const embInOther = await sql`
    SELECT id, business_name_ar, city FROM merchants
    WHERE category = 'other'
    AND (business_name_ar ILIKE '%سفارة%' OR business_name_ar ILIKE '%قنصلية%'
         OR business_name ILIKE '%embassy%' OR business_name ILIKE '%consulate%')
  `;
  console.log(`  Embassies in 'other': ${embInOther.length}`);
  
  // Delete embassies from merchants (they're in emergency_contacts)
  if (embInOther.length > 0) {
    const delEmb = await sql`
      DELETE FROM merchants WHERE category = 'other'
      AND (business_name_ar ILIKE '%سفارة%' OR business_name_ar ILIKE '%قنصلية%'
           OR business_name ILIKE '%embassy%' OR business_name ILIKE '%consulate%')
    `;
    console.log(`  Deleted ${delEmb.count} embassies`);
  }

  // Check refugee services in "other"
  const refInOther = await sql`
    SELECT id, business_name_ar, city FROM merchants
    WHERE category = 'other'
    AND (business_name_ar ILIKE '%لاجئ%' OR business_name_ar ILIKE '%صليب%'
         OR business_name_ar ILIKE '%كاريتاس%' OR business_name_ar ILIKE '%مفوضية%')
  `;
  console.log(`  Refugee services in 'other': ${refInOther.length}`);
  
  if (refInOther.length > 0) {
    const delRef = await sql`
      DELETE FROM merchants WHERE category = 'other'
      AND (business_name_ar ILIKE '%لاجئ%' OR business_name_ar ILIKE '%صليب%'
           OR business_name_ar ILIKE '%كاريتاس%' OR business_name_ar ILIKE '%مفوضية%')
    `;
    console.log(`  Deleted ${delRef.count} refugee services`);
  }

  // Final count
  const mc = await sql`SELECT COUNT(*) as c FROM merchants`;
  console.log(`\n=== FINAL: ${mc[0].c} merchants ===`);
  
  await sql.end();
}

main().catch(console.error);
