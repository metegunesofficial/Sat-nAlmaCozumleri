'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import { TrendingUp, DollarSign, AlertTriangle, Download, Calendar, Package, Users, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<any>(null)
  const [budget, setBudget] = useState<any>(null)
  const [trends, setTrends] = useState<any>(null)
  const [departments, setDepartments] = useState<any>(null)
  const [period, setPeriod] = useState('monthly')

  useEffect(() => {
    fetchReports()
  }, [period])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const [overviewRes, budgetRes, trendsRes, deptRes] = await Promise.all([
        fetch('/api/reports/overview'),
        fetch(`/api/reports/budget?period=${period}`),
        fetch(`/api/reports/spending-trends?period=${period}`),
        fetch('/api/reports/department-spending'),
      ])

      const [overviewData, budgetData, trendsData, deptData] = await Promise.all([
        overviewRes.json(),
        budgetRes.json(),
        trendsRes.json(),
        deptRes.json(),
      ])

      if (overviewData.success) setOverview(overviewData.data)
      if (budgetData.success) setBudget(budgetData.data)
      if (trendsData.success) setTrends(trendsData.data)
      if (deptData.success) setDepartments(deptData.data)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format: string) => {
    alert(`Rapor ${format.toUpperCase()} formatında dışa aktarılıyor...`)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Raporlar yükleniyor...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bütçe ve Harcama Raporları</h1>
            <p className="text-gray-600 mt-1">Detaylı analiz ve istatistikler</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              Excel
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p === 'daily' && 'Günlük'}
              {p === 'weekly' && 'Haftalık'}
              {p === 'monthly' && 'Aylık'}
              {p === 'yearly' && 'Yıllık'}
            </button>
          ))}
        </div>

        {/* Summary Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Toplam Talepler"
              value={overview.summary.totalRequests}
              icon={<Package className="text-blue-600" />}
              trend={{
                value: overview.summary.pendingRequests,
                label: 'Beklemede',
              }}
            />
            <StatCard
              title="Onaylanan"
              value={overview.summary.approvedRequests}
              icon={<TrendingUp className="text-green-600" />}
              trend={{
                value: overview.summary.rejectedRequests,
                label: 'Reddedilen',
              }}
            />
            <StatCard
              title="Toplam Harcama"
              value={`₺${overview.summary.totalSpending.toLocaleString('tr-TR')}`}
              icon={<DollarSign className="text-purple-600" />}
              trend={{
                value: `₺${overview.summary.averageRequestValue}`,
                label: 'Ort. Talep Değeri',
              }}
            />
            {budget && (
              <StatCard
                title="Bütçe Kullanımı"
                value={`${budget.summary.usagePercent}%`}
                icon={<AlertTriangle className="text-orange-600" />}
                trend={{
                  value: budget.summary.categoriesExceeded,
                  label: 'Aşan Kategori',
                }}
              />
            )}
          </div>
        )}

        {/* Spending Trends Chart */}
        {trends && trends.trends.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Harcama Trendi</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`₺${value.toLocaleString('tr-TR')}`, '']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Toplam"
                />
                <Line
                  type="monotone"
                  dataKey="approved"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Onaylanan"
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Bekleyen"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-600">Ortalama / Dönem</div>
                <div className="text-lg font-semibold text-gray-900">
                  ₺{trends.summary.avgPerPeriod.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Büyüme Oranı</div>
                <div className={`text-lg font-semibold ${parseFloat(trends.summary.growthRate) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.summary.growthRate}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Toplam Talep</div>
                <div className="text-lg font-semibold text-gray-900">{trends.summary.totalRequests}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Status */}
          {budget && budget.categories.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Bütçe Durumu (Kategori)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budget.categories.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoryName" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [`₺${value.toLocaleString('tr-TR')}`, '']}
                  />
                  <Legend />
                  <Bar dataKey="spent" fill="#EF4444" name="Harcanan" />
                  <Bar dataKey="remaining" fill="#10B981" name="Kalan" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Department Spending */}
          {departments && departments.departments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Departman Bazlı Harcama</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departments.departments.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.departmentName}: ${entry.percentageShare}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalSpending"
                  >
                    {departments.departments.slice(0, 6).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`₺${value.toLocaleString('tr-TR')}`, 'Harcama']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Request Status Distribution */}
        {overview && overview.breakdown.byStatus.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Talep Durumu Dağılımı</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={overview.breakdown.byStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" name="Talep Sayısı" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Products Table */}
        {overview && overview.topProducts.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">En Çok Talep Edilen Ürünler</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Talep Sayısı</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Toplam Miktar</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Toplam Değer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {overview.topProducts.slice(0, 10).map((product: any) => (
                    <tr key={product.productId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                        <div className="text-xs text-gray-500">{product.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">{product.requestCount}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">{product.totalQuantity}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        ₺{product.totalValue.toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Department Rankings */}
        {departments && departments.departments.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Departman Sıralaması</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sıra</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departman</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Talep Sayısı</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Toplam Harcama</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pay (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {departments.departments.slice(0, 10).map((dept: any) => (
                    <tr key={dept.departmentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{dept.rank}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{dept.departmentName}</div>
                        <div className="text-xs text-gray-500">{dept.departmentCode}</div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">{dept.requestCount}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        ₺{dept.totalSpending.toLocaleString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">{dept.percentageShare}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
