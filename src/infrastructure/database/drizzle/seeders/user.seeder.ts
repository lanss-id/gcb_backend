import { DrizzleService } from '../drizzle.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt'; // default hash dari NestJS
import { sql } from 'drizzle-orm';

export async function seedUsers(drizzleService: DrizzleService) {
  try {
    console.log('Starting user seeding...');

    // Periksa enum role yang valid di database
    const enumResult = await drizzleService.db.execute(sql`
      SELECT enumlabel
      FROM pg_enum
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
      WHERE pg_type.typname = 'role'
      ORDER BY enumsortorder
    `);

    // Tampilkan enum role yang valid untuk membantu debugging
    const validRoles: string[] = [];
    if (Array.isArray(enumResult)) {
      for (const row of enumResult) {
        if (row && typeof row === 'object' && 'enumlabel' in row) {
          validRoles.push(row.enumlabel as string);
        }
      }
    }
    console.log('Valid roles in database:', validRoles);

    // Definisikan data user untuk dimasukkan ke database
    const userData = [
      {
        id: uuidv4(),
        email: 'nasauramecca@gmail.com',
        phone: '081234567890',
        password: bcrypt.hashSync('password123', 10),
        role: 'nasabah',
        isVerified: '1',
        isActive: '1',
        firstName: 'Nasauramecca',
        lastName: 'Nour Haqqanshah',
        address: 'Jl. Moch. Yunus No.53, RT.07/RW.08, Pasir Kaliki, Cicendo, Bandung',
        profilePhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
      {
        id: uuidv4(),
        email: 'aulia.rahman@gmail.com',
        phone: '081234567891',
        password: bcrypt.hashSync('password123', 10),
        role: 'nasabah',
        isVerified: '1',
        isActive: '1',
        firstName: 'Aulia',
        lastName: 'Rahman',
        address: 'Jl. Sudirman No.123, RT.01/RW.02, Kuningan, Jakarta',
        profilePhoto: 'https://randomuser.me/api/portraits/men/33.jpg',
      },
      {
        id: uuidv4(),
        email: 'siti.nurhaliza@gmail.com',
        phone: '081234567892',
        password: bcrypt.hashSync('password123', 10),
        role: 'nasabah',
        isVerified: '1',
        isActive: '1',
        firstName: 'Siti',
        lastName: 'Nurhaliza',
        address: 'Jl. Gatot Subroto No.45, RT.03/RW.04, Senayan, Jakarta',
        profilePhoto: 'https://randomuser.me/api/portraits/women/34.jpg',
      },
      {
        id: uuidv4(),
        email: 'budi.santoso@gmail.com',
        phone: '081234567893',
        password: bcrypt.hashSync('password123', 10),
        role: 'nasabah',
        isVerified: '1',
        isActive: '1',
        firstName: 'Budi',
        lastName: 'Santoso',
        address: 'Jl. Ahmad Yani No.78, RT.05/RW.06, Cikarang, Bekasi',
        profilePhoto: 'https://randomuser.me/api/portraits/men/35.jpg',
      },
      {
        id: uuidv4(),
        email: 'dewi.lestari@gmail.com',
        phone: '081234567894',
        password: bcrypt.hashSync('password123', 10),
        role: 'nasabah',
        isVerified: '1',
        isActive: '1',
        firstName: 'Dewi',
        lastName: 'Lestari',
        address: 'Jl. Raya Cikarang No.90, RT.07/RW.08, Cikarang, Bekasi',
        profilePhoto: 'https://randomuser.me/api/portraits/women/36.jpg',
      },
      {
        id: uuidv4(),
        email: 'rizky.maulana@gmail.com',
        phone: '081234567895',
        password: bcrypt.hashSync('password123', 10),
        role: 'nasabah',
        isVerified: '1',
        isActive: '1',
        firstName: 'Rizky',
        lastName: 'Maulana',
        address: 'Jl. Ahmad Yani No.112, RT.09/RW.10, Cikarang, Bekasi',
        profilePhoto: 'https://randomuser.me/api/portraits/men/37.jpg',
      },
      {
        id: uuidv4(),
        email: 'putri.ayu@gmail.com',
        phone: '081234567896',
        password: bcrypt.hashSync('password123', 10),
        role: 'nasabah',
        isVerified: '1',
        isActive: '1',
        firstName: 'Putri',
        lastName: 'Ayu',
        address: 'Jl. Raya Cikarang No.134, RT.11/RW.12, Cikarang, Bekasi',
        profilePhoto: 'https://randomuser.me/api/portraits/women/38.jpg',
      },
      {
        id: uuidv4(),
        email: 'fajar.pratama@gmail.com',
        phone: '081234567897',
        password: bcrypt.hashSync('password123', 10),
        role: 'nasabah',
        isVerified: '1',
        isActive: '1',
        firstName: 'Fajar',
        lastName: 'Pratama',
        address: 'Jl. Ahmad Yani No.156, RT.13/RW.14, Cikarang, Bekasi',
        profilePhoto: 'https://randomuser.me/api/portraits/men/39.jpg',
      },
      {
        id: uuidv4(),
        email: 'intan.permata@gmail.com',
        phone: '081234567898',
        password: bcrypt.hashSync('password123', 10),
        role: 'nasabah',
        isVerified: '1',
        isActive: '1',
        firstName: 'Intan',
        lastName: 'Permata',
        address: 'Jl. Raya Cikarang No.178, RT.15/RW.16, Cikarang, Bekasi',
        profilePhoto: 'https://randomuser.me/api/portraits/women/40.jpg',
      },
      {
        id: uuidv4(),
        email: 'galih.saputra@gmail.com',
        phone: '081234567899',
        password: bcrypt.hashSync('password123', 10),
        role: 'nasabah',
        isVerified: '1',
        isActive: '1',
        firstName: 'Galih',
        lastName: 'Saputra',
        address: 'Jl. Raya Cikarang No.190, RT.17/RW.18, Cikarang, Bekasi',
        profilePhoto: 'https://randomuser.me/api/portraits/men/41.jpg',
      },
    ];

    // Tambahkan data user pemerintah dan bank_sampah hanya jika enum role support nilai-nilai ini
    if (validRoles.includes('bank_sampah')) {
      userData.push({
        id: uuidv4(),
        email: 'banksampah1@gmail.com',
        phone: '081234567800',
        password: bcrypt.hashSync('password123', 10),
        role: 'bank_sampah',
        isVerified: '1',
        isActive: '1',
        firstName: 'Bank',
        lastName: 'Sampah 1',
        address: 'Jl. Bank Sampah No.1, Bandung',
        profilePhoto: 'https://randomuser.me/api/portraits/men/50.jpg',
      });
    }

    if (validRoles.includes('pemerintah')) {
      userData.push({
        id: uuidv4(),
        email: 'pemerintah1@gmail.com',
        phone: '081234567801',
        password: bcrypt.hashSync('password123', 10),
        role: 'pemerintah',
        isVerified: '1',
        isActive: '1',
        firstName: 'Pemerintah',
        lastName: 'Kota Bandung',
        address: 'Jl. Pemkot No.1, Bandung',
        profilePhoto: 'https://randomuser.me/api/portraits/men/51.jpg',
      });
    }

    if (validRoles.includes('pengelola')) {
      userData.push({
        id: uuidv4(),
        email: 'pengelola1@gmail.com',
        phone: '081234567802',
        password: bcrypt.hashSync('password123', 10),
        role: 'pengelola',
        isVerified: '1',
        isActive: '1',
        firstName: 'Pengelola',
        lastName: 'Sampah',
        address: 'Jl. Pengelola No.1, Bandung',
        profilePhoto: 'https://randomuser.me/api/portraits/men/52.jpg',
      });
    }

    // Insert users menggunakan raw SQL untuk menghindari masalah enum
    let insertedCount = 0;
    for (const user of userData) {
      try {
        // Cek apakah role valid sebelum insert
        if (!validRoles.includes(user.role)) {
          console.log(`Skipping user ${user.email} with invalid role: ${user.role}`);
          continue;
        }

        // Insert user menggunakan raw SQL tanpa typecast
        await drizzleService.db.execute(sql`
          INSERT INTO users (
            id, email, phone, password, role,
            is_verified, is_active, created_at, updated_at
          )
          VALUES (
            ${user.id}, ${user.email}, ${user.phone},
            ${user.password}, ${user.role},
            ${user.isVerified}, ${user.isActive},
            NOW(), NOW()
          )
          ON CONFLICT (email) DO NOTHING
        `);

        insertedCount++;

        // Insert data nasabah jika role adalah nasabah
        if (user.role === 'nasabah') {
          await drizzleService.db.execute(sql`
            INSERT INTO nasabah (
              id, first_name, last_name, address,
              profile_photo, total_waste_sold, points
            )
            VALUES (
              ${user.id}, ${user.firstName}, ${user.lastName},
              ${user.address}, ${user.profilePhoto}, '0', '0'
            )
            ON CONFLICT (id) DO NOTHING
          `);
        }
      } catch (err) {
        console.error(`Error inserting user ${user.email}:`, err);
      }
    }

    console.log(`User seeding selesai! Inserted ${insertedCount} users.`);
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}
