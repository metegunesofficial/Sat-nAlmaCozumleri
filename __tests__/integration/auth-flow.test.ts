/**
 * Integration Test: Authentication Flow
 * Tests the complete authentication flow including login, token verification, and protected routes
 */

import { NextRequest } from 'next/server'
import { POST as loginHandler } from '@/app/api/auth/login/route'
import { POST as registerHandler } from '@/app/api/auth/register/route'
import { GET as getCart } from '@/app/api/cart/route'
import { prisma } from '@/lib/prisma'
import { verifyPassword, hashPassword, generateToken, verifyToken } from '@/lib/auth'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cartItem: {
      findMany: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  verifyPassword: jest.fn(),
  hashPassword: jest.fn(),
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
}))

describe('Authentication Integration Flow', () => {
  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    role: 'USER',
    departmentId: 'dept1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockToken = 'jwt-token-abc123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Authentication Flow', () => {
    it('should register user, login, and access protected route', async () => {
      // Step 1: Register new user
      const newUserData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'USER',
        departmentId: 'dept1',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(hashPassword as jest.Mock).mockResolvedValue('hashedPassword123')
      ;(prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user456',
        ...newUserData,
        password: 'hashedPassword123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      ;(generateToken as jest.Mock).mockReturnValue(mockToken)

      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      })

      const registerResponse = await registerHandler(registerRequest)
      const registerData = await registerResponse.json()

      expect(registerResponse.status).toBe(200)
      expect(registerData.success).toBe(true)
      expect(registerData.data.user.email).toBe(newUserData.email)
      expect(registerData.data.token).toBe(mockToken)

      // Step 2: Login with registered user credentials
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user456',
        ...newUserData,
        password: 'hashedPassword123',
        isActive: true,
      })
      ;(verifyPassword as jest.Mock).mockResolvedValue(true)

      const loginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: newUserData.email,
          password: newUserData.password,
        }),
      })

      const loginResponse = await loginHandler(loginRequest)
      const loginData = await loginResponse.json()

      expect(loginResponse.status).toBe(200)
      expect(loginData.success).toBe(true)
      expect(loginData.data.token).toBe(mockToken)
      expect(loginData.message).toBe('Giriş başarılı')

      // Step 3: Use token to access protected route (cart)
      ;(verifyToken as jest.Mock).mockReturnValue({ userId: 'user456' })
      ;(prisma.cartItem.findMany as jest.Mock).mockResolvedValue([])

      const cartRequest = new NextRequest('http://localhost:3000/api/cart', {
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      })

      const cartResponse = await getCart(cartRequest)
      const cartData = await cartResponse.json()

      expect(cartResponse.status).toBe(200)
      expect(cartData.success).toBe(true)
      expect(Array.isArray(cartData.data)).toBe(true)
    })

    it('should handle login and verify password correctly', async () => {
      // Mock correct password verification
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(verifyPassword as jest.Mock).mockResolvedValue(true)
      ;(generateToken as jest.Mock).mockReturnValue(mockToken)

      const loginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: mockUser.email,
          password: 'correctpassword',
        }),
      })

      const loginResponse = await loginHandler(loginRequest)
      const loginData = await loginResponse.json()

      expect(loginResponse.status).toBe(200)
      expect(loginData.success).toBe(true)
      expect(verifyPassword).toHaveBeenCalledWith('correctpassword', mockUser.password)
    })

    it('should prevent access to protected routes with invalid token', async () => {
      ;(verifyToken as jest.Mock).mockReturnValue(null)

      const cartRequest = new NextRequest('http://localhost:3000/api/cart', {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      })

      const cartResponse = await getCart(cartRequest)
      const cartData = await cartResponse.json()

      expect(cartResponse.status).toBe(401)
      expect(cartData.success).toBe(false)
      expect(cartData.error).toBe('Geçersiz token')
    })

    it('should prevent access to protected routes without token', async () => {
      const cartRequest = new NextRequest('http://localhost:3000/api/cart')

      const cartResponse = await getCart(cartRequest)
      const cartData = await cartResponse.json()

      expect(cartResponse.status).toBe(401)
      expect(cartData.success).toBe(false)
      expect(cartData.error).toBe('Token gerekli')
    })
  })

  describe('Authentication Error Handling', () => {
    it('should fail login with incorrect password', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(verifyPassword as jest.Mock).mockResolvedValue(false)

      const loginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: mockUser.email,
          password: 'wrongpassword',
        }),
      })

      const loginResponse = await loginHandler(loginRequest)
      const loginData = await loginResponse.json()

      expect(loginResponse.status).toBe(401)
      expect(loginData.success).toBe(false)
      expect(loginData.error).toBe('Geçersiz şifre')
    })

    it('should fail login with non-existent user', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const loginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      })

      const loginResponse = await loginHandler(loginRequest)
      const loginData = await loginResponse.json()

      expect(loginResponse.status).toBe(401)
      expect(loginData.success).toBe(false)
      expect(loginData.error).toBe('Kullanıcı bulunamadı')
    })

    it('should prevent registration with existing email', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: mockUser.email,
          password: 'password123',
          name: 'Another User',
        }),
      })

      const registerResponse = await registerHandler(registerRequest)
      const registerData = await registerResponse.json()

      expect(registerResponse.status).toBe(400)
      expect(registerData.success).toBe(false)
      expect(registerData.error).toBe('Bu email zaten kullanılıyor')
    })

    it('should validate required fields on login', async () => {
      const loginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          // password missing
        }),
      })

      const loginResponse = await loginHandler(loginRequest)
      const loginData = await loginResponse.json()

      expect(loginResponse.status).toBe(400)
      expect(loginData.success).toBe(false)
      expect(loginData.error).toBe('Email ve şifre gerekli')
    })

    it('should validate required fields on registration', async () => {
      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          // password and name missing
        }),
      })

      const registerResponse = await registerHandler(registerRequest)
      const registerData = await registerResponse.json()

      expect(registerResponse.status).toBe(400)
      expect(registerData.success).toBe(false)
      expect(registerData.error).toBe('Gerekli alanlar eksik')
    })
  })

  describe('Token Flow', () => {
    it('should generate token on successful login and use it for authenticated requests', async () => {
      // Login
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(verifyPassword as jest.Mock).mockResolvedValue(true)
      ;(generateToken as jest.Mock).mockReturnValue(mockToken)

      const loginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: mockUser.email,
          password: 'password123',
        }),
      })

      const loginResponse = await loginHandler(loginRequest)
      const loginData = await loginResponse.json()
      const token = loginData.data.token

      expect(token).toBe(mockToken)
      expect(generateToken).toHaveBeenCalledWith(mockUser.id, mockUser.email, mockUser.role)

      // Use token for cart access
      ;(verifyToken as jest.Mock).mockReturnValue({ userId: mockUser.id })
      ;(prisma.cartItem.findMany as jest.Mock).mockResolvedValue([])

      const cartRequest = new NextRequest('http://localhost:3000/api/cart', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      const cartResponse = await getCart(cartRequest)
      const cartData = await cartResponse.json()

      expect(cartResponse.status).toBe(200)
      expect(cartData.success).toBe(true)
      expect(verifyToken).toHaveBeenCalledWith(token)
    })
  })
})
