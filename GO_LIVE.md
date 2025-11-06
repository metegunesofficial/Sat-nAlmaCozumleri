# 🚀 GO LIVE - Production Deployment

## ⚡ Hızlı Deployment Seçenekleri

Uygulamanızı production'a almanın 3 yolu var:

---

## 🎯 Seçenek 1: GitHub Merge (ÖNERİLEN)

### Adım 1: GitHub'da Pull Request Oluştur

1. **GitHub Repository'nize gidin:**
   ```
   https://github.com/metegunesofficial/Sat-nAlmaCozumleri
   ```

2. **"Pull Requests" sekmesine tıklayın**

3. **"New Pull Request" butonuna tıklayın**

4. **Branch'leri seçin:**
   - Base: `main` (veya default branch)
   - Compare: `claude/setup-vercel-postgres-011CUrCPk9MJe3PxaYit1fTk`

5. **"Create Pull Request" butonuna tıklayın**

6. **Title ve Description ekleyin:**
   ```
   Title: 🚀 Production Database Setup - Go Live

   Description:
   - Production-ready database setup
   - Mock data removed
   - Security secrets generated
   - Deployment guides added

   Ready for production deployment!
   ```

7. **"Create Pull Request" butonuna tıklayın**

8. **"Merge Pull Request" → "Confirm Merge"**

### Adım 2: Vercel Otomatik Deploy Edecek

Merge sonrası Vercel otomatik olarak:
- ✅ Build yapacak
- ✅ Production'a deploy edecek
- ✅ Live URL oluşturacak

**Deployment süresini takip edin:**
- Vercel Dashboard: https://vercel.com/dashboard
- Deployment status'ü göreceksiniz

---

## 🔧 Seçenek 2: Manuel Vercel CLI

### Hazırlık:

```bash
# Vercel CLI kur
npm install -g vercel

# Login ol
vercel login
```

### Deployment:

```bash
# Otomatik deployment script'i çalıştır
./deploy-to-production.sh
```

**VEYA Manuel:**

```bash
# Production'a deploy
vercel --prod

# Follow the prompts:
# ? Set up and deploy "~/Sat-nAlmaCozumleri"? [Y/n] Y
# ? Which scope? Your Team
# ? Link to existing project? [y/N] y
# ? What's the name of your existing project? sat-nalmacozumleri
```

---

## 🗄️ Seçenek 3: Vercel Dashboard

### Web Interface Üzerinden:

1. **Vercel Dashboard'a gidin:**
   ```
   https://vercel.com/dashboard
   ```

2. **Projenizi seçin**

3. **"Settings" → "Git"**

4. **"Production Branch" değiştirin:**
   - `claude/setup-vercel-postgres-011CUrCPk9MJe3PxaYit1fTk`

5. **"Deployments" sekmesine gidin**

6. **Son deployment'ı bulun ve "Promote to Production"**

---

## 📋 Production Checklist

Deploy etmeden önce kontrol edin:

### Environment Variables (ZORUNLU)

Vercel Dashboard → Settings → Environment Variables:

```bash
# Database (REQUIRED)
DATABASE_URL=postgres://[user]:[password]@db.prisma.io:5432/postgres?sslmode=require
POSTGRES_URL=postgres://[user]:[password]@db.prisma.io:5432/postgres?sslmode=require
PRISMA_DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=[your-key]

# Blob Storage (REQUIRED)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_y8QoSYRfDogMmFQ3_CrjE9YZeqjUqq3VOBg5wOxZrA9VFcH

# Auth Secrets (REQUIRED - CHANGE THESE!)
NEXTAUTH_URL=https://your-production-url.vercel.app
NEXTAUTH_SECRET=[generate-new-secret-with-openssl-rand-base64-32]
JWT_SECRET=[generate-new-secret-with-openssl-rand-base64-32]

# App Config
NEXT_PUBLIC_APP_NAME=Attelia Dental
NEXT_PUBLIC_APP_URL=https://your-production-url.vercel.app
```

**Güvenli secret oluşturmak için:**
```bash
openssl rand -base64 32
```

### Database Migration

Deploy sonrası database migration çalıştırın:

#### Yöntem A: Local'den Production DB'ye

