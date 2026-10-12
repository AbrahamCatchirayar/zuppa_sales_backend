/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger/swagger.module';
import { HttpExceptionFilter } from './exceptions/exception.filter';
import { CustomLoggerService } from './logger/logger';
import { getTenantConnection } from './modules/tenancy/tenancy.utils';
import { AppDataSource } from './orm_config/public.datasource';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLoggerService(),
    cors: true,
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Set request timeout to 5 minutes for long-running operations
  app.use((req, res, next) => {
    req.setTimeout(300000); // 5 minutes
    res.setTimeout(300000); // 5 minutes
    next();
  });

  const querymanager = await AppDataSource.initialize();
  await querymanager.runMigrations();
  const schemas = await querymanager.query(
    'SELECT schema_name as name from information_schema.schemata;',
  );

  for (let i = 1; i < schemas.length; i++) {
    const { name: schema } = schemas[i];
    if (schema.startsWith('tenent_')) {
      const tenantId = schema.replace('tenant_', '');
      const connection = await getTenantConnection(tenantId);
      await connection.runMigrations();

      await connection.destroy();
    }
  }
  await querymanager.destroy();

  // Setup Swagger documentation
  setupSwagger(app);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
