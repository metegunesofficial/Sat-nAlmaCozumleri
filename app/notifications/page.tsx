'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useNotification } from '@/contexts/NotificationContext'
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Trash2,
  CheckCheck,
  Package,
  DollarSign,
  User,
  Filter
} from 'lucide-react'

interface Notification {
  id: string
  type: 'approval' | 'order' | 'budget' | 'system' | 'user'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  link?: string
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'approval',
    title: 'Talep Onaylandı',
    message: 'PR-2024-0001 numaralı satın alma talebiniz onaylandı.',
    isRead: false,
    createdAt: new Date().toISOString(),
    link: '/requests/1'
  },
  {
    id: '2',
    type: 'order',
    title: 'Sipariş Kargoda',
    message: 'ORD-2024-0005 numaralı siparişiniz kargoya verildi.',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    link: '/orders/5'
  },
  {
    id: '3',
    type: 'budget',
    title: 'Bütçe Uyarısı',
    message: 'Bilgi İşlem departmanı bütçesinin %85\'i kullanıldı.',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    link: '/admin/budgets'
  },
  {
    id: '4',
    type: 'approval',
    title: 'Onay Bekliyor',
    message: 'PR-2024-0012 numaralı talep onayınızı bekliyor.',
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    link: '/requests/12'
  },
  {
    id: '5',
    type: 'system',
    title: 'Sistem Güncellemesi',
    message: 'Yeni özellikler eklendi. Detaylar için tıklayın.',
    isRead: true,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '6',
    type: 'user',
    title: 'Yeni Kullanıcı',
    message: 'Ahmet Yılmaz departmanınıza katıldı.',
    isRead: true,
    createdAt: new Date(Date.now() - 259200000).toISOString()
  }
]

export default function NotificationsPage() {
  const { success } = useNotification()
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const getIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle className="text-green-600" size={20} />
      case 'order':
        return <Package className="text-purple-600" size={20} />
      case 'budget':
        return <DollarSign className="text-yellow-600" size={20} />
      case 'system':
        return <AlertTriangle className="text-blue-600" size={20} />
      case 'user':
        return <User className="text-gray-600" size={20} />
      default:
        return <Bell className="text-gray-600" size={20} />
    }
  }

  const getIconBg = (type: string) => {
    switch (type) {
      case 'approval': return 'bg-green-100'
      case 'order': return 'bg-purple-100'
      case 'budget': return 'bg-yellow-100'
      case 'system': return 'bg-blue-100'
      case 'user': return 'bg-gray-100'
      default: return 'bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return 'Az önce'
    if (hours < 24) return `${hours} saat önce`
    if (days < 7) return `${days} gün önce`
    return date.toLocaleDateString('tr-TR')
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    success('Tüm bildirimler okundu olarak işaretlendi')
  }

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const handleClearAll = () => {
    setNotifications([])
    success('Tüm bildirimler silindi')
  }

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bildirimler</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50"
              >
                <CheckCheck size={18} />
                Tümünü Okundu İşaretle
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <Trash2 size={18} />
                Tümünü Sil
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tümü ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Okunmamış ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg border border-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-300" />
              <p className="text-gray-500 mt-4">
                {filter === 'unread' ? 'Okunmamış bildirim yok' : 'Henüz bildirim yok'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getIconBg(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                        {notification.link && (
                          <a
                            href={notification.link}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Görüntüle
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Okundu işaretle"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
