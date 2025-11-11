/**
 * Export Utilities for Excel and CSV
 *
 * This module provides client-side export functionality.
 * No external dependencies required - uses native browser APIs.
 */

export interface ExportColumn {
  key: string
  label: string
  format?: (value: any) => string
}

/**
 * Export data to CSV format
 */
export function exportToCSV(
  data: any[],
  columns: ExportColumn[],
  filename: string
): void {
  if (!data || data.length === 0) {
    alert('Dışa aktarılacak veri bulunamadı')
    return
  }

  // Create CSV header
  const header = columns.map(col => `"${col.label}"`).join(',')

  // Create CSV rows
  const rows = data.map(item => {
    return columns
      .map(col => {
        const value = item[col.key]
        const formatted = col.format ? col.format(value) : value

        // Escape quotes and wrap in quotes
        const escaped = String(formatted || '')
          .replace(/"/g, '""')
        return `"${escaped}"`
      })
      .join(',')
  })

  // Combine header and rows
  const csv = [header, ...rows].join('\n')

  // Add BOM for Turkish characters
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })

  // Download file
  downloadBlob(blob, filename)
}

/**
 * Export data to Excel format (actually CSV with .xlsx extension)
 * For true Excel files, use a library like exceljs (requires npm install)
 */
export function exportToExcel(
  data: any[],
  columns: ExportColumn[],
  filename: string
): void {
  // For simplicity, we'll create a CSV and name it .xlsx
  // This works in Excel but is technically a CSV file
  // For true Excel files, install exceljs library
  exportToCSV(data, columns, filename.replace('.xlsx', '.csv'))
}

/**
 * Export table data from HTML table element
 */
export function exportTableToCSV(
  tableElement: HTMLTableElement,
  filename: string
): void {
  const rows = Array.from(tableElement.querySelectorAll('tr'))
  const csvRows = rows.map(row => {
    const cells = Array.from(row.querySelectorAll('th, td'))
    return cells
      .map(cell => {
        const text = cell.textContent || ''
        const escaped = text.replace(/"/g, '""')
        return `"${escaped}"`
      })
      .join(',')
  })

  const csv = csvRows.join('\n')
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })

  downloadBlob(blob, filename)
}

/**
 * Helper function to download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up URL
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * Format helpers for common data types
 */
export const formatters = {
  date: (value: any) => {
    if (!value) return ''
    const date = new Date(value)
    return date.toLocaleDateString('tr-TR')
  },

  datetime: (value: any) => {
    if (!value) return ''
    const date = new Date(value)
    return date.toLocaleString('tr-TR')
  },

  currency: (value: any) => {
    if (value === null || value === undefined) return ''
    return Number(value).toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' TL'
  },

  number: (value: any) => {
    if (value === null || value === undefined) return ''
    return Number(value).toLocaleString('tr-TR')
  },

  boolean: (value: any) => {
    return value ? 'Evet' : 'Hayır'
  },

  status: (value: string) => {
    const statusMap: Record<string, string> = {
      DRAFT: 'Taslak',
      SUBMITTED: 'Gönderildi',
      IN_REVIEW: 'İnceleniyor',
      APPROVED: 'Onaylandı',
      REJECTED: 'Reddedildi',
      CANCELLED: 'İptal Edildi',
      COMPLETED: 'Tamamlandı',
      PENDING: 'Beklemede',
      ACTIVE: 'Aktif',
      INACTIVE: 'Pasif',
    }
    return statusMap[value] || value
  },

  priority: (value: string) => {
    const priorityMap: Record<string, string> = {
      LOW: 'Düşük',
      NORMAL: 'Normal',
      HIGH: 'Yüksek',
      URGENT: 'Acil',
    }
    return priorityMap[value] || value
  },

  role: (value: string) => {
    const roleMap: Record<string, string> = {
      SUPER_ADMIN: 'Süper Admin',
      COMPANY_ADMIN: 'Şirket Admin',
      EMPLOYEE: 'Çalışan',
      DEPARTMENT_MANAGER: 'Departman Müdürü',
      FINANCE_MANAGER: 'Finans Müdürü',
      GENERAL_MANAGER: 'Genel Müdür',
      PROCUREMENT_MANAGER: 'Satın Alma Müdürü',
    }
    return roleMap[value] || value
  },
}

/**
 * Example usage:
 *
 * const columns = [
 *   { key: 'requestNumber', label: 'Talep No' },
 *   { key: 'title', label: 'Başlık' },
 *   { key: 'estimatedTotal', label: 'Tutar', format: formatters.currency },
 *   { key: 'status', label: 'Durum', format: formatters.status },
 *   { key: 'createdAt', label: 'Oluşturma Tarihi', format: formatters.date },
 * ]
 *
 * exportToCSV(requests, columns, 'purchase-requests.csv')
 */
