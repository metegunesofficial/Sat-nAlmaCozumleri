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
- [x] Dashboard UI iyileştirmeleri (hoş geldin mesajı, hızlı eylemler)
- [x] Bütçe yönetim ekranları
- [x] Raporlama grafikleri (API bağlantılı)
- [x] Denetim günlükleri (aktivite log)
- [x] Fatura yönetimi
- [x] Doküman yönetimi
- [x] Email şablonları yönetimi
- [x] Sistem ayarları sayfası
- [x] Bildirimler sayfası
- [x] Global arama sayfası
- [x] Yardım/SSS sayfası
- [x] Tedarikçi yönetimi
- [x] Bekleyen onaylar sayfası
- [x] Sipariş detay sayfası
- [x] Kullanıcı profil sayfası
- [x] Kullanıcı kayıt sayfası
- [x] Sidebar navigasyon güncellendi

### Devam Eden / Yapılacak
- [ ] Satın alma talebi oluşturma formu (gelişmiş)
- [ ] Talep onay arayüzü (gelişmiş)
- [ ] Email/SMS bildirimleri (backend entegrasyonu)
- [ ] Dosya ekleri (upload sistemi)
- [ ] Excel/PDF dışa aktarım
- [ ] Mobil uygulama
- [ ] Sözleşme yönetimi
- [ ] Dark mode desteği
- [ ] Global error boundary
- [ ] Test coverage

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
    label: 'Satın Alma',
    href: '/requests',
    children: [
      { icon: FileText, label: 'Talepler', href: '/requests' },
      { icon: FileText, label: 'Yeni Talep', href: '/requests/new' },
      { icon: ClipboardCheck, label: 'Onaylar', href: '/approvals' },
    ],
  },
  {
    icon: Truck,
    label: 'Siparişler',
    href: '/orders',
  },
  {
    icon: Package,
    label: 'Ürünler',
    href: '/products',
  },
  {
    icon: Briefcase,
    label: 'Tedarikçiler',
    href: '/suppliers',
  },
  {
    icon: Receipt,
    label: 'Faturalar',
    href: '/invoices',
  },
  {
    icon: FolderOpen,
    label: 'Dokümanlar',
    href: '/documents',
  },
  {
    icon: BarChart3,
    label: 'Raporlar',
    href: '/reports',
    roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER', 'GENERAL_MANAGER', 'DEPARTMENT_MANAGER'],
  },
  {
    icon: Settings,
    label: 'Yönetim',
    href: '/admin',
    roles: ['COMPANY_ADMIN', 'SUPER_ADMIN'],
    children: [
      { icon: Users, label: 'Kullanıcılar', href: '/admin/users' },
      { icon: Building2, label: 'Departmanlar', href: '/admin/departments' },
      { icon: GitBranch, label: 'Kategoriler', href: '/admin/categories' },
      { icon: DollarSign, label: 'Bütçeler', href: '/admin/budgets' },
      { icon: Mail, label: 'Email Şablonları', href: '/admin/email-templates' },
      { icon: Activity, label: 'Aktivite Log', href: '/admin/activity' },
      { icon: Settings, label: 'Ayarlar', href: '/admin/settings' },
    ],
  },
  {
    icon: HelpCircle,
    label: 'Yardım',
    href: '/help',
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
├── register/page.tsx               # Kullanıcı kaydı
├── dashboard/page.tsx              # Dashboard (hoş geldin, hızlı eylemler)
├── cart/page.tsx                   # Sepet
├── profile/page.tsx                # Kullanıcı profili
├── notifications/page.tsx          # Bildirimler
├── search/page.tsx                 # Global arama
├── help/page.tsx                   # Yardım ve SSS
├── products/
│   ├── page.tsx                    # Ürün kataloğu
│   └── [slug]/page.tsx             # Ürün detayı
├── requests/
│   ├── page.tsx                    # Talepler listesi
│   ├── new/page.tsx                # Yeni talep oluştur
│   └── [id]/page.tsx               # Talep detayı
├── approvals/page.tsx              # Bekleyen onaylar
├── orders/
│   ├── page.tsx                    # Siparişler listesi
│   └── [id]/page.tsx               # Sipariş detayı
├── suppliers/page.tsx              # Tedarikçiler
├── invoices/page.tsx               # Faturalar
├── documents/page.tsx              # Dokümanlar
├── reports/page.tsx                # Raporlar (API bağlantılı)
├── admin/
│   ├── page.tsx                    # Admin ana sayfa
│   ├── products/page.tsx           # Ürün yönetimi
│   ├── categories/page.tsx         # Kategori yönetimi
│   ├── departments/page.tsx        # Departman yönetimi
│   ├── users/page.tsx              # Kullanıcı yönetimi
│   ├── suppliers/page.tsx          # Tedarikçi yönetimi
│   ├── workflows/page.tsx          # İş akışı yönetimi
│   ├── budgets/page.tsx            # Bütçe yönetimi
│   ├── settings/page.tsx           # Sistem ayarları (4 tab)
│   ├── activity/page.tsx           # Aktivite log
│   └── email-templates/page.tsx    # Email şablonları
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

## 24. Proje Eksikleri ve Yapılacaklar (TODO)

### ✅ TAMAMLANDI - Kritik Düzeltmeler

#### 1. ✅ types/index.ts Uyumsuzluğu - TAMAMLANDI
**Dosya:** `types/index.ts`
**Çözüm:** Tüm tipler Prisma schema ile uyumlu hale getirildi
- UserRole, RequestStatus, RequestPriority, OrderStatus, PaymentStatus, ActionType, StepAction, SupplierStatus enum'ları eklendi
- Tüm interface'ler eklendi: Company, User, Department, Budget, CompanyBudget, UserBudget, Category, Product, CartItem, Order, OrderItem, Review, PurchaseCategory, PurchaseRequest, PurchaseRequestItem, ApprovalWorkflow, ApprovalStep, ApprovalAction, Supplier, Setting
- Form input tipleri ve UI helper tipleri eklendi

#### 2. ✅ AuthContext Mock Login - TAMAMLANDI
**Dosya:** `contexts/AuthContext.tsx`
**Çözüm:** `login` fonksiyonu `/api/auth/login` endpoint'ine bağlandı, gerçek API ile çalışıyor

#### 3. ✅ Eksik Sayfa: /requests/pending - TAMAMLANDI
**Dosya:** `app/requests/pending/page.tsx`
**Çözüm:** Bekleyen onaylar sayfası oluşturuldu
- DataTable ile talep listesi
- Rol bazlı filtreleme (DEPARTMENT_MANAGER kendi departmanını, diğerleri tümünü görür)
- Onay/İade/Red modal'ı
- Yorum ekleme özelliği

#### 4. ✅ Eksik API Client Fonksiyonları - TAMAMLANDI
**Dosya:** `lib/api.ts`
**Çözüm:** Tüm eksik modüller eklendi: purchaseRequestsApi, cartApi, ordersApi, authApi, reportsApi

---

### YÜKSEK ÖNCELİK - UI Eksikleri (Cursor için)

#### 5. Satın Alma Talebi Formu
**Dosya:** `app/requests/new/page.tsx`
**Durum:** Sayfa var ama form UI eksik/yetersiz olabilir
**Gerekli Özellikler:**
- Ürün seçimi (katalogdan veya manuel giriş)
- Miktar ve birim fiyat
- Öncelik seçimi
- Gerekli tarih
- Gerekçe/açıklama
- Taslak kaydetme
- Toplam hesaplama

#### 6. Talep Onay Arayüzü
**Dosya:** `app/requests/[id]/page.tsx`
**Eksik Özellikler:**
- Onay/Red butonları
- Yorum ekleme alanı
- Onay geçmişi gösterimi
- Mevcut adım gösterimi
- Sonraki onaylayıcı bilgisi

#### 7. Bütçe Yönetim Ekranları
**Eksik Sayfalar:**
- `app/admin/budgets/page.tsx` - Bütçe listesi
- `app/admin/budgets/company/page.tsx` - Şirket bütçesi
- `app/admin/budgets/department/page.tsx` - Departman bütçeleri
- `app/admin/budgets/user/page.tsx` - Kullanıcı bütçeleri

**Gerekli Özellikler:**
- Bütçe oluşturma/düzenleme
- Harcama takibi
- Rezervasyon yönetimi
- Uyarı eşikleri

#### 8. Admin Sayfaları İyileştirmeleri
**Mevcut Sayfalar:** products, categories, users, suppliers, workflows, departments
**Eksik Özellikler:**
- Silme onay dialogları
- Bulk işlemler
- Filtreleme
- Sayfalama
- Dışa aktarım

---

### ORTA ÖNCELİK - Fonksiyonel Eksikler

#### 9. Dashboard Mock Data
**Sorun:** Dashboard gerçek API yerine mockData kullanıyor
**Dosya:** `app/dashboard/page.tsx`
**Çözüm:** API endpoint'lerinden veri çek

#### 10. Ürün Kataloğu Sayfası
**Dosya:** `app/products/page.tsx`
**Eksik Özellikler:**
- Kategori filtreleme
- Fiyat aralığı filtreleme
- Arama
- Sıralama
- Grid/List görünüm

#### 11. Sepet Sayfası
**Dosya:** `app/cart/page.tsx`
**Eksik Özellikler:**
- Miktar güncelleme
- Ürün silme
- Toplam hesaplama
- Checkout akışı

#### 12. Sipariş Yönetimi
**Dosya:** `app/orders/page.tsx` (YOK)
**Gerekli:** Sipariş listesi ve detay sayfaları

#### 13. Raporlar Sayfası
**Dosya:** `app/reports/page.tsx`
**Eksik:**
- Gerçek API entegrasyonu
- Tarih aralığı filtreleme
- Grafik çeşitleri
- PDF/Excel export

---

### DÜŞÜK ÖNCELİK - Gelecek Özellikler

#### 14. Email/SMS Bildirimleri
**Gerekli:**
- SMTP konfigürasyonu
- Email şablonları
- Bildirim tetikleyicileri (onay bekliyor, onaylandı, reddedildi)

#### 15. Dosya Ekleri
**Gerekli:**
- S3 veya local storage
- Dosya upload bileşeni
- Taleplere dosya ekleme
- Dosya önizleme

#### 16. Excel/PDF Export
**Gerekli:**
- Rapor dışa aktarım
- Talep listesi export
- Fatura oluşturma

#### 17. Audit Logging
**Gerekli:**
- İşlem geçmişi kaydı
- Kim, ne zaman, ne yaptı
- Değişiklik logları

#### 18. Register Sayfası
**Dosya:** `app/register/page.tsx` (YOK)
**Sorun:** Login'de link var ama sayfa yok

#### 19. Profil Sayfası
**Dosya:** `app/profile/page.tsx` (YOK)
**Gerekli:** Kullanıcı profil düzenleme

#### 20. Şifre Sıfırlama
**Eksik:** Şifremi unuttum akışı

---

### TEKNİK BORÇ

#### 21. Error Boundary
**Eksik:** Global hata yakalama

#### 22. Loading States
**Eksik:** Skeleton loader'lar

#### 23. Form Validasyon
**Eksik:** Zod schema'ları client-side'da kullanılmıyor

#### 24. Responsive Design
**Kontrol Et:** Mobil uyumluluk

#### 25. SEO
**Eksik:** Sayfa bazlı metadata

#### 26. Testing
**Eksik:** Unit ve E2E testler

#### 27. Error Messages
**İyileştir:** Türkçe hata mesajları

---

### ÖNCELİK SIRASI (Cursor için Önerilen Geliştirme Sırası)

~~1. types/index.ts düzelt~~ ✅ TAMAMLANDI
~~2. AuthContext'i gerçek API'ye bağla~~ ✅ TAMAMLANDI
~~3. Eksik API client fonksiyonlarını ekle~~ ✅ TAMAMLANDI
~~4. /requests/pending sayfası oluştur~~ ✅ TAMAMLANDI

**SIRADA - Cursor ile devam edilecek:**
5. Satın alma talebi formunu tamamla (`app/requests/new/page.tsx`)
6. Onay arayüzünü geliştir (`app/requests/[id]/page.tsx`)
7. Dashboard'u gerçek veriye bağla (`app/dashboard/page.tsx`)
8. Bütçe yönetim ekranları (`app/admin/budgets/`)
9. Raporları geliştir (`app/reports/`)
10. Register sayfası (`app/register/page.tsx`)
11. Sipariş yönetimi (`app/orders/`)
12. Profil sayfası ve şifre sıfırlama
13. Email bildirimleri
14. Dosya ekleri sistemi
15. Testing ve error handling

---

---

## 26. Bileşen Props ve Kullanım Detayları

### DashboardLayout
```typescript
// components/DashboardLayout.tsx
interface Props {
  children: React.ReactNode
}

// Özellikler:
// - Kullanıcı login kontrolü yapar
// - Login değilse /login'e yönlendirir
// - Sidebar + main içerik yapısı
// - Otomatik auth redirect
```

**Kullanım:**
```tsx
<DashboardLayout>
  <YourPageContent />
</DashboardLayout>
```

### DataTable
```typescript
// components/DataTable.tsx
interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
  searchable?: boolean
  searchPlaceholder?: string
}

// Özellikler:
// - Generic tip desteği
// - Sıralama (asc/desc)
// - Arama filtreleme
// - Özel render fonksiyonları
// - Satır tıklama eventi
```

**Kullanım:**
```tsx
const columns = [
  { key: 'name', label: 'Ad', sortable: true },
  {
    key: 'status',
    label: 'Durum',
    render: (value) => <Badge>{value}</Badge>
  },
]

<DataTable
  data={myData}
  columns={columns}
  searchable
  searchPlaceholder="İsim ara..."
  onRowClick={(row) => router.push(`/details/${row.id}`)}
/>
```

### StatCard
```typescript
// components/StatCard.tsx
interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}
```

**Kullanım:**
```tsx
<StatCard
  title="Toplam Talepler"
  value={125}
  subtitle="Bu ay"
  icon={ShoppingCart}
  color="blue"
  trend={{ value: 12, isPositive: true }}
/>
```

### Modal
```typescript
// components/Modal.tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  footer?: React.ReactNode
}

// Boyutlar: sm (max-w-md), md (max-w-lg), lg (max-w-2xl), xl (max-w-4xl), full (max-w-7xl)
```

**Kullanım:**
```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Talep Detayları"
  size="lg"
  footer={
    <>
      <button onClick={onCancel}>İptal</button>
      <button onClick={onSave}>Kaydet</button>
    </>
  }
>
  <FormContent />
</Modal>
```

---

## 27. Context'ler ve Hook'lar

### AuthContext (contexts/AuthContext.tsx)
```typescript
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

// Hook
export function useAuth(): AuthContextType
```

**Kullanım:**
```tsx
'use client'
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />
  }

  return <div>Hoşgeldin {user.name}</div>
}
```

### NotificationContext (contexts/NotificationContext.tsx)
```typescript
type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

// Hook
export function useNotification(): NotificationContextType
```

**Kullanım:**
```tsx
'use client'
import { useNotification } from '@/contexts/NotificationContext'

function MyComponent() {
  const { success, error } = useNotification()

  const handleSave = async () => {
    try {
      await saveData()
      success('Kaydedildi!')
    } catch (e) {
      error('Kayıt başarısız')
    }
  }
}
```

**Stil Varyantları:**
- success: yeşil arkaplan
- error: kırmızı arkaplan
- warning: sarı arkaplan
- info: mavi arkaplan

---

## 28. Mock Data Yapısı (lib/mockData.ts)

### Mevcut Mock Veriler
```typescript
// Şirketler
export const mockCompanies = [
  {
    id: 'company1',
    name: 'Attelia Dental Merkez',
    slug: 'attelia-merkez',
    email: 'merkez@attelia.com',
    phone: '+90 312 123 45 67',
    city: 'Ankara'
  },
  // ...
]

// Departmanlar
export const mockDepartments = [
  { id: 'dept1', name: 'Bilgi İşlem', code: 'IT', companyId: 'company1', budget: 50000, spent: 15000 },
  { id: 'dept2', name: 'Satın Alma', code: 'PROC', companyId: 'company1', budget: 200000, spent: 75000 },
  { id: 'dept3', name: 'İnsan Kaynakları', code: 'HR', companyId: 'company1', budget: 30000, spent: 12000 },
  { id: 'dept4', name: 'Finans', code: 'FIN', companyId: 'company1', budget: 100000, spent: 45000 },
]

// Satın Alma Talepleri
export const mockPurchaseRequests = [
  {
    id: 'pr1',
    requestNumber: 'PR202411001',
    title: 'Yeni Laptop Talebi',
    description: 'Yazılım geliştirme için güçlü laptop',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    estimatedTotal: 35000,
    requester: { name: 'John Doe', department: 'Bilgi İşlem' },
    department: 'Bilgi İşlem',
    currentStep: 0,
    createdAt: '2024-11-01T10:00:00Z',
    items: [
      { name: 'Dell Latitude 5430', quantity: 1, unitPrice: 35000, total: 35000 }
    ],
    approvalActions: []
  },
  // ...
]

// Ürünler
export const mockProducts = [
  {
    id: 'prod1',
    name: 'Dell Latitude 5430 Laptop',
    slug: 'dell-latitude-5430',
    sku: 'IT-DELL-5430',
    price: 35000,
    discountPrice: 32000,
    stock: 10,
    category: { name: 'Bilgisayar ve Donanım' },
    // ...
  },
]

// Kategoriler
export const mockCategories = [
  { id: 'cat1', name: 'Ofis Malzemeleri', slug: 'ofis-malzemeleri', productCount: 125 },
  { id: 'cat2', name: 'Bilgisayar ve Donanım', slug: 'bilgisayar-donanim', productCount: 87 },
  { id: 'cat3', name: 'Dental Malzemeler', slug: 'dental-malzemeler', productCount: 234 },
  { id: 'cat4', name: 'Temizlik Malzemeleri', slug: 'temizlik', productCount: 56 },
]

// Bütçe Verileri
export const mockBudgetData = {
  company: {
    total: 2000000,
    spent: 850000,
    reserved: 300000,
    available: 850000,
    utilizationPercent: 42.5
  },
  departments: [
    {
      name: 'Bilgi İşlem',
      budget: 50000,
      spent: 15000,
      reserved: 10000,
      available: 25000,
      utilization: 30,
      status: 'normal'
    },
    // ...
  ]
}

// Rapor Verileri
export const mockReportData = {
  purchaseSummary: {
    byStatus: [...],
    byDepartment: [...],
    avgApprovalTime: 2.5,
    topProducts: [...]
  },
  approvalPerformance: {
    approvers: [
      {
        name: 'Mehmet Demir',
        role: 'IT Manager',
        totalActions: 45,
        approved: 38,
        rejected: 5,
        returned: 2,
        approvalRate: 84.4,
        avgResponseTime: 1.8
      },
      // ...
    ]
  }
}
```

### Yardımcı Fonksiyonlar
```typescript
// Tip bazlı veri getirme
export const getMockData = (type: string) => {
  switch (type) {
    case 'companies': return mockCompanies
    case 'departments': return mockDepartments
    case 'requests': return mockPurchaseRequests
    case 'products': return mockProducts
    case 'categories': return mockCategories
    case 'budget': return mockBudgetData
    case 'reports': return mockReportData
    default: return []
  }
}

// Gecikme simülasyonu
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API çağrısı
export const mockApiCall = async <T,>(data: T, delayMs = 500): Promise<T> => {
  await delay(delayMs)
  return data
}
```

---

## 29. Durum Renkleri ve Etiketleri

### RequestStatus
```typescript
const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Taslak',
  SUBMITTED: 'Gönderildi',
  IN_REVIEW: 'İncelemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  CANCELLED: 'İptal Edildi',
  COMPLETED: 'Tamamlandı',
}
```

### OrderStatus
```typescript
const orderStatusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  PROCESSING: 'İşleniyor',
  SHIPPED: 'Kargoya Verildi',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
  REFUNDED: 'İade Edildi',
}
```

### Priority
```typescript
const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  NORMAL: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
}

const priorityLabels: Record<string, string> = {
  LOW: 'Düşük',
  NORMAL: 'Normal',
  HIGH: 'Yüksek',
  URGENT: 'Acil',
}
```

---

## 30. Dashboard Sayfası Yapısı

### Bölümler
1. **Header** - Sayfa başlığı ve açıklama
2. **Stats Grid** - 4'lü istatistik kartları
3. **Charts Grid** - Bütçe kullanımı ve durum dağılımı grafikleri
4. **Budget Alert** - Bütçe uyarı bildirimi
5. **Recent Requests** - Son 5 talep tablosu
6. **Quick Actions** - 3'lü hızlı eylem butonları

### Kullanılan Kütüphaneler
- **Recharts**: BarChart, PieChart, ResponsiveContainer
- **Lucide React**: İkonlar

### Grafik Renk Paleti
```typescript
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
// Blue, Green, Yellow, Red, Purple
```

---

## 31. Para Birimi ve Tarih Formatları

### Para Birimi (TRY)
```typescript
// Sayıyı TL formatına çevir
value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
// Örnek: 35000 → "₺35.000,00"
```

### Tarih Formatları
```typescript
// ISO string'den tarihe
const date = new Date('2024-11-01T10:00:00Z')

// Türkçe format
date.toLocaleDateString('tr-TR')  // "01.11.2024"
date.toLocaleTimeString('tr-TR')  // "13:00:00"
```

---

## 32. Tailwind Özel Renkler

### tailwind.config.ts
```typescript
colors: {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  dental: {
    blue: '#1e40af',
    light: '#60a5fa',
    dark: '#1e3a8a',
  },
}
```

---

## 33. API Route Handler Pattern'leri

### Temel GET Handler
```typescript
export async function GET(request: NextRequest) {
  try {
    // 1. Token doğrulama
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Query parametreleri
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    // 3. Rol bazlı filtreleme
    const where: any = { companyId: decoded.companyId }
    if (decoded.role === 'EMPLOYEE') {
      where.requesterId = decoded.userId
    }

    // 4. Veritabanı sorgusu
    const [data, total] = await Promise.all([
      prisma.model.findMany({
        where,
        include: { /* relations */ },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.model.count({ where }),
    ])

    // 5. Response
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

### Temel POST Handler
```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Token doğrulama
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Body parsing
    const body = await request.json()

    // 3. Validasyon
    if (!body.requiredField) {
      return NextResponse.json({ error: 'requiredField is required' }, { status: 400 })
    }

    // 4. Yetki kontrolü (opsiyonel)
    if (!['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 5. Veritabanı işlemi
    const data = await prisma.model.create({
      data: {
        ...body,
        companyId: decoded.companyId,
        createdById: decoded.userId,
      },
    })

    // 6. Response
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

---

## 34. Sık Kullanılan Import'lar

### Sayfa Bileşenleri
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import Loading from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
```

### API Route'ları
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, hashPassword } from '@/lib/auth'
```

### İkonlar (Lucide)
```typescript
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Settings,
  BarChart3,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  X,
  LogOut,
} from 'lucide-react'
```

---

---

## 36. Root Layout ve App Yapısı

### app/layout.tsx
```typescript
import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Attelia - Enterprise Satın Alma Yönetimi',
  description: 'Çok aşamalı onay sistemi ile kurumsal satın alma platformu',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

### app/page.tsx (Ana Sayfa)
```typescript
// Otomatik olarak /login'e yönlendirir
export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.push('/login')
  }, [router])
  // Loading spinner gösterir
}
```

### components/Providers.tsx
```typescript
// Context provider sıralaması ÖNEMLİ
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>  {/* Dışta */}
      <AuthProvider>         {/* İçte */}
        {children}
      </AuthProvider>
    </NotificationProvider>
  )
}
```

---

## 37. Utility Fonksiyonları (lib/utils.ts)

```typescript
import { clsx, type ClassValue } from 'clsx'

