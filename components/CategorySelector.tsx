'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  children?: Category[]
}

interface CategorySelectorProps {
  value?: string // Selected category ID
  onChange: (categoryId: string) => void
  label?: string
  required?: boolean
  className?: string
}

export default function CategorySelector({
  value,
  onChange,
  label = 'Kategori',
  required = false,
  className = '',
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedParent, setSelectedParent] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>(value || '')

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/categories?includeProducts=false')
        const data = await response.json()

        if (data.success) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Update selectedParent when value changes (for edit mode)
  useEffect(() => {
    if (value && categories.length > 0) {
      // Find the category
      const findCategoryParent = (catId: string): string => {
        // Check if it's a root category
        const rootCat = categories.find((c) => c.id === catId)
        if (rootCat) {
          return ''
        }

        // Check if it's a child category
        for (const parent of categories) {
          if (parent.children) {
            const child = parent.children.find((c) => c.id === catId)
            if (child) {
              return parent.id
            }
          }
        }

        return ''
      }

      const parentId = findCategoryParent(value)
      setSelectedParent(parentId)
      setSelectedCategory(value)
    }
  }, [value, categories])

  // Get subcategories for selected parent
  const getSubcategories = (): Category[] => {
    if (!selectedParent) return []

    const parent = categories.find((c) => c.id === selectedParent)
    return parent?.children || []
  }

  const handleParentChange = (parentId: string) => {
    setSelectedParent(parentId)
    setSelectedCategory('')

    // If parent has no children, select the parent itself
    const parent = categories.find((c) => c.id === parentId)
    if (!parent?.children || parent.children.length === 0) {
      onChange(parentId)
    } else {
      // Reset selection since parent changed
      onChange('')
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    onChange(categoryId)
  }

  const subcategories = getSubcategories()
  const hasSubcategories = subcategories.length > 0

  if (loading) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-400">
          Yükleniyor...
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="space-y-3">
        {/* Parent Category Selector */}
        <div className="relative">
          <select
            value={selectedParent}
            onChange={(e) => handleParentChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            <option value="">Ana Kategori Seçin</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
                {category.children && category.children.length > 0 &&
                  ` (${category.children.length} alt kategori)`
                }
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={20}
          />
        </div>

        {/* Subcategory Selector - Only show if parent has children */}
        {selectedParent && hasSubcategories && (
          <div className="relative pl-4 border-l-2 border-gray-200">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Alt Kategori {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">Alt Kategori Seçin</option>
              {subcategories.map((subCategory) => (
                <option key={subCategory.id} value={subCategory.id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 bottom-2 text-gray-400 pointer-events-none"
              size={20}
            />
          </div>
        )}
      </div>

      {/* Helper text */}
      {selectedParent && !hasSubcategories && (
        <p className="text-xs text-gray-500 mt-2">
          Bu kategorinin alt kategorisi bulunmuyor
        </p>
      )}
    </div>
  )
}
