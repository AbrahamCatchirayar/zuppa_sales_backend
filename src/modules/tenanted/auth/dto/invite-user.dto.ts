/* eslint-disable max-classes-per-file */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import {
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TENENT_ROLE } from 'src/utils';

export class BasicInvitation {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class Invitation extends BasicInvitation {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'user role',
    default: 'ADMIN',
  })
  @IsString()
  @IsOptional()
  role?: string;
}

export class InvitationDTO {
  @ApiProperty({
    type: () => [Invitation],
  })
  @IsArray()
  @Type(() => Invitation)
  @ValidateNested({ each: true })
  invitation?: Invitation[];
}

export class ResendInvitationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsEmail({}, { message: 'provide in a email format' })
  email?: string;
}

export class OnboardUpdate {
  @ApiProperty({
    description: 'onboard type',
    enum: ['business_unit', 'standard', 'invite', 'plan'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['business_unit', 'standard', 'invite', 'plan'])
  onboarding: string;
}

export class OnboardDto {
  @ApiPropertyOptional()
  @IsOptional()
  onboarding?: string | boolean;
}
