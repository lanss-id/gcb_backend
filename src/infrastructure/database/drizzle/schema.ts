// src/infrastructure/database/drizzle/schema.ts
import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Define enums
export const roleEnum = pgEnum('role', [
  'nasabah',
  'bank_sampah',
  'pengelola',
  'pemerintah',
]);
export const statusEnum = pgEnum('status', [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
]);
export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'digital_wallet',
  'bank_transfer',
  'balance',
  'voucher',
]);
export const paymentStatusEnum = pgEnum('payment_status', [
  'paid',
  'unpaid',
  'pending',
  'failed',
]);
export const verificationLevelEnum = pgEnum('verification_level', [
  'basic',
  'verified',
  'premium',
]);

// Enum untuk tipe wallet transaction
export const walletTransactionTypeEnum = pgEnum('wallet_transaction_type', [
  'deposit',
  'withdrawal',
  'waste_sale',
]);

// User tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull().unique(),
  password: text('password').notNull(),
  role: roleEnum('role').notNull(),
  isVerified: numeric('is_verified').default('0'),
  isActive: numeric('is_active').default('1'),
  deviceFingerprint: text('device_fingerprint'),
  notificationSettings: text('notification_settings'),
  fcmToken: text('fcm_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
});

export const nasabah = pgTable('nasabah', {
  id: uuid('id')
    .primaryKey()
    .references(() => users.id),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  address: text('address'),
  profilePhoto: text('profile_photo'),
  totalWasteSold: numeric('total_waste_sold').default('0'),
  points: numeric('points').default('0'),
  levelId: uuid('level_id').references(() => gamificationLevels.id),
  currentProgress: numeric('current_progress').default('0'),
  signatureUrl: text('signature_url'),
  preferredPaymentMethod: text('preferred_payment_method'),
});