// Tailwind class birleştirme
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Para formatı
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(numPrice)
}
// Örnek: formatPrice(35000) → "₺35.000,00"

// Tarih formatı
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}
// Örnek: formatDate('2024-11-01') → "1 Kasım 2024"

// Türkçe karakterli slug oluşturma
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
// Örnek: generateSlug('Ürün Adı') → "urun-adi"

// Sipariş numarası oluşturma
export function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ATL${year}${month}${day}${random}`
}
// Örnek: "ATL202411200001"
```

---

## 38. Login Sayfası Detayları

### Quick Login Butonları
```typescript
const quickLogins = [
  { email: 'admin@attelia.com', role: 'Company Admin' },
  { email: 'john.doe@attelia.com', role: 'Employee' },
  { email: 'it.manager@attelia.com', role: 'IT Manager' },
  { email: 'finance@attelia.com', role: 'Finance Manager' },
]

// Tıklandığında formu doldurur
onClick={() => {
  setEmail(account.email)
  setPassword('password123')
}}
```

### UI Yapısı
- **Sol Panel (lg:w-1/2)**: Marka bilgisi, 3 özellik (Çok Aşamalı Onay, 3 Katmanlı Bütçe, Detaylı Raporlama)
- **Sağ Panel**: Login formu + Quick login grid

