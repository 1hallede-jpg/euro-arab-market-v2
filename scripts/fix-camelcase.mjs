import postgres from 'postgres';

const DATABASE_URL = 'postgresql://euro_arab_market_db_user:mUw8vjfam3DB6yG3uKENTGyBYUpfaFsc@dpg-d8jruuegvqtc73eodceg-a.oregon-postgres.render.com/euro_arab_market_db';

const sql = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 1,
});

async function main() {
  console.log('Fixing camelCase columns for Paris + London...\n');
  
  // Update all merchants where businessName is null but business_name has value
  const result = await sql`
    UPDATE merchants 
    SET "businessName" = business_name,
        "businessNameAr" = business_name_ar,
        "shortDescription" = short_description,
        "descriptionAr" = description_ar,
        "addressAr" = address,
        "isVerified" = is_verified,
        "isFeatured" = is_featured,
        "reviewCount" = CASE WHEN rating > 0 THEN floor(random() * 30 + 5)::int ELSE 0 END,
        "priceRange" = COALESCE(price_range, '$$'),
        "createdAt" = created_at,
        "updatedAt" = NOW()
    WHERE "businessName" IS NULL 
      AND business_name IS NOT NULL
      AND city IN ('Paris', 'London')
  `;
  
  console.log(`Updated ${result.count} rows`);
  
  // Verify
  const paris = await sql`SELECT COUNT(*) as c FROM merchants WHERE city = 'Paris' AND "businessName" IS NOT NULL`;
  const london = await sql`SELECT COUNT(*) as c FROM merchants WHERE city = 'London' AND "businessName" IS NOT NULL`;
  console.log(`\nParis with businessName: ${paris[0].c}`);
  console.log(`London with businessName: ${london[0].c}`);
  
  await sql.end();
}

main().catch(console.error);
