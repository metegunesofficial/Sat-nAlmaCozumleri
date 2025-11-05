import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/products/route'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}))

describe('Products API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('should return products with pagination', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product 1',
          slug: 'test-product-1',
          sku: 'SKU001',
          description: 'Test description',
          price: 100,
          stock: 10,
          isActive: true,
          category: {
            id: 'cat1',
            name: 'Category 1',
            slug: 'category-1',
          },
        },
        {
          id: '2',
          name: 'Test Product 2',
          slug: 'test-product-2',
          sku: 'SKU002',
          description: 'Test description 2',
          price: 200,
          stock: 20,
          isActive: true,
          category: {
            id: 'cat2',
            name: 'Category 2',
            slug: 'category-2',
          },
        },
      ]

      ;(prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)
      ;(prisma.product.count as jest.Mock).mockResolvedValue(2)

      const request = new NextRequest('http://localhost:3000/api/products?page=1&limit=12')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 12,
        total: 2,
        totalPages: 1,
      })
    })

    it('should filter products by category', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product 1',
          slug: 'test-product-1',
          category: {
            id: 'cat1',
            name: 'Category 1',
            slug: 'category-1',
          },
        },
      ]

      ;(prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)
      ;(prisma.product.count as jest.Mock).mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/products?category=category-1')
      const response = await GET(request)
      const data = await response.json()

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: { slug: 'category-1' },
          }),
        })
      )
      expect(data.success).toBe(true)
    })

    it('should filter products by search query', async () => {
      ;(prisma.product.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.product.count as jest.Mock).mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/products?search=dental')
      await GET(request)

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'dental', mode: 'insensitive' } },
              { description: { contains: 'dental', mode: 'insensitive' } },
              { sku: { contains: 'dental', mode: 'insensitive' } },
            ]),
          }),
        })
      )
    })

    it('should filter featured products', async () => {
      ;(prisma.product.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.product.count as jest.Mock).mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/products?featured=true')
      await GET(request)

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isFeatured: true,
          }),
        })
      )
    })

    it('should handle errors gracefully', async () => {
      ;(prisma.product.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Ürünler yüklenemedi')
    })
  })

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'New Product',
        slug: 'new-product',
        sku: 'SKU003',
        description: 'New product description',
        price: 150,
        stock: 15,
        categoryId: 'cat1',
        isActive: true,
      }

      const createdProduct = {
        id: '3',
        ...newProduct,
        category: {
          id: 'cat1',
          name: 'Category 1',
          slug: 'category-1',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.product.create as jest.Mock).mockResolvedValue(createdProduct)

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe(newProduct.name)
      expect(data.message).toBe('Ürün oluşturuldu')
    })

    it('should handle creation errors', async () => {
      ;(prisma.product.create as jest.Mock).mockRejectedValue(new Error('Creation failed'))

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Ürün oluşturulamadı')
    })
  })
})
