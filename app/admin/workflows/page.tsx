'use client';

/**
 * Workflow Management Page
 * List, create, edit, activate/deactivate, and delete visual workflows
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Copy,
  Search,
  Workflow,
  CheckCircle,
} from 'lucide-react';

interface WorkflowListItem {
  id: string;
  name: string;
  description: string | null;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function WorkflowsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Load workflows on mount
  useEffect(() => {
    loadWorkflows();
  }, [token]);

  const loadWorkflows = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch('/api/workflows/visual', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setWorkflows(data.data);
      } else {
        alert('Workflow listesi yüklenemedi');
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
      alert('Workflow listesi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Filter workflows
  const filteredWorkflows = workflows.filter((wf) => {
    const matchesSearch =
      wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wf.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && wf.isActive) ||
      (filterStatus === 'inactive' && !wf.isActive);

    return matchesSearch && matchesStatus;
  });

  // Handle create new workflow
  const handleCreate = () => {
    router.push('/admin/workflows/designer');
  };

  // Handle edit workflow
  const handleEdit = (id: string) => {
    router.push(`/admin/workflows/designer?id=${id}`);
  };

  // Handle toggle active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (!token) return;

    const action = currentStatus ? 'devre dışı bırakılsın' : 'aktif hale getirilsin';
    if (!confirm(`Bu workflow ${action} mı?`)) return;

    try {
      const response = await fetch(`/api/workflows/visual/${id}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();
      if (data.success) {
        // Reload workflows
        await loadWorkflows();
      } else {
        alert(data.message || 'Durum değiştirilemedi');
      }
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
      alert('İşlem başarısız oldu');
    }
  };

  // Handle delete workflow
  const handleDelete = async (id: string, isActive: boolean) => {
    if (!token) return;

    if (isActive) {
      alert('Aktif workflow silinemez. Önce devre dışı bırakın.');
      return;
    }

    if (!confirm('Bu workflow silinsin mi? Bu işlem geri alınamaz.')) return;

    try {
      const response = await fetch(`/api/workflows/visual/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Reload workflows
        await loadWorkflows();
      } else {
        alert(data.message || 'Workflow silinemedi');
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      alert('Silme işlemi başarısız oldu');
    }
  };

  // Handle duplicate workflow
  const handleDuplicate = async (id: string) => {
    if (!token) return;

    try {
      // First, get the workflow
      const getResponse = await fetch(`/api/workflows/visual/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const getData = await getResponse.json();
      if (!getData.success) {
        alert('Workflow kopyalanamadı');
        return;
      }

      const original = getData.data;

      // Create new workflow with copied data
      const createResponse = await fetch('/api/workflows/visual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `${original.name} (Kopya)`,
          description: original.description,
          definition: original.visualDefinition,
        }),
      });

      const createData = await createResponse.json();
      if (createData.success) {
        await loadWorkflows();
        alert('Workflow başarıyla kopyalandı');
      } else {
        alert('Workflow kopyalanamadı');
      }
    } catch (error) {
      console.error('Failed to duplicate workflow:', error);
      alert('Kopyalama işlemi başarısız oldu');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Workflow className="w-8 h-8 text-indigo-600" />
              Onay İş Akışları
            </h1>
            <p className="text-gray-600 mt-1">
              Görsel workflow designer ile iş akışlarınızı yönetin
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium shadow-lg transition-all hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Yeni Workflow Oluştur
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Workflow ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Tüm Workflow'lar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Devre Dışı</option>
          </select>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Workflow</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{workflows.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Workflow className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktif Workflow</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {workflows.filter((w) => w.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Devre Dışı</p>
                <p className="text-3xl font-bold text-gray-600 mt-1">
                  {workflows.filter((w) => !w.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <PowerOff className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Workflow List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Workflow'lar yükleniyor...</p>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Workflow className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || filterStatus !== 'all'
                ? 'Workflow bulunamadı'
                : 'Henüz workflow oluşturulmamış'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                : 'Görsel workflow designer ile ilk iş akışınızı oluşturun'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button
                onClick={handleCreate}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Yeni Workflow Oluştur
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workflow Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Açıklama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Versiyon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Güncelleme
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWorkflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{workflow.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {workflow.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {workflow.isActive ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <Power className="w-3 h-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          <PowerOff className="w-3 h-3" />
                          Devre Dışı
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">v{workflow.version}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(workflow.updatedAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(workflow.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(workflow.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Kopyala"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleToggleActive(workflow.id, workflow.isActive)
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            workflow.isActive
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={workflow.isActive ? 'Devre Dışı Bırak' : 'Aktif Et'}
                        >
                          {workflow.isActive ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(workflow.id, workflow.isActive)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={workflow.isActive}
                          title={
                            workflow.isActive
                              ? 'Aktif workflow silinemez'
                              : 'Sil'
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
