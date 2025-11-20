# Attelia Dental - B2B Satın Alma Yönetim Sistemi
## Cursor AI Geliştirme Dokümantasyonu

---

## 1. Proje Özeti

**Proje Adı:** Attelia Dental - Enterprise Satın Alma Yönetim Platformu
**Teknoloji:** Next.js 14 (App Router) + TypeScript + Prisma + PostgreSQL
**Amaç:** Dental sektörü için çok kiracılı (multi-tenant), kurumsal düzeyde satın alma talebi yönetim sistemi

### Temel Özellikler
- Multi-tenant mimari (şirket bazlı izolasyon)
- 3 katmanlı bütçe yönetimi (Şirket → Departman → Kullanıcı)
- Çok adımlı onay iş akışları
- E-ticaret modülü (sepet, sipariş)
- Rol tabanlı erişim kontrolü (RBAC)
- Raporlama ve analitik

---

## 2. Proje Yapısı

```
Sat-nAlmaCozumleri/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API endpoints
│   │   ├── auth/                 # Kimlik doğrulama
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   ├── purchase-requests/    # Satın alma talepleri
│   │   │   ├── route.ts
│   │   │   ├── [requestId]/route.ts
│   │   │   └── [requestId]/approve/route.ts
│   │   ├── products/             # Ürün yönetimi
│   │   ├── categories/           # Kategori yönetimi
│   │   ├── departments/          # Departman yönetimi
│   │   ├── users/                # Kullanıcı yönetimi
│   │   ├── suppliers/            # Tedarikçi yönetimi
│   │   ├── workflows/            # İş akışı yönetimi
│   │   ├── cart/                 # Sepet işlemleri
│   │   ├── orders/               # Sipariş yönetimi
│   │   └── reports/              # Raporlar
│   ├── admin/                    # Admin paneli sayfaları
│   │   ├── products/
│   │   ├── categories/
│   │   ├── users/
│   │   ├── suppliers/
│   │   ├── workflows/
│   │   └── departments/
│   ├── dashboard/page.tsx        # Ana dashboard
│   ├── requests/                 # Talep sayfaları
│   ├── reports/                  # Rapor sayfaları
│   ├── products/                 # Ürün kataloğu
│   ├── cart/                     # Sepet sayfası
│   ├── login/                    # Giriş sayfası
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Ana sayfa
│   └── globals.css               # Global stiller
├── components/                   # React bileşenleri
│   ├── DashboardLayout.tsx       # Dashboard wrapper
│   ├── DataTable.tsx             # Genel veri tablosu
│   ├── EmptyState.tsx            # Boş durum gösterimi
│   ├── Footer.tsx                # Site footer
│   ├── Header.tsx                # Site header
│   ├── Loading.tsx               # Yükleme durumları
│   ├── Modal.tsx                 # Modal dialog
│   ├── ProductCard.tsx           # Ürün kartı
│   ├── Providers.tsx             # Context providers
│   ├── Sidebar.tsx               # Navigasyon sidebar
│   └── StatCard.tsx              # İstatistik kartı
├── contexts/                     # React contexts
│   ├── AuthContext.tsx           # Kimlik doğrulama durumu
│   └── NotificationContext.tsx   # Bildirim sistemi
├── lib/                          # Yardımcı fonksiyonlar
│   ├── api.ts                    # API client
│   ├── auth.ts                   # JWT & bcrypt
│   ├── mockData.ts               # Mock veriler
│   ├── prisma.ts                 # Prisma client
│   └── utils.ts                  # Genel yardımcılar
├── prisma/                       # Veritabanı
│   ├── schema.prisma             # Prisma şeması
│   └── seed.ts                   # Seed verileri
├── types/                        # TypeScript tipleri
│   └── index.ts
└── public/                       # Statik dosyalar
```

---

## 3. Teknoloji Stack'i

### Frontend
| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| Next.js | ^14.2.0 | React framework (App Router) |
| React | ^18.3.0 | UI kütüphanesi |
| TypeScript | ^5.4.0 | Tip güvenliği |
| Tailwind CSS | ^3.4.0 | Stillendirme |
| Lucide React | ^0.263.1 | İkonlar |
| Recharts | ^3.3.0 | Grafikler |
| clsx | ^2.1.0 | Koşullu class'lar |

