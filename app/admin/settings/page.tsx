'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import DashboardLayout from '@/components/DashboardLayout';

interface CompanySettings {
  id: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  fontFamily: string;
  sidebarBgColor: string;
  sidebarTextColor: string;
  headerBgColor: string;
  headerTextColor: string;
  customCSS?: string;
}

const DEFAULT_SETTINGS: Partial<CompanySettings> = {
  primaryColor: '#0070f3',
  secondaryColor: '#0051cc',
  accentColor: '#ea580c',
  successColor: '#059669',
  warningColor: '#eab308',
  errorColor: '#dc2626',
  fontFamily: 'Inter',
  sidebarBgColor: '#ffffff',
  sidebarTextColor: '#374151',
  headerBgColor: '#0070f3',
  headerTextColor: '#ffffff',
};

export default function SettingsPage() {
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'branding' | 'theme' | 'advanced'>('branding');

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [token]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
        if (data.data.logoUrl) {
          setLogoPreview(data.data.logoUrl);
        }
      }
    } catch (error) {
      console.error('Load settings error:', error);
      showNotification('Ayarlar yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Lütfen bir resim dosyası seçin', 'error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Dosya boyutu en fazla 5MB olabilir', 'error');
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setUploadingLogo(true);

    try {
      const formData = new FormData();
      formData.append('file', logoFile);

      const response = await fetch('/api/settings/logo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Logo başarıyla yüklendi', 'success');
        setSettings(data.data);
        setLogoFile(null);

        // Reload page to apply logo
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showNotification(data.error || 'Logo yüklenemedi', 'error');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      showNotification('Logo yüklenemedi', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm('Logo\'yu silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch('/api/settings/logo', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Logo silindi', 'success');
        setSettings(data.data);
        setLogoPreview(null);
        window.location.reload();
      } else {
        showNotification(data.error || 'Logo silinemedi', 'error');
      }
    } catch (error) {
      console.error('Delete logo error:', error);
      showNotification('Logo silinemedi', 'error');
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setSaving(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Ayarlar kaydedildi', 'success');
        setSettings(data.data);

        // Reload page to apply theme
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showNotification(data.error || 'Ayarlar kaydedilemedi', 'error');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      showNotification('Ayarlar kaydedilemedi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (field: keyof CompanySettings, value: string) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Şirket Ayarları</h1>
          <p className="mt-1 text-sm text-gray-600">
            Şirketinizin logosunu, renklerini ve tema ayarlarını özelleştirin
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('branding')}
              className={`${
                activeTab === 'branding'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Marka & Logo
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`${
                activeTab === 'theme'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Tema Renkleri
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`${
                activeTab === 'advanced'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Gelişmiş
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şirket Logosu
                </label>
                <div className="flex items-start space-x-4">
                  {/* Logo Preview */}
                  <div className="flex-shrink-0">
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Logo"
                          className="h-32 w-32 object-contain border-2 border-gray-200 rounded-lg p-2"
                        />
                        <button
                          onClick={handleDeleteLogo}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          title="Logoyu Sil"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Logo Yok</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoSelect}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      PNG, JPG, SVG formatlarında, maksimum 5MB
                    </p>
                    {logoFile && (
                      <button
                        onClick={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {uploadingLogo ? 'Yükleniyor...' : 'Logoyu Yükle'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Ailesi
                </label>
                <select
                  value={settings?.fontFamily || 'Inter'}
                  onChange={(e) => handleColorChange('fontFamily', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Source Sans Pro">Source Sans Pro</option>
                </select>
              </div>
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && settings && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ana Renk (Primary)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="#0070f3"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İkincil Renk (Secondary)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vurgu Rengi (Accent)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Success Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başarı Rengi (Success)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.successColor}
                      onChange={(e) => handleColorChange('successColor', e.target.value)}
                      className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.successColor}
                      onChange={(e) => handleColorChange('successColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Warning Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uyarı Rengi (Warning)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.warningColor}
                      onChange={(e) => handleColorChange('warningColor', e.target.value)}
                      className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.warningColor}
                      onChange={(e) => handleColorChange('warningColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Error Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hata Rengi (Error)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.errorColor}
                      onChange={(e) => handleColorChange('errorColor', e.target.value)}
                      className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.errorColor}
                      onChange={(e) => handleColorChange('errorColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Renk Önizleme</h3>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded" style={{ backgroundColor: settings.primaryColor }} />
                    <span className="text-xs text-gray-600">Primary</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded" style={{ backgroundColor: settings.secondaryColor }} />
                    <span className="text-xs text-gray-600">Secondary</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded" style={{ backgroundColor: settings.accentColor }} />
                    <span className="text-xs text-gray-600">Accent</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded" style={{ backgroundColor: settings.successColor }} />
                    <span className="text-xs text-gray-600">Success</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded" style={{ backgroundColor: settings.warningColor }} />
                    <span className="text-xs text-gray-600">Warning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded" style={{ backgroundColor: settings.errorColor }} />
                    <span className="text-xs text-gray-600">Error</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && settings && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Özel CSS
                </label>
                <textarea
                  value={settings.customCSS || ''}
                  onChange={(e) => setSettings({ ...settings, customCSS: e.target.value })}
                  rows={10}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="/* Özel CSS kodlarınızı buraya ekleyin */"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Güvenlik nedeniyle @import, url() ve javascript: desteklenmez
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
