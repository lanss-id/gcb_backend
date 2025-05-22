import { Injectable, OnModuleInit } from '@nestjs/common';
import { DrizzleService } from '../drizzle.service';
import { seedUsers } from './user.seeder';
import { seedKategoriSampah } from './kategori-sampah.seeder';
import { seedHargaSampah } from './harga-sampah.seeder';
import { seedWallet } from './wallet.seeder';

@Injectable()
export class MainSeeder implements OnModuleInit {
  constructor(private readonly drizzleService: DrizzleService) {}

  async onModuleInit() {
    console.log('Starting database seeder...');

    try {
      // Jalankan seeders secara berurutan
      await seedUsers(this.drizzleService);
      await seedKategoriSampah(this.drizzleService);
      await seedHargaSampah(this.drizzleService);
      await seedWallet(this.drizzleService);

      console.log('Database seeding completed successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }
}
