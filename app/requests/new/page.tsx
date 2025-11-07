'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/contexts/NotificationContext'
import { Plus, Trash2, ChevronRight, ChevronLeft, AlertCircle, AlertTriangle } from 'lucide-react'
import Modal from '@/components/Modal'

interface RequestItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
  notes?: string
}

interface PurchaseCategory {
  id: string
  name: string
  code: string
  parentId: string | null
  monthlyLimit: number | null
  yearlyLimit: number | null
  monthlyUsed?: number
  monthlyRemaining?: number
  requiresApproval: boolean
  minApprovalAmount: number | null
  children?: PurchaseCategory[]
}

interface BudgetValidation {
  isValid: boolean
  warnings: string[]
  errors: string[]
  budgetInfo: {
    category: {
      name: string
      code: string
    }
    monthly: {
      limit: number
      used: number
      remaining: number
      afterRequest: number
    } | null
    yearly: {
      limit: number
      used: number
      remaining: number
      afterRequest: number
    } | null
    requiresApproval: boolean
    minApprovalAmount: number
  }
}

interface Product {
  id: string
  name: string
  sku: string
  price: number
  category: {
    name: string
  }
  stock: number
}

export default function NewRequestPage() {
  const router = useRouter()
  const { success, error: showError } = useNotification()
  const [step, setStep] = useState(1)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [categories, setCategories] = useState<PurchaseCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [budgetValidation, setBudgetValidation] = useState<BudgetValidation | null>(null)
  const [loading, setLoading] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [purchaseCategoryId, setPurchaseCategoryId] = useState('')
  const [priority, setPriority] = useState('NORMAL')
  const [items, setItems] = useState<RequestItem[]>([])

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  useEffect(() => {
    if (purchaseCategoryId && items.length > 0) {
      validateBudget()
    }
  }, [purchaseCategoryId, items])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/purchase-categories?includeChildren=true&includeUsage=true')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100')
      const data = await response.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
  }

  const validateBudget = async () => {
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0)

    try {
      const response = await fetch('/api/purchase-categories/validate-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseCategoryId,
          amount: totalAmount,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setBudgetValidation(data.data)
      }
    } catch (err) {
      console.error('Budget validation failed:', err)
    }
  }

  const addItem = (product: Product) => {
    const newItem: RequestItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.price,
      total: product.price,
    }
    setItems([...items, newItem])
    setIsProductModalOpen(false)
    success('Ürün eklendi')
  }

  const updateItem = (id: string, field: keyof RequestItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return item
      })
    )
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
    success('Ürün kaldırıldı')
  }

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0)

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && (!title || !purchaseCategoryId || items.length === 0)) {
      showError('Lütfen tüm gerekli alanları doldurun')
      return
    }

    if (!isDraft && budgetValidation && !budgetValidation.isValid) {
      showError('Bütçe limitleri aşıldı. Lütfen tutarı azaltın veya farklı bir kategori seçin.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/purchase-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          purchaseCategoryId,
          priority,
          status: isDraft ? 'DRAFT' : 'SUBMITTED',
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            notes: item.notes,
          })),
        }),
      })

      const data = await response.json()
      if (data.success) {
        success(isDraft ? 'Taslak kaydedildi' : 'Satın alma talebi başarıyla oluşturuldu!')
        router.push('/requests')
      } else {
        showError(data.error || 'İşlem başarısız')
      }
    } catch (err) {
      console.error('Request creation failed:', err)
      showError('İşlem başarısız')
    } finally {
      setLoading(false)
    }
  }

  const renderCategoryOption = (category: PurchaseCategory, level = 0) => {
    const prefix = '  '.repeat(level)
    const usagePercent = category.monthlyLimit && category.monthlyUsed
      ? ((category.monthlyUsed / category.monthlyLimit) * 100).toFixed(0)
      : null

    return (
      <option key={category.id} value={category.id}>
        {prefix}{category.name} ({category.code})
        {usagePercent && ` - ${usagePercent}% kullanıldı`}
      </option>
    )
  }

  const renderCategoryOptions = () => {
    const options: JSX.Element[] = []
    categories.forEach((category) => {
      options.push(renderCategoryOption(category, 0))
      if (category.children) {
        category.children.forEach((child) => {
          options.push(renderCategoryOption(child, 1))
        })
      }
    })
    return options
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yeni Satın Alma Talebi</h1>
          <p className="text-gray-600 mt-1">Satın alma talebi oluştur ve onaya gönder</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Genel Bilgiler' },
              { num: 2, label: 'Ürünler' },
              { num: 3, label: 'Özet & Gönder' },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s.num}
                  </div>
                  <span className={`font-medium ${step >= s.num ? 'text-gray-900' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`flex-1 h-1 mx-4 ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: General Information */}
        {step === 1 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Genel Bilgiler</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Talep Başlığı *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Bilgi İşlem Departmanı için laptop alımı"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Satın alma talebinin detaylı açıklaması..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori *</label>
                <select
                  value={purchaseCategoryId}
                  onChange={(e) => setPurchaseCategoryId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Kategori Seçin</option>
                  {renderCategoryOptions()}
                </select>
                {purchaseCategoryId && categories.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                    {(() => {
                      const selectedCat = categories
                        .flatMap((c) => [c, ...(c.children || [])])
                        .find((c) => c.id === purchaseCategoryId)
                      if (!selectedCat) return null
                      return (
                        <div className="space-y-1">
                          {selectedCat.monthlyLimit && (
                            <div>
                              Aylık Limit: {selectedCat.monthlyLimit.toLocaleString('tr-TR')} TL
                              {selectedCat.monthlyRemaining !== undefined && (
                                <> (Kalan: {selectedCat.monthlyRemaining.toLocaleString('tr-TR')} TL)</>
                              )}
                            </div>
                          )}
                          {selectedCat.requiresApproval && selectedCat.minApprovalAmount && (
                            <div>
                              Onay Gereksinimi: {selectedCat.minApprovalAmount.toLocaleString('tr-TR')} TL üzeri
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Öncelik</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Düşük</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">Yüksek</option>
                  <option value="URGENT">Acil</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Products */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Ürünler</h2>
                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus size={20} />
                  Ürün Ekle
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Henüz ürün eklenmedi</p>
                  <p className="text-sm mt-1">Ürün ekle butonuna tıklayarak başlayın</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Miktar</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                              className="w-full border border-gray-300 rounded px-3 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Birim Fiyat</label>
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                              className="w-full border border-gray-300 rounded px-3 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Toplam</label>
                            <div className="font-semibold text-gray-900 py-1">
                              {item.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}

                  <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-200">
                    <span className="text-lg font-medium text-gray-700">Toplam Tutar:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Budget Validation */}
            {budgetValidation && (
              <div className="space-y-3">
                {budgetValidation.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 mb-2">Bütçe Limiti Aşıldı</h4>
                        <ul className="text-sm text-red-800 space-y-1">
                          {budgetValidation.errors.map((err, idx) => (
                            <li key={idx}>• {err}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {budgetValidation.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900 mb-2">Uyarılar</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          {budgetValidation.warnings.map((warn, idx) => (
                            <li key={idx}>• {warn}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {budgetValidation.isValid && budgetValidation.budgetInfo.monthly && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-3">Bütçe Durumu</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-green-700 mb-1">Aylık Bütçe:</div>
                        <div className="font-medium text-green-900">
                          {budgetValidation.budgetInfo.monthly.afterRequest.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          })}{' '}
                          kalan
                        </div>
                      </div>
                      {budgetValidation.budgetInfo.yearly && (
                        <div>
                          <div className="text-green-700 mb-1">Yıllık Bütçe:</div>
                          <div className="font-medium text-green-900">
                            {budgetValidation.budgetInfo.yearly.afterRequest.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                            })}{' '}
                            kalan
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Talep Özeti</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Başlık:</span>
                  <p className="font-medium text-gray-900">{title}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Kategori:</span>
                  <p className="font-medium text-gray-900">
                    {categories
                      .flatMap((c) => [c, ...(c.children || [])])
                      .find((c) => c.id === purchaseCategoryId)?.name}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Öncelik:</span>
                  <p className="font-medium text-gray-900">{priority}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Toplam Tutar:</span>
                  <p className="text-lg font-bold text-blue-600">
                    {totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </p>
                </div>
              </div>

              {description && (
                <div>
                  <span className="text-sm text-gray-600">Açıklama:</span>
                  <p className="text-gray-900 mt-1">{description}</p>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-600">Ürünler ({items.length}):</span>
                <div className="mt-2 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded p-3">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} adet × {item.unitPrice.toLocaleString('tr-TR')} TL
                        </p>
                      </div>
                      <p className="font-semibold">
                        {item.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={20} />
                Geri
              </button>
            )}
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Taslak Olarak Kaydet
            </button>
          </div>

          <div className="flex gap-3">
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && (!title || !purchaseCategoryId)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                İleri
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading || (budgetValidation && !budgetValidation.isValid)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Gönderiliyor...' : 'Talebi Gönder'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Selection Modal */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Ürün Seç" size="lg">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => addItem(product)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-500">{product.category.name} • SKU: {product.sku}</p>
                  <p className="text-xs text-gray-400 mt-1">Stok: {product.stock}</p>
                </div>
                <p className="font-semibold text-blue-600">
                  {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-8 text-gray-500">Ürün bulunamadı</div>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  )
}
