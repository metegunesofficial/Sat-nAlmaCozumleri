import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // If user is not authenticated and trying to access protected routes
    if (!token && path !== '/login' && path !== '/register' && path !== '/') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // If user is authenticated and trying to access login page
    if (token && path === '/login') {
      // Redirect based on role
      if (token.role === 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/dev-admin', req.url))
      }
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // SUPER_ADMIN role check for /dev-admin routes
    if (path.startsWith('/dev-admin') && token?.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // COMPANY_ADMIN or higher for /admin routes (except SUPER_ADMIN accessing dev-admin)
    if (path.startsWith('/admin') && !path.startsWith('/dev-admin')) {
      const adminRoles = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'PROCUREMENT_MANAGER']
      if (token && !adminRoles.includes(token.role as string)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Public routes
        const publicRoutes = ['/', '/login', '/register', '/api/demo/provision']
        if (publicRoutes.includes(path)) {
          return true
        }

        // API routes that don't require auth
        if (path.startsWith('/api/auth')) {
          return true
        }

        // All other routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
