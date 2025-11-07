import { describe, it, expect, beforeEach } from 'vitest';
import { generateToken, verifyToken, hashPassword, comparePassword } from '@/lib/auth';
import jwt from 'jsonwebtoken';

describe('Auth Utilities', () => {
  const testPayload = {
    userId: 'user123',
    companyId: 'company123',
    role: 'REQUESTER' as const,
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include correct payload data', () => {
      const token = generateToken(testPayload);
      const decoded = jwt.decode(token) as any;

      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.companyId).toBe(testPayload.companyId);
      expect(decoded.role).toBe(testPayload.role);
    });

    it('should set expiration time', () => {
      const token = generateToken(testPayload);
      const decoded = jwt.decode(token) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(testPayload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(testPayload.userId);
      expect(decoded?.companyId).toBe(testPayload.companyId);
      expect(decoded?.role).toBe(testPayload.role);
    });

    it('should return null for invalid token', () => {
      const decoded = verifyToken('invalid.token.here');

      expect(decoded).toBeNull();
    });

    it('should return null for expired token', () => {
      // Create token that expires immediately
      const expiredToken = jwt.sign(
        testPayload,
        process.env.JWT_SECRET!,
        { expiresIn: '0s' }
      );

      // Wait a bit to ensure expiration
      const decoded = verifyToken(expiredToken);

      expect(decoded).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(50); // Bcrypt hashes are long
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Due to salt, hashes should be different
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'TestPassword123!';
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword(password, hashed);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword(wrongPassword, hashed);

      expect(isMatch).toBe(false);
    });
  });
});
