// src/shared/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method;
    const originalUrl = req.originalUrl;
    const body = req.body;
    const headers = req.headers;
    const ip = req.ip;

    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    this.logger.log(`Request ${method} ${originalUrl}`, {
      body: this.sanitizeBody(body),
      userAgent,
      ip,
    });

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const responseTime = Date.now() - startTime;

          this.logger.log(`Response ${method} ${originalUrl}`, {
            responseTime,
            responseSize: JSON.stringify(data)?.length || 0,
          });
        },
        error: (error: any) => {
          const responseTime = Date.now() - startTime;

          this.logger.error(`Error ${method} ${originalUrl}`, error.stack, {
            responseTime,
          });
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) {
      return {};
    }

    const sanitized = { ...body };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret'];
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***';
      }
    }

    return sanitized;
  }
}
