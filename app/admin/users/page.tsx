'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { Plus, Edit, Trash2, Users, UserCheck, UserX } from 'lucide-react'

const mockUsers = [
  { id: 'u1', name: 'Ahmet Yıldırım', email: 'admin@attelia.com', role: 'COMPANY_ADMIN', department: 'Yönetim', status: 'active' },
  { id: 'u2', name: 'John Doe', email: 'john.doe@attelia.com', role: 'EMPLOYEE', department: 'Bilgi İşlem', status: 'active' },
  { id: 'u3', name: 'Jane Smith', email: 'jane.smith@attelia.com', role: 'DEPARTMENT_MANAGER', department: 'İnsan Kaynakları', status: 'active' },
  { id: 'u4', name: 'Mehmet Kaya', email: 'finance@attelia.com', role: 'FINANCE_MANAGER', department: 'Muhasebe', status: 'active' },
  { id: 'u5', name: 'Ayşe Demir', email: 'general@attelia.com', role: 'GENERAL_MANAGER', department: 'Yönetim', status: 'active' },
]

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'EMPLOYEE',
    department: '',
    password: '',
    status: 'active',
  })

  const openCreateModal = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      role: 'EMPLOYEE',
      department: '',
      password: '',
      status: 'active',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (user: any) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      password: '',
      status: user.status,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.role) {
      error('Lütfen tüm gerekli alanları doldurun')
      return
    }
    if (!editingUser && !formData.password) {
      error('Yeni kullanıcı için şifre gereklidir')
      return
    }
    if (editingUser) {
      success('Kullanıcı güncellendi!')
    } else {
      success('Kullanıcı eklendi!')
    }
    setIsModalOpen(false)
  }

  const handleDelete = (user: any) => {
    if (confirm(`${user.name} kullanıcısını silmek istediğinize emin misiniz?`)) {
      success('Kullanıcı silindi!')
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
      sortable: true,
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{mockUsers.length}</p>
                <p className="text-sm text-gray-600">Toplam Kullanıcı</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="text-green-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {mockUsers.filter((u) => u.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600">Aktif Kullanıcı</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <UserX className="text-gray-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {mockUsers.filter((u) => u.status !== 'active').length}
                </p>
                <p className="text-sm text-gray-600">Pasif Kullanıcı</p>
              </div>
            </div>
          </div>
        </div>

        <DataTable data={mockUsers} columns={columns} searchable searchPlaceholder="Kullanıcı ara..." />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Departman</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