// Wallet tables
export const wallet = pgTable('wallet', {
  id: uuid('id').primaryKey().defaultRandom(),
  nasabahId: uuid('nasabah_id')
    .references(() => nasabah.id)
    .notNull(),
  balance: numeric('balance').default('0').notNull(),
  isActive: numeric('is_active').default('1'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const walletTransaction = pgTable('wallet_transaction', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id')
    .references(() => wallet.id)
    .notNull(),
  amount: numeric('amount').notNull(),
  transactionType: walletTransactionTypeEnum('transaction_type').notNull(),
  notes: text('notes'),
  referenceId: uuid('reference_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  status: statusEnum('status').default('completed').notNull(),
  bankSampahId: uuid('bank_sampah_id').references(() => bankSampah.id),
});

export const bankSampah = pgTable('bank_sampah', {
  id: uuid('id')
    .primaryKey()
    .references(() => users.id),
  name: text('name').notNull(),
  businessLicense: text('business_license'),
  businessLicensePhoto: text('business_license_photo'),
  address: text('address').notNull(),
  latitude: numeric('latitude'),
  longitude: numeric('longitude'),
  maxCapacity: numeric('max_capacity').notNull(),
  currentCapacity: numeric('current_capacity').default('0'),
  operationalHours: text('operational_hours'),
  pickupService: numeric('pickup_service').default('0'),
  pickupRadius: numeric('pickup_radius'),
  verificationLevel:
    verificationLevelEnum('verification_level').default('basic'),
  description: text('description'),
  profilePhoto: text('profile_photo'),
  rating: numeric('rating').default('0'),
  cashPaymentEnabled: numeric('cash_payment_enabled').default('1'),
  digitalPaymentEnabled: numeric('digital_payment_enabled').default('1'),
});

export const pengelolaSampah = pgTable('pengelola_sampah', {
  id: uuid('id')
    .primaryKey()
    .references(() => users.id),
  companyName: text('company_name').notNull(),
  businessLicense: text('business_license'),
  address: text('address').notNull(),
  latitude: numeric('latitude'),
  longitude: numeric('longitude'),
  verificationLevel:
    verificationLevelEnum('verification_level').default('basic'),
  companyType: text('company_type').notNull(),
  description: text('description'),
  optionalDocuments: text('optional_documents'),
  profilePhoto: text('profile_photo'),
  rating: numeric('rating').default('0'),
});

export const pemerintah = pgTable('pemerintah', {
  id: uuid('id')
    .primaryKey()
    .references(() => users.id),
  institution: text('institution').notNull(),
  department: text('department').notNull(),
  position: text('position').notNull(),
  accessLevel: numeric('access_level').default('1'),
});

// Master data tables
export const kategoriSampah = pgTable('kategori_sampah', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  unit: text('unit').notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: numeric('is_active').default('1'),
});

// Price tables
export const hargaBankSampah = pgTable('harga_bank_sampah', {
  id: uuid('id').primaryKey().defaultRandom(),
  bankSampahId: uuid('bank_sampah_id')
    .references(() => bankSampah.id)
    .notNull(),
  kategoriSampahId: uuid('kategori_sampah_id')
    .references(() => kategoriSampah.id)
    .notNull(),
  buyPrice: numeric('buy_price').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: numeric('is_active').default('1'),
});

export const hargaPengelola = pgTable('harga_pengelola', {
  id: uuid('id').primaryKey().defaultRandom(),
  pengelolaId: uuid('pengelola_id')
    .references(() => pengelolaSampah.id)
    .notNull(),
  kategoriSampahId: uuid('kategori_sampah_id')
    .references(() => kategoriSampah.id)
    .notNull(),
  buyPrice: numeric('buy_price').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: numeric('is_active').default('1'),
});

// Transaction tables
export const transaksiNasabah = pgTable('transaksi_nasabah', {
  id: uuid('id').primaryKey().defaultRandom(),
  nasabahId: uuid('nasabah_id')
    .references(() => nasabah.id)
    .notNull(),
  bankSampahId: uuid('bank_sampah_id')
    .references(() => bankSampah.id)
    .notNull(),
  totalAmount: numeric('total_amount').notNull(),
  totalWeight: numeric('total_weight').notNull(),
  status: statusEnum('status').default('pending').notNull(),
  pickupAddress: text('pickup_address'),
  pickupDate: timestamp('pickup_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  confirmedAt: timestamp('confirmed_at'),
  completedAt: timestamp('completed_at'),
  pointsEarned: numeric('points_earned').default('0'),
  isOfflineSynced: numeric('is_offline_synced').default('0'),
  localId: text('local_id'),
  paymentMethod: paymentMethodEnum('payment_method').default('cash'),
  paymentStatus: paymentStatusEnum('payment_status').default('pending'),
  paymentDetails: text('payment_details'),
  paymentConfirmedBy: uuid('payment_confirmed_by'),
  paymentConfirmedAt: timestamp('payment_confirmed_at'),
  customerConfirmation: numeric('customer_confirmation').default('0'),
  customerConfirmedAt: timestamp('customer_confirmed_at'),
  transactionPhoto: text('transaction_photo'),
  locationLatitude: numeric('location_latitude'),
  locationLongitude: numeric('location_longitude'),
  digitalSignature: text('digital_signature'),
  qrCode: text('qr_code'),
  qrGeneratedAt: timestamp('qr_generated_at'),
});

export const detailTransaksiNasabah = pgTable('detail_transaksi_nasabah', {
  id: uuid('id').primaryKey().defaultRandom(),
  transaksiId: uuid('transaksi_id')
    .references(() => transaksiNasabah.id)
    .notNull(),
  kategoriSampahId: uuid('kategori_sampah_id')
    .references(() => kategoriSampah.id)
    .notNull(),
  weight: numeric('weight').notNull(),
  pricePerUnit: numeric('price_per_unit').notNull(),
  subtotal: numeric('subtotal').notNull(),
  notes: text('notes'),
  photoUrl: text('photo_url'),
  wasteTrackingId: text('waste_tracking_id'),
});

// Gamification tables
export const gamificationLevels = pgTable('gamification_levels', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  requiredPoints: numeric('required_points').notNull(),
  thresholdKg: numeric('threshold_kg').notNull(),
  iconUrl: text('icon_url'),
  benefits: text('benefits'),
});

export const rewards = pgTable('rewards', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  pointsRequired: numeric('points_required').notNull(),
  stock: numeric('stock').default('0'),
  imageUrl: text('image_url'),
  isActive: numeric('is_active').default('1'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  expiryDate: timestamp('expiry_date'),
});

export const customerRewards = pgTable('customer_rewards', {
  id: uuid('id').primaryKey().defaultRandom(),
  nasabahId: uuid('nasabah_id')
    .references(() => nasabah.id)
    .notNull(),
  rewardId: uuid('reward_id')
    .references(() => rewards.id)
    .notNull(),
  redeemCode: text('redeem_code').notNull(),
  status: text('status').notNull(),
  claimedAt: timestamp('claimed_at').defaultNow().notNull(),
  redeemedAt: timestamp('redeemed_at'),
  expiredAt: timestamp('expired_at').notNull(),
  notes: text('notes'),
});

// Notification tables
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  type: text('type').notNull(),
  isRead: numeric('is_read').default('0'),
  relatedId: text('related_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expireAt: timestamp('expire_at'),
  actionUrl: text('action_url'),
  iconUrl: text('icon_url'),
});

// Push notification subscriptions
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
});

// OTP verification
export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  phoneNumber: text('phone_number').notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
