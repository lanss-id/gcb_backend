import { IsNotEmpty, IsString, MinLength, ValidateIf, IsEmail, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Nomor telepon pengguna', example: '+6281234567890' })
  @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong' })
  @IsString({ message: 'Nomor telepon harus berupa string' })
  phoneOrEmail: string;

  @ApiProperty({ description: 'Password pengguna', example: 'Password123!' })
  @IsString({ message: 'Password harus berupa string' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password: string;
}