### Backend
| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| Next.js API Routes | - | Backend API |
| Prisma | ^5.11.0 | ORM |
| PostgreSQL | 14+ | Veritabanı |
| bcryptjs | ^2.4.3 | Şifre hashleme |
| jsonwebtoken | ^9.0.2 | JWT kimlik doğrulama |
| Zod | ^3.22.4 | Validasyon |

---

## 4. Veritabanı Şeması

### Ana Modeller

#### Çok Kiracılı Yapı
```prisma
model Company {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  taxNumber   String?
  address     String?
  phone       String?
  email       String?
  website     String?
  logo        String?
  settings    Json?    // Para birimi, saat dilimi vb.
  users       User[]
  departments Department[]
  // ... diğer ilişkiler
}
```

#### Kullanıcı Yönetimi
```prisma
model User {
  id           String      @id @default(cuid())
  email        String
  passwordHash String
  firstName    String
  lastName     String
  role         UserRole    @default(EMPLOYEE)
  isActive     Boolean     @default(true)
  companyId    String
  departmentId String?
  company      Company     @relation(...)
  department   Department? @relation(...)
  // ... diğer ilişkiler

  @@unique([email, companyId])  // Email şirket bazında unique
}

enum UserRole {
  SUPER_ADMIN         // Platform yöneticisi
  COMPANY_ADMIN       // Şirket yöneticisi
  EMPLOYEE            // Çalışan
  DEPARTMENT_MANAGER  // Departman müdürü
  FINANCE_MANAGER     // Finans müdürü
  GENERAL_MANAGER     // Genel müdür
  PROCUREMENT_MANAGER // Satın alma müdürü
}
```

#### 3 Katmanlı Bütçe Sistemi
```prisma
// 1. Şirket Bütçesi
model CompanyBudget {
  id        String   @id @default(cuid())
  companyId String
  year      Int
  month     Int?
  category  String?
  amount    Float
  spent     Float    @default(0)
  reserved  Float    @default(0)
}

// 2. Departman Bütçesi
model Budget {
  id           String     @id @default(cuid())
  departmentId String
  year         Int
  month        Int?
  amount       Float
  spent        Float      @default(0)
  reserved     Float      @default(0)
  category     String?
}

// 3. Kullanıcı Bütçesi
model UserBudget {
  id       String @id @default(cuid())
  userId   String
  year     Int
  month    Int?
  amount   Float
  spent    Float  @default(0)
  reserved Float  @default(0)
}
```

#### Satın Alma Talepleri
```prisma
model PurchaseRequest {
  id              String          @id @default(cuid())
  requestNumber   String          @unique  // PRYYYYMMxxxx
  status          RequestStatus   @default(DRAFT)
  priority        RequestPriority @default(NORMAL)
  title           String
  description     String?
  justification   String?
  requiredDate    DateTime?
  estimatedTotal  Float           @default(0)
  requesterId     String
  departmentId    String
  workflowId      String?
  currentStepId   String?
  companyId       String
  items           PurchaseRequestItem[]
  approvalActions ApprovalAction[]
  // ... ilişkiler
}

enum RequestStatus {
  DRAFT       // Taslak
  SUBMITTED   // Gönderildi
  IN_REVIEW   // İncelemede
  APPROVED    // Onaylandı
  REJECTED    // Reddedildi
  CANCELLED   // İptal edildi
  COMPLETED   // Tamamlandı
}

enum RequestPriority {
  LOW, NORMAL, HIGH, URGENT
}
```

#### Onay İş Akışları
```prisma
model ApprovalWorkflow {
  id            String         @id @default(cuid())
  name          String
  description   String?
  minAmount     Float          @default(0)
  maxAmount     Float?
  isActive      Boolean        @default(true)
  companyId     String
  departmentIds String[]       // Uygulanacak departmanlar
  steps         ApprovalStep[]
}

model ApprovalStep {
  id           String   @id @default(cuid())
  workflowId   String
  stepOrder    Int
  stepName     String
  approverRole UserRole // Veya belirli approverUserId
  isRequired   Boolean  @default(true)
  autoApprove  Boolean  @default(false)
}

model ApprovalAction {
  id         String     @id @default(cuid())
  requestId  String
  stepId     String
  approverId String
  action     ActionType
  comment    String?
  createdAt  DateTime   @default(now())
}

enum ActionType {
  APPROVED, REJECTED, RETURNED, COMMENTED
}
```

