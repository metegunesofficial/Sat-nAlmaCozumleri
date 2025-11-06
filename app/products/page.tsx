'use client'

import { useState, useEffect, useCallback } from 'react'
import ProductCard from '@/components/ProductCard'
import { Filter, Grid, List, ChevronDown } from 'lucide-react'
import { Product } from '@/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('createdAt')
  const [filterOpen, setFilterOpen] = useState(false)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products?sort=${sortBy}&order=desc&limit=20`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('Error fetching products')
    } finally {
      setLoading(false)
    }
  }, [sortBy])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

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
                      <label key={category} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-semibold mb-3">Fiyat Aralığı</h4>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      className="w-full"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h4 className="font-semibold mb-3">Markalar</h4>
                  <div className="space-y-2">
                    {['Oral-B', 'Colgate', 'Sensodyne', 'Listerine'].map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Stock Status */}
                <div>
                  <h4 className="font-semibold mb-3">Stok Durumu</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Stokta Var</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Tükendi</span>
                    </label>
                  </div>
                </div>

                <button className="w-full bg-dental-blue text-white py-2 rounded-lg hover:bg-dental-dark">
                  Filtreleri Uygula
                </button>
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
            {!loading && products.length > 0 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex gap-2">
                  <button className="px-4 py-2 border rounded hover:bg-gray-50">
                    Önceki
                  </button>
                  <button className="px-4 py-2 bg-dental-blue text-white rounded">
                    1
                  </button>
                  <button className="px-4 py-2 border rounded hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-4 py-2 border rounded hover:bg-gray-50">
                    3
                  </button>
                  <button className="px-4 py-2 border rounded hover:bg-gray-50">
                    Sonraki
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
