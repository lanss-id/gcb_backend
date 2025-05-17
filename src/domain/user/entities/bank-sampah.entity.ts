export class BankSampah {
  id: string;
  name: string;
  businessLicense: string;
  businessLicensePhoto?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  maxCapacity: number;
  currentCapacity?: number;
  operationalHours?: string;
  pickupService: boolean;
  pickupRadius?: number;
  verificationLevel?: string;
  description?: string;
  profilePhoto?: string;
  rating?: number;
  cashPaymentEnabled?: boolean;
  digitalPaymentEnabled?: boolean;
}

export class WasteBankPrice {
  id: string;
  bankSampahId: string;
  kategoriSampahId: string;
  buyPrice: number;
  updatedAt: Date;
  isActive: boolean;
}
