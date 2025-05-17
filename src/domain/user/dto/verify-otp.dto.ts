import { IsNotEmpty, IsString, Length, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ description: 'Nomor telepon pengguna', example: '081234567890' })
  @IsPhoneNumber('ID', { message: 'Format nomor telepon tidak valid' })
  @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong' })
  phoneNumber: string;

  @ApiProperty({ description: 'Kode OTP 6 digit', example: '123456' })
  @IsString()
  @Length(6, 6, { message: 'Kode OTP harus 6 digit' })
  @IsNotEmpty({ message: 'Kode OTP tidak boleh kosong' })
  otp: string;
}
