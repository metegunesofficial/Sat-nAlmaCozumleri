'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Plus,
  Edit,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { getAllCompanies, getCompanyStats, type Company } from '@/lib/seedData'

export default function CompaniesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlan, setFilterPlan] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
    }
  }, [user, router])

  if (!user || user.role !== 'SUPER_ADMIN') {
    return null
  }

  const allCompanies = getAllCompanies()

  // Filter companies
  const filteredCompanies = allCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.city?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPlan = filterPlan === 'all' || company.settings.subscriptionPlan === filterPlan
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && company.isActive) ||
                         (filterStatus === 'inactive' && !company.isActive)

    return matchesSearch && matchesPlan && matchesStatus
  })

  const planColors = {
    starter: 'bg-blue-100 text-blue-800 border-blue-200',
    professional: 'bg-purple-100 text-purple-800 border-purple-200',
    enterprise: 'bg-yellow-100 text-yellow-800 border-yellow-200'
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Şirket Yönetimi</h1>
            <p className="text-gray-600 mt-1">Tüm şirketleri görüntüle ve yönet</p>
          </div>
          <Link
            href="/super-admin/companies/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <Plus size={20} />
            Yeni Şirket Ekle
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Toplam Şirket</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{allCompanies.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Aktif Şirket</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {allCompanies.filter(c => c.isActive).length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Toplam Kullanıcı</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {allCompanies.reduce((sum, c) => sum + getCompanyStats(c.id).totalUsers, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Aylık Gelir (MRR)</div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              ${allCompanies.reduce((sum, c) => sum + planPrices[c.settings.subscriptionPlan || 'starter'], 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Şirket ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Plan Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="all">Tüm Planlar</option>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => {
            const stats = getCompanyStats(company.id)

            return (
              <div
                key={company.id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{company.name}</h3>
                        <p className="text-sm text-gray-500">{company.city || 'Şehir belirtilmemiş'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Plan Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${planColors[company.settings.subscriptionPlan || 'starter']}`}>
                      {company.settings.subscriptionPlan?.toUpperCase() || 'STARTER'}
                    </span>
                    {company.isActive ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle size={14} />
                        Aktif
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-600">
                        <XCircle size={14} />
                        Pasif
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-600">Kullanıcılar</div>
                      <div className="text-lg font-bold text-gray-900">
                        {stats.totalUsers} / {company.settings.maxUsers || '∞'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Aylık Ücret</div>
                      <div className="text-lg font-bold text-gray-900">
                        ${planPrices[company.settings.subscriptionPlan || 'starter']}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 mb-1">İletişim</div>
                  <div className="text-sm text-gray-900">{company.email || 'Email yok'}</div>
                  <div className="text-sm text-gray-900">{company.phone || 'Telefon yok'}</div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
                  <Link
                    href={`/super-admin/companies/${company.id}`}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    Detay
                  </Link>
                  <Link
                    href={`/super-admin/companies/${company.id}/edit`}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Düzenle
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredCompanies.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Şirket Bulunamadı</h3>
            <p className="text-gray-600 mb-4">Arama kriterlerinize uygun şirket bulunamadı.</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterPlan('all')
                setFilterStatus('all')
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
