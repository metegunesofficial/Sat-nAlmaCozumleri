'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useNotification } from '@/contexts/NotificationContext'
import { Bell, CheckCircle, AlertCircle, Info, XCircle, Check, Trash2 } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'APPROVAL_PENDING' | 'APPROVAL_APPROVED' | 'APPROVAL_REJECTED' | 'ORDER_STATUS' | 'INFO'
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const { success, error } = useNotification()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      // TODO: Replace with actual API call when backend is ready
      // Simulating API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500))

      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Satın Alma Talebi Onaylandı',
          message: 'PR-2024-001 numaralı satın alma talebiniz onaylandı.',
          type: 'APPROVAL_APPROVED',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: '2',
          title: 'Yeni Onay Bekliyor',
          message: 'PR-2024-005 numaralı talep onayınızı bekliyor. Tutar: 15,000 ₺',
          type: 'APPROVAL_PENDING',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: '3',
          title: 'Sipariş Kargoya Verildi',
          message: 'ORD-2024-123 numaralı siparişiniz kargoya verildi. Kargo takip: 1234567890',
          type: 'ORDER_STATUS',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
          id: '4',
          title: 'Bütçe Uyarısı',
          message: 'Departman bütçenizin %80\'i kullanıldı. Kalan: 10,000 ₺',
          type: 'INFO',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        },
        {
          id: '5',
          title: 'Satın Alma Talebi Reddedildi',
          message: 'PR-2024-003 numaralı talebiniz reddedildi. Sebep: Bütçe yetersiz',
          type: 'APPROVAL_REJECTED',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        },
      ]

      const filtered = filter === 'unread'
        ? mockNotifications.filter(n => !n.isRead)
        : mockNotifications

      setNotifications(filtered)
    } catch (err) {
      error('Bildirimler yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      // TODO: API call
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
      success('Okundu olarak işaretlendi')
    } catch (err) {
      error('İşlem başarısız')
    }
  }

  const markAllAsRead = async () => {
    try {
      // TODO: API call
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      success('Tüm bildirimler okundu olarak işaretlendi')
    } catch (err) {
      error('İşlem başarısız')
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      // TODO: API call
      setNotifications(prev => prev.filter(n => n.id !== id))
      success('Bildirim silindi')
    } catch (err) {
      error('Silme işlemi başarısız')
    }
  }

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, { icon: any; color: string; bg: string }> = {
      APPROVAL_PENDING: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      APPROVAL_APPROVED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
      APPROVAL_REJECTED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
      ORDER_STATUS: { icon: Bell, color: 'text-blue-600', bg: 'bg-blue-100' },
      INFO: { icon: Info, color: 'text-gray-600', bg: 'bg-gray-100' },
    }
    return iconMap[type] || iconMap.INFO
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Az önce'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`

    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Bildirimler</h1>
            <p className="text-gray-600">
              {unreadCount > 0 && `${unreadCount} okunmamış bildiriminiz var`}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Check className="w-5 h-5" />
              Tümünü Okundu İşaretle
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tümü ({notifications.length + (filter === 'unread' ? notifications.filter(n => n.isRead).length : 0)})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Okunmamış ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Yükleniyor...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {filter === 'unread' ? 'Okunmamış Bildirim Yok' : 'Bildirim Yok'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? 'Tüm bildirimlerinizi okudunuz'
                : 'Henüz hiç bildiriminiz yok'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const iconInfo = getNotificationIcon(notification.type)
              const Icon = iconInfo.icon

              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg border transition-all ${
                    notification.isRead
                      ? 'border-gray-200'
                      : 'border-blue-200 bg-blue-50/30'
                  }`}
                >
                  <div className="p-4 flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full ${iconInfo.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${iconInfo.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className={`font-semibold ${notification.isRead ? 'text-gray-800' : 'text-gray-900'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{getTimeAgo(notification.createdAt)}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Okundu işaretle"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
