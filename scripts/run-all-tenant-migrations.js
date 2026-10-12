const { Client } = require('pg');
const { execSync } = require('child_process');
const { config } = require('dotenv');

// Load environment variables
config();

async function runAllTenantMigrations() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    // Get all tenant schemas
    const result = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenent_%'
      ORDER BY schema_name;
    `);

    if (result.rows.length === 0) {
      console.log('No tenant schemas found in the database.');
      return;
    }

    console.log(`Found ${result.rows.length} tenant schema(s):`);
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.schema_name}`);
    });

    console.log('\nRunning migrations for all tenant schemas...\n');

    // Run migrations for each tenant schema
    for (let i = 0; i < result.rows.length; i++) {
      const schema = result.rows[i].schema_name;
      console.log(
        `\n[${i + 1}/${result.rows.length}] Running migrations for: ${schema}`,
      );

      try {
        execSync('npm run typeorm_tenant:cli -- migration:run', {
          stdio: 'inherit',
          env: { ...process.env, TENANT_SCHEMA: schema },
        });
        console.log(`✅ Successfully ran migrations for ${schema}`);
      } catch (error) {
        console.log(
          `❌ Failed to run migrations for ${schema}: ${error.message}`,
        );
        // Continue with other schemas even if one fails
      }
    }

    console.log('\n🎉 Completed running migrations for all tenant schemas!');
  } catch (error) {
    console.error('Error connecting to database:', error.message);
  } finally {
    await client.end();
  }
}

runAllTenantMigrations();
