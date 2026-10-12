/* eslint-disable max-classes-per-file */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsAlpha,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Role } from '../../tenanted/user/enums/tenentuser.enum';
import { passwordRegex } from '../../../utils';

export class AdminSignIn {
  @ApiProperty({ default: 'admin@rubicr.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ default: 'Password@123' })
  @IsString()
  password: string;
}

export class EmailDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ResetPasswordDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @ApiProperty()
  @Matches(passwordRegex, {
    message:
      'Password Should have alteast one number, one upper case letter, one special charater and atleast 8 characters long',
  })
  password: string;

  @IsString()
  @ApiProperty()
  @Matches(passwordRegex, {
    message:
      'Password Should have alteast one number, one upper case letter, one special charater and atleast 8 characters long',
  })
  passwordConfirmation: string;
}

export class AdminUserDto {
  @IsString()
  @ApiProperty()
  @Matches(passwordRegex, {
    message:
      'Password Should have alteast 1 Numeric, 1 UpperCase, 1 Special Charater, length must be minimum 8 letters',
  })
  password: string;

  @IsString()
  @ApiProperty()
  @Matches(passwordRegex, {
    message:
      'Password Should have alteast 1 Numeric, 1 UpperCase, 1 Special Charater, length must be minimum 8 letters',
  })
  confirm_password: string;

  @ApiProperty()
  @IsOptional()
  phone_number: string;

  @IsBoolean()
  @ApiProperty({ type: Boolean })
  accept_terms_and_conditions: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 25)
  first_name: string;

  @ApiProperty()
  @IsString()
  @Length(1, 25)
  @IsOptional()
  @IsAlpha()
  last_name?: string;
}

export class InvitationAdminDto {
  @ApiProperty()
  @IsString()
  @IsAlpha()
  @IsNotEmpty()
  @Length(1, 25)
  first_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsAlpha()
  @Length(1, 25)
  last_name?: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsOptional()
  phone_number: string;

  @ApiProperty({ enum: Role, default: 'USER' })
  @IsEnum(Role)
  @IsString()
  role: string;
}

export class ChangeAdminPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @Matches(passwordRegex, {
    message:
      'Password Should have alteast one number, one upper case letter, one special charater and atleast 8 characters long',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  passwordConfirmation: string;
}

export class UpdateAdminUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsAlpha()
  @Length(1, 25)
  first_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsAlpha()
  @Length(1, 25)
  last_name?: string;

  @ApiProperty()
  @IsOptional()
  phone_number?: string;
}

export class UpdateAdminMemberDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Length(1, 25)
  first_name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Length(1, 25)
  last_name: string;

  @ApiProperty()
  @IsOptional()
  phone_number?: string;
}

export class Reason {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  blocked_reason: string;
}

export class AdminFilter {
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

  @ApiPropertyOptional({
    description: 'The status of the account',
    enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCK', 'SUSPEND', 'DELETED'],
    enumName: 'account_status',
  })
  @IsString()
  @IsEnum(['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCK', 'SUSPEND', 'DELETED'], {
    message: 'Status must be one of the specified values',
  })
  @IsOptional()
  status?: ['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCK', 'SUSPEND', 'DELETED'];

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  @IsString()
  role: string;

  // @ApiPropertyOptional()
  // @IsString()
  // @IsEnum(UserStatus)
  // @IsOptional()
  // status?: string;
}

//   Role Dto

// export class AdminRoleDto {
//   @ApiProperty()
//   @IsString()
//   name: string;
// }
export class AdminRoleDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  @IsString()
  role: string;
}

export class AdminResendInvitationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsEmail({}, { message: 'provide in a email format' })
  email?: string;
}

// export class RoleAccessDto {
//   @IsString()
//   @ApiProperty()
//   role: string;

//   @IsString()
//   @ApiProperty()
//   @IsEnum(AdminModules)
//   module: string;

//   @IsEnum(AdminFeatures, { each: true, message: 'Invalid feature list' })
//   @ApiProperty()
//   features: AdminFeatures[];
// }

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
