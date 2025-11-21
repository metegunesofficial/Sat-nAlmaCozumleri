'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import Modal from '@/components/Modal'
import { useParams, useRouter } from 'next/navigation'
import { useNotification } from '@/contexts/NotificationContext'
import { useAuth } from '@/contexts/AuthContext'
import { purchaseRequestsApi } from '@/lib/api'
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
  RotateCcw,
  AlertCircle,
  Download,
} from 'lucide-react'
import { exportRequestToPDF } from '@/lib/export'

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  RETURNED: 'bg-orange-100 text-orange-800',
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Taslak',
  PENDING: 'Beklemede',
  IN_REVIEW: 'İncelemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  COMPLETED: 'Tamamlandı',
  RETURNED: 'İade Edildi',
}

const priorityLabels: Record<string, string> = {
  LOW: 'Düşük',
  NORMAL: 'Normal',
  HIGH: 'Yüksek',
  URGENT: 'Acil',
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  NORMAL: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
}

interface RequestDetail {
  id: string
  requestNumber: string
  title: string
  description?: string
  justification?: string
  status: string
  priority: string
  totalAmount: number
  createdAt: string
  requiredDate?: string
  currentStep?: number
  user: {
    name: string
    email: string
    department?: { name: string }
  }
  category?: { name: string }
  items: Array<{
    id: string
    productName: string
    quantity: number
    unitPrice: number
    notes?: string
  }>
  approvalActions?: Array<{
    id: string
    action: string
    comments?: string
    createdAt: string
    user: { name: string; role: string }
  }>
  workflow?: {
    name: string
    steps: Array<{
      id: string
      stepOrder: number
      stepName: string
      approverRole: string
      isCompleted?: boolean
      isCurrent?: boolean
    }>
  }
  budget?: {
    total: number
    used: number
    available: number
  }
}

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error } = useNotification()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [request, setRequest] = useState<RequestDetail | null>(null)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [comments, setComments] = useState('')

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const response = await purchaseRequestsApi.getById(params.id as string)
        if (response.success) {
          setRequest(response.data)
        } else {
          error('Talep yüklenemedi')
        }
      } catch (err) {
        console.error('Talep yüklenirken hata:', err)
        error('Talep yüklenemedi')
      } finally {
        setLoading(false)
      }
    }
    loadRequest()
  }, [params.id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Yükleniyor...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!request) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-gray-600 mt-4">Talep bulunamadı</p>
        </div>
      </DashboardLayout>
    )
  }

  const handleApprove = async () => {
    setSubmitting(true)
    try {
      const response = await purchaseRequestsApi.approve(request.id, {
        action: 'APPROVE',
        comments: comments || undefined
      })
      if (response.success) {
        success('Talep onaylandı!')
        setIsApproveModalOpen(false)
        router.push('/requests')
      } else {
        error(response.error || 'Onaylama başarısız')
      }
    } catch (err) {
      error('Onaylama sırasında hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!comments) {
      error('Lütfen red nedeni girin')
      return
    }
    setSubmitting(true)
    try {
      const response = await purchaseRequestsApi.approve(request.id, {
        action: 'REJECT',
        comments
      })
      if (response.success) {
        success('Talep reddedildi')
        setIsRejectModalOpen(false)
        router.push('/requests')
      } else {
        error(response.error || 'Reddetme başarısız')
      }
    } catch (err) {
      error('Reddetme sırasında hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReturn = async () => {
    if (!comments) {
      error('Lütfen iade nedeni girin')
      return
    }
    setSubmitting(true)
    try {
      const response = await purchaseRequestsApi.approve(request.id, {
        action: 'RETURN',
        comments
      })
      if (response.success) {
        success('Talep iade edildi')
        setIsReturnModalOpen(false)
        router.push('/requests')
      } else {
        error(response.error || 'İade başarısız')
      }
    } catch (err) {
      error('İade sırasında hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  // Check if user can approve this request
  const canApprove = ['PENDING', 'IN_REVIEW'].includes(request.status) &&
    ['DEPARTMENT_MANAGER', 'FINANCE_MANAGER', 'GENERAL_MANAGER', 'PROCUREMENT_MANAGER', 'COMPANY_ADMIN'].includes(user?.role || '')

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button & Export */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Geri Dön</span>
          </button>
          <button
            onClick={() => exportRequestToPDF({
              ...request,
              department: request.user.department
            })}
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            PDF İndir
          </button>
        </div>

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

            {canApprove && (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsReturnModalOpen(true)}
                  className="flex items-center gap-2 border border-orange-300 text-orange-700 hover:bg-orange-50 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <RotateCcw size={20} />
                  İade Et
                </button>
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

            {request.priority && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[request.priority]}`}>
                {priorityLabels[request.priority]}
              </span>
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
                    <p className="font-medium text-gray-900">{request.user.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building2 className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Departman</p>
                    <p className="font-medium text-gray-900">{request.user.department?.name || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Oluşturma Tarihi</p>
                    <p className="font-medium text-gray-900">
                      {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Toplam Tutar</p>
                    <p className="text-lg font-bold text-blue-600">
                      {request.totalAmount.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {request.requiredDate && (
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <Calendar className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Gerekli Tarih</p>
                    <p className="font-medium text-gray-900">
                      {new Date(request.requiredDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              )}

              {request.description && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Açıklama</p>
                  <p className="text-gray-900">{request.description}</p>
                </div>
              )}

              {request.justification && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Gerekçe</p>
                  <p className="text-gray-900">{request.justification}</p>
                </div>
              )}

              {request.category && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Kategori</p>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {request.category.name}
                  </span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ürünler ({request.items.length})
              </h2>

              <div className="space-y-3">
                {request.items.map((item, idx: number) => (
                  <div
                    key={item.id || idx}
                    className="border border-gray-200 rounded-lg p-4 flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
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
                  {request.totalAmount.toLocaleString('tr-TR', {
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
                      <span className="font-medium text-gray-900">{request.user.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Satın alma talebi oluşturuldu</p>
                  </div>
                </div>

                {request.approvalActions?.map((action) => (
                  <div key={action.id} className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      action.action === 'APPROVE' ? 'bg-green-100' :
                      action.action === 'REJECT' ? 'bg-red-100' :
                      action.action === 'RETURN' ? 'bg-orange-100' : 'bg-yellow-100'
                    }`}>
                      {action.action === 'APPROVE' ? <CheckCircle size={20} className="text-green-600" /> :
                       action.action === 'REJECT' ? <XCircle size={20} className="text-red-600" /> :
                       action.action === 'RETURN' ? <RotateCcw size={20} className="text-orange-600" /> :
                       <Clock size={20} className="text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{action.user.name}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(action.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {action.action === 'APPROVE' ? 'Talebi onayladı' :
                         action.action === 'REJECT' ? 'Talebi reddetti' :
                         action.action === 'RETURN' ? 'Talebi iade etti' : action.action}
                      </p>
                      {action.comments && (
                        <p className="text-sm text-gray-500 mt-1 italic">&quot;{action.comments}&quot;</p>
                      )}
                    </div>
                  </div>
                ))}

                {['PENDING', 'IN_REVIEW'].includes(request.status) && !request.approvalActions?.length && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Clock size={20} className="text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Onay bekliyor...</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Onay Süreci
                {request.workflow && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({request.workflow.name})
                  </span>
                )}
              </h3>

              <div className="space-y-4">
                {request.workflow?.steps?.map((step, index) => {
                  const isCompleted = step.isCompleted ||
                    (request.currentStep && step.stepOrder < request.currentStep)
                  const isCurrent = step.isCurrent ||
                    (request.currentStep && step.stepOrder === request.currentStep)

                  return (
                    <div key={step.id || index} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted ? 'bg-green-100' :
                        isCurrent ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : isCurrent ? (
                          <Clock size={16} className="text-yellow-600" />
                        ) : (
                          <Clock size={16} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isCurrent ? 'text-yellow-700' : 'text-gray-900'}`}>
                          {step.stepName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {isCompleted ? 'Tamamlandı' : isCurrent ? 'Beklemede' : 'Sırada'}
                        </p>
                      </div>
                      {isCurrent && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>
                  )
                })}

                {!request.workflow?.steps?.length && (
                  <div className="text-sm text-gray-500 text-center py-4">
                    Onay iş akışı tanımlanmamış
                  </div>
                )}
              </div>
            </div>

            {/* Budget Impact */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bütçe Etkisi</h3>

              {request.budget ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Departman Bütçesi</span>
                      <span className="font-medium">
                        {request.budget.total.toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Kullanılan</span>
                      <span className="font-medium">
                        {request.budget.used.toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Bu Talep</span>
                      <span className="font-medium text-blue-600">
                        {request.totalAmount.toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(((request.budget.used + request.totalAmount) / request.budget.total) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Onaylanırsa %{(((request.budget.used + request.totalAmount) / request.budget.total) * 100).toFixed(1)}{' '}
                      kullanılmış olacak
                    </p>
                    {request.budget.used + request.totalAmount > request.budget.total && (
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        ⚠️ Bütçe aşımı!
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">
                  Bütçe bilgisi mevcut değil
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Bilgi</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ürün Sayısı</span>
                  <span className="font-medium">{request.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ortalama Birim</span>
                  <span className="font-medium">
                    {(request.totalAmount / request.items.reduce((sum, item) => sum + item.quantity, 0) || 0).toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </span>
                </div>
                {request.requiredDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kalan Gün</span>
                    <span className={`font-medium ${
                      Math.ceil((new Date(request.requiredDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) < 3
                        ? 'text-red-600'
                        : 'text-gray-900'
                    }`}>
                      {Math.ceil((new Date(request.requiredDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} gün
                    </span>
                  </div>
                )}
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
              disabled={submitting}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              İptal
            </button>
            <button
              onClick={handleApprove}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Onaylanıyor...' : 'Onayla'}
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
              {request.totalAmount.toLocaleString('tr-TR', {
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
              disabled={submitting}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              İptal
            </button>
            <button
              onClick={handleReject}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Reddediliyor...' : 'Reddet'}
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
              {request.totalAmount.toLocaleString('tr-TR', {
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

      {/* Return Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Talebi İade Et"
        footer={
          <>
            <button
              onClick={() => setIsReturnModalOpen(false)}
              disabled={submitting}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              İptal
            </button>
            <button
              onClick={handleReturn}
              disabled={submitting}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'İade Ediliyor...' : 'İade Et'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bu talebi düzeltme için talep edene iade etmek istediğinize emin misiniz?
          </p>

          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Talep No:</strong> {request.requestNumber}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Tutar:</strong>{' '}
              {request.totalAmount.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
              })}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İade Nedeni * <span className="text-red-500">(Zorunlu)</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              placeholder="Lütfen iade nedenini açıklayın (eksik bilgi, hatalı miktar vb.)..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
