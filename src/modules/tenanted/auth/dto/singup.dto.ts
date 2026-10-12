// eslint-disable-next-line max-classes-per-file
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class SignUpDTO {
  @ApiProperty({
    minLength: 3,
    maxLength: 40,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    minLength: 4,
    maxLength: 40,
  })
  @IsString()
  @IsNotEmpty()
  account_name: string;

  @ApiProperty({
    minLength: 4,
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'Email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
export class SignInDTO {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}

export class EmailDTO {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
export class AcceptAccountInvitationDTO {
  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  confirm_password: string;

  @ApiProperty()
  @IsBoolean()
  accept_terms_and_conditions: boolean;
}

export class ResendInviteAccount {
  @ApiPropertyOptional()
  @IsString()
  @IsEmail({}, { message: 'provide in a email format' })
  email?: string;

  @ApiProperty()
  @IsString()
  slug: string;
}

export class AcceptInvitationDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  phone_number: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  confirm_password: string;

  @ApiProperty()
  @IsBoolean()
  accept_terms_and_conditions: boolean;
}
