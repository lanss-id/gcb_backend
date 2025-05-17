import { IsEmail, IsNotEmpty, IsString, IsNumber, Min, IsOptional, IsPhoneNumber, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class WasteTypeDto {
  @ApiProperty({ description: 'ID kategori sampah' })
  @IsString()
  @IsNotEmpty({ message: 'ID kategori sampah tidak boleh kosong' })
  kategoriSampahId: string;

  @ApiProperty({ description: 'Harga beli sampah per kg' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Harga harus berupa angka' })
  @Min(0, { message: 'Harga tidak boleh negatif' })
  @IsNotEmpty({ message: 'Harga tidak boleh kosong' })
  buyPrice: number;
}

export class RegisterWasteBankDto {
  @ApiProperty({ description: 'Email bank sampah', example: 'banksampah@example.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @ApiProperty({ description: 'Nomor telepon bank sampah', example: '081234567890' })
  @IsPhoneNumber('ID', { message: 'Format nomor telepon tidak valid' })
  @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong' })
  phone: string;

  @ApiProperty({ description: 'Nama bank sampah', example: 'Bank Sampah Mandiri' })
  @IsString()
  @IsNotEmpty({ message: 'Nama bank sampah tidak boleh kosong' })
  name: string;

  @ApiProperty({ description: 'Alamat bank sampah', example: 'Jl. Raya No. 123' })
  @IsString()
  @IsNotEmpty({ message: 'Alamat tidak boleh kosong' })
  address: string;

  @ApiProperty({ description: 'Koordinat latitude bank sampah', example: -6.2088 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ description: 'Koordinat longitude bank sampah', example: 106.8456 })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ description: 'Kapasitas maksimal penampungan (kg)', example: 1000 })
  @IsNumber()
  @IsNotEmpty({ message: 'Kapasitas maksimal tidak boleh kosong' })
  maxCapacity: number;

  @ApiProperty({ description: 'Jam operasional', example: '08:00-17:00' })
  @IsString()
  @IsOptional()
  operationalHours?: string;

  @ApiProperty({ description: 'Apakah menyediakan layanan jemput sampah', example: true })
  @IsBoolean()
  @IsNotEmpty({ message: 'Status layanan antar jemput harus ditentukan' })
  pickupService: boolean;

  @ApiProperty({ description: 'Radius maksimal jemput sampah (km)', example: 5 })
  @IsNumber()
  @IsOptional()
  pickupRadius?: number;

  @ApiProperty({ description: 'Deskripsi bank sampah' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [WasteTypeDto], description: 'Jenis sampah dan harga' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WasteTypeDto)
  @IsNotEmpty({ message: 'Jenis sampah dan harga tidak boleh kosong' })
  wasteTypes: WasteTypeDto[];
}
