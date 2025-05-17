import { IsNotEmpty, IsString, MinLength, Matches, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetWasteBankAccountDto {
  @ApiProperty({ description: 'ID pengguna (didapat setelah registrasi)' })
  @IsUUID()
  @IsNotEmpty({ message: 'User ID tidak boleh kosong' })
  userId: string;

  @ApiProperty({ description: 'Password', example: 'Password123!' })
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus',
  })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  password: string;

  @ApiProperty({ description: 'Konfirmasi password', example: 'Password123!' })
  @IsString()
  @IsNotEmpty({ message: 'Konfirmasi password tidak boleh kosong' })
  confirmPassword: string;

  @ApiProperty({ description: 'Nomor lisensi bisnis', example: 'BSW-12345' })
  @IsString()
  @IsNotEmpty({ message: 'Nomor lisensi bisnis tidak boleh kosong' })
  businessLicense: string;
}
