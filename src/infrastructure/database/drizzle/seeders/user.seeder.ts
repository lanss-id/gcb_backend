import { DrizzleService } from '../drizzle.service';
import { users } from '../schema';
import * as bcrypt from 'bcrypt';
import { sql } from 'drizzle-orm';

interface UserResult {
  id: string;
  [key: string]: any;
}

interface QueryResult {
  rows?: UserResult[];
  [key: string]: any;
}

export async function seedUsers(drizzle: DrizzleService) {
  try {
    console.log('Starting user seeding...');

    // Cek apakah tabel users sudah ada data
    const existingUsers = await drizzle.db
      .select({ count: sql`count(*)` })
      .from(users);
    const userCount = parseInt((existingUsers[0]?.count as string) || '0');

    console.log(`Found ${userCount} existing users`);

    // Jika sudah ada data, lewati seeding
    if (userCount > 0) {
      console.log('Users already seeded, skipping...');
      return;
    }

    // Check database structure
    try {
      console.log('Checking users table structure...');
      // Gunakan raw SQL untuk menambahkan kolom yang diperlukan jika belum ada
      await drizzle.db.execute(sql`
        SELECT * FROM users LIMIT 0
      `);
    } catch (error) {
      console.error('Error checking users table:', error);
    }

    // Hash password yang sama untuk semua user
    const password = await bcrypt.hash('Password123!', 10);

    // 1. Seeder untuk user Nasabah
    console.log('Seeding nasabah user...');
    const nasabahUserResult = await drizzle.executeRawQuery(`
      INSERT INTO users (id, email, phone, password, role, is_verified, is_active)
      VALUES (
        gen_random_uuid(),
        'nasabah@example.com',
        '081234567891',
        '${password}',
        'nasabah',
        '1',
        '1'
      )
      ON CONFLICT DO NOTHING
      RETURNING *
    `) as QueryResult;

    const nasabahUser = nasabahUserResult?.rows?.[0];

    if (nasabahUser) {
      console.log('Inserting nasabah profile data for ID:', nasabahUser.id);

      await drizzle.executeRawQuery(`
        INSERT INTO nasabah (id, first_name, last_name, address, points)
        VALUES (
          '${nasabahUser.id}',
          'Budi',
          'Santoso',
          '${JSON.stringify({
            province: 'P01',
            city: 'C01',
            address: 'Jl. Contoh No. 123, Jakarta'
          })}',
          '100'
        )
        ON CONFLICT DO NOTHING
      `);
      console.log('Nasabah user seeded successfully');
    }

    // 2. Seeder untuk Bank Sampah
    console.log('Seeding bank sampah user...');
    const bankSampahUserResult = await drizzle.executeRawQuery(`
      INSERT INTO users (id, email, phone, password, role, is_verified, is_active)
      VALUES (
        gen_random_uuid(),
        'banksampah@example.com',
        '081234567892',
        '${password}',
        'bank_sampah',
        '1',
        '1'
      )
      ON CONFLICT DO NOTHING
      RETURNING *
    `) as QueryResult;

    const bankSampahUser = bankSampahUserResult?.rows?.[0];

    if (bankSampahUser) {
      console.log('Inserting bank sampah profile data for ID:', bankSampahUser.id);

      await drizzle.executeRawQuery(`
        INSERT INTO bank_sampah (id, name, address, max_capacity, operational_hours)
        VALUES (
          '${bankSampahUser.id}',
          'Bank Sampah Sejahtera',
          'Jl. Lingkungan Hijau No. 456, Jakarta',
          '1000',
          '08:00-17:00'
        )
        ON CONFLICT DO NOTHING
      `);
      console.log('Bank sampah user seeded successfully');
    }

    // 3. Seeder untuk Pengelola Sampah
    console.log('Seeding pengelola user...');
    const pengelolaUserResult = await drizzle.executeRawQuery(`
      INSERT INTO users (id, email, phone, password, role, is_verified, is_active)
      VALUES (
        gen_random_uuid(),
        'pengelola@example.com',
        '081234567893',
        '${password}',
        'pengelola',
        '1',
        '1'
      )
      ON CONFLICT DO NOTHING
      RETURNING *
    `) as QueryResult;

    const pengelolaUser = pengelolaUserResult?.rows?.[0];

    if (pengelolaUser) {
      console.log('Inserting pengelola profile data for ID:', pengelolaUser.id);

      await drizzle.executeRawQuery(`
        INSERT INTO pengelola_sampah (id, company_name, business_license, address, company_type)
        VALUES (
          '${pengelolaUser.id}',
          'PT Pengelola Sampah Maju',
          'BSL-123456',
          'Jl. Industri No. 789, Tangerang',
          'Recycling'
        )
        ON CONFLICT DO NOTHING
      `);
      console.log('Pengelola user seeded successfully');
    }

    // 4. Seeder untuk Pemerintah
    console.log('Seeding pemerintah user...');
    const pemerintahUserResult = await drizzle.executeRawQuery(`
      INSERT INTO users (id, email, phone, password, role, is_verified, is_active)
      VALUES (
        gen_random_uuid(),
        'pemerintah@example.com',
        '081234567894',
        '${password}',
        'pemerintah',
        '1',
        '1'
      )
      ON CONFLICT DO NOTHING
      RETURNING *
    `) as QueryResult;

    const pemerintahUser = pemerintahUserResult?.rows?.[0];

    if (pemerintahUser) {
      console.log('Inserting pemerintah profile data for ID:', pemerintahUser.id);

      await drizzle.executeRawQuery(`
        INSERT INTO pemerintah (id, institution, department, position)
        VALUES (
          '${pemerintahUser.id}',
          'Dinas Lingkungan Hidup',
          'Pengelolaan Sampah',
          'Kepala Dinas'
        )
        ON CONFLICT DO NOTHING
      `);
      console.log('Pemerintah user seeded successfully');
    }

    console.log('All users seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}
