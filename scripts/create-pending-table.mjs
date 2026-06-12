import postgres from 'postgres';

const DATABASE_URL = 'postgresql://euro_arab_market_db_user:mUw8vjfam3DB6yG3uKENTGyBYUpfaFsc@dpg-d8jruuegvqtc73eodceg-a.oregon-postgres.render.com/euro_arab_market_db';
const sql = postgres(DATABASE_URL, { ssl: { rejectUnauthorized: false }, max: 1 });

async function main() {
  console.log('Creating pending_merchants table...');
  
  await sql`
    CREATE TABLE IF NOT EXISTS pending_merchants (
      id SERIAL PRIMARY KEY,
      "businessName" VARCHAR(255) NOT NULL,
      "businessNameAr" VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      subcategory VARCHAR(100),
      description TEXT,
      "descriptionAr" TEXT,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(320) NOT NULL,
      website VARCHAR(255),
      country VARCHAR(100) NOT NULL,
      city VARCHAR(100) NOT NULL,
      address TEXT,
      "businessRegistrationPhoto" TEXT,
      "ownerIdPhoto" TEXT,
      "halalCertificate" TEXT,
      logo TEXT,
      status VARCHAR(20) DEFAULT 'pending' NOT NULL,
      "adminNotes" TEXT,
      "rejectionReason" TEXT,
      "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  
  console.log('Table created successfully!');
  
  // Verify
  const r = await sql`SELECT COUNT(*) as c FROM pending_merchants`;
  console.log(`Pending merchants: ${r[0].c}`);
  
  await sql.end();
}

main().catch(console.error);
