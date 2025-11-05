'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
  companyId: string
  companyName: string
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
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user')
        const token = localStorage.getItem('token')

        if (storedUser && token) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Giriş başarısız')
      }

      if (!data.success) {
        throw new Error(data.error || 'Giriş başarısız')
      }

      // Store user and token
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        companyId: data.user.companyId,
        companyName: data.user.company?.name || '',
        departmentId: data.user.departmentId || undefined,
        departmentName: data.user.department?.name || undefined,
        position: data.user.position || undefined,
      }

      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', data.token)

      setUser(userData)
    } catch (error: any) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
