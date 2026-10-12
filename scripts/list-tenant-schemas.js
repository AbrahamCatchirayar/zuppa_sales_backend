const { Client } = require('pg');
const { config } = require('dotenv');

// Load environment variables
config();

async function listTenantSchemas() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenent_%'
      ORDER BY schema_name;
    `);

    if (result.rows.length === 0) {
      console.log('No tenant schemas found in the database.');
    } else {
      console.log('Existing tenant schemas:');
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.schema_name}`);
      });
      console.log('\nTo run migrations for a specific tenant, use:');
      console.log(
        'TENANT_SCHEMA=<schema_name> npm run typeorm_tenant:cli -- migration:run',
      );
    }
  } catch (error) {
    console.error('Error connecting to database:', error.message);
  } finally {
    await client.end();
  }
}

listTenantSchemas();
