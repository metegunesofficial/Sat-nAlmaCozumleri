'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Loading from '@/components/Loading'
import { useNotification } from '@/contexts/NotificationContext'
import { Package, Truck, CheckCircle, XCircle, Clock, ArrowLeft, MapPin, Phone, Mail, CreditCard } from 'lucide-react'

interface OrderItem {
  id: string
  productName: string
  productSku: string
  quantity: number
  price: number
  total: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  updatedAt: string

  billingName: string
  billingEmail: string
  billingPhone: string
  billingAddress: string
  billingCity: string
  billingDistrict: string

  shippingName: string
  shippingAddress: string
  shippingCity: string

  subtotal: number
  shippingCost: number
  tax: number
  discount: number
  total: number

  paymentMethod: string
  notes?: string

  items: OrderItem[]
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { error } = useNotification()

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')

      if (!token) {
        error('Lütfen giriş yapın')
        router.push('/login')
        return
      }

      const response = await fetch(`/api/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setOrder(data.data)
      } else {
        error(data.error || 'Sipariş bulunamadı')
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Order fetch error:', err)
      error('Sipariş yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any; bg: string }> = {
      PENDING: { label: 'Beklemede', color: 'text-yellow-800', icon: Clock, bg: 'bg-yellow-100' },
      CONFIRMED: { label: 'Onaylandı', color: 'text-blue-800', icon: CheckCircle, bg: 'bg-blue-100' },
      PROCESSING: { label: 'Hazırlanıyor', color: 'text-purple-800', icon: Package, bg: 'bg-purple-100' },
      SHIPPED: { label: 'Kargoda', color: 'text-indigo-800', icon: Truck, bg: 'bg-indigo-100' },
      DELIVERED: { label: 'Teslim Edildi', color: 'text-green-800', icon: CheckCircle, bg: 'bg-green-100' },
      CANCELLED: { label: 'İptal Edildi', color: 'text-red-800', icon: XCircle, bg: 'bg-red-100' },
      REFUNDED: { label: 'İade Edildi', color: 'text-gray-800', icon: XCircle, bg: 'bg-gray-100' },
    }
    return statusMap[status] || statusMap.PENDING
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      CREDIT_CARD: 'Kredi Kartı',
      BANK_TRANSFER: 'Havale/EFT',
      CASH_ON_DELIVERY: 'Kapıda Ödeme',
    }
    return methods[method] || method
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading message="Sipariş yükleniyor..." />
      </DashboardLayout>
    )
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-gray-600">Sipariş bulunamadı</p>
        </div>
      </DashboardLayout>
    )
  }

  const statusInfo = getStatusInfo(order.status)
  const StatusIcon = statusInfo.icon

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Geri Dön
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Sipariş #{order.orderNumber}
              </h1>
              <p className="text-gray-600">
                {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div className={`mt-4 md:mt-0 inline-flex items-center px-4 py-2 rounded-full ${statusInfo.bg}`}>
              <StatusIcon className={`w-5 h-5 mr-2 ${statusInfo.color}`} />
              <span className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Sipariş Detayları</h2>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center py-4 border-b border-gray-200 last:border-0">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.productName}</h3>
                      <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.quantity} x {item.price.toFixed(2)} ₺
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{item.total.toFixed(2)} ₺</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Billing Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Teslimat Adresi
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{order.shippingName}</p>
                  <p className="text-gray-600">{order.shippingAddress}</p>
                  <p className="text-gray-600">{order.shippingCity}</p>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Fatura Adresi
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{order.billingName}</p>
                  <p className="text-gray-600 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {order.billingEmail}
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {order.billingPhone}
                  </p>
                  <p className="text-gray-600">{order.billingAddress}</p>
                  <p className="text-gray-600">{order.billingCity}, {order.billingDistrict}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Sipariş Notu</h3>
                <p className="text-sm text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Özet</h2>

              {/* Payment Method */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Ödeme Yöntemi</p>
                <p className="font-medium flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  {getPaymentMethodLabel(order.paymentMethod)}
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span className="font-medium">{order.subtotal.toFixed(2)} ₺</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kargo</span>
                  <span className="font-medium">
                    {order.shippingCost > 0 ? `${order.shippingCost.toFixed(2)} ₺` : 'Ücretsiz'}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">KDV</span>
                  <span className="font-medium">{order.tax.toFixed(2)} ₺</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>İndirim</span>
                    <span className="font-medium">-{order.discount.toFixed(2)} ₺</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
                  <span>Toplam</span>
                  <span className="text-blue-600">{order.total.toFixed(2)} ₺</span>
                </div>
              </div>

              {/* Order Status Timeline */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">Sipariş Durumu</h3>
                <div className="space-y-3">
                  {[
                    { status: 'PENDING', label: 'Sipariş Alındı', done: true },
                    { status: 'CONFIRMED', label: 'Onaylandı', done: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) },
                    { status: 'PROCESSING', label: 'Hazırlanıyor', done: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) },
                    { status: 'SHIPPED', label: 'Kargoya Verildi', done: ['SHIPPED', 'DELIVERED'].includes(order.status) },
                    { status: 'DELIVERED', label: 'Teslim Edildi', done: order.status === 'DELIVERED' },
                  ].map((step, index) => (
                    <div key={step.status} className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        step.done ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {step.done && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`ml-3 text-sm ${step.done ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {order.status === 'PENDING' && (
                <button className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors">
                  Siparişi İptal Et
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
