'use client'

import React from 'react'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })

    // Log to error reporting service (e.g., Sentry)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // window.Sentry?.captureException(error, { extra: errorInfo })
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-lg shadow-xl p-8 border border-red-200">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Bir Hata Oluştu
              </h1>

              {/* Error Message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-medium mb-2">
                  {this.state.error?.message || 'Beklenmeyen bir hata oluştu'}
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                  <details className="mt-4">
                    <summary className="text-sm text-red-700 cursor-pointer hover:text-red-900">
                      Teknik Detaylar (Geliştirme Modu)
                    </summary>
                    <pre className="mt-2 text-xs bg-red-100 p-3 rounded overflow-auto max-h-64 text-red-900">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-center mb-8">
                Üzgünüz, bir şeyler ters gitti. Lütfen sayfayı yenilemeyi deneyin veya ana sayfaya dönün.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <RefreshCcw size={20} />
                  Sayfayı Yenile
                </button>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Home size={20} />
                  Ana Sayfaya Dön
                </Link>
              </div>

              {/* Support Info */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-500">
                  Sorun devam ederse, lütfen sistem yöneticinizle iletişime geçin.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional component wrapper for easier use
export function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}
