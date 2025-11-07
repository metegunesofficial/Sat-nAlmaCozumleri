'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Building2,
  Users,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  CreditCard,
  Shield,
  Edit,
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { findCompanyById, getUsersByCompanyId } from '@/lib/seedData'

export default function CompanyDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
    }
  }, [user, router])

  if (!user || user.role !== 'SUPER_ADMIN') {
    return null
  }

  const company = findCompanyById(companyId)
  const companyUsers = getUsersByCompanyId(companyId)

  if (!company) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Şirket Bulunamadı</h2>
          <p className="text-gray-600 mb-4">Aradığınız şirket sistemde bulunmuyor.</p>
          <Link
            href="/super-admin/companies"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Şirketlere Dön
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const planColors = {
    starter: 'bg-blue-100 text-blue-800',
    professional: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-yellow-100 text-yellow-800'
  }

  const planPrices = {
    starter: 99,
    professional: 299,
    enterprise: 999
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/super-admin/companies"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-gray-600 mt-1">Şirket Detayları</p>
            </div>
          </div>
          <Link
            href={`/super-admin/companies/${company.id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <Edit size={20} />
            Düzenle
          </Link>
        </div>

        {/* Company Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Temel Bilgiler</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="text-gray-400 mt-1" size={20} />
                  <div>
                    <div className="text-sm text-gray-600">Şirket Adı</div>
                    <div className="font-medium text-gray-900">{company.name}</div>
                  </div>
                </div>

                {company.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="text-gray-400 mt-1" size={20} />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium text-gray-900">{company.email}</div>
                    </div>
                  </div>
                )}

                {company.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="text-gray-400 mt-1" size={20} />
                    <div>
                      <div className="text-sm text-gray-600">Telefon</div>
                      <div className="font-medium text-gray-900">{company.phone}</div>
                    </div>
                  </div>
                )}

                {company.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="text-gray-400 mt-1" size={20} />
                    <div>
                      <div className="text-sm text-gray-600">Website</div>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}

                {company.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="text-gray-400 mt-1" size={20} />
                    <div>
                      <div className="text-sm text-gray-600">Adres</div>
                      <div className="font-medium text-gray-900">
                        {company.address}
                        {company.city && `, ${company.city}`}
                      </div>
                    </div>
                  </div>
                )}

                {company.taxNumber && (
                  <div className="flex items-start gap-3">
                    <Shield className="text-gray-400 mt-1" size={20} />
                    <div>
                      <div className="text-sm text-gray-600">Vergi No</div>
                      <div className="font-medium text-gray-900">{company.taxNumber}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Kullanıcılar ({companyUsers.length})
              </h2>
              <div className="space-y-3">
                {companyUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{u.name}</div>
                        <div className="text-sm text-gray-600">{u.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{u.position}</div>
                      <div className="text-xs text-gray-600">{u.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Durum</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Hesap Durumu</div>
                  {company.isActive ? (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle size={20} />
                      Aktif
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 font-medium">
                      <XCircle size={20} />
                      Pasif
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Oluşturulma Tarihi</div>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar size={16} className="text-gray-400" />
                    {new Date(company.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Son Güncelleme</div>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar size={16} className="text-gray-400" />
                    {new Date(company.updatedAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Abonelik</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Plan</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${planColors[company.settings.subscriptionPlan || 'starter']}`}>
                    {company.settings.subscriptionPlan?.toUpperCase() || 'STARTER'}
                  </span>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Aylık Ücret</div>
                  <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <CreditCard size={20} className="text-gray-400" />
                    ${planPrices[company.settings.subscriptionPlan || 'starter']}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Kullanıcı Limiti</div>
                  <div className="text-gray-900 font-medium">
                    {companyUsers.length} / {company.settings.maxUsers || '∞'}
                  </div>
                </div>

                {company.settings.features && company.settings.features.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Özellikler</div>
                    <div className="space-y-1">
                      {company.settings.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle size={14} className="text-green-600" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Branding Card */}
            {company.settings.primaryColor && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Branding</h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Primary Color</div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border border-gray-300"
                        style={{ backgroundColor: company.settings.primaryColor }}
                      />
                      <span className="text-sm font-mono text-gray-900">
                        {company.settings.primaryColor}
                      </span>
                    </div>
                  </div>
                  {company.settings.secondaryColor && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Secondary Color</div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: company.settings.secondaryColor }}
                        />
                        <span className="text-sm font-mono text-gray-900">
                          {company.settings.secondaryColor}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
