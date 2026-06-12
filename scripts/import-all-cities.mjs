import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = 'postgresql://euro_arab_market_db_user:mUw8vjfam3DB6yG3uKENTGyBYUpfaFsc@dpg-d8jruuegvqtc73eodceg-a.oregon-postgres.render.com/euro_arab_market_db';
const sql = postgres(DATABASE_URL, { ssl: { rejectUnauthorized: false }, max: 1 });

const categoryMap = {
  'مطاعم عربية': 'restaurant', 'سوبرماركت حلال': 'supermarket', 'حلويات شرقية': 'sweets',
  'حلاقة عربية': 'barber', 'جزار حلال': 'butcher', 'مخابز عربية': 'bakery',
  'مقاهي عربية': 'cafe', 'ملابس عربية': 'clothing', 'إلكترونيات': 'electronics',
  'صيدليات': 'pharmacy', 'بقالة حلال': 'halal_grocery', 'مقاهي شيشة': 'shisha_lounge',
  'وكالات سفر': 'travel_agency', 'تحويل أموال': 'money_transfer', 'مساجد': 'mosque',
  'مراكز ثقافية': 'cultural_center', 'وكالات سيارات': 'car_dealer', 'ورش إصلاح': 'repair_shop',
  'سفارات عربية': 'other', 'خدمات سياحية': 'travel_agency', 'عطور عربية': 'other',
  'خدمات اللاجئين': 'other', 'حلاقة': 'barber',
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 50);
}

async function importCity(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const cityEn = data.city_en;
  const countryEn = data.country_en;
  let inserted = 0;

  for (const [catAr, items] of Object.entries(data.categories || {})) {
    const dbCat = categoryMap[catAr] || 'other';
    for (const item of items) {
      const nameEn = item.name_en || '';
      const nameAr = item.name_ar || '';
      if (!nameEn && !nameAr) continue;

      const slug = `${slugify(nameEn || nameAr)}-${cityEn.toLowerCase()}-${item.id || Date.now()}`;
      const shortDesc = `${item.description_ar || ''} | ${item.description_en || ''}`.substring(0, 160);
      const reviews = (item.rating || 0) > 0 ? Math.floor(Math.random() * 30 + 5) : 0;
      const tags = `${catAr} ${data.city_ar} ${cityEn} ${nameAr} ${nameEn}`.substring(0, 200);

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
          ${item.description_ar || ''}, ${item.description_ar || ''}, ${dbCat}, ${catAr},
          ${tags}, ${countryEn}, ${cityEn}, ${item.address || ''}, ${item.phone || ''},
          'active', ${slug}, ${item.rating || 0},
          ${item.lat || null}, ${item.lng || null}, ${item.price || '$$'},
          TRUE, FALSE,
          NOW(), NOW()
        )
        ON CONFLICT DO NOTHING
      `;
      inserted++;
    }
  }
  return { inserted, city: cityEn, cityAr: data.city_ar };
}

async function importEmergency(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const em = data.emergency || {};
  let inserted = 0;

  const contacts = [];
  if (em.police) contacts.push({ type: 'police', nameAr: `الشرطة (${data.city_ar})`, phone: em.police });
  if (em.ambulance) contacts.push({ type: 'hospital', nameAr: `الإسعاف (${data.city_ar})`, phone: em.ambulance });
  if (em.fire) contacts.push({ type: 'fire', nameAr: `المطافئ (${data.city_ar})`, phone: em.fire });
  if (em.general) contacts.push({ type: 'other', nameAr: `الطوارئ العامة (${data.city_ar})`, phone: em.general });

  for (const c of contacts) {
    await sql`
      INSERT INTO emergency_contacts (name, "nameAr", type, phone, country, city, "isActive", "createdAt", "updatedAt")
      VALUES (${c.nameAr}, ${c.nameAr}, ${c.type}, ${c.phone}, ${data.country_en}, ${data.city_en}, TRUE, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `;
    inserted++;
  }
  return { inserted, city: data.city_en };
}

async function fixCamelCase(city) {
  const r = await sql`
    UPDATE merchants 
    SET "businessName" = business_name,
        "businessNameAr" = business_name_ar,
        "shortDescription" = short_description,
        "descriptionAr" = description_ar,
        "addressAr" = address,
        "isVerified" = is_verified,
        "isFeatured" = is_featured,
        "priceRange" = COALESCE(price_range, '$$'),
        "createdAt" = created_at,
        "updatedAt" = NOW()
    WHERE city = ${city} AND "businessName" IS NULL
  `;
  return r.count || 0;
}

async function main() {
  // Find all city JSON files
  const uploadDir = '/mnt/agents/upload';
  const files = fs.readdirSync(uploadDir)
    .filter(f => f.startsWith('city_') && f.endsWith('.json'))
    .sort();

  console.log(`=== IMPORTING ${files.length} CITIES ===\n`);

  let totalMerchants = 0;
  let totalEmergency = 0;
  const results = [];

  for (const file of files) {
    const filePath = path.join(uploadDir, file);
    const cityData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const cityName = cityData.city_en;
    const cityAr = cityData.city_ar;

    process.stdout.write(`[${cityName}] merchants... `);
    const r = await importCity(filePath);
    process.stdout.write(`${r.inserted} OK | `);
    totalMerchants += r.inserted;

    process.stdout.write(`emergency... `);
    const e = await importEmergency(filePath);
    process.stdout.write(`${e.inserted} OK | `);
    totalEmergency += e.inserted;

    if (r.inserted > 0) {
      process.stdout.write(`fixing... `);
      const f = await fixCamelCase(cityName);
      process.stdout.write(`${f} OK`);
    }
    console.log();
    results.push({ city: cityName, cityAr, merchants: r.inserted, emergency: e.inserted });
  }

  // Final count
  const mc = await sql`SELECT COUNT(*) as c FROM merchants`;
  const ec = await sql`SELECT COUNT(*) as c FROM emergency_contacts`;
  const citiesList = await sql`SELECT city, COUNT(*) as c FROM merchants GROUP BY city ORDER BY c DESC`;

  console.log(`\n${'='.repeat(50)}`);
  console.log('IMPORT COMPLETE!');
  console.log(`${'='.repeat(50)}`);
  console.log(`New merchants: ${totalMerchants}`);
  console.log(`New emergency: ${totalEmergency}`);
  console.log(`Total merchants: ${mc[0].c}`);
  console.log(`Total emergency: ${ec[0].c}`);
  console.log(`\nCities breakdown:`);
  for (const c of citiesList) {
    console.log(`  ${c.city}: ${c.c}`);
  }

  await sql.end();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
