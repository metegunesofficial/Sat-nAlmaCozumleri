'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import Modal from '@/components/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { Plus, Edit, Trash2, ChevronRight, GitBranch } from 'lucide-react'

interface Category {
  id: string
  name: string
  parentId: string | null
  productCount: number
  monthlyLimit: number
  requiresApproval: boolean
  minApprovalAmount?: number
}

const initialCategories: Category[] = [
  { id: '1', name: 'Bilgi İşlem', parentId: null, productCount: 45, monthlyLimit: 100000, requiresApproval: true },
  { id: '2', name: 'Bilgisayarlar', parentId: '1', productCount: 25, monthlyLimit: 50000, requiresApproval: true },
  { id: '3', name: 'Yazıcılar', parentId: '1', productCount: 12, monthlyLimit: 20000, requiresApproval: false },
  { id: '4', name: 'Ofis Malzemeleri', parentId: null, productCount: 78, monthlyLimit: 15000, requiresApproval: false },
  { id: '5', name: 'Kırtasiye', parentId: '4', productCount: 45, monthlyLimit: 5000, requiresApproval: false },
  { id: '6', name: 'Mobilya', parentId: null, productCount: 23, monthlyLimit: 75000, requiresApproval: true },
]

// Recursive Category Item Component
function CategoryItem({
  category,
  categories,
  onEdit,
  onDelete,
  onAddChild,
  level = 0,
}: {
  category: Category
  categories: Category[]
  onEdit: (cat: Category) => void
  onDelete: (cat: Category) => void
  onAddChild: (parentId: string) => void
  level?: number
}) {
  const children = categories.filter((c) => c.parentId === category.id)
  const indentClass = level > 0 ? `ml-${level * 8}` : ''

  return (
    <div className={`${level > 0 ? 'ml-8' : ''}`}>
      <div className={`p-4 ${level === 0 ? 'bg-gray-50' : 'bg-white border-l-2 border-blue-200'} flex items-center justify-between rounded-lg mb-2`}>
        <div className="flex items-center gap-3 flex-1">
          <GitBranch className={level === 0 ? 'text-blue-600' : 'text-gray-400'} size={20} />
          <div className="flex-1">
            <h3 className={`${level === 0 ? 'font-semibold' : 'font-medium'} text-gray-900`}>
              {category.name}
            </h3>
            <div className="flex gap-4 mt-1 text-sm text-gray-600">
              <span>{category.productCount} ürün</span>
              <span>
                Limit:{' '}
                {category.monthlyLimit.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                })}
                /ay
              </span>
              {category.requiresApproval && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                  Onay Gerekli
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAddChild(category.id)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            title="Alt kategori ekle"
          >
            <Plus size={16} />
            Alt Kategori
          </button>
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {children.length > 0 && (
        <div className="space-y-2 mt-2">
          {children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              categories={categories}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CategoriesPage() {
  const { success, error } = useNotification()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    monthlyLimit: '',
    requiresApproval: false,
    minApprovalAmount: '',
  })

  const openCreateModal = (parentCategoryId?: string) => {
    setEditingCategory(null)
    setFormData({
      name: '',
      parentId: parentCategoryId || '',
      monthlyLimit: '',
      requiresApproval: false,
      minApprovalAmount: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      parentId: category.parentId || '',
      monthlyLimit: category.monthlyLimit?.toString() || '',
      requiresApproval: category.requiresApproval,
      minApprovalAmount: category.minApprovalAmount?.toString() || '',
    })
    setIsModalOpen(true)
  }

  // Get category name by ID
  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || ''
  }

  // Get selectable parent categories (exclude self and descendants)
  const getSelectableParents = () => {
    if (!editingCategory) return categories

    const getDescendants = (catId: string): string[] => {
      const children = categories.filter(c => c.parentId === catId)
      return [catId, ...children.flatMap(c => getDescendants(c.id))]
    }

    const excludeIds = getDescendants(editingCategory.id)
    return categories.filter(c => !excludeIds.includes(c.id))
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      error('Kategori adı gereklidir')
      return
    }

    if (editingCategory) {
      // Update existing category
      setCategories(categories.map(cat =>
        cat.id === editingCategory.id
          ? {
              ...cat,
              name: formData.name,
              parentId: formData.parentId || null,
              monthlyLimit: formData.monthlyLimit ? parseFloat(formData.monthlyLimit) : 0,
              requiresApproval: formData.requiresApproval,
              minApprovalAmount: formData.minApprovalAmount ? parseFloat(formData.minApprovalAmount) : undefined
            }
          : cat
      ))
      success('Kategori güncellendi!')
    } else {
      // Add new category
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
        parentId: formData.parentId || null,
        productCount: 0,
        monthlyLimit: formData.monthlyLimit ? parseFloat(formData.monthlyLimit) : 0,
        requiresApproval: formData.requiresApproval,
        minApprovalAmount: formData.minApprovalAmount ? parseFloat(formData.minApprovalAmount) : undefined
      }
      setCategories([...categories, newCategory])
      success('Kategori eklendi!')
    }
    setIsModalOpen(false)
  }

  const handleDelete = (category: Category) => {
    // Check if category has children
    const hasChildren = categories.some(c => c.parentId === category.id)
    if (hasChildren) {
      error('Bu kategorinin alt kategorileri var. Önce alt kategorileri silin.')
      return
    }

    if (confirm(`${category.name} kategorisini silmek istediğinize emin misiniz?`)) {
      setCategories(categories.filter(c => c.id !== category.id))
      success('Kategori silindi!')
    }
  }

  // Recursive function to build category tree
  const getCategoryTree = (parentId: string | null = null): Category[] => {
    return categories.filter(c => c.parentId === parentId)
  }

  // Get all parent categories (root level)
  const rootCategories = getCategoryTree(null)

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
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(c => c.parentId !== null).length}
                </p>
                <p className="text-sm text-gray-600">Alt Kategori</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            {rootCategories.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Henüz kategori eklenmedi</p>
                <p className="text-sm mt-1">Yeni kategori ekle butonuna tıklayarak başlayın</p>
              </div>
            ) : (
              rootCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  categories={categories}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onAddChild={openCreateModal}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingCategory
            ? 'Kategori Düzenle'
            : formData.parentId
              ? `Alt Kategori Ekle (${rootCategories.find(c => c.id === formData.parentId)?.name})`
              : 'Yeni Ana Kategori Ekle'
        }
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
          {formData.parentId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Alt Kategori:</strong> Bu kategori{' '}
                <strong>{rootCategories.find(c => c.id === formData.parentId)?.name}</strong>{' '}
                kategorisinin altında oluşturulacak.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori Adı *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: Bilgi İşlem, Laptop, Yazıcı..."
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
              disabled={editingCategory !== null && formData.parentId !== ''}
            >
              <option value="">Ana Kategori (Üst kategori yok)</option>
              {getSelectableParents().map((cat) => {
                // Calculate depth for indentation
                let depth = 0
                let currentCat = cat
                while (currentCat.parentId) {
                  depth++
                  const parent = categories.find(c => c.id === currentCat.parentId)
                  if (!parent) break
                  currentCat = parent
                }
                const indent = '—'.repeat(depth) + (depth > 0 ? ' ' : '')

                return (
                  <option key={cat.id} value={cat.id}>
                    {indent}{cat.name}
                  </option>
                )
              })}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {editingCategory
                ? 'Kategoriyi farklı bir üst kategoriye taşıyabilirsiniz'
                : 'Alt kategori oluşturmak için üst kategoriyi seçin'}
            </p>
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
