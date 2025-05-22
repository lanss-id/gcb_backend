// src/infrastructure/database/drizzle/drizzle.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DrizzleService } from './drizzle.service';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { seedUsers } from './seeders/user.seeder';
import { sql } from 'drizzle-orm';
import { MainSeeder } from './seeders/main-seeder';
import { runMigrations } from './migrations';

interface ColumnResult {
  column_name: string;
  [key: string]: any;
}

interface TableResult {
  table_name: string;
  [key: string]: any;
}

interface EnumResult {
  enum_name: string;
  [key: string]: any;
}

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DRIZZLE_DB',
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL');
        const pool = new Pool({ connectionString });
        return drizzle(pool);
      },
      inject: [ConfigService],
    },
    DrizzleService,
    MainSeeder,
  ],
  exports: ['DRIZZLE_DB', DrizzleService],
})
export class DrizzleModule implements OnModuleInit {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly mainSeeder: MainSeeder,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('Running schema updates...');

        // Cek enum yang dibutuhkan dan buat jika belum ada
        await this.ensureEnumsExist();

        // Jalankan migrasi untuk membuat tabel-tabel yang dibutuhkan
        await runMigrations(this.drizzleService);

        // Cek tabel-tabel yang dibutuhkan dan buat jika belum ada
        await this.ensureTablesExist();

        // Cek semua kolom yang dibutuhkan dan tambahkan jika belum ada
        await this.ensureColumnsExist();

