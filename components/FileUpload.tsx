'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, File, Image as ImageIcon } from 'lucide-react'
import { useNotification } from '@/contexts/NotificationContext'

interface FileUploadProps {
  onUpload: (url: string) => void
  accept?: string
  maxSize?: number // in MB
  label?: string
  currentFile?: string
  disabled?: boolean
}

export default function FileUpload({
  onUpload,
  accept = 'image/*',
  maxSize = 10,
  label = 'Dosya Yükle',
  currentFile,
  disabled = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentFile || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const notifications = useNotification()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      notifications.error(`Dosya boyutu ${maxSize}MB'dan büyük olamaz`)
      return
    }

    setUploading(true)

    try {
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }

      // Upload file
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Dosya yüklenemedi')
      }

      notifications.success('Dosya başarıyla yüklendi')
      onUpload(data.data.url)
    } catch (error: any) {
      notifications.error(error.message || 'Dosya yüklenirken hata oluştu')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {preview ? (
        <div className="relative">
          {preview.startsWith('data:image') || preview.endsWith('.jpg') || preview.endsWith('.png') || preview.endsWith('.gif') || preview.endsWith('.webp') ? (
            <div className="relative w-full h-48 border rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <File className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-600">{preview.split('/').pop()}</span>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            disabled || uploading
              ? 'bg-gray-50 cursor-not-allowed'
              : 'cursor-pointer hover:border-blue-500 hover:bg-blue-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
          />

          <div className="flex flex-col items-center space-y-2">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-600">Yükleniyor...</p>
              </>
            ) : (
              <>
                {accept.includes('image') ? (
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                ) : (
                  <Upload className="w-12 h-12 text-gray-400" />
                )}
                <p className="text-sm text-gray-600">
                  Dosya seçmek için tıklayın
                </p>
                <p className="text-xs text-gray-400">
                  Maksimum {maxSize}MB
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
