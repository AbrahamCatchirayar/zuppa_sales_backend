/* eslint-disable @typescript-eslint/no-unused-vars */

import { join } from 'path';
// import { StandardSubscriber } from 'src/utils/eventsubscription';

module.exports = {
  type: 'postgres', // RDBMS
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // subscribers: [StandardSubscriber],
  // logging: true,
  logging: ['error'],
  extra: {
    idleTimeoutMillis: 30000, // 30 seconds
    connectionTimeoutMillis: 60000, // 60 seconds
    query_timeout: 300000, // 5 minutes for long queries
  },
  // ssl:
  //   env.node_env !== 'production'
  //     ? false
  //     : {
  //         rejectUnauthorized: true,
  //         ca: readFileSync(process.env.DB_CERTIFICATE).toString(),
  //       },
  autoLoadEntities: true,
  entities: [],
  migrations: [join(__dirname, './migrations/admin/*{.ts,.js}')],
};
