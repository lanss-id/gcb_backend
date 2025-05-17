// Placeholder user.module.ts
// Silakan isi sesuai kebutuhan user module

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './repositories/user.repository';
import { DrizzleModule } from '../../infrastructure/database/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
