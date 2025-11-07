import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/users/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/session'

// Mock dependencies
jest.mock('@/lib/session')
jest.mock('@/lib/prisma')
jest.mock('@/lib/audit')

const mockSession = {
  user: {
    id: 'user-123',
    email: 'admin@company.com',
    name: 'Admin User',
    role: 'ADMIN',
    companyId: 'company-123',
  },
  expires: '2024-12-31',
}

const mockUsers = [
  {
    id: 'user-1',
    email: 'user1@company.com',
    name: 'User One',
    role: 'EMPLOYEE',
    companyId: 'company-123',
    phone: '+1234567890',
    departmentId: 'dept-1',
    department: { id: 'dept-1', name: 'IT' },
    position: 'Developer',
    employeeId: 'EMP001',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user-2',
    email: 'user2@company.com',
    name: 'User Two',
    role: 'MANAGER',
    companyId: 'company-123',
    phone: '+1234567891',
    departmentId: 'dept-2',
    department: { id: 'dept-2', name: 'HR' },
    position: 'Manager',
    employeeId: 'EMP002',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

describe('API /api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
  })

  describe('GET /api/users', () => {
    it('should return all users for authenticated admin', async () => {
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers)

      const request = new NextRequest('http://localhost:3000/api/users')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].email).toBe('user1@company.com')
    })

    it('should filter users by role', async () => {
      const filteredUsers = mockUsers.filter(u => u.role === 'MANAGER')
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue(filteredUsers)

      const request = new NextRequest('http://localhost:3000/api/users?role=MANAGER')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].role).toBe('MANAGER')
    })

    it('should filter users by department', async () => {
      const filteredUsers = mockUsers.filter(u => u.departmentId === 'dept-1')
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue(filteredUsers)

      const request = new NextRequest('http://localhost:3000/api/users?departmentId=dept-1')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].departmentId).toBe('dept-1')
    })

    it('should return 401 for unauthenticated requests', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/users')
      const response = await GET(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })

    it('should only return users from same company', async () => {
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers)

      const request = new NextRequest('http://localhost:3000/api/users')
      await GET(request)

      // Verify the where clause includes companyId
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: 'company-123',
          }),
        })
      )
    })
  })

  describe('POST /api/users', () => {
    const newUserData = {
      email: 'newuser@company.com',
      name: 'New User',
      password: 'SecurePass123!',
      role: 'EMPLOYEE',
      phone: '+1234567892',
      departmentId: 'dept-1',
      position: 'Developer',
      employeeId: 'EMP003',
    }

    it('should create new user with valid data', async () => {
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-new',
        ...newUserData,
        password: 'hashed',
        companyId: 'company-123',
        department: { id: 'dept-1', name: 'IT' },
        createdAt: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.email).toBe(newUserData.email)
    })

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        email: 'test@company.com',
        // missing name, password, role
      }

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.success).toBe(false)
    })

    it('should return 400 for duplicate email', async () => {
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUsers[0])

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('already exists')
    })

    it('should hash password before storing', async () => {
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-new',
        ...newUserData,
        companyId: 'company-123',
      })

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      })

      await POST(request)

      // Verify password was hashed (not stored as plain text)
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: newUserData.email,
            password: expect.not.stringContaining(newUserData.password),
          }),
        })
      )
    })

    it('should associate user with correct company', async () => {
      ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-new',
        ...newUserData,
        companyId: mockSession.user.companyId,
      })

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      })

      await POST(request)

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: mockSession.user.companyId,
          }),
        })
      )
    })
  })
})
