'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { User, Mail, Phone, Building2, Briefcase, Lock, Save, KeyRound } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const { success, error } = useNotification()

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [isSaving, setIsSaving] = useState(false)

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    position: user?.position || '',
    department: user?.department || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      // TODO: API integration
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      success('Profil bilgileriniz güncellendi')
    } catch (err) {
      error('Profil güncellenemedi')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('Yeni şifreler eşleşmiyor')
      return
    }

    if (passwordData.newPassword.length < 8) {
      error('Şifre en az 8 karakter olmalıdır')
      return
    }

    setIsSaving(true)
    try {
      // TODO: API integration
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      success('Şifreniz başarıyla değiştirildi')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      error('Şifre değiştirilemedi')
    } finally {
      setIsSaving(false)
    }
  }

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Süper Yönetici',
    COMPANY_ADMIN: 'Şirket Yöneticisi',
    GENERAL_MANAGER: 'Genel Müdür',
    FINANCE_MANAGER: 'Finans Müdürü',
    PROCUREMENT_MANAGER: 'Satın Alma Müdürü',
    DEPARTMENT_MANAGER: 'Departman Müdürü',
    EMPLOYEE: 'Çalışan',
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Profil Ayarları</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <User className="w-5 h-5 inline mr-2" />
            Profil Bilgileri
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'password'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Lock className="w-5 h-5 inline mr-2" />
            Şifre Değiştir
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            {/* User Info Card */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
                  <p className="text-gray-600 mt-1">{roleLabels[user?.role || ''] || user?.role}</p>
                  <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Ad Soyad
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ad Soyad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  E-posta
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5xxxxxxxxx"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-2" />
                    Pozisyon
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={profileData.position}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Pozisyon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Departman
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={profileData.department}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="Departman"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Departman değişikliği için yöneticinize başvurun</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Şifre Değiştir</h2>
              <p className="text-gray-600 text-sm">
                Güçlü bir şifre seçin. Şifreniz en az 8 karakter olmalı ve büyük harf, küçük harf ve rakam içermelidir.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <KeyRound className="w-4 h-4 inline mr-2" />
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mevcut şifreniz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yeni şifreniz"
                />
                {passwordData.newPassword && passwordData.newPassword.length < 8 && (
                  <p className="text-xs text-red-500 mt-1">Şifre en az 8 karakter olmalıdır</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yeni şifrenizi tekrar girin"
                />
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Şifreler eşleşmiyor</p>
                )}
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleChangePassword}
                  disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <KeyRound className="w-5 h-5 mr-2" />
                  {isSaving ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                </button>
              </div>
            </div>

            {/* Security Tips */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Güvenlik İpuçları:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Şifrenizi başkalarıyla paylaşmayın</li>
                <li>• Farklı platformlarda farklı şifreler kullanın</li>
                <li>• Şifrenizi düzenli olarak değiştirin</li>
                <li>• Tahmin edilmesi kolay şifreler kullanmayın</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
