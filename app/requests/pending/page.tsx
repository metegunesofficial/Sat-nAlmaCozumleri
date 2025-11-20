'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import { purchaseRequestsApi } from '@/lib/api'
import {
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  MessageSquare,
} from 'lucide-react'

interface PurchaseRequest {
  id: string
  requestNumber: string
  title: string
  description?: string
  status: string
  priority: string
  estimatedTotal: number
  requester: {
    name: string
    department?: { name: string }
  }
  department: { name: string }
  createdAt: string
  currentStep: number
}

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

export default function PendingRequestsPage() {
  const { user, isAuthenticated } = useAuth()
  const { success, error } = useNotification()
  const router = useRouter()

  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalComment, setApprovalComment] = useState('')
  const [approving, setApproving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchPendingRequests()
  }, [isAuthenticated])

  async function fetchPendingRequests() {
    try {
      setLoading(true)
      const response = await purchaseRequestsApi.getAll({ status: 'SUBMITTED' })
      if (response.success) {
        // Filter for requests that need current user's approval
        const pendingForUser = response.data.filter((req: PurchaseRequest) => {
          // DEPARTMENT_MANAGER sees their department's requests
          if (user?.role === 'DEPARTMENT_MANAGER') {
            return req.department?.name === user.departmentName
          }
          // PROCUREMENT_MANAGER and FINANCE_MANAGER see all submitted requests
          if (['PROCUREMENT_MANAGER', 'FINANCE_MANAGER', 'GENERAL_MANAGER', 'COMPANY_ADMIN'].includes(user?.role || '')) {
            return true
          }
          return false
        })
        setRequests(pendingForUser)
      }
    } catch (err) {
      console.error('Error fetching requests:', err)
      error('Talepler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(action: 'APPROVED' | 'REJECTED' | 'RETURNED') {
    if (!selectedRequest) return

    setApproving(true)
    try {
      const response = await purchaseRequestsApi.approve(selectedRequest.id, {
        action,
        comments: approvalComment,
      })

      if (response.success) {
        const actionLabels = {
          APPROVED: 'onaylandı',
          REJECTED: 'reddedildi',
          RETURNED: 'iade edildi',
        }
        success(`Talep ${actionLabels[action]}`)
        setShowApprovalModal(false)
        setSelectedRequest(null)
        setApprovalComment('')
        fetchPendingRequests()
      } else {
        error(response.error || 'İşlem başarısız')
      }
    } catch (err) {
      error('İşlem sırasında hata oluştu')
    } finally {
      setApproving(false)
    }
  }

  const columns = [
    {
      key: 'requestNumber',
      label: 'Talep No',
      sortable: true,
      render: (value: string, row: PurchaseRequest) => (
        <Link
          href={`/requests/${row.id}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {value}
        </Link>
      ),
    },
    {
      key: 'title',
      label: 'Başlık',
      sortable: true,
    },
    {
      key: 'requester',
      label: 'Talep Eden',
      render: (value: any) => (
        <div>
          <div className="font-medium">{value?.name}</div>
          <div className="text-xs text-gray-500">{value?.department?.name}</div>
        </div>
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
      key: 'estimatedTotal',
      label: 'Tutar',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold">
          {value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Tarih',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('tr-TR'),
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (_: any, row: PurchaseRequest) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/requests/${row.id}`)}
            className="p-1 text-gray-500 hover:text-blue-600"
            title="Detay"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => {
              setSelectedRequest(row)
              setShowApprovalModal(true)
            }}
            className="p-1 text-gray-500 hover:text-green-600"
            title="Onayla/Reddet"
          >
            <CheckCircle size={18} />
          </button>
        </div>
      ),
    },
  ]

  // Check if user has approval permissions
  const canApprove = ['DEPARTMENT_MANAGER', 'PROCUREMENT_MANAGER', 'FINANCE_MANAGER', 'GENERAL_MANAGER', 'COMPANY_ADMIN', 'SUPER_ADMIN'].includes(user?.role || '')

  if (!canApprove) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Clock size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erişim Yetkiniz Yok</h2>
          <p className="text-gray-600">Onay işlemleri için yeterli yetkiniz bulunmamaktadır.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bekleyen Onaylar</h1>
            <p className="text-gray-600 mt-1">Onayınızı bekleyen satın alma talepleri</p>
          </div>
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium">
            {requests.length} talep bekliyor
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Bekleyen Talep Yok</h2>
            <p className="text-gray-600">Onayınızı bekleyen satın alma talebi bulunmamaktadır.</p>
          </div>
        ) : (
          <DataTable
            data={requests}
            columns={columns}
            searchable
            searchPlaceholder="Talep ara..."
          />
        )}

        {/* Approval Modal */}
        <Modal
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false)
            setSelectedRequest(null)
            setApprovalComment('')
          }}
          title={`Talep Onayı - ${selectedRequest?.requestNumber}`}
          size="lg"
        >
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900">{selectedRequest.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedRequest.description}</p>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="text-gray-500">Talep Eden: {selectedRequest.requester?.name}</span>
                  <span className="font-semibold text-blue-600">
                    {selectedRequest.estimatedTotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare size={16} className="inline mr-1" />
                  Yorum (Opsiyonel)
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Onay veya red sebebi..."
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <button
                  onClick={() => handleApprove('APPROVED')}
                  disabled={approving}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  Onayla
                </button>
                <button
                  onClick={() => handleApprove('RETURNED')}
                  disabled={approving}
                  className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                >
                  <RotateCcw size={18} />
                  İade Et
                </button>
                <button
                  onClick={() => handleApprove('REJECTED')}
                  disabled={approving}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle size={18} />
                  Reddet
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}
