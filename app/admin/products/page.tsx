'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import CategorySelector from '@/components/CategorySelector'
import { useNotification } from '@/contexts/NotificationContext'
import { Plus, Edit, Trash2, Package } from 'lucide-react'

const mockProducts = [
  { id: 'p1', name: 'Dell Latitude 5430 Laptop', sku: 'DL-5430', price: 35000, category: 'Bilgisayar', stock: 12, status: 'active' },
  { id: 'p2', name: 'HP LaserJet Pro Printer', sku: 'HP-LJ-PRO', price: 8500, category: 'Yazıcı', stock: 8, status: 'active' },
  { id: 'p3', name: 'Logitech MX Master Mouse', sku: 'LG-MXM', price: 1200, category: 'Aksesuar', stock: 45, status: 'active' },
  { id: 'p4', name: 'Samsung 27" Monitor', sku: 'SM-27-MON', price: 6500, category: 'Monitör', stock: 15, status: 'active' },
  { id: 'p5', name: 'Microsoft Office 365 Lisans', sku: 'MS-O365', price: 450, category: 'Yazılım', stock: 0, status: 'inactive' },
]

export default function ProductsPage() {
  const { success, error } = useNotification()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    categoryId: '',
    stock: '',
    status: 'active',
    description: '',
  })

  const openCreateModal = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      sku: '',
      price: '',
      categoryId: '',
      stock: '',
      status: 'active',
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
      categoryId: product.categoryId || '',
      stock: product.stock.toString(),
      status: product.status,
      description: product.description || '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.sku || !formData.price) {
      error('Lütfen tüm gerekli alanları doldurun')
      return
    }

    if (editingProduct) {
      success('Ürün güncellendi!')
    } else {
      success('Ürün eklendi!')
    }
    setIsModalOpen(false)
  }

  const handleDelete = (product: any) => {
    if (confirm(`${product.name} ürününü silmek istediğinize emin misiniz?`)) {
      success('Ürün silindi!')
    }
  }

  const columns = [
    {
      key: 'sku',
      label: 'SKU',
      sortable: true,
      render: (value: string) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: 'name',
      label: 'Ürün Adı',
      sortable: true,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'category',
      label: 'Kategori',
      sortable: true,
    },
    {
      key: 'price',
      label: 'Fiyat',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold">
          {value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </span>
      ),
    },
    {
      key: 'stock',
      label: 'Stok',
      sortable: true,
      render: (value: number) => (
        <span
          className={`inline-flex items-center justify-center w-12 h-8 rounded-full text-sm font-semibold ${
            value === 0
              ? 'bg-red-100 text-red-800'
              : value < 10
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Durum',
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value === 'active' ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              openEditModal(row)
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(row)
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ürün Yönetimi</h1>
            <p className="text-gray-600 mt-1">Sistemdeki ürünleri görüntüle ve yönet</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Yeni Ürün Ekle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Package className="text-blue-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{mockProducts.length}</p>
                <p className="text-sm text-gray-600">Toplam Ürün</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Package className="text-green-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {mockProducts.filter((p) => p.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600">Aktif Ürün</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Package className="text-yellow-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {mockProducts.filter((p) => p.stock < 10 && p.stock > 0).length}
                </p>
                <p className="text-sm text-gray-600">Düşük Stok</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Package className="text-red-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {mockProducts.filter((p) => p.stock === 0).length}
                </p>
                <p className="text-sm text-gray-600">Stokta Yok</p>
              </div>
            </div>
          </div>
        </div>

        <DataTable
          data={mockProducts}
          columns={columns}
          searchable
          searchPlaceholder="Ürün ara..."
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {editingProduct ? 'Güncelle' : 'Ekle'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Adı *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiyat (TL) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stok</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CategorySelector
              value={formData.categoryId}
              onChange={(categoryId) => setFormData({ ...formData, categoryId })}
              label="Kategori"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
