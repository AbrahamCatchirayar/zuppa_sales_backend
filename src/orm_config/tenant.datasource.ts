/* eslint-disable @typescript-eslint/no-unused-vars */

import { join } from 'path';
import { DataSource } from 'typeorm';
// import { StandardSubscriber } from 'src/utils/eventsubscription';
import { env } from '../config';

export const TenantDataSource = (schema: string) => {
  return new DataSource({
    type: 'postgres',
    host: env.db_host,
    port: env.db_port,
    username: env.db_username,
    password: env.db_password,
    // subscribers: [StandardSubscriber],
    database: env.db_name,
    // logging: true,
    logging: ['error'],
    // ssl:
    //   env.node_env !== 'production'
    //     ? false
    //     : {
    //         rejectUnauthorized: true,
    //         ca: readFileSync(process.env.DB_CERTIFICATE).toString(),
    //       },
    extra: {
      idleTimeoutMillis: 1000,
    },
    schema,
    entities: [join(__dirname, '../modules/tenanted/**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, '../migration/tenanted/*{.ts,.js}')],
  });
};