#### E-Ticaret
```prisma
model Product {
  id              String    @id @default(cuid())
  name            String
  slug            String
  sku             String?
  barcode         String?
  description     String?
  price           Float
  discountPrice   Float?
  wholesalePrice  Float?
  stock           Int       @default(0)
  minOrderQty     Int       @default(1)
  isActive        Boolean   @default(true)
  categoryId      String
  supplierId      String?
  companyId       String
  images          String[]
  // ... ilişkiler

  @@unique([slug, companyId])
  @@unique([sku, companyId])
}

model Order {
  id            String      @id @default(cuid())
  orderNumber   String      @unique
  status        OrderStatus @default(PENDING)
  paymentStatus PaymentStatus @default(PENDING)
  subtotal      Float
  tax           Float       @default(0)
  shipping      Float       @default(0)
  total         Float
  userId        String
  companyId     String
  items         OrderItem[]
  // ... adres bilgileri
}
```

---

## 5. API Endpoints

### Kimlik Doğrulama
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/login` | Kullanıcı girişi (JWT döner) |
| POST | `/api/auth/register` | Kullanıcı kaydı |

### Satın Alma Talepleri
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/purchase-requests` | Talepleri listele (rol bazlı filtreleme) |
| POST | `/api/purchase-requests` | Yeni talep oluştur |
| GET | `/api/purchase-requests/[id]` | Talep detayı |
| PUT | `/api/purchase-requests/[id]` | Talep güncelle |
| POST | `/api/purchase-requests/[id]/approve` | Onayla/Reddet |

### Ürünler
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/products` | Ürünleri listele |
| POST | `/api/products` | Ürün ekle (Admin) |
| GET | `/api/products/[slug]` | Ürün detayı |
| PUT | `/api/products/[slug]` | Ürün güncelle |
| DELETE | `/api/products/[slug]` | Ürün sil |

### Kullanıcılar
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/users` | Kullanıcıları listele |
| POST | `/api/users` | Kullanıcı ekle |
| GET | `/api/users/[id]` | Kullanıcı detayı |
| PUT | `/api/users/[id]` | Kullanıcı güncelle |
| DELETE | `/api/users/[id]` | Kullanıcı sil |

### Diğer CRUD Endpoints
- `/api/categories` - Kategoriler
- `/api/departments` - Departmanlar
- `/api/suppliers` - Tedarikçiler
- `/api/workflows` - İş akışları
- `/api/cart` - Sepet
- `/api/orders` - Siparişler

### Raporlar
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/reports/purchase-summary` | Satın alma analizi |
| GET | `/api/reports/budget` | Bütçe kullanımı |
| GET | `/api/reports/approval-performance` | Onaylayıcı performansı |

---

## 6. Kimlik Doğrulama Sistemi

### Sunucu Tarafı (lib/auth.ts)
```typescript
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Şifre hashleme (12 round)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Şifre doğrulama
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// JWT token oluşturma (7 gün geçerli)
export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' })
}

