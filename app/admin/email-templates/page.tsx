'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import Modal from '@/components/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import {
  Mail,
  Edit2,
  Eye,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingCart,
  AlertTriangle,
  Save
} from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  description: string
  type: string
  isActive: boolean
  lastModified: string
}

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Talep Onaylandı',
    subject: 'Satın Alma Talebiniz Onaylandı - {{requestNumber}}',
    description: 'Satın alma talebi onaylandığında gönderilir',
    type: 'REQUEST_APPROVED',
    isActive: true,
    lastModified: '2024-01-15'
  },
  {
    id: '2',
    name: 'Talep Reddedildi',
    subject: 'Satın Alma Talebiniz Reddedildi - {{requestNumber}}',
    description: 'Satın alma talebi reddedildiğinde gönderilir',
    type: 'REQUEST_REJECTED',
    isActive: true,
    lastModified: '2024-01-14'
  },
  {
    id: '3',
    name: 'Onay Bekliyor',
    subject: 'Onayınızı Bekleyen Talep - {{requestNumber}}',
    description: 'Yeni bir talep onay için beklerken yöneticiye gönderilir',
    type: 'APPROVAL_PENDING',
    isActive: true,
    lastModified: '2024-01-13'
  },
  {
    id: '4',
    name: 'Sipariş Oluşturuldu',
    subject: 'Siparişiniz Oluşturuldu - {{orderNumber}}',
    description: 'Yeni sipariş oluşturulduğunda gönderilir',
    type: 'ORDER_CREATED',
    isActive: true,
    lastModified: '2024-01-12'
  },
  {
    id: '5',
    name: 'Sipariş Kargoda',
    subject: 'Siparişiniz Kargoya Verildi - {{orderNumber}}',
    description: 'Sipariş kargoya verildiğinde gönderilir',
    type: 'ORDER_SHIPPED',
    isActive: true,
    lastModified: '2024-01-11'
  },
  {
    id: '6',
    name: 'Bütçe Uyarısı',
    subject: 'Bütçe Uyarısı - {{departmentName}}',
    description: 'Departman bütçesi %80\'i aştığında gönderilir',
    type: 'BUDGET_WARNING',
    isActive: true,
    lastModified: '2024-01-10'
  },
  {
    id: '7',
    name: 'Hoş Geldiniz',
    subject: 'Attelia Dental B2B\'ye Hoş Geldiniz',
    description: 'Yeni kullanıcı kaydında gönderilir',
    type: 'WELCOME',
    isActive: true,
    lastModified: '2024-01-09'
  },
  {
    id: '8',
    name: 'Şifre Sıfırlama',
    subject: 'Şifre Sıfırlama Talebi',
    description: 'Şifre sıfırlama talep edildiğinde gönderilir',
    type: 'PASSWORD_RESET',
    isActive: false,
    lastModified: '2024-01-08'
  }
]

const typeIcons: Record<string, any> = {
  REQUEST_APPROVED: CheckCircle,
  REQUEST_REJECTED: XCircle,
  APPROVAL_PENDING: Clock,
  ORDER_CREATED: ShoppingCart,
  ORDER_SHIPPED: ShoppingCart,
  BUDGET_WARNING: AlertTriangle,
  WELCOME: Mail,
  PASSWORD_RESET: Mail,
}

const typeColors: Record<string, string> = {
  REQUEST_APPROVED: 'bg-green-100 text-green-600',
  REQUEST_REJECTED: 'bg-red-100 text-red-600',
  APPROVAL_PENDING: 'bg-yellow-100 text-yellow-600',
  ORDER_CREATED: 'bg-blue-100 text-blue-600',
  ORDER_SHIPPED: 'bg-purple-100 text-purple-600',
  BUDGET_WARNING: 'bg-orange-100 text-orange-600',
  WELCOME: 'bg-teal-100 text-teal-600',
  PASSWORD_RESET: 'bg-gray-100 text-gray-600',
}

export default function EmailTemplatesPage() {
  const { success } = useNotification()
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    subject: '',
    body: ''
  })

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setEditForm({
      subject: template.subject,
      body: `Sayın {{userName}},\n\n${template.description}\n\nTalep No: {{requestNumber}}\nTarih: {{date}}\n\nDetaylar için sisteme giriş yapabilirsiniz.\n\nSaygılarımızla,\nAttelia Dental B2B`
    })
    setIsEditModalOpen(true)
  }

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setIsPreviewModalOpen(true)
  }

  const handleSave = () => {
    success('Şablon kaydedildi')
    setIsEditModalOpen(false)
  }

  const handleToggleStatus = (id: string) => {
    setTemplates(templates.map(t =>
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ))
    success('Şablon durumu güncellendi')
  }

  const handleTestEmail = (template: EmailTemplate) => {
    success(`Test e-postası gönderildi: ${template.name}`)
  }

  // Stats
  const activeCount = templates.filter(t => t.isActive).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Şablonları</h1>
          <p className="text-gray-600 mt-1">Bildirim email şablonlarını yönetin</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Şablon</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktif</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <XCircle className="text-gray-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pasif</p>
                <p className="text-2xl font-bold">{templates.length - activeCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Templates List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="divide-y divide-gray-200">
            {templates.map((template) => {
              const Icon = typeIcons[template.type] || Mail
              return (
                <div key={template.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${typeColors[template.type]}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{template.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {template.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{template.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Son güncelleme: {new Date(template.lastModified).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreview(template)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Önizle"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                        title="Düzenle"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleTestEmail(template)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                        title="Test Gönder"
                      >
                        <Send size={18} />
                      </button>
                      <label className="relative inline-flex items-center cursor-pointer ml-2">
                        <input
                          type="checkbox"
                          checked={template.isActive}
                          onChange={() => handleToggleStatus(template.id)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Şablon Düzenle: ${selectedTemplate?.name}`}
        footer={
          <>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <Save size={18} />
              Kaydet
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
            <input
              type="text"
              value={editForm.subject}
              onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İçerik</label>
            <textarea
              value={editForm.body}
              onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
              rows={10}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-blue-900 mb-1">Kullanılabilir Değişkenler:</p>
            <p className="text-blue-700">
              {'{{userName}}, {{requestNumber}}, {{orderNumber}}, {{date}}, {{amount}}, {{departmentName}}'}
            </p>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Email Önizleme"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm text-gray-500">Konu:</p>
              <p className="font-medium">{selectedTemplate.subject.replace('{{requestNumber}}', 'PR-2024-0015')}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="whitespace-pre-line text-sm">
                Sayın Ahmet Yılmaz,
                {'\n\n'}
                {selectedTemplate.description}
                {'\n\n'}
                Talep No: PR-2024-0015{'\n'}
                Tarih: {new Date().toLocaleDateString('tr-TR')}
                {'\n\n'}
                Detaylar için sisteme giriş yapabilirsiniz.
                {'\n\n'}
                Saygılarımızla,{'\n'}
                Attelia Dental B2B
              </p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
