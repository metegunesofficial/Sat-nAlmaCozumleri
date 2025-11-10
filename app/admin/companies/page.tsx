'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Edit, Trash2, Users } from 'lucide-react'
import Modal from '@/components/Modal'

interface Company {
  id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: string
  _count?: {
    users: number
  }
}

export default function CompaniesPage() {
  const { user, token } = useAuth()
  const { success, error } = useNotification()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminPhone: '',
  })
  const [creating, setCreating] = useState(false)

  // Only SUPER_ADMIN can access
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      error('Bu sayfaya erişim yetkiniz yok')
      router.push('/dashboard')
    }
  }, [user, router, error])

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      fetchCompanies()
    }
  }, [user, token])

  const fetchCompanies = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/admin/companies', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()

      if (data.success) {
        setCompanies(data.data)
      }
    } catch (err) {
      console.error('Companies fetch error:', err)
      error('Şirketler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.companyName || !formData.adminEmail || !formData.adminPassword) {
      error('Lütfen tüm zorunlu alanları doldurun')
      return
    }

    setCreating(true)

    try {
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Şirket oluşturulamadı')
      }

      success('Şirket ve admin kullanıcı başarıyla oluşturuldu!')
      setIsCreateModalOpen(false)
      setFormData({
        companyName: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        adminPhone: '',
      })
      fetchCompanies()
    } catch (err: any) {
      error(err.message || 'Şirket oluşturulurken hata oluştu')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleActive = async (companyId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Durum güncellenemedi')
      }

      success(`Şirket ${!currentStatus ? 'aktif' : 'pasif'} hale getirildi`)
      fetchCompanies()
    } catch (err: any) {
      error(err.message || 'Durum güncellenirken hata oluştu')
    }
  }

  if (user?.role !== 'SUPER_ADMIN') {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Şirket Yönetimi</h1>
            <p className="text-gray-600 mt-1">
              Yeni müşteri şirketleri oluşturun ve yönetin
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Yeni Şirket Oluştur
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Şirket</p>
                <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Building2 className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktif Şirketler</p>
                <p className="text-2xl font-bold text-gray-900">
                  {companies.filter((c) => c.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <Building2 className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pasif Şirketler</p>
                <p className="text-2xl font-bold text-gray-900">
                  {companies.filter((c) => !c.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Şirketler</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Yükleniyor...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Henüz şirket eklenmedi</p>
              <p className="text-sm mt-1">Yeni şirket oluşturmak için yukarıdaki butonu kullanın</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Şirket Adı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kullanıcı Sayısı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Oluşturulma
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 size={18} className="text-blue-600" />
                          <span className="font-medium text-gray-900">{company.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{company.slug}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users size={16} />
                          <span>{company._count?.users || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            company.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {company.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(company.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(company.id, company.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                              company.isActive
                                ? 'hover:bg-red-50 text-red-600'
                                : 'hover:bg-green-50 text-green-600'
                            }`}
                            title={company.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                          >
                            {company.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Company Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Yeni Şirket Oluştur"
        size="lg"
      >
        <form onSubmit={handleCreateCompany} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Not:</strong> Şirket oluşturulduğunda otomatik olarak bir COMPANY_ADMIN kullanıcı da oluşturulacaktır.
              Bu bilgileri müşteriye ileterek giriş yapmasını sağlayabilirsiniz.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şirket Adı *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: ABC Dental Kliği"
              required
            />
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Şirket Admin Bilgileri
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Adı Soyadı *
                </label>
                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ahmet Yılmaz"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email *
                </label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@abcdental.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Şifre *
                </label>
                <input
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 6 karakter"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bu şifreyi müşteriye ileteceksiniz. Müşteri giriş yaptıktan sonra değiştirebilir.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Telefon
                </label>
                <input
                  type="tel"
                  value={formData.adminPhone}
                  onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5551234567"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {creating ? 'Oluşturuluyor...' : 'Şirket Oluştur'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
