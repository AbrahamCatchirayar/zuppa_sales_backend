require('dotenv').config();
const { Client } = require('pg');

const KEEP_PUBLIC_TABLES = new Set([
  'admin_roles',
  'admin_user',
  'admin_role_access',
  'master_account',
  'master_roles',
  'master_role_access',
  'migrations',
]);

const KEEP_TENANT_TABLES = new Set([
  'roles',
  'role_access',
  'user',
  'account',
  'migrations',
]);

async function cleanDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await client.connect();
  console.log(`Connected to database: ${process.env.DB_NAME} on ${process.env.DB_HOST}`);

  // 1. Clean public schema
  console.log('\n--- Cleaning public schema ---');
  const publicTablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);

  const publicTablesToDrop = publicTablesRes.rows
    .map((r) => r.table_name)
    .filter((name) => !KEEP_PUBLIC_TABLES.has(name));

  if (publicTablesToDrop.length > 0) {
    console.log(`Found ${publicTablesToDrop.length} tables to drop in public:`, publicTablesToDrop.join(', '));
    for (const tbl of publicTablesToDrop) {
      await client.query(`DROP TABLE IF EXISTS "public"."${tbl}" CASCADE;`);
      console.log(`  ✓ Dropped public."${tbl}"`);
    }
  } else {
    console.log('No extra tables to drop in public schema.');
  }

  // Sync public.migrations
  await client.query(`
    CREATE TABLE IF NOT EXISTS "public"."migrations" (
      "id" SERIAL NOT NULL,
      "timestamp" bigint NOT NULL,
      "name" character varying NOT NULL,
      CONSTRAINT "PK_public_migrations_id" PRIMARY KEY ("id")
    );
  `);
  await client.query('DELETE FROM "public"."migrations";');
  await client.query(`
    INSERT INTO "public"."migrations" ("timestamp", "name")
    VALUES (1770000000001, 'InitialAdmin1770000000001');
  `);
  console.log('  ✓ Updated public.migrations to InitialAdmin1770000000001');

  // 2. Clean tenant schemas
  const tenantSchemasRes = await client.query(`
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name LIKE 'tenent_%'
    ORDER BY schema_name;
  `);

  console.log(`\n--- Found ${tenantSchemasRes.rows.length} tenant schema(s) ---`);
  for (const sRow of tenantSchemasRes.rows) {
    const schema = sRow.schema_name;
    console.log(`\nCleaning tenant schema: ${schema}`);

    const tenantTablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = '${schema}' AND table_type = 'BASE TABLE'
    `);

    const tenantTablesToDrop = tenantTablesRes.rows
      .map((r) => r.table_name)
      .filter((name) => !KEEP_TENANT_TABLES.has(name));

    if (tenantTablesToDrop.length > 0) {
      for (const tbl of tenantTablesToDrop) {
        await client.query(`DROP TABLE IF EXISTS "${schema}"."${tbl}" CASCADE;`);
        console.log(`  ✓ Dropped "${schema}"."${tbl}"`);
      }
    } else {
      console.log(`  No extra tables to drop in ${schema}`);
    }

    // Sync tenant migrations
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."migrations" (
        "id" SERIAL NOT NULL,
        "timestamp" bigint NOT NULL,
        "name" character varying NOT NULL,
        CONSTRAINT "PK_${schema}_migrations_id" PRIMARY KEY ("id")
      );
    `);
    await client.query(`DELETE FROM "${schema}"."migrations";`);
    await client.query(`
      INSERT INTO "${schema}"."migrations" ("timestamp", "name")
      VALUES (1770000000002, 'InitialTenanted1770000000002');
    `);
    console.log(`  ✓ Updated ${schema}.migrations to InitialTenanted1770000000002`);
  }

  await client.end();
  console.log('\n✅ Database cleanup completed successfully!');
}

cleanDatabase().catch((err) => {
  console.error('Error during database cleanup:', err);
  process.exit(1);
});
