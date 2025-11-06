'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { ShoppingCart, Plus } from 'lucide-react'
import Link from 'next/link'

export default function RequestsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Satın Alma Talepleri</h1>
            <p className="text-gray-600 mt-1">Tüm satın alma taleplerinizi görüntüleyin ve yönetin</p>
          </div>
          <Link
            href="/requests/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Yeni Talep
          </Link>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz talep yok</h3>
          <p className="text-gray-600 mb-6">
            Sistemde henüz satın alma talebi bulunmuyor. İlk talebi oluşturarak başlayın.
          </p>
          <Link
            href="/requests/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Yeni Talep Oluştur
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
