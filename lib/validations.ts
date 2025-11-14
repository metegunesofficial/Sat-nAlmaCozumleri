import { z } from 'zod'

/**
 * Common validation patterns
 */
const phoneRegex = /^[0-9]{10}$/
const taxNumberRegex = /^[0-9]{10,11}$/
const postalCodeRegex = /^[0-9]{5}$/

/**
 * Supplier validation schemas
 */
export const supplierCreateSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı').max(100, 'İsim en fazla 100 karakter olabilir'),
  contactPerson: z.string().min(2, 'İletişim kişisi en az 2 karakter olmalı').max(100).optional(),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  phone: z.string().regex(phoneRegex, 'Telefon numarası 10 haneli olmalı (5xxxxxxxxx)').optional(),
  address: z.string().max(500, 'Adres en fazla 500 karakter olabilir').optional(),
  city: z.string().max(100).optional(),
  taxNumber: z.string().regex(taxNumberRegex, 'Vergi numarası 10 veya 11 haneli olmalı').optional(),
  website: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notlar en fazla 1000 karakter olabilir').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
})

export const supplierUpdateSchema = supplierCreateSchema.partial()

/**
 * Product validation schemas
 */
export const productCreateSchema = z.object({
  name: z.string().min(2, 'Ürün adı en az 2 karakter olmalı').max(200),
  description: z.string().max(5000, 'Açıklama en fazla 5000 karakter olabilir').optional(),
  sku: z.string().min(1, 'SKU gerekli').max(50),
  categoryId: z.string().cuid('Geçersiz kategori ID'),
  supplierId: z.string().cuid('Geçersiz tedarikçi ID').optional(),
  price: z.number().min(0, 'Fiyat 0 veya daha büyük olmalı').max(999999999),
  discountPrice: z.number().min(0).max(999999999).optional(),
  stock: z.number().int('Stok tam sayı olmalı').min(0, 'Stok negatif olamaz').default(0),
  minOrderQuantity: z.number().int().min(1).default(1),
  unit: z.string().max(20).default('Adet'),
  images: z.array(z.string().url()).max(10, 'En fazla 10 görsel eklenebilir').default([]),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isActive: z.boolean().default(true),
  specifications: z.record(z.string()).optional(),
})

export const productUpdateSchema = productCreateSchema.partial()

/**
 * Order validation schemas
 */
export const orderCreateSchema = z.object({
  // Billing info
  billingName: z.string().min(2, 'Ad soyad en az 2 karakter olmalı').max(100),
  billingEmail: z.string().email('Geçerli bir e-posta adresi giriniz'),
  billingPhone: z.string().regex(phoneRegex, 'Telefon numarası 10 haneli olmalı'),
  billingAddress: z.string().min(10, 'Adres en az 10 karakter olmalı').max(500),
  billingCity: z.string().min(2).max(100),
  billingDistrict: z.string().min(2).max(100),
  billingPostal: z.string().regex(postalCodeRegex, 'Posta kodu 5 haneli olmalı'),

  // Shipping info (optional, defaults to billing)
  shippingName: z.string().min(2).max(100).optional(),
  shippingPhone: z.string().regex(phoneRegex).optional(),
  shippingAddress: z.string().min(10).max(500).optional(),
  shippingCity: z.string().min(2).max(100).optional(),
  shippingDistrict: z.string().min(2).max(100).optional(),
  shippingPostal: z.string().regex(postalCodeRegex).optional(),

  // Payment & notes
  paymentMethod: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'CASH_ON_DELIVERY']),
  shippingCost: z.number().min(0).default(0),
  notes: z.string().max(1000).optional(),
})

/**
 * User validation schemas
 */
export const userCreateSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  name: z.string().min(2, 'İsim en az 2 karakter olmalı').max(100),
  password: z.string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .max(100)
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermeli')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermeli'),
  phone: z.string().regex(phoneRegex, 'Telefon numarası 10 haneli olmalı').optional(),
  role: z.enum([
    'SUPER_ADMIN',
    'COMPANY_ADMIN',
    'EMPLOYEE',
    'DEPARTMENT_MANAGER',
    'FINANCE_MANAGER',
    'GENERAL_MANAGER',
    'PROCUREMENT_MANAGER',
  ]),
  departmentId: z.string().cuid('Geçersiz departman ID').optional(),
  position: z.string().max(100).optional(),
  employeeId: z.string().max(50).optional(),
})

