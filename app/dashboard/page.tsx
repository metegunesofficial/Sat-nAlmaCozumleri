'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
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
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Taslak',
  IN_REVIEW: 'İncelemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  COMPLETED: 'Tamamlandı',
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function DashboardPage() {
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([])
  const [budgetData, setBudgetData] = useState<{
    departments: Array<{ name: string; budget: number; spent: number; utilization: number }>
  }>({ departments: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')

        // Fetch purchase requests
        const requestsRes = await fetch('/api/purchase-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json()
          if (requestsData.success) {
            setPurchaseRequests(requestsData.data)
          }
        }

        // Fetch budget data
        const budgetRes = await fetch('/api/reports/budget', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (budgetRes.ok) {
          const budgetDataRes = await budgetRes.json()
          if (budgetDataRes.success) {
            setBudgetData(budgetDataRes.data)
          }
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalRequests = purchaseRequests.length
  const pendingRequests = purchaseRequests.filter((r) => r.status === 'IN_REVIEW').length
  const approvedRequests = purchaseRequests.filter((r) => r.status === 'APPROVED').length
  const totalSpent = purchaseRequests
    .filter((r) => r.status === 'APPROVED' || r.status === 'COMPLETED')
    .reduce((sum, r) => sum + r.estimatedTotal, 0)

  const recentRequests = purchaseRequests.slice(0, 5)

  // Budget utilization chart data
  const budgetChartData = budgetData.departments.map((dept) => ({
    name: dept.name,
    budget: dept.budget,
    spent: dept.spent,
    remaining: dept.budget - dept.spent,
  }))

  // Status distribution pie chart data
  const statusDistribution = Object.entries(
    purchaseRequests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({
    name: statusLabels[status] || status,
    value: count,
  }))

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
      render: (value: any) => (
        <div>
          <div className="font-medium">{value.name}</div>
          <div className="text-xs text-gray-500">{value.department}</div>
        </div>
      ),
    },
    {
      key: 'estimatedTotal',
      label: 'Tutar',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold">
          {value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Durum',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value]}`}>
          {statusLabels[value]}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Tarih',
      sortable: true,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Satın alma yönetimi özeti ve istatistikler</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Talepler"
            value={totalRequests}
            subtitle="Tüm zamanlar"
            icon={ShoppingCart}
            color="blue"
            trend={{ value: 12, isPositive: true }}
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
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Toplam Harcama"
            value={totalSpent.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            subtitle="Onaylanan talepler"
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Utilization Chart */}
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

          {/* Status Distribution Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Talep Durumu Dağılımı</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
        </div>

        {/* Budget Alert */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-900">Bütçe Uyarısı</h4>
            <p className="text-sm text-yellow-800 mt-1">
              Bilgi İşlem departmanı bütçesinin %90&apos;ı kullanıldı. Yeni talepler için bütçe artırımı gerekebilir.
            </p>
          </div>
        </div>

        {/* Recent Requests */}
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
            onRowClick={(row) => console.log('Clicked:', row)}
          />
        </div>

        {/* Quick Actions */}
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
            href="/requests/pending"
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
