'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useNotification } from '@/contexts/NotificationContext'
import { UserPlus, Mail, Lock, User, Building2, Phone } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { success, error } = useNotification()

  const validateTurkishPhone = (phone: string): boolean => {
    // Türk telefon numarası formatları:
    // +90 5XX XXX XX XX veya 0 5XX XXX XX XX veya 5XX XXX XX XX
    const phoneRegex = /^(\+90|0)?5\d{9}$/
    const cleanPhone = phone.replace(/\s/g, '')
    return phoneRegex.test(cleanPhone)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      error('Şifreler eşleşmiyor')
      return
    }

    if (formData.password.length < 6) {
      error('Şifre en az 6 karakter olmalıdır')
      return
    }

    if (!validateTurkishPhone(formData.phone)) {
      error('Geçerli bir Türk telefon numarası giriniz (örn: 0555 123 4567)')
      return
    }

    setLoading(true)

    try {
      // First create company
      console.log('Creating company:', formData.companyName)
      const companyRes = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.companyName,
        }),
      })

      console.log('Company response status:', companyRes.status)

      let companyData
      try {
        companyData = await companyRes.json()
        console.log('Company response data:', companyData)
      } catch (jsonError) {
        console.error('Failed to parse company response:', jsonError)
        throw new Error('Sunucudan geçersiz yanıt alındı. Lütfen daha sonra tekrar deneyin.')
      }

      if (!companyRes.ok || !companyData.success) {
        const errorMsg = companyData.error || `Şirket oluşturulamadı (HTTP ${companyRes.status})`
        console.error('Company creation failed:', errorMsg)
        throw new Error(errorMsg)
      }

      const companyId = companyData.data.id
      console.log('Company created with ID:', companyId)

      // Then create user
      console.log('Creating user for company:', companyId)
      const userRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          companyId,
          role: 'COMPANY_ADMIN',
        }),
      })

      console.log('User response status:', userRes.status)

      let userData
      try {
        userData = await userRes.json()
        console.log('User response data:', userData)
      } catch (jsonError) {
        console.error('Failed to parse user response:', jsonError)
        throw new Error('Kullanıcı oluşturulurken hata oluştu')
      }

      if (!userRes.ok || !userData.success) {
        const errorMsg = userData.error || `Kayıt başarısız (HTTP ${userRes.status})`
        console.error('User creation failed:', errorMsg)
        throw new Error(errorMsg)
      }

      console.log('Registration successful!')
      success('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      console.error('Registration error:', err)
      const errorMessage = err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.'
      error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dental-blue to-dental-dark p-12 text-white flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Building2 size={40} />
            <div>
              <h1 className="text-3xl font-bold">ATTELIA</h1>
              <p className="text-blue-200">Enterprise Satın Alma Platformu</p>
            </div>
          </div>

          <div className="space-y-6 mt-12">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Hızlı Başlangıç</h3>
                <p className="text-blue-100">Dakikalar içinde kurulum</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Ekip Yönetimi</h3>
                <p className="text-blue-100">Kullanıcı ve rol bazlı yetkilendirme</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Güvenli Altyapı</h3>
                <p className="text-blue-100">End-to-end şifreleme</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-blue-200">
          © 2024 Attelia. Tüm hakları saklıdır.
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-dental-blue text-white rounded-full mb-4">
                <UserPlus size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Hesap Oluştur</h2>
              <p className="text-gray-600 mt-2">Şirketinizi kaydedin ve başlayın</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şirket Adı
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-blue"
                    placeholder="Şirket Adı A.Ş."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-blue"
                    placeholder="Ahmet Yıldız"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-blue"
                    placeholder="email@sirket.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-blue"
                    placeholder="0555 123 4567"
                    maxLength={16}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Türk telefon numarası giriniz (0 veya +90 ile başlamalı)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-blue"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-blue"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-dental-blue text-white py-3 rounded-lg font-semibold hover:bg-dental-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <Link href="/login" className="text-dental-blue hover:underline">
                Zaten hesabınız var mı? Giriş yapın
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
