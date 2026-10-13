require('dotenv').config();
const { Client } = require('pg');

async function verifyDb() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await client.connect();

  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log('\n--- Fresh Public Tables ---');
  tables.rows.forEach(r => console.log('  -', r.table_name));

  const schemas = await client.query(`
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name LIKE 'tenent_%';
  `);
  console.log('\n--- Tenant Schemas ---');
  console.log('  Total tenant schemas:', schemas.rows.length);

  const users = await client.query('SELECT email, role, status FROM admin_user;');
  console.log('\n--- Admin Users Seeded ---');
  console.log(users.rows);

  const roles = await client.query('SELECT name FROM admin_roles;');
  console.log('\n--- Admin Roles ---');
  console.log(roles.rows.map(r => r.name));

  const masterRoles = await client.query('SELECT name FROM master_roles;');
  console.log('\n--- Master Roles ---');
  console.log(masterRoles.rows.map(r => r.name));

  await client.end();
}

verifyDb().catch(console.error);