---

## 39. Seed Verileri Detayları (prisma/seed.ts)

### Oluşturulan Veriler

#### Şirketler
```typescript
company1: {
  name: 'Attelia Dental Merkez',
  slug: 'attelia-merkez',
  city: 'Ankara',
  settings: { currency: 'TRY', timezone: 'Europe/Istanbul', fiscalYearStart: 1 }
}

company2: {
  name: 'Attelia Dental İstanbul',
  slug: 'attelia-istanbul',
  city: 'İstanbul'
}
```

#### Departmanlar (Company 1)
| Kod | Ad | Aylık Bütçe | Yıllık Bütçe |
|-----|-----|-------------|--------------|
| IT | Bilgi İşlem | 50.000 ₺ | 600.000 ₺ |
| PROC | Satın Alma | 200.000 ₺ | 2.400.000 ₺ |
| HR | İnsan Kaynakları | 30.000 ₺ | 360.000 ₺ |
| FIN | Finans | 100.000 ₺ | 1.200.000 ₺ |

#### Kullanıcılar (Company 1)
| Email | Ad | Rol | Departman | Employee ID |
|-------|-----|-----|-----------|-------------|
| superadmin@attelia.com | Super Admin | SUPER_ADMIN | - | - |
| admin@attelia.com | Ahmet Yıldırım | COMPANY_ADMIN | - | - |
| it.manager@attelia.com | Mehmet Demir | DEPARTMENT_MANAGER | IT | EMP001 |
| procurement@attelia.com | Ayşe Kaya | PROCUREMENT_MANAGER | PROC | EMP002 |
| finance@attelia.com | Can Öztürk | FINANCE_MANAGER | FIN | EMP003 |
| john.doe@attelia.com | John Doe | EMPLOYEE | IT | EMP004 |
| jane.smith@attelia.com | Jane Smith | EMPLOYEE | HR | EMP005 |

