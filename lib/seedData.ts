// Seed Data - Centralized data source for the application
// Multi-Tenant SaaS Architecture
// Attelia = Platform Owner (Super Admin)
// Other companies = Customers using the platform

export interface Company {
  id: string
  name: string
  slug: string
  taxNumber?: string
  address?: string
  city?: string
  phone?: string
  email?: string
  website?: string
  logo?: string
  isActive: boolean
  settings: {
    primaryColor?: string
    secondaryColor?: string
    features?: string[]
    maxUsers?: number
    subscriptionPlan?: 'starter' | 'professional' | 'enterprise'
  }
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  password: string
  role: string
  companyId?: string  // null for SUPER_ADMIN
  companyName?: string
  departmentId?: string
  departmentName?: string
  position?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

// Companies (Platform Customers)
export const companies: Company[] = [
  {
    id: 'attelia-platform',
    name: 'Attelia Platform',
    slug: 'attelia',
    email: 'info@attelia.com',
    phone: '+90 212 000 0000',
    website: 'https://attelia.com',
    isActive: true,
    settings: {
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6',
      subscriptionPlan: 'enterprise'
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'company-dental-merkez',
    name: 'Dental Merkez Klinik',
    slug: 'dental-merkez',
    taxNumber: '1234567890',
    address: 'Bağdat Cad. No:123 Kadıköy',
    city: 'İstanbul',
    email: 'info@dentalmerkez.com',
    phone: '+90 216 555 1234',
    website: 'https://dentalmerkez.com',
    logo: '/logos/dental-merkez.png',
    isActive: true,
    settings: {
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      features: ['purchase-requests', 'budget-management', 'approval-workflow'],
      maxUsers: 50,
      subscriptionPlan: 'professional'
    },
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: 'company-smile-clinic',
    name: 'Smile Dental Clinic',
    slug: 'smile-clinic',
    taxNumber: '9876543210',
    address: 'Nispetiye Cad. No:45 Etiler',
    city: 'İstanbul',
    email: 'contact@smileclinic.com',
    phone: '+90 212 555 5678',
    website: 'https://smileclinic.com',
    logo: '/logos/smile-clinic.png',
    isActive: true,
    settings: {
      primaryColor: '#7c3aed',
      secondaryColor: '#8b5cf6',
      features: ['purchase-requests', 'budget-management'],
      maxUsers: 20,
      subscriptionPlan: 'starter'
    },
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z'
  },
  {
    id: 'company-dent-plus',
    name: 'DentPlus Sağlık Merkezi',
    slug: 'dentplus',
    taxNumber: '5555555555',
    address: 'Ankara Cad. No:789 Çankaya',
    city: 'Ankara',
    email: 'info@dentplus.com',
    phone: '+90 312 555 9999',
    website: 'https://dentplus.com',
    logo: '/logos/dentplus.png',
    isActive: true,
    settings: {
      primaryColor: '#dc2626',
      secondaryColor: '#ef4444',
      features: ['purchase-requests', 'budget-management', 'approval-workflow', 'supplier-management'],
      maxUsers: 100,
      subscriptionPlan: 'enterprise'
    },
    createdAt: '2024-02-10T00:00:00.000Z',
    updatedAt: '2024-02-10T00:00:00.000Z'
  }
]

// Users (Multi-Tenant)
export const users: User[] = [
  // SUPER ADMIN - Platform Owner (Attelia)
  {
    id: 'superadmin-1',
    email: 'superadmin@attelia.com',
    name: 'Attelia Platform Admin',
    password: 'SuperAdmin123!',
    role: 'SUPER_ADMIN',
    companyId: 'attelia-platform',
    companyName: 'Attelia Platform',
    position: 'Platform Administrator',
    phone: '+90 212 000 0001',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },

  // COMPANY 1: Dental Merkez Klinik
  {
    id: 'user-dm-1',
    email: 'admin@dentalmerkez.com',
    name: 'Ahmet Yılmaz',
    password: 'password123',
    role: 'COMPANY_ADMIN',
    companyId: 'company-dental-merkez',
    companyName: 'Dental Merkez Klinik',
    position: 'Genel Müdür',
    phone: '+90 216 555 1235',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: 'user-dm-2',
    email: 'finans@dentalmerkez.com',
    name: 'Ayşe Demir',
    password: 'password123',
    role: 'FINANCE_MANAGER',
    companyId: 'company-dental-merkez',
    companyName: 'Dental Merkez Klinik',
    departmentId: 'dept-dm-finans',
    departmentName: 'Finans',
    position: 'Finans Müdürü',
    phone: '+90 216 555 1236',
    createdAt: '2024-01-16T00:00:00.000Z',
    updatedAt: '2024-01-16T00:00:00.000Z'
  },
  {
    id: 'user-dm-3',
    email: 'satinalma@dentalmerkez.com',
    name: 'Mehmet Kaya',
    password: 'password123',
    role: 'DEPARTMENT_MANAGER',
    companyId: 'company-dental-merkez',
    companyName: 'Dental Merkez Klinik',
    departmentId: 'dept-dm-satinalma',
    departmentName: 'Satın Alma',
    position: 'Satın Alma Müdürü',
    phone: '+90 216 555 1237',
    createdAt: '2024-01-17T00:00:00.000Z',
    updatedAt: '2024-01-17T00:00:00.000Z'
  },

  // COMPANY 2: Smile Dental Clinic
  {
    id: 'user-sc-1',
    email: 'admin@smileclinic.com',
    name: 'Elif Özkan',
    password: 'password123',
    role: 'COMPANY_ADMIN',
    companyId: 'company-smile-clinic',
    companyName: 'Smile Dental Clinic',
    position: 'Kurucu Ortak',
    phone: '+90 212 555 5679',
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z'
  },
  {
    id: 'user-sc-2',
    email: 'muhasebe@smileclinic.com',
    name: 'Can Yılmaz',
    password: 'password123',
    role: 'FINANCE_MANAGER',
    companyId: 'company-smile-clinic',
    companyName: 'Smile Dental Clinic',
    position: 'Mali Müşavir',
    phone: '+90 212 555 5680',
    createdAt: '2024-02-02T00:00:00.000Z',
    updatedAt: '2024-02-02T00:00:00.000Z'
  },

  // COMPANY 3: DentPlus
  {
    id: 'user-dp-1',
    email: 'admin@dentplus.com',
    name: 'Zeynep Arslan',
    password: 'password123',
    role: 'COMPANY_ADMIN',
    companyId: 'company-dent-plus',
    companyName: 'DentPlus Sağlık Merkezi',
    position: 'Genel Koordinatör',
    phone: '+90 312 555 9990',
    createdAt: '2024-02-10T00:00:00.000Z',
    updatedAt: '2024-02-10T00:00:00.000Z'
  },
  {
    id: 'user-dp-2',
    email: 'finans@dentplus.com',
    name: 'Ali Şahin',
    password: 'password123',
    role: 'FINANCE_MANAGER',
    companyId: 'company-dent-plus',
    companyName: 'DentPlus Sağlık Merkezi',
    departmentId: 'dept-dp-finans',
    departmentName: 'Finans',
    position: 'CFO',
    phone: '+90 312 555 9991',
    createdAt: '2024-02-11T00:00:00.000Z',
    updatedAt: '2024-02-11T00:00:00.000Z'
  },
  {
    id: 'user-dp-3',
    email: 'operasyon@dentplus.com',
    name: 'Selin Aydın',
    password: 'password123',
    role: 'DEPARTMENT_MANAGER',
    companyId: 'company-dent-plus',
    companyName: 'DentPlus Sağlık Merkezi',
    departmentId: 'dept-dp-operasyon',
    departmentName: 'Operasyon',
    position: 'Operasyon Müdürü',
    phone: '+90 312 555 9992',
    createdAt: '2024-02-12T00:00:00.000Z',
    updatedAt: '2024-02-12T00:00:00.000Z'
  }
]

// ============================================
// USER HELPER FUNCTIONS
// ============================================

export function findUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email)
}

