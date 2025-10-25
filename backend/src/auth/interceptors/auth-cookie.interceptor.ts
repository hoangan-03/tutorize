import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * Interceptor để set httpOnly cookies cho access token và refresh token
 *
 * Cookies này:
 * - Không thể truy cập từ JavaScript (httpOnly)
 * - Chỉ gửi qua HTTPS trong production (secure)
 * - Ngăn chặn CSRF attacks (sameSite)
 */
@Injectable()
export class AuthCookieInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse<Response>();

        // Nếu response có accessToken, set vào cookie
        if (data && data.accessToken) {
          const isProduction =
            this.configService.get<string>('NODE_ENV') === 'production';

          // Set access token cookie
          response.cookie('access_token', data.accessToken, {
            httpOnly: true, // Không thể truy cập từ JS
            secure: isProduction, // Chỉ gửi qua HTTPS trong production
            sameSite: 'strict', // Ngăn chặn CSRF
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/',
          });

          // Set refresh token cookie nếu có
          if (data.refreshToken) {
            response.cookie('refresh_token', data.refreshToken, {
              httpOnly: true,
              secure: isProduction,
              sameSite: 'strict',
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
              path: '/',
            });
          }

          // Vẫn trả về token trong response body cho backward compatibility
          // Sau khi frontend migrate hoàn toàn sang cookies, có thể xóa phần này
        }

        return data;
      }),
    );
  }
}
