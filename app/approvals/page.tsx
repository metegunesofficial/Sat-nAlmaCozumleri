'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { useAuth } from '@/contexts/AuthContext'
import { purchaseRequestsApi } from '@/lib/api'
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  DollarSign,
  AlertTriangle
} from 'lucide-react'

interface PurchaseRequest {
  id: string
  requestNumber: string
  title: string
  description?: string
  totalAmount: number
  status: string
  priority: string
  requiredDate?: string
  createdAt: string
  user: { name: string; email: string }
  department?: { name: string }
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
}

const priorityLabels: Record<string, string> = {
  LOW: 'Düşük',
  MEDIUM: 'Normal',
  HIGH: 'Yüksek',
  URGENT: 'Acil',
}

export default function ApprovalsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { success, error } = useNotification()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'return' | null>(null)
  const [comment, setComment] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadPendingRequests()
  }, [])

  const loadPendingRequests = async () => {
    try {
      const response = await purchaseRequestsApi.getAll({ status: 'PENDING,IN_REVIEW' })
      if (response.success) {
        setRequests(response.data || [])
      }
    } catch (err) {
      console.error('Talepler yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'requestNumber',
      label: 'Talep No',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      ),
    },
    {
      key: 'title',
      label: 'Başlık',
      sortable: true,
      render: (value: string, row: PurchaseRequest) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">{row.user.name}</div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Departman',
      render: (value: any) => value?.name || '-',
    },
    {
      key: 'totalAmount',
      label: 'Tutar',
      sortable: true,
      render: (value: number) => (
        <span className="font-medium">
          {value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </span>
      ),
    },
    {
      key: 'priority',
      label: 'Öncelik',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[value]}`}>
          {priorityLabels[value]}
        </span>
      ),
    },
    {
      key: 'requiredDate',
      label: 'Gerekli Tarih',
      render: (value: string) => value ? new Date(value).toLocaleDateString('tr-TR') : '-',
    },
    {
      key: 'createdAt',
      label: 'Oluşturulma',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('tr-TR'),
    },
  ]

  const handleAction = (request: PurchaseRequest, type: 'approve' | 'reject' | 'return') => {
    setSelectedRequest(request)
    setActionType(type)
    setComment('')
  }

  const handleSubmitAction = async () => {
    if (!selectedRequest || !actionType) return

    setProcessing(true)
    try {
      let response
      if (actionType === 'approve') {
        response = await purchaseRequestsApi.approve(selectedRequest.id, comment)
      } else if (actionType === 'reject') {
        response = await purchaseRequestsApi.reject(selectedRequest.id, comment)
      } else {
        response = await purchaseRequestsApi.return(selectedRequest.id, comment)
      }

      if (response.success) {
        success(
          actionType === 'approve' ? 'Talep onaylandı' :
          actionType === 'reject' ? 'Talep reddedildi' : 'Talep iade edildi'
        )
        loadPendingRequests()
      } else {
        error(response.error || 'İşlem başarısız')
      }
    } catch (err) {
      error('İşlem sırasında hata oluştu')
    } finally {
      setProcessing(false)
      setSelectedRequest(null)
      setActionType(null)
    }
  }

  // Stats
  const totalRequests = requests.length
  const urgentRequests = requests.filter(r => r.priority === 'URGENT').length
  const totalAmount = requests.reduce((sum, r) => sum + r.totalAmount, 0)

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
          <h1 className="text-3xl font-bold text-gray-900">Bekleyen Onaylar</h1>
          <p className="text-gray-600 mt-1">Onay bekleyen satın alma talepleri</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bekleyen Talep</p>
                <p className="text-2xl font-bold">{totalRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Acil Talep</p>
                <p className="text-2xl font-bold">{urgentRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Tutar</p>
                <p className="text-2xl font-bold">
                  {totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-600 mt-4">Bekleyen onay bulunmuyor</p>
            </div>
          ) : (
            <>
              <DataTable
                data={requests}
                columns={columns}
                searchable
                searchPlaceholder="Talep ara..."
                onRowClick={(row) => router.push(`/requests/${row.id}`)}
              />

              {/* Quick Actions */}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Hızlı İşlemler</h3>
                <div className="space-y-2">
                  {requests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{request.requestNumber}</span>
                        <span className="text-gray-500 mx-2">-</span>
                        <span className="text-sm text-gray-600">{request.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(request, 'approve')}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                          title="Onayla"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleAction(request, 'return')}
                          className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded"
                          title="İade Et"
                        >
                          <RotateCcw size={20} />
                        </button>
                        <button
                          onClick={() => handleAction(request, 'reject')}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                          title="Reddet"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={!!actionType}
        onClose={() => {
          setSelectedRequest(null)
          setActionType(null)
        }}
        title={
          actionType === 'approve' ? 'Talebi Onayla' :
          actionType === 'reject' ? 'Talebi Reddet' : 'Talebi İade Et'
        }
        footer={
          <>
            <button
              onClick={() => {
                setSelectedRequest(null)
                setActionType(null)
              }}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={handleSubmitAction}
              disabled={processing}
              className={`px-6 py-2 rounded-lg font-medium text-white ${
                actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                'bg-yellow-600 hover:bg-yellow-700'
              } disabled:opacity-50`}
            >
              {processing ? 'İşleniyor...' :
                actionType === 'approve' ? 'Onayla' :
                actionType === 'reject' ? 'Reddet' : 'İade Et'
              }
            </button>
          </>
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Talep No</p>
              <p className="font-mono font-medium">{selectedRequest.requestNumber}</p>
              <p className="text-sm text-gray-600 mt-2">Başlık</p>
              <p className="font-medium">{selectedRequest.title}</p>
              <p className="text-sm text-gray-600 mt-2">Tutar</p>
              <p className="font-bold text-blue-600">
                {selectedRequest.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yorum {actionType !== 'approve' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  actionType === 'approve' ? 'Onay yorumu (isteğe bağlı)...' :
                  actionType === 'reject' ? 'Red sebebi...' :
                  'İade sebebi...'
                }
              />
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
