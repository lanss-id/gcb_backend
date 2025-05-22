-- Memastikan kolom transaksi nasabah sudah sesuai
ALTER TABLE IF EXISTS "transaksi_nasabah"
ADD COLUMN IF NOT EXISTS "qr_code" text;

ALTER TABLE IF EXISTS "transaksi_nasabah"
ADD COLUMN IF NOT EXISTS "qr_generated_at" timestamp;

-- Pastikan indeks dibuat untuk pencarian QR code cepat
CREATE INDEX IF NOT EXISTS "transaksi_nasabah_qr_code_idx" ON "transaksi_nasabah" ("qr_code");

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
