'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { FileText } from 'lucide-react'

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>
          <p className="text-gray-600 mt-1">Satın alma ve bütçe raporlarını görüntüleyin</p>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz rapor yok</h3>
          <p className="text-gray-600">
            Yeterli veri toplandığında raporlar burada görüntülenecektir.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
