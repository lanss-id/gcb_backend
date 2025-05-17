// Placeholder jwt-auth.guard.ts
// Silakan isi sesuai kebutuhan guard

import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Periksa apakah route ditandai sebagai public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jika public, lewati autentikasi
    if (isPublic) {
      return true;
    }

    // Jika tidak public, lanjutkan dengan verifikasi JWT
    return super.canActivate(context);
  }
}
