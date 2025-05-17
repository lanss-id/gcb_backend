import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionRepository } from './repositories/transaction.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction, TransactionDetail } from './entities/transaction.entity';
import { DrizzleService } from '../../infrastructure/database/drizzle/drizzle.service';
import { kategoriSampah } from '../../infrastructure/database/drizzle/schema';
import { KategoriSampahDto } from './dto/kategori-sampah.dto';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly drizzleService: DrizzleService
  ) {}

  async createTransaction(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionRepository.createTransaction(createTransactionDto);
  }

  async findTransactionById(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException(`Transaksi dengan ID ${id} tidak ditemukan`);
    }

    return transaction;
  }

  async findTransactionDetails(transactionId: string): Promise<TransactionDetail[]> {
    const transaction = await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      throw new NotFoundException(`Transaksi dengan ID ${transactionId} tidak ditemukan`);
    }

    return this.transactionRepository.getTransactionDetails(transactionId);
  }

  async findTransactionsByNasabahId(nasabahId: string, limit?: number, offset?: number): Promise<Transaction[]> {
    return this.transactionRepository.findByNasabahId(nasabahId, limit, offset);
  }

  async findTransactionsByBankSampahId(bankSampahId: string, limit?: number, offset?: number): Promise<Transaction[]> {
    return this.transactionRepository.findByBankSampahId(bankSampahId, limit, offset);
  }

  async updateTransaction(id: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException(`Transaksi dengan ID ${id} tidak ditemukan`);
    }

    const updatedTransaction = await this.transactionRepository.updateTransaction(id, updateTransactionDto);

    if (!updatedTransaction) {
      throw new NotFoundException(`Gagal mengupdate transaksi dengan ID ${id}`);
    }

    return updatedTransaction;
  }

  async confirmTransaction(id: string): Promise<Transaction> {
    return this.updateTransaction(id, {
      status: 'confirmed',
      paymentStatus: 'completed'
    });
  }

  async completeTransaction(id: string): Promise<Transaction> {
    return this.updateTransaction(id, {
      status: 'completed'
    });
  }

  async cancelTransaction(id: string): Promise<Transaction> {
    return this.updateTransaction(id, {
      status: 'cancelled',
      paymentStatus: 'failed'
    });
  }

  async customerConfirmTransaction(id: string): Promise<Transaction> {
    return this.updateTransaction(id, {
      customerConfirmation: 1
    });
  }

  async getKategoriSampah(): Promise<KategoriSampahDto[]> {
    const result = await this.drizzleService.db
      .select()
      .from(kategoriSampah)
      .where(eq(kategoriSampah.isActive, '1'));

    return result.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || undefined,
      unit: item.unit,
      imageUrl: item.imageUrl || undefined,
    }));
  }

  async getKategoriSampahById(id: string): Promise<KategoriSampahDto | null> {
    const [result] = await this.drizzleService.db
      .select()
      .from(kategoriSampah)
      .where(and(
        eq(kategoriSampah.id, id),
        eq(kategoriSampah.isActive, '1')
      ))
      .limit(1);

    if (!result) return null;

    return {
      id: result.id,
      name: result.name,
      description: result.description || undefined,
      unit: result.unit,
      imageUrl: result.imageUrl || undefined,
    };
  }
}
