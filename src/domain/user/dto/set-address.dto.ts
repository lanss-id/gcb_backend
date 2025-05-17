import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetAddressDto {
  @ApiProperty({ description: 'ID provinsi', example: 'P001' })
  @IsString()
  @IsNotEmpty({ message: 'Provinsi tidak boleh kosong' })
  province: string;

  @ApiProperty({ description: 'ID kota/kabupaten', example: 'K001' })
  @IsString()
  @IsNotEmpty({ message: 'Kota/Kabupaten tidak boleh kosong' })
  city: string;

  @ApiProperty({ description: 'ID kecamatan', example: 'KEC001' })
  @IsString()
  @IsNotEmpty({ message: 'Kecamatan tidak boleh kosong' })
  district: string;

  @ApiProperty({ description: 'Alamat lengkap', example: 'Jl. Sudirman No. 123, RT 01/RW 02' })
  @IsString()
  @IsNotEmpty({ message: 'Alamat lengkap tidak boleh kosong' })
  @MinLength(5, { message: 'Alamat minimal 5 karakter' })
  address: string;

  @ApiProperty({ description: 'ID pengguna', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty({ message: 'ID pengguna tidak boleh kosong' })
  userId: string;
}
