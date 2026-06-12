import postgres from 'postgres';

const DATABASE_URL = 'postgresql://euro_arab_market_db_user:mUw8vjfam3DB6yG3uKENTGyBYUpfaFsc@dpg-d8jruuegvqtc73eodceg-a.oregon-postgres.render.com/euro_arab_market_db';
const sql = postgres(DATABASE_URL, { ssl: { rejectUnauthorized: false }, max: 1 });

const enums = await sql`
  SELECT t.typname as enum_name, 
         array_agg(e.enumlabel ORDER BY e.enumsortorder) as labels
  FROM pg_type t
  JOIN pg_enum e ON t.oid = e.enumtypid
  JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
  GROUP BY t.typname
  ORDER BY t.typname
`;

for (const e of enums) {
  console.log(`${e.enum_name}: ${e.labels.slice(0, 5).join(', ')}...`);
}

await sql.end();
