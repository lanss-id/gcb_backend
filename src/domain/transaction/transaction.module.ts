import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './repositories/transaction.repository';
import { WalletRepository } from './repositories/wallet.repository';
import { QRTransactionRepository } from './repositories/qr-transaction.repository';
import { TransactionController } from '../../interface/api/v1/transaction.controller';
import { DrizzleModule } from '../../infrastructure/database/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [
    TransactionService,
    TransactionRepository,
    WalletRepository,
    QRTransactionRepository,
  ],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
