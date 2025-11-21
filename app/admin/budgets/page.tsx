'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import {
  DollarSign,
  Building2,
  Users,
  User,
  Plus,
  Edit2,
  AlertTriangle,
  TrendingUp,
  PieChart
} from 'lucide-react'

interface Budget {
  id: string
  type: 'company' | 'department' | 'user'
  name: string
  totalBudget: number
  usedBudget: number
  reservedBudget: number
  remainingBudget: number
  period: string
  status: string
}

const mockBudgets: Budget[] = [
  {
    id: '1',
    type: 'company',
    name: 'Attelia Dental',
    totalBudget: 500000,
    usedBudget: 125000,
    reservedBudget: 45000,
    remainingBudget: 330000,
    period: '2024',
    status: 'active'
  },
  {
    id: '2',
    type: 'department',
    name: 'Bilgi İşlem',
    totalBudget: 150000,
    usedBudget: 85000,
    reservedBudget: 25000,
    remainingBudget: 40000,
    period: '2024',
    status: 'warning'
  },
  {
    id: '3',
    type: 'department',
    name: 'Satış & Pazarlama',
    totalBudget: 100000,
    usedBudget: 35000,
    reservedBudget: 10000,
    remainingBudget: 55000,
    period: '2024',
    status: 'active'
  },
  {
    id: '4',
    type: 'department',
    name: 'İnsan Kaynakları',
    totalBudget: 75000,
    usedBudget: 20000,
    reservedBudget: 5000,
    remainingBudget: 50000,
    period: '2024',
    status: 'active'
  },
  {
    id: '5',
    type: 'user',
    name: 'Ahmet Yılmaz',
    totalBudget: 25000,
    usedBudget: 12000,
    reservedBudget: 3000,
    remainingBudget: 10000,
    period: '2024',
    status: 'active'
  },
]

export default function BudgetsPage() {
  const { success, error } = useNotification()
  const [loading, setLoading] = useState(false)
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets)
  const [filter, setFilter] = useState<'all' | 'company' | 'department' | 'user'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'department',
    totalBudget: 0,
    period: '2024'
  })

  const filteredBudgets = filter === 'all'
    ? budgets
    : budgets.filter(b => b.type === filter)

  // Calculate totals
  const totalBudget = budgets.reduce((sum, b) => b.type === 'company' ? b.totalBudget : sum, 0)
  const totalUsed = budgets.reduce((sum, b) => b.type === 'company' ? b.usedBudget : sum, 0)
  const totalReserved = budgets.reduce((sum, b) => b.type === 'company' ? b.reservedBudget : sum, 0)
  const warningCount = budgets.filter(b => b.status === 'warning').length

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'company': return <Building2 size={16} className="text-blue-600" />
      case 'department': return <Users size={16} className="text-purple-600" />
      case 'user': return <User size={16} className="text-green-600" />
      default: return null
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'company': return 'Şirket'
      case 'department': return 'Departman'
      case 'user': return 'Kullanıcı'
      default: return type
    }
  }

  const getStatusColor = (budget: Budget) => {
    const usagePercent = ((budget.usedBudget + budget.reservedBudget) / budget.totalBudget) * 100
    if (usagePercent >= 90) return 'bg-red-100 text-red-800'
    if (usagePercent >= 75) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const columns = [
    {
      key: 'type',
      label: 'Tip',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(value)}
          <span className="text-sm">{getTypeLabel(value)}</span>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Ad',
      sortable: true,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'totalBudget',
      label: 'Toplam Bütçe',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold">
          {value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </span>
      ),
    },
    {
      key: 'usedBudget',
      label: 'Kullanılan',
      render: (value: number, row: Budget) => (
        <div>
          <span>{value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${(value / row.totalBudget) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'reservedBudget',
      label: 'Rezerve',
      render: (value: number) => (
        <span className="text-yellow-600">
          {value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </span>
      ),
    },
    {
      key: 'remainingBudget',
      label: 'Kalan',
      render: (value: number) => (
        <span className="text-green-600 font-medium">
          {value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Durum',
      render: (_: string, row: Budget) => {
        const usagePercent = ((row.usedBudget + row.reservedBudget) / row.totalBudget) * 100
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row)}`}>
            %{usagePercent.toFixed(0)} kullanıldı
          </span>
        )
      },
    },
  ]

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setFormData({
      name: budget.name,
      type: budget.type,
      totalBudget: budget.totalBudget,
      period: budget.period
    })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || formData.totalBudget <= 0) {
      error('Lütfen tüm alanları doldurun')
      return
    }

    if (editingBudget) {
      setBudgets(budgets.map(b =>
        b.id === editingBudget.id
          ? { ...b, ...formData, remainingBudget: formData.totalBudget - b.usedBudget - b.reservedBudget }
          : b
      ))
      success('Bütçe güncellendi')
    } else {
      const newBudget: Budget = {
        id: Math.random().toString(36).substr(2, 9),
        type: formData.type as any,
        name: formData.name,
        totalBudget: formData.totalBudget,
        usedBudget: 0,
        reservedBudget: 0,
        remainingBudget: formData.totalBudget,
        period: formData.period,
        status: 'active'
      }
      setBudgets([...budgets, newBudget])
      success('Bütçe oluşturuldu')
    }

    setIsModalOpen(false)
    setEditingBudget(null)
    setFormData({ name: '', type: 'department', totalBudget: 0, period: '2024' })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bütçe Yönetimi</h1>
            <p className="text-gray-600 mt-1">Şirket, departman ve kullanıcı bütçelerini yönetin</p>
          </div>
          <button
            onClick={() => {
              setEditingBudget(null)
              setFormData({ name: '', type: 'department', totalBudget: 0, period: '2024' })
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Yeni Bütçe
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Bütçe</p>
                <p className="text-lg font-bold">
                  {totalBudget.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Kullanılan</p>
                <p className="text-lg font-bold">
                  {totalUsed.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <PieChart className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rezerve</p>
                <p className="text-lg font-bold">
                  {totalReserved.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Uyarı</p>
                <p className="text-lg font-bold">{warningCount} bütçe</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Tümü' },
              { value: 'company', label: 'Şirket' },
              { value: 'department', label: 'Departman' },
              { value: 'user', label: 'Kullanıcı' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === item.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Budgets Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <DataTable
            data={filteredBudgets}
            columns={columns}
            searchable
            searchPlaceholder="Bütçe ara..."
            onRowClick={handleEdit}
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingBudget(null)
        }}
        title={editingBudget ? 'Bütçe Düzenle' : 'Yeni Bütçe'}
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {editingBudget ? 'Güncelle' : 'Oluştur'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bütçe Tipi
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!editingBudget}
            >
              <option value="department">Departman</option>
              <option value="user">Kullanıcı</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ad *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Bütçe adı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Toplam Bütçe (TL) *
            </label>
            <input
              type="number"
              value={formData.totalBudget}
              onChange={(e) => setFormData({ ...formData, totalBudget: parseFloat(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dönem
            </label>
            <select
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
