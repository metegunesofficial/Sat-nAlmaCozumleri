'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Users,
  Search,
  Filter,
  Mail,
  Building2,
  Shield,
  Eye,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { users as allUsers, findCompanyById } from '@/lib/seedData'

export default function UsersManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterCompany, setFilterCompany] = useState<string>('all')

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
    }
  }, [user, router])

  if (!user || user.role !== 'SUPER_ADMIN') {
    return null
  }

  // Filter users (exclude super admin itself)
  const filteredUsers = allUsers
    .filter(u => u.role !== 'SUPER_ADMIN')
    .filter(u => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.companyName?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = filterRole === 'all' || u.role === filterRole
      const matchesCompany = filterCompany === 'all' || u.companyId === filterCompany

      return matchesSearch && matchesRole && matchesCompany
    })

  // Get unique companies
  const companies = Array.from(new Set(allUsers.map(u => u.companyId)))
    .filter(Boolean)
    .map(id => {
      const company = findCompanyById(id!)
      return { id: id!, name: company?.name || 'Unknown' }
    })

  // Role colors
  const roleColors: Record<string, string> = {
    COMPANY_ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    FINANCE_MANAGER: 'bg-blue-100 text-blue-800 border-blue-200',
    DEPARTMENT_MANAGER: 'bg-green-100 text-green-800 border-green-200',
    EMPLOYEE: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  const roleLabels: Record<string, string> = {
    COMPANY_ADMIN: 'Sirket Yoneticisi',
    FINANCE_MANAGER: 'Finans Muduru',
    DEPARTMENT_MANAGER: 'Departman Muduru',
    EMPLOYEE: 'Calisan',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kullanici Yonetimi</h1>
            <p className="text-gray-600 mt-1">Tum kullanicilari goruntule ve yonet</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Toplam Kullanici</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {allUsers.filter(u => u.role !== 'SUPER_ADMIN').length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Sirket Yoneticileri</div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              {allUsers.filter(u => u.role === 'COMPANY_ADMIN').length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Mudurler</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {allUsers.filter(u => u.role === 'FINANCE_MANAGER' || u.role === 'DEPARTMENT_MANAGER').length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Calisanlar</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {allUsers.filter(u => u.role === 'EMPLOYEE').length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Kullanici ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="all">Tum Roller</option>
                <option value="COMPANY_ADMIN">Sirket Yoneticisi</option>
                <option value="FINANCE_MANAGER">Finans Muduru</option>
                <option value="DEPARTMENT_MANAGER">Departman Muduru</option>
                <option value="EMPLOYEE">Calisan</option>
              </select>
            </div>

            {/* Company Filter */}
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="all">Tum Sirketler</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanici
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sirket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pozisyon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayit Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Islemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userData) => (
                  <tr key={userData.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="text-blue-600" size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail size={12} />
                            {userData.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">{userData.companyName}</div>
                          {userData.departmentName && (
                            <div className="text-xs text-gray-500">{userData.departmentName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${roleColors[userData.role] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                        {roleLabels[userData.role] || userData.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userData.position || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(userData.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/super-admin/companies/${userData.companyId}`}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Eye size={16} />
                          Goruntule
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Kullanici Bulunamadi</h3>
            <p className="text-gray-600 mb-4">Arama kriterlerinize uygun kullanici bulunamadi.</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterRole('all')
                setFilterCompany('all')
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