        // Run seeders
        console.log('Running seeders...');
        await seedUsers(this.drizzleService);
      } catch (error) {
        console.error('Error updating schema/running seeders:', error);
      }
    } else {
      // Dalam produksi, hanya jalankan migrasi
      try {
        await runMigrations(this.drizzleService);
      } catch (error) {
        console.error('Error running migrations in production:', error);
      }
    }
  }

  private async ensureEnumsExist() {
    console.log('Checking required enums...');

    // Cek keberadaan enum yang diperlukan
    const enumsResult = await this.drizzleService.db.execute(sql`
      SELECT n.nspname as schema, t.typname as enum_name
      FROM pg_type t
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typtype = 'e'
        AND n.nspname = 'public'
    `);

    // Parse hasil query
    const existingEnums: string[] = [];
    if (Array.isArray(enumsResult)) {
      for (const row of enumsResult) {
        if (row && typeof row === 'object' && 'enum_name' in row) {
          existingEnums.push((row as EnumResult).enum_name);
        }
      }
    }

    console.log('Existing enums:', existingEnums);

    // 1. Buat enum 'role' jika belum ada
    console.log('Ensuring role enum...');
    await this.drizzleService.db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
          CREATE TYPE role AS ENUM ('nasabah', 'bank_sampah', 'pengelola', 'pemerintah');
        END IF;
      END
      $$;
    `);

    // 2. Buat enum 'status' jika belum ada
    console.log('Ensuring status enum...');
    await this.drizzleService.db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
          CREATE TYPE status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
        END IF;
      END
      $$;
    `);

    // 3. Buat enum 'payment_method' jika belum ada
    console.log('Ensuring payment_method enum...');
    await this.drizzleService.db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
          CREATE TYPE payment_method AS ENUM ('cash', 'digital_wallet', 'bank_transfer', 'balance', 'voucher');
        END IF;
      END
      $$;
    `);

    // 4. Buat enum 'payment_status' jika belum ada
    console.log('Ensuring payment_status enum...');
    await this.drizzleService.db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
          CREATE TYPE payment_status AS ENUM ('paid', 'unpaid', 'pending', 'failed');
        END IF;
      END
      $$;
    `);

    // 5. Buat enum 'verification_level' jika belum ada
    console.log('Ensuring verification_level enum...');
    await this.drizzleService.db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_level') THEN
          CREATE TYPE verification_level AS ENUM ('basic', 'verified', 'premium');
        END IF;
      END
      $$;
    `);

    // 6. Buat enum 'wallet_transaction_type' jika belum ada
    console.log('Ensuring wallet_transaction_type enum...');
    await this.drizzleService.db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wallet_transaction_type') THEN
          CREATE TYPE wallet_transaction_type AS ENUM ('deposit', 'withdrawal', 'waste_sale');
        END IF;
      END
      $$;
    `);
  }

  private async ensureTablesExist() {
    console.log('Checking required tables...');

    // Cek keberadaan tabel-tabel yang diperlukan
    const tablesResult = await this.drizzleService.db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    // Parse hasil query
    const existingTables: string[] = [];
    if (Array.isArray(tablesResult)) {
      for (const row of tablesResult) {
        if (row && typeof row === 'object' && 'table_name' in row) {
          existingTables.push((row as TableResult).table_name);
        }
      }
    }

    console.log('Existing tables:', existingTables);

    // 1. Buat tabel users jika belum ada
    if (!existingTables.includes('users')) {
      console.log('Creating users table...');

      await this.drizzleService.db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL UNIQUE,
          phone TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role role NOT NULL,
          is_verified TEXT DEFAULT '0',
          is_active TEXT DEFAULT '1',
          device_fingerprint TEXT,
          notification_settings TEXT,
          fcm_token TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          last_login TIMESTAMP WITH TIME ZONE
        )
      `);

      console.log('users table created successfully');
    } else {
      console.log('users table already exists');
    }

    // 2. Buat tabel OTP Codes jika belum ada
    if (!existingTables.includes('otp_codes')) {
      console.log('Creating otp_codes table...');

      await this.drizzleService.db.execute(sql`
        CREATE TABLE IF NOT EXISTS otp_codes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          phone_number TEXT NOT NULL,
          code TEXT NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        )
      `);

      console.log('otp_codes table created successfully');
    } else {
      console.log('otp_codes table already exists');
    }

    // 3. Buat tabel nasabah jika belum ada
    if (!existingTables.includes('nasabah')) {
      console.log('Creating nasabah table...');

      await this.drizzleService.db.execute(sql`
        CREATE TABLE IF NOT EXISTS nasabah (
          id UUID PRIMARY KEY REFERENCES users(id),
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          address TEXT,
          profile_photo TEXT,
          total_waste_sold NUMERIC DEFAULT '0',
          points NUMERIC DEFAULT '0',
          level_id UUID,
          current_progress NUMERIC DEFAULT '0',
          signature_url TEXT,
          preferred_payment_method TEXT
        )
      `);

      console.log('nasabah table created successfully');
    } else {
      console.log('nasabah table already exists');
    }

    // 4. Buat tabel bank_sampah jika belum ada
    if (!existingTables.includes('bank_sampah')) {
      console.log('Creating bank_sampah table...');

      await this.drizzleService.db.execute(sql`
        CREATE TABLE IF NOT EXISTS bank_sampah (
          id UUID PRIMARY KEY REFERENCES users(id),
          name TEXT NOT NULL,
          business_license TEXT,
          business_license_photo TEXT,
          address TEXT NOT NULL,
          latitude NUMERIC,
          longitude NUMERIC,
          max_capacity NUMERIC NOT NULL,
          current_capacity NUMERIC DEFAULT '0',
          operational_hours TEXT,
          pickup_service NUMERIC DEFAULT '0',
          pickup_radius NUMERIC,
          verification_level verification_level DEFAULT 'basic',
          description TEXT,
          profile_photo TEXT,
          rating NUMERIC DEFAULT '0',
          cash_payment_enabled NUMERIC DEFAULT '1',
          digital_payment_enabled NUMERIC DEFAULT '1'
        )
      `);

      console.log('bank_sampah table created successfully');
    } else {
      console.log('bank_sampah table already exists');
    }

    // 5. Buat tabel pengelola_sampah jika belum ada
    if (!existingTables.includes('pengelola_sampah')) {
      console.log('Creating pengelola_sampah table...');

      await this.drizzleService.db.execute(sql`
        CREATE TABLE IF NOT EXISTS pengelola_sampah (
          id UUID PRIMARY KEY REFERENCES users(id),
          company_name TEXT NOT NULL,
          business_license TEXT,
          address TEXT NOT NULL,
          latitude NUMERIC,
          longitude NUMERIC,
          verification_level verification_level DEFAULT 'basic',
          company_type TEXT NOT NULL,
          description TEXT,
          optional_documents TEXT,
          profile_photo TEXT,
          rating NUMERIC DEFAULT '0'
        )
      `);

      console.log('pengelola_sampah table created successfully');
    } else {
      console.log('pengelola_sampah table already exists');
    }

    // 6. Buat tabel pemerintah jika belum ada
    if (!existingTables.includes('pemerintah')) {
      console.log('Creating pemerintah table...');

      await this.drizzleService.db.execute(sql`
        CREATE TABLE IF NOT EXISTS pemerintah (
          id UUID PRIMARY KEY REFERENCES users(id),
          institution TEXT NOT NULL,
          department TEXT NOT NULL,
          position TEXT NOT NULL,
          access_level NUMERIC DEFAULT '1'
        )
      `);

      console.log('pemerintah table created successfully');
    } else {
      console.log('pemerintah table already exists');
    }

    // 7. Buat tabel gamification_levels jika belum ada
    if (!existingTables.includes('gamification_levels')) {
      console.log('Creating gamification_levels table...');

      await this.drizzleService.db.execute(sql`
        CREATE TABLE IF NOT EXISTS gamification_levels (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          required_points NUMERIC NOT NULL,
          threshold_kg NUMERIC NOT NULL,
          icon_url TEXT,
          benefits TEXT
        )
      `);

      console.log('gamification_levels table created successfully');
    } else {
      console.log('gamification_levels table already exists');
    }
  }

  private async ensureColumnsExist() {
    // Cek keberadaan kolom-kolom yang diperlukan
    const columnsResult = await this.drizzleService.db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
    `);

    // Parse hasil query
    const existingColumns: string[] = [];
    if (Array.isArray(columnsResult)) {
      for (const row of columnsResult) {
        if (row && typeof row === 'object' && 'column_name' in row) {
          existingColumns.push((row as ColumnResult).column_name);
        }
      }
    }

    console.log('Existing columns in users table:', existingColumns);

    // Kolom yang diperlukan dalam tabel users
    const requiredColumns = [
      {
        name: 'phone',
        definition: sql`TEXT UNIQUE`,
      },
      {
        name: 'password',
        definition: sql`TEXT NOT NULL DEFAULT ''`,
      },
      {
        name: 'is_verified',
        definition: sql`TEXT DEFAULT '0'`,
      },
      {
        name: 'is_active',
        definition: sql`TEXT DEFAULT '1'`,
      },
      {
        name: 'role',
        definition: sql`role NOT NULL DEFAULT 'nasabah'`,
      },
      {
        name: 'device_fingerprint',
        definition: sql`TEXT NULL`,
      },
      {
        name: 'notification_settings',
        definition: sql`TEXT NULL`,
      },
      {
        name: 'fcm_token',
        definition: sql`TEXT NULL`,
      },
      {
        name: 'created_at',
        definition: sql`TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
      },
      {
        name: 'updated_at',
        definition: sql`TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
      },
      {
        name: 'last_login',
        definition: sql`TIMESTAMP WITH TIME ZONE NULL`,
      },
    ];

    // Cek dan tambahkan setiap kolom yang diperlukan
    for (const column of requiredColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`Adding ${column.name} column to users table...`);

        await this.drizzleService.db.execute(sql`
          ALTER TABLE users
          ADD COLUMN IF NOT EXISTS ${sql.identifier(column.name)} ${column.definition}
        `);

        console.log(`${column.name} column added successfully`);
      } else {
        console.log(`${column.name} column already exists`);
      }
    }
  }
}
