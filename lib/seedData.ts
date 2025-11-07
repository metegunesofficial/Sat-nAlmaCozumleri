// Seed Data - Centralized data source for the application
// This serves as a temporary database until real database is set up

export interface User {
  id: string
  email: string
  name: string
  password: string
  role: string
  companyId: string
  companyName: string
  departmentId?: string
  departmentName?: string
  position?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export const users: User[] = [
  {
    id: '1',
    email: 'admin@attelia.com',
    name: 'Ahmet Yıldırım',
    password: 'password123',
    role: 'COMPANY_ADMIN',
    companyId: 'company1',
    companyName: 'Attelia Dental Merkez',
    position: 'Genel Müdür',
    phone: '+90 532 123 4567',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    email: 'john.doe@attelia.com',
    name: 'John Doe',
    password: 'password123',
    role: 'EMPLOYEE',
    companyId: 'company1',
    companyName: 'Attelia Dental Merkez',
    departmentId: 'dept1',
    departmentName: 'Bilgi İşlem',
    position: 'Yazılım Geliştirici',
    phone: '+90 532 234 5678',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z'
  },
  {
    id: '3',
    email: 'it.manager@attelia.com',
    name: 'Mehmet Demir',
    password: 'password123',
    role: 'DEPARTMENT_MANAGER',
    companyId: 'company1',
    companyName: 'Attelia Dental Merkez',
    departmentId: 'dept1',
    departmentName: 'Bilgi İşlem',
    position: 'IT Müdürü',
    phone: '+90 532 345 6789',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z'
  },
  {
    id: '4',
    email: 'finance@attelia.com',
    name: 'Can Öztürk',
    password: 'password123',
    role: 'FINANCE_MANAGER',
    companyId: 'company1',
    companyName: 'Attelia Dental Merkez',
    departmentId: 'dept-fin',
    departmentName: 'Finans',
    position: 'Finans Müdürü',
    phone: '+90 532 456 7890',
    createdAt: '2024-01-04T00:00:00.000Z',
    updatedAt: '2024-01-04T00:00:00.000Z'
  },
  {
    id: '5',
    email: 'developer@attelia.com',
    name: 'Dev Kullanıcı',
    password: 'password123',
    role: 'DEVELOPER',
    companyId: 'company1',
    companyName: 'Attelia Dental Merkez',
    departmentId: 'dept1',
    departmentName: 'Yazılım Geliştirme',
    position: 'Developer',
    phone: '+90 532 567 8901',
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-05T00:00:00.000Z'
  }
]

// Helper function to find user by email
export function findUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email)
}

// Helper function to find user by id
export function findUserById(id: string): User | undefined {
  return users.find(u => u.id === id)
}

// Helper function to verify password
export function verifyUserPassword(user: User, password: string): boolean {
  return user.password === password
}
