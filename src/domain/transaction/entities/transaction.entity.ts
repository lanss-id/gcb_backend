export class Transaction {
  id: string;
  nasabahId: string;
  bankSampahId: string;
  totalAmount: number;
  totalWeight: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  pointsEarned: number;
  paymentMethod: 'cash' | 'digital_wallet' | 'bank_transfer' | 'balance' | 'voucher';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentDetails?: string;
  paymentConfirmedBy?: string;
  paymentConfirmedAt?: Date;
  customerConfirmation: number;
  customerConfirmedAt?: Date;
}

export class TransactionDetail {
  id: string;
  transactionId: string;
  wasteTypeId: string;
  weight: number;
  pricePerUnit: number;
  subtotal: number;
  notes?: string;
}
