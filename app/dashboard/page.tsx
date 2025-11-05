'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import Loading from '@/components/Loading'
import { purchaseRequestsApi, reportsApi } from '@/lib/api'
import { useNotification } from '@/contexts/NotificationContext'
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  DollarSign,
} from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Taslak',
  SUBMITTED: 'Gönderildi',
  IN_REVIEW: 'İncelemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  COMPLETED: 'Tamamlandı',
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function DashboardPage() {
  const { error: showError } = useNotification()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [recentRequests, setRecentRequests] = useState<any[]>([])
  const [budgetData, setBudgetData] = useState<any>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const [summaryResponse, requestsResponse, budgetResponse] = await Promise.all([
        reportsApi.purchaseSummary().catch(e => ({ success: false, error: e.message })),
        purchaseRequestsApi.getAll({ limit: 5 }).catch(e => ({ success: false, error: e.message })),
        reportsApi.budget().catch(e => ({ success: false, error: e.message }))
      ])

      if (summaryResponse.success) {
        setStats(summaryResponse.data)
      }

      if (requestsResponse.success) {
        const requests = requestsResponse.data?.requests || requestsResponse.data || []
        setRecentRequests(Array.isArray(requests) ? requests : [])
      }

      if (budgetResponse.success) {
        setBudgetData(budgetResponse.data)
      }
    } catch (err: any) {
      console.error('Dashboard data fetch error:', err)
      showError(err.message || 'Veri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    )
  }

  const totalRequests = stats?.totalRequests || 0
  const pendingRequests = (stats?.statusBreakdown?.IN_REVIEW || 0) + (stats?.statusBreakdown?.SUBMITTED || 0)
  const approvedRequests = stats?.statusBreakdown?.APPROVED || 0
  const totalSpent = stats?.totalAmount || 0

  const budgetChartData = budgetData?.departments?.map((dept: any) => ({
    name: dept.departmentName || dept.name || 'Departman',
    budget: Number(dept.monthlyBudget || dept.budget || 0),
    spent: Number(dept.spent || 0),
    remaining: Number(dept.monthlyBudget || dept.budget || 0) - Number(dept.spent || 0),
  })) || []

  const statusDistribution = Object.entries(stats?.statusBreakdown || {})
    .map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count as number,
    }))
    .filter(item => item.value > 0)

  const columns = [
    {
      key: 'requestNumber',
      label: 'Talep No',
      sortable: true,
    },
    {
      key: 'title',
      label: 'Başlık',
      sortable: true,
    },
    {
      key: 'requester',
      label: 'Talep Eden',
      render: (value: any, row: any) => (
        <div>
          <div className="font-medium">{row.requester?.name || value?.name || 'N/A'}</div>
          <div className="text-xs text-gray-500">
            {row.department?.name || row.requester?.department?.name || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      key: 'estimatedTotal',
      label: 'Tutar',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold">
          {Number(value || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Durum',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || statusColors.DRAFT}`}>
          {statusLabels[value] || value}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Tarih',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('tr-TR'),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Satın alma yönetimi özeti ve istatistikler</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Talepler"
            value={totalRequests}
            subtitle="Tüm zamanlar"
            icon={ShoppingCart}
            color="blue"
            trend={stats?.trend?.requests}
          />
          <StatCard
            title="Bekleyen Onaylar"
            value={pendingRequests}
            subtitle="İşlem bekliyor"
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Onaylanan"
            value={approvedRequests}
            subtitle="Bu ay"
            icon={CheckCircle}
            color="green"
            trend={stats?.trend?.approved}
          />
          <StatCard
            title="Toplam Harcama"
            value={Number(totalSpent).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            subtitle="Onaylanan talepler"
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {(budgetChartData.length > 0 || statusDistribution.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {budgetChartData.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Departman Bütçe Kullanımı</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) =>
                        value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                      }
                    />
                    <Bar dataKey="spent" fill="#3B82F6" name="Harcanan" />
                    <Bar dataKey="remaining" fill="#E5E7EB" name="Kalan" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {statusDistribution.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Talep Durumu Dağılımı</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {budgetData?.warnings && budgetData.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900">Bütçe Uyarısı</h4>
              {budgetData.warnings.map((warning: string, index: number) => (
                <p key={index} className="text-sm text-yellow-800 mt-1">{warning}</p>
              ))}
            </div>
          </div>
        )}

        {recentRequests.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Son Talepler</h3>
              <Link
                href="/requests"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Tümünü Gör →
              </Link>
            </div>
            <DataTable
              data={recentRequests}
              columns={columns}
              onRowClick={(row) => (window.location.href = `/requests/${row.id}`)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/requests/new"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 flex items-center gap-4 transition-colors"
          >
            <ShoppingCart size={32} />
            <div>
              <h4 className="font-semibold text-lg">Yeni Talep Oluştur</h4>
              <p className="text-sm text-blue-100">Satın alma talebi başlat</p>
            </div>
          </Link>
          <Link
            href="/requests?status=IN_REVIEW"
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-lg p-6 flex items-center gap-4 transition-colors"
          >
            <Clock size={32} className="text-yellow-600" />
            <div>
              <h4 className="font-semibold text-lg text-gray-900">Bekleyen Onaylar</h4>
              <p className="text-sm text-gray-600">{pendingRequests} talep bekliyor</p>
            </div>
          </Link>
          <Link
            href="/reports"
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-lg p-6 flex items-center gap-4 transition-colors"
          >
            <DollarSign size={32} className="text-green-600" />
            <div>
              <h4 className="font-semibold text-lg text-gray-900">Bütçe Raporları</h4>
              <p className="text-sm text-gray-600">Detaylı analiz görüntüle</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
