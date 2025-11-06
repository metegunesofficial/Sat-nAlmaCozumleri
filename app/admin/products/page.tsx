'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { Plus, Edit, Trash2, Package } from 'lucide-react'

export default function ProductsPage() {
  const { success, error } = useNotification()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    categoryId: '',
    stock: '',
    isActive: true,
    description: '',
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const res = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setProducts(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const res = await fetch('/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      sku: '',
      price: '',
      categoryId: '',
      stock: '',
      isActive: true,
      description: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (product: any) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      categoryId: product.categoryId,
      stock: product.stock.toString(),
      isActive: product.isActive,
      description: product.description || '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.sku || !formData.price) {
      error('Lütfen tüm gerekli alanları doldurun')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products'

      const res = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock) || 0,
        })
      })

      if (res.ok) {
        success(editingProduct ? 'Ürün güncellendi!' : 'Ürün eklendi!')
        setIsModalOpen(false)
        fetchProducts()
      } else {
        const data = await res.json()
        error(data.error || 'İşlem başarısız')
      }
    } catch (err) {
      error('Bir hata oluştu')
    }
  }

  const handleDelete = async (product: any) => {
    if (!confirm(`${product.name} ürününü silmek istediğinize emin misiniz?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        success('Ürün silindi!')
        fetchProducts()
      } else {
        error('Silme işlemi başarısız')
      }
    } catch (err) {
      error('Bir hata oluştu')
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Ürün Adı',
      sortable: true,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'sku',
      label: 'SKU',
      render: (value: string) => <code className="text-sm bg-gray-100 px-2 py-1 rounded">{value}</code>,
    },
    {
      key: 'category',
      label: 'Kategori',
      render: (value: any) => value?.name || 'N/A',
    },
    {
      key: 'price',
      label: 'Fiyat',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-green-600">
          {Number(value).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </span>
      ),
    },
    {
      key: 'stock',
      label: 'Stok',
      sortable: true,
      render: (value: number) => (
        <span className={`px-2 py-1 rounded text-sm ${value > 10 ? 'bg-green-100 text-green-800' : value > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Durum',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {value ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Düzenle"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Sil"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ürün Yönetimi</h1>
            <p className="text-gray-600 mt-1">Ürünleri görüntüle, ekle ve düzenle</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Yeni Ürün Ekle
          </button>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz ürün yok</h3>
            <p className="text-gray-600 mb-4">
              Yeni ürün eklemek için yukarıdaki butonu kullanın
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Plus size={20} />
              İlk Ürünü Ekle
            </button>
          </div>
        ) : (
          <DataTable
            data={products}
            columns={columns}
            searchable
            searchPlaceholder="Ürün ara..."
          />
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Adı *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ürün adını girin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ürün kodu"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat (TL) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok Miktarı
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Kategori seçin</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ürün açıklaması"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Aktif ürün
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingProduct ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
