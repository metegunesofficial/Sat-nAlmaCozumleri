'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Search,
  FileText,
  ShoppingCart,
  Package,
  User,
  Building,
  Clock
} from 'lucide-react'

interface SearchResult {
  id: string
  type: 'request' | 'order' | 'product' | 'user' | 'supplier'
  title: string
  subtitle: string
  link: string
  date?: string
}

// Mock search results
const mockResults: SearchResult[] = [
  { id: '1', type: 'request', title: 'PR-2024-0015', subtitle: 'Bilgisayar Ekipmanları Talebi', link: '/requests/1', date: '2024-01-15' },
  { id: '2', type: 'request', title: 'PR-2024-0014', subtitle: 'Ofis Malzemeleri', link: '/requests/2', date: '2024-01-14' },
  { id: '3', type: 'order', title: 'ORD-2024-0010', subtitle: 'Tedarikçi: ABC Ltd.', link: '/orders/1', date: '2024-01-13' },
  { id: '4', type: 'product', title: 'Laptop Dell XPS 15', subtitle: 'SKU: DELL-XPS-15', link: '/products/dell-xps-15' },
  { id: '5', type: 'product', title: 'Ergonomik Ofis Sandalyesi', subtitle: 'SKU: CHAIR-ERG-01', link: '/products/chair-erg-01' },
  { id: '6', type: 'user', title: 'Ahmet Yılmaz', subtitle: 'Bilgi İşlem Departmanı', link: '/admin/users' },
  { id: '7', type: 'supplier', title: 'ABC Teknoloji Ltd.', subtitle: 'Bilişim Tedarikçisi', link: '/suppliers' },
]

const typeIcons: Record<string, any> = {
  request: FileText,
  order: ShoppingCart,
  product: Package,
  user: User,
  supplier: Building,
}

const typeLabels: Record<string, string> = {
  request: 'Talep',
  order: 'Sipariş',
  product: 'Ürün',
  user: 'Kullanıcı',
  supplier: 'Tedarikçi',
}

const typeColors: Record<string, string> = {
  request: 'bg-blue-100 text-blue-600',
  order: 'bg-green-100 text-green-600',
  product: 'bg-purple-100 text-purple-600',
  user: 'bg-orange-100 text-orange-600',
  supplier: 'bg-gray-100 text-gray-600',
}

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setSearching(true)
    setSearched(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const filtered = mockResults.filter(result => {
      const matchesQuery = result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle.toLowerCase().includes(query.toLowerCase())
      const matchesFilter = filter === 'all' || result.type === filter
      return matchesQuery && matchesFilter
    })

    setResults(filtered)
    setSearching(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Global Arama</h1>
          <p className="text-gray-600 mt-2">Talepler, siparişler, ürünler ve daha fazlasını arayın</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Arama yapın..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {searching ? 'Aranıyor...' : 'Ara'}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {['all', 'request', 'order', 'product', 'user', 'supplier'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'Tümü' : typeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="bg-white rounded-lg border border-gray-200">
            {searching ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-gray-600 mt-4">Sonuç bulunamadı</p>
                <p className="text-sm text-gray-500 mt-1">Farklı anahtar kelimeler deneyin</p>
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <span className="text-sm text-gray-600">{results.length} sonuç bulundu</span>
                </div>
                <div className="divide-y divide-gray-200">
                  {results.map((result) => {
                    const Icon = typeIcons[result.type]
                    return (
                      <button
                        key={result.id}
                        onClick={() => router.push(result.link)}
                        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 text-left transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${typeColors[result.type]}`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{result.title}</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {typeLabels[result.type]}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                        </div>
                        {result.date && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={12} />
                            {new Date(result.date).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Quick Links */}
        {!searched && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => { setFilter('request'); setQuery(''); }}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors text-center"
            >
              <FileText className="mx-auto text-blue-600 mb-2" size={24} />
              <span className="text-sm font-medium">Talepler</span>
            </button>
            <button
              onClick={() => { setFilter('order'); setQuery(''); }}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors text-center"
            >
              <ShoppingCart className="mx-auto text-green-600 mb-2" size={24} />
              <span className="text-sm font-medium">Siparişler</span>
            </button>
            <button
              onClick={() => { setFilter('product'); setQuery(''); }}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors text-center"
            >
              <Package className="mx-auto text-purple-600 mb-2" size={24} />
              <span className="text-sm font-medium">Ürünler</span>
            </button>
            <button
              onClick={() => { setFilter('supplier'); setQuery(''); }}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors text-center"
            >
              <Building className="mx-auto text-gray-600 mb-2" size={24} />
              <span className="text-sm font-medium">Tedarikçiler</span>
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
