import { DocumentBuilder } from '@nestjs/swagger';

export const createBaseSwaggerConfig = () => {
  return new DocumentBuilder()
    .setTitle('Rubicr API Documentation')
    .setDescription('API documentation for Rubicr platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
};
