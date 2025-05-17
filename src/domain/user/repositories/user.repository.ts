import { Injectable } from '@nestjs/common';
import { eq, or } from 'drizzle-orm';
import { DrizzleService } from '../../../infrastructure/database/drizzle/drizzle.service';
import {
  users,
  nasabah,
  bankSampah,
  hargaBankSampah
} from '../../../infrastructure/database/drizzle/schema';
import { User } from '../entities/user.entity';
import { BankSampah } from '../entities/bank-sampah.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!result.length) return null;

    // Konversi explisit tipe data numeric -> number
    const user = {
      ...result[0],
      isVerified: typeof result[0].isVerified === 'string'
        ? parseInt(result[0].isVerified)
        : result[0].isVerified,
      isActive: typeof result[0].isActive === 'string'
        ? parseInt(result[0].isActive)
        : result[0].isActive,
    };

    return user as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!result.length) return null;

    // Konversi explisit tipe data
    const user = {
      ...result[0],
      isVerified: typeof result[0].isVerified === 'string'
        ? parseInt(result[0].isVerified)
        : result[0].isVerified,
      isActive: typeof result[0].isActive === 'string'
        ? parseInt(result[0].isActive)
        : result[0].isActive,
    };

    return user as User;
  }

  async findByPhone(phone: string): Promise<User | null> {
    // Normalisasi nomor telepon: hapus semua karakter non-digit
    const normalizedPhone: string = phone.replace(/\D/g, '');

    // Buat array kemungkinan format nomor telepon (tanpa format +62)
    const possibleFormats: string[] = [
      phone, // Format asli
      normalizedPhone, // Hanya digit
    ];

    // Untuk format nomor Indonesia
    if (normalizedPhone.startsWith('0')) {
      // Jika diawali 0, tambahkan format dengan kode negara (tanpa +)
      possibleFormats.push(`62${normalizedPhone.substring(1)}`);
    } else if (normalizedPhone.startsWith('62')) {
      // Tidak perlu menambahkan format tambahan, sudah benar
    } else if (normalizedPhone.length >= 9) {
      // Coba format dengan awalan kode negara (tanpa +)
      possibleFormats.push(`62${normalizedPhone}`);
    }

    // Buat kondisi OR untuk semua format
    const conditions = possibleFormats.map((format) => eq(users.phone, format));

    const result = await this.drizzle.db
      .select()
      .from(users)
      .where(or(...conditions))
      .limit(1);

    if (!result.length) return null;

    // Konversi explisit tipe data
    const user = {
      ...result[0],
      isVerified: typeof result[0].isVerified === 'string'
        ? parseInt(result[0].isVerified)
        : result[0].isVerified,
      isActive: typeof result[0].isActive === 'string'
        ? parseInt(result[0].isActive)
        : result[0].isActive,
    };

    return user as User;
  }

  async findByEmailOrPhone(phoneOrEmail: string): Promise<User | null> {
    // Coba cari berdasarkan nomor telepon terlebih dahulu
    const userByPhone = await this.findByPhone(phoneOrEmail);
    if (userByPhone) return userByPhone;

    // Jika tidak ditemukan, coba cari berdasarkan email
    return this.findByEmail(phoneOrEmail);
  }

  async createUser(userData: {
    email: string;
    phone: string;
    password: string;
    role: 'nasabah' | 'bank_sampah' | 'pengelola' | 'pemerintah';
    isVerified?: number;
    isActive?: number;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const [createdUser] = await this.drizzle.db
      .insert(users)
      .values({
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        role: userData.role,
        isVerified: userData.isVerified !== undefined
          ? userData.isVerified.toString()
          : '0',
        isActive: userData.isActive !== undefined
          ? userData.isActive.toString()
          : '1',
      })
      .returning();

    const user = {
      ...createdUser,
      isVerified: typeof createdUser.isVerified === 'string'
        ? parseInt(createdUser.isVerified)
        : createdUser.isVerified,
      isActive: typeof createdUser.isActive === 'string'
        ? parseInt(createdUser.isActive)
        : createdUser.isActive,
    };

    return user as User;
  }

  async createNasabah(nasabahData: {
    id: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    address?: string;
  }): Promise<any> {
    const [createdNasabah] = await this.drizzle.db
      .insert(nasabah)
      .values(nasabahData)
      .returning();

    return createdNasabah;
  }

  async updateUserAddress(
    userId: string,
    addressData: {
      province: string;
      city: string;
      district: string;
      address: string;
    },
  ): Promise<any> {
    const [updated] = await this.drizzle.db
      .update(nasabah)
      .set({ address: JSON.stringify(addressData) })
      .where(eq(nasabah.id, userId))
      .returning();

    return updated;
  }

  async verifyUser(userId: string): Promise<any> {
    const [updated] = await this.drizzle.db
      .update(users)
      .set({ isVerified: '1' }) // Gunakan string karena schema mendefinisikan sebagai numeric
      .where(eq(users.id, userId))
      .returning();

    return updated;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.drizzle.db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, userId));
  }

  async findNasabahById(userId: string): Promise<Record<string, any> | null> {
    const result = await this.drizzle.db
      .select()
      .from(nasabah)
      .where(eq(nasabah.id, userId))
      .limit(1);

    if (!result.length) return null;

    return result[0];
  }

  async createWasteBank(wasteBankData: {
    id: string;
    name: string;
    businessLicense: string;
    address: string;
    latitude?: number;
    longitude?: number;
    maxCapacity: number;
    operationalHours?: string;
    pickupService: boolean;
    pickupRadius?: number;
    description?: string;
  }): Promise<BankSampah> {
    const [createdWasteBank] = await this.drizzle.db
      .insert(bankSampah)
      .values({
        id: wasteBankData.id,
        name: wasteBankData.name,
        businessLicense: wasteBankData.businessLicense,
        address: wasteBankData.address,
        latitude: wasteBankData.latitude?.toString(),
        longitude: wasteBankData.longitude?.toString(),
        maxCapacity: wasteBankData.maxCapacity.toString(),
        operationalHours: wasteBankData.operationalHours,
        pickupService: wasteBankData.pickupService ? '1' : '0',
        pickupRadius: wasteBankData.pickupRadius?.toString(),
        description: wasteBankData.description,
      })
      .returning();

    return createdWasteBank as unknown as BankSampah;
  }

  async setWasteBankPrices(
    wasteBankId: string,
    pricesList: Array<{ kategoriSampahId: string; buyPrice: number }>,
  ): Promise<any[]> {
    // Menyimpan daftar harga untuk jenis sampah yang ditampung
    const pricesPromises = pricesList.map(async (priceItem) => {
      return this.drizzle.db
        .insert(hargaBankSampah)
        .values({
          bankSampahId: wasteBankId,
          kategoriSampahId: priceItem.kategoriSampahId,
          buyPrice: priceItem.buyPrice.toString(),
          isActive: '1',
        })
        .returning();
    });

    const results = await Promise.all(pricesPromises);
    return results.map((result) => result[0]);
  }

  async findWasteBankById(wasteBankId: string): Promise<BankSampah | null> {
    const result = await this.drizzle.db
      .select()
      .from(bankSampah)
      .where(eq(bankSampah.id, wasteBankId))
      .limit(1);

    if (!result.length) return null;

    return result[0] as unknown as BankSampah;
  }

  async getWasteBankPrices(wasteBankId: string): Promise<any[]> {
    const result = await this.drizzle.db
      .select()
      .from(hargaBankSampah)
      .where(eq(hargaBankSampah.bankSampahId, wasteBankId));

    return result;
  }
}
