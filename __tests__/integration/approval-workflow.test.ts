import { NextRequest } from 'next/server'
import { POST } from '@/app/api/purchase-requests/[requestId]/approve/route'
import { generateToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    purchaseRequest: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    approvalAction: {
      create: jest.fn(),
    },
  },
}))

describe('Approval Workflow Integration Tests', () => {
  const mockRequestId = 'req-123'
  const mockApproverId = 'approver-123'
  const mockApproverEmail = 'approver@example.com'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/purchase-requests/[requestId]/approve', () => {
    describe('Authentication & Authorization', () => {
      it('should return 401 when no token provided', async () => {
        const request = new NextRequest(
          `http://localhost:3000/api/purchase-requests/${mockRequestId}/approve`,
          {
            method: 'POST',
            body: JSON.stringify({ action: 'APPROVED', comments: '' }),
          }
        )

        const response = await POST(request, { params: { requestId: mockRequestId } })
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Token gerekli')
      })

      it('should return 401 when invalid token provided', async () => {
        const request = new NextRequest(
          `http://localhost:3000/api/purchase-requests/${mockRequestId}/approve`,
          {
            method: 'POST',
            headers: {
              authorization: 'Bearer invalid-token',
            },
            body: JSON.stringify({ action: 'APPROVED', comments: '' }),
          }
        )

        const response = await POST(request, { params: { requestId: mockRequestId } })
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Geçersiz token')
      })

      it('should return 404 when purchase request not found', async () => {
        const token = generateToken(mockApproverId, mockApproverEmail, 'DEPARTMENT_MANAGER')

        ;(prisma.purchaseRequest.findUnique as jest.Mock).mockResolvedValue(null)

        const request = new NextRequest(
          `http://localhost:3000/api/purchase-requests/${mockRequestId}/approve`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: 'APPROVED', comments: '' }),
          }
        )

        const response = await POST(request, { params: { requestId: mockRequestId } })
        const data = await response.json()

        expect(response.status).toBe(404)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Talep bulunamadı')
      })

      it('should return 400 when workflow not defined', async () => {
        const token = generateToken(mockApproverId, mockApproverEmail, 'DEPARTMENT_MANAGER')

        ;(prisma.purchaseRequest.findUnique as jest.Mock).mockResolvedValue({
          id: mockRequestId,
          workflow: null,
        })

        const request = new NextRequest(
          `http://localhost:3000/api/purchase-requests/${mockRequestId}/approve`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: 'APPROVED', comments: '' }),
          }
        )

        const response = await POST(request, { params: { requestId: mockRequestId } })
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Onay süreci tanımlı değil')
      })

      it('should return 403 when user lacks approval permission for current step', async () => {
        const token = generateToken(mockApproverId, mockApproverEmail, 'EMPLOYEE')

        const mockRequest = {
          id: mockRequestId,
          currentStep: 0,
          workflow: {
            steps: [
              {
                stepOrder: 0,
                approverRole: 'DEPARTMENT_MANAGER',
                approverId: null,
              },
            ],
          },
          approvalActions: [],
        }

        ;(prisma.purchaseRequest.findUnique as jest.Mock).mockResolvedValue(mockRequest)

        const request = new NextRequest(
          `http://localhost:3000/api/purchase-requests/${mockRequestId}/approve`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: 'APPROVED', comments: '' }),
          }
        )

        const response = await POST(request, { params: { requestId: mockRequestId } })
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Bu adımı onaylama yetkiniz yok')
      })
    })

    describe('Approval Actions', () => {
      it('should approve and move to next step', async () => {
        const token = generateToken(mockApproverId, mockApproverEmail, 'DEPARTMENT_MANAGER')

        const mockRequest = {
          id: mockRequestId,
          status: 'SUBMITTED',
          currentStep: 0,
          workflow: {
            steps: [
              {
                stepOrder: 0,
                approverRole: 'DEPARTMENT_MANAGER',
              },
              {
                stepOrder: 1,
                approverRole: 'FINANCE_MANAGER',
              },
            ],
          },
          approvalActions: [],
        }

        const mockUpdatedRequest = {
          ...mockRequest,
          status: 'IN_REVIEW',
          currentStep: 1,
        }

        ;(prisma.purchaseRequest.findUnique as jest.Mock).mockResolvedValue(mockRequest)
        ;(prisma.approvalAction.create as jest.Mock).mockResolvedValue({})
        ;(prisma.purchaseRequest.update as jest.Mock).mockResolvedValue(mockUpdatedRequest)

        const request = new NextRequest(
          `http://localhost:3000/api/purchase-requests/${mockRequestId}/approve`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: 'APPROVED', comments: 'Looks good' }),
          }
        )

        const response = await POST(request, { params: { requestId: mockRequestId } })
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('Talep onaylandı')

        // Verify approval action created
        expect(prisma.approvalAction.create).toHaveBeenCalledWith({
          data: {
            requestId: mockRequestId,
            stepOrder: 0,
            approverId: mockApproverId,
            action: 'APPROVED',
            comments: 'Looks good',
          },
        })

        // Verify request updated to next step
        expect(prisma.purchaseRequest.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: mockRequestId },
            data: {
              status: 'IN_REVIEW',
              currentStep: 1,
            },
          })
        )
      })

      it('should approve and set status to APPROVED when all steps complete', async () => {
        const token = generateToken(mockApproverId, mockApproverEmail, 'FINANCE_MANAGER')

        const mockRequest = {
          id: mockRequestId,
          status: 'IN_REVIEW',
          currentStep: 1,
          workflow: {
            steps: [
              {
                stepOrder: 0,
                approverRole: 'DEPARTMENT_MANAGER',
              },
              {
                stepOrder: 1,
                approverRole: 'FINANCE_MANAGER',
              },
            ],
          },
          approvalActions: [],
        }

        const mockUpdatedRequest = {
          ...mockRequest,
          status: 'APPROVED',
          currentStep: 1,
        }

        ;(prisma.purchaseRequest.findUnique as jest.Mock).mockResolvedValue(mockRequest)
        ;(prisma.approvalAction.create as jest.Mock).mockResolvedValue({})
        ;(prisma.purchaseRequest.update as jest.Mock).mockResolvedValue(mockUpdatedRequest)

        const request = new NextRequest(
          `http://localhost:3000/api/purchase-requests/${mockRequestId}/approve`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: 'APPROVED', comments: 'Final approval' }),
          }
        )

        const response = await POST(request, { params: { requestId: mockRequestId } })
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)

        // Verify status changed to APPROVED
        expect(prisma.purchaseRequest.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: {
              status: 'APPROVED',
              currentStep: 1, // Stays at last step
            },
          })
        )
      })

      it('should reject request', async () => {
        const token = generateToken(mockApproverId, mockApproverEmail, 'DEPARTMENT_MANAGER')

        const mockRequest = {
          id: mockRequestId,
          status: 'SUBMITTED',
          currentStep: 0,
          workflow: {
            steps: [
              {
                stepOrder: 0,
                approverRole: 'DEPARTMENT_MANAGER',
              },
            ],
          },
          approvalActions: [],
        }

        const mockUpdatedRequest = {
          ...mockRequest,
          status: 'REJECTED',
        }

        ;(prisma.purchaseRequest.findUnique as jest.Mock).mockResolvedValue(mockRequest)
        ;(prisma.approvalAction.create as jest.Mock).mockResolvedValue({})
        ;(prisma.purchaseRequest.update as jest.Mock).mockResolvedValue(mockUpdatedRequest)

        const request = new NextRequest(
          `http://localhost:3000/api/purchase-requests/${mockRequestId}/approve`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: 'REJECTED', comments: 'Budget exceeded' }),
          }
        )

        const response = await POST(request, { params: { requestId: mockRequestId } })
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('Talep reddedildi')

        // Verify status changed to REJECTED
        expect(prisma.purchaseRequest.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: {
              status: 'REJECTED',
              currentStep: 0, // Stays at current step
            },
          })
        )
      })

      it('should return request to requester for revision', async () => {
        const token = generateToken(mockApproverId, mockApproverEmail, 'DEPARTMENT_MANAGER')

        const mockRequest = {
          id: mockRequestId,
          status: 'IN_REVIEW',
          currentStep: 1,
          workflow: {
            steps: [
              {
                stepOrder: 0,
                approverRole: 'DEPARTMENT_MANAGER',
              },
              {
                stepOrder: 1,
                approverRole: 'FINANCE_MANAGER',
              },
            ],
          },
          approvalActions: [],
        }

        const mockUpdatedRequest = {
          ...mockRequest,
          status: 'DRAFT',
          currentStep: 0,
        }

        ;(prisma.purchaseRequest.findUnique as jest.Mock).mockResolvedValue(mockRequest)
        ;(prisma.approvalAction.create as jest.Mock).mockResolvedValue({})
        ;(prisma.purchaseRequest.update as jest.Mock).mockResolvedValue(mockUpdatedRequest)

        const request = new NextRequest(
          `http://localhost:3000/api/purchase-requests/${mockRequestId}/approve`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              action: 'RETURNED',
              comments: 'Please provide more details',
            }),
          }
        )

        const response = await POST(request, { params: { requestId: mockRequestId } })
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('Talep geri gönderildi')

        // Verify status changed to DRAFT and step reset
        expect(prisma.purchaseRequest.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: {
              status: 'DRAFT',
              currentStep: 0, // Reset to first step
            },
          })
        )
      })
    })

    describe('Role-Based Approval Authorization', () => {
      it('should allow approval by approverRole', async () => {
        const token = generateToken(mockApproverId, mockApproverEmail, 'DEPARTMENT_MANAGER')

        const mockRequest = {
          id: mockRequestId,
          status: 'SUBMITTED',
          currentStep: 0,
          workflow: {
            steps: [
              {
                stepOrder: 0,
                approverRole: 'DEPARTMENT_MANAGER',
                approverId: null,
              },
            ],
          },
          approvalActions: [],
        }

        ;(prisma.purchaseRequest.findUnique as jest.Mock).mockResolvedValue(mockRequest)
        ;(prisma.approvalAction.create as jest.Mock).mockResolvedValue({})
        ;(prisma.purchaseRequest.update as jest.Mock).mockResolvedValue({})

        const request = new NextRequest(
          `http://localhost:3000/api/purchase-requests/${mockRequestId}/approve`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: 'APPROVED', comments: '' }),
          }
        )

        const response = await POST(request, { params: { requestId: mockRequestId } })

        expect(response.status).toBe(200)
      })

      it('should allow approval by specific approverId', async () => {
        const token = generateToken(mockApproverId, mockApproverEmail, 'EMPLOYEE')

        const mockRequest = {
          id: mockRequestId,
          status: 'SUBMITTED',
          currentStep: 0,
          workflow: {
            steps: [
              {
                stepOrder: 0,
                approverRole: null,
                approverId: mockApproverId,
              },
            ],
          },
          approvalActions: [],
        }

        ;(prisma.purchaseRequest.findUnique as jest.Mock).mockResolvedValue(mockRequest)
        ;(prisma.approvalAction.create as jest.Mock).mockResolvedValue({})
        ;(prisma.purchaseRequest.update as jest.Mock).mockResolvedValue({})

        const request = new NextRequest(
          `http://localhost:3000/api/purchase-requests/${mockRequestId}/approve`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: 'APPROVED', comments: '' }),
          }
        )

        const response = await POST(request, { params: { requestId: mockRequestId } })

        expect(response.status).toBe(200)
      })

      it('should allow ADMIN to approve any step', async () => {
        const token = generateToken(mockApproverId, mockApproverEmail, 'ADMIN')

        const mockRequest = {
          id: mockRequestId,
          status: 'SUBMITTED',
          currentStep: 0,
          workflow: {
            steps: [
              {
                stepOrder: 0,
                approverRole: 'DEPARTMENT_MANAGER',
                approverId: 'someone-else',
              },
            ],
          },
          approvalActions: [],
        }

        ;(prisma.purchaseRequest.findUnique as jest.Mock).mockResolvedValue(mockRequest)
        ;(prisma.approvalAction.create as jest.Mock).mockResolvedValue({})
        ;(prisma.purchaseRequest.update as jest.Mock).mockResolvedValue({})

        const request = new NextRequest(
          `http://localhost:3000/api/purchase-requests/${mockRequestId}/approve`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: 'APPROVED', comments: '' }),
          }
        )

        const response = await POST(request, { params: { requestId: mockRequestId } })

        expect(response.status).toBe(200)
      })

      it('should allow GENERAL_MANAGER to approve any step', async () => {
        const token = generateToken(mockApproverId, mockApproverEmail, 'GENERAL_MANAGER')

        const mockRequest = {
          id: mockRequestId,
          status: 'SUBMITTED',
          currentStep: 0,
          workflow: {
            steps: [
              {
                stepOrder: 0,
                approverRole: 'DEPARTMENT_MANAGER',
              },
            ],
          },
          approvalActions: [],
        }

        ;(prisma.purchaseRequest.findUnique as jest.Mock).mockResolvedValue(mockRequest)
        ;(prisma.approvalAction.create as jest.Mock).mockResolvedValue({})
        ;(prisma.purchaseRequest.update as jest.Mock).mockResolvedValue({})

        const request = new NextRequest(
          `http://localhost:3000/api/purchase-requests/${mockRequestId}/approve`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: 'APPROVED', comments: '' }),
          }
        )

        const response = await POST(request, { params: { requestId: mockRequestId } })

        expect(response.status).toBe(200)
      })
    })

    describe('Error Handling', () => {
      it('should return 500 on database error', async () => {
        const token = generateToken(mockApproverId, mockApproverEmail, 'DEPARTMENT_MANAGER')

        ;(prisma.purchaseRequest.findUnique as jest.Mock).mockRejectedValue(
          new Error('Database error')
        )

        const request = new NextRequest(
          `http://localhost:3000/api/purchase-requests/${mockRequestId}/approve`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: 'APPROVED', comments: '' }),
          }
        )

        const response = await POST(request, { params: { requestId: mockRequestId } })
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Onay işlemi başarısız')
      })
    })
  })
})
