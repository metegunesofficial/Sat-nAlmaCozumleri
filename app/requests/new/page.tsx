'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/contexts/NotificationContext'
import { Plus, Trash2, Search, ChevronRight, ChevronLeft } from 'lucide-react'
import Modal from '@/components/Modal'
import { useAuth } from '@/contexts/AuthContext'

interface RequestItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
  notes?: string
}

interface Product {
  id: string
  name: string
  price: number
  categoryId: string
}

interface Department {
  id: string
  name: string
}

export default function NewRequestPage() {
  const router = useRouter()
  const { success, error } = useNotification()
  const { token } = useAuth()
  const [step, setStep] = useState(1)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [priority, setPriority] = useState('NORMAL')
  const [items, setItems] = useState<RequestItem[]>([])

  // Load products and departments from API
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        error('Giriş yapmanız gerekiyor')
        router.push('/login')
        return
      }

      try {
        const [productsRes, departmentsRes] = await Promise.all([
          fetch('/api/products', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/departments', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const productsData = await productsRes.json()
        const departmentsData = await departmentsRes.json()

        if (productsData.success) {
          setProducts(productsData.data)
        }

        if (departmentsData.success) {
          setDepartments(departmentsData.data)
        }
      } catch (err) {
        console.error('Data fetch error:', err)
        error('Veriler yüklenirken hata oluştu')
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [token, router, error])

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

  const handleSubmit = async () => {
    if (!title || !departmentId || items.length === 0) {
      error('Lütfen tüm gerekli alanları doldurun')
      return
    }

    if (!token) {
      error('Giriş yapmanız gerekiyor')
      router.push('/login')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/purchase-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          departmentId,
          priority,
          estimatedTotal: totalAmount,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.total,
            notes: item.notes,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Talep oluşturulamadı')
      }

      success('Satın alma talebi başarıyla oluşturuldu!')
      router.push('/requests')
    } catch (err: any) {
      error(err.message || 'Talep oluşturulurken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const saveDraft = () => {
    // TODO: Implement draft save to localStorage or API
    success('Taslak kaydedildi')
    router.push('/requests')
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
                      step >= s.num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s.num}
                  </div>
                  <span
                    className={`font-medium ${
                      step >= s.num ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      step > s.num ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Talep Başlığı *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Bilgi İşlem Departmanı için laptop alımı"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Satın alma talebinin detaylı açıklaması..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {loadingData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Veriler yükleniyor...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departman *
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Departman Seçin</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öncelik
                  </label>
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
            )}
          </div>
        )}

        {/* Step 2: Products */}
        {step === 2 && (
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
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 flex items-center gap-4"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Miktar</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(item.id, 'quantity', parseInt(e.target.value))
                            }
                            className="w-full border border-gray-300 rounded px-3 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Birim Fiyat</label>
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(item.id, 'unitPrice', parseFloat(e.target.value))
                            }
                            className="w-full border border-gray-300 rounded px-3 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Toplam</label>
                          <div className="font-semibold text-gray-900 py-1">
                            {item.total.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                            })}
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
                    {totalAmount.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </span>
                </div>
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
                  <span className="text-sm text-gray-600">Departman:</span>
                  <p className="font-medium text-gray-900">
                    {departments.find((d) => d.id === departmentId)?.name}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Öncelik:</span>
                  <p className="font-medium text-gray-900">{priority}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Toplam Tutar:</span>
                  <p className="text-lg font-bold text-blue-600">
                    {totalAmount.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
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
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-gray-50 rounded p-3"
                    >
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} adet × {item.unitPrice.toLocaleString('tr-TR')} TL
                        </p>
                      </div>
                      <p className="font-semibold">
                        {item.total.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        })}
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
              onClick={saveDraft}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Taslak Olarak Kaydet
            </button>
          </div>

          <div className="flex gap-3">
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && (!title || !departmentId)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                İleri
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Gönderiliyor...' : 'Talebi Gönder'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Selection Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title="Ürün Seç"
        size="lg"
      >
        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Henüz ürün bulunmuyor</p>
              <p className="text-sm mt-1">Lütfen önce ürün ekleyin</p>
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => addItem(product)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                  </div>
                  <p className="font-semibold text-blue-600">
                    {product.price.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </DashboardLayout>
  )
}
