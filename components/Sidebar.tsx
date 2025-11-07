'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Users,
  Package,
  Settings,
  BarChart3,
  Briefcase,
  Building2,
  GitBranch,
  LogOut,
  ChevronDown,
  Workflow,
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface MenuItem {
  icon: any
  label: string
  href: string
  roles?: string[]
  children?: MenuItem[]
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout, token } = useAuth()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)

  // Load company logo
  useEffect(() => {
    const loadCompanyLogo = async () => {
      if (!token) return;

      try {
        const response = await fetch('/api/settings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success && data.data?.logoUrl) {
          setCompanyLogo(data.data.logoUrl);
        }
      } catch (error) {
        console.error('Failed to load company logo:', error);
      }
    };

    loadCompanyLogo();
  }, [token]);

  const menuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: ShoppingCart,
      label: 'Satın Alma Talepleri',
      href: '/requests',
      children: [
        { icon: FileText, label: 'Tüm Talepler', href: '/requests' },
        { icon: FileText, label: 'Yeni Talep', href: '/requests/new' },
        { icon: FileText, label: 'Bekleyen Onaylar', href: '/requests/pending' },
      ],
    },
    {
      icon: BarChart3,
      label: 'Raporlar',
      href: '/reports',
      roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'GENERAL_MANAGER'],
    },
    {
      icon: Settings,
      label: 'Yönetim',
      href: '/admin',
      roles: ['COMPANY_ADMIN', 'SUPER_ADMIN'],
      children: [
        { icon: Package, label: 'Ürünler', href: '/admin/products' },
        { icon: GitBranch, label: 'Kategoriler', href: '/admin/categories' },
        { icon: Building2, label: 'Departmanlar', href: '/admin/departments' },
        { icon: Users, label: 'Kullanıcılar', href: '/admin/users' },
        { icon: Briefcase, label: 'Tedarikçiler', href: '/admin/suppliers' },
        { icon: GitBranch, label: 'Onay İş Akışları', href: '/admin/workflows' },
        { icon: Workflow, label: 'Görsel Workflow Designer', href: '/admin/workflows/designer' },
        { icon: Settings, label: 'Şirket Ayarları', href: '/admin/settings' },
      ],
    },
  ]

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    )
  }

  const canAccessMenu = (item: MenuItem) => {
    if (!item.roles) return true
    return user && item.roles.includes(user.role)
  }

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt="Company Logo"
              className="h-10 w-auto object-contain"
            />
          ) : (
            <>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="font-bold text-lg text-gray-800">Satın Alma</span>
            </>
          )}
        </Link>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            if (!canAccessMenu(item)) return null

            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedMenus.includes(item.label)
            const Icon = item.icon

            return (
              <li key={item.label}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isExpanded && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {item.children?.map((child) => {
                          const ChildIcon = child.icon
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isActive(child.href)
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                <ChildIcon size={18} />
                                <span>{child.label}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LogOut size={20} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  )
}
