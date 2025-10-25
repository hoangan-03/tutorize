import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TokenBlacklistService } from './token-blacklist.service';

describe('TokenBlacklistService', () => {
  let service: TokenBlacklistService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenBlacklistService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'NODE_ENV') return 'test';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TokenBlacklistService>(TokenBlacklistService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    // Clear blacklist after each test
    service.clearBlacklist();
    // Cleanup interval to prevent memory leaks
    service.onModuleDestroy();
  });

  describe('addToBlacklist', () => {
    it('should add token to blacklist', () => {
      const token = 'test-token-123';
      const expiresIn = 1000 * 60 * 15; // 15 minutes

      service.addToBlacklist(token, expiresIn);

      expect(service.isBlacklisted(token)).toBe(true);
    });

    it('should track blacklist size correctly', () => {
      service.addToBlacklist('token1', 1000 * 60);
      service.addToBlacklist('token2', 1000 * 60);
      service.addToBlacklist('token3', 1000 * 60);

      expect(service.getBlacklistSize()).toBe(3);
    });
  });

  describe('isBlacklisted', () => {
    it('should return true for blacklisted token', () => {
      const token = 'blacklisted-token';
      service.addToBlacklist(token, 1000 * 60);

      expect(service.isBlacklisted(token)).toBe(true);
    });

    it('should return false for non-blacklisted token', () => {
      expect(service.isBlacklisted('non-existent-token')).toBe(false);
    });

    it('should handle multiple tokens correctly', () => {
      service.addToBlacklist('token1', 1000 * 60);
      service.addToBlacklist('token2', 1000 * 60);

      expect(service.isBlacklisted('token1')).toBe(true);
      expect(service.isBlacklisted('token2')).toBe(true);
      expect(service.isBlacklisted('token3')).toBe(false);
    });
  });

  describe('clearBlacklist', () => {
    it('should clear all blacklisted tokens', () => {
      service.addToBlacklist('token1', 1000 * 60);
      service.addToBlacklist('token2', 1000 * 60);

      expect(service.getBlacklistSize()).toBe(2);

      service.clearBlacklist();

      expect(service.getBlacklistSize()).toBe(0);
      expect(service.isBlacklisted('token1')).toBe(false);
      expect(service.isBlacklisted('token2')).toBe(false);
    });
  });

  describe('getBlacklistSize', () => {
    it('should return 0 for empty blacklist', () => {
      expect(service.getBlacklistSize()).toBe(0);
    });

    it('should return correct size after adding tokens', () => {
      service.addToBlacklist('token1', 1000 * 60);
      expect(service.getBlacklistSize()).toBe(1);

      service.addToBlacklist('token2', 1000 * 60);
      expect(service.getBlacklistSize()).toBe(2);
    });
  });

  describe('memory management', () => {
    it('should not add duplicate tokens', () => {
      const token = 'duplicate-token';

      service.addToBlacklist(token, 1000 * 60);
      service.addToBlacklist(token, 1000 * 60);

      // Set will automatically handle duplicates
      expect(service.getBlacklistSize()).toBe(1);
    });

    it('should update expiry time when adding existing token', () => {
      const token = 'update-token';

      service.addToBlacklist(token, 1000); // 1 second
      service.addToBlacklist(token, 1000 * 60); // 1 minute

      // Token should still be blacklisted
      expect(service.isBlacklisted(token)).toBe(true);
    });
  });
});
