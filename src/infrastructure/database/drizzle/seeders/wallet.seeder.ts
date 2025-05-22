import { DrizzleService } from '../drizzle.service';
import { wallet, nasabah } from '../schema';

export const seedWallet = async (drizzleService: DrizzleService) => {
  try {
    // Cek apakah data wallet sudah ada
    const existingData = await drizzleService.db.select().from(wallet);

    if (existingData.length > 0) {
      console.log('Wallet data already exists. Skipping seeding.');
      return;
    }

    // Ambil semua nasabah
    const allNasabah = await drizzleService.db.select().from(nasabah);
    if (allNasabah.length === 0) {
      console.log('No nasabah found. Please seed nasabah first.');
      return;
    }

    const walletData = allNasabah.map(nasabahItem => ({
      nasabahId: nasabahItem.id,
      balance: '0', // Saldo awal 0
      isActive: '1',
    }));

    // Insert data
    console.log('Seeding wallet...');
    await drizzleService.db.insert(wallet).values(walletData);
    console.log(`Wallet seeded successfully: ${walletData.length} records`);
  } catch (error) {
    console.error('Error seeding wallet:', error);
    throw error;
  }
};
