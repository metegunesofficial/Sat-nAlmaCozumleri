'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/contexts/NotificationContext'
import {
  Building2,
  Users,
  ShoppingCart,
  Package,
  ChevronLeft,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Activity,
  TrendingUp,
  Calendar
} from 'lucide-react'
import Modal from '@/components/Modal'

interface CompanyDetail {
  id: string
  name: string
  slug: string
  taxNumber?: string
  address?: string
  city?: string
  phone?: string
  email?: string
  website?: string
  isActive: boolean
  createdAt: string
  users: any[]
  departments: any[]
  products: any[]
  purchaseRequests: any[]
  orders: any[]
  _count: {
    users: number
    departments: number
    products: number
    purchaseRequests: number
    orders: number
    categories: number
    workflows: number
  }
  stats: {
    totalUsers: number
    activeUsers: number
    pendingRequests: number
    approvedRequests: number
    rejectedRequests: number
    totalSpent: number
  }
}

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { success, error } = useNotification()
  const [company, setCompany] = useState<CompanyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    position: '',
    phone: '',
    departmentId: ''
  })
  const [editFormData, setEditFormData] = useState({
    name: '',
    taxNumber: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    isActive: true
  })

  useEffect(() => {
    checkSuperAdmin()
    fetchCompany()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

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

  const fetchCompany = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/developer/companies/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (data.success) {
        setCompany(data.data)
        setEditFormData({
          name: data.data.name,
          taxNumber: data.data.taxNumber || '',
          address: data.data.address || '',
          city: data.data.city || '',
          phone: data.data.phone || '',
          email: data.data.email || '',
          website: data.data.website || '',
          isActive: data.data.isActive
        })
      } else {
        error(data.error || 'Şirket bulunamadı')
        router.push('/developer')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      error('Veri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!userFormData.name || !userFormData.email || !userFormData.password || !userFormData.role) {
      error('Ad, email, şifre ve rol gerekli')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/developer/companies/${params.id}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userFormData)
      })

      const data = await response.json()
      if (data.success) {
        success('Kullanıcı başarıyla oluşturuldu!')
        setIsUserModalOpen(false)
        setUserFormData({
          name: '',
          email: '',
          password: '',
          role: 'EMPLOYEE',
          position: '',
          phone: '',
          departmentId: ''
        })
        fetchCompany()
      } else {
        error(data.error || 'Kullanıcı oluşturulamadı')
      }
    } catch (err) {
      console.error('Create user error:', err)
      error('Bir hata oluştu')
    }
  }

  const handleUpdateCompany = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/developer/companies/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      })

      const data = await response.json()
      if (data.success) {
        success('Şirket başarıyla güncellendi!')
        setIsEditModalOpen(false)
        fetchCompany()
      } else {
        error(data.error || 'Şirket güncellenemedi')
      }
    } catch (err) {
      console.error('Update error:', err)
      error('Bir hata oluştu')
    }
  }

  const roles = [
    { value: 'SUPER_ADMIN', label: 'Süper Admin' },
    { value: 'COMPANY_ADMIN', label: 'Şirket Yöneticisi' },
    { value: 'GENERAL_MANAGER', label: 'Genel Müdür' },
    { value: 'FINANCE_MANAGER', label: 'Finans Müdürü' },
    { value: 'PROCUREMENT_MANAGER', label: 'Satın Alma Müdürü' },
    { value: 'DEPARTMENT_MANAGER', label: 'Departman Müdürü' },
    { value: 'EMPLOYEE', label: 'Çalışan' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => router.push('/developer')}
            className="flex items-center gap-2 text-purple-100 hover:text-white mb-4"
          >
            <ChevronLeft size={20} />
            Developer Panele Dön
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Building2 size={32} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{company.name}</h1>
                  <p className="text-purple-100">/{company.slug}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                {company.email && (
                  <div className="flex items-center gap-2 text-purple-100">
                    <Mail size={16} />
                    <span>{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2 text-purple-100">
                    <Phone size={16} />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company.city && (
                  <div className="flex items-center gap-2 text-purple-100">
                    <MapPin size={16} />
                    <span>{company.city}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-2 text-purple-100">
                    <Globe size={16} />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {company.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
            >
              <Edit size={18} />
              Düzenle
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-blue-600" size={24} />
              <span className="text-sm text-gray-600">Kullanıcılar</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{company._count.users}</p>
            <p className="text-sm text-green-600 mt-1">{company.stats.activeUsers} aktif</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="text-orange-600" size={24} />
              <span className="text-sm text-gray-600">Satın Alma</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{company._count.purchaseRequests}</p>
            <p className="text-sm text-yellow-600 mt-1">{company.stats.pendingRequests} beklemede</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-green-600" size={24} />
              <span className="text-sm text-gray-600">Toplam Harcama</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {company.stats.totalSpent.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                maximumFractionDigits: 0
              })}
            </p>
            <p className="text-sm text-gray-500 mt-1">{company.stats.approvedRequests} onaylı</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Package className="text-purple-600" size={24} />
              <span className="text-sm text-gray-600">Ürünler</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{company._count.products}</p>
            <p className="text-sm text-gray-500 mt-1">{company._count.departments} departman</p>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Kullanıcılar</h2>
              <p className="text-sm text-gray-600 mt-1">Şirket kullanıcılarını yönetin</p>
            </div>
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <Plus size={18} />
              Kullanıcı Ekle
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {company.users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        {user.position && <p className="text-sm text-gray-500">{user.position}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {roles.find(r => r.value === user.role)?.label || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {company.users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="mx-auto mb-3 text-gray-400" size={48} />
                <p>Henüz kullanıcı yok</p>
                <button
                  onClick={() => setIsUserModalOpen(true)}
                  className="mt-4 text-purple-600 hover:underline"
                >
                  İlk kullanıcıyı ekleyin
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Departments Section */}
        {company.departments.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Departmanlar</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {company.departments.map((dept) => (
                  <div key={dept.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{dept.code}</span>
                    </div>
                    {dept.yearlyBudget && (
                      <p className="text-sm text-gray-600">
                        Bütçe: {dept.yearlyBudget.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Purchase Requests */}
        {company.purchaseRequests.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Son Satın Alma Talepleri</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Talep</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Talep Eden</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {company.purchaseRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{request.title}</p>
                        <p className="text-xs text-gray-500">{request.priority}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{request.requester.name}</p>
                        <p className="text-xs text-gray-500">{request.requester.email}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {request.totalAmount?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Yeni Kullanıcı Ekle"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setIsUserModalOpen(false)}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={handleCreateUser}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Oluştur
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Not:</strong> Bu bilgileri müşterinizle paylaşacaksınız. Müşteri bu email ve şifre ile giriş yapacak.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad *</label>
              <input
                type="text"
                value={userFormData.name}
                onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şifre *</label>
              <input
                type="text"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Örn: 123456"
              />
              <p className="text-xs text-gray-500 mt-1">Bu şifreyi müşterinize vereceksiniz</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol *</label>
              <select
                value={userFormData.role}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                {roles.filter(r => r.value !== 'SUPER_ADMIN').map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pozisyon</label>
              <input
                type="text"
                value={userFormData.position}
                onChange={(e) => setUserFormData({ ...userFormData, position: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Örn: Genel Müdür"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input
                type="tel"
                value={userFormData.phone}
                onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          {company.departments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departman (Opsiyonel)</label>
              <select
                value={userFormData.departmentId}
                onChange={(e) => setUserFormData({ ...userFormData, departmentId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">Seçiniz</option>
                {company.departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Company Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Şirket Bilgilerini Düzenle"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={handleUpdateCompany}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Güncelle
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Şirket Adı *</label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vergi Numarası</label>
              <input
                type="text"
                value={editFormData.taxNumber}
                onChange={(e) => setEditFormData({ ...editFormData, taxNumber: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şehir</label>
              <input
                type="text"
                value={editFormData.city}
                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
            <textarea
              value={editFormData.address}
              onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={editFormData.website}
                onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editFormData.isActive}
                onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Şirket Aktif</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  )
}
