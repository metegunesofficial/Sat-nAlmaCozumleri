'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import Modal from '@/components/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { Plus, Edit, Trash2, Settings, ChevronRight } from 'lucide-react'

const mockWorkflows = [
  {
    id: 'w1',
    name: 'Standart Onay (0-10K TL)',
    minAmount: 0,
    maxAmount: 10000,
    isActive: true,
    steps: [
      { order: 0, approverRole: 'DEPARTMENT_MANAGER', name: 'Departman Müdürü' },
    ],
  },
  {
    id: 'w2',
    name: 'Orta Seviye Onay (10-50K TL)',
    minAmount: 10000,
    maxAmount: 50000,
    isActive: true,
    steps: [
      { order: 0, approverRole: 'DEPARTMENT_MANAGER', name: 'Departman Müdürü' },
      { order: 1, approverRole: 'FINANCE_MANAGER', name: 'Finans Müdürü' },
    ],
  },
  {
    id: 'w3',
    name: 'Üst Düzey Onay (50K+ TL)',
    minAmount: 50000,
    maxAmount: null,
    isActive: true,
    steps: [
      { order: 0, approverRole: 'DEPARTMENT_MANAGER', name: 'Departman Müdürü' },
      { order: 1, approverRole: 'FINANCE_MANAGER', name: 'Finans Müdürü' },
      { order: 2, approverRole: 'GENERAL_MANAGER', name: 'Genel Müdür' },
    ],
  },
]

const roles = [
  { value: 'DEPARTMENT_MANAGER', label: 'Departman Müdürü' },
  { value: 'FINANCE_MANAGER', label: 'Finans Müdürü' },
  { value: 'GENERAL_MANAGER', label: 'Genel Müdür' },
  { value: 'PROCUREMENT_MANAGER', label: 'Satın Alma Müdürü' },
  { value: 'COMPANY_ADMIN', label: 'Şirket Yöneticisi' },
]

export default function WorkflowsPage() {
  const { success, error } = useNotification()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    minAmount: '',
    maxAmount: '',
    isActive: true,
    steps: [{ approverRole: 'DEPARTMENT_MANAGER' }],
  })

  const openCreateModal = () => {
    setEditingWorkflow(null)
    setFormData({
      name: '',
      minAmount: '',
      maxAmount: '',
      isActive: true,
      steps: [{ approverRole: 'DEPARTMENT_MANAGER' }],
    })
    setIsModalOpen(true)
  }

  const openEditModal = (workflow: any) => {
    setEditingWorkflow(workflow)
    setFormData({
      name: workflow.name,
      minAmount: workflow.minAmount.toString(),
      maxAmount: workflow.maxAmount?.toString() || '',
      isActive: workflow.isActive,
      steps: workflow.steps.map((s: any) => ({ approverRole: s.approverRole })),
    })
    setIsModalOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.minAmount || formData.steps.length === 0) {
      error('Lütfen tüm gerekli alanları doldurun')
      return
    }
    if (editingWorkflow) {
      success('İş akışı güncellendi!')
    } else {
      success('İş akışı eklendi!')
    }
    setIsModalOpen(false)
  }

  const handleDelete = (workflow: any) => {
    if (confirm(`${workflow.name} iş akışını silmek istediğinize emin misiniz?`)) {
      success('İş akışı silindi!')
    }
  }

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { approverRole: 'DEPARTMENT_MANAGER' }],
    })
  }

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index),
    })
  }

  const updateStep = (index: number, role: string) => {
    const newSteps = [...formData.steps]
    newSteps[index] = { approverRole: role }
    setFormData({ ...formData, steps: newSteps })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Onay İş Akışları</h1>
            <p className="text-gray-600 mt-1">Onay süreçlerini yapılandır</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Yeni İş Akışı Ekle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Settings className="text-blue-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{mockWorkflows.length}</p>
                <p className="text-sm text-gray-600">Toplam İş Akışı</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Settings className="text-green-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {mockWorkflows.filter((w) => w.isActive).length}
                </p>
                <p className="text-sm text-gray-600">Aktif İş Akışı</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Settings className="text-purple-600" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...mockWorkflows.map((w) => w.steps.length))}
                </p>
                <p className="text-sm text-gray-600">Maksimum Adım</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {mockWorkflows.map((workflow) => (
            <div key={workflow.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        workflow.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {workflow.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {workflow.minAmount.toLocaleString('tr-TR')} TL -{' '}
                    {workflow.maxAmount
                      ? `${workflow.maxAmount.toLocaleString('tr-TR')} TL`
                      : '∞'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(workflow)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(workflow)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Onay Adımları:</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {workflow.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{step.name}</span>
                      </div>
                      {idx < workflow.steps.length - 1 && (
                        <ChevronRight size={20} className="text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWorkflow ? 'İş Akışı Düzenle' : 'Yeni İş Akışı Ekle'}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {editingWorkflow ? 'Güncelle' : 'Ekle'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İş Akışı Adı *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: Standart Onay (0-10K TL)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Tutar (TL) *
              </label>
              <input
                type="number"
                value={formData.minAmount}
                onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maksimum Tutar (TL)
              </label>
              <input
                type="number"
                value={formData.maxAmount}
                onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                placeholder="Boş bırakılırsa sınırsız"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Bu iş akışını aktif et
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Onay Adımları *
              </label>
              <button
                type="button"
                onClick={addStep}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Adım Ekle
              </button>
            </div>

            <div className="space-y-2">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <select
                    value={step.approverRole}
                    onChange={(e) => updateStep(index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
