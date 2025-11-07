'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { LogIn, Mail, Lock, Building2, Sparkles, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDemoForm, setShowDemoForm] = useState(false)
  const [demoEmail, setDemoEmail] = useState('')
  const [demoCompanyName, setDemoCompanyName] = useState('')
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoCredentials, setDemoCredentials] = useState<{ email: string; password: string } | null>(null)
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

  const handleDemoProvision = async (e: React.FormEvent) => {
    e.preventDefault()
    setDemoLoading(true)

    try {
      const response = await fetch('/api/demo/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: demoEmail,
          companyName: demoCompanyName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Demo oluşturulamadı')
      }

      setDemoCredentials({
        email: data.data.email,
        password: data.data.password,
      })

      success('Demo hesabınız oluşturuldu! Giriş yapabilirsiniz.')
    } catch (err: any) {
      error(err.message || 'Demo oluşturma başarısız')
    } finally {
      setDemoLoading(false)
    }
  }

  const handleUseDemoCredentials = () => {
    if (demoCredentials) {
      setEmail(demoCredentials.email)
      setPassword(demoCredentials.password)
      setShowDemoForm(false)
      setDemoCredentials(null)
    }
  }

  const quickLogins = [
    { email: 'admin@attelia.com', role: 'Company Admin' },
    { email: 'john.doe@attelia.com', role: 'Employee' },
    { email: 'it.manager@attelia.com', role: 'IT Manager' },
    { email: 'finance@attelia.com', role: 'Finance Manager' },
  ]

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

      {/* Right Side - Login/Demo Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-8">
            {!showDemoForm ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-dental-blue text-white rounded-full mb-4">
                    <LogIn size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Hoş Geldiniz</h2>
                  <p className="text-gray-600 mt-2">Hesabınıza giriş yapın</p>
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

                {/* Demo Button */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowDemoForm(true)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition"
                  >
                    <Sparkles size={20} />
                    Demo Hesap Oluştur
                  </button>
                </div>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Test Hesapları (password123)</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {quickLogins.map((account) => (
                      <button
                        key={account.email}
                        onClick={() => {
                          setEmail(account.email)
                          setPassword('password123')
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
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setShowDemoForm(false)
                    setDemoCredentials(null)
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                  <ArrowLeft size={20} />
                  Geri Dön
                </button>

                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full mb-4">
                    <Sparkles size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Demo Hesap</h2>
                  <p className="text-gray-600 mt-2">Ücretsiz demo hesabınızı oluşturun</p>
                </div>

                {!demoCredentials ? (
                  <form onSubmit={handleDemoProvision} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Adresiniz
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          value={demoEmail}
                          onChange={(e) => setDemoEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="email@ornek.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Şirket Adı
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={demoCompanyName}
                          onChange={(e) => setDemoCompanyName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Şirketinizin adı"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-sm text-purple-900">
                        <strong>Demo hesap özellikleri:</strong>
                      </p>
                      <ul className="text-sm text-purple-800 mt-2 space-y-1 list-disc list-inside">
                        <li>Tam özellikli platform erişimi</li>
                        <li>Hazır örnek verilerle dolu</li>
                        <li>7 gün otomatik temizlenir</li>
                        <li>Kredi kartı gerektirmez</li>
                      </ul>
                    </div>

                    <button
                      type="submit"
                      disabled={demoLoading}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {demoLoading ? 'Oluşturuluyor...' : 'Demo Hesabı Oluştur'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-green-900">Demo Hesabınız Hazır!</h3>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-green-900 mb-1">Email</label>
                          <code className="block bg-white border border-green-200 rounded px-3 py-2 text-sm text-green-800">
                            {demoCredentials.email}
                          </code>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-green-900 mb-1">Şifre</label>
                          <code className="block bg-white border border-green-200 rounded px-3 py-2 text-sm text-green-800">
                            {demoCredentials.password}
                          </code>
                        </div>
                      </div>

                      <p className="text-xs text-green-700 mt-4">
                        ⚠️ Bu bilgileri kaydedin! Demo hesabınız 7 gün sonra otomatik olarak silinecektir.
                      </p>
                    </div>

                    <button
                      onClick={handleUseDemoCredentials}
                      className="w-full bg-dental-blue text-white py-3 rounded-lg font-semibold hover:bg-dental-dark transition"
                    >
                      Bu Bilgilerle Giriş Yap
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {!showDemoForm && (
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Test hesapları için şifre: <code className="bg-gray-200 px-2 py-1 rounded">password123</code></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
