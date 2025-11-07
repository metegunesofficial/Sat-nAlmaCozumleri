import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import Link from 'next/link'

export default async function DevAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Only SUPER_ADMIN can access dev-admin
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">🔧 Dev Admin Panel</h1>
              <p className="text-sm text-red-100">System-wide management (SUPER_ADMIN only)</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm bg-red-500 px-3 py-1 rounded">
                {session.user.name}
              </span>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-white text-red-600 rounded hover:bg-red-50 transition-colors text-sm font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <NavLink href="/dev-admin" exact>
              📊 Overview
            </NavLink>
            <NavLink href="/dev-admin/companies">
              🏢 Companies
            </NavLink>
            <NavLink href="/dev-admin/audit-logs">
              📜 Audit Logs
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

function NavLink({
  href,
  children,
  exact = false
}: {
  href: string
  children: React.ReactNode
  exact?: boolean
}) {
  return (
    <Link
      href={href}
      className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors border-b-2 border-transparent hover:border-red-600"
    >
      {children}
    </Link>
  )
}
