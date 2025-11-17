'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
// TODO: Import removed - using empty state
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Download,
  Calendar,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

// TODO: Replace with real API calls
const mockBudgetData = {
  departments: [] as Array<{ name: string; budget: number; spent: number; remaining: number; utilization: number }>,
  company: {
    total: 0,
    spent: 0,
    reserved: 0,
  }
}

export default function ReportsPage() {
  const [period, setPeriod] = useState('monthly')
  const [department, setDepartment] = useState('all')

  // Budget utilization data
  const budgetData = mockBudgetData.departments.map((dept) => ({
    name: dept.name,
    budget: dept.budget,
    spent: dept.spent,
    remaining: dept.budget - dept.spent,
    utilization: dept.utilization,
  }))

  // Monthly spending trend (mock data)
  const monthlySpendingData = [
    { month: 'Oca', spending: 125000, budget: 200000 },
    { month: 'Şub', spending: 145000, budget: 200000 },
    { month: 'Mar', spending: 168000, budget: 200000 },
    { month: 'Nis', spending: 152000, budget: 200000 },
    { month: 'May', spending: 187000, budget: 200000 },
    { month: 'Haz', spending: 195000, budget: 200000 },
  ]

  // Category spending distribution
  const categorySpendingData = [
    { name: 'Bilgi İşlem', value: 145000 },
    { name: 'Ofis Malzemeleri', value: 45000 },
    { name: 'Mobilya', value: 85000 },
    { name: 'Yazılım Lisansları', value: 65000 },
    { name: 'Diğer', value: 35000 },
  ]

  // Department comparison
  const departmentComparisonData = mockBudgetData.departments.slice(0, 6).map((dept) => ({
    name: dept.name,
    harcama: dept.spent,
    bütçe: dept.budget,
  }))

  const totalBudget = mockBudgetData.company.total
  const totalSpent = mockBudgetData.company.spent
  const totalReserved = mockBudgetData.company.reserved
  const totalRemaining = totalBudget - totalSpent - totalReserved
  const utilizationPercentage = ((totalSpent + totalReserved) / totalBudget) * 100

  const handleExport = (format: string) => {
    alert(`Rapor ${format.toUpperCase()} formatında dışa aktarılıyor...`)
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

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dönem</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
                <option value="quarterly">Çeyreklik</option>
                <option value="yearly">Yıllık</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Departman</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Departmanlar</option>
                {mockBudgetData.departments.map((dept) => (
                  <option key={dept.name} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Bütçe"
            value={totalBudget.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            subtitle="Yıllık toplam"
            icon={DollarSign}
            color="blue"
          />
          <StatCard
            title="Toplam Harcama"
            value={totalSpent.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            subtitle={`%${((totalSpent / totalBudget) * 100).toFixed(1)} kullanıldı`}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Rezerve Edilen"
            value={totalReserved.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            subtitle="Bekleyen talepler"
            icon={Calendar}
            color="yellow"
          />
          <StatCard
            title="Kalan Bütçe"
            value={totalRemaining.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            subtitle={`%${((totalRemaining / totalBudget) * 100).toFixed(1)} kaldı`}
            icon={AlertTriangle}
            color={totalRemaining < totalBudget * 0.2 ? 'red' : 'purple'}
          />
        </div>

        {/* Budget Utilization Alert */}
        {utilizationPercentage > 80 && (
          <div
            className={`${
              utilizationPercentage > 90 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
            } border rounded-lg p-4 flex items-start gap-3`}
          >
            <AlertTriangle
              className={utilizationPercentage > 90 ? 'text-red-600' : 'text-yellow-600'}
              size={20}
            />
            <div className="flex-1">
              <h4 className={`font-semibold ${utilizationPercentage > 90 ? 'text-red-900' : 'text-yellow-900'}`}>
                Bütçe Uyarısı
              </h4>
              <p className={`text-sm mt-1 ${utilizationPercentage > 90 ? 'text-red-800' : 'text-yellow-800'}`}>
                Yıllık bütçenizin %{utilizationPercentage.toFixed(1)}&apos;i kullanıldı veya rezerve edildi.
                {utilizationPercentage > 90
                  ? ' Bütçe artırımı için yönetim ile görüşün.'
                  : ' Harcamalarınızı yakından takip edin.'}
              </p>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Spending Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Harcama Trendi</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlySpendingData}>
                <defs>
                  <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                  }
                />
                <Area
                  type="monotone"
                  dataKey="spending"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorSpending)"
                  name="Harcama"
                />
                <Line type="monotone" dataKey="budget" stroke="#EF4444" strokeDasharray="5 5" name="Bütçe" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Bazlı Dağılım</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categorySpendingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: %${(percent * 100).toFixed(0)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categorySpendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Department Budget Utilization */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Departman Bütçe Kullanımı
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                  }
                />
                <Legend />
                <Bar dataKey="spent" fill="#3B82F6" name="Harcanan" />
                <Bar dataKey="remaining" fill="#E5E7EB" name="Kalan" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Comparison */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Departman Karşılaştırması</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentComparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip
                  formatter={(value: number) =>
                    value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                  }
                />
                <Legend />
                <Bar dataKey="harcama" fill="#10B981" name="Harcama" />
                <Bar dataKey="bütçe" fill="#3B82F6" name="Bütçe" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Details Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Departman Detayları</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Departman
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Bütçe
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Harcanan
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Kalan
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Kullanım
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {budgetData.map((dept) => (
                  <tr key={dept.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {dept.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {dept.budget.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-blue-600">
                      {dept.spent.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                      {dept.remaining.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              dept.utilization > 90
                                ? 'bg-red-500'
                                : dept.utilization > 75
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(dept.utilization, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          %{dept.utilization.toFixed(0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          dept.utilization > 90
                            ? 'bg-red-100 text-red-800'
                            : dept.utilization > 75
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {dept.utilization > 90
                          ? 'Kritik'
                          : dept.utilization > 75
                          ? 'Dikkat'
                          : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
