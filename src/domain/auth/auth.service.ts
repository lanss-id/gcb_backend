import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../infrastructure/database/supabase/supabase.service';
import * as bcrypt from 'bcrypt';
import { eq, and, gt } from 'drizzle-orm';

import { UserRepository } from '../user/repositories/user.repository';
import { User } from '../user/entities/user.entity';

import { RegisterDto } from '../user/dto/register.dto';
import { LoginDto } from '../user/dto/login.dto';
import { SetAccountDto } from '../user/dto/set-account.dto';
import { SetAddressDto } from '../user/dto/set-address.dto';
import { VerifyOtpDto } from '../user/dto/verify-otp.dto';
import { users, otpCodes, bankSampah } from '../../infrastructure/database/drizzle/schema';
import { DrizzleService } from '../../infrastructure/database/drizzle/drizzle.service';
import { RegisterWasteBankDto } from '../user/dto/register-waste-bank.dto';
import { SetWasteBankAccountDto } from '../user/dto/set-waste-bank-account.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
    private readonly drizzleService: DrizzleService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ id: string; message: string }> {
    // Cek apakah email sudah terdaftar
    const existingEmail = await this.userRepository.findByEmail(
      registerDto.email,
    );
    if (existingEmail) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Cek apakah nomor telepon sudah terdaftar
    const existingPhone = await this.userRepository.findByPhone(
      registerDto.phone,
    );
    if (existingPhone) {
      throw new ConflictException('Nomor telepon sudah terdaftar');
    }

    // Buat password temporari
    const temporaryPassword = 'TemporaryPassword-123!'; // Password sementara yang aman

    // Buat user baru di database
    const newUser = await this.userRepository.createUser({
      email: registerDto.email,
      phone: registerDto.phone,
      password: temporaryPassword, // Password sementara, akan diganti saat setAccount
      role: registerDto.role,
      isVerified: 0,
      isActive: 1,
    });

    // Kirim OTP
    const otp = this.generateOtp();
    await this.saveOtp(registerDto.phone, otp);

    try {
      // Sign up juga di Supabase Auth jika diperlukan
      const { error } = await this.supabaseService
        .getClient()
        .auth.signUp({
          email: registerDto.email,
          password: temporaryPassword,
          phone: registerDto.phone,
        });

      if (error) {
        throw new BadRequestException(`Supabase Auth Error: ${error.message}`);
      }
    } catch (error) {
      console.log('Supabase sign up error:', error);
      // Lanjutkan meskipun ada error, karena kita punya user di database utama
    }

    return {
      id: newUser.id,
      message: `Pendaftaran berhasil, silakan verifikasi dengan kode OTP: ${otp} yang dikirim ke nomor telepon Anda`,
    };
  }

  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ success: boolean; userId?: string }> {
    // Cek OTP dari database
    const isValid = await this.validateOtp(
      verifyOtpDto.phoneNumber,
      verifyOtpDto.otp,
    );

    if (!isValid) {
      throw new BadRequestException(
        'Kode OTP tidak valid atau sudah kadaluarsa',
      );
    }

    // Cari user berdasarkan nomor telepon
    const user = await this.userRepository.findByPhone(
      verifyOtpDto.phoneNumber,
    );
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    // Tidak perlu update isVerified sekarang, karena masih ada langkah set account dan address

    return {
      success: true,
      userId: user.id,
    };
  }

  async setAccount(
    setAccountDto: SetAccountDto,
  ): Promise<{ success: boolean; userId: string }> {
    const user = await this.userRepository.findById(setAccountDto.userId);
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    // Validasi password dan confirmPassword
    if (setAccountDto.password !== setAccountDto.confirmPassword) {
      throw new BadRequestException(
        'Password dan konfirmasi password tidak cocok',
      );
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(setAccountDto.password, 10);

    // Buat entri nasabah dengan nama dan password baru
    await this.userRepository.createNasabah({
      id: user.id,
      firstName: setAccountDto.firstName,
      lastName: setAccountDto.lastName,
      password: hashedPassword,
      confirmPassword: hashedPassword,
    });

    await this.drizzleService.db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));

    return {
      success: true,
      userId: user.id,
    };
  }

  async setAddress(
    setAddressDto: SetAddressDto,
  ): Promise<{ success: boolean }> {
    const user = await this.userRepository.findById(setAddressDto.userId);
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    // Update alamat nasabah
    await this.userRepository.updateUserAddress(user.id, {
      province: setAddressDto.province,
      city: setAddressDto.city,
      district: setAddressDto.district,
      address: setAddressDto.address,
    });

    // Setelah alamat diatur, pengguna dianggap sudah terverifikasi
    await this.userRepository.verifyUser(user.id);

    return { success: true };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: any }> {
    // Cari user berdasarkan email atau nomor telepon
    const user = await this.userRepository.findByEmailOrPhone(
      loginDto.phoneOrEmail,
    );

    if (!user) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    // Cek apakah user sudah terverifikasi
    if (user.isVerified !== 1) {
      throw new UnauthorizedException('Akun belum terverifikasi');
    }

    // Cek apakah user aktif
    if (user.isActive !== 1) {
      throw new UnauthorizedException('Akun tidak aktif');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    // Update last login
    // Tanpa try/catch karena tidak kritis untuk proses login
    await this.userRepository.updateLastLogin(user.id);

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified === 1,
      },
    };
  }

  // Helper methods
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async saveOtp(phoneNumber: string, otp: string): Promise<void> {
    // Hapus semua OTP lama untuk nomor telepon ini
    await this.drizzleService.db
      .delete(otpCodes)
      .where(eq(otpCodes.phoneNumber, phoneNumber));

    // Buat waktu kedaluwarsa 10 menit dari sekarang
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Simpan OTP baru di database
    await this.drizzleService.db.insert(otpCodes).values({
      phoneNumber,
      code: otp,
      expiresAt,
    });

    // Log untuk tujuan debugging (di lingkungan dev/test)
    console.log(`OTP for ${phoneNumber}: ${otp}`);
  }

  async validateOtp(phoneNumber: string, otp: string): Promise<boolean> {
    // Cari OTP yang valid dan belum kedaluwarsa
    const now = new Date();

    const result = await this.drizzleService.db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.phoneNumber, phoneNumber),
          eq(otpCodes.code, otp),
          gt(otpCodes.expiresAt, now),
        ),
      )
      .limit(1);

    // Jika OTP ditemukan dan valid
    if (result.length > 0) {
      // Hapus OTP setelah validasi berhasil
      await this.drizzleService.db
        .delete(otpCodes)
        .where(eq(otpCodes.id, result[0].id));

      return true;
    }

    return false;
  }

  async getUserById(userId: string): Promise<Record<string, any>> {
    if (!userId) {
      throw new UnauthorizedException('User ID tidak ditemukan');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    // Dapatkan data nasabah jika ada
    const nasabah = await this.userRepository.findNasabahById(userId);

    // Jangan kirim password dan data sensitif lainnya
    const userData = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified === 1,
      // Tambahkan data nasabah jika ada
      firstName: nasabah?.firstName || '',
      lastName: nasabah?.lastName || '',
    };

    return userData;
  }

  async registerWasteBank(
    registerWasteBankDto: RegisterWasteBankDto,
  ): Promise<{ id: string; message: string }> {
    // Cek apakah email sudah terdaftar
    const existingEmail = await this.userRepository.findByEmail(
      registerWasteBankDto.email,
    );
    if (existingEmail) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Cek apakah nomor telepon sudah terdaftar
    const existingPhone = await this.userRepository.findByPhone(
      registerWasteBankDto.phone,
    );
    if (existingPhone) {
      throw new ConflictException('Nomor telepon sudah terdaftar');
    }

    // Buat password temporari
    const temporaryPassword = 'TemporaryPassword-123!'; // Password sementara yang aman

    // Buat user baru di database dengan role bank_sampah
    const newUser = await this.userRepository.createUser({
      email: registerWasteBankDto.email,
      phone: registerWasteBankDto.phone,
      password: temporaryPassword, // Password sementara, akan diganti saat setAccount
      role: 'bank_sampah',
      isVerified: 0,
      isActive: 1,
    });

    // Simpan data bank sampah dasar
    await this.userRepository.createWasteBank({
      id: newUser.id,
      name: registerWasteBankDto.name,
      businessLicense: '', // Akan diisi nanti
      address: registerWasteBankDto.address,
      latitude: registerWasteBankDto.latitude,
      longitude: registerWasteBankDto.longitude,
      maxCapacity: registerWasteBankDto.maxCapacity,
      operationalHours: registerWasteBankDto.operationalHours,
      pickupService: registerWasteBankDto.pickupService,
      pickupRadius: registerWasteBankDto.pickupRadius,
      description: registerWasteBankDto.description,
    });

    // Kirim OTP
    const otp = this.generateOtp();
    await this.saveOtp(registerWasteBankDto.phone, otp);

    try {
      // Sign up juga di Supabase Auth jika diperlukan
      const { error } = await this.supabaseService
        .getClient()
        .auth.signUp({
          email: registerWasteBankDto.email,
          password: temporaryPassword,
          phone: registerWasteBankDto.phone,
        });

      if (error) {
        throw new BadRequestException(`Supabase Auth Error: ${error.message}`);
      }
    } catch (error) {
      console.log('Supabase sign up error:', error);
      // Lanjutkan meskipun ada error, karena kita punya user di database utama
    }

    return {
      id: newUser.id,
      message: `Pendaftaran bank sampah berhasil, silakan verifikasi dengan kode OTP: ${otp} yang dikirim ke nomor telepon Anda`,
    };
  }

  async setWasteBankAccount(
    setWasteBankAccountDto: SetWasteBankAccountDto,
  ): Promise<{ success: boolean; userId: string }> {
    const user = await this.userRepository.findById(
      setWasteBankAccountDto.userId,
    );
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    // Validasi bahwa ini adalah bank sampah
    if (user.role !== 'bank_sampah') {
      throw new BadRequestException('Pengguna bukan bank sampah');
    }

    // Validasi password dan confirmPassword
    if (
      setWasteBankAccountDto.password !== setWasteBankAccountDto.confirmPassword
    ) {
      throw new BadRequestException(
        'Password dan konfirmasi password tidak cocok',
      );
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(
      setWasteBankAccountDto.password,
      10,
    );

    // Update password user
    await this.drizzleService.db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));

    // Update informasi lisensi bisnis
    await this.drizzleService.db
      .update(bankSampah)
      .set({ businessLicense: setWasteBankAccountDto.businessLicense })
      .where(eq(bankSampah.id, user.id));

    return {
      success: true,
      userId: user.id,
    };
  }

  async setWasteBankPrices(
    userId: string,
    wasteTypes: Array<{ kategoriSampahId: string; buyPrice: number }>,
  ): Promise<{ success: boolean }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    // Validasi bahwa ini adalah bank sampah
    if (user.role !== 'bank_sampah') {
      throw new BadRequestException('Pengguna bukan bank sampah');
    }

    // Simpan harga-harga sampah
    await this.userRepository.setWasteBankPrices(userId, wasteTypes);

    // Setelah harga diatur, pengguna dianggap sudah terverifikasi
    await this.userRepository.verifyUser(userId);

    return { success: true };
  }
}
