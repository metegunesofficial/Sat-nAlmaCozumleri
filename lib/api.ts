// API Helper Functions

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchWithAuth<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token')

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(response.status, data.error || 'Bir hata oluştu')
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, 'Bağlantı hatası')
  }
}

// Suppliers API
export const suppliersApi = {
  getAll: () => fetchWithAuth('/api/suppliers'),
  getById: (id: string) => fetchWithAuth(`/api/suppliers/${id}`),
  create: (data: any) => fetchWithAuth('/api/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchWithAuth(`/api/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchWithAuth(`/api/suppliers/${id}`, { method: 'DELETE' }),
}

// Users API
export const usersApi = {
  getAll: (params?: { role?: string; departmentId?: string }) => {
    const query = new URLSearchParams(params as any).toString()
    return fetchWithAuth(`/api/users${query ? `?${query}` : ''}`)
  },
  getById: (id: string) => fetchWithAuth(`/api/users/${id}`),
  create: (data: any) => fetchWithAuth('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchWithAuth(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchWithAuth(`/api/users/${id}`, { method: 'DELETE' }),
}

// Workflows API
export const workflowsApi = {
  getAll: (params?: { isActive?: boolean }) => {
    const query = new URLSearchParams(params as any).toString()
    return fetchWithAuth(`/api/workflows${query ? `?${query}` : ''}`)
  },
  getById: (id: string) => fetchWithAuth(`/api/workflows/${id}`),
  create: (data: any) => fetchWithAuth('/api/workflows', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchWithAuth(`/api/workflows/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchWithAuth(`/api/workflows/${id}`, { method: 'DELETE' }),
}

// Products API
export const productsApi = {
  getAll: (params?: { categoryId?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString()
    return fetchWithAuth(`/api/products${query ? `?${query}` : ''}`)
  },
  getBySlug: (slug: string) => fetchWithAuth(`/api/products/${slug}`),
  create: (data: any) => fetchWithAuth('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (slug: string, data: any) => fetchWithAuth(`/api/products/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (slug: string) => fetchWithAuth(`/api/products/${slug}`, { method: 'DELETE' }),
}

// Categories API
export const categoriesApi = {
  getAll: () => fetchWithAuth('/api/categories'),
  create: (data: any) => fetchWithAuth('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
}

// Departments API
export const departmentsApi = {
  getAll: () => fetchWithAuth('/api/departments'),
  create: (data: any) => fetchWithAuth('/api/departments', { method: 'POST', body: JSON.stringify(data) }),
}

// Purchase Requests API
export const purchaseRequestsApi = {
  getAll: (params?: { status?: string; departmentId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString()
    return fetchWithAuth(`/api/purchase-requests${query ? `?${query}` : ''}`)
  },
  getById: (id: string) => fetchWithAuth(`/api/purchase-requests/${id}`),
  create: (data: any) => fetchWithAuth('/api/purchase-requests', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchWithAuth(`/api/purchase-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  approve: (id: string, data: { action: string; comments?: string }) =>
    fetchWithAuth(`/api/purchase-requests/${id}/approve`, { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => fetchWithAuth(`/api/purchase-requests/${id}`, { method: 'DELETE' }),
}

// Reports API
export const reportsApi = {
  purchaseSummary: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString()
    return fetchWithAuth(`/api/reports/purchase-summary${query ? `?${query}` : ''}`)
  },
  budget: (params?: { departmentId?: string }) => {
    const query = new URLSearchParams(params as any).toString()
    return fetchWithAuth(`/api/reports/budget${query ? `?${query}` : ''}`)
  },
  approvalPerformance: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString()
    return fetchWithAuth(`/api/reports/approval-performance${query ? `?${query}` : ''}`)
  },
}

// Orders API
export const ordersApi = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString()
    return fetchWithAuth(`/api/orders${query ? `?${query}` : ''}`)
  },
  getById: (id: string) => fetchWithAuth(`/api/orders/${id}`),
  create: (data: any) => fetchWithAuth('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchWithAuth(`/api/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}

// Cart API
export const cartApi = {
  getItems: () => fetchWithAuth('/api/cart'),
  addItem: (productId: string, quantity: number) =>
    fetchWithAuth('/api/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateItem: (itemId: string, quantity: number) =>
    fetchWithAuth(`/api/cart/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeItem: (itemId: string) => fetchWithAuth(`/api/cart/${itemId}`, { method: 'DELETE' }),
  clear: () => fetchWithAuth('/api/cart', { method: 'DELETE' }),
}
