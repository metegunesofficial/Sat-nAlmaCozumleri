'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </NotificationProvider>
  )
}
