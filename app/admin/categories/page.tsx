'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Modal from '@/components/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { Plus, Edit, Trash2, ChevronRight, GitBranch } from 'lucide-react'

export default function CategoriesPage() {
  const router = useRouter()
  const { success, error } = useNotification()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    monthlyLimit: '',
    requiresApproval: false,
    minApprovalAmount: '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        error('Oturum süreniz dolmuş')
        router.push('/login')
        return
      }

      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setCategories(data.data || [])
      } else {
        error(data.error || 'Kategoriler yüklenemedi')
      }
    } catch (err) {
      console.error('Fetch categories error:', err)
      error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      parentId: '',
      monthlyLimit: '',
      requiresApproval: false,
      minApprovalAmount: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      parentId: category.parent || '',
      monthlyLimit: category.monthlyLimit?.toString() || '',
      requiresApproval: category.requiresApproval,
      minApprovalAmount: category.minApprovalAmount?.toString() || '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      error('Kategori adı gereklidir')
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        error('Oturum süreniz dolmuş')
        router.push('/login')
        return
      }

      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'

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
        success(editingCategory ? 'Kategori güncellendi!' : 'Kategori eklendi!')
        setIsModalOpen(false)
        fetchCategories()
      } else {
        error(data.error || 'İşlem başarısız')
      }
    } catch (err) {
      console.error('Submit error:', err)
      error('Bir hata oluştu')
    }
  }

  const handleDelete = async (category: any) => {
    if (!confirm(`${category.name} kategorisini silmek istediğinize emin misiniz?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        error('Oturum süreniz dolmuş')
        router.push('/login')
        return
      }

      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        success('Kategori silindi!')
        fetchCategories()
      } else {
        error(data.error || 'Silme işlemi başarısız')
      }
    } catch (err) {
      console.error('Delete error:', err)
      error('Bir hata oluştu')
    }
  }

  // Group categories by parent
  const rootCategories = categories.filter((c) => !c.parentId)
  const childCategories = categories.filter((c) => c.parentId)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kategori Yönetimi</h1>
            <p className="text-gray-600 mt-1">Hiyerarşik kategori yapısını yönet</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Yeni Kategori Ekle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <GitBranch className="text-blue-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                <p className="text-sm text-gray-600">Toplam Kategori</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <GitBranch className="text-green-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{rootCategories.length}</p>
                <p className="text-sm text-gray-600">Ana Kategori</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <GitBranch className="text-purple-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{childCategories.length}</p>
                <p className="text-sm text-gray-600">Alt Kategori</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Kategoriler yükleniyor...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 space-y-4">
              {rootCategories.map((rootCat) => {
                const children = childCategories.filter((c) => c.parentId === rootCat.id)
              return (
                <div key={rootCat.id} className="border border-gray-200 rounded-lg">
                  {/* Root Category */}
                  <div className="p-4 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <GitBranch className="text-blue-600" size={20} />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{rootCat.name}</h3>
                        <div className="flex gap-4 mt-1 text-sm text-gray-600">
                          <span>{rootCat.productCount} ürün</span>
                          <span>
                            Limit:{' '}
                            {rootCat.monthlyLimit.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                            })}
                            /ay
                          </span>
                          {rootCat.requiresApproval && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                              Onay Gerekli
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(rootCat)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(rootCat)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Child Categories */}
                  {children.length > 0 && (
                    <div className="p-4 space-y-2">
                      {children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg ml-8"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <ChevronRight className="text-gray-400" size={16} />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{child.name}</h4>
                              <div className="flex gap-4 mt-1 text-sm text-gray-600">
                                <span>{child.productCount} ürün</span>
                                {child.monthlyLimit && (
                                  <span>
                                    Limit:{' '}
                                    {child.monthlyLimit.toLocaleString('tr-TR', {
                                      style: 'currency',
                                      currency: 'TRY',
                                    })}
                                    /ay
                                  </span>
                                )}
                                {child.requiresApproval && (
                                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                    Onay Gerekli
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(child)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(child)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
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
              {editingCategory ? 'Güncelle' : 'Ekle'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori Adı *
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
              Üst Kategori
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Ana Kategori</option>
              {rootCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aylık Limit (TL)
            </label>
            <input
              type="number"
              value={formData.monthlyLimit}
              onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requiresApproval"
              checked={formData.requiresApproval}
              onChange={(e) =>
                setFormData({ ...formData, requiresApproval: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="requiresApproval" className="text-sm font-medium text-gray-700">
              Bu kategorideki talepler için onay gerekli
            </label>
          </div>

          {formData.requiresApproval && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Onay Tutarı (TL)
              </label>
              <input
                type="number"
                value={formData.minApprovalAmount}
                onChange={(e) =>
                  setFormData({ ...formData, minApprovalAmount: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  )
}
