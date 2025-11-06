'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { Plus, Edit, Trash2, Users, UserCheck, UserX } from 'lucide-react'

const roles = [
  { value: 'SUPER_ADMIN', label: 'Süper Admin' },
  { value: 'COMPANY_ADMIN', label: 'Şirket Yöneticisi' },
  { value: 'GENERAL_MANAGER', label: 'Genel Müdür' },
  { value: 'FINANCE_MANAGER', label: 'Finans Müdürü' },
  { value: 'PROCUREMENT_MANAGER', label: 'Satın Alma Müdürü' },
  { value: 'DEPARTMENT_MANAGER', label: 'Departman Müdürü' },
  { value: 'EMPLOYEE', label: 'Çalışan' },
]

export default function UsersPage() {
  const { success, error } = useNotification()
  const [users, setUsers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'EMPLOYEE',
    departmentId: '',
    phone: '',
    password: '',
  })

  useEffect(() => {
    fetchUsers()
    fetchDepartments()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const res = await fetch('/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setDepartments(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching departments:', err)
    }
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      role: 'EMPLOYEE',
      departmentId: '',
      phone: '',
      password: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (user: any) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId || '',
      phone: user.phone || '',
      password: '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      error('Lütfen tüm gerekli alanları doldurun')
      return
    }
    if (!editingUser && !formData.password) {
      error('Yeni kullanıcı için şifre gereklidir')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'

      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        departmentId: formData.departmentId || null,
        phone: formData.phone || null,
      }

      if (formData.password) {
        payload.password = formData.password
      }

      const res = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        success(editingUser ? 'Kullanıcı güncellendi!' : 'Kullanıcı eklendi!')
        setIsModalOpen(false)
        fetchUsers()
      } else {
        const data = await res.json()
        error(data.error || 'İşlem başarısız')
      }
    } catch (err) {
      error('Bir hata oluştu')
    }
  }

  const handleDelete = async (user: any) => {
    if (!confirm(`${user.name} kullanıcısını silmek istediğinize emin misiniz?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        success('Kullanıcı silindi!')
        fetchUsers()
      } else {
        error('Silme işlemi başarısız')
      }
    } catch (err) {
      error('Bir hata oluştu')
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Ad Soyad',
      sortable: true,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'email',
      label: 'E-posta',
      sortable: true,
      render: (value: string) => <span className="text-gray-600">{value}</span>,
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
      render: (value: string) => {
        const role = roles.find((r) => r.value === value)
        return <span className="text-sm font-medium text-gray-900">{role?.label || value}</span>
      },
    },
    {
      key: 'department',
      label: 'Departman',
      sortable: false,
      render: (value: any) => value?.name || '-',
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
            <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
            <p className="text-gray-600 mt-1">Kullanıcı hesaplarını ve rollerini yönet</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Yeni Kullanıcı Ekle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-sm text-gray-600">Toplam Kullanıcı</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="text-green-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-sm text-gray-600">Aktif Kullanıcı</p>
              </div>
            </div>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz kullanıcı yok</h3>
            <p className="text-gray-600 mb-4">
              Yeni kullanıcı eklemek için yukarıdaki butonu kullanın
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Plus size={20} />
              İlk Kullanıcıyı Ekle
            </button>
          </div>
        ) : (
          <DataTable data={users} columns={columns} searchable searchPlaceholder="Kullanıcı ara..." />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
        size="lg"
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
              {editingUser ? 'Güncelle' : 'Ekle'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0555 123 4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Departman</label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Departman seçin (opsiyonel)</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre {editingUser ? '(Boş bırakılırsa değişmez)' : '*'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? 'Yeni şifre' : 'Şifre'}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
