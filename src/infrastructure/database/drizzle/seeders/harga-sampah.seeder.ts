import { DrizzleService } from '../drizzle.service';
import { hargaBankSampah, kategoriSampah, bankSampah } from '../schema';

interface HargaBankSampahInsert {
  bankSampahId: string;
  kategoriSampahId: string;
  buyPrice: string;
  isActive: string;
}

export const seedHargaSampah = async (drizzleService: DrizzleService) => {
  try {
    // Cek apakah data harga sampah sudah ada
    const existingData = await drizzleService.db.select().from(hargaBankSampah);

    if (existingData.length > 0) {
      console.log('Harga sampah data already exists. Skipping seeding.');
      return;
    }

    // Ambil semua kategori sampah
    const allKategori = await drizzleService.db.select().from(kategoriSampah);
    if (allKategori.length === 0) {
      console.log('No kategori sampah found. Please seed kategori sampah first.');
      return;
    }

    // Ambil semua bank sampah
    const allBankSampah = await drizzleService.db.select().from(bankSampah);
    if (allBankSampah.length === 0) {
      console.log('No bank sampah found. Please seed bank sampah first.');
      return;
    }

    // Mapping kategori sampah name to ID untuk referensi
    const kategoriMap = new Map();
    allKategori.forEach(kategori => {
      kategoriMap.set(kategori.name, kategori.id);
    });

    // Daftar harga sampah default (per kg)
    const hargaSampahDefault = {
      'PET (Polyethylene Terephthalate)': 2500, // Rp 2.500 per kg
      'HDPE (High-Density Polyethylene)': 2200, // Rp 2.200 per kg
      'PP (Polypropylene)': 1800, // Rp 1.800 per kg
      'LDPE (Low-Density Polyethylene)': 800, // Rp 800 per kg
      'Plastik Campur': 500, // Rp 500 per kg
      'HVS/Kertas Putih': 2500, // Rp 2.500 per kg
      'Kardus/Karton': 1500, // Rp 1.500 per kg
      'Kertas Koran': 1300, // Rp 1.300 per kg
      'Kertas Campur': 1000, // Rp 1.000 per kg
      'Aluminium': 12000, // Rp 12.000 per kg
      'Besi': 3000, // Rp 3.000 per kg
      'Tembaga': 50000, // Rp 50.000 per kg
      'Kuningan': 35000, // Rp 35.000 per kg
      'Baterai Bekas': 3500, // Rp 3.500 per kg
      'Komponen Elektronik': 10000, // Rp 10.000 per kg
      'Botol Kaca': 500, // Rp 500 per kg
      'Pecahan Kaca': 300, // Rp 300 per kg
    };

    const hargaBankSampahData: HargaBankSampahInsert[] = [];

    // Generate data harga untuk setiap bank sampah
    for (const bankSampahItem of allBankSampah) {
      for (const [kategoriName, hargaDefault] of Object.entries(hargaSampahDefault)) {
        const kategoriId = kategoriMap.get(kategoriName);
        if (!kategoriId) continue;

        // Variasi harga untuk masing-masing bank sampah (±10% dari harga default)
        const variance = Math.random() * 0.2 - 0.1; // -10% to +10%
        const buyPrice = Math.round(hargaDefault * (1 + variance));

        hargaBankSampahData.push({
          bankSampahId: bankSampahItem.id,
          kategoriSampahId: kategoriId,
          buyPrice: buyPrice.toString(),
          isActive: '1',
        });
      }
    }

    // Insert data
    if (hargaBankSampahData.length > 0) {
      console.log('Seeding harga sampah...');
      await drizzleService.db.insert(hargaBankSampah).values(hargaBankSampahData);
      console.log(`Harga sampah seeded successfully: ${hargaBankSampahData.length} records`);
    } else {
      console.log('No harga sampah data to seed.');
    }
  } catch (error) {
    console.error('Error seeding harga sampah:', error);
    throw error;
  }
};
