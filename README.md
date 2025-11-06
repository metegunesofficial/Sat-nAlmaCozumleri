# 🏥 Attelia Dental - Enterprise Satın Alma Yönetim Platformu

**Kurumsal düzeyde, multi-tenant, tam özellikli satın alma ve onay yönetim sistemi** - Birden fazla şirket/organizasyon için, çok katmanlı bütçe kontrolleri ve çok aşamalı onay süreçleri ile.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)

---

## 🌟 Temel Özellikler

### 🏢 Multi-Tenant Altyapı
✅ Tek platformda birden fazla şirket/organizasyon  
✅ Tamamen izole veri yapısı (her şirket kendi verileri)  
✅ Şirket bazlı ayarlar ve yapılandırma  
✅ Şirket bazlı kullanıcı, departman ve ürün yönetimi

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

### 📋 Çok Aşamalı Onay Sistemi

**Tutar Bazlı Otomatik Workflow:**
- 0-10,000₺: Departman Müdürü
- 10,000-50,000₺: Departman + Satın Alma Müdürü
- 50,000₺+: Departman + Satın Alma + Finans Müdürü

**Onay Özellikleri:**
- ✅ Çok seviyeli onay zincirleri (unlimited steps)
- ✅ Paralel ve sıralı onay desteği
- ✅ Role-based approval (rol bazlı)
- ✅ Onay/Red/Geri Gönderme aksiyonları
- ✅ Yorum ve açıklama sistemi
- ✅ Otomatik bildirimler (email ready)

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
npm install

# 3. PostgreSQL database oluşturun
psql -U postgres
CREATE DATABASE attelia_dental;
\q

# 4. Environment variables
cp .env.example .env
# .env dosyasını düzenleyin

# 5. Database migration
npx prisma generate
npx prisma migrate dev --name init

# 6. Seed data (2 şirket, kullanıcılar, departmanlar, ürünler, workflows)
npm run db:seed

# 7. Development server
npm run dev
```

Uygulama: [http://localhost:3000](http://localhost:3000)

---

## 📁 Proje Yapısı

```
Sat-nAlmaCozumleri/
├── app/
│   ├── api/                          # Backend API
│   │   ├── auth/                    # Authentication
│   │   ├── products/                # Ürün yönetimi
│   │   ├── categories/              # Kategori yönetimi
│   │   ├── departments/             # Departman yönetimi
│   │   ├── purchase-requests/       # Satın alma talepleri
│   │   │   ├── [requestId]/
│   │   │   │   └── approve/        # Onay endpoint
│   │   │   └── route.ts
│   │   └── reports/                 # Raporlama
│   │       ├── purchase-summary/
│   │       ├── budget/
│   │       └── approval-performance/
│   ├── products/                    # Ürün sayfaları
│   ├── cart/                        # Sepet
│   ├── layout.tsx
│   └── page.tsx
├── components/                       # React components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ProductCard.tsx
├── lib/                             # Utilities
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Seed script
└── types/
    └── index.ts
```

---

## 🗄️ Database Schema

### Ana Modeller

#### Multi-Tenancy
- **Company** - Şirket/organizasyon

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
- **ApprovalWorkflow** - İş akışı tanımları
- **ApprovalStep** - Onay adımları
- **ApprovalAction** - Onay/red aksiyonları

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
POST   /api/purchase-requests              # Yeni talep
GET    /api/purchase-requests/[id]         # Detay
PUT    /api/purchase-requests/[id]         # Güncelle
POST   /api/purchase-requests/[id]/approve # Onayla/Reddet
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

## 👤 İlk Giriş Bilgileri

İlk kurulumdan sonra sistem yöneticisi hesabı ile giriş yapabilirsiniz:

| Rol | Email | Şifre |
|-----|-------|-------|
| Super Admin | admin@attelia.com | admin123 |

> ⚠️ **GÜVENLİK:** İlk giriş sonrası mutlaka şifreyi değiştirin!

Kurulum sonrası yapmanız gerekenler:
1. Şirket bilgilerini güncelleyin
2. Departmanlar oluşturun
3. Kullanıcılar ekleyin
4. Ürün kategorileri ve ürünler ekleyin
5. Bütçeleri tanımlayın
6. Onay iş akışlarını kurun

---

## 🔄 Örnek Onay Workflow'ları

### Workflow 1: Standart (0-10K ₺)
```
Step 1: Departman Müdürü Onayı
```

### Workflow 2: İki Aşamalı (10K-50K ₺)
```
Step 1: Departman Müdürü Onayı
Step 2: Satın Alma Müdürü Onayı
```

### Workflow 3: Üç Aşamalı (50K+ ₺)
```
Step 1: Departman Müdürü Onayı
Step 2: Satın Alma Müdürü Onayı
Step 3: Finans Müdürü Onayı
```

---

## 💡 Kullanım Senaryoları

### Senaryo 1: Kişisel Bütçe Kontrolü
```typescript
Çalışan: 10,000₺ laptop talebi

