# 🗄️ Veritabanı Kurulum Rehberi

## ✅ Hazırlık Tamamlandı

Aşağıdaki dosyalar hazırlandı:
- ✅ `.env.local` - Veritabanı bağlantı bilgileri
- ✅ `prisma/init-database.sql` - Tüm tablolar için SQL migration
- ✅ `prisma/seed.ts` - Demo veriler (şirketler, kullanıcılar, ürünler)

---

## 🚀 Kurulum Adımları

### Seçenek 1: Local Kurulum (Önerilen - Test için)

#### 1. Prisma Client Oluştur

```bash
npx prisma generate
```

> ⚠️ **Not:** Eğer hata alırsanız, `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` ekleyin:
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

#### 2. Veritabanını Oluştur

**Yöntem A: Prisma ile (Otomatik)**
```bash
npx prisma db push
```

**Yöntem B: Manuel SQL ile**
```bash
psql "$DATABASE_URL" -f prisma/init-database.sql
```

#### 3. Demo Verileri Ekle

```bash
npm run db:seed
```

#### 4. Sunucuyu Başlat

```bash
npm run dev
```

Tarayıcınızda açın: http://localhost:3000

---

### Seçenek 2: Vercel Production Deployment

#### 1. Environment Variables'ı Vercel'e Ekle

Vercel Dashboard'da:
1. Projenizi açın
2. **Settings** → **Environment Variables**
3. Aşağıdaki değişkenleri ekleyin:

```bash
DATABASE_URL=postgres://09e8e02bdf6d5bb82ba6bf4ebc8aa0fd3deac63431181294908b26e9848980ab:sk_ZMNkR6gOqYgu4lgbzqNuA@db.prisma.io:5432/postgres?sslmode=require

POSTGRES_URL=postgres://09e8e02bdf6d5bb82ba6bf4ebc8aa0fd3deac63431181294908b26e9848980ab:sk_ZMNkR6gOqYgu4lgbzqNuA@db.prisma.io:5432/postgres?sslmode=require

PRISMA_DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19aTU5rUjZnT3FZZ3U0bGdienFOdUEiLCJhcGlfa2V5IjoiMDFLOUMxOThLN1ExV0FNR0RKWThEMzBNOFgiLCJ0ZW5hbnRfaWQiOiIwOWU4ZTAyYmRmNmQ1YmI4MmJhNmJmNGViYzhhYTBmZDNkZWFjNjM0MzExODEyOTQ5MDhiMjZlOTg0ODk4MGFiIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjZkNTIwMTctMDgwYy00NmI1LTk1NjQtYzA4NTY2ZmIxOWRhIn0.QLpX9CvRrfpn80EtNvFRzzZXNuXG_D_PD0IweeHOboE

BLOB_READ_WRITE_TOKEN=vercel_blob_rw_y8QoSYRfDogMmFQ3_CrjE9YZeqjUqq3VOBg5wOxZrA9VFcH

NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-production-secret-here
JWT_SECRET=your-jwt-secret-here

NEXT_PUBLIC_APP_NAME=Attelia Dental
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

> 🔐 **Güvenlik:** Production'da `NEXTAUTH_SECRET` ve `JWT_SECRET` için yeni random string oluşturun:
```bash
openssl rand -base64 32
```

#### 2. Migration'ı Çalıştır

**Local'den production veritabanına:**
```bash
npx prisma db push
```

#### 3. Seed Verilerini Ekle

```bash
npm run db:seed
```

#### 4. Deploy Et

```bash
git add .
git commit -m "✨ Setup database with Prisma"
git push origin claude/setup-vercel-postgres-011CUrCPk9MJe3PxaYit1fTk
```

Vercel otomatik deploy edecek!

---

## 👤 İlk Giriş Bilgileri

Migration ve seed tamamlandıktan sonra sistem admin kullanıcısı ile giriş yapabilirsiniz:

| Rol | Email | Şifre |
|-----|-------|-------|
| Super Admin | admin@attelia.com | admin123 |

⚠️ **GÜVENLİK UYARISI:** İlk giriş sonrası mutlaka şifreyi değiştirin!

---

## 📊 İlk Kurulum İçeriği

Seed işlemi **sadece minimum gerekli verileri** oluşturur:

### 🏢 Şirket
- **1 Şirket:** Attelia Dental
  - Slug: `attelia-dental`
  - Email: info@attelia.com
  - Para birimi: TRY
  - Timezone: Europe/Istanbul

### 👤 Kullanıcı
- **1 Super Admin:** admin@attelia.com
  - Şifre: admin123
  - Rol: SUPER_ADMIN
  - İsim: System Administrator

### 📝 Sonraki Adımlar

Sisteme giriş yaptıktan sonra aşağıdakileri oluşturmanız gerekir:

1. **Departmanlar:** IT, Satın Alma, Finans, İK vb.
2. **Kullanıcılar:** Departman yöneticileri ve çalışanlar
3. **Kategoriler:** Ürün kategorileri (hiyerarşik)
4. **Ürünler:** Satın alınabilecek ürünler
5. **Tedarikçiler:** Supplier listesi
6. **Bütçeler:** Departman ve şirket bütçeleri
7. **Onay İş Akışları:** Approval workflows
8. **Satın Alma Kategorileri:** Purchase categories

Tüm bu veriler admin panelinden kolayca oluşturulabilir.

---

## 🔧 Sorun Giderme

### Prisma Engine İndirme Hatası

```bash
Error: Failed to fetch the engine file...
```

**Çözüm:**
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

### Veritabanı Bağlantı Hatası

```bash
Error: P1001: Can't reach database server
```

**Kontrol edin:**
1. `.env.local` dosyasında `DATABASE_URL` doğru mu?
2. Veritabanı sunucusu çalışıyor mu?
3. Network/firewall ayarları doğru mu?

### Migration Hatası

```bash
Error: P3009: migrate.lock file should not be edited
```

**Çözüm:**
```bash
rm -rf prisma/migrations
npx prisma db push --force-reset
```

---

## 📝 Notlar

1. **Güvenlik:** Production'da mutlaka güçlü şifreler kullanın!
2. **Backup:** Veritabanını düzenli yedekleyin
3. **Monitoring:** Prisma Studio ile verileri görüntüleyin:
   ```bash
   npx prisma studio
   ```

4. **Development:** Local'de test edin, sonra production'a deploy edin

---

## 🎯 Sonraki Adımlar

✅ Veritabanı kuruldu
✅ Demo veriler eklendi
⬜ Uygulamayı test edin
⬜ Kendi verilerinizi ekleyin
⬜ Production'a deploy edin

**Başarılar!** 🚀
