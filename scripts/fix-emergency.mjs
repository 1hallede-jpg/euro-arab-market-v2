import postgres from 'postgres';

const DATABASE_URL = 'postgresql://euro_arab_market_db_user:mUw8vjfam3DB6yG3uKENTGyBYUpfaFsc@dpg-d8jruuegvqtc73eodceg-a.oregon-postgres.render.com/euro_arab_market_db';
const sql = postgres(DATABASE_URL, { ssl: { rejectUnauthorized: false }, max: 1 });

async function main() {
  console.log('=== FIX 1: Cleaning Emergency Contacts ===\n');

  // Step 1: Check current state
  console.log('[1/6] Checking current emergency contacts...');
  const total = await sql`SELECT COUNT(*) as c FROM emergency_contacts`;
  console.log(`      Total: ${total[0].c}`);

  // Check duplicates by phone+type+city
  const dups = await sql`
    SELECT phone, type, city, COUNT(*) as cnt
    FROM emergency_contacts
    GROUP BY phone, type, city
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `;
  console.log(`\n      Duplicates found: ${dups.length} groups`);
  for (const d of dups) {
    console.log(`        ${d.phone} (${d.type}) in ${d.city}: ${d.cnt} times`);
  }

  // Step 2: Check for SOS Médecins in wrong category
  console.log('\n[2/6] Finding SOS Médecins in wrong category...');
  const sos = await sql`
    SELECT id, name, "nameAr", type, phone, city, country
    FROM emergency_contacts
    WHERE phone LIKE '%47 07 77 77%'
    OR "nameAr" ILIKE '%sos médecins%'
    OR "nameAr" ILIKE '%sos%'
    OR description ILIKE '%médecin%'
    OR "descriptionAr" ILIKE '%طبيب%'
  `;
  console.log(`      Found: ${sos.length} rows`);
  for (const s of sos) {
    console.log(`        ID ${s.id}: ${s.nameAr} | type=${s.type} | ${s.phone}`);
  }

  // Step 3: Delete ALL duplicates - keep only the first occurrence of each phone+type+city
  console.log('\n[3/6] Removing duplicates (keeping first occurrence)...');
  const delDups = await sql`
    DELETE FROM emergency_contacts
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM emergency_contacts
      GROUP BY phone, type, city
    )
  `;
  console.log(`      Deleted ${delDups.count} duplicate rows`);

  // Step 4: Fix SOS Médecins - change type from fire/police/other to hospital
  console.log('\n[4/6] Moving SOS Médecins to Health category...');
  const fixSos = await sql`
    UPDATE emergency_contacts
    SET type = 'hospital',
        name = 'SOS Médecins (House-Call Doctor)',
        "nameAr" = 'SOS Médecins (طبيب منازل)',
        description = '24/7 house-call doctor service in Paris',
        "descriptionAr" = 'خدمة طبيب منازل على مدار الساعة في باريس',
        "isActive" = true
    WHERE phone LIKE '%47 07 77 77%'
    OR name ILIKE '%sos médecins%'
    OR "nameAr" ILIKE '%sos médecins%'
  `;
  console.log(`      Fixed ${fixSos.count} rows`);

  // Step 5: Fix any remaining miscategorized entries
  console.log('\n[5/6] Fixing miscategorized entries...');
  // Move pharmacy numbers to pharmacy_24h type
  const fixPharm = await sql`
    UPDATE emergency_contacts
    SET type = 'pharmacy_24h'
    WHERE ("nameAr" ILIKE '%صيدلية%' OR "nameAr" ILIKE '%pharmacy%' OR "nameAr" ILIKE '%pharmacie%')
    AND type != 'pharmacy_24h'
  `;
  console.log(`      Fixed ${fixPharm.count} pharmacy entries`);

  // Step 6: Verify clean state
  console.log('\n[6/6] Verifying...');
  const newTotal = await sql`SELECT COUNT(*) as c FROM emergency_contacts`;
  const newDups = await sql`
    SELECT phone, type, city, COUNT(*) as cnt
    FROM emergency_contacts
    GROUP BY phone, type, city
    HAVING COUNT(*) > 1
  `;
  
  // Show by type
  const byType = await sql`
    SELECT type, COUNT(*) as c FROM emergency_contacts GROUP BY type ORDER BY c DESC
  `;
  console.log(`\n=== RESULTS ===`);
  console.log(`Before: ${total[0].c} contacts`);
  console.log(`After: ${newTotal[0].c} contacts`);
  console.log(`Duplicates remaining: ${newDups.length}`);
  console.log(`\nBy type:`);
  for (const t of byType) {
    console.log(`  ${t.type}: ${t.c}`);
  }

  // Show sample of each type
  console.log(`\n=== SAMPLES ===`);
  for (const t of byType) {
    const sample = await sql`
      SELECT "nameAr", phone, city, type FROM emergency_contacts 
      WHERE type = ${t.type} LIMIT 2
    `;
    for (const s of sample) {
      console.log(`  [${t.type}] ${s.nameAr} | ${s.phone} | ${s.city}`);
    }
  }

  await sql.end();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
