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

    // Data kategori sampah dengan harga realistis
    const kategoriSampahData = [
      // Kategori Sampah Plastik
      {
        name: 'PET (Polyethylene Terephthalate)',
        description: 'Botol plastik bening seperti botol air mineral, botol minuman bersoda, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/plastik_pet.jpg',
        isActive: '1',
      },
      {
        name: 'HDPE (High-Density Polyethylene)',
        description: 'Plastik keras seperti botol shampo, botol deterjen, galon air, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/plastik_hdpe.jpg',
        isActive: '1',
      },
      {
        name: 'PP (Polypropylene)',
        description: 'Plastik kemasan seperti gelas plastik, tutup botol, kemasan makanan, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/plastik_pp.jpg',
        isActive: '1',
      },
      {
        name: 'LDPE (Low-Density Polyethylene)',
        description: 'Plastik lunak seperti kantong kresek, plastik pembungkus, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/plastik_ldpe.jpg',
        isActive: '1',
      },
      {
        name: 'Plastik Campur',
        description: 'Berbagai jenis plastik yang tercampur.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/plastik_campur.jpg',
        isActive: '1',
      },

      // Kategori Sampah Kertas
      {
        name: 'HVS/Kertas Putih',
        description: 'Kertas kantor, fotokopi, buku tulis, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/kertas_hvs.jpg',
        isActive: '1',
      },
      {
        name: 'Kardus/Karton',
        description: 'Kardus kemasan, karton bekas, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/kardus.jpg',
        isActive: '1',
      },
      {
        name: 'Kertas Koran',
        description: 'Koran bekas, majalah, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/kertas_koran.jpg',
        isActive: '1',
      },
      {
        name: 'Kertas Campur',
        description: 'Buku bekas, kertas berwarna, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/kertas_campur.jpg',
        isActive: '1',
      },

      // Kategori Sampah Logam
      {
        name: 'Aluminium',
        description: 'Kaleng minuman, komponen elektronik, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/aluminium.jpg',
        isActive: '1',
      },
      {
        name: 'Besi',
        description: 'Paku, besi konstruksi, peralatan rumah tangga, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/besi.jpg',
        isActive: '1',
      },
      {
        name: 'Tembaga',
        description: 'Kabel tembaga, komponen elektronik, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/tembaga.jpg',
        isActive: '1',
      },
      {
        name: 'Kuningan',
        description: 'Keran air, hiasan logam, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/kuningan.jpg',
        isActive: '1',
      },

      // Kategori Sampah Elektronik (E-Waste)
      {
        name: 'Baterai Bekas',
        description: 'Baterai AA, AAA, baterai lithium, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/baterai.jpg',
        isActive: '1',
      },
      {
        name: 'Komponen Elektronik',
        description: 'PCB, chip, komponen komputer, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/elektronik.jpg',
        isActive: '1',
      },

      // Kategori Sampah Kaca
      {
        name: 'Botol Kaca',
        description: 'Botol minuman, botol kecap, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/botol_kaca.jpg',
        isActive: '1',
      },
      {
        name: 'Pecahan Kaca',
        description: 'Kaca jendela, gelas pecah, dll.',
        unit: 'kg',
        imageUrl: 'https://example.com/images/pecahan_kaca.jpg',
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
