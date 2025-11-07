'use client'

import React, { createContext, useContext } from 'react'
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
  companyId: string
  companyName?: string
  departmentId?: string
  departmentName?: string
  position?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // This is now a compatibility wrapper around NextAuth
  // The actual SessionProvider is in Providers.tsx
  return (
    <AuthContext.Provider value={undefined as any}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth - Compatibility hook that wraps NextAuth's useSession
 *
 * This provides a consistent API while using NextAuth under the hood.
 * Existing code can continue to use useAuth() without changes.
 */
export function useAuth(): AuthContextType {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      throw new Error(result.error)
    }

    // NextAuth will handle the redirect via middleware
    // But we can also do it here for immediate feedback
    if (result?.ok) {
      // Let middleware handle the redirect based on role
      router.refresh()
    }
  }

  const logout = async () => {
    await nextAuthSignOut({ redirect: true, callbackUrl: '/login' })
  }

  // Map NextAuth session to our User interface
  const user: User | null = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    companyId: session.user.companyId,
    companyName: session.user.companyName,
    departmentId: session.user.departmentId,
    departmentName: session.user.departmentName,
    position: session.user.position,
  } : null

  return {
    user,
    loading: status === 'loading',
    login,
    logout,
    isAuthenticated: !!session,
  }
}
