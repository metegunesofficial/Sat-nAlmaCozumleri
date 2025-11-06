'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import Modal from '@/components/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { Plus, Edit, Trash2, ChevronRight, GitBranch } from 'lucide-react'

export default function CategoriesPage() {
  const { success, error } = useNotification()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    description: '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const res = await fetch('/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      parentId: '',
      description: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      parentId: category.parentId || '',
      description: category.description || '',
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
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'

      const res = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          parentId: formData.parentId || null,
          description: formData.description || null,
        })
      })

      if (res.ok) {
        success(editingCategory ? 'Kategori güncellendi!' : 'Kategori eklendi!')
        setIsModalOpen(false)
        fetchCategories()
      } else {
        const data = await res.json()
        error(data.error || 'İşlem başarısız')
      }
    } catch (err) {
      error('Bir hata oluştu')
    }
  }

  const handleDelete = async (category: any) => {
    if (!confirm(`${category.name} kategorisini silmek istediğinize emin misiniz?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        success('Kategori silindi!')
        fetchCategories()
      } else {
        error('Silme işlemi başarısız')
      }
    } catch (err) {
      error('Bir hata oluştu')
    }
  }

  // Group categories by parent
  const rootCategories = categories.filter((c) => !c.parentId)
  const childCategories = categories.filter((c) => c.parentId)

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

        {categories.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <GitBranch size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz kategori yok</h3>
            <p className="text-gray-600 mb-4">
              Yeni kategori eklemek için yukarıdaki butonu kullanın
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Plus size={20} />
              İlk Kategoriyi Ekle
            </button>
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
                        {rootCat.description && (
                          <p className="text-sm text-gray-600 mt-1">{rootCat.description}</p>
                        )}
                        <div className="flex gap-4 mt-1 text-sm text-gray-600">
                          <span>{rootCat._count?.products || 0} ürün</span>
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
                              {child.description && (
                                <p className="text-sm text-gray-600 mt-1">{child.description}</p>
                              )}
                              <div className="flex gap-4 mt-1 text-sm text-gray-600">
                                <span>{child._count?.products || 0} ürün</span>
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
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kategori açıklaması (opsiyonel)"
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
