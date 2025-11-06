'use client'

import { useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export default function RequestDetailPage() {
  const params = useParams()
  const id = params.id

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/requests"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Talep Detayı</h1>
            <p className="text-gray-600 mt-1">Talep ID: {id}</p>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Talep bulunamadı</h3>
          <p className="text-gray-600 mb-6">
            Aradığınız talep bulunamadı veya erişim yetkiniz yok.
          </p>
          <Link
            href="/requests"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Taleplere Dön
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
