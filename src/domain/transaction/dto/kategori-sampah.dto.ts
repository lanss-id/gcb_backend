import { ApiProperty } from '@nestjs/swagger';

export class KategoriSampahDto {
  @ApiProperty({ description: 'ID kategori sampah' })
  id: string;

  @ApiProperty({ description: 'Nama kategori sampah' })
  name: string;

  @ApiProperty({ description: 'Deskripsi kategori sampah' })
  description?: string;

  @ApiProperty({ description: 'Satuan pengukuran (kg, liter, dll)' })
  unit: string;

  @ApiProperty({ description: 'URL gambar kategori sampah' })
  imageUrl?: string;
}