// Token doğrulama
export function verifyToken(token: string): any | null {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}
```

### İstemci Tarafı (contexts/AuthContext.tsx)
```typescript
'use client'
import { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

export function useAuth() {
  return useContext(AuthContext)
}

// localStorage'da token ve user saklanır
// Her sayfa yüklemesinde token kontrol edilir
```

### API Route Koruma Pattern'i
```typescript
export async function GET(request: NextRequest) {
  // Token al
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  // Doğrula
  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rol bazlı filtreleme
  const where: any = {}

  if (decoded.role === 'EMPLOYEE') {
    where.requesterId = decoded.userId
  } else if (decoded.role === 'DEPARTMENT_MANAGER') {
    where.departmentId = decoded.departmentId
  }
  // COMPANY_ADMIN ve üstü tüm verileri görebilir

  const data = await prisma.model.findMany({ where })
  return NextResponse.json({ success: true, data })
}
```

---

## 7. Rol Tabanlı Erişim Kontrolü (RBAC)

| Rol | Yetkiler |
|-----|----------|
| **SUPER_ADMIN** | Tüm platform yönetimi, tüm şirketlere erişim |
| **COMPANY_ADMIN** | Şirket genelinde tam yetki, kullanıcı/departman/iş akışı yönetimi |
| **GENERAL_MANAGER** | Tüm onaylar, tüm raporlar, bütçe görüntüleme |
| **FINANCE_MANAGER** | Finansal onaylar, bütçe yönetimi, finansal raporlar |
| **PROCUREMENT_MANAGER** | Tedarikçi yönetimi, ürün/kategori yönetimi, satın alma onayları |
| **DEPARTMENT_MANAGER** | Departman onayları, departman raporları, departman bütçesi |
| **EMPLOYEE** | Kendi taleplerini oluşturma/görüntüleme, ürün kataloğu erişimi |

---

## 8. Ana Özellikler ve Modüller

### 8.1 Çok Kiracılı Mimari
- Her şirket izole edilmiş veri alanına sahip
- Şirket bazında ayarlar (para birimi, saat dilimi)
- Şirket içinde unique email kontrolü

### 8.2 Satın Alma Talep Yönetimi
**Talep Numarası Format:** `PRYYYYMMxxxx` (örn: PR202411001)

**Durum Akışı:**
```
DRAFT → SUBMITTED → IN_REVIEW → APPROVED/REJECTED → COMPLETED
                 ↓
              CANCELLED
```

**Özellikler:**
- Öncelik seviyeleri (LOW, NORMAL, HIGH, URGENT)
- Gerekli tarih takibi
- Çoklu ürün kalemi
- Gerekçe ve açıklama
- Otomatik iş akışı eşleştirme

### 8.3 Onay İş Akışı Motoru
```typescript
// İş akışı seçimi örneği
const workflow = await prisma.approvalWorkflow.findFirst({
  where: {
    companyId: user.companyId,
    isActive: true,
    minAmount: { lte: estimatedTotal },
    OR: [
      { maxAmount: null },
      { maxAmount: { gte: estimatedTotal } }
    ],
    OR: [
      { departmentIds: { isEmpty: true } },
      { departmentIds: { has: departmentId } }
    ]
  },
  include: { steps: { orderBy: { stepOrder: 'asc' } } }
})
```

**Özellikler:**
- Tutar bazlı otomatik iş akışı seçimi
- Sıralı onay adımları
- Rol bazlı veya belirli kullanıcı onayı
- Onay/Red/İade aksiyonları
- Yorum desteği

### 8.4 E-Ticaret Modülü
- Ürün kataloğu (kategorili)
- SKU/Barkod desteği
- Çoklu fiyat (perakende, indirimli, toptan)
- Stok yönetimi
- Minimum sipariş miktarı
- Sepet yönetimi
- Sipariş takibi

### 8.5 Raporlama Sistemi
- Satın alma özet analizi
- Bütçe kullanım raporları
- Onaylayıcı performans metrikleri
- Departman harcama analizi

---

## 9. Önemli Kod Pattern'leri

### API Client (lib/api.ts)
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || ''

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  return response.json()
}

// Kullanım örnekleri
export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  // Purchase Requests
  getPurchaseRequests: () =>
    fetchWithAuth('/api/purchase-requests'),

  createPurchaseRequest: (data: any) =>
    fetchWithAuth('/api/purchase-requests', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // ... diğer metodlar
}
```

### API Route Template
```typescript
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rol bazlı filtreleme
    const where: any = { companyId: decoded.companyId }

    // Veri çekme
    const data = await prisma.model.findMany({
      where,
      include: { /* ilişkiler */ },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validasyon (Zod kullanılabilir)
    if (!body.requiredField) {
      return NextResponse.json({ error: 'Required field missing' }, { status: 400 })
    }

    // Oluşturma
    const data = await prisma.model.create({
      data: {
        ...body,
        companyId: decoded.companyId,
        userId: decoded.userId
      }
    })

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

### Sayfa Bileşeni Template
```typescript
'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/lib/api'

export default function PageName() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchData()
  }, [isAuthenticated])

  async function fetchData() {
    try {
      const response = await api.getResource()
      if (response.success) {
        setData(response.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      {loading ? (
        <Loading />
      ) : (
        // İçerik
      )}
    </DashboardLayout>
  )
}
```

---

## 10. Ortam Değişkenleri

### Zorunlu (.env)
```env
# Veritabanı
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Kimlik Doğrulama
JWT_SECRET="minimum-32-karakter-guclu-secret-key"
NEXTAUTH_SECRET="nextauth-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# Uygulama
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_APP_NAME="Attelia Dental"
NODE_ENV="production"
```

### Opsiyonel
```env
# Email (gelecek)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# Dosya depolama (gelecek)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET=""
```

---

## 11. Kurulum ve Çalıştırma

### Geliştirme
```bash
# Bağımlılıkları yükle
npm install

# Prisma client oluştur
npx prisma generate

# Veritabanı migration'larını uygula
npx prisma migrate dev

# Seed verilerini yükle
npm run db:seed

# Geliştirme sunucusunu başlat
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Faydalı Komutlar
```bash
# Prisma Studio (veritabanı görselleştirme)
npm run db:studio

# Veritabanını sıfırla
npm run db:reset

# Lint kontrolü
npm run lint
```

---

## 12. Demo Kullanıcılar

Seed çalıştırdıktan sonra:

| Rol | Email | Şifre |
|-----|-------|-------|
| Super Admin | superadmin@attelia.com | password123 |
| Company Admin | admin@attelia.com | password123 |
| IT Manager | it.manager@attelia.com | password123 |
| Procurement | procurement@attelia.com | password123 |
| Finance | finance@attelia.com | password123 |
| Employee | john.doe@attelia.com | password123 |

---

## 13. Mevcut Durum ve Yapılacaklar

### Tamamlanan
- [x] Veritabanı şeması ve modeller
- [x] Tüm API endpoints
- [x] JWT kimlik doğrulama
- [x] Rol bazlı yetkilendirme
- [x] Onay iş akışı motoru
- [x] Temel bileşenler
- [x] Admin sayfaları (temel)

### Devam Eden / Yapılacak
- [ ] Dashboard UI iyileştirmeleri
- [ ] Satın alma talebi oluşturma formu
- [ ] Talep onay arayüzü
- [ ] Bütçe yönetim ekranları
- [ ] Raporlama grafikleri
- [ ] Email/SMS bildirimleri
- [ ] Dosya ekleri
- [ ] Excel/PDF dışa aktarım
- [ ] Denetim günlükleri (audit log)
- [ ] Mobil uygulama
- [ ] Sözleşme yönetimi
- [ ] Fatura yönetimi

---

## 14. Güvenlik Notları

- JWT token'lar 7 gün geçerli (production'da kısaltılabilir)
- Şifreler bcrypt ile 12 round hashlenir
- Tüm API endpoint'leri token doğrulaması gerektirir
- Şirket bazında veri izolasyonu sağlanır
- Rol bazlı erişim kontrolü uygulanır
- SQL injection'a karşı Prisma ORM kullanılır

---

## 15. Deployment

### Vercel (Önerilen)
1. GitHub repo'yu Vercel'e bağla
2. Environment variables'ları ekle
3. Build komutu: `prisma generate && prisma migrate deploy && next build`
4. Output: Standalone mode

### Veritabanı Seçenekleri
- Vercel Postgres
- Supabase
- Railway
- Neon
- PlanetScale (MySQL için schema değişikliği gerekir)

---

## 16. Dosya Referansları

### Kritik Dosyalar
- `prisma/schema.prisma` - Tüm veritabanı modelleri
- `lib/auth.ts` - Kimlik doğrulama fonksiyonları
- `lib/api.ts` - API client
- `lib/prisma.ts` - Prisma singleton
- `contexts/AuthContext.tsx` - Auth state yönetimi
- `types/index.ts` - TypeScript tipleri

### API Route'ları
- `app/api/auth/login/route.ts` - Giriş
- `app/api/purchase-requests/route.ts` - Talepler
- `app/api/purchase-requests/[requestId]/approve/route.ts` - Onay
- `app/api/products/route.ts` - Ürünler
- `app/api/workflows/route.ts` - İş akışları

### Bileşenler
- `components/DashboardLayout.tsx` - Ana layout
- `components/Sidebar.tsx` - Navigasyon
- `components/DataTable.tsx` - Veri tablosu
- `components/Modal.tsx` - Modal

---

## 17. Geliştirme İpuçları

### Yeni API Endpoint Ekleme
1. `app/api/[resource]/route.ts` oluştur
2. GET/POST/PUT/DELETE fonksiyonları ekle
3. Token doğrulama ve rol kontrolü ekle
4. Prisma ile veri işlemleri yap
5. `lib/api.ts`'e client metodu ekle

### Yeni Sayfa Ekleme
1. `app/[route]/page.tsx` oluştur
2. `'use client'` direktifi ekle
3. `useAuth()` hook'u kullan
4. `DashboardLayout` ile sar
5. Gerekirse Sidebar'a link ekle

### Yeni Model Ekleme
1. `prisma/schema.prisma`'ya model ekle
2. `npx prisma migrate dev` çalıştır
3. İlgili API endpoint'lerini oluştur
4. `types/index.ts`'e TypeScript tiplerini ekle

---

## 18. Navigasyon ve Menü Yapısı

### Sidebar Menü Tanımları (components/Sidebar.tsx)
```typescript
const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: ShoppingCart,
    label: 'Satın Alma Talepleri',
    href: '/requests',
    children: [
      { label: 'Tüm Talepler', href: '/requests' },
      { label: 'Yeni Talep', href: '/requests/new' },
      { label: 'Bekleyen Onaylar', href: '/requests/pending' },  // TODO: Sayfa eksik
    ],
  },
  {
    icon: BarChart3,
    label: 'Raporlar',
    href: '/reports',
    roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'GENERAL_MANAGER'],
  },
  {
    icon: Settings,
    label: 'Yönetim',
    href: '/admin',
    roles: ['COMPANY_ADMIN', 'SUPER_ADMIN'],
    children: [
      { label: 'Ürünler', href: '/admin/products' },
      { label: 'Kategoriler', href: '/admin/categories' },
      { label: 'Departmanlar', href: '/admin/departments' },
      { label: 'Kullanıcılar', href: '/admin/users' },
      { label: 'Tedarikçiler', href: '/admin/suppliers' },
      { label: 'Onay İş Akışları', href: '/admin/workflows' },
    ],
  },
]
```

### Rol Bazlı Menü Erişimi
- `canAccessMenu()` fonksiyonu ile kontrol edilir
- `roles` dizisi tanımlı değilse herkes erişebilir
- Tanımlıysa sadece o roller görebilir

---

## 19. API Client Detayları (lib/api.ts)

### Mevcut API Modülleri
```typescript
// Tedarikçiler
export const suppliersApi = {
  getAll: () => fetchWithAuth('/api/suppliers'),
  getById: (id: string) => fetchWithAuth(`/api/suppliers/${id}`),
  create: (data: any) => fetchWithAuth('/api/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchWithAuth(`/api/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchWithAuth(`/api/suppliers/${id}`, { method: 'DELETE' }),
}

