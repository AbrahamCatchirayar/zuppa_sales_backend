require('dotenv').config();
const { Client } = require('pg');
const CONFIG = require('../src/config.json');

async function syncRoles() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await client.connect();
  console.log('Connected to database');

  const newRoles = ['ADMIN', 'SALES', 'ENGINEERING'];

  // 1. Sync public.master_roles
  console.log('\n--- Updating public.master_roles ---');
  for (const r of newRoles) {
    await client.query(`
      INSERT INTO public.master_roles ("name") VALUES ($1)
      ON CONFLICT ("name") DO NOTHING;
    `, [r]);
  }
  await client.query(`
    DELETE FROM public.master_role_access WHERE "role" NOT IN ('ADMIN', 'SALES', 'ENGINEERING');
  `);
  await client.query(`
    DELETE FROM public.master_roles WHERE "name" NOT IN ('ADMIN', 'SALES', 'ENGINEERING');
  `);
  console.log('✓ public.master_roles updated to:', newRoles);

  // 2. Sync public.master_role_access
  console.log('\n--- Updating public.master_role_access ---');
  await client.query('DELETE FROM public.master_role_access;');
  
  // ADMIN has all features
  for (const moduleName of CONFIG.MODULES) {
    const features = CONFIG.TENENT_FEATURES[moduleName] || [];
    await client.query(`
      INSERT INTO public.master_role_access ("id", "created_at", "updated_at", "features", "module", "role")
      VALUES (uuid_generate_v4(), NOW(), NOW(), $1, $2, 'ADMIN');
    `, [features, moduleName]);
  }

  // SALES and ENGINEERING default features
  const defaultSalesEngineering = {
    USER: ['READ'],
    SETTINGS: [],
    HEADER: ['USERS'],
    ORGANIZATION: ['READ'],
  };

  for (const r of ['SALES', 'ENGINEERING']) {
    for (const moduleName of CONFIG.MODULES) {
      const features = defaultSalesEngineering[moduleName] || [];
      await client.query(`
        INSERT INTO public.master_role_access ("id", "created_at", "updated_at", "features", "module", "role")
        VALUES (uuid_generate_v4(), NOW(), NOW(), $1, $2, $3);
      `, [features, moduleName, r]);
    }
  }
  console.log('✓ public.master_role_access populated.');

  // 3. Find all tenant schemas
  const tenantSchemasRes = await client.query(`
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name LIKE 'tenent_%';
  `);

  console.log(`\nFound ${tenantSchemasRes.rows.length} tenant schema(s) to sync.`);

  for (const row of tenantSchemasRes.rows) {
    const s = row.schema_name;
    console.log(`\nSyncing schema "${s}"...`);

    // Ensure tenant roles table exists and has new roles
    for (const r of newRoles) {
      await client.query(`
        INSERT INTO "${s}"."roles" ("name") VALUES ($1)
        ON CONFLICT ("name") DO NOTHING;
      `, [r]);
    }

    // Update any user in tenant whose role was legacy or not in new roles
    await client.query(`
      UPDATE "${s}"."user"
      SET "role" = 'ADMIN'
      WHERE "role" NOT IN ('ADMIN', 'SALES', 'ENGINEERING');
    `);

    // Delete obsolete roles from tenant
    await client.query(`
      DELETE FROM "${s}"."role_access" WHERE "role" NOT IN ('ADMIN', 'SALES', 'ENGINEERING');
    `);
    await client.query(`
      DELETE FROM "${s}"."roles" WHERE "name" NOT IN ('ADMIN', 'SALES', 'ENGINEERING');
    `);

    // Reset role_access in tenant
    await client.query(`DELETE FROM "${s}"."role_access";`);
    
    // ADMIN has ALL features
    for (const moduleName of CONFIG.MODULES) {
      const features = CONFIG.TENENT_FEATURES[moduleName] || [];
      await client.query(`
        INSERT INTO "${s}"."role_access" ("id", "created_at", "updated_at", "features", "module", "role")
        VALUES (uuid_generate_v4(), NOW(), NOW(), $1, $2, 'ADMIN');
      `, [features, moduleName]);
    }

    for (const r of ['SALES', 'ENGINEERING']) {
      for (const moduleName of CONFIG.MODULES) {
        const features = defaultSalesEngineering[moduleName] || [];
        await client.query(`
          INSERT INTO "${s}"."role_access" ("id", "created_at", "updated_at", "features", "module", "role")
          VALUES (uuid_generate_v4(), NOW(), NOW(), $1, $2, $3);
        `, [features, moduleName, r]);
      }
    }

    // Complete onboarding stage on tenant account
    await client.query(`
      UPDATE "${s}"."account"
      SET "current_onboarding_stage" = 4;
    `);

    console.log(`✓ Schema "${s}" synced successfully!`);
  }

  await client.end();
  console.log('\n🎉 Roles and tenant synchronization complete!');
}

syncRoles().catch((err) => {
  console.error('Error syncing roles:', err);
  process.exit(1);
});
