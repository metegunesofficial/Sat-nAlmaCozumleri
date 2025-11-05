import { NextRequest } from 'next/server'
import { GET, POST, DELETE } from '@/app/api/cart/route'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    cartItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  verifyToken: jest.fn(),
}))

describe('Cart API', () => {
  const mockToken = 'valid-token-123'
  const mockUserId = 'user1'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/cart', () => {
    it('should return cart items for authenticated user', async () => {
      const mockCartItems = [
        {
          id: 'cart1',
          userId: mockUserId,
          productId: 'prod1',
          quantity: 2,
          product: {
            id: 'prod1',
            name: 'Product 1',
            price: 100,
            category: {
              name: 'Category 1',
              slug: 'category-1',
            },
          },
        },
      ]

      ;(verifyToken as jest.Mock).mockReturnValue({ userId: mockUserId })
      ;(prisma.cartItem.findMany as jest.Mock).mockResolvedValue(mockCartItems)

      const request = new NextRequest('http://localhost:3000/api/cart', {
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].quantity).toBe(2)
    })

    it('should fail without token', async () => {
      const request = new NextRequest('http://localhost:3000/api/cart')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Token gerekli')
    })

    it('should fail with invalid token', async () => {
      ;(verifyToken as jest.Mock).mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/cart', {
        headers: {
          authorization: `Bearer invalid-token`,
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Geçersiz token')
    })

    it('should handle database errors', async () => {
      ;(verifyToken as jest.Mock).mockReturnValue({ userId: mockUserId })
      ;(prisma.cartItem.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/cart', {
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Sepet yüklenemedi')
    })
  })

  describe('POST /api/cart', () => {
    it('should add new item to cart', async () => {
      const newItem = {
        productId: 'prod1',
        quantity: 1,
      }

      const createdCartItem = {
        id: 'cart1',
        userId: mockUserId,
        productId: 'prod1',
        quantity: 1,
        product: {
          id: 'prod1',
          name: 'Product 1',
          price: 100,
        },
      }

      ;(verifyToken as jest.Mock).mockReturnValue({ userId: mockUserId })
      ;(prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.cartItem.create as jest.Mock).mockResolvedValue(createdCartItem)

      const request = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify(newItem),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Ürün sepete eklendi')
      expect(data.data.quantity).toBe(1)
    })

    it('should update quantity if item already exists', async () => {
      const existingItem = {
        id: 'cart1',
        userId: mockUserId,
        productId: 'prod1',
        quantity: 2,
      }

      const updatedItem = {
        ...existingItem,
        quantity: 4,
        product: {
          id: 'prod1',
          name: 'Product 1',
        },
      }

      ;(verifyToken as jest.Mock).mockReturnValue({ userId: mockUserId })
      ;(prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(existingItem)
      ;(prisma.cartItem.update as jest.Mock).mockResolvedValue(updatedItem)

      const request = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({ productId: 'prod1', quantity: 2 }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.quantity).toBe(4)
    })

    it('should fail without authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId: 'prod1', quantity: 1 }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })

  describe('DELETE /api/cart', () => {
    it('should clear cart for authenticated user', async () => {
      ;(verifyToken as jest.Mock).mockReturnValue({ userId: mockUserId })
      ;(prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 3 })

      const request = new NextRequest('http://localhost:3000/api/cart', {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Sepet temizlendi')
      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      })
    })

    it('should fail without token', async () => {
      const request = new NextRequest('http://localhost:3000/api/cart', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Token gerekli')
    })

    it('should handle delete errors', async () => {
      ;(verifyToken as jest.Mock).mockReturnValue({ userId: mockUserId })
      ;(prisma.cartItem.deleteMany as jest.Mock).mockRejectedValue(new Error('Delete failed'))

      const request = new NextRequest('http://localhost:3000/api/cart', {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Sepet temizlenemedi')
    })
  })
})
