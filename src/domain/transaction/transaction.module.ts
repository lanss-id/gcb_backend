import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './repositories/transaction.repository';
import { TransactionController } from '../../interface/api/v1/transaction.controller';
import { DrizzleModule } from '../../infrastructure/database/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [TransactionService, TransactionRepository],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
