'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { suppliersApi } from '@/lib/api'
import {
  Building,
  Plus,
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
  Package
} from 'lucide-react'

interface Supplier {
  id: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  rating?: number
  isActive: boolean
  createdAt: string
  _count?: {
    products: number
  }
}

export default function SuppliersPage() {
  const { success, error } = useNotification()
  const [loading, setLoading] = useState(true)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      const response = await suppliersApi.getAll()
      if (response.success) {
        setSuppliers(response.data || [])
      }
    } catch (err) {
      console.error('Tedarikçiler yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Tedarikçi',
      sortable: true,
      render: (value: string, row: Supplier) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building className="text-blue-600" size={20} />
          </div>
          <div>
            <div className="font-medium">{value}</div>
            {row.contactPerson && (
              <div className="text-xs text-gray-500">{row.contactPerson}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'İletişim',
      render: (value: string, row: Supplier) => (
        <div className="text-sm">
          {value && <div className="flex items-center gap-1"><Mail size={14} className="text-gray-400" />{value}</div>}
          {row.phone && <div className="flex items-center gap-1 mt-1"><Phone size={14} className="text-gray-400" />{row.phone}</div>}
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Puan',
      render: (value: number) => (
        value ? (
          <div className="flex items-center gap-1">
            <Star className="text-yellow-500 fill-yellow-500" size={16} />
            <span className="font-medium">{value.toFixed(1)}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: '_count',
      label: 'Ürün Sayısı',
      render: (value: any) => (
        <div className="flex items-center gap-1">
          <Package size={14} className="text-gray-400" />
          <span>{value?.products || 0}</span>
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Durum',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
  ]

  const handleRowClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsModalOpen(true)
  }

  // Stats
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter(s => s.isActive).length
  const avgRating = suppliers.filter(s => s.rating).length > 0
    ? suppliers.filter(s => s.rating).reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.filter(s => s.rating).length
    : 0

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tedarikçiler</h1>
            <p className="text-gray-600 mt-1">Tedarikçi listesi ve bilgileri</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Tedarikçi</p>
                <p className="text-2xl font-bold">{totalSuppliers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktif Tedarikçi</p>
                <p className="text-2xl font-bold">{activeSuppliers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ort. Puan</p>
                <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {suppliers.length === 0 ? (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-600 mt-4">Henüz tedarikçi bulunmuyor</p>
            </div>
          ) : (
            <DataTable
              data={suppliers}
              columns={columns}
              searchable
              searchPlaceholder="Tedarikçi ara..."
              onRowClick={handleRowClick}
            />
          )}
        </div>
      </div>

      {/* Supplier Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedSupplier(null)
        }}
        title="Tedarikçi Detayları"
      >
        {selectedSupplier && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="text-blue-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{selectedSupplier.name}</h3>
                {selectedSupplier.contactPerson && (
                  <p className="text-gray-600">{selectedSupplier.contactPerson}</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              {selectedSupplier.email && (
                <div className="flex items-center gap-3">
                  <Mail className="text-gray-400" size={18} />
                  <span>{selectedSupplier.email}</span>
                </div>
              )}
              {selectedSupplier.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="text-gray-400" size={18} />
                  <span>{selectedSupplier.phone}</span>
                </div>
              )}
              {selectedSupplier.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="text-gray-400" size={18} />
                  <span>{selectedSupplier.address}</span>
                </div>
              )}
              {selectedSupplier.website && (
                <div className="flex items-center gap-3">
                  <Globe className="text-gray-400" size={18} />
                  <a href={selectedSupplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {selectedSupplier.website}
                  </a>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Puan</p>
                {selectedSupplier.rating ? (
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-500 fill-yellow-500" size={20} />
                    <span className="text-lg font-bold">{selectedSupplier.rating.toFixed(1)}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">Değerlendirilmemiş</span>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Ürün Sayısı</p>
                <p className="text-lg font-bold">{selectedSupplier._count?.products || 0}</p>
              </div>
              <div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  selectedSupplier.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedSupplier.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
