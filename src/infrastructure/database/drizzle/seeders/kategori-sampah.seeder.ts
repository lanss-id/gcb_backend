import { DrizzleService } from '../drizzle.service';
import { kategoriSampah } from '../schema';

export const seedKategoriSampah = async (drizzleService: DrizzleService) => {
  try {
    // Cek apakah data kategori sampah sudah ada
    const existingData = await drizzleService.db.select().from(kategoriSampah);

    if (existingData.length > 0) {
      console.log('Kategori sampah data already exists. Skipping seeding.');
      return;
    }

    // Data kategori sampah
    const kategoriSampahData = [
      {
        name: 'Plastik PET',
        description: 'Botol plastik minuman, botol minyak goreng, botol kecap, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/plastik_pet.jpg',
        isActive: '1',
      },
      {
        name: 'Plastik HDPE',
        description: 'Botol shampoo, botol sabun, botol deterjen, ember, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/plastik_hdpe.jpg',
        isActive: '1',
      },
      {
        name: 'Kertas HVS',
        description: 'Kertas putih bekas cetak atau fotokopi.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/kertas_hvs.jpg',
        isActive: '1',
      },
      {
        name: 'Kardus',
        description: 'Kardus bekas kemasan produk.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/kardus.jpg',
        isActive: '1',
      },
      {
        name: 'Kaleng Aluminium',
        description: 'Kaleng minuman, makanan, dan produk aerosol.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/kaleng_aluminium.jpg',
        isActive: '1',
      },
      {
        name: 'Besi',
        description: 'Besi bekas, peralatan rumah tangga, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/besi.jpg',
        isActive: '1',
      },
      {
        name: 'Kaca',
        description: 'Botol kaca, wadah kaca, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/kaca.jpg',
        isActive: '1',
      },
      {
        name: 'Sampah Organik',
        description: 'Sisa makanan, daun kering, ranting, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/organik.jpg',
        isActive: '1',
      },
    ];

    // Insert data
    console.log('Seeding kategori sampah...');
    await drizzleService.db.insert(kategoriSampah).values(kategoriSampahData);
    console.log('Kategori sampah seeded successfully');
  } catch (error) {
    console.error('Error seeding kategori sampah:', error);
    throw error;
  }
};
