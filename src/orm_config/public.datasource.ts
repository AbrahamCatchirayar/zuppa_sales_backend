/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { config } from 'dotenv';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
// import { StandardSubscriber } from 'src/utils/eventsubscription';
import { SnakeNamingStrategy } from '../utils/snake-naming.strategy';

config();

const DataSourceConnection: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // subscribers: [StandardSubscriber],
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
  namingStrategy: new SnakeNamingStrategy(),
  entities: [join(__dirname, '../modules/base/**/*.entity.{ts,js}')],
  // entities: [join(__dirname, '../modules/**/**/*.entity.{ts,js}')],
  migrations: [join(__dirname, '../migration/admin/*{.ts,.js}')],
};

export const AppDataSource = new DataSource(DataSourceConnection);
