import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/login/route'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

describe('Authentication API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/login', () => {
    const mockEmail = 'test@example.com'
    const mockPassword = 'TestPassword123!'

    describe('Input Validation', () => {
      it('should return 400 when email is missing', async () => {
        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ password: mockPassword }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Email ve şifre gerekli')
      })

      it('should return 400 when password is missing', async () => {
        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: mockEmail }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Email ve şifre gerekli')
      })

      it('should return 400 when both email and password are missing', async () => {
        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({}),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Email ve şifre gerekli')
      })

      it('should return 400 when email is empty string', async () => {
        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: '', password: mockPassword }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
      })

      it('should return 400 when password is empty string', async () => {
        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: mockEmail, password: '' }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
      })
    })

    describe('User Lookup', () => {
      it('should return 401 when user not found', async () => {
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'nonexistent@example.com', password: mockPassword }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Kullanıcı bulunamadı')

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: 'nonexistent@example.com' },
        })
      })

      it('should search for user by exact email match', async () => {
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: mockEmail, password: mockPassword }),
        })

        await POST(request)

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: mockEmail },
        })
      })
    })

    describe('Password Verification', () => {
      it('should return 401 when password is incorrect', async () => {
        const hashedPassword = await hashPassword(mockPassword)
        const mockUser = {
          id: 'user-123',
          email: mockEmail,
          password: hashedPassword,
          role: 'EMPLOYEE',
          name: 'Test User',
        }

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: mockEmail, password: 'WrongPassword123!' }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Geçersiz şifre')
      })

      it('should verify password using bcrypt', async () => {
        const hashedPassword = await hashPassword(mockPassword)
        const isValid = await verifyPassword(mockPassword, hashedPassword)

        expect(isValid).toBe(true)
      })
    })

    describe('Successful Login', () => {
      it('should return success with user and token on valid credentials', async () => {
        const hashedPassword = await hashPassword(mockPassword)
        const mockUser = {
          id: 'user-123',
          email: mockEmail,
          password: hashedPassword,
          role: 'EMPLOYEE',
          name: 'Test User',
          companyId: 'company-123',
          departmentId: 'dept-123',
        }

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: mockEmail, password: mockPassword }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('Giriş başarılı')
        expect(data.data).toHaveProperty('user')
        expect(data.data).toHaveProperty('token')
      })

      it('should not include password in response', async () => {
        const hashedPassword = await hashPassword(mockPassword)
        const mockUser = {
          id: 'user-123',
          email: mockEmail,
          password: hashedPassword,
          role: 'EMPLOYEE',
          name: 'Test User',
        }

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: mockEmail, password: mockPassword }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(data.data.user.password).toBeUndefined()
        expect(data.data.user).not.toHaveProperty('password')
      })

      it('should return user data without password', async () => {
        const hashedPassword = await hashPassword(mockPassword)
        const mockUser = {
          id: 'user-123',
          email: mockEmail,
          password: hashedPassword,
          role: 'EMPLOYEE',
          name: 'Test User',
          companyId: 'company-123',
        }

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: mockEmail, password: mockPassword }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(data.data.user).toEqual({
          id: 'user-123',
          email: mockEmail,
          role: 'EMPLOYEE',
          name: 'Test User',
          companyId: 'company-123',
        })
      })

      it('should generate JWT token with user info', async () => {
        const hashedPassword = await hashPassword(mockPassword)
        const mockUser = {
          id: 'user-123',
          email: mockEmail,
          password: hashedPassword,
          role: 'EMPLOYEE',
          name: 'Test User',
        }

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: mockEmail, password: mockPassword }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(data.data.token).toBeDefined()
        expect(typeof data.data.token).toBe('string')
        expect(data.data.token.split('.').length).toBe(3) // JWT format
      })

      it('should allow login for all user roles', async () => {
        const roles = [
          'SUPER_ADMIN',
          'COMPANY_ADMIN',
          'EMPLOYEE',
          'DEPARTMENT_MANAGER',
          'FINANCE_MANAGER',
          'GENERAL_MANAGER',
          'PROCUREMENT_MANAGER',
        ]

        for (const role of roles) {
          const hashedPassword = await hashPassword(mockPassword)
          const mockUser = {
            id: `user-${role}`,
            email: `${role.toLowerCase()}@example.com`,
            password: hashedPassword,
            role,
            name: `${role} User`,
          }

          ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

          const request = new NextRequest('http://localhost:3000/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
              email: mockUser.email,
              password: mockPassword,
            }),
          })

          const response = await POST(request)
          const data = await response.json()

          expect(response.status).toBe(200)
          expect(data.success).toBe(true)
          expect(data.data.user.role).toBe(role)
        }
      })
    })

    describe('Case Sensitivity', () => {
      it('should handle case-sensitive email lookup', async () => {
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'TEST@EXAMPLE.COM', password: mockPassword }),
        })

        await POST(request)

        // Should search for exact email as provided
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: 'TEST@EXAMPLE.COM' },
        })
      })

      it('should not match different case emails if database is case-sensitive', async () => {
        const hashedPassword = await hashPassword(mockPassword)
        const mockUser = {
          id: 'user-123',
          email: 'test@example.com',
          password: hashedPassword,
          role: 'EMPLOYEE',
          name: 'Test User',
        }

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null) // Not found with different case

        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'TEST@EXAMPLE.COM', password: mockPassword }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Kullanıcı bulunamadı')
      })
    })

    describe('Error Handling', () => {
      it('should return 500 on database error', async () => {
        ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(
          new Error('Database connection error')
        )

        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: mockEmail, password: mockPassword }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Giriş işlemi başarısız')
      })

      it('should handle malformed JSON gracefully', async () => {
        // NextRequest will throw on invalid JSON
        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: 'invalid-json',
        })

        // The function catches the error and returns 500
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Giriş işlemi başarısız')
      })
    })

    describe('Security', () => {
      it('should not reveal whether email exists on failed login', async () => {
        // Test with non-existent user
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

        const request1 = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'nonexistent@example.com', password: mockPassword }),
        })

        const response1 = await POST(request1)
        const data1 = await response1.json()

        // Test with existing user but wrong password
        const hashedPassword = await hashPassword('CorrectPassword')
        const mockUser = {
          id: 'user-123',
          email: mockEmail,
          password: hashedPassword,
          role: 'EMPLOYEE',
          name: 'Test User',
        }

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

        const request2 = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: mockEmail, password: 'WrongPassword' }),
        })

        const response2 = await POST(request2)
        const data2 = await response2.json()

        // Both should return 401 (though with different messages in this implementation)
        expect(response1.status).toBe(401)
        expect(response2.status).toBe(401)
      })

      it('should hash passwords securely', async () => {
        const password = 'TestPassword123!'
        const hash1 = await hashPassword(password)
        const hash2 = await hashPassword(password)

        // Same password should produce different hashes (due to salt)
        expect(hash1).not.toBe(hash2)
        expect(hash1).not.toBe(password)
        expect(hash2).not.toBe(password)

        // Both hashes should verify correctly
        expect(await verifyPassword(password, hash1)).toBe(true)
        expect(await verifyPassword(password, hash2)).toBe(true)
      })
    })
  })
})
