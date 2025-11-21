// Export utilities for Excel and PDF

/**
 * Export data to CSV/Excel format
 */
export function exportToExcel(data: any[], filename: string, columns?: { key: string; label: string }[]) {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // If columns not provided, use keys from first object
  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }))

  // Create CSV content
  const headers = cols.map(col => `"${col.label}"`).join(',')
  const rows = data.map(item => {
    return cols.map(col => {
      let value = item[col.key]

      // Handle nested objects
      if (typeof value === 'object' && value !== null) {
        value = value.name || JSON.stringify(value)
      }

      // Handle dates
      if (value instanceof Date) {
        value = value.toLocaleDateString('tr-TR')
      }

      // Handle numbers for currency
      if (typeof value === 'number') {
        value = value.toLocaleString('tr-TR')
      }

      // Escape quotes and wrap in quotes
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""')
      }

      return `"${value ?? ''}"`
    }).join(',')
  }).join('\n')

  const csvContent = `\uFEFF${headers}\n${rows}` // BOM for Excel Turkish character support

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${formatDateForFile()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export data to PDF using browser print
 */
export function exportToPDF(title: string, content: string, filename?: string) {
  const printWindow = window.open('', '_blank')

  if (!printWindow) {
    alert('Popup engelleyici aktif. Lütfen popup\'lara izin verin.')
    return
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        * {
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          padding: 20px;
          color: #1f2937;
          line-height: 1.5;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        .header h1 {
          margin: 0 0 10px 0;
          color: #1e40af;
          font-size: 24px;
        }
        .header p {
          margin: 0;
          color: #6b7280;
          font-size: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
          text-align: left;
          font-size: 12px;
        }
        th {
          background-color: #f3f4f6;
          font-weight: 600;
          color: #374151;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .summary {
          margin-top: 20px;
          padding: 15px;
          background-color: #eff6ff;
          border-radius: 8px;
        }
        .summary h3 {
          margin: 0 0 10px 0;
          color: #1e40af;
          font-size: 14px;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 12px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 10px;
          color: #9ca3af;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}</p>
      </div>
      ${content}
      <div class="footer">
        <p>Attelia Dental - B2B Satın Alma Yönetim Sistemi</p>
      </div>
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}

/**
 * Generate PDF table from data
 */
export function generatePDFTable(data: any[], columns: { key: string; label: string }[]): string {
  if (!data || data.length === 0) {
    return '<p>Veri bulunamadı</p>'
  }

  const headers = columns.map(col => `<th>${col.label}</th>`).join('')
  const rows = data.map(item => {
    const cells = columns.map(col => {
      let value = item[col.key]

      if (typeof value === 'object' && value !== null) {
        value = value.name || ''
      }

      if (value instanceof Date) {
        value = value.toLocaleDateString('tr-TR')
      }

      if (typeof value === 'number') {
        value = value.toLocaleString('tr-TR')
      }

      return `<td>${value ?? '-'}</td>`
    }).join('')

    return `<tr>${cells}</tr>`
  }).join('')

  return `
    <table>
      <thead>
        <tr>${headers}</tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `
}

/**
 * Generate summary section for PDF
 */
export function generatePDFSummary(items: { label: string; value: string | number }[]): string {
  const summaryItems = items.map(item => `
    <div class="summary-item">
      <span>${item.label}:</span>
      <strong>${typeof item.value === 'number' ? item.value.toLocaleString('tr-TR') : item.value}</strong>
    </div>
  `).join('')

  return `
    <div class="summary">
      <h3>Özet</h3>
      ${summaryItems}
    </div>
  `
}

/**
 * Export purchase request to PDF
 */
export function exportRequestToPDF(request: {
  requestNumber: string
  title: string
  status: string
  priority: string
  totalAmount: number
  createdAt: string
  requiredDate?: string
  user: { name: string }
  department?: { name: string }
  description?: string
  justification?: string
  items: Array<{
    productName: string
    quantity: number
    unitPrice: number
  }>
}) {
  const statusLabels: Record<string, string> = {
    DRAFT: 'Taslak',
    PENDING: 'Beklemede',
    IN_REVIEW: 'İncelemede',
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
    COMPLETED: 'Tamamlandı',
  }

  const priorityLabels: Record<string, string> = {
    LOW: 'Düşük',
    NORMAL: 'Normal',
    HIGH: 'Yüksek',
    URGENT: 'Acil',
  }

  const infoContent = `
    <table>
      <tr>
        <th>Talep No</th>
        <td>${request.requestNumber}</td>
        <th>Durum</th>
        <td>${statusLabels[request.status] || request.status}</td>
      </tr>
      <tr>
        <th>Talep Eden</th>
        <td>${request.user.name}</td>
        <th>Departman</th>
        <td>${request.department?.name || '-'}</td>
      </tr>
      <tr>
        <th>Öncelik</th>
        <td>${priorityLabels[request.priority] || request.priority}</td>
        <th>Oluşturma Tarihi</th>
        <td>${new Date(request.createdAt).toLocaleDateString('tr-TR')}</td>
      </tr>
      ${request.requiredDate ? `
        <tr>
          <th>Gerekli Tarih</th>
          <td colspan="3">${new Date(request.requiredDate).toLocaleDateString('tr-TR')}</td>
        </tr>
      ` : ''}
    </table>

    ${request.description ? `
      <h3 style="margin-top: 20px; font-size: 14px;">Açıklama</h3>
      <p style="font-size: 12px;">${request.description}</p>
    ` : ''}

    ${request.justification ? `
      <h3 style="margin-top: 20px; font-size: 14px;">Gerekçe</h3>
      <p style="font-size: 12px;">${request.justification}</p>
    ` : ''}

    <h3 style="margin-top: 20px; font-size: 14px;">Ürünler</h3>
  `

  const itemsTable = generatePDFTable(
    request.items.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice
    })),
    [
      { key: 'productName', label: 'Ürün' },
      { key: 'quantity', label: 'Miktar' },
      { key: 'unitPrice', label: 'Birim Fiyat (TL)' },
      { key: 'total', label: 'Toplam (TL)' },
    ]
  )

  const summary = generatePDFSummary([
    { label: 'Toplam Kalem', value: request.items.length },
    { label: 'Toplam Miktar', value: request.items.reduce((sum, item) => sum + item.quantity, 0) },
    { label: 'Genel Toplam', value: `${request.totalAmount.toLocaleString('tr-TR')} TL` },
  ])

  exportToPDF(
    `Satın Alma Talebi - ${request.requestNumber}`,
    infoContent + itemsTable + summary
  )
}

/**
 * Format date for filename
 */
function formatDateForFile(): string {
  const now = new Date()
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
}

/**
 * Export report data with summary
 */
export function exportReportToExcel(
  data: any[],
  filename: string,
  columns: { key: string; label: string }[],
  summary?: { label: string; value: string | number }[]
) {
  // Add summary rows at the end
  const exportData = [...data]

  if (summary && summary.length > 0) {
    // Add empty row
    exportData.push({})

    // Add summary rows
    summary.forEach(item => {
      const row: any = {}
      row[columns[0].key] = item.label
      row[columns[1]?.key || columns[0].key] = item.value
      exportData.push(row)
    })
  }

  exportToExcel(exportData, filename, columns)
}
