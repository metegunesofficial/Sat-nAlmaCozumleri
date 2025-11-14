import { NextRequest } from 'next/server'
import { GET as getWorkflows, POST as createWorkflow } from '@/app/api/workflows/route'
import { generateToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    approvalWorkflow: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}))

describe('Role-Based Access Control (RBAC) Tests', () => {
  const mockCompanyId = 'company-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Workflow Management Access Control', () => {
    describe('GET /api/workflows - Read Access', () => {
      const createMockUser = (role: string) => ({
        id: `user-${role}`,
        email: `${role.toLowerCase()}@example.com`,
        role,
        companyId: mockCompanyId,
        name: `${role} User`,
      })

      it('should allow COMPANY_ADMIN to view workflows', async () => {
        const user = createMockUser('COMPANY_ADMIN')
        const token = generateToken(user.id, user.email, user.role)

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)
        ;(prisma.approvalWorkflow.findMany as jest.Mock).mockResolvedValue([])

        const request = new NextRequest('http://localhost:3000/api/workflows', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })

        const response = await getWorkflows(request)

        expect(response.status).toBe(200)
      })

      it('should allow SUPER_ADMIN to view workflows', async () => {
        const user = createMockUser('SUPER_ADMIN')
        const token = generateToken(user.id, user.email, user.role)

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)
        ;(prisma.approvalWorkflow.findMany as jest.Mock).mockResolvedValue([])

        const request = new NextRequest('http://localhost:3000/api/workflows', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })

        const response = await getWorkflows(request)

        expect(response.status).toBe(200)
      })

      it('should allow FINANCE_MANAGER to view workflows', async () => {
        const user = createMockUser('FINANCE_MANAGER')
        const token = generateToken(user.id, user.email, user.role)

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)
        ;(prisma.approvalWorkflow.findMany as jest.Mock).mockResolvedValue([])

        const request = new NextRequest('http://localhost:3000/api/workflows', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })

        const response = await getWorkflows(request)

        expect(response.status).toBe(200)
      })

      it('should allow GENERAL_MANAGER to view workflows', async () => {
        const user = createMockUser('GENERAL_MANAGER')
        const token = generateToken(user.id, user.email, user.role)

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)
        ;(prisma.approvalWorkflow.findMany as jest.Mock).mockResolvedValue([])

        const request = new NextRequest('http://localhost:3000/api/workflows', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })

        const response = await getWorkflows(request)

        expect(response.status).toBe(200)
      })

      it('should deny EMPLOYEE from viewing workflows', async () => {
        const user = createMockUser('EMPLOYEE')
        const token = generateToken(user.id, user.email, user.role)

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)

        const request = new NextRequest('http://localhost:3000/api/workflows', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })

        const response = await getWorkflows(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Yetkiniz yok')
      })

      it('should deny DEPARTMENT_MANAGER from viewing workflows', async () => {
        const user = createMockUser('DEPARTMENT_MANAGER')
        const token = generateToken(user.id, user.email, user.role)

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)

        const request = new NextRequest('http://localhost:3000/api/workflows', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })

        const response = await getWorkflows(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Yetkiniz yok')
      })

      it('should deny PROCUREMENT_MANAGER from viewing workflows', async () => {
        const user = createMockUser('PROCUREMENT_MANAGER')
        const token = generateToken(user.id, user.email, user.role)

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)

        const request = new NextRequest('http://localhost:3000/api/workflows', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })

        const response = await getWorkflows(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Yetkiniz yok')
      })
    })

    describe('POST /api/workflows - Create Access', () => {
      const mockWorkflowData = {
        name: 'Test Workflow',
        description: 'Test workflow description',
        minAmount: 0,
        maxAmount: 1000,
        isActive: true,
        steps: [
          {
            name: 'Manager Approval',
            description: 'Department manager approval',
            requiredApprovals: 1,
            approverIds: [],
          },
        ],
      }

      const createMockUser = (role: string) => ({
        id: `user-${role}`,
        email: `${role.toLowerCase()}@example.com`,
        role,
        companyId: mockCompanyId,
        name: `${role} User`,
      })

      it('should allow COMPANY_ADMIN to create workflows', async () => {
        const user = createMockUser('COMPANY_ADMIN')
        const token = generateToken(user.id, user.email, user.role)

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)
        ;(prisma.approvalWorkflow.findFirst as jest.Mock).mockResolvedValue(null)
        ;(prisma.approvalWorkflow.create as jest.Mock).mockResolvedValue({
          id: 'workflow-123',
          ...mockWorkflowData,
        })

        const request = new NextRequest('http://localhost:3000/api/workflows', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockWorkflowData),
        })

        const response = await createWorkflow(request)

        expect(response.status).toBe(201)
      })

      it('should allow SUPER_ADMIN to create workflows', async () => {
        const user = createMockUser('SUPER_ADMIN')
        const token = generateToken(user.id, user.email, user.role)

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)
        ;(prisma.approvalWorkflow.findFirst as jest.Mock).mockResolvedValue(null)
        ;(prisma.approvalWorkflow.create as jest.Mock).mockResolvedValue({
          id: 'workflow-123',
          ...mockWorkflowData,
        })

        const request = new NextRequest('http://localhost:3000/api/workflows', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockWorkflowData),
        })

        const response = await createWorkflow(request)

        expect(response.status).toBe(201)
      })

      it('should deny FINANCE_MANAGER from creating workflows', async () => {
        const user = createMockUser('FINANCE_MANAGER')
        const token = generateToken(user.id, user.email, user.role)

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)

        const request = new NextRequest('http://localhost:3000/api/workflows', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockWorkflowData),
        })

        const response = await createWorkflow(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Yetkiniz yok')
      })

      it('should deny GENERAL_MANAGER from creating workflows', async () => {
        const user = createMockUser('GENERAL_MANAGER')
        const token = generateToken(user.id, user.email, user.role)

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)

        const request = new NextRequest('http://localhost:3000/api/workflows', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockWorkflowData),
        })

        const response = await createWorkflow(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Yetkiniz yok')
      })

      it('should deny EMPLOYEE from creating workflows', async () => {
        const user = createMockUser('EMPLOYEE')
        const token = generateToken(user.id, user.email, user.role)

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)

        const request = new NextRequest('http://localhost:3000/api/workflows', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockWorkflowData),
        })

        const response = await createWorkflow(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Yetkiniz yok')
      })

      it('should deny DEPARTMENT_MANAGER from creating workflows', async () => {
        const user = createMockUser('DEPARTMENT_MANAGER')
        const token = generateToken(user.id, user.email, user.role)

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)

        const request = new NextRequest('http://localhost:3000/api/workflows', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockWorkflowData),
        })

        const response = await createWorkflow(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Yetkiniz yok')
      })

      it('should deny PROCUREMENT_MANAGER from creating workflows', async () => {
        const user = createMockUser('PROCUREMENT_MANAGER')
        const token = generateToken(user.id, user.email, user.role)

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)

        const request = new NextRequest('http://localhost:3000/api/workflows', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mockWorkflowData),
        })

        const response = await createWorkflow(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Yetkiniz yok')
      })
    })
  })

  describe('Cross-Company Access Isolation', () => {
    it('should only return workflows for user\'s company', async () => {
      const user = {
        id: 'user-123',
        email: 'admin@company1.com',
        role: 'COMPANY_ADMIN',
        companyId: 'company-1',
        name: 'Admin',
      }
      const token = generateToken(user.id, user.email, user.role)

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)
      ;(prisma.approvalWorkflow.findMany as jest.Mock).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      await getWorkflows(request)

      // Verify that findMany was called with user's companyId
      expect(prisma.approvalWorkflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: 'company-1',
          }),
        })
      )
    })

    it('should create workflow only for user\'s company', async () => {
      const user = {
        id: 'user-123',
        email: 'admin@company1.com',
        role: 'COMPANY_ADMIN',
        companyId: 'company-1',
        name: 'Admin',
      }
      const token = generateToken(user.id, user.email, user.role)

      const mockWorkflowData = {
        name: 'Test Workflow',
        description: 'Test',
        minAmount: 0,
        maxAmount: 1000,
        steps: [
          {
            name: 'Step 1',
            requiredApprovals: 1,
          },
        ],
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)
      ;(prisma.approvalWorkflow.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.approvalWorkflow.create as jest.Mock).mockResolvedValue({
        id: 'workflow-123',
        ...mockWorkflowData,
      })

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mockWorkflowData),
      })

      await createWorkflow(request)

      // Verify that create was called with user's companyId
      expect(prisma.approvalWorkflow.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: 'company-1',
          }),
        })
      )
    })
  })

  describe('Role Hierarchy', () => {
    it('should grant SUPER_ADMIN highest privileges', async () => {
      const user = {
        id: 'super-admin',
        email: 'superadmin@platform.com',
        role: 'SUPER_ADMIN',
        companyId: 'any-company',
        name: 'Super Admin',
      }
      const token = generateToken(user.id, user.email, user.role)

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)
      ;(prisma.approvalWorkflow.findMany as jest.Mock).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      const response = await getWorkflows(request)

      expect(response.status).toBe(200)
    })

    it('should differentiate between read and write permissions', async () => {
      // FINANCE_MANAGER can read but not write
      const financeManager = {
        id: 'finance-mgr',
        email: 'finance@company.com',
        role: 'FINANCE_MANAGER',
        companyId: 'company-1',
        name: 'Finance Manager',
      }
      const token = generateToken(financeManager.id, financeManager.email, financeManager.role)

      // Can read
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(financeManager)
      ;(prisma.approvalWorkflow.findMany as jest.Mock).mockResolvedValue([])

      const getRequest = new NextRequest('http://localhost:3000/api/workflows', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      const getResponse = await getWorkflows(getRequest)
      expect(getResponse.status).toBe(200)

      // Cannot write
      const postRequest = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'Test',
          minAmount: 0,
          steps: [{ name: 'Step 1' }],
        }),
      })

      const postResponse = await createWorkflow(postRequest)
      expect(postResponse.status).toBe(403)
    })
  })

  describe('Token Validation', () => {
    it('should return 404 when user not found despite valid token', async () => {
      const token = generateToken('nonexistent-user', 'test@example.com', 'COMPANY_ADMIN')

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      const response = await getWorkflows(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Kullanıcı bulunamadı')
    })

    it('should validate token on every request', async () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'COMPANY_ADMIN',
        companyId: 'company-1',
        name: 'Test User',
      }
      const token = generateToken(user.id, user.email, user.role)

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)
      ;(prisma.approvalWorkflow.findMany as jest.Mock).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      await getWorkflows(request)

      // Verify user was looked up by userId from token
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: user.id },
      })
    })
  })
})
