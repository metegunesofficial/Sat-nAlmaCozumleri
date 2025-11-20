// TypeScript Type Definitions - Prisma Schema ile Uyumlu

// ==================== ENUMS ====================

export type UserRole =
  | 'SUPER_ADMIN'
  | 'COMPANY_ADMIN'
  | 'EMPLOYEE'
  | 'DEPARTMENT_MANAGER'
  | 'FINANCE_MANAGER'
  | 'GENERAL_MANAGER'
  | 'PROCUREMENT_MANAGER'

export type RequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'

export type RequestPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export type ActionType = 'APPROVED' | 'REJECTED' | 'RETURNED' | 'COMMENTED'

export type StepAction = 'APPROVE' | 'REVIEW' | 'VERIFY'

export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

// ==================== CORE MODELS ====================

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
  settings?: CompanySettings
  createdAt: string
  updatedAt: string
}

export interface CompanySettings {
  currency: string
  timezone: string
  fiscalYearStart: number
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: UserRole
  companyId: string
  company?: Company
  departmentId?: string
  department?: Department
  position?: string
  employeeId?: string
  address?: string
  city?: string
  district?: string
  postalCode?: string
  createdAt?: string
  updatedAt?: string
}

export interface Department {
  id: string
  companyId: string
  company?: Company
  name: string
  code: string
  description?: string
  managerId?: string
  manager?: User
  parentId?: string
  parent?: Department
  children?: Department[]
  monthlyBudget?: number
  yearlyBudget?: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

// ==================== BUDGET MODELS ====================

export interface Budget {
  id: string
  departmentId: string
  department?: Department
  year: number
  month?: number
  amount: number
  spent: number
  reserved: number
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface CompanyBudget {
  id: string
  companyId: string
  company?: Company
  year: number
  month?: number
  amount: number
  spent: number
  reserved: number
  notes?: string
  category?: string
  createdAt?: string
  updatedAt?: string
}

export interface UserBudget {
  id: string
  userId: string
  user?: User
  year: number
  month?: number
  amount: number
  spent: number
  reserved: number
  notes?: string
  createdAt?: string
  updatedAt?: string
}

// ==================== E-COMMERCE MODELS ====================

export interface Category {
  id: string
  companyId?: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  order?: number
  isActive?: boolean
  productCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface Product {
  id: string
  companyId?: string
  name: string
  slug: string
  description?: string
  shortDesc?: string
  sku: string
  barcode?: string
  price: number
  discountPrice?: number
  wholesalePrice?: number
  minOrderQty: number
  stock: number
  unit: string
  weight?: number
  dimensions?: string
  images: string[]
  categoryId?: string
  category?: Category
  supplierId?: string
  supplier?: Supplier
  brand?: string
  manufacturer?: string
  tags: string[]
  isActive: boolean
  isFeatured: boolean
  isNew: boolean
  viewCount?: number
  salesCount: number
  rating?: number
  createdAt?: string
  updatedAt?: string
}

export interface CartItem {
  id: string
  userId: string
  user?: User
  productId: string
  product?: Product
  quantity: number
  createdAt?: string
  updatedAt?: string
}

export interface Order {
  id: string
  companyId?: string
  orderNumber: string
  userId?: string
  user?: User
  status: OrderStatus
  billingName: string
  billingEmail: string
  billingPhone: string
  billingAddress: string
  billingCity?: string
  billingDistrict?: string
  billingPostal?: string
  shippingName?: string
  shippingPhone?: string
  shippingAddress: string
  shippingCity?: string
  shippingDistrict?: string
  shippingPostal?: string
  subtotal: number
  shippingCost: number
  tax: number
  discount: number
  total: number
  paymentMethod: string
  paymentStatus: PaymentStatus
  notes?: string
  trackingNumber?: string
  items?: OrderItem[]
  createdAt: string
  updatedAt?: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId?: string
  product?: Product
  productName: string
  productSku: string
  quantity: number
  price: number
  total: number
}

export interface Review {
  id: string
  userId: string
  user?: User
  productId: string
  product?: Product
  rating: number
  comment?: string
  isApproved: boolean
  createdAt?: string
  updatedAt?: string
}

// ==================== PURCHASE REQUEST MODELS ====================

export interface PurchaseCategory {
  id: string
  companyId: string
  name: string
  code: string
  description?: string
  parentId?: string
  parent?: PurchaseCategory
  children?: PurchaseCategory[]
  monthlyLimit?: number
  yearlyLimit?: number
  requiresApproval: boolean
  minApprovalAmount?: number
  isActive: boolean
  order: number
  createdAt?: string
  updatedAt?: string
}

export interface PurchaseRequest {
  id: string
  companyId: string
  requestNumber: string
  requesterId: string
  requester?: User
  departmentId: string
  department?: Department
  purchaseCategoryId?: string
  purchaseCategory?: PurchaseCategory
  title: string
  description?: string
  priority: RequestPriority
  status: RequestStatus
  estimatedTotal: number
  actualTotal?: number
  requiredDate?: string
  currentStep: number
  workflowId?: string
  workflow?: ApprovalWorkflow
  orderId?: string
  order?: Order
  items?: PurchaseRequestItem[]
  approvalActions?: ApprovalAction[]
  createdAt: string
  updatedAt?: string
}

export interface PurchaseRequestItem {
  id: string
  requestId: string
  productId?: string
  product?: Product
  productName: string
  productSku?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
  createdAt?: string
  updatedAt?: string
}

// ==================== WORKFLOW MODELS ====================

export interface ApprovalWorkflow {
  id: string
  companyId: string
  name: string
  description?: string
  isActive: boolean
  minAmount?: number
  maxAmount?: number
  departmentIds: string[]
  steps?: ApprovalStep[]
  createdAt?: string
  updatedAt?: string
}

export interface ApprovalStep {
  id: string
  workflowId: string
  stepOrder: number
  stepName: string
  approverRole?: UserRole
  approverId?: string
  requiredAction: StepAction
  isOptional: boolean
  isParallel: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ApprovalAction {
  id: string
  requestId: string
  stepOrder: number
  approverId: string
  approver?: User
  action: ActionType
  comments?: string
  actionDate: string
  createdAt?: string
}

// ==================== SUPPLIER MODEL ====================

export interface Supplier {
  id: string
  companyId: string
  name: string
  contactPerson?: string
  email: string
  phone?: string
  address?: string
  city?: string
  taxNumber?: string
  rating?: number
  totalOrders: number
  status: SupplierStatus
  notes?: string
  website?: string
  createdAt?: string
  updatedAt?: string
}

// ==================== SETTINGS MODEL ====================

export interface Setting {
  id: string
  key: string
  value: string
  type: string
  group: string
  createdAt?: string
  updatedAt?: string
}

// ==================== API RESPONSE TYPES ====================

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

// ==================== FORM/INPUT TYPES ====================

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  name: string
  phone?: string
  companyId?: string
}

export interface CreatePurchaseRequestInput {
  title: string
  description?: string
  priority: RequestPriority
  departmentId: string
  purchaseCategoryId?: string
  requiredDate?: string
  items: CreatePurchaseRequestItemInput[]
}

export interface CreatePurchaseRequestItemInput {
  productId?: string
  productName: string
  productSku?: string
  quantity: number
  unitPrice: number
  notes?: string
}

export interface ApproveRequestInput {
  action: 'APPROVED' | 'REJECTED' | 'RETURNED'
  comments?: string
}

// ==================== UI HELPER TYPES ====================

export interface SelectOption {
  value: string
  label: string
}

export interface TableColumn<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

// ==================== STATUS MAPS ====================

export const statusLabels: Record<RequestStatus, string> = {
  DRAFT: 'Taslak',
  SUBMITTED: 'Gönderildi',
  IN_REVIEW: 'İncelemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  CANCELLED: 'İptal Edildi',
  COMPLETED: 'Tamamlandı',
}

export const statusColors: Record<RequestStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
}

export const priorityLabels: Record<RequestPriority, string> = {
  LOW: 'Düşük',
  NORMAL: 'Normal',
  HIGH: 'Yüksek',
  URGENT: 'Acil',
}

export const priorityColors: Record<RequestPriority, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  NORMAL: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  PROCESSING: 'İşleniyor',
  SHIPPED: 'Kargoya Verildi',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
  REFUNDED: 'İade Edildi',
}

export const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: 'Platform Yöneticisi',
  COMPANY_ADMIN: 'Şirket Yöneticisi',
  EMPLOYEE: 'Çalışan',
  DEPARTMENT_MANAGER: 'Departman Müdürü',
  FINANCE_MANAGER: 'Finans Müdürü',
  GENERAL_MANAGER: 'Genel Müdür',
  PROCUREMENT_MANAGER: 'Satın Alma Müdürü',
}
