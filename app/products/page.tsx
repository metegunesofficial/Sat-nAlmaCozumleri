'use client'

import { useState, useEffect, useCallback } from 'react'
import ProductCard from '@/components/ProductCard'
import { Filter, Grid, List, ChevronDown, X } from 'lucide-react'
import { Product } from '@/types'

interface Filters {
  categories: string[]
  minPrice: string
  maxPrice: string
  brands: string[]
  inStock: boolean
  outOfStock: boolean
  search: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('createdAt')
  const [filterOpen, setFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [filters, setFilters] = useState<Filters>({
    categories: [],
    minPrice: '',
    maxPrice: '',
    brands: [],
    inStock: false,
    outOfStock: false,
    search: '',
  })

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)

      // Build query params
      const params = new URLSearchParams()
      params.append('sort', sortBy)
      params.append('order', 'desc')
      params.append('page', currentPage.toString())
      params.append('limit', '12')

      if (filters.search) {
        params.append('search', filters.search)
      }

      if (filters.minPrice || filters.maxPrice) {
        // Note: API needs to be updated to support price filtering
        // For now, we'll filter client-side
      }

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        let filteredProducts = data.data

        // Client-side filtering (until API supports these)
        if (filters.minPrice) {
          filteredProducts = filteredProducts.filter((p: Product) =>
            (p.discountPrice || p.price) >= parseFloat(filters.minPrice)
          )
        }
        if (filters.maxPrice) {
          filteredProducts = filteredProducts.filter((p: Product) =>
            (p.discountPrice || p.price) <= parseFloat(filters.maxPrice)
          )
        }
        if (filters.inStock && !filters.outOfStock) {
          filteredProducts = filteredProducts.filter((p: Product) => p.stock > 0)
        }
        if (filters.outOfStock && !filters.inStock) {
          filteredProducts = filteredProducts.filter((p: Product) => p.stock === 0)
        }

        setProducts(filteredProducts)
        setTotalPages(data.pagination?.totalPages || 1)
        setTotal(data.pagination?.total || filteredProducts.length)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [sortBy, currentPage, filters])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleArrayFilterToggle = (key: 'categories' | 'brands', value: string) => {
    setFilters(prev => {
      const array = prev[key]
      const newArray = array.includes(value)
        ? array.filter(item => item !== value)
        : [...array, value]
      return { ...prev, [key]: newArray }
    })
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      categories: [],
      minPrice: '',
      maxPrice: '',
      brands: [],
      inStock: false,
      outOfStock: false,
      search: '',
    })
    setCurrentPage(1)
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.inStock ||
    filters.outOfStock ||
    filters.search

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">Tüm Ürünler</h1>
          <p className="text-gray-600">
            Ağız ve diş sağlığı için ihtiyacınız olan tüm ürünler
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Filtreler</h3>
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="lg:hidden"
                >
                  <Filter size={20} />
                </button>
              </div>

              <div className={`space-y-6 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
                {/* Search */}
                <div>
                  <h4 className="font-semibold mb-3">Ara</h4>
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Categories */}
                <div>
                  <h4 className="font-semibold mb-3">Kategoriler</h4>
                  <div className="space-y-2">
                    {[
                      'Diş Fırçaları',
                      'Diş Macunları',
                      'Ağız Suları',
                      'Diş İplikleri',
                      'Protezler',
                      'İmplantlar',
                    ].map((category) => (
                      <label key={category} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          className="rounded text-blue-600"
                          checked={filters.categories.includes(category)}
                          onChange={() => handleArrayFilterToggle('categories', category)}
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-semibold mb-3">Fiyat Aralığı</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min ₺"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Max ₺"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h4 className="font-semibold mb-3">Markalar</h4>
                  <div className="space-y-2">
                    {['Oral-B', 'Colgate', 'Sensodyne', 'Listerine'].map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          className="rounded text-blue-600"
                          checked={filters.brands.includes(brand)}
                          onChange={() => handleArrayFilterToggle('brands', brand)}
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Stock Status */}
                <div>
                  <h4 className="font-semibold mb-3">Stok Durumu</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        className="rounded text-blue-600"
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      />
                      <span className="text-sm">Stokta Var</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        className="rounded text-blue-600"
                        checked={filters.outOfStock}
                        onChange={(e) => handleFilterChange('outOfStock', e.target.checked)}
                      />
                      <span className="text-sm">Tükendi</span>
                    </label>
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-gray-600">
                {loading ? 'Yükleniyor...' : `${products.length} ürün bulundu`}
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sırala:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-dental-blue"
                  >
                    <option value="createdAt">Yeniden Eskiye</option>
                    <option value="price">Fiyat (Düşük-Yüksek)</option>
                    <option value="name">İsim (A-Z)</option>
                    <option value="salesCount">En Çok Satan</option>
                  </select>
                </div>

                {/* View Mode */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${
                      viewMode === 'grid'
                        ? 'bg-dental-blue text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${
                      viewMode === 'list'
                        ? 'bg-dental-blue text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue"></div>
                <p className="mt-4 text-gray-600">Ürünler yükleniyor...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-600 mb-4">
                  Henüz ürün eklenmemiş.
                </p>
                <p className="text-sm text-gray-500">
                  Veritabanınıza ürün eklemek için admin panelini kullanın veya
                  seed scriptlerini çalıştırın.
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                    : 'space-y-4'
                }
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border"
                >
                  Önceki
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and 2 pages around current
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                    })
                    .map((page, index, array) => (
                      <>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span key={`ellipsis-${page}`} className="px-2 py-2">...</span>
                        )}
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border'
                          }`}
                        >
                          {page}
                        </button>
                      </>
                    ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border"
                >
                  Sonraki
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
