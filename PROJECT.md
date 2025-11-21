# Attelia Dental - B2B Satın Alma Yönetim Sistemi

## Proje Özeti
**Teknoloji:** Next.js 14 (App Router) + TypeScript + Prisma + PostgreSQL
**Amaç:** Dental sektörü için kurumsal satın alma talebi yönetim sistemi

---

## Hızlı Başlangıç

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

**Test Kullanıcıları:** (Şifre: `password123`)
- admin@attelia.com (COMPANY_ADMIN)
- john.doe@attelia.com (EMPLOYEE)
- it.manager@attelia.com (DEPARTMENT_MANAGER)
- finance@attelia.com (FINANCE_MANAGER)

---

## Dosya Yapısı

```
app/
├── api/                    # Backend API
│   ├── auth/login|register
│   ├── products/[slug]
│   ├── categories/
│   ├── departments/
│   ├── users/[id]
│   ├── suppliers/[id]
│   ├── workflows/[id]
│   ├── cart/[itemId]
│   ├── orders/[orderId]
│   ├── purchase-requests/[requestId]/approve
│   └── reports/budget|spending
├── login/                  # Giriş
├── register/               # Kayıt
├── dashboard/              # Ana panel
├── requests/new|[id]       # Talepler
├── approvals/              # Onaylar
├── orders/[id]             # Siparişler
├── products/[slug]         # Ürünler
├── suppliers/              # Tedarikçiler
├── invoices/               # Faturalar
├── documents/              # Dokümanlar
├── reports/                # Raporlar
├── notifications/          # Bildirimler
├── search/                 # Arama
├── help/                   # Yardım
├── profile/                # Profil
└── admin/
    ├── users/
    ├── departments/
    ├── categories/
    ├── budgets/
    ├── settings/
    ├── activity/
    └── email-templates/

components/
├── DashboardLayout.tsx     # Ana layout
├── Sidebar.tsx             # Navigasyon
├── DataTable.tsx           # Tablo
├── Modal.tsx               # Dialog
├── StatCard.tsx            # İstatistik kartı
├── ErrorBoundary.tsx       # Hata yakalama
└── Providers.tsx           # Context wrapper

contexts/
├── AuthContext.tsx         # Kimlik doğrulama
├── NotificationContext.tsx # Bildirimler
└── ThemeContext.tsx        # Dark mode

lib/
├── api.ts                  # API client
├── auth.ts                 # JWT/bcrypt
├── prisma.ts               # Prisma client
├── export.ts               # Excel/PDF export
├── utils.ts                # Yardımcılar
└── mockData.ts             # Mock veriler
```

---

## Veritabanı Şeması (Prisma)

### Ana Modeller

```prisma
// Kullanıcı Rolleri
enum UserRole {
  SUPER_ADMIN
  COMPANY_ADMIN
  EMPLOYEE
  DEPARTMENT_MANAGER
  FINANCE_MANAGER
  GENERAL_MANAGER
  PROCUREMENT_MANAGER
}

// Talep Durumları
enum RequestStatus {
  DRAFT
  SUBMITTED
  IN_REVIEW
  APPROVED
  REJECTED
  CANCELLED
  COMPLETED
}

// Öncelikler
enum RequestPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

// Sipariş Durumları
enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

### Temel Tablolar

- **Company** - Şirketler (multi-tenant)
- **User** - Kullanıcılar
- **Department** - Departmanlar
- **Budget/CompanyBudget/UserBudget** - 3 katmanlı bütçe
- **Product** - Ürünler
- **Category** - Kategoriler
- **Supplier** - Tedarikçiler
- **PurchaseRequest** - Satın alma talepleri
- **PurchaseRequestItem** - Talep kalemleri
- **ApprovalWorkflow** - Onay iş akışları
- **ApprovalStep** - Onay adımları
- **ApprovalAction** - Onay aksiyonları
- **Order/OrderItem** - Siparişler
- **Cart/CartItem** - Sepet

---

## API Yapısı

### Kimlik Doğrulama
```typescript
POST /api/auth/login     // { email, password } → { token, user }
POST /api/auth/register  // { email, password, name, ... }
```

### CRUD Pattern
```typescript
GET    /api/[resource]      // Liste
POST   /api/[resource]      // Oluştur
GET    /api/[resource]/[id] // Detay
PUT    /api/[resource]/[id] // Güncelle
DELETE /api/[resource]/[id] // Sil
```

### API Client (lib/api.ts)
```typescript
import { fetchWithAuth } from '@/lib/api'

// Mevcut modüller:
productsApi, categoriesApi, departmentsApi, usersApi,
suppliersApi, workflowsApi, purchaseRequestsApi,
cartApi, ordersApi, reportsApi, authApi
```

---

## Sayfa Pattern'i

```typescript
'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'

export default function PageName() {
  const { user } = useAuth()
  const { success, error } = useNotification()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await api.getAll()
      if (res.success) setData(res.data)
    } catch (err) {
      error('Veri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* İçerik */}
      </div>
    </DashboardLayout>
  )
}
```

---

## Durum Renkleri ve Etiketleri

```typescript
// Durum renkleri
const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
}

// Türkçe etiketler
const statusLabels = {
  DRAFT: 'Taslak',
  PENDING: 'Beklemede',
  IN_REVIEW: 'İncelemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  COMPLETED: 'Tamamlandı',
}

