require('dotenv').config();
const { Client } = require('pg');
const { execSync } = require('child_process');

async function resetDbFresh() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await client.connect();
  console.log(`Connected to database: ${process.env.DB_NAME} on ${process.env.DB_HOST}`);

  // 1. Drop all tenant schemas
  const tenantSchemasRes = await client.query(`
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name LIKE 'tenent_%';
  `);

  console.log(`\nFound ${tenantSchemasRes.rows.length} tenant schema(s) to drop.`);
  for (const row of tenantSchemasRes.rows) {
    const s = row.schema_name;
    console.log(`  Dropping schema: "${s}"...`);
    await client.query(`DROP SCHEMA IF EXISTS "${s}" CASCADE;`);
  }
  console.log('✓ All tenant schemas dropped.');

  // 2. Drop and recreate public schema
  console.log('\nResetting public schema...');
  await client.query('DROP SCHEMA IF EXISTS public CASCADE;');
  await client.query('CREATE SCHEMA public;');
  await client.query('GRANT ALL ON SCHEMA public TO public;');
  await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  console.log('✓ Public schema completely reset to empty.');

  await client.end();

  // 3. Run TypeORM migrations on fresh public schema
  console.log('\nRunning fresh initial admin migration...');
  execSync('npm run typeorm:cli -- migration:run', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log('✓ Initial admin migration applied successfully.');

  console.log('\n🎉 Database is now 100% fresh, clean, and ready!');
}

resetDbFresh().catch((err) => {
  console.error('Error resetting database:', err);
  process.exit(1);
});
