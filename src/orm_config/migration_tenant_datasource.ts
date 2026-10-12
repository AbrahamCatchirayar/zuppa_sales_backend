/* eslint-disable @typescript-eslint/no-unused-vars */

import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
// import { StandardSubscriber } from 'src/utils/eventsubscription';
import { SnakeNamingStrategy } from '../utils/snake-naming.strategy';

config();

// Validate that TENANT_SCHEMA is set for tenant migrations
if (!process.env.TENANT_SCHEMA) {
  console.error(
    'Error: TENANT_SCHEMA environment variable is required for tenant migrations.',
  );
  console.error(
    'Please set TENANT_SCHEMA to the tenant schema name (e.g., tenent_123)',
  );
  console.error(
    'Example: TENANT_SCHEMA=tenent_123 npm run typeorm_tenant:cli -- migration:run',
  );
  process.exit(1);
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: process.env.TENANT_SCHEMA,
  extra: {
    idelTimeoutMillis: 1000,
  },
  // subscribers: [StandardSubscriber],
  namingStrategy: new SnakeNamingStrategy(),
  // logging: true,
  logging: ['error'],
  // ssl:
  //   env.node_env !== 'production'
  //     ? false
  //     : {
  //         rejectUnauthorized: true,
  //         ca: readFileSync(process.env.DB_CERTIFICATE).toString(),
  //       },
  entities: [join(__dirname, '../modules/tenanted/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../migration/tenanted/*{.ts,.js}')],
});
