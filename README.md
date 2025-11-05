# Attelia Dental E-commerce Platform

Modern, full-stack e-ticaret platformu - Ağız ve Diş Sağlığı ürünleri için özel olarak geliştirilmiştir.

## 🎯 Özellikler

### Müşteri Özellikleri
- ✅ Modern ve responsive tasarım
- ✅ Gelişmiş ürün arama ve filtreleme
- ✅ Kategori bazlı ürün listeleme
- ✅ Detaylı ürün sayfaları
- ✅ Sepet yönetimi
- ✅ Kullanıcı kayıt ve giriş sistemi
- ✅ Sipariş takibi
- ✅ Çoklu ürün görselleri
- ✅ Ürün değerlendirme ve yorumlama
- ✅ Toptan fiyat desteği
- ✅ Minimum sipariş adedi
- ✅ Favorilere ekleme
- ✅ Hızlı ürün görünümü

### Admin Özellikleri
- ✅ Ürün yönetimi (CRUD)
- ✅ Kategori yönetimi
- ✅ Sipariş yönetimi
- ✅ Stok takibi
- ✅ Kullanıcı yönetimi
- ✅ İstatistikler ve raporlama

### Teknik Özellikler
- ⚡ Next.js 14 (App Router)
- 🎨 Tailwind CSS
- 🔷 TypeScript
- 🗄️ PostgreSQL + Prisma ORM
- 🔐 JWT Authentication
- 📱 Fully Responsive
- 🚀 Server-Side Rendering (SSR)
- 📦 Modern API Architecture

## 🛠️ Teknoloji Stack'i

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT, bcryptjs
- **Validation:** Zod
- **Icons:** Lucide React

## 📋 Gereksinimler

- Node.js 18+
- PostgreSQL 14+
- npm veya yarn

## 🚀 Kurulum

### 1. Repository'yi klonlayın

