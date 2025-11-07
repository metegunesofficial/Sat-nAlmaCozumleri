'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { Plus, Edit, Trash2, Building2, TrendingUp } from 'lucide-react'

export default function DepartmentsPage() {
  const router = useRouter()
  const { success, error } = useNotification()
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    monthlyBudget: '',
    yearlyBudget: '',
    status: 'active',
  })

  useEffect(() => {
    fetchDepartments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        error('Oturum süreniz dolmuş')
        router.push('/login')
        return
      }

      const response = await fetch('/api/departments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setDepartments(data.data || [])
      } else {
        error(data.error || 'Departmanlar yüklenemedi')
      }
    } catch (err) {
      console.error('Fetch departments error:', err)
      error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingDept(null)
    setFormData({ name: '', code: '', monthlyBudget: '', yearlyBudget: '', status: 'active' })
    setIsModalOpen(true)
  }

  const openEditModal = (dept: any) => {
    setEditingDept(dept)
    setFormData({
      name: dept.name,
      code: dept.code,
      monthlyBudget: dept.monthlyBudget?.toString() || '',
      yearlyBudget: dept.yearlyBudget?.toString() || '',
      status: dept.status,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      error('Lütfen tüm gerekli alanları doldurun')
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        error('Oturum süreniz dolmuş')
        router.push('/login')
        return
      }

      const url = editingDept ? `/api/departments/${editingDept.id}` : '/api/departments'
      const method = editingDept ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        success(editingDept ? 'Departman güncellendi!' : 'Departman eklendi!')
        setIsModalOpen(false)
        fetchDepartments()
      } else {
        error(data.error || 'İşlem başarısız')
      }
    } catch (err) {
      console.error('Submit error:', err)
      error('Bir hata oluştu')
    }
  }

  const handleDelete = async (dept: any) => {
    if (!confirm(`${dept.name} departmanını silmek istediğinize emin misiniz?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        error('Oturum süreniz dolmuş')
        router.push('/login')
        return
      }

      const response = await fetch(`/api/departments/${dept.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        success('Departman silindi!')
        fetchDepartments()
      } else {
        error(data.error || 'Silme işlemi başarısız')
      }
    } catch (err) {
      console.error('Delete error:', err)
      error('Bir hata oluştu')
    }
  }

  const columns = [
    {
      key: 'code',
      label: 'Kod',
      sortable: true,
      render: (value: string) => <span className="font-mono font-semibold">{value}</span>,
    },
    {
      key: 'name',
      label: 'Departman Adı',
      sortable: true,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'yearlyBudget',
      label: 'Yıllık Bütçe',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold">
          {value ? value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '-'}
        </span>
      ),
    },
    {
      key: 'monthlyBudget',
      label: 'Aylık Bütçe',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-sm">
          {value ? value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Durum',
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value === 'active' ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              openEditModal(row)
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(row)
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ]

  const totalYearlyBudget = departments.reduce((sum, d) => sum + (d.yearlyBudget || 0), 0)
  const totalMonthlyBudget = departments.reduce((sum, d) => sum + (d.monthlyBudget || 0), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Departman Yönetimi</h1>
            <p className="text-gray-600 mt-1">Departman ve bütçe yönetimi</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Yeni Departman Ekle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Building2 className="text-blue-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                <p className="text-sm text-gray-600">Toplam Departman</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-green-600" size={24} />
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {totalYearlyBudget.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
                <p className="text-sm text-gray-600">Toplam Yıllık Bütçe</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-purple-600" size={24} />
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {totalMonthlyBudget.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
                <p className="text-sm text-gray-600">Toplam Aylık Bütçe</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Departmanlar yükleniyor...</p>
          </div>
        ) : (
          <DataTable data={departments} columns={columns} searchable searchPlaceholder="Departman ara..." />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Departman Düzenle' : 'Yeni Departman Ekle'}
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {editingDept ? 'Güncelle' : 'Ekle'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departman Adı *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departman Kodu *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aylık Bütçe</label>
              <input
                type="number"
                value={formData.monthlyBudget}
                onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Yıllık Bütçe</label>
              <input
                type="number"
                value={formData.yearlyBudget}
                onChange={(e) => setFormData({ ...formData, yearlyBudget: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
