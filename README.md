# 🏥 Attelia Dental - Enterprise Satın Alma Yönetim Platformu

**Kurumsal düzeyde, multi-tenant, tam özellikli satın alma ve onay yönetim sistemi** - Görsel workflow designer, white-label özelleştirme, otomatik email bildirimleri ve akıllı onay yönetimi ile.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![ReactFlow](https://img.shields.io/badge/ReactFlow-FF0080?style=flat&logo=react&logoColor=white)](https://reactflow.dev/)

---

## 🌟 Temel Özellikler

### 🎨 White-Label Customization (NEW!)
✅ **Tam marka özelleştirmesi** - Her şirket kendi markasıyla
- Logo ve favicon yükleme (Vercel Blob storage)
- 6 tema rengi özelleştirme (primary, secondary, accent, success, warning, error)
- Özel font seçimi (7 Google Font)
- Sidebar ve header renk özelleştirme
- Özel CSS/JS desteği
- Dark mode hazırlığı
- Gerçek zamanlı tema önizleme

### 📧 Akıllı Email Bildirim Sistemi (NEW!)
✅ **Tam özellikli email entegrasyonu** - Her adımda otomatik bildirim
- Multi-channel destek (Email, SMS, WhatsApp, In-App - hazır)
- Template yönetim sistemi (şirket özel)
- Variable replacement engine ({{user.name}}, {{request.amount}})
- Gmail, SendGrid, Custom SMTP desteği
- Delivery tracking ve audit trail
- Onay/red bildirimleri
- Email gönderim logları

### 🎨 Visual Workflow Designer (NEW!)
✅ **Sürükle-bırak workflow tasarımı** - ReactFlow tabanlı
- 8 node tipi (Start, End, Approval, Decision, Notification, Wait, Parallel)
- Gerçek zamanlı validasyon
- Workflow versiyonlama
- JSON export/import
- Drag-drop canvas
- Minimap ve zoom kontrolleri
- Node yapılandırma panelleri
- Görsel workflow yönetim sayfası

#### Node Tipleri
- **Start Node**: Workflow başlangıcı
- **Approval Node**: Onay alma (role-based, user-based, dynamic)
  - Threshold: all, any, majority, count, weighted
  - Multi-approver desteği
  - Timeout ve escalation
- **Decision Node**: Koşullu dallanma
  - Operators: ==, !=, >, <, >=, <=, contains, in
  - AND/OR logic
  - Variable-based branching
- **Notification Node**: Multi-channel bildirim
- **Wait Node**: Zaman gecikmesi
- **Parallel Split/Join**: Paralel workflow desteği
- **End Node**: Workflow tamamlama

### ⚙️ Workflow Execution Engine (NEW!)
✅ **Gerçek zamanlı workflow çalıştırma** - Tam otomatik
- Purchase request'e bağlı otomatik başlatma
- State machine tabanlı execution
- Dynamic approver resolution
- Threshold-based approval logic
- Condition evaluation engine
- Parallel workflow support (hazır)
- Workflow instance tracking
- Task assignment ve due dates
- Auto-continuation after approvals
- Audit trail (completed nodes)

### 🏢 Multi-Tenant Altyapı
✅ Tek platformda birden fazla şirket/organizasyon
✅ Tamamen izole veri yapısı (her şirket kendi verileri)
✅ Şirket bazlı ayarlar ve yapılandırma
✅ Şirket bazlı kullanıcı, departman ve ürün yönetimi
✅ White-label branding desteği

### 💰 3 Katmanlı Bütçe Yönetimi

#### 1. Şirket Bazlı Bütçe
- Şirket geneli bütçe planlama
- Kategori bazlı bütçe tanımlama (IT, Operasyonel, Genel)
- Aylık/yıllık bütçe takibi
- Gerçek zamanlı harcama analizi

#### 2. Departman Bazlı Bütçe
- Her departman için ayrı bütçe
- Hiyerarşik departman yapısı
- Departman müdürü onay yetkisi
- Alt departman bütçe dağılımı

#### 3. Kişi/Kullanıcı Bazlı Bütçe
- Çalışan bazında bütçe limitleri
- Kişisel harcama takibi
- Aylık/yıllık kişisel limit kontrolü

### 📁 Satın Alım Kategori Sistemi

**Hiyerarşik Kategori Yapısı:**
```
├── IT ve Teknoloji
│   ├── Donanım
│   │   ├── Bilgisayar (Limit: 100K/ay)
│   │   ├── Server (Limit: 200K/ay)
│   │   └── Network (Limit: 50K/ay)
│   └── Yazılım
│       ├── Lisanslar (Min Onay: 5K)
│       └── SaaS (Min Onay: 1K)
├── Ofis Malzemeleri
│   ├── Kırtasiye (Onaysız: <500₺)
│   └── Mobilya (Min Onay: 2K)
└── Operasyonel Giderler
    ├── Temizlik
    └── Bakım-Onarım
```

**Kategori Özellikleri:**
- ✅ Sınırsız seviye desteği
- ✅ Kategori bazlı bütçe limitleri
- ✅ Otomatik onay gereksinimleri
- ✅ Minimum onay tutarı tanımlama
- ✅ Kategori bazlı erişim kontrolü

### 📋 Gelişmiş Onay Sistemi

**İki Onay Sistemi:**
1. **Legacy Workflow**: Tutar bazlı otomatik workflow
2. **Visual Workflow**: Sürükle-bırak tasarımı (NEW!)

**Legacy Workflow - Tutar Bazlı:**
- 0-10,000₺: Departman Müdürü
- 10,000-50,000₺: Departman + Satın Alma Müdürü
- 50,000₺+: Departman + Satın Alma + Finans Müdürü

**Visual Workflow Özellikleri:**
- ✅ Görsel tasarım (drag-drop)
- ✅ 8 node tipi
- ✅ Gerçek zamanlı validasyon
- ✅ Multi-approver coordination
- ✅ Dynamic approval routing
- ✅ Condition-based branching
- ✅ Parallel workflow support
- ✅ Automatic email notifications
- ✅ Task tracking & due dates
- ✅ Workflow versioning
- ✅ Audit trail

### 📊 Kapsamlı Raporlama

#### Satın Alma Raporları
- Durum bazlı analizler (onayda, onaylandı, reddedildi)
- Departman bazlı harcama grafikleri
- Öncelik bazlı talep dağılımı
- En çok talep edilen ürünler
- Ortalama onay süreleri

#### Bütçe Raporları
- 3 katmanlı bütçe kullanım raporları
- Departman bazlı harcama vs bütçe
- Kişi bazında harcama takibi
- Kategori bazında limit kontrolü
- Kritik/uyarı seviyeleri ve alerts

#### Onay Performans Raporları
- Onaylayıcı performans analizi
- Onay/red oranları
- Ortalama yanıt süreleri
- Darboğaz (bottleneck) tespiti
- Onay zinciri analizi

### 👥 Gelişmiş Rol Yönetimi

| Rol | Yetki Seviyesi | Açıklama |
|-----|----------------|----------|
| **SUPER_ADMIN** | Platform | Tüm şirketlere erişim |
| **COMPANY_ADMIN** | Şirket | Şirket içi tam yetki |
| **GENERAL_MANAGER** | Üst Düzey | Tüm onaylar, raporlar |
| **FINANCE_MANAGER** | Mali | Mali onaylar, bütçe |
| **PROCUREMENT_MANAGER** | Satın Alma | Tedarikçi, onay |
| **DEPARTMENT_MANAGER** | Departman | Departman onayları |
| **EMPLOYEE** | Temel | Talep oluşturma |

### 🛒 E-Ticaret Modülü

- ✅ Ürün kataloğu (şirket bazında)
- ✅ Gelişmiş arama ve filtreleme
- ✅ Kategori yönetimi (hiyerarşik)
- ✅ Sepet sistemi
- ✅ Ürün görselleri ve detay sayfaları
- ✅ Stok takibi
- ✅ Toptan fiyat desteği
- ✅ Minimum sipariş adedi
- ✅ Ürün değerlendirme ve yorumlar

---

## 🛠️ Teknoloji Stack

| Kategori | Teknoloji |
|----------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Lucide Icons |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL 14+ |
| **ORM** | Prisma |
| **Auth** | JWT, bcryptjs |
| **Validation** | Zod |
| **Email** | Nodemailer v7, SendGrid/Gmail |
| **File Storage** | Vercel Blob |
| **Workflow** | ReactFlow |
| **Charts** | Recharts |

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- npm veya yarn

### Kurulum

```bash
# 1. Repoyu klonlayın
git clone <repository-url>
cd Sat-nAlmaCozumleri

# 2. Bağımlılıkları yükleyin
npm install --legacy-peer-deps

# 3. PostgreSQL database oluşturun
psql -U postgres
CREATE DATABASE attelia_dental;
\q

# 4. Environment variables
cp .env.example .env
# .env dosyasını düzenleyin (aşağıya bakın)

# 5. Database migration
npx prisma generate
npx prisma migrate dev --name init

# 6. Seed data (2 şirket, kullanıcılar, departmanlar, ürünler, workflows)
npm run db:seed

# 7. Development server
npm run dev
```

Uygulama: [http://localhost:3000](http://localhost:3000)

### Environment Variables (.env)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/attelia_dental?schema=public"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (Choose one)
# Option 1: Gmail
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"
SMTP_FROM="your-email@gmail.com"

# Option 2: SendGrid
# SMTP_HOST="smtp.sendgrid.net"
# SMTP_PORT="587"
# SMTP_USER="apikey"
# SMTP_PASS="your-sendgrid-api-key"
# SMTP_FROM="noreply@yourdomain.com"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# App
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Email Setup için:**
- Gmail: [App-specific password oluşturun](https://myaccount.google.com/apppasswords)
- SendGrid: [API key alın](https://sendgrid.com/docs/ui/account-and-settings/api-keys/)

**Vercel Blob Setup:**
1. [Vercel dashboard](https://vercel.com/dashboard)'a gidin
2. Storage → Create → Blob
3. Token'ı kopyalayın

---

## 📁 Proje Yapısı

```
Sat-nAlmaCozumleri/
├── app/
│   ├── api/                              # Backend API
│   │   ├── auth/                        # Authentication
│   │   ├── products/                    # Ürün yönetimi
│   │   ├── categories/                  # Kategori yönetimi
│   │   ├── departments/                 # Departman yönetimi
│   │   ├── purchase-requests/           # Satın alma talepleri
│   │   │   ├── [requestId]/
│   │   │   │   └── approve/            # Onay endpoint
│   │   │   └── route.ts
│   │   ├── settings/                    # White-label settings (NEW!)
│   │   │   ├── logo/
│   │   │   └── favicon/
│   │   ├── workflows/                   # Visual workflows (NEW!)
│   │   │   ├── visual/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── activate/
│   │   │   │   └── route.ts
│   │   │   └── tasks/                   # Workflow tasks (NEW!)
│   │   │       ├── my-tasks/
│   │   │       └── [taskId]/decide/
│   │   └── reports/                     # Raporlama
│   │       ├── purchase-summary/
│   │       ├── budget/
│   │       └── approval-performance/
│   ├── admin/
│   │   ├── settings/                    # White-label UI (NEW!)
│   │   └── workflows/                   # Workflow management (NEW!)
│   │       ├── designer/                # Visual designer (NEW!)
│   │       └── page.tsx                 # Workflow list (NEW!)
│   ├── products/                        # Ürün sayfaları
│   ├── cart/                            # Sepet
│   ├── layout.tsx                       # Dynamic theming (NEW!)
│   └── page.tsx
├── components/                           # React components
│   ├── workflow/nodes/                  # ReactFlow nodes (NEW!)
│   │   ├── StartNode.tsx
│   │   ├── EndNode.tsx
│   │   ├── ApprovalNode.tsx
│   │   ├── DecisionNode.tsx
│   │   ├── NotificationNode.tsx
│   │   ├── WaitNode.tsx
│   │   ├── ParallelSplitNode.tsx
│   │   ├── ParallelJoinNode.tsx
│   │   └── index.ts
│   ├── Header.tsx
│   ├── Sidebar.tsx                      # Dynamic logo (NEW!)
│   └── ProductCard.tsx
├── lib/                                  # Utilities
│   ├── prisma.ts
│   ├── auth.ts
│   ├── utils.ts
│   ├── blob.ts                          # File upload (NEW!)
│   ├── theme.ts                         # Theme generation (NEW!)
│   ├── email.ts                         # Email sending (NEW!)
│   ├── email-templates.ts               # Email templates (NEW!)
│   ├── notifications.ts                 # Notification API (NEW!)
│   ├── workflow-types.ts                # Workflow types (NEW!)
│   ├── workflow-validator.ts            # Validation (NEW!)
│   └── workflow-executor.ts             # Execution engine (NEW!)
├── prisma/
│   ├── schema.prisma                    # Database schema
│   └── seed.ts                          # Seed script
├── docs/                                 # Documentation (NEW!)
│   ├── PRD.md                           # Product requirements
│   ├── GAP_ANALYSIS.md                  # Gap analysis
│   ├── SPRINT_PLAN_PHASE1.md           # Sprint plan
│   ├── PROGRESS_REPORT.md              # Progress tracking
│   └── SESSION_SUMMARY.md              # Session summary
└── types/
    └── index.ts
```

---

## 🗄️ Database Schema

### Ana Modeller

#### Multi-Tenancy
- **Company** - Şirket/organizasyon
- **CompanySettings** - White-label ayarları (NEW!)

#### Kullanıcı Yönetimi
- **User** - Kullanıcılar (company scoped)
- **Department** - Departmanlar (hiyerarşik)

#### Bütçe Yönetimi (3 Katman)
- **CompanyBudget** - Şirket bazlı bütçe
- **Budget** - Departman bazlı bütçe
- **UserBudget** - Kişi bazlı bütçe

#### Satın Alma
- **PurchaseRequest** - Satın alma talepleri
- **PurchaseRequestItem** - Talep kalemleri
- **PurchaseCategory** - Satın alım kategorileri (hiyerarşik)

#### Onay Sistemi
- **ApprovalWorkflow** - İş akışı tanımları (visual support)
- **ApprovalStep** - Onay adımları (legacy)
- **ApprovalAction** - Onay/red aksiyonları (legacy)
- **WorkflowInstance** - Workflow runtime tracking (NEW!)
- **WorkflowTask** - Approval tasks (NEW!)

#### Bildirim Sistemi (NEW!)
- **NotificationTemplate** - Email templates
- **NotificationLog** - Delivery tracking

#### E-Ticaret
- **Category** - Ürün kategorileri
- **Product** - Ürünler
- **CartItem** - Sepet
- **Order** - Siparişler
- **OrderItem** - Sipariş detayları

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register      # Kullanıcı kaydı
POST   /api/auth/login         # Giriş
```

### Purchase Requests
```
GET    /api/purchase-requests              # Liste (role-based)
POST   /api/purchase-requests              # Yeni talep (auto-start workflow!)
GET    /api/purchase-requests/[id]         # Detay
PUT    /api/purchase-requests/[id]         # Güncelle
POST   /api/purchase-requests/[id]/approve # Onayla/Reddet
```

### White-Label Settings (NEW!)
```
GET    /api/settings           # Get company settings
PUT    /api/settings           # Update settings (admin)
POST   /api/settings/logo      # Upload logo
DELETE /api/settings/logo      # Delete logo
POST   /api/settings/favicon   # Upload favicon
DELETE /api/settings/favicon   # Delete favicon
```

### Visual Workflows (NEW!)
```
GET    /api/workflows/visual              # List workflows
POST   /api/workflows/visual              # Create workflow
GET    /api/workflows/visual/[id]         # Get workflow
PUT    /api/workflows/visual/[id]         # Update workflow
DELETE /api/workflows/visual/[id]         # Delete workflow
POST   /api/workflows/visual/[id]/activate # Activate/deactivate
```

### Workflow Tasks (NEW!)
```
GET    /api/workflows/tasks/my-tasks      # My pending tasks
POST   /api/workflows/tasks/[id]/decide   # Approve/reject task
```

### Departments
```
GET    /api/departments        # Departman listesi
POST   /api/departments        # Yeni departman (Admin)
```

### Reports
```
GET    /api/reports/purchase-summary        # Satın alma özeti
GET    /api/reports/budget                  # Bütçe raporu
GET    /api/reports/approval-performance    # Onay performansı
```

### Products
```
GET    /api/products           # Ürün listesi (filtered by company)
GET    /api/products/[slug]    # Ürün detayı
POST   /api/products           # Yeni ürün (Admin)
```

---

## 👤 Demo Kullanıcıları

### Attelia Dental Merkez

| Rol | Email | Şifre |
|-----|-------|-------|
| Super Admin | superadmin@attelia.com | password123 |
| Company Admin | admin@attelia.com | password123 |
| IT Manager | it.manager@attelia.com | password123 |
| Procurement | procurement@attelia.com | password123 |
| Finance | finance@attelia.com | password123 |
| Employee | john.doe@attelia.com | password123 |

### Attelia Dental İstanbul

| Rol | Email | Şifre |
|-----|-------|-------|
| Company Admin | admin@attelia-istanbul.com | password123 |

---

## 🎨 Visual Workflow Kullanımı

### 1. Workflow Oluşturma
```
Admin → Workflow Designer → Yeni Workflow
1. Drag-drop node'ları canvas'a
2. Node'ları birbirine bağla
3. Her node'u yapılandır
4. Validate et
5. Kaydet
6. Aktif et
```

### 2. Workflow Çalıştırma
```
Purchase request oluşturulduğunda:
→ Sistem otomatik uygun workflow'u bulur
→ Workflow instance başlatır
→ İlk node'u çalıştırır
→ Approval node'da task oluşturur
→ Onaylayıcılara email gönderir
→ Onay/red bekler
→ Threshold karşılandığında devam eder
→ End node'a ulaşınca tamamlar
```

### 3. Task Yönetimi
```
Onaylayıcı:
→ "Bekleyen Onaylar" sayfasına gider
→ Task'ı görür (requester, amount, priority)
→ Onaylar veya reddeder
→ Comment ekleyebilir
→ Sistem otomatik workflow'u devam ettirir
→ Requester'a email gönderir
```

---

## 🔄 Örnek Workflow Senaryoları

### Senaryo 1: Basit Onay (Tek Approver)
```
[Start] → [Approval: Departman Müdürü] → [End]

Tutar: 5,000₺
Threshold: any (1 kişi yeterli)
→ Departman müdürü onaylar
→ Request APPROVED olur
```

### Senaryo 2: Çok Aşamalı Onay
```
[Start] → [Approval: Departman] → [Approval: Finans] → [End]

Tutar: 50,000₺
Threshold: all (tümü onaylamalı)
→ Departman onaylar
→ Finans onaylar
→ Request APPROVED olur
```

### Senaryo 3: Koşullu Dallanma
```
[Start] → [Decision: amount > 10000?]
          ├─ TRUE → [Approval: Manager] → [End]
          └─ FALSE → [End]

Tutar < 10,000₺:
→ Direkt APPROVED olur (otomatik)

Tutar > 10,000₺:
→ Manager onayı bekler
```

### Senaryo 4: Paralel Onay
```
[Start] → [Parallel Split]
          ├─ [Approval: IT]
          └─ [Approval: Finance]
          → [Parallel Join] → [End]

Threshold: majority (2'den 1'i yeterli)
→ IT veya Finance onayladığında devam eder
```

---

## 📝 Prisma Komutları

```bash
# Prisma Studio (Database GUI)
npx prisma studio

# Migration oluştur
npx prisma migrate dev --name migration_name

# Database reset
npx prisma migrate reset

# Client regenerate
npx prisma generate

# Seed data
npm run db:seed
```

---

## 🔐 Güvenlik

### Role-Based Access Control (RBAC)
- JWT token bazlı authentication
- Rol bazlı endpoint koruması
- Company-scoped data isolation
- Departman bazlı veri erişimi

### Multi-Tenancy Security
- Tüm sorgularda otomatik company filtreleme
- User-company ilişki validasyonu
- Cross-company data leakage önleme
- Workflow task'lerde assignee validation

### File Upload Security
- File type validation (images only)
- File size limits (<5MB)
- Secure file naming
- Company-scoped storage
- Auto-cleanup on update

### Email Security
- Template variable sanitization
- Rate limiting (ready)
- Company-scoped templates
- Delivery tracking

---

## 📊 Performans

- **Database Indexing**: Tüm kritik alanlarda index
- **Query Optimization**: Include/select optimization
- **Pagination**: Tüm list endpoint'lerinde
- **Caching Ready**: Redis integration ready
- **File Storage**: CDN-backed Vercel Blob
- **Email**: Async fire-and-forget pattern

---

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables (Production)
```env
# Database
DATABASE_URL="postgresql://..."

# Auth
JWT_SECRET="strong-secret-key-min-32-chars"
NEXTAUTH_SECRET="nextauth-secret"
NEXTAUTH_URL="https://yourdomain.com"

# Email (SendGrid recommended)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="noreply@yourdomain.com"

# File Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# App
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Deployment Checklist
- [ ] Environment variables ayarlandı
- [ ] Database migration çalıştırıldı
- [ ] Seed data eklendi
- [ ] Email servisi test edildi
- [ ] Vercel Blob token alındı
- [ ] Logo/favicon yükleme test edildi
- [ ] Workflow execution test edildi
- [ ] Multi-tenant isolation doğrulandı

### Vercel Deployment
```bash
# Vercel CLI ile
vercel

# Production
vercel --prod
```

---

## 📈 Roadmap

### ✅ Tamamlandı (Phase 1 MVP - 77%)
- ✅ Multi-tenant altyapı
- ✅ 3 katmanlı bütçe sistemi
- ✅ Çok aşamalı onay sistemi (legacy)
- ✅ Satın alım kategori yönetimi
- ✅ Detaylı raporlama API'ları
- ✅ E-ticaret modülü
- ✅ Sepet yönetimi
- ✅ **White-label customization** (Sprint 1)
- ✅ **Email notification system** (Sprint 2)
- ✅ **Visual workflow designer** (Sprint 3)
- ✅ **Workflow execution engine** (Sprint 4)

### 🔄 Sprint 5 (In Progress)
- 🔄 Testing suite (unit, integration, e2e)
- 🔄 Security audit
- 🔄 Performance optimization
- 🔄 Production deployment
- 🔄 User documentation

### 📅 Phase 2 (Planlanan)
- Node configuration panels (approval, decision, notification)
- Workflow analytics dashboard
- Escalation system (cron-based)
- SMS/WhatsApp notifications
- Document/File attachments
- Gelişmiş raporlama UI (charts, graphs)
- Excel/PDF export
- Audit log UI
- Mobile app
- Vendor/Supplier management
- Contract management
- Invoice management

---

## 📚 Dokümantasyon

Detaylı dokümantasyon için `docs/` klasörüne bakın:

- [PRD.md](docs/PRD.md) - Product Requirements Document
- [GAP_ANALYSIS.md](docs/GAP_ANALYSIS.md) - Gap Analysis
- [SPRINT_PLAN_PHASE1.md](docs/SPRINT_PLAN_PHASE1.md) - 8-Week Sprint Plan
- [PROGRESS_REPORT.md](docs/PROGRESS_REPORT.md) - Implementation Progress
- [SESSION_SUMMARY.md](docs/SESSION_SUMMARY.md) - Session Summary

---

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing`)
5. Pull Request oluşturun

---

## 📄 Lisans

MIT License - [LICENSE](LICENSE)

---

## 📞 İletişim

- Email: info@attelia.com
- GitHub Issues: [Issues](https://github.com/yourusername/attelia-dental/issues)

---

## 🙏 Teşekkürler

- Next.js Team
- Prisma Team
- Tailwind CSS Team
- ReactFlow Team
- Vercel Team
- Open Source Community

---

<div align="center">

**⭐ Enterprise-level Satın Alma Yönetimi ⭐**

**Visual Workflow Designer** • **White-Label** • **Smart Notifications**

Made with ❤️ by Attelia Team

[Documentation](docs/) • [PRD](docs/PRD.md) • [Sprint Plan](docs/SPRINT_PLAN_PHASE1.md)

</div>
