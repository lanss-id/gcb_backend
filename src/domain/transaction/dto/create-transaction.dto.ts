import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, ValidateNested, ArrayMinSize, Min, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDetailDto {
  @IsUUID()
  wasteTypeId: string;

  @IsNumber()
  @Min(0)
  weight: number;

  @IsNumber()
  @Min(0)
  pricePerUnit: number;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateTransactionDto {
  @IsUUID()
  nasabahId: string;

  @IsUUID()
  bankSampahId: string;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsNumber()
  @Min(0)
  totalWeight: number;

  @IsEnum(['pending', 'confirmed', 'completed', 'cancelled'])
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsEnum(['cash', 'digital_wallet', 'bank_transfer', 'balance', 'voucher'])
  paymentMethod: 'cash' | 'digital_wallet' | 'bank_transfer' | 'balance' | 'voucher';

  @IsNumber()
  @Min(0)
  pointsEarned: number;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateTransactionDetailDto)
  details: CreateTransactionDetailDto[];
}
