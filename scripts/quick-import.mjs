import postgres from 'postgres';

const DATABASE_URL = 'postgresql://euro_arab_market_db_user:mUw8vjfam3DB6yG3uKENTGyBYUpfaFsc@dpg-d8jruuegvqtc73eodceg-a.oregon-postgres.render.com/euro_arab_market_db';

const sql = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 1,
  connect_timeout: 30,
});

async function test() {
  try {
    const r = await sql`SELECT COUNT(*) as c FROM merchants`;
    console.log('Connected! Merchants:', r[0].c);
  } catch(e) {
    console.error('Error:', e.message);
  }
  await sql.end();
}

test();
