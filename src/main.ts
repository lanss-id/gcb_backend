// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sentry initialization
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    });
  }

  // Set global prefix dan versioning untuk API
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI, // /api/v1/users
  });

  // Security middleware
  app.use(helmet());

  // Konfigurasi CORS yang lebih lengkap
  app.enableCors({
    origin: [
      'http://localhost:3000',
      process.env.FRONTEND_URL,
      'https://gcb-frontend.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 jam untuk cache preflight request
  });

  // Validasi
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger dokumentasi
  const config = new DocumentBuilder()
    .setTitle('GreenCycleBank API')
    .setDescription('API untuk aplikasi manajemen bank sampah GreenCycleBank')
    .setVersion('1.0')
    .addTag('waste-management')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Health check endpoint untuk Koyeb
  app.getHttpAdapter().get('/api/health', (req: any, res: any) => {
    return res.status(200).json({ status: 'ok' });
  });

  // Start server
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);

  // Log environment variables untuk debugging
  console.log('==== ENVIRONMENT VARIABLES ====');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Tersedia' : 'TIDAK TERSEDIA');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'TIDAK TERSEDIA');
  console.log('PORT:', process.env.PORT || 'TIDAK TERSEDIA');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'TIDAK TERSEDIA');
  console.log('SENTRY_DSN:', process.env.SENTRY_DSN ? 'Tersedia' : 'TIDAK TERSEDIA');
  console.log('================================');
}

bootstrap();
