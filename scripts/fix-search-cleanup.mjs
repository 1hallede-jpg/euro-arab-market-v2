import postgres from 'postgres';

const DATABASE_URL = 'postgresql://euro_arab_market_db_user:mUw8vjfam3DB6yG3uKENTGyBYUpfaFsc@dpg-d8jruuegvqtc73eodceg-a.oregon-postgres.render.com/euro_arab_market_db';
const sql = postgres(DATABASE_URL, { ssl: { rejectUnauthorized: false }, max: 1 });

// Categories that ARE food-related (can have حلال)
const foodCategories = ['restaurant', 'butcher', 'supermarket', 'bakery', 'sweets', 'halal_grocery', 'cafe'];

// Categories that are NOT food (must NOT have حلال)
const nonFoodCategories = ['barber', 'clothing', 'electronics', 'pharmacy', 'shisha_lounge', 
  'travel_agency', 'money_transfer', 'mosque', 'cultural_center', 'car_dealer', 'repair_shop'];

async function main() {
  console.log('=== FIX 1: Remove حلال from non-food items ===\n');

  // 1. Find all merchants with "حلال" in name that are NOT food
  console.log('[1/5] Finding non-food items with "حلال"...');
  const nonFoodHalal = await sql`
    SELECT id, business_name, business_name_ar, category, city, subcategory
    FROM merchants
    WHERE (
      business_name ILIKE '%halal%'
      OR "businessName" ILIKE '%halal%'
      OR business_name_ar ILIKE '%حلال%'
      OR "businessNameAr" ILIKE '%حلال%'
    )
    AND category NOT IN ${sql(foodCategories)}
  `;
  console.log(`  Found ${nonFoodHalal.length} non-food items with حلال`);
  for (const m of nonFoodHalal.slice(0, 10)) {
    console.log(`    [${m.category}] ${m.business_name_ar || m.businessNameAr} (${m.city})`);
  }

  // 2. Remove "حلال" / "Halal" from non-food business names
  console.log('\n[2/5] Cleaning non-food business names...');
  for (const m of nonFoodHalal) {
    const cleanAr = (m.business_name_ar || m.businessNameAr || '')
      .replace(/حلال/gi, '').replace(/Halal/gi, '').replace(/HALAL/gi, '')
      .replace(/\s+/g, ' ').trim();
    const cleanEn = (m.business_name || m.businessName || '')
      .replace(/Halal/gi, '').replace(/HALAL/gi, '')
      .replace(/\s+/g, ' ').trim();
    
    await sql`
      UPDATE merchants 
      SET business_name_ar = ${cleanAr}, "businessNameAr" = ${cleanAr},
          business_name = ${cleanEn}, "businessName" = ${cleanEn}
      WHERE id = ${m.id}
    `;
    console.log(`  [${m.id}] Cleaned: ${cleanAr}`);
  }

  // 3. Fix specific taxi entries
  console.log('\n[3/5] Fixing taxi entries...');
  const taxis = await sql`
    SELECT id, business_name, business_name_ar, city 
    FROM merchants
    WHERE (business_name ILIKE '%taxi%' OR business_name_ar ILIKE '%تاكسي%'
           OR "businessName" ILIKE '%taxi%' OR "businessNameAr" ILIKE '%تاكسي%')
  `;
  console.log(`  Found ${taxis.length} taxi entries`);
  for (const t of taxis) {
    const cityAr = { Paris: 'باريس', London: 'لندن', Berlin: 'برلين', Madrid: 'مدريد',
      Rome: 'روما', Barcelona: 'برشلونة', Milan: 'ميلان', Amsterdam: 'أمستردام',
      Brussels: 'بروكسل', Vienna: 'فيينا' }[t.city] || t.city;
    
    const newAr = `تاكسي مع سائق عربي — ${cityAr}`;
    const newEn = `Arabic-speaking Taxi — ${t.city}`;
    await sql`
      UPDATE merchants 
      SET business_name_ar = ${newAr}, "businessNameAr" = ${newAr},
          business_name = ${newEn}, "businessName" = ${newEn},
          category = 'other', subcategory = 'مواصلات'
      WHERE id = ${t.id}
    `;
    console.log(`  [${t.id}] Fixed taxi: ${newAr}`);
  }

  // 4. Remove embassies from merchants table (they should be in emergency_contacts)
  console.log('\n[4/5] Separating embassies from merchants...');
  const embassies = await sql`
    SELECT id, business_name, business_name_ar, city, country, address, phone
    FROM merchants
    WHERE category = 'other' 
    AND (business_name_ar ILIKE '%سفارة%' OR business_name ILIKE '%embassy%'
         OR "businessNameAr" ILIKE '%سفارة%' OR "businessName" ILIKE '%embassy%'
         OR business_name_ar ILIKE '%قنصلية%' OR business_name ILIKE '%consulate%'
         OR subcategory ILIKE '%سفارة%')
  `;
  console.log(`  Found ${embassies.length} embassies in merchants table`);
  
  // Move them to emergency_contacts as embassy type
  let moved = 0;
  for (const e of embassies) {
    const exists = await sql`
      SELECT COUNT(*) as c FROM emergency_contacts 
      WHERE phone = ${e.phone} AND type = 'embassy' AND city = ${e.city}
    `;
    if (exists[0].c == 0) {
      await sql`
        INSERT INTO emergency_contacts (name, "nameAr", type, phone, country, city, address, "isActive", "createdAt", "updatedAt")
        VALUES (${e.business_name || e.businessName}, ${e.business_name_ar || e.businessNameAr}, 
                'embassy', ${e.phone || ''}, ${e.country}, ${e.city}, ${e.address || ''}, TRUE, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `;
      moved++;
    }
  }
  console.log(`  Moved ${moved} embassies to emergency_contacts`);
  
  // Delete embassies from merchants
  const delEmb = await sql`
    DELETE FROM merchants
    WHERE category = 'other' 
    AND (business_name_ar ILIKE '%سفارة%' OR business_name ILIKE '%embassy%'
         OR "businessNameAr" ILIKE '%سفارة%' OR "businessName" ILIKE '%embassy%'
         OR business_name_ar ILIKE '%قنصلية%' OR subcategory ILIKE '%سفارة%')
  `;
  console.log(`  Deleted ${delEmb.count} embassies from merchants`);

  // 5. Remove refugee services from merchants
  console.log('\n[5/5] Separating refugee services...');
  const refugeeServices = await sql`
    SELECT id, business_name, business_name_ar, city
    FROM merchants
    WHERE business_name_ar ILIKE '%لاجئ%' 
       OR business_name ILIKE '%refugee%'
       OR business_name_ar ILIKE '%صليب%'
       OR business_name ILIKE '%red cross%'
       OR business_name_ar ILIKE '%كاريتاس%'
       OR business_name ILIKE '%caritas%'
       OR business_name_ar ILIKE '%مفوضية%'
       OR business_name ILIKE '%unhcr%'
       OR business_name_ar ILIKE '%unhcr%'
       OR subcategory ILIKE '%لاجئ%'
  `;
  console.log(`  Found ${refugeeServices.length} refugee services in merchants`);
  
  // Move to emergency_contacts with type 'other' and description indicating refugee service
  for (const r of refugeeServices) {
    const exists = await sql`
      SELECT COUNT(*) as c FROM emergency_contacts 
      WHERE phone = ${r.phone || ''} AND city = ${r.city} AND name = ${r.business_name || r.businessName}
    `;
    if (!exists[0].c) {
      await sql`
        INSERT INTO emergency_contacts (name, "nameAr", type, phone, country, city, 
          description, "descriptionAr", "isActive", "createdAt", "updatedAt")
        VALUES (${r.business_name || r.businessName}, ${r.business_name_ar || r.businessNameAr}, 
                'other', ${r.phone || ''}, ${r.country || ''}, ${r.city}, 
                'Refugee aid service', 'خدمة إغاثة للاجئين', TRUE, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `;
    }
  }
  
  const delRef = await sql`
    DELETE FROM merchants
    WHERE business_name_ar ILIKE '%لاجئ%' 
       OR business_name ILIKE '%refugee%'
       OR business_name_ar ILIKE '%صليب%'
       OR business_name ILIKE '%red cross%'
       OR business_name_ar ILIKE '%كاريتاس%'
       OR business_name ILIKE '%caritas%'
       OR business_name_ar ILIKE '%مفوضية%'
       OR business_name ILIKE '%unhcr%'
       OR subcategory ILIKE '%لاجئ%'
  `;
  console.log(`  Deleted ${delRef.count} refugee services from merchants`);

  // Summary
  console.log('\n=== RESULTS ===');
  const mc = await sql`SELECT COUNT(*) as c FROM merchants`;
  const ec = await sql`SELECT COUNT(*) as c FROM emergency_contacts`;
  const cats = await sql`
    SELECT category, COUNT(*) as c FROM merchants GROUP BY category ORDER BY c DESC
  `;
  console.log(`Merchants: ${mc[0].c}`);
  console.log(`Emergency: ${ec[0].c}`);
  console.log('\nMerchant categories:');
  for (const c of cats) {
    console.log(`  ${c.category}: ${c.c}`);
  }

  await sql.end();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
