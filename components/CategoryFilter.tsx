'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  children?: Category[]
  _count?: {
    products: number
  }
}

interface CategoryFilterProps {
  selectedCategories: string[]
  onChange: (categoryIds: string[]) => void
}

export default function CategoryFilter({ selectedCategories, onChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/categories?includeProducts=true')
        const data = await response.json()

        if (data.success) {
          setCategories(data.data)
          // Auto-expand categories that have selected children
          const toExpand = new Set<string>()
          data.data.forEach((cat: Category) => {
            if (cat.children) {
              const hasSelectedChild = cat.children.some((child) =>
                selectedCategories.includes(child.id)
              )
              if (hasSelectedChild) {
                toExpand.add(cat.id)
              }
            }
          })
          setExpandedCategories(toExpand)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [selectedCategories])

  const toggleCategory = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId]

    onChange(newSelected)
  }

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  if (loading) {
    return (
      <div>
        <h4 className="font-semibold mb-3">Kategoriler</h4>
        <div className="text-sm text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div>
      <h4 className="font-semibold mb-3">Kategoriler</h4>
      <div className="space-y-2">
        {categories.map((category) => {
          const hasChildren = category.children && category.children.length > 0
          const isExpanded = expandedCategories.has(category.id)
          const productCount = category._count?.products || 0

          return (
            <div key={category.id}>
              {/* Parent Category */}
              <div className="flex items-center gap-2">
                {hasChildren && (
                  <button
                    onClick={() => toggleExpanded(category.id)}
                    className="p-0.5 hover:bg-gray-100 rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-gray-600" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-600" />
                    )}
                  </button>
                )}
                {!hasChildren && <div className="w-5" />}

                <label className="flex items-center gap-2 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm flex-1">{category.name}</span>
                  {productCount > 0 && (
                    <span className="text-xs text-gray-500">({productCount})</span>
                  )}
                </label>
              </div>

              {/* Child Categories */}
              {hasChildren && isExpanded && (
                <div className="ml-7 mt-2 space-y-2 border-l-2 border-gray-200 pl-3">
                  {category.children!.map((child) => {
                    const childProductCount = child._count?.products || 0

                    return (
                      <label
                        key={child.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(child.id)}
                          onChange={() => toggleCategory(child.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm flex-1">{child.name}</span>
                        {childProductCount > 0 && (
                          <span className="text-xs text-gray-500">({childProductCount})</span>
                        )}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedCategories.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="text-sm text-blue-600 hover:text-blue-700 mt-3"
        >
          Kategori filtrelerini temizle
        </button>
      )}
    </div>
  )
}
