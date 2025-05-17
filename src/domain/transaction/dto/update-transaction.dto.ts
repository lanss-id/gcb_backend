import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, ValidateNested, Min, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTransactionDetailDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsUUID()
  wasteTypeId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'completed', 'cancelled'])
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(['cash', 'digital_wallet', 'bank_transfer', 'balance', 'voucher'])
  paymentMethod?: 'cash' | 'digital_wallet' | 'bank_transfer' | 'balance' | 'voucher';

  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed'])
  paymentStatus?: 'pending' | 'completed' | 'failed';

  @IsOptional()
  @IsString()
  paymentDetails?: string;

  @IsOptional()
  @IsNumber()
  customerConfirmation?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTransactionDetailDto)
  details?: UpdateTransactionDetailDto[];
}