// Kullanıcılar
export const usersApi = {
  getAll: (params?: { role?: string; departmentId?: string }) => {...},
  getById: (id: string) => {...},
  create: (data: any) => {...},
  update: (id: string, data: any) => {...},
  delete: (id: string) => {...},
}

// İş Akışları
export const workflowsApi = {
  getAll: (params?: { isActive?: boolean }) => {...},
  getById: (id: string) => {...},
  create: (data: any) => {...},
  update: (id: string, data: any) => {...},
  delete: (id: string) => {...},
}

// Ürünler
export const productsApi = {
  getAll: (params?: { categoryId?: string; search?: string }) => {...},
  getBySlug: (slug: string) => {...},
  create: (data: any) => {...},
  update: (slug: string, data: any) => {...},
  delete: (slug: string) => {...},
}

// Kategoriler
export const categoriesApi = {
  getAll: () => {...},
  create: (data: any) => {...},
}

// Departmanlar
export const departmentsApi = {
  getAll: () => {...},
  create: (data: any) => {...},
}
```

### EKSİK API Modülleri (Eklenmesi Gereken)
- `purchaseRequestsApi` - Satın alma talepleri
- `cartApi` - Sepet işlemleri
- `ordersApi` - Sipariş işlemleri
- `reportsApi` - Raporlama
- `authApi` - Giriş/kayıt

---

## 20. TypeScript Tip Uyumsuzlukları

### DİKKAT: types/index.ts vs Prisma Schema

`types/index.ts` dosyasındaki tipler Prisma schema ile **TAM UYUMLU DEĞİL**. Güncellenmeleri gerekiyor.

#### Mevcut types/index.ts
```typescript
// User - EKSİK ALANLAR
export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'CUSTOMER' | 'DEALER'  // YANLIŞ! Prisma'daki roller farklı
  companyName?: string
  phone?: string
  address?: string
  city?: string
}

