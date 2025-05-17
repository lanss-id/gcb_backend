// src/interface/api/v1/auth.controller.ts
import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AuthService } from '../../../domain/auth/auth.service';
import { LoginDto } from '../../../domain/user/dto/login.dto';
import { RegisterDto } from '../../../domain/user/dto/register.dto';
import { VerifyOtpDto } from '../../../domain/user/dto/verify-otp.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SetAccountDto } from '../../../domain/user/dto/set-account.dto';
import { SetAddressDto } from '../../../domain/user/dto/set-address.dto';
import { Request as ExpressRequest } from 'express';
import { RegisterWasteBankDto } from '../../../domain/user/dto/register-waste-bank.dto';
import { SetWasteBankAccountDto } from '../../../domain/user/dto/set-waste-bank-account.dto';

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 409,
    description: 'Email or phone already registered',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register-waste-bank')
  @ApiOperation({ summary: 'Register new waste bank' })
  @ApiResponse({
    status: 201,
    description: 'Waste bank registered successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 409,
    description: 'Email or phone already registered',
  })
  async registerWasteBank(@Body() registerWasteBankDto: RegisterWasteBankDto) {
    return this.authService.registerWasteBank(registerWasteBankDto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP code' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('set-account')
  @ApiOperation({ summary: 'Set user account details' })
  @ApiResponse({ status: 200, description: 'Account details set successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async setAccount(@Body() setAccountDto: SetAccountDto) {
    return this.authService.setAccount(setAccountDto);
  }

  @Post('set-waste-bank-account')
  @ApiOperation({ summary: 'Set waste bank account details' })
  @ApiResponse({ status: 200, description: 'Account details set successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async setWasteBankAccount(
    @Body() setWasteBankAccountDto: SetWasteBankAccountDto,
  ) {
    return this.authService.setWasteBankAccount(setWasteBankAccountDto);
  }

  @Post('set-waste-bank-prices')
  @ApiOperation({ summary: 'Set waste bank prices' })
  @ApiResponse({ status: 200, description: 'Prices set successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async setWasteBankPrices(
    @Body('userId') userId: string,
    @Body('wasteTypes') wasteTypes: Array<{ kategoriSampahId: string; buyPrice: number }>,
  ) {
    return this.authService.setWasteBankPrices(userId, wasteTypes);
  }

  @Post('set-address')
  @ApiOperation({ summary: 'Set user address details' })
  @ApiResponse({ status: 200, description: 'Address details set successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async setAddress(@Body() setAddressDto: SetAddressDto) {
    return this.authService.setAddress(setAddressDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: Record<string, any>) {
    await Promise.resolve(); // Dummy await untuk memenuhi async
    return req.user;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Current user data' })
  async getCurrentUser(@Req() req: ExpressRequest) {
    // @ts-ignore - Mengabaikan tipe error karena ini ditambahkan oleh guard
    const userId = req.user?.['userId'];
    return this.authService.getUserById(userId);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Req() req: ExpressRequest) {
    await Promise.resolve(); // Dummy await untuk memenuhi async
    // Implementasi aktual logout di sisi server dapat ditambahkan di sini
    // Misalnya invalidasi token, hapus session, dll.
    // @ts-ignore - Mengabaikan tipe error karena ini ditambahkan oleh guard
    const userId = req.user?.['userId'];
    return {
      success: true,
      message: 'Logout successful',
      userId,
    };
  }
}
