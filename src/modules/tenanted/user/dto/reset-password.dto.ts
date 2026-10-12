import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class resetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword()
  passwordConfirmation: string;
}
