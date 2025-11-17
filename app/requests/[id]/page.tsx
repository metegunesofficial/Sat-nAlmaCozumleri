'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import Modal from '@/components/Modal'
import { useParams, useRouter } from 'next/navigation'
import { useNotification } from '@/contexts/NotificationContext'
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Clock,
  User,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
} from 'lucide-react'

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

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error } = useNotification()
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [comments, setComments] = useState('')
  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/purchase-requests/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setRequest(data.data)
          }
        }
      } catch (err) {
        console.error('Request fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRequest()
  }, [params.id])

  if (!request) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Talep bulunamadı</p>
        </div>
      </DashboardLayout>
    )
  }

  const handleApprove = () => {
    success('Talep onaylandı!')
    setIsApproveModalOpen(false)
    router.push('/requests')
  }

  const handleReject = () => {
    if (!comments) {
      error('Lütfen red nedeni girin')
      return
    }
    success('Talep reddedildi')
    setIsRejectModalOpen(false)
    router.push('/requests')
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Geri Dön</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[request.status]
                  }`}
                >
                  {statusLabels[request.status]}
                </span>
              </div>
              <p className="text-gray-600 mt-2 font-mono text-sm">
                Talep No: {request.requestNumber}
              </p>
            </div>

            {request.status === 'IN_REVIEW' && (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  className="flex items-center gap-2 border border-red-300 text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <XCircle size={20} />
                  Reddet
                </button>
                <button
                  onClick={() => setIsApproveModalOpen(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <CheckCircle size={20} />
                  Onayla
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Talep Detayları</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Talep Eden</p>
                    <p className="font-medium text-gray-900">{request.requester.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building2 className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Departman</p>
                    <p className="font-medium text-gray-900">{request.requester.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Oluşturma Tarihi</p>
                    <p className="font-medium text-gray-900">{request.createdAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Toplam Tutar</p>
                    <p className="text-lg font-bold text-blue-600">
                      {request.estimatedTotal.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {request.description && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Açıklama</p>
                  <p className="text-gray-900">{request.description}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ürünler ({request.items.length})
              </h2>

              <div className="space-y-3">
                {request.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <div className="flex gap-6 mt-2 text-sm text-gray-600">
                        <span>Miktar: {item.quantity}</span>
                        <span>
                          Birim Fiyat:{' '}
                          {item.unitPrice.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Toplam</p>
                      <p className="font-semibold text-gray-900">
                        {(item.quantity * item.unitPrice).toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                <span className="text-lg font-medium text-gray-700">Toplam Tutar:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {request.estimatedTotal.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </span>
              </div>
            </div>

            {/* Comments/History */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Onay Geçmişi</h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{request.requester.name}</span>
                      <span className="text-sm text-gray-500">{request.createdAt}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Satın alma talebi oluşturuldu</p>
                  </div>
                </div>

                {request.status === 'IN_REVIEW' && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Clock size={20} className="text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">Sistem</span>
                        <span className="text-sm text-gray-500">{request.createdAt}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Talep onay sürecine gönderildi
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Approval Workflow */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Onay Süreci</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Departman Müdürü</p>
                    <p className="text-sm text-gray-600">Onaylandı</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Finans Müdürü</p>
                    <p className="text-sm text-gray-600">Beklemede</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Genel Müdür</p>
                    <p className="text-sm text-gray-600">Beklemede</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Impact */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bütçe Etkisi</h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Departman Bütçesi</span>
                    <span className="font-medium">50,000 TL</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Kullanılan</span>
                    <span className="font-medium">15,000 TL</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Bu Talep</span>
                    <span className="font-medium text-blue-600">
                      {request.estimatedTotal.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${((15000 + request.estimatedTotal) / 50000) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Onaylanırsa %{(((15000 + request.estimatedTotal) / 50000) * 100).toFixed(1)}{' '}
                    kullanılmış olacak
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Talebi Onayla"
        footer={
          <>
            <button
              onClick={() => setIsApproveModalOpen(false)}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Onayla
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bu satın alma talebini onaylamak istediğinize emin misiniz?
          </p>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Talep No:</strong> {request.requestNumber}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Tutar:</strong>{' '}
              {request.estimatedTotal.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
              })}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yorum (Opsiyonel)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              placeholder="Onay yorumunuz..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Talebi Reddet"
        footer={
          <>
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Reddet
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bu satın alma talebini reddetmek istediğinize emin misiniz?
          </p>

          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Talep No:</strong> {request.requestNumber}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Tutar:</strong>{' '}
              {request.estimatedTotal.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
              })}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Red Nedeni * <span className="text-red-500">(Zorunlu)</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              placeholder="Lütfen red nedenini açıklayın..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
