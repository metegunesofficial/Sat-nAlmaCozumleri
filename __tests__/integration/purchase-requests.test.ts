import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/purchase-requests/route'
import { generateToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    purchaseRequest: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    approvalWorkflow: {
      findFirst: jest.fn(),
    },
  },
}))

describe('Purchase Requests API Integration Tests', () => {
  const mockUserId = 'user-123'
  const mockEmail = 'test@example.com'
  const mockDepartmentId = 'dept-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/purchase-requests', () => {
    describe('Authentication', () => {
      it('should return 401 when no token provided', async () => {
        const request = new NextRequest('http://localhost:3000/api/purchase-requests')

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Token gerekli')
      })

      it('should return 401 when invalid token provided', async () => {
        const request = new NextRequest('http://localhost:3000/api/purchase-requests', {
          headers: {
            authorization: 'Bearer invalid-token',
          },
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Geçersiz token')
      })
    })

    describe('Role-Based Filtering', () => {
      it('should filter requests for EMPLOYEE role (own requests only)', async () => {
        const token = generateToken(mockUserId, mockEmail, 'EMPLOYEE')
        const mockRequests = [
          {
            id: 'req-1',
            requestNumber: 'PR202403001',
            requesterId: mockUserId,
            status: 'SUBMITTED',
          },
        ]

        ;(prisma.purchaseRequest.findMany as jest.Mock).mockResolvedValue(mockRequests)

        const request = new NextRequest('http://localhost:3000/api/purchase-requests', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toEqual(mockRequests)

        // Verify that the where clause filters by requesterId
        expect(prisma.purchaseRequest.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              requesterId: mockUserId,
            }),
          })
        )
      })

      it('should filter requests for DEPARTMENT_MANAGER role', async () => {
        const token = generateToken(mockUserId, mockEmail, 'DEPARTMENT_MANAGER')
        const mockUser = {
          id: mockUserId,
          managedDepartments: [
            { id: 'dept-1' },
            { id: 'dept-2' },
          ],
        }
        const mockRequests = [
          {
            id: 'req-1',
            requestNumber: 'PR202403001',
            departmentId: 'dept-1',
          },
        ]

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
        ;(prisma.purchaseRequest.findMany as jest.Mock).mockResolvedValue(mockRequests)

        const request = new NextRequest('http://localhost:3000/api/purchase-requests', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)

        // Verify department filtering
        expect(prisma.purchaseRequest.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              departmentId: { in: ['dept-1', 'dept-2'] },
            }),
          })
        )
      })

      it('should not filter for COMPANY_ADMIN role (see all requests)', async () => {
        const token = generateToken(mockUserId, mockEmail, 'COMPANY_ADMIN')
        const mockRequests = [
          { id: 'req-1', requestNumber: 'PR202403001' },
          { id: 'req-2', requestNumber: 'PR202403002' },
        ]

        ;(prisma.purchaseRequest.findMany as jest.Mock).mockResolvedValue(mockRequests)

        const request = new NextRequest('http://localhost:3000/api/purchase-requests', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)

        // Verify no requesterId or departmentId filter
        const callArgs = (prisma.purchaseRequest.findMany as jest.Mock).mock.calls[0][0]
        expect(callArgs.where.requesterId).toBeUndefined()
        expect(callArgs.where.departmentId).toBeUndefined()
      })
    })

    describe('Query Parameters', () => {
      it('should filter by status when provided', async () => {
        const token = generateToken(mockUserId, mockEmail, 'COMPANY_ADMIN')

        ;(prisma.purchaseRequest.findMany as jest.Mock).mockResolvedValue([])

        const request = new NextRequest(
          'http://localhost:3000/api/purchase-requests?status=APPROVED',
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        )

        await GET(request)

        expect(prisma.purchaseRequest.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              status: 'APPROVED',
            }),
          })
        )
      })

      it('should filter by departmentId when provided', async () => {
        const token = generateToken(mockUserId, mockEmail, 'COMPANY_ADMIN')

        ;(prisma.purchaseRequest.findMany as jest.Mock).mockResolvedValue([])

        const request = new NextRequest(
          'http://localhost:3000/api/purchase-requests?departmentId=dept-456',
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        )

        await GET(request)

        expect(prisma.purchaseRequest.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              departmentId: 'dept-456',
            }),
          })
        )
      })
    })

    describe('Error Handling', () => {
      it('should return 500 on database error', async () => {
        const token = generateToken(mockUserId, mockEmail, 'EMPLOYEE')

        ;(prisma.purchaseRequest.findMany as jest.Mock).mockRejectedValue(
          new Error('Database error')
        )

        const request = new NextRequest('http://localhost:3000/api/purchase-requests', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Talepler yüklenemedi')
      })
    })
  })

  describe('POST /api/purchase-requests', () => {
    const mockRequestBody = {
      title: 'Office Supplies',
      description: 'Need new office supplies',
      priority: 'NORMAL',
      departmentId: mockDepartmentId,
      items: [
        {
          productId: 'prod-1',
          productName: 'Notebook',
          productSku: 'NB-001',
          quantity: 10,
          unitPrice: 50,
          notes: 'Blue color preferred',
        },
        {
          productId: 'prod-2',
          productName: 'Pen',
          productSku: 'PN-001',
          quantity: 50,
          unitPrice: 5,
          notes: 'Black ink',
        },
      ],
      requiredDate: '2024-04-01',
    }

    describe('Authentication', () => {
      it('should return 401 when no token provided', async () => {
        const request = new NextRequest('http://localhost:3000/api/purchase-requests', {
          method: 'POST',
          body: JSON.stringify(mockRequestBody),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Token gerekli')
      })

      it('should return 401 when invalid token provided', async () => {
        const request = new NextRequest('http://localhost:3000/api/purchase-requests', {
          method: 'POST',
          headers: {
            authorization: 'Bearer invalid-token',
          },
          body: JSON.stringify(mockRequestBody),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Geçersiz token')
      })
    })

    describe('Purchase Request Creation', () => {
      it('should create purchase request with correct data', async () => {
        const token = generateToken(mockUserId, mockEmail, 'EMPLOYEE')
        const mockWorkflow = {
          id: 'workflow-1',
          name: 'Standard Approval',
          steps: [
            { id: 'step-1', stepOrder: 1, stepName: 'Manager Approval' },
          ],
        }
        const mockCreatedRequest = {
          id: 'req-1',
          requestNumber: 'PR202403001',
          requesterId: mockUserId,
          title: mockRequestBody.title,
          estimatedTotal: 750, // (10 * 50) + (50 * 5)
          items: mockRequestBody.items,
          workflow: mockWorkflow,
        }

        ;(prisma.purchaseRequest.count as jest.Mock).mockResolvedValue(0)
        ;(prisma.approvalWorkflow.findFirst as jest.Mock).mockResolvedValue(mockWorkflow)
        ;(prisma.purchaseRequest.create as jest.Mock).mockResolvedValue(mockCreatedRequest)

        const request = new NextRequest('http://localhost:3000/api/purchase-requests', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockRequestBody),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.requestNumber).toBe('PR202403001')
        expect(data.message).toBe('Satın alma talebi oluşturuldu')
      })

      it('should calculate estimated total correctly', async () => {
        const token = generateToken(mockUserId, mockEmail, 'EMPLOYEE')

        ;(prisma.purchaseRequest.count as jest.Mock).mockResolvedValue(0)
        ;(prisma.approvalWorkflow.findFirst as jest.Mock).mockResolvedValue(null)
        ;(prisma.purchaseRequest.create as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/purchase-requests', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockRequestBody),
        })

        await POST(request)

        // Verify create was called with correct estimatedTotal
        const createCall = (prisma.purchaseRequest.create as jest.Mock).mock.calls[0][0]
        expect(createCall.data.estimatedTotal).toBe(750) // (10 * 50) + (50 * 5)
      })

      it('should generate request number with correct format', async () => {
        const token = generateToken(mockUserId, mockEmail, 'EMPLOYEE')

        ;(prisma.purchaseRequest.count as jest.Mock).mockResolvedValue(5)
        ;(prisma.approvalWorkflow.findFirst as jest.Mock).mockResolvedValue(null)
        ;(prisma.purchaseRequest.create as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/purchase-requests', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockRequestBody),
        })

        await POST(request)

        const createCall = (prisma.purchaseRequest.create as jest.Mock).mock.calls[0][0]
        // Request number should be PRYYYYMMnnnn format
        expect(createCall.data.requestNumber).toMatch(/^PR\d{6}\d{4}$/)
      })

      it('should assign workflow based on amount and department', async () => {
        const token = generateToken(mockUserId, mockEmail, 'EMPLOYEE')
        const mockWorkflow = {
          id: 'workflow-1',
          name: 'Low Amount Workflow',
          minAmount: 0,
          maxAmount: 1000,
        }

        ;(prisma.purchaseRequest.count as jest.Mock).mockResolvedValue(0)
        ;(prisma.approvalWorkflow.findFirst as jest.Mock).mockResolvedValue(mockWorkflow)
        ;(prisma.purchaseRequest.create as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/purchase-requests', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockRequestBody),
        })

        await POST(request)

        // Verify workflow was queried with correct criteria
        expect(prisma.approvalWorkflow.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              isActive: true,
              departmentIds: {
                has: mockDepartmentId,
              },
            }),
          })
        )

        // Verify workflowId was set
        const createCall = (prisma.purchaseRequest.create as jest.Mock).mock.calls[0][0]
        expect(createCall.data.workflowId).toBe('workflow-1')
      })

      it('should create request without workflow if none matches', async () => {
        const token = generateToken(mockUserId, mockEmail, 'EMPLOYEE')

        ;(prisma.purchaseRequest.count as jest.Mock).mockResolvedValue(0)
        ;(prisma.approvalWorkflow.findFirst as jest.Mock).mockResolvedValue(null)
        ;(prisma.purchaseRequest.create as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/purchase-requests', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockRequestBody),
        })

        await POST(request)

        const createCall = (prisma.purchaseRequest.create as jest.Mock).mock.calls[0][0]
        expect(createCall.data.workflowId).toBeUndefined()
      })

      it('should create purchase request items correctly', async () => {
        const token = generateToken(mockUserId, mockEmail, 'EMPLOYEE')

        ;(prisma.purchaseRequest.count as jest.Mock).mockResolvedValue(0)
        ;(prisma.approvalWorkflow.findFirst as jest.Mock).mockResolvedValue(null)
        ;(prisma.purchaseRequest.create as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/purchase-requests', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockRequestBody),
        })

        await POST(request)

        const createCall = (prisma.purchaseRequest.create as jest.Mock).mock.calls[0][0]
        expect(createCall.data.items.create).toHaveLength(2)
        expect(createCall.data.items.create[0]).toMatchObject({
          productId: 'prod-1',
          productName: 'Notebook',
          quantity: 10,
          unitPrice: 50,
          totalPrice: 500,
        })
        expect(createCall.data.items.create[1]).toMatchObject({
          productId: 'prod-2',
          productName: 'Pen',
          quantity: 50,
          unitPrice: 5,
          totalPrice: 250,
        })
      })

      it('should set default priority to NORMAL when not provided', async () => {
        const token = generateToken(mockUserId, mockEmail, 'EMPLOYEE')
        const bodyWithoutPriority = { ...mockRequestBody }
        delete bodyWithoutPriority.priority

        ;(prisma.purchaseRequest.count as jest.Mock).mockResolvedValue(0)
        ;(prisma.approvalWorkflow.findFirst as jest.Mock).mockResolvedValue(null)
        ;(prisma.purchaseRequest.create as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/purchase-requests', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyWithoutPriority),
        })

        await POST(request)

        const createCall = (prisma.purchaseRequest.create as jest.Mock).mock.calls[0][0]
        expect(createCall.data.priority).toBe('NORMAL')
      })
    })

    describe('Error Handling', () => {
      it('should return 500 on database error', async () => {
        const token = generateToken(mockUserId, mockEmail, 'EMPLOYEE')

        ;(prisma.purchaseRequest.count as jest.Mock).mockRejectedValue(
          new Error('Database error')
        )

        const request = new NextRequest('http://localhost:3000/api/purchase-requests', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockRequestBody),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Talep oluşturulamadı')
      })
    })
  })
})
