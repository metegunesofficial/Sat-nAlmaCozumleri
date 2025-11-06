'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import { mockPurchaseRequests } from '@/lib/mockData'
import { Plus, Filter, Download, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/contexts/NotificationContext'

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Taslak',
  IN_REVIEW: 'İncelemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  COMPLETED: 'Tamamlandı',
}

export default function RequestsPage() {
  const router = useRouter()
  const { success, error } = useNotification()
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [dateFilter, setDateFilter] = useState<string>('ALL')
  const [customDateRange, setCustomDateRange] = useState<{start: string, end: string}>({start: '', end: ''})
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)

  // Helper function to calculate date ranges
  const getDateRange = (filterType: string) => {
    const now = new Date()
    const start = new Date()

    switch (filterType) {
      case 'TODAY':
        start.setHours(0, 0, 0, 0)
        return { start, end: now }
      case 'WEEK':
        start.setDate(now.getDate() - 7)
        return { start, end: now }
      case 'MONTH':
        start.setMonth(now.getMonth() - 1)
        return { start, end: now }
      case 'QUARTER':
        start.setMonth(now.getMonth() - 3)
        return { start, end: now }
      case 'YEAR':
        start.setFullYear(now.getFullYear() - 1)
        return { start, end: now }
      case 'CUSTOM':
        if (customDateRange.start && customDateRange.end) {
          return {
            start: new Date(customDateRange.start),
            end: new Date(customDateRange.end)
          }
        }
        return null
      default:
        return null
    }
  }

  const filteredRequests = mockPurchaseRequests.filter((req) => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false

    // Date filtering
    if (dateFilter !== 'ALL') {
      const range = getDateRange(dateFilter)
      if (range) {
        const reqDate = new Date(req.createdAt)
        if (reqDate < range.start || reqDate > range.end) return false
      }
    }

    return true
  })

  // Export function
  const handleExport = () => {
    try {
      const csvContent = [
        ['Talep No', 'Başlık', 'Talep Eden', 'Departman', 'Durum', 'Toplam Tutar', 'Tarih'],
        ...filteredRequests.map(req => [
          req.requestNumber,
          req.title,
          req.requester.name,
          req.requester.department,
          statusLabels[req.status],
          req.estimatedTotal.toLocaleString('tr-TR'),
          new Date(req.createdAt).toLocaleDateString('tr-TR')
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `talepler_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      success('Talepler başarıyla dışa aktarıldı')
    } catch (err) {
      error('Dışa aktarma sırasında bir hata oluştu')
    }
  }

  const columns = [
    {
      key: 'requestNumber',
      label: 'Talep No',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm font-semibold text-blue-600">{value}</span>
      ),
    },
    {
      key: 'title',
      label: 'Başlık',
      sortable: true,
      render: (value: string) => (
        <div className="max-w-xs truncate font-medium">{value}</div>
      ),
    },
    {
      key: 'requester',
      label: 'Talep Eden',
      render: (value: any) => (
        <div>
          <div className="font-medium text-gray-900">{value.name}</div>
          <div className="text-xs text-gray-500">{value.department}</div>
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Ürün Sayısı',
      render: (value: any[]) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
          {value.length}
        </span>
      ),
    },
    {
      key: 'estimatedTotal',
      label: 'Toplam Tutar',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-gray-900">
          {value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Durum',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[value]}`}>
          {statusLabels[value]}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Oluşturma Tarihi',
      sortable: true,
      render: (value: string) => {
        const date = new Date(value)
        return (
          <div className="text-sm text-gray-600">
            {date.toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )
      },
    },
  ]

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
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <div className="flex items-center gap-4">
            <Filter size={20} className="text-gray-500" />
            <div className="flex gap-4 flex-1">
              <div className="flex-1">
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
                  <option value="IN_REVIEW">İncelemede</option>
                  <option value="APPROVED">Onaylandı</option>
                  <option value="REJECTED">Reddedildi</option>
                  <option value="COMPLETED">Tamamlandı</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarih Filtresi
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value)
                    if (e.target.value !== 'CUSTOM') {
                      setShowCustomDatePicker(false)
                    } else {
                      setShowCustomDatePicker(true)
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Tüm Tarihler</option>
                  <option value="TODAY">Bugün</option>
                  <option value="WEEK">Son 1 Hafta</option>
                  <option value="MONTH">Son 1 Ay</option>
                  <option value="QUARTER">Son 1 Çeyrek</option>
                  <option value="YEAR">Son 1 Yıl</option>
                  <option value="CUSTOM">Özel Tarih Aralığı</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              <span className="font-medium">Dışa Aktar</span>
            </button>
          </div>

          {/* Custom Date Range Picker */}
          {dateFilter === 'CUSTOM' && showCustomDatePicker && (
            <div className="flex items-center gap-4 pl-9">
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    if (!customDateRange.start || !customDateRange.end) {
                      error('Lütfen başlangıç ve bitiş tarihlerini seçin')
                      return
                    }
                    success('Tarih aralığı uygulandı')
                  }}
                  className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Uygula
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{filteredRequests.length}</div>
            <div className="text-sm text-gray-600">Toplam</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredRequests.filter((r) => r.status === 'IN_REVIEW').length}
            </div>
            <div className="text-sm text-gray-600">İncelemede</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredRequests.filter((r) => r.status === 'APPROVED').length}
            </div>
            <div className="text-sm text-gray-600">Onaylandı</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">
              {filteredRequests.filter((r) => r.status === 'REJECTED').length}
            </div>
            <div className="text-sm text-gray-600">Reddedildi</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {filteredRequests.filter((r) => r.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-gray-600">Tamamlandı</div>
          </div>
        </div>

        {/* Table */}
        <DataTable
          data={filteredRequests}
          columns={columns}
          onRowClick={(row) => router.push(`/requests/${row.id}`)}
          searchable
          searchPlaceholder="Talep ara (no, başlık, talep eden...)"
        />
      </div>
    </DashboardLayout>
  )
}
