'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface Company {
  id: string
  name: string
  slug: string
  isActive: boolean
  isDemo: boolean
  createdAt: string
  _count: {
    users: number
    departments: number
    purchaseRequests: number
    products: number
  }
}

export default function DevAdminCompaniesPage() {
  const searchParams = useSearchParams()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [searchTerm, statusFilter])

  const fetchCompanies = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/admin/companies?${params}`)
      const data = await response.json()

      if (data.success) {
        setCompanies(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCompanyStatus = async (companyId: string) => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/toggle-status`, {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        fetchCompanies()
      }
    } catch (error) {
      console.error('Failed to toggle company status:', error)
    }
  }

  const deleteCompany = async (companyId: string, force = false) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return
    }

    try {
      const url = force
        ? `/api/admin/companies/${companyId}?force=true`
        : `/api/admin/companies/${companyId}`

      const response = await fetch(url, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!data.success && data.error?.includes('force=true')) {
        if (confirm(data.error + '\n\nProceed with deletion?')) {
          deleteCompany(companyId, true)
        }
      } else if (data.success || response.status === 204) {
        fetchCompanies()
      }
    } catch (error) {
      console.error('Failed to delete company:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading companies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Companies</h2>
          <p className="mt-1 text-gray-600">Manage all tenant companies</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          + Create Company
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or slug..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Companies</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Users</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Departments</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Requests</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Products</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500">{company.slug}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Created: {new Date(company.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        company.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {company.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {company.isDemo && (
                      <span className="inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                        Demo
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">{company._count.users}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">{company._count.departments}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">{company._count.purchaseRequests}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">{company._count.products}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleCompanyStatus(company.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      title={company.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {company.isActive ? '⏸️' : '▶️'}
                    </button>
                    <button
                      onClick={() => deleteCompany(company.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {companies.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No companies found
          </div>
        )}
      </div>

      {/* Create Company Modal */}
      {showCreateModal && (
        <CreateCompanyModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchCompanies()
          }}
        />
      )}
    </div>
  )
}

function CreateCompanyModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    website: '',
    industry: '',
    isActive: true,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        alert(data.error || 'Failed to create company')
      }
    } catch (error) {
      console.error('Failed to create company:', error)
      alert('Failed to create company')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Company</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug (URL identifier) *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                required
                pattern="[a-z0-9-]+"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">Lowercase letters, numbers, and hyphens only</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Active
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Company'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
