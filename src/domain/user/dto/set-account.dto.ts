import { IsNotEmpty, IsString, MinLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetAccountDto {
  @ApiProperty({ description: 'ID Pengguna', example: 'uuid' })
  @IsUUID('4', { message: 'ID pengguna tidak valid' })
  @IsNotEmpty({ message: 'ID pengguna tidak boleh kosong' })
  userId: string;

  @ApiProperty({ description: 'Nama depan pengguna', example: 'John' })
  @IsString({ message: 'Nama depan harus berupa string' })
  @IsNotEmpty({ message: 'Nama depan tidak boleh kosong' })
  firstName: string;

  @ApiProperty({ description: 'Nama belakang pengguna', example: 'Doe' })
  @IsString({ message: 'Nama belakang harus berupa string' })
  @IsNotEmpty({ message: 'Nama belakang tidak boleh kosong' })
  lastName: string;

  @ApiProperty({ description: 'Password pengguna', example: 'Password123' })
  @IsString({ message: 'Password harus berupa string' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password: string;

  @ApiProperty({ description: 'Konfirmasi password', example: 'Password123' })
  @IsString({ message: 'Konfirmasi password harus berupa string' })
  @IsNotEmpty({ message: 'Konfirmasi password tidak boleh kosong' })
  confirmPassword: string;
}