✓ Kişisel aylık bütçe: 15,000₺
✓ Departman bütçesi: 50,000₺  
✓ Şirket IT bütçesi: 200,000₺
✓ Kategori limiti: 100,000₺/ay

→ Talep oluşturulabilir
→ Workflow 2 (iki aşamalı) tetiklenir
```

### Senaryo 2: Bütçe Aşımı
```typescript
Çalışan: 20,000₺ talep

✗ Kişisel bütçe: 15,000₺ (yetersiz!)
  
→ Talep oluşturulamaz
→ "Kişisel bütçeniz aşılacak" uyarısı
```

### Senaryo 3: Kategori Bazlı Onay
```typescript
Kategori: IT > Donanım > Bilgisayar
- Monthly Limit: 100,000₺
- Min Approval: 5,000₺
- Requires Approval: true

35,000₺ talep:
✓ Kategori limiti içinde
✓ 5,000₺ üzeri (onay gerekli)
  
→ Onay süreci başlatılır
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

## 🎨 Özelleştirme

### Yeni Onay Workflow'u Ekleme

```typescript
await prisma.approvalWorkflow.create({
  data: {
    companyId: 'company-id',
    name: 'Özel Workflow',
    minAmount: 100000,
    maxAmount: 500000,
    departmentIds: ['dept-1', 'dept-2'],
    steps: {
      create: [
        {
          stepOrder: 0,
          stepName: 'İlk Onay',
          approverRole: 'DEPARTMENT_MANAGER'
        },
        {
          stepOrder: 1,
          stepName: 'İkinci Onay',
          approverRole: 'GENERAL_MANAGER'
        }
      ]
    }
  }
})
```

### Yeni Satın Alım Kategorisi

```typescript
await prisma.purchaseCategory.create({
  data: {
    companyId: 'company-id',
    name: 'Eğitim',
    code: 'EDU',
    monthlyLimit: 50000,
    yearlyLimit: 600000,
    requiresApproval: true,
    minApprovalAmount: 1000,
    children: {
      create: [
        {
          name: 'Online Kurslar',
          code: 'EDU-ONLINE',
          monthlyLimit: 20000
        },
        {
          name: 'Seminerler',
          code: 'EDU-SEM',
          monthlyLimit: 30000
        }
      ]
    }
  }
})
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

---

## 📊 Performans

- **Database Indexing**: Tüm kritik alanlarda index
- **Query Optimization**: Include/select optimization
- **Pagination**: Tüm list endpoint'lerinde
- **Caching Ready**: Redis integration ready

---

## 🚀 Deployment

### Quick Start - Local Development

1. **Clone repository:**
```bash
git clone https://github.com/metegunesofficial/Sat-nAlmaCozumleri.git
cd Sat-nAlmaCozumleri
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup environment:**
```bash
cp .env.example .env.local
# Edit .env.local with your database credentials
```

4. **Run automated setup:**
```bash
./setup-database.sh
```

5. **Start development server:**
```bash
npm run dev
```

Visit: http://localhost:3000

### Production Deployment

📖 **Detaylı Production Deployment Rehberi:** [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)

**Hızlı Özet:**
- ✅ Vercel + Prisma Database
- ✅ Automated deployment
- ✅ Environment variables setup
- ✅ Database migration guide
- ✅ Security best practices

### Database Setup

📊 **Database Kurulum Rehberi:** [DATABASE_SETUP.md](DATABASE_SETUP.md)

**İçerik:**
- SQL migration dosyaları
- Seed script detayları
- Troubleshooting guide

---

## 📈 Roadmap

### ✅ Tamamlandı
- Multi-tenant altyapı
- 3 katmanlı bütçe sistemi
- Çok aşamalı onay sistemi
- Satın alım kategori yönetimi
- Detaylı raporlama API'ları
- E-ticaret modülü
- Sepet yönetimi

### 🔄 Geliştiriliyor
- Frontend sayfaları (Dashboard, Login, Request Management)
- Admin paneli UI
- Bütçe yönetim ekranları

### 📅 Planlanan
- Email bildirimleri
- SMS bildirimleri
- Document/File attachments
- Gelişmiş raporlama UI (charts, graphs)
- Excel/PDF export
- Audit log
- Mobile app
- Vendor/Supplier management
- Contract management
- Invoice management

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
- Open Source Community

---

<div align="center">

**⭐ Enterprise-level Satın Alma Yönetimi ⭐**

Made with ❤️ by Attelia Team

[Documentation](docs/) • [API Reference](docs/api/) • [Contributing](CONTRIBUTING.md)

</div>
