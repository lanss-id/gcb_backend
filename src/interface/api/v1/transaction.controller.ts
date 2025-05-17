import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { TransactionService } from '../../../domain/transaction/transaction.service';
import { CreateTransactionDto } from '../../../domain/transaction/dto/create-transaction.dto';
import { UpdateTransactionDto } from '../../../domain/transaction/dto/update-transaction.dto';
import { Public } from '../../../shared/decorators/public.decorator';

@ApiTags('transactions')
@Controller({
  path: 'transactions',
  version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Public()
  @Get('kategori-sampah')
  @ApiOperation({ summary: 'Get all kategori sampah' })
  @ApiResponse({ status: 200, description: 'List of kategori sampah' })
  async getKategoriSampah() {
    return this.transactionService.getKategoriSampah();
  }

  @Public()
  @Get('kategori-sampah/:id')
  @ApiOperation({ summary: 'Get kategori sampah by ID' })
  @ApiResponse({ status: 200, description: 'Kategori sampah found' })
  @ApiResponse({ status: 404, description: 'Kategori sampah not found' })
  async getKategoriSampahById(@Param('id') id: string) {
    const kategori = await this.transactionService.getKategoriSampahById(id);
    if (!kategori) {
      throw new NotFoundException(`Kategori sampah not found`);
    }
    return kategori;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    return this.transactionService.createTransaction(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions for the current user' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  async findAllTransactions(
    @Request() req,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'nasabah') {
      return this.transactionService.findTransactionsByNasabahId(userId, limit, offset);
    } else if (userRole === 'bank_sampah') {
      return this.transactionService.findTransactionsByBankSampahId(userId, limit, offset);
    }

    // Admin roles can see everything (future implementation)
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction found' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findTransactionById(@Param('id') id: string) {
    return this.transactionService.findTransactionById(id);
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Get transaction details by ID' })
  @ApiResponse({ status: 200, description: 'Transaction details found' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findTransactionDetails(@Param('id') id: string) {
    return this.transactionService.findTransactionDetails(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction updated' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async updateTransaction(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionService.updateTransaction(id, updateTransactionDto);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm transaction' })
  @ApiResponse({ status: 200, description: 'Transaction confirmed' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async confirmTransaction(@Param('id') id: string) {
    return this.transactionService.confirmTransaction(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete transaction' })
  @ApiResponse({ status: 200, description: 'Transaction completed' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async completeTransaction(@Param('id') id: string) {
    return this.transactionService.completeTransaction(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel transaction' })
  @ApiResponse({ status: 200, description: 'Transaction cancelled' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async cancelTransaction(@Param('id') id: string) {
    return this.transactionService.cancelTransaction(id);
  }

  @Patch(':id/customer-confirm')
  @ApiOperation({ summary: 'Customer confirms transaction' })
  @ApiResponse({ status: 200, description: 'Transaction confirmed by customer' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async customerConfirmTransaction(@Param('id') id: string) {
    return this.transactionService.customerConfirmTransaction(id);
  }
}
