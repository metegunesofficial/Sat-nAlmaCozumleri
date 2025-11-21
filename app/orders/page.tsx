'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import { ordersApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Package, Eye, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  PROCESSING: 'İşleniyor',
  SHIPPED: 'Kargoda',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
}

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

const paymentStatusLabels: Record<string, string> = {
  PENDING: 'Ödeme Bekliyor',
  PAID: 'Ödendi',
  FAILED: 'Ödeme Başarısız',
  REFUNDED: 'İade Edildi',
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalAmount: number
  createdAt: string
  user: {
    name: string
    email: string
  }
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    product: { name: string }
  }>
}

export default function OrdersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await ordersApi.getAll()
        if (response.success) {
          setOrders(response.data || [])
        }
      } catch (err) {
        console.error('Siparişler yüklenemedi:', err)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  const columns = [
    {
      key: 'orderNumber',
      label: 'Sipariş No',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'user',
      label: 'Müşteri',
      render: (value: any) => (
        <div>
          <div className="font-medium">{value?.name || '-'}</div>
          <div className="text-xs text-gray-500">{value?.email || '-'}</div>
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Ürünler',
      render: (value: any[]) => (
        <span className="text-sm">{value?.length || 0} ürün</span>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Tutar',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold">
          {(value || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Durum',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100'}`}>
          {statusLabels[value] || value}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Ödeme',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[value] || 'bg-gray-100'}`}>
          {paymentStatusLabels[value] || value}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Tarih',
      sortable: true,
      render: (value: string) => value ? new Date(value).toLocaleDateString('tr-TR') : '-',
    },
  ]

  // Calculate stats
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Siparişler</h1>
          <p className="text-gray-600 mt-1">Tüm siparişleri görüntüle ve yönet</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Sipariş</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bekleyen</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Teslim Edilen</p>
                <p className="text-2xl font-bold">{deliveredOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Gelir</p>
                <p className="text-lg font-bold">
                  {totalRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-600 mt-4">Henüz sipariş bulunmuyor</p>
            </div>
          ) : (
            <DataTable
              data={orders}
              columns={columns}
              searchable
              searchPlaceholder="Sipariş ara..."
              onRowClick={(row) => router.push(`/orders/${row.id}`)}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
