'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import Modal from '@/components/Modal'
import {
  FileText,
  Image,
  File,
  Download,
  Eye,
  Trash2,
  Upload,
  Search,
  Filter,
  FolderOpen
} from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  size: number
  entityType: string
  entityId: string
  entityName: string
  uploadedBy: string
  createdAt: string
  url: string
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'fatura-2024-001.pdf',
    type: 'application/pdf',
    size: 245000,
    entityType: 'INVOICE',
    entityId: 'INV-2024-0001',
    entityName: 'Fatura INV-2024-0001',
    uploadedBy: 'Ahmet Yılmaz',
    createdAt: '2024-01-15T10:30:00',
    url: '#'
  },
  {
    id: '2',
    name: 'teknik-sartname.docx',
    type: 'application/docx',
    size: 128000,
    entityType: 'REQUEST',
    entityId: 'PR-2024-0015',
    entityName: 'Talep PR-2024-0015',
    uploadedBy: 'Mehmet Demir',
    createdAt: '2024-01-14T14:20:00',
    url: '#'
  },
  {
    id: '3',
    name: 'urun-fotografi.jpg',
    type: 'image/jpeg',
    size: 1250000,
    entityType: 'PRODUCT',
    entityId: 'PRD-100',
    entityName: 'Laptop Dell XPS 15',
    uploadedBy: 'Ayşe Kaya',
    createdAt: '2024-01-13T09:15:00',
    url: '#'
  },
  {
    id: '4',
    name: 'sozlesme.pdf',
    type: 'application/pdf',
    size: 520000,
    entityType: 'SUPPLIER',
    entityId: 'SUP-001',
    entityName: 'ABC Teknoloji Ltd.',
    uploadedBy: 'Fatma Öz',
    createdAt: '2024-01-12T16:45:00',
    url: '#'
  },
  {
    id: '5',
    name: 'teklif-formu.xlsx',
    type: 'application/xlsx',
    size: 85000,
    entityType: 'REQUEST',
    entityId: 'PR-2024-0014',
    entityName: 'Talep PR-2024-0014',
    uploadedBy: 'Ahmet Yılmaz',
    createdAt: '2024-01-11T11:30:00',
    url: '#'
  }
]

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return <FileText className="text-red-500" size={24} />
  if (type.includes('image')) return <Image className="text-green-500" size={24} />
  if (type.includes('doc')) return <FileText className="text-blue-500" size={24} />
  if (type.includes('xls')) return <FileText className="text-green-600" size={24} />
  return <File className="text-gray-500" size={24} />
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const entityTypeLabels: Record<string, string> = {
  REQUEST: 'Talep',
  ORDER: 'Sipariş',
  INVOICE: 'Fatura',
  PRODUCT: 'Ürün',
  SUPPLIER: 'Tedarikçi',
}

export default function DocumentsPage() {
  const [documents] = useState<Document[]>(mockDocuments)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.entityName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || doc.entityType === filterType
    return matchesSearch && matchesFilter
  })

  const handlePreview = (doc: Document) => {
    setSelectedDoc(doc)
    setIsPreviewOpen(true)
  }

  const handleDownload = (doc: Document) => {
    alert(`İndiriliyor: ${doc.name}`)
  }

  const handleDelete = (id: string) => {
    if (confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
      alert('Dosya silindi')
    }
  }

  // Stats
  const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0)
  const pdfCount = documents.filter(doc => doc.type.includes('pdf')).length
  const imageCount = documents.filter(doc => doc.type.includes('image')).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dokümanlar</h1>
            <p className="text-gray-600 mt-1">Dosya ve ekleri yönetin</p>
          </div>
          <button
            onClick={() => alert('Dosya yükleme modal açılacak')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Upload size={20} />
            Dosya Yükle
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderOpen className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Dosya</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <File className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Boyut</p>
                <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">PDF Dosya</p>
                <p className="text-2xl font-bold">{pdfCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Image className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Görsel</p>
                <p className="text-2xl font-bold">{imageCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Dosya ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Tipler</option>
              <option value="REQUEST">Talepler</option>
              <option value="ORDER">Siparişler</option>
              <option value="INVOICE">Faturalar</option>
              <option value="PRODUCT">Ürünler</option>
              <option value="SUPPLIER">Tedarikçiler</option>
            </select>
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-600 mt-4">Dosya bulunamadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate" title={doc.name}>{doc.name}</h3>
                    <p className="text-sm text-gray-500">{formatFileSize(doc.size)}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="px-2 py-0.5 bg-gray-100 rounded">
                      {entityTypeLabels[doc.entityType]}
                    </span>
                    <span>{doc.entityId}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {doc.uploadedBy} • {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => handlePreview(doc)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Eye size={16} />
                    Önizle
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded"
                  >
                    <Download size={16} />
                    İndir
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false)
          setSelectedDoc(null)
        }}
        title="Dosya Önizleme"
        footer={
          <>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Kapat
            </button>
            {selectedDoc && (
              <button
                onClick={() => handleDownload(selectedDoc)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <Download size={18} />
                İndir
              </button>
            )}
          </>
        }
      >
        {selectedDoc && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                {getFileIcon(selectedDoc.type)}
              </div>
              <div>
                <h3 className="font-medium">{selectedDoc.name}</h3>
                <p className="text-sm text-gray-500">{formatFileSize(selectedDoc.size)}</p>
              </div>
            </div>

            <div className="border rounded-lg p-8 bg-gray-50 text-center">
              {selectedDoc.type.includes('image') ? (
                <div className="text-gray-500">
                  <Image className="mx-auto mb-2" size={48} />
                  <p>Görsel önizleme</p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <FileText className="mx-auto mb-2" size={48} />
                  <p>Önizleme bu dosya türü için desteklenmiyor</p>
                  <p className="text-sm mt-1">Dosyayı indirerek görüntüleyebilirsiniz</p>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600">
              <p><strong>İlişkili:</strong> {selectedDoc.entityName}</p>
              <p><strong>Yükleyen:</strong> {selectedDoc.uploadedBy}</p>
              <p><strong>Tarih:</strong> {new Date(selectedDoc.createdAt).toLocaleString('tr-TR')}</p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
