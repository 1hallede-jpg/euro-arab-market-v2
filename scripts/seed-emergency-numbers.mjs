import postgres from 'postgres';

const DATABASE_URL = 'postgresql://euro_arab_market_db_user:mUw8vjfam3DB6yG3uKENTGyBYUpfaFsc@dpg-d8jruuegvqtc73eodceg-a.oregon-postgres.render.com/euro_arab_market_db';
const sql = postgres(DATABASE_URL, { ssl: { rejectUnauthorized: false }, max: 1 });

// Emergency numbers for each European city
const emergencyNumbers = [
  // France
  { city: 'Paris', country: 'France', police: '17', ambulance: '15', fire: '18', general: '112' },
  { city: 'Lyon', country: 'France', police: '17', ambulance: '15', fire: '18', general: '112' },
  { city: 'Marseille', country: 'France', police: '17', ambulance: '15', fire: '18', general: '112' },
  { city: 'Nice', country: 'France', police: '17', ambulance: '15', fire: '18', general: '112' },
  // UK
  { city: 'London', country: 'UK', police: '999', ambulance: '999', fire: '999', general: '112' },
  { city: 'Birmingham', country: 'UK', police: '999', ambulance: '999', fire: '999', general: '112' },
  { city: 'Manchester', country: 'UK', police: '999', ambulance: '999', fire: '999', general: '112' },
  // Germany
  { city: 'Berlin', country: 'Germany', police: '110', ambulance: '112', fire: '112', general: '112' },
  { city: 'Munich', country: 'Germany', police: '110', ambulance: '112', fire: '112', general: '112' },
  { city: 'Hamburg', country: 'Germany', police: '110', ambulance: '112', fire: '112', general: '112' },
  { city: 'Frankfurt', country: 'Germany', police: '110', ambulance: '112', fire: '112', general: '112' },
  { city: 'Cologne', country: 'Germany', police: '110', ambulance: '112', fire: '112', general: '112' },
  { city: 'Stuttgart', country: 'Germany', police: '110', ambulance: '112', fire: '112', general: '112' },
  // Spain
  { city: 'Madrid', country: 'Spain', police: '091', ambulance: '112', fire: '112', general: '112' },
  { city: 'Barcelona', country: 'Spain', police: '091', ambulance: '112', fire: '112', general: '112' },
  // Italy
  { city: 'Rome', country: 'Italy', police: '113', ambulance: '118', fire: '115', general: '112' },
  { city: 'Milan', country: 'Italy', police: '113', ambulance: '118', fire: '115', general: '112' },
  // Netherlands
  { city: 'Amsterdam', country: 'Netherlands', police: '112', ambulance: '112', fire: '112', general: '112' },
  { city: 'Rotterdam', country: 'Netherlands', police: '112', ambulance: '112', fire: '112', general: '112' },
  // Belgium
  { city: 'Brussels', country: 'Belgium', police: '101', ambulance: '112', fire: '112', general: '112' },
  // Austria
  { city: 'Vienna', country: 'Austria', police: '133', ambulance: '144', fire: '122', general: '112' },
  // Switzerland
  { city: 'Zurich', country: 'Switzerland', police: '117', ambulance: '144', fire: '118', general: '112' },
  { city: 'Geneva', country: 'Switzerland', police: '117', ambulance: '144', fire: '118', general: '112' },
  // Denmark
  { city: 'Copenhagen', country: 'Denmark', police: '112', ambulance: '112', fire: '112', general: '112' },
  // Sweden
  { city: 'Stockholm', country: 'Sweden', police: '112', ambulance: '112', fire: '112', general: '112' },
  // Greece
  { city: 'Athens', country: 'Greece', police: '100', ambulance: '166', fire: '199', general: '112' },
  // Hungary
  { city: 'Budapest', country: 'Hungary', police: '107', ambulance: '104', fire: '105', general: '112' },
  // Portugal
  { city: 'Lisbon', country: 'Portugal', police: '112', ambulance: '112', fire: '112', general: '112' },
  // Ireland
  { city: 'Dublin', country: 'Ireland', police: '999', ambulance: '999', fire: '999', general: '112' },
  // Czech
  { city: 'Prague', country: 'Czech Republic', police: '158', ambulance: '155', fire: '150', general: '112' },
  // Finland
  { city: 'Helsinki', country: 'Finland', police: '112', ambulance: '112', fire: '112', general: '112' },
  // Norway
  { city: 'Oslo', country: 'Norway', police: '112', ambulance: '113', fire: '110', general: '112' },
];

