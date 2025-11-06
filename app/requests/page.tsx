'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import { Plus, Filter, Download } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Taslak',
  SUBMITTED: 'Gönderildi',
  IN_REVIEW: 'İncelemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
}

export default function RequestsPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [dateFilter, setDateFilter] = useState<string>('ALL')
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setLoading(false)
          return
        }

        const res = await fetch('/api/purchase-requests', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setRequests(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching requests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const filteredRequests = requests.filter((req) => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false
    // Date filtering could be implemented here
    return true
  }).map(req => ({
    ...req,
    requester: {
      name: req.requester?.name || 'N/A',
      department: req.department?.name || 'N/A'
    }
  }))

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
      render: (value: string) => (
        <div className="text-sm text-gray-600">{value}</div>
      ),
    },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      </DashboardLayout>
    )
  }

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
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Tüm Tarihler</option>
                  <option value="TODAY">Bugün</option>
                  <option value="WEEK">Bu Hafta</option>
                  <option value="MONTH">Bu Ay</option>
                  <option value="QUARTER">Bu Çeyrek</option>
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
