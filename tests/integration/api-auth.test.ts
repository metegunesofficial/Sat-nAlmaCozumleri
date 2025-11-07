import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST as registerHandler } from '@/app/api/auth/register/route';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { GET as meHandler } from '@/app/api/auth/me/route';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

describe('Auth API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and company', async () => {
      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'REQUESTER',
        companyId: 'company123',
      };

      const mockCompany = {
        id: 'company123',
        name: 'Test Company',
        subdomain: 'testcompany',
      };

      // Mock Prisma calls
      vi.mocked(prisma.company.findUnique).mockResolvedValue(null); // Subdomain available
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null); // Email available
      vi.mocked(prisma.company.create).mockResolvedValue(mockCompany as any);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any);

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123!',
          role: 'REQUESTER',
          department: 'Operations',
          companyName: 'Test Company',
          subdomain: 'testcompany',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('john@example.com');
      expect(data.company.subdomain).toBe('testcompany');
      expect(data.token).toBeDefined();
    });

    it('should reject registration with existing email', async () => {
      // Mock existing user
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'existing',
        email: 'john@example.com',
      } as any);

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123!',
          role: 'REQUESTER',
          companyName: 'Test Company',
          subdomain: 'testcompany',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('E-posta');
    });

    it('should reject registration with existing subdomain', async () => {
      // Mock existing company
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.company.findUnique).mockResolvedValue({
        id: 'existing',
        subdomain: 'testcompany',
      } as any);

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123!',
          role: 'REQUESTER',
          companyName: 'Test Company',
          subdomain: 'testcompany',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Subdomain');
    });

    it('should reject registration with missing fields', async () => {
      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'john@example.com',
          // Missing name, password, etc.
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        password: '$2b$10$hashedpassword', // Bcrypt hash
        role: 'REQUESTER',
        companyId: 'company123',
        isActive: true,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      // Mock bcrypt compare (in setup.ts or here)
      const bcrypt = await import('bcrypt');
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'john@example.com',
          password: 'SecurePass123!',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('john@example.com');
      expect(data.token).toBeDefined();
    });

    it('should reject login with incorrect password', async () => {
      const mockUser = {
        id: 'user123',
        email: 'john@example.com',
        password: '$2b$10$hashedpassword',
        isActive: true,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const bcrypt = await import('bcrypt');
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'john@example.com',
          password: 'WrongPassword',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should reject login for non-existent user', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should reject login for inactive user', async () => {
      const mockUser = {
        id: 'user123',
        email: 'john@example.com',
        password: '$2b$10$hashedpassword',
        isActive: false, // Inactive!
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'john@example.com',
          password: 'SecurePass123!',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toContain('aktif');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'REQUESTER',
        department: 'Operations',
        companyId: 'company123',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const token = generateToken({
        userId: 'user123',
        companyId: 'company123',
        role: 'REQUESTER',
      });

      const request = new Request('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await meHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('john@example.com');
    });

    it('should reject request without token', async () => {
      const request = new Request('http://localhost:3000/api/auth/me', {
        method: 'GET',
      });

      const response = await meHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const request = new Request('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer invalid.token.here',
        },
      });

      const response = await meHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });
});
