import { DrizzleService } from '../drizzle.service';
import { seedUsers } from './user.seeder';
import { seedKategoriSampah } from './kategori-sampah.seeder';

export async function runSeeders(drizzleService: DrizzleService) {
  console.log('Starting database seeding...');

  // Jalankan seeders secara berurutan
  try {
    await seedUsers(drizzleService);
    await seedKategoriSampah(drizzleService);

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error during database seeding:', error);
    throw error;
  }
}
