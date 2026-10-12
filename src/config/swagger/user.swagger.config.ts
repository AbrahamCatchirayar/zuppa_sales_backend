import { DocumentBuilder } from '@nestjs/swagger';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const createUserSwaggerConfig = () => {
  return new DocumentBuilder()
    .setTitle('Rubicr User API Documentation')
    .setDescription('User API documentation for Rubicr platform')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'Token',
      } as SecuritySchemeObject,
      'USER',
    )
    .build();
};