async function main() {
  console.log('=== Seeding emergency numbers for all cities ===\n');
  
  let inserted = 0;
  let skipped = 0;

  for (const e of emergencyNumbers) {
    // Check if this city already has emergency numbers
    const exists = await sql`SELECT COUNT(*) as c FROM emergency_contacts WHERE city = ${e.city} AND type = 'police'`;
    
    if (exists[0].c > 0) {
      skipped++;
      continue;
    }

    // Insert police
    await sql`
      INSERT INTO emergency_contacts (name, "nameAr", type, phone, country, city, description, "descriptionAr", "isActive", "createdAt", "updatedAt")
      VALUES (${`Police (${e.city})`}, ${`الشرطة — ${e.city}`}, 'police', ${e.police}, ${e.country}, ${e.city}, 
              ${`Police emergency number in ${e.city}`}, ${`رقم طوارئ الشرطة في ${e.city}`}, TRUE, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `;
    
    // Insert ambulance
    await sql`
      INSERT INTO emergency_contacts (name, "nameAr", type, phone, country, city, description, "descriptionAr", "isActive", "createdAt", "updatedAt")
      VALUES (${`Ambulance (${e.city})`}, ${`الإسعاف — ${e.city}`}, 'hospital', ${e.ambulance}, ${e.country}, ${e.city}, 
              ${`Ambulance emergency number in ${e.city}`}, ${`رقم طوارئ الإسعاف في ${e.city}`}, TRUE, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `;
    
    // Insert fire
    await sql`
      INSERT INTO emergency_contacts (name, "nameAr", type, phone, country, city, description, "descriptionAr", "isActive", "createdAt", "updatedAt")
      VALUES (${`Fire Department (${e.city})`}, ${`المطافئ — ${e.city}`}, 'fire', ${e.fire}, ${e.country}, ${e.city}, 
              ${`Fire department emergency number in ${e.city}`}, ${`رقم طوارئ المطافئ في ${e.city}`}, TRUE, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `;
    
    // Insert general emergency
    await sql`
      INSERT INTO emergency_contacts (name, "nameAr", type, phone, country, city, description, "descriptionAr", "isActive", "createdAt", "updatedAt")
      VALUES (${`General Emergency (${e.city})`}, ${`الطوارئ العامة — ${e.city}`}, 'other', ${e.general}, ${e.country}, ${e.city}, 
              ${`General emergency number (EU standard) in ${e.city}`}, ${`رقم الطوارئ العام (معيار الاتحاد الأوروبي) في ${e.city}`}, TRUE, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `;

    inserted += 4;
    process.stdout.write(`  ✅ ${e.city}: Police ${e.police} | Ambulance ${e.ambulance} | Fire ${e.fire} | General ${e.general}\n`);
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Inserted: ${inserted} emergency contacts`);
  console.log(`Skipped (already existed): ${skipped} cities`);
  
  // Count by city
  const byCity = await sql`
    SELECT city, COUNT(*) as c FROM emergency_contacts 
    WHERE type IN ('police', 'hospital', 'fire', 'other') 
    GROUP BY city ORDER BY city
  `;
  console.log(`\nEmergency contacts by city: ${byCity.length} cities`);
  
  // Count by type
  const byType = await sql`
    SELECT type, COUNT(*) as c FROM emergency_contacts GROUP BY type ORDER BY c DESC
  `;
  console.log(`\nBy type:`);
  for (const t of byType) {
    console.log(`  ${t.type}: ${t.c}`);
  }

  await sql.end();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
