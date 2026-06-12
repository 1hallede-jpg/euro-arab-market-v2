import postgres from 'postgres';

const DATABASE_URL = 'postgresql://euro_arab_market_db_user:mUw8vjfam3DB6yG3uKENTGyBYUpfaFsc@dpg-d8jruuegvqtc73eodceg-a.oregon-postgres.render.com/euro_arab_market_db';
const sql = postgres(DATABASE_URL, { ssl: { rejectUnauthorized: false }, max: 1 });

// Map Arabic city names to English
const cityMap = {
  'لندن': 'London', 'باريس': 'Paris', 'برلين': 'Berlin', 'فيينا': 'Vienna',
  'روما': 'Rome', 'مدريد': 'Madrid', 'بروكسل': 'Brussels', 'ستوكهولم': 'Stockholm',
  'كوبنهاغن': 'Copenhagen', 'برشلونة': 'Barcelona', 'أثينا': 'Athens', 'زيورخ': 'Zurich',
  'لشبونة': 'Lisbon', 'بودابست': 'Budapest', 'دبلن': 'Dublin', 'جنيف': 'Geneva',
  'براغ': 'Prague', 'أوسلو': 'Oslo', 'هلسنكي': 'Helsinki', 'ميلان': 'Milan',
  'أمستردام': 'Amsterdam',
  // Also fix duplicate refugees
  'مرسيليا': 'Marseille', 'ليون': 'Lyon', 'كولونيا': 'Cologne', 'فرانكفورت': 'Frankfurt',
  'روتردام': 'Rotterdam', 'ميلانو': 'Milan', 'كوبنهاجن': 'Copenhagen', 'ميونخ': 'Munich',
  'برمنغهام': 'Birmingham', 'وارسو': 'Warsaw', 'مانشستر': 'Manchester', 'هامبورغ': 'Hamburg',
  'بوخارست': 'Bucharest', 'شتوتغارت': 'Stuttgart', 'نيس': 'Nice',
};

async function main() {
  console.log('Fixing Arabic city names to English...\n');
  
  let totalFixed = 0;
  for (const [ar, en] of Object.entries(cityMap)) {
    const r = await sql`UPDATE merchants SET city = ${en} WHERE city = ${ar}`;
    if (r.count > 0) {
      console.log(`  ${ar} → ${en}: ${r.count} rows`);
      totalFixed += r.count;
    }
  }
  
  console.log(`\nTotal fixed: ${totalFixed}`);
  
  // Show clean city counts
  const cities = await sql`
    SELECT city, COUNT(*) as c 
    FROM merchants 
    GROUP BY city 
    ORDER BY c DESC
  `;
  
  console.log(`\n=== CLEAN CITIES (${cities.length}) ===`);
  for (const c of cities) {
    console.log(`  ${c.city}: ${c.c}`);
  }
  
  await sql.end();
}

main().catch(console.error);
