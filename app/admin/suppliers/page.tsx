'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import Loading from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
import { useNotification } from '@/contexts/NotificationContext'
import { suppliersApi, ApiError } from '@/lib/api'
import { Plus, Edit, Trash2, Briefcase, Star } from 'lucide-react'

export default function SuppliersPage() {
  const { success, error } = useNotification()
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    taxNumber: '',
    website: '',
    notes: '',
    status: 'ACTIVE',
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true)
      const response = await suppliersApi.getAll()
      if (response.success) {
        setSuppliers(response.data)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        error(err.message)
      } else {
        error('Tedarikçiler yüklenemedi')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingSupplier(null)
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      taxNumber: '',
      website: '',
      notes: '',
      status: 'ACTIVE',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (supplier: any) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      email: supplier.email,
      phone: supplier.phone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      taxNumber: supplier.taxNumber || '',
      website: supplier.website || '',
      notes: supplier.notes || '',
      status: supplier.status,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      error('Lütfen gerekli alanları doldurun')
      return
    }

    try {
      setIsSubmitting(true)
      if (editingSupplier) {
        const response = await suppliersApi.update(editingSupplier.id, formData)
        if (response.success) {
          success('Tedarikçi güncellendi!')
          await fetchSuppliers()
          setIsModalOpen(false)
        }
      } else {
        const response = await suppliersApi.create(formData)
        if (response.success) {
          success('Tedarikçi eklendi!')
          await fetchSuppliers()
          setIsModalOpen(false)
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        error(err.message)
      } else {
        error('İşlem başarısız')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (supplier: any) => {
    if (!confirm(`${supplier.name} tedarikçisini silmek istediğinize emin misiniz?`)) {
      return
    }

    try {
      const response = await suppliersApi.delete(supplier.id)
      if (response.success) {
        success('Tedarikçi silindi!')
        await fetchSuppliers()
      }
    } catch (err) {
      if (err instanceof ApiError) {
        error(err.message)
      } else {
        error('Tedarikçi silinemedi')
      }
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
      key: 'contactPerson',
      label: 'İlgili Kişi',
      sortable: true,
      render: (value: string) => value || '-',
    },
    {
      key: 'email',
      label: 'E-posta',
      render: (value: string) => <span className="text-gray-600">{value}</span>,
    },
    {
      key: 'phone',
      label: 'Telefon',
      render: (value: string) => <span className="text-gray-600">{value || '-'}</span>,
    },
    {
      key: 'rating',
      label: 'Değerlendirme',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
          <span className="font-semibold">{value ? value.toFixed(1) : '0.0'}</span>
        </div>
      ),
    },
    {
      key: '_count',
      label: 'Ürün Sayısı',
      sortable: false,
      render: (value: any) => (
        <span className="inline-flex items-center justify-center w-12 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
          {value?.products || 0}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Durum',
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value === 'ACTIVE' ? 'Aktif' : 'Pasif'}
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

  const activeSuppliers = suppliers.filter((s) => s.status === 'ACTIVE')
  const avgRating = suppliers.length > 0
    ? suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length
    : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tedarikçi Yönetimi</h1>
            <p className="text-gray-600 mt-1">Tedarikçi bilgilerini yönet</p>
          </div>
          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Yeni Tedarikçi Ekle
          </button>
        </div>

        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Briefcase className="text-blue-600" size={24} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
                  <p className="text-sm text-gray-600">Toplam Tedarikçi</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Briefcase className="text-green-600" size={24} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{activeSuppliers.length}</p>
                  <p className="text-sm text-gray-600">Aktif Tedarikçi</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Star className="text-yellow-600" size={24} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Ortalama Puan</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <Loading message="Tedarikçiler yükleniyor..." />
        ) : suppliers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <EmptyState
              icon={Briefcase}
              title="Henüz tedarikçi eklenmemiş"
              description="İlk tedarikçinizi ekleyerek başlayın"
              action={{
                label: 'Tedarikçi Ekle',
                onClick: () => openCreateModal(),
              }}
            />
          </div>
        ) : (
          <DataTable data={suppliers} columns={columns} searchable searchPlaceholder="Tedarikçi ara..." />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingSupplier ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi Ekle'}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Kaydediliyor...' : editingSupplier ? 'Güncelle' : 'Ekle'}
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
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İlgili Kişi
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şehir</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vergi Numarası
              </label>
              <input
                type="text"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notlar</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Pasif</option>
              <option value="SUSPENDED">Askıya Alındı</option>
            </select>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
