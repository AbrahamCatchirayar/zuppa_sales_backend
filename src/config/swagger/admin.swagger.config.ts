import { DocumentBuilder } from '@nestjs/swagger';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const createAdminSwaggerConfig = () => {
  return new DocumentBuilder()
    .setTitle('Rubicr Admin API Documentation')
    .setDescription('Admin API documentation for Rubicr platform')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        schema: 'Bearer',
        bearerFormat: 'Token',
      } as SecuritySchemeObject,
      'ADMIN',
    )
    .build();
};