\`\`\`bash
git clone <repository-url>
cd Sat-nAlmaCozumleri
\`\`\`

### 2. Bağımlılıkları yükleyin

\`\`\`bash
npm install
\`\`\`

### 3. PostgreSQL Database oluşturun

\`\`\`bash
# PostgreSQL'e bağlanın
psql -U postgres

# Database oluşturun
CREATE DATABASE attelia_dental;
\`\`\`

### 4. Environment variables ayarlayın

\`\`\`.env dosyası oluşturun:

\`\`\`bash
cp .env.example .env
\`\`\`

\`.env\` dosyasını düzenleyin:

\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/attelia_dental"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
JWT_SECRET="your-jwt-secret-here"
\`\`\`

### 5. Database migration

\`\`\`bash
# Prisma client oluştur
npx prisma generate

# Database'i migrate et
npx prisma migrate dev --name init
\`\`\`

### 6. (Opsiyonel) Seed data ekleyin

\`\`\`bash
# Seed scriptini çalıştırın (oluşturulacak)
npm run seed
\`\`\`

### 7. Development sunucusunu başlatın

\`\`\`bash
npm run dev
\`\`\`

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 📁 Proje Yapısı

\`\`\`
Sat-nAlmaCozumleri/
├── app/                        # Next.js App Router
│   ├── api/                   # API Routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── products/         # Product endpoints
│   │   ├── categories/       # Category endpoints
│   │   ├── cart/             # Cart endpoints
│   │   └── orders/           # Order endpoints
│   ├── products/             # Product pages
│   ├── cart/                 # Cart page
│   ├── checkout/             # Checkout page
│   ├── admin/                # Admin panel
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/                # React components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── ...
├── lib/                       # Utility functions
│   ├── prisma.ts             # Prisma client
│   ├── auth.ts               # Auth utilities
│   └── utils.ts              # Helper functions
├── types/                     # TypeScript types
│   └── index.ts
├── prisma/                    # Prisma schema
│   └── schema.prisma
├── public/                    # Static files
└── package.json
\`\`\`

## 🗄️ Database Schema

### Temel Modeller

- **User** - Kullanıcılar (müşteriler, bayiler, adminler)
- **Category** - Ürün kategorileri (hiyerarşik)
- **Product** - Ürünler
- **CartItem** - Sepet öğeleri
- **Order** - Siparişler
- **OrderItem** - Sipariş detayları
- **Review** - Ürün yorumları
- **Setting** - Site ayarları

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi

### Products
- `GET /api/products` - Tüm ürünleri listele
- `GET /api/products/[slug]` - Tek ürün detayı
- `POST /api/products` - Yeni ürün oluştur (Admin)
- `PUT /api/products/[slug]` - Ürün güncelle (Admin)
- `DELETE /api/products/[slug]` - Ürün sil (Admin)

### Categories
- `GET /api/categories` - Tüm kategorileri listele
- `POST /api/categories` - Yeni kategori oluştur (Admin)

### Cart
- `GET /api/cart` - Kullanıcının sepetini getir
- `POST /api/cart` - Sepete ürün ekle
- `PUT /api/cart/[itemId]` - Sepet öğesini güncelle
- `DELETE /api/cart/[itemId]` - Sepetten ürün çıkar
- `DELETE /api/cart` - Sepeti temizle

### Orders
- `GET /api/orders` - Kullanıcının siparişlerini listele
- `GET /api/orders/[orderId]` - Sipariş detayı
- `POST /api/orders` - Yeni sipariş oluştur
- `PUT /api/orders/[orderId]` - Sipariş güncelle (Admin)

## 👤 Varsayılan Kullanıcılar

Seed script çalıştırıldıktan sonra:

**Admin:**
- Email: admin@attelia.com
- Şifre: admin123

**Test Kullanıcı:**
- Email: test@example.com
- Şifre: test123

## 📝 Prisma Komutları

\`\`\`bash
# Prisma Studio'yu aç (Database GUI)
npx prisma studio

# Migration oluştur
npx prisma migrate dev --name your_migration_name

# Database'i resetle
npx prisma migrate reset

# Prisma client'i yeniden oluştur
npx prisma generate
\`\`\`

## 🎨 Özelleştirme

### Renkler

\`tailwind.config.ts\` dosyasında dental teması için özel renkler tanımlanmıştır:

\`\`\`typescript
colors: {
  dental: {
    blue: '#1e40af',
    light: '#60a5fa',
    dark: '#1e3a8a',
  },
}
\`\`\`

### Logo ve Branding

- Logo: \`components/Header.tsx\` içinde güncelleyin
- Favicon: \`app/favicon.ico\` dosyasını değiştirin
- Site ismi: \`app/layout.tsx\` içindeki metadata'yı güncelleyin

## 🔧 Production Build

\`\`\`bash
# Production build oluştur
npm run build

# Production server başlat
npm start
\`\`\`

## 📦 Deployment

### Vercel (Önerilen)

1. Vercel hesabınıza giriş yapın
2. Repository'yi bağlayın
3. Environment variables ekleyin
4. Deploy edin

### Docker

\`\`\`bash
# Docker image oluştur
docker build -t attelia-dental .

# Container çalıştır
docker run -p 3000:3000 attelia-dental
\`\`\`

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (\`git checkout -b feature/amazing-feature\`)
3. Değişikliklerinizi commit edin (\`git commit -m 'Add amazing feature'\`)
4. Branch'inizi push edin (\`git push origin feature/amazing-feature\`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

## 📞 Destek

Sorular veya sorunlar için:
- Email: info@attelia.com
- GitHub Issues: [Issues](https://github.com/yourusername/attelia-dental/issues)

## 🎉 Teşekkürler

Attelia Dental E-commerce platformunu kullandığınız için teşekkürler!

---

**Not:** Bu platform Merkado.com.tr benzeri B2B/toptan satış özellikleriyle donatılmıştır ve Attelia Ağız ve Diş Sağlığı için özel olarak geliştirilmiştir.
