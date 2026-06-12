import postgres from 'postgres';
import fs from 'fs';

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
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 50);
}

async function importCity(filePath, country) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const cityEn = data.city_en;
  let inserted = 0;

  for (const [catAr, items] of Object.entries(data.categories)) {
    const dbCat = categoryMap[catAr] || 'other';
    for (const item of items) {
      const nameEn = item.name_en || '';
      const nameAr = item.name_ar || '';
      if (!nameEn && !nameAr) continue;

      const slug = `${slugify(nameEn || nameAr)}-${cityEn.toLowerCase()}-${item.id}`;
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
          ${tags}, ${country}, ${cityEn}, ${item.address || ''}, ${item.phone || ''},
          'active', ${slug}, ${item.rating || 0},
          ${item.lat || null}, ${item.lng || null}, ${item.price || '$$'},
          TRUE, FALSE,
          NOW(), NOW()
        )
        ON CONFLICT DO NOTHING
      `;
      inserted++;
      process.stdout.write(`  [OK] ${nameAr}\n`);
    }
  }
  return { inserted, city: cityEn };
}

async function importEmergency(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const em = data.emergency;
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
  return r.count;
}

async function main() {
  console.log('=== IMPORTING 3 CITIES ===\n');

  const cities = [
    ['/mnt/agents/upload/city_helsinki.json', 'Finland', 'Helsinki'],
    ['/mnt/agents/upload/city_athens.json', 'Greece', 'Athens'],
    ['/mnt/agents/upload/city_budapest.json', 'Hungary', 'Budapest'],
  ];

  let totalMerchants = 0;
  let totalEmergency = 0;

  for (const [file, country, cityName] of cities) {
    console.log(`[${cityName}] Importing merchants...`);
    const r = await importCity(file, country);
    console.log(`       ${r.inserted} inserted\n`);
    totalMerchants += r.inserted;

    console.log(`[${cityName}] Importing emergency...`);
    const e = await importEmergency(file);
    console.log(`       ${e.inserted} contacts\n`);
    totalEmergency += e.inserted;

    console.log(`[${cityName}] Fixing camelCase...`);
    const f = await fixCamelCase(cityName);
    console.log(`       ${f} rows fixed\n`);
  }

  // Final count
  const mc = await sql`SELECT COUNT(*) as c FROM merchants`;
  console.log(`=== RESULTS ===`);
  console.log(`New merchants: ${totalMerchants}`);
  console.log(`New emergency: ${totalEmergency}`);
  console.log(`Total merchants: ${mc[0].c}`);

  await sql.end();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
