# 🚀 Production Deployment Guide

## Vercel + Prisma Postgres Production Setup

### ⚡ Quick Start

Bu rehber, Attelia Dental B2B Satın Alma sisteminizi Vercel'de production'a deploy etmeniz için adım adım talimatlar içerir.

---

## 📋 Ön Gereksinimler

- ✅ Vercel hesabı
- ✅ GitHub repository'si bağlı
- ✅ Prisma Database oluşturulmuş (db.prisma.io)
- ✅ Node.js 18+ (local test için)

---

## 🔧 Adım 1: Environment Variables Ayarla

### Vercel Dashboard'da:

1. **Projenizi açın** → `Settings` → `Environment Variables`
2. Aşağıdaki değişkenleri **Production, Preview, Development** ortamları için ekleyin:

#### Database Connection (Required)
```bash
DATABASE_URL=postgres://[user]:[password]@db.prisma.io:5432/postgres?sslmode=require

POSTGRES_URL=postgres://[user]:[password]@db.prisma.io:5432/postgres?sslmode=require

PRISMA_DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=[your-api-key]
```

> 🔑 **Notlar:**
> - Yukarıdaki değerleri kendi Prisma Database bağlantı bilgilerinizle değiştirin
> - Prisma Dashboard'dan alabilirsiniz

#### Blob Storage (Required)
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_y8QoSYRfDogMmFQ3_CrjE9YZeqjUqq3VOBg5wOxZrA9VFcH
```

#### Authentication Secrets (Required)
```bash
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=[generate-new-secret]
JWT_SECRET=[generate-new-secret]
```

**Güvenli secret oluşturmak için:**
```bash
openssl rand -base64 32
```

Her biri için farklı secret üretin!

#### Application Config
```bash
NEXT_PUBLIC_APP_NAME=Attelia Dental
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

---

## 🗄️ Adım 2: Veritabanını Kur

### Local Environment'da:

#### 1. Repository'yi klonlayın:
```bash
git clone https://github.com/metegunesofficial/Sat-nAlmaCozumleri.git
cd Sat-nAlmaCozumleri
```

#### 2. Dependencies kurun:
```bash
npm install
```

#### 3. `.env.local` oluşturun:
```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyip database bağlantı bilgilerini ekleyin.

#### 4. Prisma Client oluşturun:
```bash
npx prisma generate
```

#### 5. Veritabanı tablolarını oluşturun:
```bash
npx prisma db push
```

#### 6. İlk admin kullanıcısını oluşturun:
```bash
npm run db:seed
```

Bu komut şunları oluşturur:
- ✅ 1 Company: "Attelia Dental"
- ✅ 1 Super Admin: admin@attelia.com / admin123

> ⚠️ **GÜVENLİK UYARISI:** İlk giriş sonrası mutlaka şifreyi değiştirin!

---

## 🚢 Adım 3: Vercel'e Deploy

### Otomatik Deploy (Önerilen):

```bash
git add .
git commit -m "🚀 Production deployment setup"
git push origin main
```

Vercel otomatik olarak:
1. ✅ Build yapacak
2. ✅ Prisma Client generate edecek
3. ✅ Production'a deploy edecek

### Manuel Deploy:

```bash
vercel --prod
```

---

## 🔐 Adım 4: İlk Giriş ve Güvenlik

### 1. Production URL'nize gidin:
```
https://your-project.vercel.app
```

### 2. Admin ile giriş yapın:
```
Email:    admin@attelia.com
Password: admin123
```

### 3. **ÖNEMLİ:** Hemen şifre değiştirin!
- Profil → Ayarlar → Şifre Değiştir

### 4. Şirket bilgilerini güncelleyin:
- Şirket Ayarları → Genel Bilgiler
- Vergi numarası, adres, telefon vb.

---

## 📊 Adım 5: İlk Kurulum

### Departmanlar Oluşturun:
1. Ayarlar → Departmanlar → Yeni Departman
2. Örnek: IT, Satın Alma, Finans, İK

### Kullanıcılar Ekleyin:
1. Kullanıcılar → Yeni Kullanıcı
2. Departman ve rol atayın
3. Email ile davet gönderin

### Ürün Kategorileri:
1. Ürünler → Kategoriler → Yeni Kategori
2. Hiyerarşik yapı oluşturun

### Onay İş Akışları:
1. Ayarlar → Onay İş Akışları
2. Bütçe limitlerini tanımlayın
3. Onay adımlarını ekleyin

---

## 🔍 Sorun Giderme

### Build Hatası: "Prisma Client not generated"

**Çözüm:**
Vercel'de build command'i kontrol edin:
```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### Database Bağlantı Hatası

