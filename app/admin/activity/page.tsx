'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useNotification } from '@/contexts/NotificationContext'
import {
  Activity,
  User,
  FileText,
  ShoppingCart,
  Settings,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Filter,
  Calendar
} from 'lucide-react'

interface ActivityLog {
  id: string
  action: string
  entityType: string
  entityId: string
  description: string
  userId: string
  userName: string
  ipAddress?: string
  createdAt: string
}

// Mock data for activity logs
const mockActivities: ActivityLog[] = [
  {
    id: '1',
    action: 'CREATE',
    entityType: 'PURCHASE_REQUEST',
    entityId: 'PR-2024-0015',
    description: 'Yeni satın alma talebi oluşturuldu',
    userId: '1',
    userName: 'Ahmet Yılmaz',
    ipAddress: '192.168.1.100',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    action: 'APPROVE',
    entityType: 'PURCHASE_REQUEST',
    entityId: 'PR-2024-0014',
    description: 'Satın alma talebi onaylandı',
    userId: '2',
    userName: 'Mehmet Demir',
    ipAddress: '192.168.1.101',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '3',
    action: 'UPDATE',
    entityType: 'USER',
    entityId: 'USR-005',
    description: 'Kullanıcı bilgileri güncellendi',
    userId: '3',
    userName: 'Ayşe Kaya',
    ipAddress: '192.168.1.102',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '4',
    action: 'DELETE',
    entityType: 'PRODUCT',
    entityId: 'PRD-100',
    description: 'Ürün silindi: Ofis Sandalyesi',
    userId: '1',
    userName: 'Ahmet Yılmaz',
    ipAddress: '192.168.1.100',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '5',
    action: 'CREATE',
    entityType: 'ORDER',
    entityId: 'ORD-2024-0010',
    description: 'Yeni sipariş oluşturuldu',
    userId: '4',
    userName: 'Fatma Öz',
    ipAddress: '192.168.1.103',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '6',
    action: 'LOGIN',
    entityType: 'SESSION',
    entityId: 'SES-001',
    description: 'Kullanıcı giriş yaptı',
    userId: '2',
    userName: 'Mehmet Demir',
    ipAddress: '192.168.1.101',
    createdAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: '7',
    action: 'REJECT',
    entityType: 'PURCHASE_REQUEST',
    entityId: 'PR-2024-0012',
    description: 'Satın alma talebi reddedildi',
    userId: '2',
    userName: 'Mehmet Demir',
    ipAddress: '192.168.1.101',
    createdAt: new Date(Date.now() - 345600000).toISOString()
  },
  {
    id: '8',
    action: 'UPDATE',
    entityType: 'SETTINGS',
    entityId: 'SET-001',
    description: 'Sistem ayarları güncellendi',
    userId: '1',
    userName: 'Ahmet Yılmaz',
    ipAddress: '192.168.1.100',
    createdAt: new Date(Date.now() - 432000000).toISOString()
  }
]

const actionIcons: Record<string, any> = {
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
  APPROVE: CheckCircle,
  REJECT: XCircle,
  LOGIN: User,
}

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-600',
  UPDATE: 'bg-blue-100 text-blue-600',
  DELETE: 'bg-red-100 text-red-600',
  APPROVE: 'bg-emerald-100 text-emerald-600',
  REJECT: 'bg-orange-100 text-orange-600',
  LOGIN: 'bg-purple-100 text-purple-600',
}

const entityIcons: Record<string, any> = {
  PURCHASE_REQUEST: FileText,
  ORDER: ShoppingCart,
  USER: User,
  PRODUCT: ShoppingCart,
  SETTINGS: Settings,
  SESSION: User,
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>(mockActivities)
  const [filter, setFilter] = useState({
    action: 'all',
    entityType: 'all',
    dateRange: '7days'
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return 'Az önce'
    if (hours < 24) return `${hours} saat önce`
    if (days < 7) return `${days} gün önce`
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const filteredActivities = activities.filter(activity => {
    if (filter.action !== 'all' && activity.action !== filter.action) return false
    if (filter.entityType !== 'all' && activity.entityType !== filter.entityType) return false
    return true
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Aktivite Geçmişi</h1>
          <p className="text-gray-600 mt-1">Sistem aktivitelerini takip edin</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İşlem Tipi</label>
              <select
                value={filter.action}
                onChange={(e) => setFilter({ ...filter, action: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tümü</option>
                <option value="CREATE">Oluşturma</option>
                <option value="UPDATE">Güncelleme</option>
                <option value="DELETE">Silme</option>
                <option value="APPROVE">Onay</option>
                <option value="REJECT">Red</option>
                <option value="LOGIN">Giriş</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Varlık Tipi</label>
              <select
                value={filter.entityType}
                onChange={(e) => setFilter({ ...filter, entityType: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tümü</option>
                <option value="PURCHASE_REQUEST">Satın Alma Talebi</option>
                <option value="ORDER">Sipariş</option>
                <option value="USER">Kullanıcı</option>
                <option value="PRODUCT">Ürün</option>
                <option value="SETTINGS">Ayarlar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarih Aralığı</label>
              <select
                value={filter.dateRange}
                onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Bugün</option>
                <option value="7days">Son 7 Gün</option>
                <option value="30days">Son 30 Gün</option>
                <option value="all">Tümü</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white rounded-lg border border-gray-200">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-600 mt-4">Aktivite bulunamadı</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredActivities.map((activity) => {
                const ActionIcon = actionIcons[activity.action] || Activity
                const EntityIcon = entityIcons[activity.entityType] || FileText

                return (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${actionColors[activity.action] || 'bg-gray-100 text-gray-600'}`}>
                        <ActionIcon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{activity.description}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            <span>{activity.userName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <EntityIcon size={14} />
                            <span className="font-mono text-xs">{activity.entityId}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatDate(activity.createdAt)}</span>
                          </div>
                        </div>
                        {activity.ipAddress && (
                          <div className="text-xs text-gray-400 mt-1">
                            IP: {activity.ipAddress}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
