import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Standard } from '../standard.entity';

export class PaginationMetaDto {
  @ApiProperty({
    example: 10,
    description: 'Number of items in current page',
    type: Number,
  })
  currentCount: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number',
    type: Number,
  })
  currentPage: number;

  @ApiProperty({
    example: 10,
    description: 'Items per page',
    type: Number,
  })
  currentLimit: number;

  @ApiProperty({
    example: 100,
    description: 'Total number of items',
    type: Number,
  })
  totalCount: number;
}

export class ListStandardResponseDto {
  @ApiProperty({ example: true, description: 'Success status' })
  success: boolean;

  @ApiProperty({ type: [Standard], description: 'List of standards' })
  standards?: Standard[];

  @ApiProperty({
    example: 'Operation successful',
    description: 'Response message',
  })
  message?: string;

  @ApiProperty({ type: PaginationMetaDto, description: 'Pagination metadata' })
  meta?: PaginationMetaDto;
}

export class FlagDto {
  @ApiProperty()
  @IsString()
  flag: string;
}

export class StandardResponseDto {
  @ApiProperty({
    example: true,
    description: 'Success status',
    type: Boolean,
  })
  success: boolean;

  @ApiProperty({
    type: [Standard],
    description: 'List of standards',
    example: [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'ISO 9001:2015',
        description: 'Quality Management System Standard',
        logo_url: 'https://example.com/iso9001.png',
        created_at: '2024-03-20T10:00:00Z',
        updated_at: '2024-03-20T10:00:00Z',
        is_deleted: false,
      },
    ],
  })
  standards?: Standard[];

  @ApiProperty({
    type: Standard,
    description: 'Single standard',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'ISO 9001:2015',
      description: 'Quality Management System Standard',
      logo_url: 'https://example.com/iso9001.png',
      created_at: '2024-03-20T10:00:00Z',
      updated_at: '2024-03-20T10:00:00Z',
      is_deleted: false,
    },
  })
  standard?: Standard;

  @ApiProperty({
    example: 'Operation successful',
    description: 'Response message',
    type: String,
  })
  message?: string;

  @ApiProperty({
    type: PaginationMetaDto,
    description: 'Pagination metadata',
    example: {
      currentCount: 10,
      currentPage: 1,
      currentLimit: 10,
      totalCount: 100,
    },
  })
  meta?: PaginationMetaDto;
}

export class CreateStandardResponseDto extends StandardResponseDto {
  @ApiProperty({
    type: Standard,
    description: 'Created standard data',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'ISO 9001:2015',
      description: 'Quality Management System Standard',
      logo_url: 'https://example.com/iso9001.png',
      created_at: '2024-03-20T10:00:00Z',
      updated_at: '2024-03-20T10:00:00Z',
      is_deleted: false,
    },
  })
  standard?: Standard;
}

export class ErrorResponseDto {
  @ApiProperty({
    example: 'Invalid input parameters',
    description: 'Error description',
    type: String,
  })
  message: string;

  @ApiProperty({
    example: 'INVALID_INPUT',
    description: 'Error code',
    type: String,
  })
  errorCode: string;

  @ApiProperty({
    example: 400,
    description: 'HTTP status code',
    type: Number,
  })
  statusCode: number;
}
