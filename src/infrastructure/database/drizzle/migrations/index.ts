import { DrizzleService } from "../drizzle.service";
import { sql } from 'drizzle-orm';

export async function runMigrations(drizzleService: DrizzleService) {
  console.log('Running database migrations...');

  try {
    // Membuat tabel kategori_sampah jika belum ada
    await drizzleService.db.execute(sql`
      CREATE TABLE IF NOT EXISTS "kategori_sampah" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "description" text,
        "unit" text NOT NULL,
        "image_url" text,
        "created_at" timestamp DEFAULT NOW() NOT NULL,
        "updated_at" timestamp DEFAULT NOW() NOT NULL,
        "is_active" numeric DEFAULT '1'
      );
    `);

    // Membuat tabel transaksi_nasabah jika belum ada
    await drizzleService.db.execute(sql`
      CREATE TABLE IF NOT EXISTS "transaksi_nasabah" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "nasabah_id" uuid NOT NULL,
        "bank_sampah_id" uuid NOT NULL,
        "total_amount" numeric NOT NULL,
        "total_weight" numeric NOT NULL,
        "status" status DEFAULT 'pending' NOT NULL,
        "pickup_address" text,
        "pickup_date" timestamp,
        "notes" text,
        "created_at" timestamp DEFAULT NOW() NOT NULL,
        "updated_at" timestamp DEFAULT NOW() NOT NULL,
        "confirmed_at" timestamp,
        "completed_at" timestamp,
        "points_earned" numeric DEFAULT '0',
        "is_offline_synced" numeric DEFAULT '0',
        "local_id" text,
        "payment_method" payment_method DEFAULT 'cash',
        "payment_status" payment_status DEFAULT 'pending',
        "payment_details" text,
        "payment_confirmed_by" uuid,
        "payment_confirmed_at" timestamp,
        "customer_confirmation" numeric DEFAULT '0',
        "customer_confirmed_at" timestamp,
        "transaction_photo" text,
        "location_latitude" numeric,
        "location_longitude" numeric,
        "digital_signature" text,
        "qr_code" text,
        "qr_generated_at" timestamp
      );
    `);

    // Membuat detail_transaksi_nasabah jika belum ada
    await drizzleService.db.execute(sql`
      CREATE TABLE IF NOT EXISTS "detail_transaksi_nasabah" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "transaksi_id" uuid NOT NULL,
        "kategori_sampah_id" uuid NOT NULL,
        "weight" numeric NOT NULL,
        "price_per_unit" numeric NOT NULL,
        "subtotal" numeric NOT NULL,
        "notes" text,
        "photo_url" text,
        "waste_tracking_id" text
      );
    `);

    // Menjalankan migrasi untuk QR code
    await drizzleService.db.execute(sql`
      -- Memastikan kolom transaksi nasabah sudah sesuai
      ALTER TABLE IF EXISTS "transaksi_nasabah"
      ADD COLUMN IF NOT EXISTS "qr_code" text;

      ALTER TABLE IF EXISTS "transaksi_nasabah"
      ADD COLUMN IF NOT EXISTS "qr_generated_at" timestamp;

      -- Pastikan indeks dibuat untuk pencarian QR code cepat
      CREATE INDEX IF NOT EXISTS "transaksi_nasabah_qr_code_idx" ON "transaksi_nasabah" ("qr_code");
    `);

    // Membuat wallet table jika belum ada
    await drizzleService.db.execute(sql`
      CREATE TABLE IF NOT EXISTS "wallet" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "nasabah_id" uuid NOT NULL,
        "balance" numeric DEFAULT '0' NOT NULL,
        "is_active" numeric DEFAULT '1',
        "created_at" timestamp DEFAULT NOW() NOT NULL,
        "updated_at" timestamp DEFAULT NOW() NOT NULL
      );
    `);

    // Membuat wallet_transaction table jika belum ada
    await drizzleService.db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wallet_transaction_type') THEN
          CREATE TYPE wallet_transaction_type AS ENUM ('deposit', 'withdrawal', 'waste_sale');
        END IF;
      END
      $$;

      CREATE TABLE IF NOT EXISTS "wallet_transaction" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "wallet_id" uuid NOT NULL,
        "amount" numeric NOT NULL,
        "transaction_type" wallet_transaction_type NOT NULL,
        "notes" text,
        "reference_id" uuid,
        "created_at" timestamp DEFAULT NOW() NOT NULL,
        "status" status DEFAULT 'completed' NOT NULL,
        "bank_sampah_id" uuid
      );
    `);

    // Trigger untuk pembuatan wallet transaction
    await drizzleService.db.execute(sql`
      -- Memastikan trigger untuk membuat wallet transaction otomatis saat transaksi completed
      CREATE OR REPLACE FUNCTION create_wallet_transaction_on_complete()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.status = 'completed' AND (OLD.status != 'completed' OR OLD.status IS NULL) THEN
              -- Dapatkan wallet ID nasabah
              DECLARE wallet_id uuid;
              BEGIN
                  SELECT id INTO wallet_id FROM wallet WHERE nasabah_id = NEW.nasabah_id LIMIT 1;

                  -- Jika wallet ditemukan, buat transaksi wallet
                  IF wallet_id IS NOT NULL THEN
                      INSERT INTO wallet_transaction (
                          wallet_id,
                          amount,
                          transaction_type,
                          notes,
                          reference_id,
                          status,
                          bank_sampah_id
                      )
                      VALUES (
                          wallet_id,
                          NEW.total_amount,
                          'waste_sale',
                          'Penjualan sampah',
                          NEW.id,
                          'completed',
                          NEW.bank_sampah_id
                      );

                      -- Update wallet balance
                      UPDATE wallet
                      SET
                          balance = balance::numeric + NEW.total_amount::numeric,
                          updated_at = NOW()
                      WHERE id = wallet_id;
                  END IF;
              END;
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Buat trigger jika belum ada
      DROP TRIGGER IF EXISTS create_wallet_transaction_trigger ON transaksi_nasabah;
      CREATE TRIGGER create_wallet_transaction_trigger
      AFTER UPDATE ON transaksi_nasabah
      FOR EACH ROW
      EXECUTE FUNCTION create_wallet_transaction_on_complete();
    `);

    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}
