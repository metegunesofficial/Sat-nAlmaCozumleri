export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'CUSTOMER' | 'DEALER'
  companyName?: string
  phone?: string
  address?: string
  city?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  children?: Category[]
  productCount?: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  shortDesc?: string
  sku: string
  price: number
  discountPrice?: number
  wholesalePrice?: number
  minOrderQty: number
  stock: number
  unit: string
  images: string[]
  category: Category
  brand?: string
  tags: string[]
  isActive: boolean
  isFeatured: boolean
  isNew: boolean
  rating?: number
  salesCount: number
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  tax: number
  discount: number
  total: number
  billingName: string
  billingEmail: string
  billingPhone: string
  billingAddress: string
  shippingAddress: string
  paymentMethod: string
  paymentStatus: PaymentStatus
  createdAt: string
}

export interface OrderItem {
  id: string
  productName: string
  productSku: string
  quantity: number
  price: number
  total: number
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
