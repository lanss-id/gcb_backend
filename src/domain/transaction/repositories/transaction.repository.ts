import { Injectable } from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { DrizzleService } from '../../../infrastructure/database/drizzle/drizzle.service';
import { transaksiNasabah, detailTransaksiNasabah, nasabah, users, bankSampah } from '../../../infrastructure/database/drizzle/schema';
import { Transaction, TransactionDetail } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';

@Injectable()
export class TransactionRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async findById(id: string): Promise<Transaction | null> {
    const result = await this.drizzle.db
      .select()
      .from(transaksiNasabah)
      .where(eq(transaksiNasabah.id, id))
      .limit(1);

    if (!result.length) return null;

    return this.mapToEntity(result[0]);
  }

  async findByNasabahId(nasabahId: string, limit = 10, offset = 0): Promise<Transaction[]> {
    const result = await this.drizzle.db
      .select()
      .from(transaksiNasabah)
      .where(eq(transaksiNasabah.nasabahId, nasabahId))
      .orderBy(desc(transaksiNasabah.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(this.mapToEntity);
  }

  async findByBankSampahId(bankSampahId: string, limit = 10, offset = 0): Promise<Transaction[]> {
    const result = await this.drizzle.db
      .select()
      .from(transaksiNasabah)
      .where(eq(transaksiNasabah.bankSampahId, bankSampahId))
      .orderBy(desc(transaksiNasabah.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(this.mapToEntity);
  }

  async getTransactionDetails(transactionId: string): Promise<TransactionDetail[]> {
    const result = await this.drizzle.db
      .select()
      .from(detailTransaksiNasabah)
      .where(eq(detailTransaksiNasabah.transaksiId, transactionId));

    return result.map(this.mapToDetailEntity);
  }

  async createTransaction(data: CreateTransactionDto): Promise<Transaction> {
    // Transaksi dilakukan dalam single database transaction
    return this.drizzle.transaction(async (tx) => {
      // Insert transaction record
      const [createdTransaction] = await tx
        .insert(transaksiNasabah)
        .values({
          nasabahId: data.nasabahId,
          bankSampahId: data.bankSampahId,
          totalAmount: data.totalAmount.toString(),
          totalWeight: data.totalWeight.toString(),
          status: data.status,
          notes: data.notes,
          pointsEarned: data.pointsEarned.toString(),
          paymentMethod: data.paymentMethod,
          paymentStatus: 'pending',
        })
        .returning();

      // Insert transaction details
      for (const detail of data.details) {
        await tx
          .insert(detailTransaksiNasabah)
          .values({
            transaksiId: createdTransaction.id,
            kategoriSampahId: detail.wasteTypeId,
            weight: detail.weight.toString(),
            pricePerUnit: detail.pricePerUnit.toString(),
            subtotal: detail.subtotal.toString(),
            notes: detail.notes,
          });
      }

      // Update nasabah points
      await tx
        .update(nasabah)
        .set({
          points: sql`COALESCE(${nasabah.points}, 0) + ${data.pointsEarned}`,
        })
        .where(eq(nasabah.id, data.nasabahId));

      return this.mapToEntity(createdTransaction);
    });
  }

  async updateTransaction(id: string, data: UpdateTransactionDto): Promise<Transaction | null> {
    const updateData: Record<string, any> = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
    if (data.paymentDetails !== undefined) updateData.paymentDetails = data.paymentDetails;
    if (data.customerConfirmation !== undefined) updateData.customerConfirmation = data.customerConfirmation.toString();

    // Tandai waktu berdasarkan status
    if (data.status === 'confirmed') updateData.confirmedAt = new Date();
    if (data.status === 'completed') updateData.completedAt = new Date();
    if (data.customerConfirmation === 1) updateData.customerConfirmedAt = new Date();
    if (data.paymentStatus === 'completed') updateData.paymentConfirmedAt = new Date();

    // Update transaction
    const [updatedTransaction] = await this.drizzle.db
      .update(transaksiNasabah)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(transaksiNasabah.id, id))
      .returning();

    if (!updatedTransaction) return null;

    // Update details jika ada
    if (data.details && data.details.length > 0) {
      for (const detail of data.details) {
        if (detail.id) {
          // Update existing detail
          const updateDetailData: Record<string, any> = {};

          if (detail.weight !== undefined) updateDetailData.weight = detail.weight.toString();
          if (detail.pricePerUnit !== undefined) updateDetailData.pricePerUnit = detail.pricePerUnit.toString();
          if (detail.subtotal !== undefined) updateDetailData.subtotal = detail.subtotal.toString();
          if (detail.notes !== undefined) updateDetailData.notes = detail.notes;

          await this.drizzle.db
            .update(detailTransaksiNasabah)
            .set(updateDetailData)
            .where(eq(detailTransaksiNasabah.id, detail.id));
        }
      }
    }

    return this.mapToEntity(updatedTransaction);
  }

  private mapToEntity(data: any): Transaction {
    return {
      id: data.id,
      nasabahId: data.nasabahId,
      bankSampahId: data.bankSampahId,
      totalAmount: parseFloat(data.totalAmount),
      totalWeight: parseFloat(data.totalWeight),
      status: data.status,
      notes: data.notes,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      confirmedAt: data.confirmedAt,
      completedAt: data.completedAt,
      pointsEarned: parseFloat(data.pointsEarned || '0'),
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      paymentDetails: data.paymentDetails,
      paymentConfirmedBy: data.paymentConfirmedBy,
      paymentConfirmedAt: data.paymentConfirmedAt,
      customerConfirmation: parseInt(data.customerConfirmation || '0'),
      customerConfirmedAt: data.customerConfirmedAt,
    };
  }

  private mapToDetailEntity(data: any): TransactionDetail {
    return {
      id: data.id,
      transactionId: data.transaksiId,
      wasteTypeId: data.kategoriSampahId,
      weight: parseFloat(data.weight),
      pricePerUnit: parseFloat(data.pricePerUnit),
      subtotal: parseFloat(data.subtotal),
      notes: data.notes,
    };
  }
}
