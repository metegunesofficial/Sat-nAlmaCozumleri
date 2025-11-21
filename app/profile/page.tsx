'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { User, Mail, Building2, Briefcase, Lock, Save } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const { success, error } = useNotification()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    position: user?.position || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleProfileSave = async () => {
    if (!profileData.name || !profileData.email) {
      error('Ad ve email zorunludur')
      return
    }

    setLoading(true)
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 500))
      success('Profil güncellendi')
    } catch (err) {
      error('Profil güncellenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      error('Tüm alanları doldurun')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('Yeni şifreler eşleşmiyor')
      return
    }

    if (passwordData.newPassword.length < 6) {
      error('Şifre en az 6 karakter olmalıdır')
      return
    }

    setLoading(true)
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 500))
      success('Şifre değiştirildi')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      error('Şifre değiştirilirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Süper Admin',
    COMPANY_ADMIN: 'Şirket Yöneticisi',
    EMPLOYEE: 'Çalışan',
    DEPARTMENT_MANAGER: 'Departman Müdürü',
    FINANCE_MANAGER: 'Finans Müdürü',
    GENERAL_MANAGER: 'Genel Müdür',
    PROCUREMENT_MANAGER: 'Satın Alma Müdürü',
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
          <p className="text-gray-600 mt-1">Hesap bilgilerinizi yönetin</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={32} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {roleLabels[user?.role || ''] || user?.role}
                </span>
                {user?.companyName && (
                  <span className="text-gray-500">{user.companyName}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Profil Bilgileri
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'password'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Şifre Değiştir
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'profile' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pozisyon
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={profileData.position}
                      onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şirket
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={user?.companyName || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departman
                  </label>
                  <input
                    type="text"
                    value={user?.departmentName || '-'}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <button
                  onClick={handleProfileSave}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <Save size={20} />
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mevcut Şifre
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yeni Şifre Tekrar
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <Lock size={20} />
                  {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
