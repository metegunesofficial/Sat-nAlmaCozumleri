// Mock Data Service for Development

export const mockCompanies = [
  {
    id: 'company1',
    name: 'Attelia Dental Merkez',
    slug: 'attelia-merkez',
    email: 'merkez@attelia.com',
    phone: '+90 312 123 45 67',
    city: 'Ankara'
  },
  {
    id: 'company2',
    name: 'Attelia Dental İstanbul',
    slug: 'attelia-istanbul',
    email: 'istanbul@attelia.com',
    phone: '+90 212 987 65 43',
    city: 'İstanbul'
  }
]

export const mockDepartments = [
  { id: 'dept1', name: 'Bilgi İşlem', code: 'IT', companyId: 'company1', budget: 50000, spent: 15000 },
  { id: 'dept2', name: 'Satın Alma', code: 'PROC', companyId: 'company1', budget: 200000, spent: 75000 },
  { id: 'dept3', name: 'İnsan Kaynakları', code: 'HR', companyId: 'company1', budget: 30000, spent: 12000 },
  { id: 'dept4', name: 'Finans', code: 'FIN', companyId: 'company1', budget: 100000, spent: 45000 },
]

export const mockPurchaseRequests = [
  {
    id: 'pr1',
    requestNumber: 'PR202411001',
    title: 'Yeni Laptop Talebi',
    description: 'Yazılım geliştirme için güçlü laptop',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    estimatedTotal: 35000,
    requester: { name: 'John Doe', department: 'Bilgi İşlem' },
    department: 'Bilgi İşlem',
    currentStep: 0,
    createdAt: '2024-11-01T10:00:00Z',
    items: [
      { name: 'Dell Latitude 5430', quantity: 1, unitPrice: 35000, total: 35000 }
    ],
    approvalActions: []
  },
  {
    id: 'pr2',
    requestNumber: 'PR202411002',
    title: 'Ofis Malzemeleri',
    description: 'Aylık ofis malzeme ihtiyacı',
    status: 'APPROVED',
    priority: 'NORMAL',
    estimatedTotal: 2500,
    requester: { name: 'Jane Smith', department: 'İnsan Kaynakları' },
    department: 'İnsan Kaynakları',
    currentStep: 1,
    createdAt: '2024-10-28T14:30:00Z',
    items: [
      { name: 'A4 Kağıt', quantity: 20, unitPrice: 45, total: 900 },
      { name: 'Kalem Seti', quantity: 50, unitPrice: 15, total: 750 },
      { name: 'Klasör', quantity: 100, unitPrice: 8.5, total: 850 }
    ],
    approvalActions: [
      { approver: 'HR Manager', action: 'APPROVED', date: '2024-10-29T09:15:00Z', comments: 'Onaylandı' }
    ]
  },
  {
    id: 'pr3',
    requestNumber: 'PR202411003',
    title: 'Network Ekipmanları',
    description: 'Şube için network altyapısı',
    status: 'PENDING',
    priority: 'URGENT',
    estimatedTotal: 75000,
    requester: { name: 'Mehmet Demir', department: 'Bilgi İşlem' },
    department: 'Bilgi İşlem',
    currentStep: 0,
    createdAt: '2024-11-05T08:00:00Z',
    items: [
      { name: 'Cisco Switch', quantity: 2, unitPrice: 25000, total: 50000 },
      { name: 'Access Point', quantity: 5, unitPrice: 5000, total: 25000 }
    ],
    approvalActions: []
  }
]

export const mockProducts = [
  {
    id: 'prod1',
    name: 'Dell Latitude 5430 Laptop',
    slug: 'dell-latitude-5430',
    sku: 'IT-DELL-5430',
    price: 35000,
    discountPrice: 32000,
    stock: 10,
    category: { name: 'Bilgisayar ve Donanım' },
    images: [],
    description: 'Intel i5, 16GB RAM, 512GB SSD',
    isActive: true,
    isFeatured: true
  },
  {
    id: 'prod2',
    name: 'LG 27" Monitor',
    slug: 'lg-27-monitor',
    sku: 'IT-LG-27',
    price: 4500,
    stock: 25,
    category: { name: 'Bilgisayar ve Donanım' },
    images: [],
    description: 'Full HD IPS panel',
    isActive: true
  },
  {
    id: 'prod3',
    name: 'A4 Kağıt (500 sayfa)',
    slug: 'a4-kagit-500',
    sku: 'OFF-A4-500',
    price: 45.90,
    stock: 500,
    category: { name: 'Ofis Malzemeleri' },
    images: [],
    description: 'Standart A4 fotokopi kağıdı',
    isActive: true
  }
]

