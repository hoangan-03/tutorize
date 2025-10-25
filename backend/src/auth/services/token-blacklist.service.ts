import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service để quản lý token blacklist (các token đã bị thu hồi)
 * Sử dụng in-memory cache để performance cao
 *
 * Trong production, nên migrate sang Redis để scale tốt hơn
 */
@Injectable()
export class TokenBlacklistService {
  // In-memory Set để lưu các token đã bị revoke
  private readonly blacklistedTokens = new Set<string>();

  // Map để lưu thời gian expire của mỗi token
  private readonly tokenExpiry = new Map<string, number>();

  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(private configService: ConfigService) {
    // Cleanup expired tokens mỗi giờ
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredTokens();
      },
      60 * 60 * 1000,
    ); // 1 hour
  }

  /**
   * Thêm token vào blacklist
   * @param token JWT token cần blacklist
   * @param expiresIn Thời gian token sẽ expire (milliseconds)
   */
  addToBlacklist(token: string, expiresIn: number): void {
    this.blacklistedTokens.add(token);
    const expiryTime = Date.now() + expiresIn;
    this.tokenExpiry.set(token, expiryTime);
  }

  /**
   * Kiểm tra xem token có bị blacklist không
   * @param token JWT token cần kiểm tra
   * @returns true nếu token bị blacklist
   */
  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Xóa các token đã expire khỏi blacklist để tiết kiệm memory
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    const expiredTokens: string[] = [];

    // Tìm các token đã expire
    this.tokenExpiry.forEach((expiryTime, token) => {
      if (expiryTime < now) {
        expiredTokens.push(token);
      }
    });

    // Xóa expired tokens
    expiredTokens.forEach((token) => {
      this.blacklistedTokens.delete(token);
      this.tokenExpiry.delete(token);
    });

    if (expiredTokens.length > 0) {
      console.log(
        `[TokenBlacklist] Cleaned up ${expiredTokens.length} expired tokens`,
      );
    }
  }

  /**
   * Lấy số lượng token đang bị blacklist
   * Hữu ích cho monitoring và debugging
   */
  getBlacklistSize(): number {
    return this.blacklistedTokens.size;
  }

  /**
   * Clear toàn bộ blacklist (chỉ dùng cho testing)
   */
  clearBlacklist(): void {
    this.blacklistedTokens.clear();
    this.tokenExpiry.clear();
  }

  /**
   * Cleanup khi service bị destroy
   */
  onModuleDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
