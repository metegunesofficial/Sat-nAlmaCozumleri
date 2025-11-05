'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import PurchaseRequestTable from '@/components/PurchaseRequestTable'
import { Plus, Filter, Download } from 'lucide-react'
import Link from 'next/link'

export default function RequestsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    inReview: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  })
  const [loading, setLoading] = useState(true)

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('/api/purchase-requests', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const requests = data.data
            setStats({
              total: requests.length,
              submitted: requests.filter((r: any) => r.status === 'SUBMITTED').length,
              inReview: requests.filter((r: any) => r.status === 'IN_REVIEW').length,
              approved: requests.filter((r: any) => r.status === 'APPROVED').length,
              rejected: requests.filter((r: any) => r.status === 'REJECTED').length,
              completed: requests.filter((r: any) => r.status === 'COMPLETED').length,
            })
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [statusFilter])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Satın Alma Talepleri</h1>
            <p className="text-gray-600 mt-1">Tüm satın alma taleplerini görüntüle ve yönet</p>
          </div>
          <Link
            href="/requests/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Yeni Talep Oluştur
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <Filter size={20} className="text-gray-500" />
            <div className="flex gap-4 flex-1">
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durum Filtresi
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Tüm Durumlar</option>
                  <option value="DRAFT">Taslak</option>
                  <option value="SUBMITTED">Gönderildi</option>
                  <option value="IN_REVIEW">İncelemede</option>
                  <option value="APPROVED">Onaylandı</option>
                  <option value="REJECTED">Reddedildi</option>
                  <option value="COMPLETED">Tamamlandı</option>
                </select>
              </div>
            </div>
            <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={18} />
              <span className="font-medium">Dışa Aktar</span>
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">
              {loading ? '...' : stats.total}
            </div>
            <div className="text-sm text-gray-600">Toplam</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {loading ? '...' : stats.submitted}
            </div>
            <div className="text-sm text-gray-600">Gönderildi</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? '...' : stats.inReview}
            </div>
            <div className="text-sm text-gray-600">İncelemede</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {loading ? '...' : stats.approved}
            </div>
            <div className="text-sm text-gray-600">Onaylandı</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">
              {loading ? '...' : stats.rejected}
            </div>
            <div className="text-sm text-gray-600">Reddedildi</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-purple-600">
              {loading ? '...' : stats.completed}
            </div>
            <div className="text-sm text-gray-600">Tamamlandı</div>
          </div>
        </div>

        {/* Table */}
        <PurchaseRequestTable statusFilter={statusFilter} />
      </div>
    </DashboardLayout>
  )
}
