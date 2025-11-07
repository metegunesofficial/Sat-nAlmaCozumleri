'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { LogIn, Mail, Lock, Building2, Crown } from 'lucide-react'

type LoginMode = 'company' | 'platform'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginMode, setLoginMode] = useState<LoginMode>('company')
  const router = useRouter()
  const { login } = useAuth()
  const { success, error } = useNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      success('Giriş başarılı! Yönlendiriliyorsunuz...')
      router.push('/dashboard')
    } catch (err: any) {
      error(err.message || 'Giriş başarısız')
    } finally {
      setLoading(false)
    }
  }

  const companyQuickLogins = [
    { email: 'admin@dentalmerkez.com', role: 'Dental Merkez - Admin' },
    { email: 'admin@smileclinic.com', role: 'Smile Clinic - Admin' },
    { email: 'admin@dentplus.com', role: 'DentPlus - Admin' },
    { email: 'finans@dentalmerkez.com', role: 'Dental Merkez - Finans' },
  ]

  const platformQuickLogins = [
    { email: 'superadmin@attelia.com', role: 'Platform Admin' },
  ]

  const quickLogins = loginMode === 'company' ? companyQuickLogins : platformQuickLogins

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
                <h3 className="font-semibold text-lg">Çok Aşamalı Onay</h3>
                <p className="text-blue-100">Tutar bazlı otomatik workflow ataması</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">3 Katmanlı Bütçe</h3>
                <p className="text-blue-100">Kişi, departman ve şirket bazlı</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Detaylı Raporlama</h3>
                <p className="text-blue-100">Gerçek zamanlı analiz ve dashboard</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-blue-200">
          © 2024 Attelia. Tüm hakları saklıdır.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-dental-blue text-white rounded-full mb-4">
                {loginMode === 'company' ? <Building2 size={32} /> : <Crown size={32} />}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Hoş Geldiniz</h2>
              <p className="text-gray-600 mt-2">
                {loginMode === 'company' ? 'Şirket hesabınıza giriş yapın' : 'Platform yönetimi'}
              </p>
            </div>

            {/* Login Mode Selector */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setLoginMode('company')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  loginMode === 'company'
                    ? 'bg-dental-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Building2 size={18} />
                Şirket Girişi
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('platform')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  loginMode === 'platform'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Crown size={18} />
                Platform Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-blue"
                    placeholder="email@ornek.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {loginMode === 'company' ? 'Demo Şirket Hesapları' : 'Platform Yönetimi'}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {quickLogins.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => {
                      setEmail(account.email)
                      setPassword(loginMode === 'platform' ? 'SuperAdmin123!' : 'password123')
                    }}
                    className="text-xs p-2 border border-gray-300 rounded hover:bg-gray-50 text-left"
                  >
                    <div className="font-semibold text-dental-blue truncate">{account.role}</div>
                    <div className="text-gray-500 truncate">{account.email}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <Link href="/register" className="text-dental-blue hover:underline">
                Hesabınız yok mu? Kayıt olun
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              {loginMode === 'company' ? (
                <>Şirket hesapları: <code className="bg-gray-200 px-2 py-1 rounded">password123</code></>
              ) : (
                <>Platform Admin: <code className="bg-gray-200 px-2 py-1 rounded">SuperAdmin123!</code></>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
