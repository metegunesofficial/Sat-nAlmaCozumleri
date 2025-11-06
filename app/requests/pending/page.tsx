'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { mockPurchaseRequests } from '@/lib/mockData'
import { useNotification } from '@/contexts/NotificationContext'
import { CheckCircle, XCircle, Clock, AlertCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  NORMAL: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
}

const priorityLabels: Record<string, string> = {
  LOW: 'Düşük',
  NORMAL: 'Normal',
  HIGH: 'Yüksek',
  URGENT: 'Acil',
}

export default function PendingApprovalsPage() {
  const router = useRouter()
  const { success, error } = useNotification()
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null)
  const [comment, setComment] = useState<Record<string, string>>({})

  // Filter only requests that need approval
  const pendingRequests = mockPurchaseRequests.filter(
    (req) => req.status === 'IN_REVIEW' || req.status === 'DRAFT'
  )

  const handleApprove = (requestId: string) => {
    success('Talep onaylandı!')
    // In real app: API call
    setTimeout(() => router.refresh(), 1000)
  }

  const handleReject = (requestId: string) => {
    if (!comment[requestId]?.trim()) {
      error('Lütfen red nedeni giriniz')
      return
    }
    success('Talep reddedildi')
    // In real app: API call
    setTimeout(() => router.refresh(), 1000)
  }

  const handleRequestChange = (requestId: string) => {
    if (!comment[requestId]?.trim()) {
      error('Lütfen değişiklik talebinizi giriniz')
      return
    }
    success('Değişiklik talebi gönderildi')
    // In real app: API call
  }

  const toggleExpanded = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bekleyen Onaylar</h1>
          <p className="text-gray-600 mt-1">Onay bekleyen satın alma taleplerini incele ve onayla</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Clock className="text-yellow-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
                <p className="text-sm text-gray-600">Bekleyen Talepler</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingRequests.filter((r) => r.priority === 'URGENT').length}
                </p>
                <p className="text-sm text-gray-600">Acil</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingRequests
                    .reduce((sum, r) => sum + r.estimatedTotal, 0)
                    .toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
                <p className="text-sm text-gray-600">Toplam Tutar</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Clock className="text-blue-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">2.5</p>
                <p className="text-sm text-gray-600">Ort. Bekleme (gün)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Harika! Bekleyen onay yok
              </h3>
              <p className="text-gray-600">Tüm talepler işleme alındı</p>
            </div>
          ) : (
            pendingRequests.map((request) => {
              const isExpanded = expandedRequest === request.id

              return (
                <div
                  key={request.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  {/* Request Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              priorityColors[request.priority]
                            }`}
                          >
                            {priorityLabels[request.priority]}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Talep No:</span>
                            <p className="font-mono font-semibold text-blue-600">
                              {request.requestNumber}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Talep Eden:</span>
                            <p className="font-medium text-gray-900">{request.requester.name}</p>
                            <p className="text-xs text-gray-500">{request.requester.department}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Toplam Tutar:</span>
                            <p className="font-bold text-gray-900">
                              {request.estimatedTotal.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Tarih:</span>
                            <p className="font-medium text-gray-900">
                              {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleExpanded(request.id)}
                        className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-gray-600" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-6">
                      {/* Description */}
                      {request.description && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Açıklama</h4>
                          <p className="text-gray-700">{request.description}</p>
                        </div>
                      )}

                      {/* Items */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Ürünler ({request.items.length})
                        </h4>
                        <div className="space-y-2">
                          {request.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-white rounded-lg p-3 flex justify-between items-center"
                            >
                              <div className="flex items-center gap-3">
                                <FileText size={18} className="text-gray-400" />
                                <div>
                                  <p className="font-medium text-gray-900">{item.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {item.quantity} adet × {item.unitPrice.toLocaleString('tr-TR')} TL
                                  </p>
                                </div>
                              </div>
                              <p className="font-semibold text-gray-900">
                                {item.total.toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY',
                                })}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Comment Section */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Yorum / Not</h4>
                        <textarea
                          value={comment[request.id] || ''}
                          onChange={(e) =>
                            setComment({ ...comment, [request.id]: e.target.value })
                          }
                          rows={3}
                          placeholder="Onay notu veya red nedeni giriniz..."
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => handleReject(request.id)}
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          <XCircle size={20} />
                          Reddet
                        </button>
                        <button
                          onClick={() => handleRequestChange(request.id)}
                          className="flex items-center gap-2 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          Değişiklik İste
                        </button>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          <CheckCircle size={20} />
                          Onayla
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
