export class WasteTransaction {
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
  transactionPhoto?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  digitalSignature?: string;
}

export class WasteTransactionDetail {
  id: string;
  wasteTransactionId: string;
  kategoriSampahId: string;
  kategoriSampahName?: string;
  weight: number;
  pricePerUnit: number;
  subtotal: number;
  notes?: string;
  photoUrl?: string;
}

export class WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  transactionType: 'deposit' | 'withdrawal' | 'waste_sale';
  notes?: string;
  referenceId?: string;
  createdAt: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  bankSampahId?: string;
}