**Kontrol edin:**
1. ✅ `DATABASE_URL` doğru mu?
2. ✅ Prisma Database aktif mi?
3. ✅ SSL sertifikası geçerli mi?

**Test:**
```bash
npx prisma db execute --stdin <<< "SELECT 1"
```

### Deployment Başarılı Ama Sayfa Açılmıyor

**Kontrol edin:**
1. ✅ `NEXTAUTH_URL` production URL'i içeriyor mu?
2. ✅ Environment variables tüm ortamlarda mevcut mu?
3. ✅ Build log'larında hata var mı?

**Vercel Logs:**
```bash
vercel logs --follow
```

---

## 📈 Production Monitoring

### Vercel Analytics
- Dashboard → Analytics
- Page views, performance metrics

### Database Monitoring
- Prisma Dashboard → Metrics
- Query performance, connection pool

### Error Tracking
Vercel Functions → Logs
- Runtime errors
- API errors

---

## 🔄 Güncellemeler ve Migration'lar

### Yeni Özellik Deploy:

1. **Development'ta test edin:**
```bash
npm run dev
```

2. **Database değişiklikleri varsa:**
```bash
npx prisma migrate dev --name feature_name
```

3. **Git'e commit:**
```bash
git add .
git commit -m "✨ New feature"
git push
```

4. **Vercel otomatik deploy eder**

### Production Migration:

```bash
# Production database'e migration uygula
npx prisma migrate deploy
```

> ⚠️ **DİKKAT:** Production migration'ları dikkatli yapın!

---

## 📝 Best Practices

### Güvenlik
- ✅ Güçlü şifreler kullanın
- ✅ 2FA aktifleştirin
- ✅ Environment secrets'ı düzenli yenileyin
- ✅ HTTPS zorlaması aktif
- ✅ Rate limiting ekleyin

### Performance
- ✅ Database indexleri optimize edin
- ✅ Image optimization kullanın
- ✅ CDN caching ayarlayın
- ✅ Connection pooling yapılandırın

### Backup
- ✅ Otomatik database backup
- ✅ Haftalık export
- ✅ Disaster recovery planı

### Monitoring
- ✅ Uptime monitoring
- ✅ Error alerting
- ✅ Performance metrics
- ✅ User analytics

---

## 🆘 Destek

### Dokümantasyon
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)

### Proje Dosyaları
- `DATABASE_SETUP.md` - Veritabanı kurulum rehberi
- `prisma/schema.prisma` - Database schema
- `prisma/seed.ts` - İlk kurulum scripti

---

## ✅ Deployment Checklist

Deployment öncesi kontrol listesi:

- [ ] Environment variables eklendi
- [ ] Database oluşturuldu
- [ ] Migration çalıştırıldı
- [ ] Seed çalıştırıldı
- [ ] Build başarılı
- [ ] Production URL doğru
- [ ] HTTPS çalışıyor
- [ ] Admin girişi test edildi
- [ ] Şifre değiştirildi
- [ ] Monitoring aktif
- [ ] Backup planı hazır

---

## 🎉 Başarılı Deployment!

Production deployment'ınız tamamlandı!

**Sonraki adımlar:**
1. Ekibinizi davet edin
2. Departmanları ve workflow'ları kurun
3. İlk satın alma talebini oluşturun
4. Sistemi kullanmaya başlayın!

**Başarılar!** 🚀