#### Onay İş Akışları (WORKFLOW)
| Ad | Tutar Aralığı | Adımlar |
|-----|---------------|---------|
| Standart Onay | 0 - 10.000 ₺ | 1. Departman Müdürü |
| İki Aşamalı Onay | 10.000 - 50.000 ₺ | 1. Departman Müdürü → 2. Satın Alma Müdürü |
| Üç Aşamalı Onay | 50.000+ ₺ | 1. Departman Müdürü → 2. Satın Alma Müdürü → 3. Finans Müdürü |

#### Kategoriler
1. Ofis Malzemeleri (ofis-malzemeleri)
2. Bilgisayar ve Donanım (bilgisayar-donanim)
3. Dental Malzemeler (dental-malzemeler)
4. Temizlik Malzemeleri (temizlik-malzemeleri)

#### Ürünler
| SKU | Ad | Fiyat | Stok | Kategori |
|-----|-----|-------|------|----------|
| OFF-A4-500 | A4 Kağıt (500 sayfa) | 45.90 ₺ | 500 | Ofis |
| IT-DELL-5430 | Dell Latitude 5430 Laptop | 35.000 ₺ | 10 | Bilgisayar |
| IT-LG-27 | LG 27" Monitor | 4.500 ₺ | 25 | Bilgisayar |
| DEN-GLOVE-100 | Dental Eldiven (100lü) | 125 ₺ | 1000 | Dental |

