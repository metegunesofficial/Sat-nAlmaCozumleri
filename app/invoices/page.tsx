'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import {
  FileText,
  Download,
  Eye,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  orderId: string
  orderNumber: string
  supplierName: string
  amount: number
  taxAmount: number
  totalAmount: number
  status: string
  dueDate: string
  createdAt: string
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-0001',
    orderId: '1',
    orderNumber: 'ORD-2024-0010',
    supplierName: 'ABC Teknoloji Ltd.',
    amount: 25000,
    taxAmount: 4500,
    totalAmount: 29500,
    status: 'PAID',
    dueDate: '2024-02-15',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-0002',
    orderId: '2',
    orderNumber: 'ORD-2024-0011',
    supplierName: 'XYZ Ofis Malzemeleri',
    amount: 8500,
    taxAmount: 1530,
    totalAmount: 10030,
    status: 'PENDING',
    dueDate: '2024-02-20',
    createdAt: '2024-01-18'
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-0003',
    orderId: '3',
    orderNumber: 'ORD-2024-0012',
    supplierName: 'Mobilya Dünyası',
    amount: 45000,
    taxAmount: 8100,
    totalAmount: 53100,
    status: 'OVERDUE',
    dueDate: '2024-01-10',
    createdAt: '2024-01-05'
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-0004',
    orderId: '4',
    orderNumber: 'ORD-2024-0013',
    supplierName: 'Yazılım A.Ş.',
    amount: 12000,
    taxAmount: 2160,
    totalAmount: 14160,
    status: 'PENDING',
    dueDate: '2024-02-28',
    createdAt: '2024-01-20'
  }
]

const statusColors: Record<string, string> = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}

const statusLabels: Record<string, string> = {
  PAID: 'Ödendi',
  PENDING: 'Bekliyor',
  OVERDUE: 'Gecikmiş',
  CANCELLED: 'İptal',
}

export default function InvoicesPage() {
  const [invoices] = useState<Invoice[]>(mockInvoices)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Fatura No',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      ),
    },
    {
      key: 'orderNumber',
      label: 'Sipariş No',
      render: (value: string) => (
        <span className="font-mono text-sm text-gray-600">{value}</span>
      ),
    },
    {
      key: 'supplierName',
      label: 'Tedarikçi',
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
      key: 'status',
      label: 'Durum',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value]}`}>
          {statusLabels[value]}
        </span>
      ),
    },
    {
      key: 'dueDate',
      label: 'Vade Tarihi',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('tr-TR'),
    },
  ]

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsModalOpen(true)
  }

  // Stats
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const paidAmount = invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.totalAmount, 0)
  const pendingAmount = invoices.filter(inv => inv.status === 'PENDING').reduce((sum, inv) => sum + inv.totalAmount, 0)
  const overdueAmount = invoices.filter(inv => inv.status === 'OVERDUE').reduce((sum, inv) => sum + inv.totalAmount, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faturalar</h1>
          <p className="text-gray-600 mt-1">Fatura yönetimi ve takibi</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam</p>
                <p className="text-xl font-bold">
                  {totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ödenen</p>
                <p className="text-xl font-bold">
                  {paidAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bekleyen</p>
                <p className="text-xl font-bold">
                  {pendingAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Gecikmiş</p>
                <p className="text-xl font-bold">
                  {overdueAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <DataTable
            data={invoices}
            columns={columns}
            searchable
            searchPlaceholder="Fatura ara..."
            onRowClick={handleView}
          />
        </div>
      </div>

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedInvoice(null)
        }}
        title="Fatura Detayı"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Kapat
            </button>
            <button
              onClick={() => alert('PDF indiriliyor...')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <Download size={18} />
              PDF İndir
            </button>
          </>
        }
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Fatura No</p>
                <p className="font-mono font-bold text-lg">{selectedInvoice.invoiceNumber}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[selectedInvoice.status]}`}>
                {statusLabels[selectedInvoice.status]}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Sipariş No</p>
                <p className="font-mono">{selectedInvoice.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tedarikçi</p>
                <p className="font-medium">{selectedInvoice.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fatura Tarihi</p>
                <p>{new Date(selectedInvoice.createdAt).toLocaleDateString('tr-TR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vade Tarihi</p>
                <p>{new Date(selectedInvoice.dueDate).toLocaleDateString('tr-TR')}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span>{selectedInvoice.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">KDV (%18)</span>
                  <span>{selectedInvoice.taxAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 font-bold">
                  <span>Genel Toplam</span>
                  <span className="text-blue-600">
                    {selectedInvoice.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
