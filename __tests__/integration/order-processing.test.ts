import { NextRequest } from 'next/server'
import { POST } from '@/app/api/orders/route'
import { generateToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    cartItem: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
    },
    product: {
      update: jest.fn(),
    },
  },
}))

// Mock generateOrderNumber
jest.mock('@/lib/utils', () => ({
  generateOrderNumber: jest.fn(() => 'ATL20240315001'),
}))

describe('Order Processing Integration Tests', () => {
  const mockUserId = 'user-123'
  const mockEmail = 'test@example.com'
  const mockRole = 'EMPLOYEE'

  const mockOrderData = {
    billingName: 'John Doe',
    billingEmail: 'john@example.com',
    billingPhone: '+90 555 123 4567',
    billingAddress: '123 Main St',
    billingCity: 'Istanbul',
    billingDistrict: 'Kadikoy',
    billingPostal: '34710',
    paymentMethod: 'CREDIT_CARD',
    notes: 'Please deliver in the morning',
    shippingCost: 50,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/orders', () => {
    describe('Authentication', () => {
      it('should return 401 when no token provided', async () => {
        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          body: JSON.stringify(mockOrderData),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Token gerekli')
      })

      it('should return 401 when invalid token provided', async () => {
        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: {
            authorization: 'Bearer invalid-token',
          },
          body: JSON.stringify(mockOrderData),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Geçersiz token')
      })
    })

    describe('Cart Validation', () => {
      it('should return 400 when cart is empty', async () => {
        const token = generateToken(mockUserId, mockEmail, mockRole)

        ;(prisma.cartItem.findMany as jest.Mock).mockResolvedValue([])

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockOrderData),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Sepetiniz boş')
      })
    })

    describe('Order Creation', () => {
      const mockCartItems = [
        {
          id: 'cart-1',
          userId: mockUserId,
          productId: 'prod-1',
          quantity: 2,
          product: {
            id: 'prod-1',
            name: 'Product 1',
            sku: 'SKU-001',
            price: 100,
            discountPrice: null,
            stock: 10,
          },
        },
        {
          id: 'cart-2',
          userId: mockUserId,
          productId: 'prod-2',
          quantity: 1,
          product: {
            id: 'prod-2',
            name: 'Product 2',
            sku: 'SKU-002',
            price: 200,
            discountPrice: 150,
            stock: 5,
          },
        },
      ]

      it('should create order with correct calculations', async () => {
        const token = generateToken(mockUserId, mockEmail, mockRole)

        const mockCreatedOrder = {
          id: 'order-1',
          orderNumber: 'ATL20240315001',
          userId: mockUserId,
          subtotal: 350, // (100 * 2) + (150 * 1)
          shippingCost: 50,
          tax: 63, // 350 * 0.18
          total: 463, // 350 + 50 + 63
          items: [],
        }

        ;(prisma.cartItem.findMany as jest.Mock).mockResolvedValue(mockCartItems)
        ;(prisma.order.create as jest.Mock).mockResolvedValue(mockCreatedOrder)
        ;(prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 2 })
        ;(prisma.product.update as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockOrderData),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('Sipariş oluşturuldu')

        // Verify order created with correct calculations
        const createCall = (prisma.order.create as jest.Mock).mock.calls[0][0]
        expect(createCall.data.subtotal).toBe(350)
        expect(createCall.data.shippingCost).toBe(50)
        expect(createCall.data.tax).toBe(63)
        expect(createCall.data.total).toBe(463)
      })

      it('should calculate 18% tax (KDV) correctly', async () => {
        const token = generateToken(mockUserId, mockEmail, mockRole)

        ;(prisma.cartItem.findMany as jest.Mock).mockResolvedValue(mockCartItems)
        ;(prisma.order.create as jest.Mock).mockResolvedValue({})
        ;(prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 2 })
        ;(prisma.product.update as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockOrderData),
        })

        await POST(request)

        const createCall = (prisma.order.create as jest.Mock).mock.calls[0][0]
        const expectedTax = createCall.data.subtotal * 0.18
        expect(createCall.data.tax).toBe(expectedTax)
      })

      it('should use discountPrice when available', async () => {
        const token = generateToken(mockUserId, mockEmail, mockRole)

        ;(prisma.cartItem.findMany as jest.Mock).mockResolvedValue(mockCartItems)
        ;(prisma.order.create as jest.Mock).mockResolvedValue({})
        ;(prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 2 })
        ;(prisma.product.update as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockOrderData),
        })

        await POST(request)

        const createCall = (prisma.order.create as jest.Mock).mock.calls[0][0]
        const items = createCall.data.items.create

        // First item: no discount, use regular price (100)
        expect(items[0].price).toBe(100)
        expect(items[0].total).toBe(200) // 100 * 2

        // Second item: has discount, use discountPrice (150)
        expect(items[1].price).toBe(150)
        expect(items[1].total).toBe(150) // 150 * 1
      })

      it('should generate unique order number', async () => {
        const token = generateToken(mockUserId, mockEmail, mockRole)

        ;(prisma.cartItem.findMany as jest.Mock).mockResolvedValue(mockCartItems)
        ;(prisma.order.create as jest.Mock).mockResolvedValue({})
        ;(prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 2 })
        ;(prisma.product.update as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockOrderData),
        })

        await POST(request)

        const createCall = (prisma.order.create as jest.Mock).mock.calls[0][0]
        expect(createCall.data.orderNumber).toBe('ATL20240315001')
      })

      it('should use billing info for shipping when shipping not provided', async () => {
        const token = generateToken(mockUserId, mockEmail, mockRole)

        ;(prisma.cartItem.findMany as jest.Mock).mockResolvedValue(mockCartItems)
        ;(prisma.order.create as jest.Mock).mockResolvedValue({})
        ;(prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 2 })
        ;(prisma.product.update as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockOrderData),
        })

        await POST(request)

        const createCall = (prisma.order.create as jest.Mock).mock.calls[0][0]
        expect(createCall.data.shippingName).toBe(mockOrderData.billingName)
        expect(createCall.data.shippingPhone).toBe(mockOrderData.billingPhone)
        expect(createCall.data.shippingAddress).toBe(mockOrderData.billingAddress)
        expect(createCall.data.shippingCity).toBe(mockOrderData.billingCity)
      })

      it('should set default shipping cost to 0 when not provided', async () => {
        const token = generateToken(mockUserId, mockEmail, mockRole)
        const dataWithoutShipping = { ...mockOrderData }
        delete dataWithoutShipping.shippingCost

        ;(prisma.cartItem.findMany as jest.Mock).mockResolvedValue(mockCartItems)
        ;(prisma.order.create as jest.Mock).mockResolvedValue({})
        ;(prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 2 })
        ;(prisma.product.update as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataWithoutShipping),
        })

        await POST(request)

        const createCall = (prisma.order.create as jest.Mock).mock.calls[0][0]
        expect(createCall.data.shippingCost).toBe(0)
      })
    })

    describe('Stock Management', () => {
      const mockCartItems = [
        {
          id: 'cart-1',
          userId: mockUserId,
          productId: 'prod-1',
          quantity: 3,
          product: {
            id: 'prod-1',
            name: 'Product 1',
            sku: 'SKU-001',
            price: 100,
            discountPrice: null,
            stock: 10,
          },
        },
      ]

      it('should decrement product stock after order', async () => {
        const token = generateToken(mockUserId, mockEmail, mockRole)

        ;(prisma.cartItem.findMany as jest.Mock).mockResolvedValue(mockCartItems)
        ;(prisma.order.create as jest.Mock).mockResolvedValue({})
        ;(prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 })
        ;(prisma.product.update as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockOrderData),
        })

        await POST(request)

        // Verify stock was decremented
        expect(prisma.product.update).toHaveBeenCalledWith({
          where: { id: 'prod-1' },
          data: {
            stock: { decrement: 3 },
            salesCount: { increment: 3 },
          },
        })
      })

      it('should increment product salesCount after order', async () => {
        const token = generateToken(mockUserId, mockEmail, mockRole)

        ;(prisma.cartItem.findMany as jest.Mock).mockResolvedValue(mockCartItems)
        ;(prisma.order.create as jest.Mock).mockResolvedValue({})
        ;(prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 })
        ;(prisma.product.update as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockOrderData),
        })

        await POST(request)

        // Verify salesCount was incremented
        expect(prisma.product.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              salesCount: { increment: 3 },
            }),
          })
        )
      })

      it('should update stock for multiple products', async () => {
        const token = generateToken(mockUserId, mockEmail, mockRole)

        const multipleItems = [
          {
            id: 'cart-1',
            userId: mockUserId,
            productId: 'prod-1',
            quantity: 2,
            product: {
              id: 'prod-1',
              name: 'Product 1',
              sku: 'SKU-001',
              price: 100,
              discountPrice: null,
            },
          },
          {
            id: 'cart-2',
            userId: mockUserId,
            productId: 'prod-2',
            quantity: 5,
            product: {
              id: 'prod-2',
              name: 'Product 2',
              sku: 'SKU-002',
              price: 200,
              discountPrice: null,
            },
          },
        ]

        ;(prisma.cartItem.findMany as jest.Mock).mockResolvedValue(multipleItems)
        ;(prisma.order.create as jest.Mock).mockResolvedValue({})
        ;(prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 2 })
        ;(prisma.product.update as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockOrderData),
        })

        await POST(request)

        // Verify both products were updated
        expect(prisma.product.update).toHaveBeenCalledTimes(2)
        expect(prisma.product.update).toHaveBeenNthCalledWith(1, {
          where: { id: 'prod-1' },
          data: {
            stock: { decrement: 2 },
            salesCount: { increment: 2 },
          },
        })
        expect(prisma.product.update).toHaveBeenNthCalledWith(2, {
          where: { id: 'prod-2' },
          data: {
            stock: { decrement: 5 },
            salesCount: { increment: 5 },
          },
        })
      })
    })

    describe('Cart Management', () => {
      const mockCartItems = [
        {
          id: 'cart-1',
          userId: mockUserId,
          productId: 'prod-1',
          quantity: 1,
          product: {
            id: 'prod-1',
            name: 'Product 1',
            sku: 'SKU-001',
            price: 100,
            discountPrice: null,
          },
        },
      ]

      it('should clear cart after successful order', async () => {
        const token = generateToken(mockUserId, mockEmail, mockRole)

        ;(prisma.cartItem.findMany as jest.Mock).mockResolvedValue(mockCartItems)
        ;(prisma.order.create as jest.Mock).mockResolvedValue({})
        ;(prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 })
        ;(prisma.product.update as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockOrderData),
        })

        await POST(request)

        // Verify cart was cleared for the user
        expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
          where: { userId: mockUserId },
        })
      })
    })

    describe('Error Handling', () => {
      it('should return 500 on database error', async () => {
        const token = generateToken(mockUserId, mockEmail, mockRole)

        ;(prisma.cartItem.findMany as jest.Mock).mockRejectedValue(
          new Error('Database error')
        )

        const request = new NextRequest('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockOrderData),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Sipariş oluşturulamadı')
      })
    })
  })
})