export function findUserById(id: string): User | undefined {
  return users.find(u => u.id === id)
}

export function verifyUserPassword(user: User, password: string): boolean {
  return user.password === password
}

export function getUsersByCompanyId(companyId: string): User[] {
  return users.filter(u => u.companyId === companyId)
}

export function getUsersByRole(role: string): User[] {
  return users.filter(u => u.role === role)
}

// ============================================
// COMPANY HELPER FUNCTIONS
// ============================================

export function findCompanyById(id: string): Company | undefined {
  return companies.find(c => c.id === id)
}

export function findCompanyBySlug(slug: string): Company | undefined {
  return companies.find(c => c.slug === slug)
}

export function getAllActiveCompanies(): Company[] {
  return companies.filter(c => c.isActive && c.id !== 'attelia-platform')
}

export function getAllCompanies(): Company[] {
  return companies.filter(c => c.id !== 'attelia-platform')
}

export function getCompanyStats(companyId: string) {
  const company = findCompanyById(companyId)
  const companyUsers = getUsersByCompanyId(companyId)

  return {
    company,
    totalUsers: companyUsers.length,
    admins: companyUsers.filter(u => u.role === 'COMPANY_ADMIN').length,
    managers: companyUsers.filter(u => u.role === 'DEPARTMENT_MANAGER' || u.role === 'FINANCE_MANAGER').length,
    employees: companyUsers.filter(u => u.role === 'EMPLOYEE').length,
  }
}
