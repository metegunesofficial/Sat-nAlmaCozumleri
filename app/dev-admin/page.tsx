'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Stats {
  overview: {
    totalCompanies: number
    activeCompanies: number
    demoCompanies: number
    totalUsers: number
    totalDepartments: number
    totalPurchaseRequests: number
    totalProducts: number
    totalCategories: number
    totalSuppliers: number
  }
  purchaseRequests: {
    byStatus: Record<string, number>
  }
  topCompanies: Array<{
    id: string
    name: string
    slug: string
    isActive: boolean
    isDemo: boolean
    userCount: number
    requestCount: number
    productCount: number
  }>
  growth: {
    recentSignups: number
  }
  recentActivity: Array<{
    id: string
    action: string
    resource: string | null
    createdAt: string
    company: { name: string; slug: string } | null
    actorUser: { name: string; email: string } | null
  }>
}

export default function DevAdminOverviewPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading system statistics...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Failed to load system statistics
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">System Overview</h2>
        <p className="mt-1 text-gray-600">Real-time statistics across all tenants</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Companies"
          value={stats.overview.totalCompanies}
          subtitle={`${stats.overview.activeCompanies} active`}
          icon="🏢"
          color="blue"
        />
        <StatCard
          title="Total Users"
          value={stats.overview.totalUsers}
          subtitle="Across all companies"
          icon="👥"
          color="green"
        />
        <StatCard
          title="Purchase Requests"
          value={stats.overview.totalPurchaseRequests}
          subtitle="All time"
          icon="📝"
          color="purple"
        />
        <StatCard
          title="Recent Signups"
          value={stats.growth.recentSignups}
          subtitle="Last 30 days"
          icon="📈"
          color="orange"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Products"
          value={stats.overview.totalProducts}
          icon="📦"
          color="indigo"
        />
        <StatCard
          title="Suppliers"
          value={stats.overview.totalSuppliers}
          icon="🏭"
          color="pink"
        />
        <StatCard
          title="Demo Companies"
          value={stats.overview.demoCompanies}
          icon="🧪"
          color="yellow"
        />
      </div>

      {/* Top Companies */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Companies by Activity</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Users</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Requests</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Products</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.topCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{company.name}</div>
                      <div className="text-sm text-gray-500">{company.slug}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${company.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {company.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {company.isDemo && (
                        <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                          Demo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">{company.userCount}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">{company.requestCount}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">{company.productCount}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/dev-admin/companies?id=${company.id}`)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {stats.recentActivity.map((log) => (
            <div key={log.id} className="flex items-start gap-3 text-sm">
              <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-red-500"></div>
              <div className="flex-1">
                <div className="text-gray-900">
                  <span className="font-medium">{log.actorUser?.name || 'System'}</span>
                  {' performed '}
                  <span className="font-mono text-red-600">{log.action}</span>
                  {log.resource && (
                    <>
                      {' on '}
                      <span className="font-mono text-gray-700">{log.resource}</span>
                    </>
                  )}
                </div>
                <div className="text-gray-500 text-xs mt-0.5">
                  {log.company?.name && `${log.company.name} • `}
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string
  value: number
  subtitle?: string
  icon: string
  color: string
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    pink: 'bg-pink-50 text-pink-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`text-4xl ${colorClasses[color]} rounded-lg p-3`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
