import postgres from 'postgres';
import fs from 'fs';

// Render DATABASE_URL from user
const DATABASE_URL = 'postgresql://euro_arab_market_db_user:mUw8vjfam3DB6yG3uKENTGyBYUpfaFsc@dpg-d8jruuegvqtc73eodceg-a.oregon-postgres.render.com/euro_arab_market_db';

const sql = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 1,
});

const categoryMap = {
  'مطاعم عربية': 'restaurant',
  'سوبرماركت حلال': 'supermarket',
  'حلويات شرقية': 'sweets',
  'حلاقة عربية': 'barber',
  'جزار حلال': 'butcher',
  'مخابز عربية': 'bakery',
  'مقاهي عربية': 'cafe',
  'ملابس عربية': 'clothing',
  'إلكترونيات': 'electronics',
  'صيدليات': 'pharmacy',
  'بقالة حلال': 'halal_grocery',
  'مقاهي شيشة': 'shisha_lounge',
  'وكالات سفر': 'travel_agency',
  'تحويل أموال': 'money_transfer',
  'مساجد': 'mosque',
  'مراكز ثقافية': 'cultural_center',
  'وكالات سيارات': 'car_dealer',
  'ورش إصلاح': 'repair_shop',
  'سفارات عربية': 'other',
  'خدمات سياحية': 'travel_agency',
  'عطور عربية': 'other',
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 50);
}

async function importCity(filePath, country) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const cityEn = data.city_en;
  let inserted = 0;
  let skipped = 0;

  for (const [catAr, items] of Object.entries(data.categories)) {
    const dbCat = categoryMap[catAr] || 'other';
    for (const item of items) {
      const nameEn = item.name_en || '';
      const nameAr = item.name_ar || '';
      if (!nameEn && !nameAr) { skipped++; continue; }

      const descAr = item.description_ar || '';
      const descEn = item.description_en || '';
      const addr = item.address || '';
      const phone = item.phone || '';
      const rating = item.rating || 0;
      const price = item.price || '$$';
      const lat = item.lat || null;
      const lng = item.lng || null;
      const slug = `${slugify(nameEn || nameAr)}-${cityEn.toLowerCase()}-${item.id}`;
      const shortDesc = `${descAr} | ${descEn}`.substring(0, 160);
      const reviews = rating > 0 ? Math.floor(Math.random() * 30 + 5) : 0;
      const tags = `${catAr} ${data.city_ar} ${cityEn} ${nameAr} ${nameEn}`.substring(0, 200);

      try {
        await sql`
          INSERT INTO merchants (
            business_name, business_name_ar, short_description,
            description, description_ar, category, subcategory,
            tags, country, city, address, phone,
            status, slug, rating,
            latitude, longitude, price_range,
            is_verified, is_featured,
            created_at, updated_at
          ) VALUES (
            ${nameEn}, ${nameAr}, ${shortDesc},
            ${descAr}, ${descAr}, ${dbCat}, ${catAr},
            ${tags}, ${country}, ${cityEn}, ${addr}, ${phone},
            'active', ${slug}, ${rating},
            ${lat}, ${lng}, ${price},
            TRUE, FALSE,
            NOW(), NOW()
          )
          ON CONFLICT DO NOTHING
        `;
        inserted++;
        process.stdout.write(`  [OK] ${nameAr}\n`);
      } catch (e) {
        process.stdout.write(`  [ERR] ${nameAr}: ${e.message}\n`);
        skipped++;
      }
    }
  }
  return { inserted, skipped, city: cityEn };
}

async function importEmergency(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const cityEn = data.city_en;
  const country = data.country_en;
  const em = data.emergency;
  let inserted = 0;

  const contacts = [];
  if (em.police) contacts.push({ type: 'police', name: `Police (${cityEn})`, nameAr: `الشرطة (${data.city_ar})`, phone: em.police });
  if (em.ambulance) contacts.push({ type: 'hospital', name: `Ambulance (${cityEn})`, nameAr: `الإسعاف (${data.city_ar})`, phone: em.ambulance });
  if (em.fire) contacts.push({ type: 'fire', name: `Fire (${cityEn})`, nameAr: `المطافئ (${data.city_ar})`, phone: em.fire });
  if (em.general) contacts.push({ type: 'other', name: `Emergency (${cityEn})`, nameAr: `الطوارئ العامة (${data.city_ar})`, phone: em.general });

  for (const c of contacts) {
    try {
      await sql`
        INSERT INTO emergency_contacts (name, "nameAr", type, phone, country, city, description, "descriptionAr", "isActive", "createdAt", "updatedAt")
        VALUES (${c.name}, ${c.nameAr}, ${c.type}, ${c.phone}, ${country}, ${cityEn}, ${`Emergency ${c.type} in ${cityEn}`}, ${`رقم طوارئ ${c.nameAr}`}, TRUE, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `;
      inserted++;
    } catch (e) {
      process.stdout.write(`  [ERR Emergency] ${c.name}: ${e.message}\n`);
    }
  }
  return { inserted, city: cityEn };
}

async function main() {
  console.log('=== EURO ARAB MARKET - IMPORT PARIS + LONDON ===\n');
  
  // Test connection
  console.log('[1/6] Testing connection...');
  try {
    const r = await sql`SELECT COUNT(*) as c FROM merchants`;
    console.log(`      Connected! Current merchants: ${r[0].c}\n`);
  } catch (e) {
    console.error(`      FAILED: ${e.message}`);
    await sql.end();
    process.exit(1);
  }

  // Import Paris
  console.log('[2/6] Importing PARIS merchants...');
  const paris = await importCity('/mnt/agents/upload/city_paris.json', 'France');
  console.log(`      Paris: ${paris.inserted} inserted, ${paris.skipped} skipped\n`);

  // Import London
  console.log('[3/6] Importing LONDON merchants...');
  const london = await importCity('/mnt/agents/upload/city_london.json', 'UK');
  console.log(`      London: ${london.inserted} inserted, ${london.skipped} skipped\n`);

  // Import emergency Paris
  console.log('[4/6] Importing PARIS emergency...');
  const parisEm = await importEmergency('/mnt/agents/upload/city_paris.json');
  console.log(`      Paris emergency: ${parisEm.inserted} contacts\n`);

  // Import emergency London
  console.log('[5/6] Importing LONDON emergency...');
  const londonEm = await importEmergency('/mnt/agents/upload/city_london.json');
  console.log(`      London emergency: ${londonEm.inserted} contacts\n`);

  // Final count
  console.log('[6/6] Verifying...');
  const mc = await sql`SELECT COUNT(*) as c FROM merchants`;
  const ac = await sql`SELECT COUNT(*) as c FROM merchants WHERE status = 'active'`;
  const pc = await sql`SELECT COUNT(*) as c FROM merchants WHERE city = 'Paris'`;
  const lc = await sql`SELECT COUNT(*) as c FROM merchants WHERE city = 'London'`;
  const ec = await sql`SELECT COUNT(*) as c FROM emergency_contacts`;
  
  console.log(`\n=== RESULTS ===`);
  console.log(`Total merchants: ${mc[0].c}`);
  console.log(`Active merchants: ${ac[0].c}`);
  console.log(`Paris merchants: ${pc[0].c}`);
  console.log(`London merchants: ${lc[0].c}`);
  console.log(`Emergency contacts: ${ec[0].c}`);
  console.log(`\n=== DONE! ===`);

  await sql.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