export const userUpdateSchema = userCreateSchema.partial().omit({ password: true })

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
  newPassword: z.string()
    .min(8, 'Yeni şifre en az 8 karakter olmalı')
    .max(100)
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermeli')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermeli'),
  confirmPassword: z.string().min(1, 'Şifre tekrarı gerekli'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
})

/**
 * Department validation schemas
 */
export const departmentCreateSchema = z.object({
  name: z.string().min(2, 'Departman adı en az 2 karakter olmalı').max(100),
  code: z.string().min(2, 'Departman kodu en az 2 karakter olmalı').max(20),
  parentId: z.string().cuid('Geçersiz üst departman ID').optional(),
  managerId: z.string().cuid('Geçersiz müdür ID').optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
})

export const departmentUpdateSchema = departmentCreateSchema.partial()

/**
 * Purchase Request validation schemas
 */
export const purchaseRequestCreateSchema = z.object({
  title: z.string().min(5, 'Başlık en az 5 karakter olmalı').max(200),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalı').max(2000),
  departmentId: z.string().cuid('Geçersiz departman ID'),
  categoryId: z.string().cuid('Geçersiz kategori ID'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  requiredByDate: z.string().datetime('Geçerli bir tarih giriniz').optional(),
  items: z.array(z.object({
    productId: z.string().cuid('Geçersiz ürün ID').optional(),
    productName: z.string().min(2).max(200),
    quantity: z.number().int().min(1, 'Miktar en az 1 olmalı'),
    estimatedPrice: z.number().min(0, 'Fiyat negatif olamaz'),
    justification: z.string().max(500).optional(),
  })).min(1, 'En az bir ürün eklemelisiniz'),
  notes: z.string().max(1000).optional(),
})

export const purchaseRequestUpdateSchema = purchaseRequestCreateSchema.partial()

export const approvalActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'REQUEST_CHANGES']),
  comment: z.string()
    .min(10, 'Yorum en az 10 karakter olmalı')
    .max(1000, 'Yorum en fazla 1000 karakter olabilir')
    .optional()
    .refine((val, ctx) => {
      // Comment required for reject and request changes
      if (ctx.parent.action !== 'APPROVE' && !val) {
        return false
      }
      return true
    }, 'Red veya değişiklik talebi için yorum gereklidir'),
})

/**
 * Budget validation schemas
 */
export const budgetCreateSchema = z.object({
  departmentId: z.string().cuid('Geçersiz departman ID'),
  categoryId: z.string().cuid('Geçersiz kategori ID').optional(),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  allocated: z.number().min(0, 'Bütçe negatif olamaz').max(999999999),
  description: z.string().max(500).optional(),
})

export const budgetUpdateSchema = budgetCreateSchema.partial()

/**
 * Category validation schemas
 */
export const categoryCreateSchema = z.object({
  name: z.string().min(2, 'Kategori adı en az 2 karakter olmalı').max(100),
  slug: z.string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir'),
  description: z.string().max(500).optional(),
  parentId: z.string().cuid('Geçersiz üst kategori ID').optional(),
  isActive: z.boolean().default(true),
})

export const categoryUpdateSchema = categoryCreateSchema.partial()

/**
 * Workflow validation schemas
 */
export const workflowCreateSchema = z.object({
  name: z.string().min(5, 'Workflow adı en az 5 karakter olmalı').max(100),
  description: z.string().max(500).optional(),
  minAmount: z.number().min(0, 'Minimum tutar negatif olamaz'),
  maxAmount: z.number().min(0, 'Maximum tutar negatif olamaz'),
  departmentIds: z.array(z.string().cuid()).optional(),
  isActive: z.boolean().default(true),
  steps: z.array(z.object({
    stepName: z.string().min(2).max(100),
    stepOrder: z.number().int().min(0),
    approverRole: z.string().min(1),
    isRequired: z.boolean().default(true),
  })).min(1, 'En az bir adım tanımlamalısınız'),
}).refine((data) => data.maxAmount >= data.minAmount, {
  message: 'Maximum tutar minimum tutardan küçük olamaz',
  path: ['maxAmount'],
})

export const workflowUpdateSchema = workflowCreateSchema.partial()

/**
 * Helper function to validate request body
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`)
      throw new Error(messages.join(', '))
    }
    throw error
  }
}