```bash
# .env.local'i production DATABASE_URL ile güncelle
# Sonra çalıştır:
npx prisma db push
npm run db:seed
```

#### Yöntem B: Vercel CLI ile

```bash
# Production environment'da çalıştır
vercel env pull .env.production
npx prisma db push
npm run db:seed
```

#### Yöntem C: Manuel SQL

```bash
# SQL dosyasını production database'e uygula
psql "$PRODUCTION_DATABASE_URL" -f prisma/init-database.sql

# Seed çalıştır
npm run db:seed
```

---

## 🎯 Deployment Sonrası

### 1. Production URL'i Test Edin

```
https://your-project.vercel.app
```

### 2. Admin Hesabı ile Giriş Yapın

```
Email:    admin@attelia.com
Password: admin123
```

### 3. ⚠️ ÖNEMLİ: Hemen Şifre Değiştirin!

1. Profil → Ayarlar
2. Şifre Değiştir
3. Güçlü bir şifre seçin

### 4. İlk Kurulum

- [ ] Şirket bilgilerini güncelleyin
- [ ] Departmanlar oluşturun
- [ ] Kullanıcılar ekleyin
- [ ] Ürün kategorileri ekleyin
- [ ] İlk ürünleri ekleyin
- [ ] Bütçeleri tanımlayın
- [ ] Onay workflow'larını oluşturun

---

## 🔍 Deployment Troubleshooting

### Build Hatası

```bash
Error: Prisma Client not generated
```

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

```bash
Error: Can't reach database
```

**Kontrol edin:**
1. ✅ `DATABASE_URL` environment variable set edilmiş mi?
2. ✅ Prisma Database çalışıyor mu?
3. ✅ Firewall/SSL ayarları doğru mu?

### Environment Variables Eksik

```bash
Error: NEXTAUTH_SECRET is not set
```

**Çözüm:**
Vercel Dashboard → Settings → Environment Variables
Eksik variable'ı ekleyin ve redeploy edin.

---

## 📊 Deployment Monitoring

### Vercel Logs

```bash
# Real-time logs
vercel logs --follow

# Son 100 log
vercel logs
```

### Vercel Dashboard

- Analytics: https://vercel.com/[your-project]/analytics
- Deployments: https://vercel.com/[your-project]/deployments
- Logs: https://vercel.com/[your-project]/logs

---

## 🆘 Hızlı Yardım

### Deployment Başarısız Olursa

1. **Build log'ları kontrol edin:**
   - Vercel Dashboard → Deployments → Failed Deployment → Logs

2. **Environment variables kontrolü:**
   - Tüm required variables set edilmiş mi?
   - Production environment seçilmiş mi?

3. **Database bağlantısı:**
   - DATABASE_URL doğru mu?
   - Database erişilebilir mi?

### Production'da Hata Varsa

1. **Rollback:**
   - Vercel Dashboard → Deployments
   - Önceki working deployment'ı bul
   - "Promote to Production"

2. **Logs kontrol:**
   ```bash
   vercel logs --follow
   ```

3. **Database state kontrol:**
   ```bash
   npx prisma studio
   ```

---

## ✅ GO LIVE Checklist

Deployment öncesi son kontrol:

- [ ] Environment variables eklendi (Production)
- [ ] Güvenli secret'ler oluşturuldu
- [ ] Database credentials doğru
- [ ] Build local'de başarılı
- [ ] .env.local production değerleriyle test edildi
- [ ] Backup planı hazır
- [ ] Monitoring setup
- [ ] Admin şifresi değiştirilecek (deployment sonrası)

---

## 🎉 DEPLOYMENT TAMAMLANDI!

**Tebrikler! Uygulamanız artık LIVE! 🚀**

**Hemen yapılacaklar:**
1. ✅ Production URL'i test et
2. ✅ Admin ile giriş yap
3. ✅ Şifre değiştir
4. ✅ İlk kurulumu tamamla
5. ✅ Ekibi davet et

**Dokümantasyon:**
- 📖 [Production Deployment](PRODUCTION_DEPLOYMENT.md)
- 🗄️ [Database Setup](DATABASE_SETUP.md)
- 📚 [README](README.md)

---

**Başarılar! 🎊**

<div align="center">
Made with ❤️ by Attelia Team
</div>
