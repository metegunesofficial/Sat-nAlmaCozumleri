'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/contexts/NotificationContext'
import {
  Building2,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2,
  Activity
} from 'lucide-react'
import Modal from '@/components/Modal'

interface Company {
  id: string
  name: string
  slug: string
  taxNumber?: string
  city?: string
  email?: string
  phone?: string
  isActive: boolean
  createdAt: string
  _count: {
    users: number
    departments: number
    products: number
    purchaseRequests: number
    orders: number
  }
}

interface Stats {
  overview: {
    totalCompanies: number
    activeCompanies: number
    totalUsers: number
    activeUsers: number
    totalDepartments: number
    totalProducts: number
    totalPurchaseRequests: number
    totalOrders: number
    pendingRequests: number
    approvedRequests: number
    totalSpent: number
  }
}

export default function DeveloperPanelPage() {
  const router = useRouter()
  const { success, error } = useNotification()
  const [companies, setCompanies] = useState<Company[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    taxNumber: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: ''
  })

  useEffect(() => {
    checkSuperAdmin()
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkSuperAdmin = () => {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      if (userData.role !== 'SUPER_ADMIN') {
        error('Bu sayfaya erişim yetkiniz yok')
        router.push('/dashboard')
      }
    } else {
      router.push('/login')
    }
  }

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const [companiesRes, statsRes] = await Promise.all([
        fetch('/api/developer/companies', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/developer/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const companiesData = await companiesRes.json()
      const statsData = await statsRes.json()

      if (companiesData.success) {
        setCompanies(companiesData.data)
      }
      if (statsData.success) {
        setStats(statsData.data)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      error('Veri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCompany = async () => {
    if (!formData.name || !formData.slug) {
      error('Şirket adı ve slug gerekli')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/developer/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        success('Şirket başarıyla oluşturuldu!')
        setIsModalOpen(false)
        setFormData({
          name: '',
          slug: '',
          taxNumber: '',
          address: '',
          city: '',
          phone: '',
          email: '',
          website: ''
        })
        fetchData()
      } else {
        error(data.error || 'Şirket oluşturulamadı')
      }
    } catch (err) {
      console.error('Create company error:', err)
      error('Bir hata oluştu')
    }
  }

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    if (!confirm(`${companyName} şirketini silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm veriler silinecektir.`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/developer/companies/${companyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (data.success) {
        success('Şirket başarıyla silindi')
        fetchData()
      } else {
        error(data.error || 'Şirket silinemedi')
      }
    } catch (err) {
      console.error('Delete error:', err)
      error('Bir hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">🔧 Developer Panel</h1>
              <p className="text-purple-100">Platform Yönetimi ve Kontrol Paneli</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Yeni Şirket Oluştur
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="text-purple-600" size={24} />
                <span className="text-sm text-gray-600">Toplam Şirket</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.totalCompanies}</p>
              <p className="text-sm text-green-600 mt-1">{stats.overview.activeCompanies} aktif</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="text-blue-600" size={24} />
                <span className="text-sm text-gray-600">Toplam Kullanıcı</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.totalUsers}</p>
              <p className="text-sm text-green-600 mt-1">{stats.overview.activeUsers} aktif</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="text-orange-600" size={24} />
                <span className="text-sm text-gray-600">Satın Alma Talepleri</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.totalPurchaseRequests}</p>
              <p className="text-sm text-yellow-600 mt-1">{stats.overview.pendingRequests} beklemede</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-green-600" size={24} />
                <span className="text-sm text-gray-600">Toplam Harcama</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.overview.totalSpent.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0
                })}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stats.overview.approvedRequests} onaylı talep</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="text-indigo-600" size={24} />
                <span className="text-sm text-gray-600">Toplam Departman</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.totalDepartments}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Package className="text-pink-600" size={24} />
                <span className="text-sm text-gray-600">Toplam Ürün</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.totalProducts}</p>
            </div>
          </div>
        )}

        {/* Companies Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Tüm Şirketler</h2>
            <p className="text-sm text-gray-600 mt-1">Platformdaki tüm şirketleri yönetin</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Şirket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İletişim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcılar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Talepler</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{company.name}</p>
                        <p className="text-sm text-gray-500">/{company.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {company.email && <p className="text-gray-900">{company.email}</p>}
                        {company.phone && <p className="text-gray-500">{company.phone}</p>}
                        {company.city && <p className="text-gray-500">{company.city}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-semibold text-blue-600">{company._count.users}</p>
                        <p className="text-gray-500">{company._count.departments} departman</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-semibold text-orange-600">{company._count.purchaseRequests}</p>
                        <p className="text-gray-500">{company._count.orders} sipariş</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        company.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {company.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/developer/companies/${company.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Detayları Görüntüle"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company.id, company.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {companies.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="mx-auto mb-3 text-gray-400" size={48} />
                <p>Henüz şirket bulunmuyor</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  İlk şirketi oluşturun
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Company Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni Şirket Oluştur"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={handleCreateCompany}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Oluştur
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şirket Adı *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Örn: Attelia Dental"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="attelia-dental"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vergi Numarası</label>
              <input
                type="text"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şehir</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
