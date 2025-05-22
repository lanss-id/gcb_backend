import { Injectable } from '@nestjs/common';
import { eq, and, gte } from 'drizzle-orm';
import { DrizzleService } from '../../../infrastructure/database/drizzle/drizzle.service';
import { transaksiNasabah, nasabah, users } from '../../../infrastructure/database/drizzle/schema';
import { UserData } from '../dto/qr-transaction.dto';

@Injectable()
export class QRTransactionRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  /**
   * Menyimpan QR code baru atau memperbarui yang sudah ada untuk nasabah
   */
  async saveQRCode(nasabahId: string, qrCode: string, expiresAt?: Date): Promise<string> {
    try {
      // Cek apakah nasabah sudah memiliki QR code aktif
      const existingQR = await this.drizzle.db
        .select({ id: transaksiNasabah.id, qrCode: transaksiNasabah.qrCode })
        .from(transaksiNasabah)
        .where(
          and(
            eq(transaksiNasabah.nasabahId, nasabahId),
            eq(transaksiNasabah.status, 'pending')
          )
        )
        .limit(1);

      // Cek apakah QR generatedAt ada dan kurang dari 30 menit
      const qrActive = existingQR.length > 0 && existingQR[0].qrCode &&
                      existingQR[0].qrCode !== null;

      if (qrActive) {
        // Update QR yang sudah ada
        await this.drizzle.db
          .update(transaksiNasabah)
          .set({
            qrCode,
            qrGeneratedAt: new Date(),
          })
          .where(eq(transaksiNasabah.id, existingQR[0].id));

        return qrCode;
      }

      // Buat transaksi pending baru dengan QR code
      const result = await this.drizzle.db
        .insert(transaksiNasabah)
        .values({
          nasabahId,
          bankSampahId: '00000000-0000-0000-0000-000000000000', // Placeholder, akan diupdate saat QR dipindai
          totalAmount: '0',
          totalWeight: '0',
          status: 'pending',
          qrCode,
          qrGeneratedAt: new Date(),
        })
        .returning({ qrCode: transaksiNasabah.qrCode });

      return result[0]?.qrCode || qrCode;
    } catch (error) {
      console.error('Error saving QR code:', error);
      // Fallback, return the generated QR code even if there was an error
      return qrCode;
    }
  }

  /**
   * Memvalidasi QR code dan mendapatkan data nasabah
   */
  async validateQRCode(qrCode: string): Promise<{
    isValid: boolean;
    message?: string;
    transactionId?: string;
    nasabahId?: string;
    userData?: UserData;
  }> {
    try {
      // Cari transaksi dengan QR code tersebut
      const transaction = await this.drizzle.db
        .select({
          id: transaksiNasabah.id,
          nasabahId: transaksiNasabah.nasabahId,
          qrGeneratedAt: transaksiNasabah.qrGeneratedAt,
          status: transaksiNasabah.status,
        })
        .from(transaksiNasabah)
        .where(
          and(
            eq(transaksiNasabah.qrCode, qrCode),
            eq(transaksiNasabah.status, 'pending'),
          )
        )
        .limit(1);

      if (!transaction.length) {
        return { isValid: false, message: 'QR code tidak valid atau sudah kedaluwarsa' };
      }

      const txn = transaction[0];

      // Cek apakah QR masih valid (kurang dari 30 menit)
      if (!txn.qrGeneratedAt) {
        // Jika qrGeneratedAt null, update waktu saat ini
        await this.drizzle.db
          .update(transaksiNasabah)
          .set({
            qrGeneratedAt: new Date(),
          })
          .where(eq(transaksiNasabah.id, txn.id));

        // Lanjutkan proses validasi
      } else {
        const qrTimestamp = new Date(txn.qrGeneratedAt);
        const currentTime = new Date();
        const timeDiffMinutes = (currentTime.getTime() - qrTimestamp.getTime()) / (60 * 1000);

        if (timeDiffMinutes > 30) {
          return { isValid: false, message: 'QR code sudah kedaluwarsa' };
        }
      }

      // Ambil data nasabah
      const userData = await this.drizzle.db
        .select({
          id: nasabah.id,
          firstName: nasabah.firstName,
          lastName: nasabah.lastName,
          profilePhoto: nasabah.profilePhoto,
        })
        .from(nasabah)
        .where(eq(nasabah.id, txn.nasabahId))
        .limit(1);

      if (!userData.length) {
        return { isValid: false, message: 'Data nasabah tidak ditemukan' };
      }

      return {
        isValid: true,
        transactionId: txn.id,
        nasabahId: txn.nasabahId,
        userData: userData[0],
      };
    } catch (error) {
      console.error('Error validating QR code:', error);
      return { isValid: false, message: 'Terjadi kesalahan saat memvalidasi QR code' };
    }
  }

  /**
   * Update transaksi dengan bankSampahId saat QR dipindai
   */
  async updateTransactionAfterScan(transactionId: string, bankSampahId: string) {
    try {
      return this.drizzle.db
        .update(transaksiNasabah)
        .set({
          bankSampahId,
          updatedAt: new Date(),
        })
        .where(eq(transaksiNasabah.id, transactionId))
        .returning();
    } catch (error) {
      console.error('Error updating transaction after scan:', error);
      throw error;
    }
  }
}