#### Örnek Satın Alma Talepleri
1. **PR{YYYY}{MM}0001** - Yeni Laptop Talebi (35.000 ₺, HIGH, SUBMITTED)
2. **PR{YYYY}{MM}0002** - Ofis Malzemeleri (500 ₺, NORMAL, DRAFT)

---

## 40. Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",           // Geliştirme sunucusu (localhost:3000)
    "build": "next build",       // Production build
    "start": "next start",       // Production sunucu
    "lint": "next lint",         // ESLint kontrolü
    "db:migrate": "prisma migrate dev",   // Migration oluştur ve uygula
    "db:seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
    "db:studio": "prisma studio",         // Veritabanı görsel arayüz (localhost:5555)
    "db:reset": "prisma migrate reset"    // Veritabanını sıfırla ve seed
  }
}
```

### Tam Dependency Listesi
```json
{
  "dependencies": {
    "@prisma/client": "^5.11.0",
    "bcryptjs": "^2.4.3",
    "clsx": "^2.1.0",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.263.1",
    "next": "^14.2.0",
    "next-auth": "^4.24.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "recharts": "^3.3.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.4.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.6",
    "eslint": "^8.57.0",
    "ts-node": "^10.9.2"
  }
}
```

---

## 41. Talep Numarası Formatları

### PurchaseRequest
```
PR{YYYY}{MM}{XXXX}
Örnek: PR202411001
```

### Order
```
ATL{YYYY}{MM}{DD}{XXXX}
Örnek: ATL202411200001
```

---

## 42. Dosya İsimlendirme Kuralları

### Sayfalar
- `page.tsx` - Her route için ana sayfa
- `[param]/page.tsx` - Dinamik route

### Bileşenler
- PascalCase: `DataTable.tsx`, `StatCard.tsx`

### Kütüphaneler
- camelCase: `api.ts`, `auth.ts`, `mockData.ts`

### API Routes
- `route.ts` - Her endpoint için

---

## 43. İletişim ve Destek

- **Proje Adı:** Attelia Dental - Enterprise Satın Alma Yönetim Platformu
- **Versiyon:** 1.0.0
- **Dokümantasyon:** CURSOR_DOCUMENTATION.md (bu dosya)
- **README:** README.md
- **Deployment:** DEPLOYMENT.md
- **Tüm şifreler:** password123