// Eksik: companyId, departmentId, position, employeeId
// Yanlış roller: ADMIN, CUSTOMER, DEALER yerine UserRole enum kullanılmalı
```

#### Doğru Olması Gereken
```typescript
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  companyId: string
  departmentId?: string
  position?: string
  phone?: string
  address?: string
  city?: string
  district?: string
  postalCode?: string
  employeeId?: string
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'COMPANY_ADMIN'
  | 'EMPLOYEE'
  | 'DEPARTMENT_MANAGER'
  | 'FINANCE_MANAGER'
  | 'GENERAL_MANAGER'
  | 'PROCUREMENT_MANAGER'
```

### Eksik Tipler (Eklenmesi Gereken)
- `Department`
- `Budget`, `CompanyBudget`, `UserBudget`
- `PurchaseRequest`, `PurchaseRequestItem`
- `ApprovalWorkflow`, `ApprovalStep`, `ApprovalAction`
- `Supplier`
- `PurchaseCategory`

---

## 21. AuthContext Mock Kullanıcılar

### DİKKAT: Mock Login Sistemi
`contexts/AuthContext.tsx` dosyasında gerçek API yerine **mock login** kullanılıyor.

```typescript
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
    // ...
  },
  {
    id: '4',
    email: 'finance@attelia.com',
    name: 'Can Öztürk',
    role: 'FINANCE_MANAGER',
    // ...
  }
]

