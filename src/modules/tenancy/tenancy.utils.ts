/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable consistent-return */

import { DataSource } from 'typeorm';
import { TenantDataSource } from '../../orm_config/tenant.datasource';

const tenentConnections = new Map<string, DataSource>();

export async function getTenantConnection(schema: string, request_url = null) {
  try {
    console.info('=========================');
    console.info(request_url);
    console.info(tenentConnections.size);
    console.info('=========================');
    let connection: DataSource;
    if (tenentConnections.has(schema)) {
      const newconn = tenentConnections.get(schema);

      console.info('============Connected exist=============');
      console.info(newconn.isInitialized);
      console.info('=========================');
      if (!newconn.isInitialized) {
        connection = await TenantDataSource(schema);
        tenentConnections.set(schema, connection);
        return connection.initialize();
      }
      return newconn;
    }
    connection = await TenantDataSource(schema);
    tenentConnections.set(schema, connection);
    return connection.initialize();
  } catch (error) {
    console.info('Error Occur while create connection');
  }
}
