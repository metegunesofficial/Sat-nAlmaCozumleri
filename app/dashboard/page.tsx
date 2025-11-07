'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'
import { mockPurchaseRequests, mockBudgetData } from '@/lib/mockData'
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Code,
  Database,
  Settings,
  Terminal,
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

// Developer Dashboard Component
function DeveloperDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Developer Dashboard</h1>
          <p className="text-gray-600 mt-1">API, Sistem Durumu ve Geliştirici Araçları</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="API İstekleri"
            value="12,458"
            subtitle="Son 24 saat"
            icon={Code}
            color="blue"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Sistem Uptime"
            value="99.9%"
            subtitle="Bu ay"
            icon={Terminal}
            color="green"
          />
          <StatCard
            title="Veritabanı"
            value="2.4 GB"
            subtitle="Kullanılan alan"
            icon={Database}
            color="purple"
            trend={{ value: 5, isPositive: false }}
          />
          <StatCard
            title="Aktif Servisler"
            value="8"
            subtitle="Çalışıyor"
            icon={Settings}
            color="yellow"
          />
        </div>

        {/* Developer Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Code className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">API Dokümantasyonu</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">REST API endpoint&apos;leri ve kullanım örnekleri</p>
            <Link href="/api-docs" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Dokümana Git →
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Database className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Veritabanı Yönetimi</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Schema görüntüleme ve query çalıştırma</p>
            <Link href="/db-admin" className="text-green-600 hover:text-green-700 text-sm font-medium">
              Yöneticiye Git →
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Terminal className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Log Görüntüleyici</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Sistem logları ve hata takibi</p>
            <Link href="/logs" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              Loglara Git →
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Settings className="text-yellow-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Sistem Ayarları</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Uygulama konfigürasyonu ve ortam değişkenleri</p>
            <Link href="/settings" className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
              Ayarlara Git →
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Hata İzleme</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Exception&apos;lar ve hata raporları</p>
            <Link href="/errors" className="text-red-600 hover:text-red-700 text-sm font-medium">
              Hatalara Git →
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <TrendingUp className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Performans Metrikleri</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Response time, CPU ve memory kullanımı</p>
            <Link href="/metrics" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Metriklere Git →
            </Link>
          </div>
        </div>

        {/* Recent API Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Son API Aktiviteleri</h3>
          <div className="space-y-3">
            {[
              { method: 'GET', endpoint: '/api/purchase-requests', status: 200, time: '45ms', timestamp: '2 dakika önce' },
              { method: 'POST', endpoint: '/api/auth/login', status: 200, time: '120ms', timestamp: '5 dakika önce' },
              { method: 'PUT', endpoint: '/api/budgets/123', status: 200, time: '85ms', timestamp: '8 dakika önce' },
              { method: 'GET', endpoint: '/api/users', status: 200, time: '32ms', timestamp: '12 dakika önce' },
              { method: 'POST', endpoint: '/api/purchase-requests', status: 201, time: '156ms', timestamp: '15 dakika önce' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-mono font-semibold ${
                    activity.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                    activity.method === 'POST' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {activity.method}
                  </span>
                  <span className="font-mono text-sm text-gray-700">{activity.endpoint}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                  <span className="text-xs font-mono text-gray-600">{activity.time}</span>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistem Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Node.js Version</p>
              <p className="font-mono font-semibold text-gray-900">v20.11.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Next.js Version</p>
              <p className="font-mono font-semibold text-gray-900">14.1.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Database</p>
              <p className="font-mono font-semibold text-gray-900">PostgreSQL 15.3</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Normal User Dashboard Component
function NormalDashboard() {
  const totalRequests = mockPurchaseRequests.length
  const pendingRequests = mockPurchaseRequests.filter((r) => r.status === 'IN_REVIEW').length
  const approvedRequests = mockPurchaseRequests.filter((r) => r.status === 'APPROVED').length
  const totalSpent = mockPurchaseRequests
    .filter((r) => r.status === 'APPROVED' || r.status === 'COMPLETED')
    .reduce((sum, r) => sum + r.estimatedTotal, 0)

  const recentRequests = mockPurchaseRequests.slice(0, 5)

  // Budget utilization chart data
  const budgetChartData = mockBudgetData.departments.map((dept) => ({
    name: dept.name,
    budget: dept.budget,
    spent: dept.spent,
    remaining: dept.budget - dept.spent,
  }))

  // Status distribution pie chart data
  const statusDistribution = Object.entries(
    mockPurchaseRequests.reduce((acc, req) => {
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

// Main Dashboard Page Component
export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Redirect Super Admin to super-admin dashboard
  if (user?.role === 'SUPER_ADMIN') {
    router.push('/super-admin/dashboard')
    return null
  }

  // Show developer dashboard for DEVELOPER role
  if (user?.role === 'DEVELOPER') {
    return <DeveloperDashboard />
  }

  // Show normal dashboard for all other users
  return <NormalDashboard />
}
