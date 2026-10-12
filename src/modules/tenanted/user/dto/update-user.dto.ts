/* eslint-disable no-shadow */
/* eslint-disable max-classes-per-file */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

enum UserStatusFilter {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}
export class Userfilter {
  @ApiPropertyOptional()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sort?: string = 'createdAt';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({
    description: 'The status of the user',
    enum: [
      'GUEST',
      'ADMIN',
      'SUSTAINABILITY_MANAGER',
      'DATA_REVIEWER',
      'DATA_PROVIDER',
    ],
    enumName: 'role',
  })
  @IsString()
  @IsEnum(
    [
      'GUEST',
      'ADMIN',
      'SUSTAINABILITY_MANAGER',
      'DATA_REVIEWER',
      'DATA_PROVIDER',
    ],
    {
      message:
        'role must be GUEST, ADMIN, SUSTAINABILITY_MANAGER, DATA_REVIEWER, DATA_PROVIDER,',
    },
  )
  @IsOptional()
  role?: [
    'GUEST',
    'ADMIN',
    'SUSTAINABILITY_MANAGER',
    'DATA_REVIEWER',
    'DATA_PROVIDER',
  ];

  @ApiPropertyOptional({
    description: 'The status of the user',
    enum: UserStatusFilter,
    enumName: 'UserStatus',
  })
  @IsString()
  @IsEnum(UserStatusFilter, {
    message: 'Status must be one of the specified values',
  })
  @IsOptional()
  status?: UserStatusFilter;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  passwordConfirmation: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  phone_number?: string;
}

export class UpdateUserByIdDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional({
    description: 'The status of the user',
    enum: [
      'GUEST',
      'ADMIN',
      'SUSTAINABILITY_MANAGER',
      'DATA_REVIEWER',
      'DATA_PROVIDER',
    ],
    enumName: 'userrole',
  })
  @IsString()
  @IsEnum(
    [
      'GUEST',
      'ADMIN',
      'SUSTAINABILITY_MANAGER',
      'DATA_REVIEWER',
      'DATA_PROVIDER',
    ],
    {
      message:
        'role must be GUEST, ADMIN, SUSTAINABILITY_MANAGER, DATA_REVIEWER, DATA_PROVIDER,',
    },
  )
  @IsOptional()
  role?: [
    'GUEST',
    'ADMIN',
    'SUSTAINABILITY_MANAGER',
    'DATA_REVIEWER',
    'DATA_PROVIDER',
  ];
}

export class BlockReasonDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  blocked_reason: string;
}