// Tüm şifreler: password123
```

### Gerçek API'ye Geçiş İçin
`login` fonksiyonundaki mock kısmı şununla değiştirilmeli:
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
const data = await response.json()
if (data.success) {
  localStorage.setItem('user', JSON.stringify(data.user))
  localStorage.setItem('token', data.token)
  setUser(data.user)
}
```

---

## 22. Tam Dosya Listesi

### Sayfalar (app/)
```
app/
├── page.tsx                        # Ana sayfa (redirect to login/dashboard)
├── layout.tsx                      # Root layout
├── globals.css                     # Global stiller
├── login/page.tsx                  # Giriş sayfası
├── dashboard/page.tsx              # Dashboard
├── cart/page.tsx                   # Sepet
├── products/
│   ├── page.tsx                    # Ürün kataloğu
│   └── [slug]/page.tsx             # Ürün detayı
├── requests/
│   ├── page.tsx                    # Talepler listesi
│   ├── new/page.tsx                # Yeni talep oluştur
│   └── [id]/page.tsx               # Talep detayı
├── reports/page.tsx                # Raporlar
├── admin/
│   ├── page.tsx                    # Admin ana sayfa
│   ├── products/page.tsx           # Ürün yönetimi
│   ├── categories/page.tsx         # Kategori yönetimi
│   ├── departments/page.tsx        # Departman yönetimi
│   ├── users/page.tsx              # Kullanıcı yönetimi
│   ├── suppliers/page.tsx          # Tedarikçi yönetimi
│   └── workflows/page.tsx          # İş akışı yönetimi
```

