'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

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
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Mock login - replace with actual API call
      const mockUsers = [
        {
          id: '1',
          email: 'admin@attelia.com',
          name: 'Ahmet Yıldırım',
          role: 'COMPANY_ADMIN',
          companyId: 'company1',
          companyName: 'Attelia Dental Merkez',
          position: 'Genel Müdür'
        },
        {
          id: '2',
          email: 'john.doe@attelia.com',
          name: 'John Doe',
          role: 'EMPLOYEE',
          companyId: 'company1',
          companyName: 'Attelia Dental Merkez',
          departmentId: 'dept1',
          departmentName: 'Bilgi İşlem',
          position: 'Yazılım Geliştirici'
        },
        {
          id: '3',
          email: 'it.manager@attelia.com',
          name: 'Mehmet Demir',
          role: 'DEPARTMENT_MANAGER',
          companyId: 'company1',
          companyName: 'Attelia Dental Merkez',
          departmentId: 'dept1',
          departmentName: 'Bilgi İşlem',
          position: 'IT Müdürü'
        },
        {
          id: '4',
          email: 'finance@attelia.com',
          name: 'Can Öztürk',
          role: 'FINANCE_MANAGER',
          companyId: 'company1',
          companyName: 'Attelia Dental Merkez',
          departmentId: 'dept-fin',
          departmentName: 'Finans',
          position: 'Finans Müdürü'
        }
      ]

      const foundUser = mockUsers.find(u => u.email === email)

      if (!foundUser || password !== 'password123') {
        throw new Error('Geçersiz email veya şifre')
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockToken = 'mock-jwt-token-' + foundUser.id

      localStorage.setItem('user', JSON.stringify(foundUser))
      localStorage.setItem('token', mockToken)

      setUser(foundUser)
      setToken(mockToken)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
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
