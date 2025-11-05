'use client'

import React, { createContext, useContext, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = (type: NotificationType, message: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const notification: Notification = { id, type, message, duration }

    setNotifications(prev => [...prev, notification])

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const success = (message: string, duration?: number) => showNotification('success', message, duration)
  const error = (message: string, duration?: number) => showNotification('error', message, duration)
  const warning = (message: string, duration?: number) => showNotification('warning', message, duration)
  const info = (message: string, duration?: number) => showNotification('info', message, duration)

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />
      case 'error': return <XCircle className="w-5 h-5" />
      case 'warning': return <AlertCircle className="w-5 h-5" />
      case 'info': return <Info className="w-5 h-5" />
    }
  }

  const getStyles = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <NotificationContext.Provider value={{ showNotification, success, error, warning, info }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right ${getStyles(notification.type)}`}
          >
            {getIcon(notification.type)}
            <p className="flex-1 text-sm font-medium">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 hover:opacity-70"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