// Para formatı
const formatCurrency = (amount: number) =>
  amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
```

---

## Rol Yetkileri

| Rol | Yetkiler |
|-----|----------|
| SUPER_ADMIN | Tüm platform yönetimi |
| COMPANY_ADMIN | Şirket tam yetki, kullanıcı/departman/workflow yönetimi |
| GENERAL_MANAGER | Tüm onaylar, tüm raporlar |
| FINANCE_MANAGER | Finansal onaylar, bütçe yönetimi |
| PROCUREMENT_MANAGER | Tedarikçi, ürün yönetimi, satın alma onayları |
| DEPARTMENT_MANAGER | Departman onayları ve raporları |
| EMPLOYEE | Kendi taleplerini oluşturma/görüntüleme |

---

## Tamamlanan Özellikler

### Frontend
- [x] Tüm sayfa yapıları (23 sayfa)
- [x] Dashboard (grafikler, istatistikler)
- [x] Satın alma talebi formu (katalog + manuel giriş, taslak kaydetme)
- [x] Talep detay ve onay arayüzü (dinamik workflow, bütçe etkisi)
- [x] Rol bazlı sidebar navigasyon
- [x] DataTable bileşeni (arama, sıralama)
- [x] Modal bileşeni
- [x] Bildirim sistemi (toast)
- [x] Dark mode altyapısı
- [x] Global error boundary
- [x] Excel/PDF export

### Backend
- [x] Tüm API endpoints
- [x] JWT kimlik doğrulama
- [x] Prisma ORM
- [x] Rol bazlı yetkilendirme
- [x] Onay iş akışı mantığı

---

## EKSİKLER ve YAPILACAKLAR

### Yüksek Öncelik

#### 1. AuthContext → Gerçek API Bağlantısı
**Dosya:** `contexts/AuthContext.tsx`
**Sorun:** Mock login kullanıyor
**Çözüm:** `login` fonksiyonunu `/api/auth/login` endpoint'ine bağla

```typescript
// Mevcut (mock):
const mockUser = mockUsers.find(u => u.email === email)

// Olması gereken:
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
const data = await response.json()
```

#### 2. API Route Token Doğrulama
**Sorun:** Bazı route'lar token doğrulama yapmıyor
**Çözüm:** Her route'a `verifyToken` kontrolü ekle

```typescript
export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ...
}
```

#### 3. Email Bildirimleri
**Gerekli:** Nodemailer veya benzeri servis
**Tetikleyiciler:**
- Talep oluşturulduğunda
- Onay beklerken
- Onaylandığında/Reddedildiğinde

#### 4. Dosya Yükleme
**Gerekli:** Multer veya cloud storage (S3, Cloudinary)
**Kullanım:** Taleplere dosya eki

### Orta Öncelik

#### 5. Test Coverage
- Unit testler (Jest)
- Integration testler
- E2E testler (Cypress/Playwright)

#### 6. Form Validasyonu
- Zod schema validasyonu
- Client-side validasyon
- Server-side validasyon

#### 7. Performans
- React.memo kullanımı
- useMemo/useCallback optimizasyonu
- API response caching
- Lazy loading

### Düşük Öncelik

#### 8. PWA Desteği
- Service worker
- Offline desteği
- Push notifications

#### 9. i18n (Çoklu Dil)
- next-intl veya react-i18next

#### 10. Analytics
- Kullanıcı davranış takibi
- Hata raporlama (Sentry)

---

## Kritik Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `prisma/schema.prisma` | Veritabanı şeması |
| `lib/auth.ts` | JWT token işlemleri |
| `lib/api.ts` | API client fonksiyonları |
| `contexts/AuthContext.tsx` | Kimlik doğrulama state |
| `components/Sidebar.tsx` | Navigasyon menüsü |
| `types/index.ts` | TypeScript tipleri |

---

## Environment Variables

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## Deployment

### Vercel
1. GitHub repo bağla
2. Environment variables ekle
3. Build: `prisma generate && prisma migrate deploy && next build`

### Veritabanı Seçenekleri
- Vercel Postgres
- Supabase
- Railway
- Neon

---

## Geliştirme Notları

### Yeni Sayfa Ekleme
1. `app/[route]/page.tsx` oluştur
2. `'use client'` direktifi ekle
3. `DashboardLayout` ile sar
4. `Sidebar.tsx`'e link ekle

### Yeni API Endpoint
1. `app/api/[resource]/route.ts` oluştur
2. Token doğrulama ekle
3. `lib/api.ts`'e client metodu ekle

### Yeni Model Ekleme
1. `prisma/schema.prisma`'ya model ekle
2. `npx prisma migrate dev`
3. `types/index.ts`'e tip ekle
4. API endpoint oluştur

---

## Sonraki Adımlar (Önerilen Sıra)

1. **AuthContext'i gerçek API'ye bağla** - En kritik
2. **Email bildirimleri ekle** - Kullanıcı deneyimi
3. **Dosya yükleme sistemi** - Talep ekleri
4. **Test coverage** - Kod kalitesi
5. **Performans optimizasyonu** - Production hazırlığı

---

## Notlar

- Tüm sayfalar Türkçe UI kullanıyor
- Para birimi: TRY
- Tarih formatı: tr-TR
- Dark mode: Tailwind `dark:` class'ları
- Export: CSV (Excel uyumlu) ve PDF (browser print)
