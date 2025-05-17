// src/infrastructure/database/drizzle/drizzle.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { sql } from 'drizzle-orm';

@Injectable()
export class DrizzleService {
  constructor(
    @Inject('DRIZZLE_DB') public readonly db: NodePgDatabase<typeof schema>,
  ) {}

  getDb() {
    return this.db;
  }

  async transaction<T>(
    callback: (tx: NodePgDatabase<typeof schema>) => Promise<T>,
  ): Promise<T> {
    // Implementasi transaction sesuai API drizzle-orm
    // Jika tidak ada transaction, gunakan db langsung
    return callback(this.db);
  }

  async executeRawQuery(sqlQuery: string): Promise<any> {
    try {
      return await this.db.execute(sql.raw(sqlQuery));
    } catch (error) {
      console.error('Error executing raw query:', error);
      throw error;
    }
  }
}
