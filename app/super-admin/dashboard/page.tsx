'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Crown,
  Package
} from 'lucide-react'
import Link from 'next/link'
import { getAllCompanies, users, getCompanyStats } from '@/lib/seedData'

export default function SuperAdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only SUPER_ADMIN can access this page
    if (user && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
    }
  }, [user, router])

  if (!user || user.role !== 'SUPER_ADMIN') {
    return null
  }

  const allCompanies = getAllCompanies()
  const activeCompanies = allCompanies.filter(c => c.isActive)
  const totalUsers = users.filter(u => u.role !== 'SUPER_ADMIN').length
  const totalRevenue = allCompanies.reduce((sum, company) => {
    const plans = { starter: 99, professional: 299, enterprise: 999 }
    return sum + (plans[company.settings.subscriptionPlan || 'starter'] || 0)
  }, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="text-yellow-500" size={32} />
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            </div>
            <p className="text-gray-600">Platform Yönetim Paneli - Tüm Şirketler</p>
          </div>
          <Link
            href="/super-admin/companies/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <Building2 size={20} />
            Yeni Şirket Ekle
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Şirket"
            value={allCompanies.length}
            subtitle={`${activeCompanies.length} aktif`}
            icon={Building2}
            color="blue"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Toplam Kullanıcı"
            value={totalUsers}
            subtitle="Tüm şirketler"
            icon={Users}
            color="green"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Aylık Gelir"
            value={`$${totalRevenue.toLocaleString()}`}
            subtitle="MRR"
            icon={DollarSign}
            color="purple"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Aktif Abonelik"
            value={activeCompanies.length}
            subtitle="Devam eden"
            icon={TrendingUp}
            color="yellow"
          />
        </div>

        {/* Companies List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Şirketler</h2>
              <Link
                href="/super-admin/companies"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Tümünü Gör →
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Şirket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abonelik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcılar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Şehir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allCompanies.map((company) => {
                  const stats = getCompanyStats(company.id)
                  const planColors = {
                    starter: 'bg-blue-100 text-blue-800',
                    professional: 'bg-purple-100 text-purple-800',
                    enterprise: 'bg-yellow-100 text-yellow-800'
                  }

                  return (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="text-blue-600" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{company.name}</div>
                            <div className="text-sm text-gray-500">{company.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${planColors[company.settings.subscriptionPlan || 'starter']}`}>
                          {company.settings.subscriptionPlan || 'starter'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Users size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-900">{stats.totalUsers}</span>
                          <span className="text-xs text-gray-500">/ {company.settings.maxUsers || '∞'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.city || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {company.isActive ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            <CheckCircle size={14} className="mr-1" />
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            <XCircle size={14} className="mr-1" />
                            Pasif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/super-admin/companies/${company.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Detay
                        </Link>
                        <Link
                          href={`/super-admin/companies/${company.id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Düzenle
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900">Starter Plan</h3>
              <Package className="text-blue-600" size={24} />
            </div>
            <div className="text-3xl font-bold text-blue-900 mb-2">
              {allCompanies.filter(c => c.settings.subscriptionPlan === 'starter').length}
            </div>
            <p className="text-sm text-blue-700">$99/ay - Max 20 kullanıcı</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-900">Professional Plan</h3>
              <Package className="text-purple-600" size={24} />
            </div>
            <div className="text-3xl font-bold text-purple-900 mb-2">
              {allCompanies.filter(c => c.settings.subscriptionPlan === 'professional').length}
            </div>
            <p className="text-sm text-purple-700">$299/ay - Max 50 kullanıcı</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-900">Enterprise Plan</h3>
              <Crown className="text-yellow-600" size={24} />
            </div>
            <div className="text-3xl font-bold text-yellow-900 mb-2">
              {allCompanies.filter(c => c.settings.subscriptionPlan === 'enterprise').length}
            </div>
            <p className="text-sm text-yellow-700">$999/ay - Sınırsız kullanıcı</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
