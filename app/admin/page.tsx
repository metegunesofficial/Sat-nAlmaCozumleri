'use client'

import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Link from 'next/link'
import { Package, GitBranch, Building2, Users, Briefcase, Settings } from 'lucide-react'

export default function AdminPage() {
  const adminModules = [
    {
      title: 'Ürün Yönetimi',
      description: 'Ürünleri ekle, düzenle ve sil',
      icon: Package,
      href: '/admin/products',
      color: 'blue' as const,
      count: 156,
    },
    {
      title: 'Kategori Yönetimi',
      description: 'Hiyerarşik kategori yapısını yönet',
      icon: GitBranch,
      href: '/admin/categories',
      color: 'green' as const,
      count: 24,
    },
    {
      title: 'Departman Yönetimi',
      description: 'Departmanları ve bütçeleri yönet',
      icon: Building2,
      href: '/admin/departments',
      color: 'purple' as const,
      count: 8,
    },
    {
      title: 'Kullanıcı Yönetimi',
      description: 'Kullanıcı hesaplarını ve rollerini yönet',
      icon: Users,
      href: '/admin/users',
      color: 'yellow' as const,
      count: 42,
    },
    {
      title: 'Tedarikçi Yönetimi',
      description: 'Tedarikçi bilgilerini yönet',
      icon: Briefcase,
      href: '/admin/suppliers',
      color: 'red' as const,
      count: 18,
    },
    {
      title: 'Onay İş Akışları',
      description: 'Onay süreçlerini yapılandır',
      icon: Settings,
      href: '/admin/workflows',
      color: 'blue' as const,
      count: 5,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yönetim Paneli</h1>
          <p className="text-gray-600 mt-1">Sistem ayarlarını ve verileri yönetin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module) => {
            const Icon = module.icon
            return (
              <Link
                key={module.href}
                href={module.href}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all hover:border-blue-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${
                      module.color === 'blue'
                        ? 'bg-blue-100 text-blue-600'
                        : module.color === 'green'
                        ? 'bg-green-100 text-green-600'
                        : module.color === 'purple'
                        ? 'bg-purple-100 text-purple-600'
                        : module.color === 'yellow'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    <Icon size={28} />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{module.count}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-sm text-gray-600">{module.description}</p>
              </Link>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sistem İstatistikleri</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Aktif Kullanıcılar</p>
              <p className="text-2xl font-bold text-blue-600">38</p>
              <p className="text-xs text-gray-500 mt-1">42 toplam kullanıcı</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Toplam Ürün</p>
              <p className="text-2xl font-bold text-green-600">156</p>
              <p className="text-xs text-gray-500 mt-1">24 kategoride</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Aktif Tedarikçi</p>
              <p className="text-2xl font-bold text-purple-600">18</p>
              <p className="text-xs text-gray-500 mt-1">20 toplam tedarikçi</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Onay İş Akışı</p>
              <p className="text-2xl font-bold text-yellow-600">5</p>
              <p className="text-xs text-gray-500 mt-1">3 aktif akış</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
