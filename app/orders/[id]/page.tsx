'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { ordersApi } from '@/lib/api'
import { useNotification } from '@/contexts/NotificationContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  Package,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Truck,
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react'

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

const statusIcons: Record<string, any> = {
  PENDING: Clock,
  PROCESSING: AlertCircle,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
}

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  totalPrice: number
  product: {
    id: string
    name: string
    sku: string
    imageUrl?: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalAmount: number
  shippingAddress?: string
  billingAddress?: string
  notes?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
  }
  items: OrderItem[]
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { success, error } = useNotification()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await ordersApi.getById(params.id as string)
        if (response.success) {
          setOrder(response.data)
        } else {
          error('Sipariş bulunamadı')
          router.push('/orders')
        }
      } catch (err) {
        console.error('Sipariş yüklenemedi:', err)
        error('Sipariş yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [params.id, router, error])

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return
    setUpdating(true)
    try {
      const response = await ordersApi.updateStatus(order.id, newStatus)
      if (response.success) {
        setOrder({ ...order, status: newStatus })
        success('Sipariş durumu güncellendi')
      } else {
        error(response.error || 'Durum güncellenemedi')
      }
    } catch (err) {
      error('Durum güncellenirken hata oluştu')
    } finally {
      setUpdating(false)
    }
  }

  const canUpdateStatus = ['COMPANY_ADMIN', 'PROCUREMENT_MANAGER', 'SUPER_ADMIN'].includes(user?.role || '')

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-gray-600 mt-4">Sipariş bulunamadı</p>
        </div>
      </DashboardLayout>
    )
  }

  const StatusIcon = statusIcons[order.status] || Package

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sipariş #{order.orderNumber}
              </h1>
              <p className="text-gray-600">
                {new Date(order.createdAt).toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
              {statusLabels[order.status]}
            </span>
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${paymentStatusColors[order.paymentStatus]}`}>
              {paymentStatusLabels[order.paymentStatus]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Sipariş Kalemleri</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="text-gray-400" size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{item.quantity} adet</p>
                      <p className="font-medium">
                        {item.unitPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </p>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="text-sm text-gray-500">Toplam</p>
                      <p className="font-semibold text-blue-600">
                        {item.totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Genel Toplam</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {order.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-3">Notlar</h2>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Müşteri Bilgileri</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="text-gray-400" size={18} />
                  <span>{order.user.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="text-gray-400" size={18} />
                  <span className="text-sm">{order.user.email}</span>
                </div>
                {order.user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="text-gray-400" size={18} />
                    <span>{order.user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Truck size={20} />
                  Teslimat Adresi
                </h2>
                <p className="text-gray-600 text-sm">{order.shippingAddress}</p>
              </div>
            )}

            {/* Status Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Sipariş Durumu</h2>
              <div className="flex items-center justify-center p-6">
                <div className={`p-4 rounded-full ${statusColors[order.status].replace('text-', 'bg-').replace('800', '200')}`}>
                  <StatusIcon size={32} className={statusColors[order.status].split(' ')[1]} />
                </div>
              </div>
              <p className="text-center text-lg font-medium mt-2">
                {statusLabels[order.status]}
              </p>

              {/* Status Actions */}
              {canUpdateStatus && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <p className="text-sm text-gray-600 mb-2">Durumu Güncelle:</p>
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleStatusUpdate('PROCESSING')}
                      disabled={updating}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      İşleme Al
                    </button>
                  )}
                  {order.status === 'PROCESSING' && (
                    <button
                      onClick={() => handleStatusUpdate('SHIPPED')}
                      disabled={updating}
                      className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      Kargoya Ver
                    </button>
                  )}
                  {order.status === 'SHIPPED' && (
                    <button
                      onClick={() => handleStatusUpdate('DELIVERED')}
                      disabled={updating}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Teslim Edildi
                    </button>
                  )}
                  {order.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleStatusUpdate('CANCELLED')}
                      disabled={updating}
                      className="w-full border border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      İptal Et
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Sipariş Detayları</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sipariş No</span>
                  <span className="font-mono">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Oluşturulma</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Son Güncelleme</span>
                  <span>{new Date(order.updatedAt).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ürün Sayısı</span>
                  <span>{order.items.length} kalem</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