### API Routes (app/api/)
```
app/api/
├── route-config.ts                 # API konfigürasyonu
├── auth/
│   ├── login/route.ts
│   └── register/route.ts
├── products/
│   ├── route.ts                    # GET (list), POST (create)
│   └── [slug]/route.ts             # GET, PUT, DELETE
├── categories/route.ts             # GET, POST
├── departments/route.ts            # GET, POST
├── users/
│   ├── route.ts                    # GET, POST
│   └── [id]/route.ts               # GET, PUT, DELETE
├── suppliers/
│   ├── route.ts                    # GET, POST
│   └── [id]/route.ts               # GET, PUT, DELETE
├── workflows/
│   ├── route.ts                    # GET, POST
│   └── [id]/route.ts               # GET, PUT, DELETE
├── cart/
│   ├── route.ts                    # GET, POST
│   └── [itemId]/route.ts           # PUT, DELETE
├── orders/
│   ├── route.ts                    # GET, POST
│   └── [orderId]/route.ts          # GET, PUT
├── purchase-requests/
│   ├── route.ts                    # GET, POST
│   ├── [requestId]/route.ts        # GET, PUT
│   └── [requestId]/approve/route.ts # POST
└── reports/
    ├── purchase-summary/route.ts
    ├── budget/route.ts
    └── approval-performance/route.ts
```

### Bileşenler (components/)
```
components/
├── DashboardLayout.tsx    # Ana layout wrapper (Sidebar + içerik)
├── Sidebar.tsx            # Sol menü navigasyonu
├── Header.tsx             # Üst başlık
├── Footer.tsx             # Alt bilgi
├── Loading.tsx            # Yükleme spinner/skeleton
├── Modal.tsx              # Modal dialog
├── DataTable.tsx          # Genel veri tablosu
├── StatCard.tsx           # Dashboard istatistik kartı
├── ProductCard.tsx        # Ürün gösterim kartı
├── EmptyState.tsx         # Boş durum gösterimi
├── Providers.tsx          # Context provider wrapper
```

---

## 23. Prisma Tam Enum Listesi

```prisma
enum UserRole {
  SUPER_ADMIN
  COMPANY_ADMIN
  EMPLOYEE
  DEPARTMENT_MANAGER
  FINANCE_MANAGER
  GENERAL_MANAGER
  PROCUREMENT_MANAGER
}

enum RequestPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum RequestStatus {
  DRAFT
  SUBMITTED
  IN_REVIEW
  APPROVED
  REJECTED
  CANCELLED
  COMPLETED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum StepAction {
  APPROVE
  REVIEW
  VERIFY
}

enum ActionType {
  APPROVED
  REJECTED
  RETURNED
  COMMENTED
}

enum SupplierStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

---

## 24. Kritik Yapılacaklar (TODO)

### Yüksek Öncelikli
1. **types/index.ts güncellemesi** - Prisma schema ile uyumlu hale getir
2. **AuthContext gerçek API entegrasyonu** - Mock login'i kaldır
3. **`/requests/pending` sayfası** - Menüde var ama sayfa yok
4. **Eksik API client fonksiyonları** - purchaseRequests, cart, orders, auth

### Orta Öncelikli
5. **Satın alma talebi formu** - `/requests/new` sayfası UI
6. **Talep onay arayüzü** - Onay/red işlemleri
7. **Bütçe yönetim ekranları** - 3 katmanlı bütçe UI
8. **Dashboard grafikleri** - Recharts entegrasyonu

### Düşük Öncelikli
9. **Email bildirimleri** - SMTP entegrasyonu
10. **Dosya ekleri** - S3 veya local storage
11. **Excel/PDF export** - Rapor dışa aktarımı
12. **Audit logging** - İşlem geçmişi

---

## 25. İletişim ve Destek

- **Proje Sahibi:** Attelia Dental
- **Dokümantasyon:** Bu dosya ve README.md
- **Deployment Kılavuzu:** DEPLOYMENT.md