export const mockCategories = [
  { id: 'cat1', name: 'Ofis Malzemeleri', slug: 'ofis-malzemeleri', productCount: 125 },
  { id: 'cat2', name: 'Bilgisayar ve Donanım', slug: 'bilgisayar-donanim', productCount: 87 },
  { id: 'cat3', name: 'Dental Malzemeler', slug: 'dental-malzemeler', productCount: 234 },
  { id: 'cat4', name: 'Temizlik Malzemeleri', slug: 'temizlik', productCount: 56 },
]

export const mockBudgetData = {
  company: {
    total: 2000000,
    spent: 850000,
    reserved: 300000,
    available: 850000,
    utilizationPercent: 42.5
  },
  departments: [
    {
      name: 'Bilgi İşlem',
      budget: 50000,
      spent: 15000,
      reserved: 10000,
      available: 25000,
      utilization: 30,
      status: 'normal'
    },
    {
      name: 'Satın Alma',
      budget: 200000,
      spent: 75000,
      reserved: 50000,
      available: 75000,
      utilization: 37.5,
      status: 'normal'
    },
    {
      name: 'İnsan Kaynakları',
      budget: 30000,
      spent: 12000,
      reserved: 5000,
      available: 13000,
      utilization: 40,
      status: 'normal'
    },
    {
      name: 'Finans',
      budget: 100000,
      spent: 82000,
      reserved: 15000,
      available: 3000,
      utilization: 82,
      status: 'warning'
    }
  ]
}

export const mockReportData = {
  purchaseSummary: {
    byStatus: [
      { status: 'PENDING', count: 5, total: 125000 },
      { status: 'IN_REVIEW', count: 8, total: 280000 },
      { status: 'APPROVED', count: 25, total: 1500000 },
      { status: 'REJECTED', count: 3, total: 45000 },
    ],
    byDepartment: [
      { department: 'Bilgi İşlem', count: 12, total: 650000 },
      { department: 'İnsan Kaynakları', count: 8, total: 125000 },
      { department: 'Satın Alma', count: 15, total: 980000 },
      { department: 'Finans', count: 6, total: 195000 },
    ],
    avgApprovalTime: 2.5, // days
    topProducts: [
      { name: 'Dell Latitude Laptop', quantity: 15, total: 525000 },
      { name: 'LG Monitor', quantity: 35, total: 157500 },
      { name: 'Ofis Malzemeleri', quantity: 250, total: 85000 },
    ]
  },
  approvalPerformance: {
    approvers: [
      {
        name: 'Mehmet Demir',
        role: 'IT Manager',
        totalActions: 45,
        approved: 38,
        rejected: 5,
        returned: 2,
        approvalRate: 84.4,
        avgResponseTime: 1.8 // hours
      },
      {
        name: 'Ayşe Kaya',
        role: 'Procurement Manager',
        totalActions: 62,
        approved: 55,
        rejected: 4,
        returned: 3,
        approvalRate: 88.7,
        avgResponseTime: 3.2
      },
      {
        name: 'Can Öztürk',
        role: 'Finance Manager',
        totalActions: 28,
        approved: 24,
        rejected: 3,
        returned: 1,
        approvalRate: 85.7,
        avgResponseTime: 4.5
      }
    ]
  }
}

// Helper functions
export const getMockData = (type: string) => {
  switch (type) {
    case 'companies': return mockCompanies
    case 'departments': return mockDepartments
    case 'requests': return mockPurchaseRequests
    case 'products': return mockProducts
    case 'categories': return mockCategories
    case 'budget': return mockBudgetData
    case 'reports': return mockReportData
    default: return []
  }
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockApiCall = async <T,>(data: T, delayMs = 500): Promise<T> => {
  await delay(delayMs)
  return data
}
