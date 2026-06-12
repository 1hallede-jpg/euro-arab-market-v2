import postgres from 'postgres';

const DATABASE_URL = 'postgresql://euro_arab_market_db_user:mUw8vjfam3DB6yG3uKENTGyBYUpfaFsc@dpg-d8jruuegvqtc73eodceg-a.oregon-postgres.render.com/euro_arab_market_db';
const sql = postgres(DATABASE_URL, { ssl: { rejectUnauthorized: false }, max: 1 });

const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'merchants' ORDER BY ordinal_position`;
for (const c of cols) {
  console.log(`  ${c.column_name}`);
}
await sql.end();
