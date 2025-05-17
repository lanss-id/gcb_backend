export class User {
  id: string;
  email: string;
  phone: string;
  password: string;
  role: 'nasabah' | 'bank_sampah' | 'pengelola' | 'pemerintah';
  isVerified: number;
  isActive: number;
  deviceFingerprint?: string;
  notificationSettings?: string;
  fcmToken?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}
