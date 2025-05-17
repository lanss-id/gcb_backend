import { IsEmail, IsNotEmpty, IsString, IsIn, MinLength, Matches, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Email pengguna', example: 'user@example.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @ApiProperty({ description: 'Nomor telepon pengguna', example: '081234567890' })
  @IsPhoneNumber('ID', { message: 'Format nomor telepon tidak valid' })
  @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong' })
  phone: string;

  @ApiProperty({ description: 'Peran pengguna', example: 'nasabah', enum: ['nasabah', 'bank_sampah', 'pengelola', 'pemerintah'] })
  @IsIn(['nasabah', 'bank_sampah', 'pengelola', 'pemerintah'], { message: 'Peran tidak valid' })
  @IsNotEmpty({ message: 'Peran tidak boleh kosong' })
  role: 'nasabah' | 'bank_sampah' | 'pengelola' | 'pemerintah';
}
