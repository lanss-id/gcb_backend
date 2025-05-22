import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../../infrastructure/database/drizzle/drizzle.service';
import { wallet, walletTransaction } from '../../../infrastructure/database/drizzle/schema';
import { WalletTransaction } from '../entities/waste-transaction.entity';

@Injectable()
export class WalletRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async findWalletByNasabahId(nasabahId: string) {
    const result = await this.drizzle.db
      .select()
      .from(wallet)
      .where(eq(wallet.nasabahId, nasabahId))
      .limit(1);

    return result.length ? result[0] : null;
  }

  async createOrUpdateWallet(nasabahId: string, balance: number) {
    const existingWallet = await this.findWalletByNasabahId(nasabahId);

    if (existingWallet) {
      // Update existing wallet
      const result = await this.drizzle.db
        .update(wallet)
        .set({
          balance: balance.toString(),
          updatedAt: new Date(),
        })
        .where(eq(wallet.id, existingWallet.id))
        .returning();

      return result[0];
    } else {
      // Create new wallet
      const result = await this.drizzle.db
        .insert(wallet)
        .values({
          nasabahId,
          balance: balance.toString(),
          isActive: '1',
        })
        .returning();

      return result[0];
    }
  }

  async addWalletTransaction(transaction: Omit<WalletTransaction, 'id' | 'createdAt'>) {
    const result = await this.drizzle.db
      .insert(walletTransaction)
      .values({
        walletId: transaction.walletId,
        amount: transaction.amount.toString(),
        transactionType: transaction.transactionType,
        notes: transaction.notes,
        referenceId: transaction.referenceId,
        status: transaction.status,
        bankSampahId: transaction.bankSampahId,
      })
      .returning();

    return result[0];
  }

  async getWalletTransactionsByWalletId(walletId: string) {
    return this.drizzle.db
      .select()
      .from(walletTransaction)
      .where(eq(walletTransaction.walletId, walletId))
      .orderBy(walletTransaction.createdAt);
  }
}
