'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { Plus, Edit, Trash2, Briefcase, Star } from 'lucide-react'

const mockSuppliers = [
  { id: 's1', name: 'ABC Teknoloji A.Ş.', contact: 'Ahmet Yılmaz', email: 'info@abc.com', phone: '0212 555 1234', rating: 4.5, totalOrders: 45, status: 'active' },
  { id: 's2', name: 'XYZ Ofis Mobilyaları', contact: 'Ayşe Demir', email: 'contact@xyz.com', phone: '0216 555 5678', rating: 4.2, totalOrders: 32, status: 'active' },
  { id: 's3', name: 'Delta Yazılım Ltd.', contact: 'Mehmet Kaya', email: 'sales@delta.com', phone: '0312 555 9012', rating: 4.8, totalOrders: 67, status: 'active' },
  { id: 's4', name: 'Kırtasiye Dünyası', contact: 'Fatma Şahin', email: 'info@kirtasiye.com', phone: '0312 555 3456', rating: 3.9, totalOrders: 23, status: 'active' },
]

export default function SuppliersPage() {
  const { success, error } = useNotification()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    status: 'active',
  })

  const openCreateModal = () => {
    setEditingSupplier(null)
    setFormData({
      name: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      taxNumber: '',
      status: 'active',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (supplier: any) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address || '',
      taxNumber: supplier.taxNumber || '',
      status: supplier.status,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      error('Lütfen gerekli alanları doldurun')
      return
    }
    if (editingSupplier) {
      success('Tedarikçi güncellendi!')
    } else {
      success('Tedarikçi eklendi!')
    }
    setIsModalOpen(false)
  }

  const handleDelete = (supplier: any) => {
    if (confirm(`${supplier.name} tedarikçisini silmek istediğinize emin misiniz?`)) {
      success('Tedarikçi silindi!')
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Tedarikçi Adı',
      sortable: true,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'contact',
      label: 'İlgili Kişi',
      sortable: true,
    },
    {
      key: 'email',
      label: 'E-posta',
      render: (value: string) => <span className="text-gray-600">{value}</span>,
    },
    {
      key: 'phone',
      label: 'Telefon',
      render: (value: string) => <span className="text-gray-600">{value}</span>,
    },
    {
      key: 'rating',
      label: 'Değerlendirme',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
          <span className="font-semibold">{value.toFixed(1)}</span>
        </div>
      ),
    },
    {
      key: 'totalOrders',
      label: 'Sipariş Sayısı',
      sortable: true,
      render: (value: number) => (
        <span className="inline-flex items-center justify-center w-12 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
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
            value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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
            <h1 className="text-3xl font-bold text-gray-900">Tedarikçi Yönetimi</h1>
            <p className="text-gray-600 mt-1">Tedarikçi bilgilerini yönet</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Yeni Tedarikçi Ekle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Briefcase className="text-blue-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{mockSuppliers.length}</p>
                <p className="text-sm text-gray-600">Toplam Tedarikçi</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Briefcase className="text-green-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {mockSuppliers.filter((s) => s.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600">Aktif Tedarikçi</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Star className="text-yellow-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(
                    mockSuppliers.reduce((sum, s) => sum + s.rating, 0) / mockSuppliers.length
                  ).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Ortalama Puan</p>
              </div>
            </div>
          </div>
        </div>

        <DataTable data={mockSuppliers} columns={columns} searchable searchPlaceholder="Tedarikçi ara..." />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi Ekle'}
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
              {editingSupplier ? 'Güncelle' : 'Ekle'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tedarikçi Adı *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İlgili Kişi
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vergi Numarası
              </label>
              <input
                type="text"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
      </Modal>
    </DashboardLayout>
  )
}
