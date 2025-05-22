import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DrizzleService } from '../../../infrastructure/database/drizzle/drizzle.service';
import {
  transaksiNasabah,
  detailTransaksiNasabah,
  kategoriSampah
} from '../../../infrastructure/database/drizzle/schema';
import { WasteTransaction, WasteTransactionDetail } from '../entities/waste-transaction.entity';

@Injectable()
export class WasteTransactionRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async createTransaction(transaction: Omit<WasteTransaction, 'id' | 'createdAt' | 'updatedAt'>) {
    const result = await this.drizzle.db
      .insert(transaksiNasabah)
      .values({
        nasabahId: transaction.nasabahId,
        bankSampahId: transaction.bankSampahId,
        totalAmount: transaction.totalAmount.toString(),
        totalWeight: transaction.totalWeight.toString(),
        status: transaction.status,
        notes: transaction.notes,
        pointsEarned: transaction.pointsEarned.toString(),
        transactionPhoto: transaction.transactionPhoto,
        locationLatitude: transaction.locationLatitude?.toString(),
        locationLongitude: transaction.locationLongitude?.toString(),
        digitalSignature: transaction.digitalSignature,
      })
      .returning();

    return result[0];
  }

  async addTransactionDetail(detail: Omit<WasteTransactionDetail, 'id' | 'kategoriSampahName'>) {
    const result = await this.drizzle.db
      .insert(detailTransaksiNasabah)
      .values({
        transaksiId: detail.wasteTransactionId,
        kategoriSampahId: detail.kategoriSampahId,
        weight: detail.weight.toString(),
        pricePerUnit: detail.pricePerUnit.toString(),
        subtotal: detail.subtotal.toString(),
        notes: detail.notes,
        photoUrl: detail.photoUrl,
      })
      .returning();

    return result[0];
  }

  async getTransactionById(id: string) {
    const result = await this.drizzle.db
      .select()
      .from(transaksiNasabah)
      .where(eq(transaksiNasabah.id, id))
      .limit(1);

    return result.length ? result[0] : null;
  }

  async getTransactionDetailsByTransactionId(transactionId: string) {
    // Join dengan kategori_sampah untuk mendapatkan nama kategori
    const result = await this.drizzle.db
      .select({
        id: detailTransaksiNasabah.id,
        transaksiId: detailTransaksiNasabah.transaksiId,
        kategoriSampahId: detailTransaksiNasabah.kategoriSampahId,
        kategoriSampahName: kategoriSampah.name,
        weight: detailTransaksiNasabah.weight,
        pricePerUnit: detailTransaksiNasabah.pricePerUnit,
        subtotal: detailTransaksiNasabah.subtotal,
        notes: detailTransaksiNasabah.notes,
        photoUrl: detailTransaksiNasabah.photoUrl,
      })
      .from(detailTransaksiNasabah)
      .leftJoin(
        kategoriSampah,
        eq(detailTransaksiNasabah.kategoriSampahId, kategoriSampah.id)
      )
      .where(eq(detailTransaksiNasabah.transaksiId, transactionId));

    return result;
  }

  async getTransactionsByNasabahId(nasabahId: string) {
    return this.drizzle.db
      .select()
      .from(transaksiNasabah)
      .where(eq(transaksiNasabah.nasabahId, nasabahId))
      .orderBy(transaksiNasabah.createdAt);
  }

  async updateTransactionStatus(id: string, status: WasteTransaction['status']) {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Tambahkan timestamp sesuai dengan status
    if (status === 'confirmed') {
      updateData.confirmedAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const result = await this.drizzle.db
      .update(transaksiNasabah)
      .set(updateData)
      .where(eq(transaksiNasabah.id, id))
      .returning();

    return result[0];
  }
}
