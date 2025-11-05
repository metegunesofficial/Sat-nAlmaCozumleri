import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/login/route'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  verifyPassword: jest.fn(),
  generateToken: jest.fn(),
}))

describe('Login API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        role: 'USER',
        departmentId: 'dept1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockToken = 'jwt-token-123'

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(verifyPassword as jest.Mock).mockResolvedValue(true)
      ;(generateToken as jest.Mock).mockReturnValue(mockToken)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Giriş başarılı')
      expect(data.data.token).toBe(mockToken)
      expect(data.data.user.email).toBe(mockUser.email)
      expect(data.data.user.password).toBeUndefined() // Password should not be returned
    })

    it('should fail with missing email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Email ve şifre gerekli')
    })

    it('should fail with missing password', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Email ve şifre gerekli')
    })

    it('should fail with non-existent user', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Kullanıcı bulunamadı')
    })

    it('should fail with invalid password', async () => {
      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        role: 'USER',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(verifyPassword as jest.Mock).mockResolvedValue(false)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Geçersiz şifre')
    })

    it('should handle unexpected errors', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Giriş işlemi başarısız')
    })
  })
})
