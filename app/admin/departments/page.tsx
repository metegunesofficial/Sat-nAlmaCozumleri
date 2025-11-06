'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { Plus, Edit, Trash2, Building2, TrendingUp } from 'lucide-react'

export default function DepartmentsPage() {
  const { success, error } = useNotification()
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    budget: '',
    status: 'active',
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const res = await fetch('/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setDepartments(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching departments:', err)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingDept(null)
    setFormData({ name: '', code: '', budget: '', status: 'active' })
    setIsModalOpen(true)
  }

  const openEditModal = (dept: any) => {
    setEditingDept(dept)
    setFormData({
      name: dept.name,
      code: dept.code,
      budget: dept.budget.toString(),
      status: dept.isActive ? 'active' : 'inactive',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.code || !formData.budget) {
      error('Lütfen tüm gerekli alanları doldurun')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const url = editingDept ? `/api/departments/${editingDept.id}` : '/api/departments'

      const res = await fetch(url, {
        method: editingDept ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          budget: parseFloat(formData.budget),
          isActive: formData.status === 'active'
        })
      })

      if (res.ok) {
        success(editingDept ? 'Departman güncellendi!' : 'Departman eklendi!')
        setIsModalOpen(false)
        fetchDepartments()
      } else {
        const data = await res.json()
        error(data.error || 'İşlem başarısız')
      }
    } catch (err) {
      error('Bir hata oluştu')
    }
  }

  const handleDelete = async (dept: any) => {
    if (!confirm(`${dept.name} departmanını silmek istediğinize emin misiniz?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/departments/${dept.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        success('Departman silindi!')
        fetchDepartments()
      } else {
        error('Silme işlemi başarısız')
      }
    } catch (err) {
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
      key: '_count',
      label: 'Çalışan Sayısı',
      sortable: false,
      render: (value: any) => (
        <span className="inline-flex items-center justify-center w-10 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
          {value?.users || 0}
        </span>
      ),
    },
    {
      key: 'budget',
      label: 'Yıllık Bütçe',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold">
          {value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Durum',
      render: (value: boolean) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Aktif' : 'Pasif'}
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

  const totalBudget = departments.reduce((sum, d) => sum + (d.budget || 0), 0)
  const totalEmployees = departments.reduce((sum, d) => sum + (d._count?.users || 0), 0)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Departman Yönetimi</h1>
            <p className="text-gray-600 mt-1">Departmanları ve bütçeleri yönet</p>
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
                  {totalBudget.toLocaleString('tr-TR')} TL
                </p>
                <p className="text-sm text-gray-600">Toplam Bütçe</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Building2 className="text-purple-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
                <p className="text-sm text-gray-600">Toplam Çalışan</p>
              </div>
            </div>
          </div>
        </div>

        {departments.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz departman yok</h3>
            <p className="text-gray-600 mb-4">
              Yeni departman eklemek için yukarıdaki butonu kullanın
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Plus size={20} />
              İlk Departmanı Ekle
            </button>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departman Adı *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departman Kodu *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="Örn: IT, HR, SALES"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yıllık Bütçe (TL) *
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
