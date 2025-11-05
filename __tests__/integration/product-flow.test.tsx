/**
 * Integration Test: Product Flow
 * Tests the complete flow of viewing products, adding to cart, and checkout
 */

import { NextRequest } from 'next/server'
import { GET as getProducts } from '@/app/api/products/route'
import { POST as addToCart, GET as getCart } from '@/app/api/cart/route'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    cartItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  verifyToken: jest.fn(),
}))

describe('Product to Cart Integration Flow', () => {
  const mockUserId = 'user123'
  const mockToken = 'valid-token-123'

  const mockProducts = [
    {
      id: 'prod1',
      name: 'Dental Mirror',
      slug: 'dental-mirror',
      sku: 'DM001',
      description: 'High-quality dental mirror',
      price: 50,
      discountPrice: null,
      stock: 100,
      isActive: true,
      category: {
        id: 'cat1',
        name: 'Dental Instruments',
        slug: 'dental-instruments',
      },
    },
    {
      id: 'prod2',
      name: 'Dental Scaler',
      slug: 'dental-scaler',
      sku: 'DS001',
      description: 'Professional dental scaler',
      price: 150,
      discountPrice: 120,
      stock: 50,
      isActive: true,
      category: {
        id: 'cat1',
        name: 'Dental Instruments',
        slug: 'dental-instruments',
      },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(verifyToken as jest.Mock).mockReturnValue({ userId: mockUserId })
  })

  describe('Complete Product Purchase Flow', () => {
    it('should fetch products, add to cart, and retrieve cart', async () => {
      // Step 1: Fetch products from API
      ;(prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)
      ;(prisma.product.count as jest.Mock).mockResolvedValue(2)

      const productsRequest = new NextRequest('http://localhost:3000/api/products?page=1')
      const productsResponse = await getProducts(productsRequest)
      const productsData = await productsResponse.json()

      expect(productsData.success).toBe(true)
      expect(productsData.data).toHaveLength(2)
      expect(productsData.data[0].name).toBe('Dental Mirror')

      // Step 2: User adds first product to cart
      const productToAdd = productsData.data[0]
      ;(prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.cartItem.create as jest.Mock).mockResolvedValue({
        id: 'cart1',
        userId: mockUserId,
        productId: productToAdd.id,
        quantity: 1,
        product: productToAdd,
      })

      const addToCartRequest = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { authorization: `Bearer ${mockToken}` },
        body: JSON.stringify({
          productId: productToAdd.id,
          quantity: 1,
        }),
      })

      const addToCartResponse = await addToCart(addToCartRequest)
      const addToCartData = await addToCartResponse.json()

      expect(addToCartData.success).toBe(true)
      expect(addToCartData.message).toBe('Ürün sepete eklendi')
      expect(addToCartData.data.productId).toBe(productToAdd.id)

      // Step 3: Retrieve cart to verify
      ;(prisma.cartItem.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'cart1',
          userId: mockUserId,
          productId: productToAdd.id,
          quantity: 1,
          product: productToAdd,
        },
      ])

      const getCartRequest = new NextRequest('http://localhost:3000/api/cart', {
        headers: { authorization: `Bearer ${mockToken}` },
      })

      const getCartResponse = await getCart(getCartRequest)
      const getCartData = await getCartResponse.json()

      expect(getCartData.success).toBe(true)
      expect(getCartData.data).toHaveLength(1)
      expect(getCartData.data[0].product.name).toBe('Dental Mirror')
      expect(getCartData.data[0].quantity).toBe(1)
    })

    it('should handle adding multiple products to cart', async () => {
      // Get products
      ;(prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)
      ;(prisma.product.count as jest.Mock).mockResolvedValue(2)

      const productsRequest = new NextRequest('http://localhost:3000/api/products')
      const productsResponse = await getProducts(productsRequest)
      const productsData = await productsResponse.json()

      // Add first product
      ;(prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.cartItem.create as jest.Mock).mockResolvedValueOnce({
        id: 'cart1',
        userId: mockUserId,
        productId: productsData.data[0].id,
        quantity: 2,
        product: productsData.data[0],
      })

      const addFirstProduct = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { authorization: `Bearer ${mockToken}` },
        body: JSON.stringify({
          productId: productsData.data[0].id,
          quantity: 2,
        }),
      })

      await addToCart(addFirstProduct)

      // Add second product
      ;(prisma.cartItem.create as jest.Mock).mockResolvedValueOnce({
        id: 'cart2',
        userId: mockUserId,
        productId: productsData.data[1].id,
        quantity: 1,
        product: productsData.data[1],
      })

      const addSecondProduct = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { authorization: `Bearer ${mockToken}` },
        body: JSON.stringify({
          productId: productsData.data[1].id,
          quantity: 1,
        }),
      })

      await addToCart(addSecondProduct)

      // Verify cart has both products
      ;(prisma.cartItem.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'cart1',
          userId: mockUserId,
          productId: productsData.data[0].id,
          quantity: 2,
          product: productsData.data[0],
        },
        {
          id: 'cart2',
          userId: mockUserId,
          productId: productsData.data[1].id,
          quantity: 1,
          product: productsData.data[1],
        },
      ])

      const getCartRequest = new NextRequest('http://localhost:3000/api/cart', {
        headers: { authorization: `Bearer ${mockToken}` },
      })

      const cartResponse = await getCart(getCartRequest)
      const cartData = await cartResponse.json()

      expect(cartData.success).toBe(true)
      expect(cartData.data).toHaveLength(2)

      // Calculate total
      const total = cartData.data.reduce((sum: number, item: any) => {
        const price = item.product.discountPrice || item.product.price
        return sum + price * item.quantity
      }, 0)

      // First product: 50 * 2 = 100
      // Second product: 120 * 1 = 120
      expect(total).toBe(220)
    })

    it('should filter products by category and add filtered product to cart', async () => {
      // Filter products by category
      const categoryFilteredProducts = [mockProducts[0]]
      ;(prisma.product.findMany as jest.Mock).mockResolvedValue(categoryFilteredProducts)
      ;(prisma.product.count as jest.Mock).mockResolvedValue(1)

      const productsRequest = new NextRequest(
        'http://localhost:3000/api/products?category=dental-instruments'
      )
      const productsResponse = await getProducts(productsRequest)
      const productsData = await productsResponse.json()

      expect(productsData.success).toBe(true)
      expect(productsData.data).toHaveLength(1)
      expect(productsData.data[0].category.slug).toBe('dental-instruments')

      // Add filtered product to cart
      ;(prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.cartItem.create as jest.Mock).mockResolvedValue({
        id: 'cart1',
        userId: mockUserId,
        productId: productsData.data[0].id,
        quantity: 1,
        product: productsData.data[0],
      })

      const addToCartRequest = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { authorization: `Bearer ${mockToken}` },
        body: JSON.stringify({
          productId: productsData.data[0].id,
          quantity: 1,
        }),
      })

      const addResponse = await addToCart(addToCartRequest)
      const addData = await addResponse.json()

      expect(addData.success).toBe(true)
      expect(addData.data.product.category.slug).toBe('dental-instruments')
    })

    it('should search products and add search result to cart', async () => {
      // Search for products
      const searchResults = [mockProducts[1]] // Dental Scaler
      ;(prisma.product.findMany as jest.Mock).mockResolvedValue(searchResults)
      ;(prisma.product.count as jest.Mock).mockResolvedValue(1)

      const searchRequest = new NextRequest('http://localhost:3000/api/products?search=scaler')
      const searchResponse = await getProducts(searchRequest)
      const searchData = await searchResponse.json()

      expect(searchData.success).toBe(true)
      expect(searchData.data).toHaveLength(1)
      expect(searchData.data[0].name).toContain('Scaler')

      // Add search result to cart
      ;(prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.cartItem.create as jest.Mock).mockResolvedValue({
        id: 'cart1',
        userId: mockUserId,
        productId: searchData.data[0].id,
        quantity: 1,
        product: searchData.data[0],
      })

      const addToCartRequest = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { authorization: `Bearer ${mockToken}` },
        body: JSON.stringify({
          productId: searchData.data[0].id,
          quantity: 1,
        }),
      })

      const addResponse = await addToCart(addToCartRequest)
      const addData = await addResponse.json()

      expect(addData.success).toBe(true)
      expect(addData.data.product.name).toBe('Dental Scaler')
    })
  })

  describe('Error Handling in Integration Flow', () => {
    it('should handle product fetch error gracefully', async () => {
      ;(prisma.product.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/products')
      const response = await getProducts(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })

    it('should prevent adding to cart without authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        body: JSON.stringify({
          productId: 'prod1',
          quantity: 1,
        }),
      })

      const response = await addToCart(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Token gerekli')
    })

    it('should handle cart retrieval error gracefully', async () => {
      ;(prisma.cartItem.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/cart', {
        headers: { authorization: `Bearer ${mockToken}` },
      })

      const response = await getCart(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })
  })
})
