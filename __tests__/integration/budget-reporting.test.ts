import { NextRequest } from 'next/server'
import { GET } from '@/app/api/reports/budget/route'
import { generateToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    budget: {
      findMany: jest.fn(),
    },
    purchaseRequest: {
      aggregate: jest.fn(),
    },
  },
}))

describe('Budget Reporting Integration Tests', () => {
  const mockUserId = 'user-123'
  const mockEmail = 'test@example.com'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/reports/budget', () => {
    describe('Authentication', () => {
      it('should return 401 when no token provided', async () => {
        const request = new NextRequest('http://localhost:3000/api/reports/budget')

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Token gerekli')
      })

      it('should return 401 when invalid token provided', async () => {
        const request = new NextRequest('http://localhost:3000/api/reports/budget', {
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

    describe('Budget Calculations', () => {
      const mockBudgets = [
        {
          id: 'budget-1',
          departmentId: 'dept-1',
          year: 2024,
          month: 3,
          amount: 10000,
          reserved: 2000,
          department: {
            id: 'dept-1',
            name: 'IT Department',
            code: 'IT',
            manager: {
              name: 'John Manager',
              email: 'john@example.com',
            },
          },
        },
        {
          id: 'budget-2',
          departmentId: 'dept-2',
          year: 2024,
          month: 3,
          amount: 15000,
          reserved: 1000,
          department: {
            id: 'dept-2',
            name: 'HR Department',
            code: 'HR',
            manager: {
              name: 'Jane Manager',
              email: 'jane@example.com',
            },
          },
        },
      ]

      it('should calculate budget utilization correctly', async () => {
        const token = generateToken(mockUserId, mockEmail, 'FINANCE_MANAGER')

        ;(prisma.budget.findMany as jest.Mock).mockResolvedValue(mockBudgets)
        ;(prisma.purchaseRequest.aggregate as jest.Mock)
          .mockResolvedValueOnce({
            _sum: { estimatedTotal: 5000 }, // dept-1: spent 5000 out of 10000
          })
          .mockResolvedValueOnce({
            _sum: { estimatedTotal: 12000 }, // dept-2: spent 12000 out of 15000
          })

        const request = new NextRequest(
          'http://localhost:3000/api/reports/budget?year=2024&month=3',
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        )

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)

        // Check department-level calculations
        const dept1 = data.data.byDepartment[0]
        expect(dept1.spent).toBe(5000)
        expect(dept1.reserved).toBe(2000)
        expect(dept1.available).toBe(3000) // 10000 - 5000 - 2000
        expect(dept1.utilization).toBe(50) // (5000 / 10000) * 100

        const dept2 = data.data.byDepartment[1]
        expect(dept2.spent).toBe(12000)
        expect(dept2.reserved).toBe(1000)
        expect(dept2.available).toBe(2000) // 15000 - 12000 - 1000
        expect(dept2.utilization).toBe(80) // (12000 / 15000) * 100
      })

      it('should calculate overall summary correctly', async () => {
        const token = generateToken(mockUserId, mockEmail, 'FINANCE_MANAGER')

        ;(prisma.budget.findMany as jest.Mock).mockResolvedValue(mockBudgets)
        ;(prisma.purchaseRequest.aggregate as jest.Mock)
          .mockResolvedValueOnce({
            _sum: { estimatedTotal: 5000 },
          })
          .mockResolvedValueOnce({
            _sum: { estimatedTotal: 12000 },
          })

        const request = new NextRequest(
          'http://localhost:3000/api/reports/budget?year=2024&month=3',
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        )

        const response = await GET(request)
        const data = await response.json()

        const summary = data.data.summary
        expect(summary.totalBudget).toBe(25000) // 10000 + 15000
        expect(summary.totalSpent).toBe(17000) // 5000 + 12000
        expect(summary.totalReserved).toBe(3000) // 2000 + 1000
        expect(summary.totalAvailable).toBe(5000) // 25000 - 17000 - 3000
        expect(summary.utilizationPercent).toBe(68) // (17000 / 25000) * 100
      })

      it('should handle zero budget correctly', async () => {
        const token = generateToken(mockUserId, mockEmail, 'FINANCE_MANAGER')

        const zeroBudget = [
          {
            id: 'budget-1',
            departmentId: 'dept-1',
            year: 2024,
            month: 3,
            amount: 0,
            reserved: 0,
            department: {
              id: 'dept-1',
              name: 'New Department',
              code: 'NEW',
              manager: null,
            },
          },
        ]

        ;(prisma.budget.findMany as jest.Mock).mockResolvedValue(zeroBudget)
        ;(prisma.purchaseRequest.aggregate as jest.Mock).mockResolvedValue({
          _sum: { estimatedTotal: 0 },
        })

        const request = new NextRequest(
          'http://localhost:3000/api/reports/budget?year=2024&month=3',
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        )

        const response = await GET(request)
        const data = await response.json()

        const dept = data.data.byDepartment[0]
        expect(dept.utilization).toBe(0)
        expect(data.data.summary.utilizationPercent).toBe(0)
      })

      it('should handle null spending correctly', async () => {
        const token = generateToken(mockUserId, mockEmail, 'FINANCE_MANAGER')

        ;(prisma.budget.findMany as jest.Mock).mockResolvedValue([mockBudgets[0]])
        ;(prisma.purchaseRequest.aggregate as jest.Mock).mockResolvedValue({
          _sum: { estimatedTotal: null }, // No approved requests
        })

        const request = new NextRequest(
          'http://localhost:3000/api/reports/budget?year=2024&month=3',
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        )

        const response = await GET(request)
        const data = await response.json()

        const dept = data.data.byDepartment[0]
        expect(dept.spent).toBe(0)
        expect(dept.available).toBe(8000) // 10000 - 0 - 2000
      })
    })

    describe('Budget Status Classification', () => {
      it('should mark utilization > 90% as critical', async () => {
        const token = generateToken(mockUserId, mockEmail, 'FINANCE_MANAGER')

        const budget = [
          {
            id: 'budget-1',
            departmentId: 'dept-1',
            year: 2024,
            month: 3,
            amount: 10000,
            reserved: 0,
            department: {
              id: 'dept-1',
              name: 'Critical Dept',
              code: 'CRIT',
              manager: null,
            },
          },
        ]

        ;(prisma.budget.findMany as jest.Mock).mockResolvedValue(budget)
        ;(prisma.purchaseRequest.aggregate as jest.Mock).mockResolvedValue({
          _sum: { estimatedTotal: 9500 }, // 95% utilization
        })

        const request = new NextRequest(
          'http://localhost:3000/api/reports/budget?year=2024&month=3',
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        )

        const response = await GET(request)
        const data = await response.json()

        const dept = data.data.byDepartment[0]
        expect(dept.utilization).toBe(95)
        expect(dept.status).toBe('critical')
      })

      it('should mark utilization > 75% as warning', async () => {
        const token = generateToken(mockUserId, mockEmail, 'FINANCE_MANAGER')

        const budget = [
          {
            id: 'budget-1',
            departmentId: 'dept-1',
            year: 2024,
            month: 3,
            amount: 10000,
            reserved: 0,
            department: {
              id: 'dept-1',
              name: 'Warning Dept',
              code: 'WARN',
              manager: null,
            },
          },
        ]

        ;(prisma.budget.findMany as jest.Mock).mockResolvedValue(budget)
        ;(prisma.purchaseRequest.aggregate as jest.Mock).mockResolvedValue({
          _sum: { estimatedTotal: 8000 }, // 80% utilization
        })

        const request = new NextRequest(
          'http://localhost:3000/api/reports/budget?year=2024&month=3',
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        )

        const response = await GET(request)
        const data = await response.json()

        const dept = data.data.byDepartment[0]
        expect(dept.utilization).toBe(80)
        expect(dept.status).toBe('warning')
      })

      it('should mark utilization <= 75% as normal', async () => {
        const token = generateToken(mockUserId, mockEmail, 'FINANCE_MANAGER')

        const budget = [
          {
            id: 'budget-1',
            departmentId: 'dept-1',
            year: 2024,
            month: 3,
            amount: 10000,
            reserved: 0,
            department: {
              id: 'dept-1',
              name: 'Normal Dept',
              code: 'NORM',
              manager: null,
            },
          },
        ]

        ;(prisma.budget.findMany as jest.Mock).mockResolvedValue(budget)
        ;(prisma.purchaseRequest.aggregate as jest.Mock).mockResolvedValue({
          _sum: { estimatedTotal: 5000 }, // 50% utilization
        })

        const request = new NextRequest(
          'http://localhost:3000/api/reports/budget?year=2024&month=3',
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        )

        const response = await GET(request)
        const data = await response.json()

        const dept = data.data.byDepartment[0]
        expect(dept.utilization).toBe(50)
        expect(dept.status).toBe('normal')
      })
    })

    describe('Query Parameters', () => {
      it('should use current year when year not provided', async () => {
        const token = generateToken(mockUserId, mockEmail, 'FINANCE_MANAGER')
        const currentYear = new Date().getFullYear()

        ;(prisma.budget.findMany as jest.Mock).mockResolvedValue([])

        const request = new NextRequest('http://localhost:3000/api/reports/budget', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })

        await GET(request)

        expect(prisma.budget.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              year: currentYear,
            }),
          })
        )
      })

      it('should filter by specific year when provided', async () => {
        const token = generateToken(mockUserId, mockEmail, 'FINANCE_MANAGER')

        ;(prisma.budget.findMany as jest.Mock).mockResolvedValue([])

        const request = new NextRequest(
          'http://localhost:3000/api/reports/budget?year=2023',
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        )

        await GET(request)

        expect(prisma.budget.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              year: 2023,
            }),
          })
        )
      })

      it('should filter by month when provided', async () => {
        const token = generateToken(mockUserId, mockEmail, 'FINANCE_MANAGER')

        ;(prisma.budget.findMany as jest.Mock).mockResolvedValue([])

        const request = new NextRequest(
          'http://localhost:3000/api/reports/budget?year=2024&month=6',
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        )

        await GET(request)

        expect(prisma.budget.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              year: 2024,
              month: 6,
            }),
          })
        )
      })

      it('should not filter by month when not provided', async () => {
        const token = generateToken(mockUserId, mockEmail, 'FINANCE_MANAGER')

        ;(prisma.budget.findMany as jest.Mock).mockResolvedValue([])

        const request = new NextRequest(
          'http://localhost:3000/api/reports/budget?year=2024',
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        )

        await GET(request)

        const callArgs = (prisma.budget.findMany as jest.Mock).mock.calls[0][0]
        expect(callArgs.where.month).toBeUndefined()
      })
    })

    describe('Error Handling', () => {
      it('should return 500 on database error', async () => {
        const token = generateToken(mockUserId, mockEmail, 'FINANCE_MANAGER')

        ;(prisma.budget.findMany as jest.Mock).mockRejectedValue(
          new Error('Database error')
        )

        const request = new NextRequest('http://localhost:3000/api/reports/budget', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Bütçe raporu yüklenemedi')
      })
    })

    describe('Spending Time Range', () => {
      it('should aggregate spending for specific month', async () => {
        const token = generateToken(mockUserId, mockEmail, 'FINANCE_MANAGER')

        const budget = [
          {
            id: 'budget-1',
            departmentId: 'dept-1',
            year: 2024,
            month: 3,
            amount: 10000,
            reserved: 0,
            department: {
              id: 'dept-1',
              name: 'IT',
              code: 'IT',
              manager: null,
            },
          },
        ]

        ;(prisma.budget.findMany as jest.Mock).mockResolvedValue(budget)
        ;(prisma.purchaseRequest.aggregate as jest.Mock).mockResolvedValue({
          _sum: { estimatedTotal: 5000 },
        })

        const request = new NextRequest(
          'http://localhost:3000/api/reports/budget?year=2024&month=3',
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        )

        await GET(request)

        // Verify aggregate was called with correct date range for March 2024
        expect(prisma.purchaseRequest.aggregate).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              createdAt: {
                gte: new Date(2024, 2, 1), // March 1, 2024 (month is 0-indexed)
                lt: new Date(2024, 3, 0, 23, 59, 59), // March 31, 2024
              },
            }),
          })
        )
      })

      it('should aggregate spending for entire year when month not specified', async () => {
        const token = generateToken(mockUserId, mockEmail, 'FINANCE_MANAGER')

        const budget = [
          {
            id: 'budget-1',
            departmentId: 'dept-1',
            year: 2024,
            month: null,
            amount: 120000,
            reserved: 0,
            department: {
              id: 'dept-1',
              name: 'IT',
              code: 'IT',
              manager: null,
            },
          },
        ]

        ;(prisma.budget.findMany as jest.Mock).mockResolvedValue(budget)
        ;(prisma.purchaseRequest.aggregate as jest.Mock).mockResolvedValue({
          _sum: { estimatedTotal: 60000 },
        })

        const request = new NextRequest(
          'http://localhost:3000/api/reports/budget?year=2024',
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        )

        await GET(request)

        // Verify aggregate was called with correct date range for entire 2024
        expect(prisma.purchaseRequest.aggregate).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              createdAt: {
                gte: new Date(2024, 0, 1), // January 1, 2024
                lt: new Date(2024, 12, 0, 23, 59, 59), // December 31, 2024
              },
            }),
          })
        )
      })
    })
  })
})
