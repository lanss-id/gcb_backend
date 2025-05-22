import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class GenerateQRCodeDto {
  @IsUUID()
  nasabahId: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class ScanQRCodeDto {
  @IsString()
  qrCode: string;
}

export class QRCodeResponseDto {
  qrCode: string;
  nasabahId: string;
  expiresAt: Date;
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
}

export class QRVerificationResponseDto {
  isValid: boolean;
  nasabahId?: string;
  message?: string;
  transactionId?: string;
  userData?: UserData;
}
