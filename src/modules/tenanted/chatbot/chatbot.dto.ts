import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ChatbotType {
  WEB_PAGE_CONTEXT = 'webpage_context',
  REPHRASE = 'rephrase',
}

export class ChatbotDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  webpageContent: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  text: string;
}
