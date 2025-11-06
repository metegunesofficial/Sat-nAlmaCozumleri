'use client'

import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  DollarSign,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const totalRequests = 0
  const pendingRequests = 0
  const approvedRequests = 0
  const totalSpent = 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Satın alma yönetimi özeti ve istatistikler</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Talepler"
            value={totalRequests}
            subtitle="Tüm zamanlar"
            icon={ShoppingCart}
            color="blue"
          />
          <StatCard
            title="Bekleyen Onaylar"
            value={pendingRequests}
            subtitle="İşlem bekliyor"
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Onaylanan"
            value={approvedRequests}
            subtitle="Bu ay"
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Toplam Harcama"
            value={totalSpent.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            subtitle="Onaylanan talepler"
            icon={DollarSign}
            color="purple"
          />
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz veri yok</h3>
          <p className="text-gray-600 mb-6">
            Sistemde henüz satın alma talebi bulunmuyor. İlk talebi oluşturarak başlayın.
          </p>
          <Link
            href="/requests/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ShoppingCart size={20} />
            Yeni Talep Oluştur
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/requests/new"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 flex items-center gap-4 transition-colors"
          >
            <ShoppingCart size={32} />
            <div>
              <h4 className="font-semibold text-lg">Yeni Talep Oluştur</h4>
              <p className="text-sm text-blue-100">Satın alma talebi başlat</p>
            </div>
          </Link>
          <Link
            href="/requests"
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-lg p-6 flex items-center gap-4 transition-colors"
          >
            <Clock size={32} className="text-yellow-600" />
            <div>
              <h4 className="font-semibold text-lg text-gray-900">Taleplerim</h4>
              <p className="text-sm text-gray-600">Tüm talepleri görüntüle</p>
            </div>
          </Link>
          <Link
            href="/reports"
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-lg p-6 flex items-center gap-4 transition-colors"
          >
            <DollarSign size={32} className="text-green-600" />
            <div>
              <h4 className="font-semibold text-lg text-gray-900">Bütçe Raporları</h4>
              <p className="text-sm text-gray-600">Detaylı analiz görüntüle</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
