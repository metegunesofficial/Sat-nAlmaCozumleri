# Vercel Prisma Database Kurulum Rehberi

## 1. Vercel Dashboard'a Git
https://vercel.com/dashboard

## 2. Projeyi Seç veya Oluştur
- GitHub repository'sini bağla: metegunesofficial/Sat-nAlmaCozumleri
- Branch: claude/procurement-platform-prd-011CUtNLT3HUa2Sb6DY1prvY

## 3. Environment Variables Ekle
Settings → Environment Variables → Add New

### ZORUNLU Variables:

**DATABASE_URL**
```
postgres://09e8e02bdf6d5bb82ba6bf4ebc8aa0fd3deac63431181294908b26e9848980ab:sk_nR5lm7fMKUOI1x5eim_5N@db.prisma.io:5432/postgres?sslmode=require
```

**JWT_SECRET**
```
attelia-dental-jwt-secret-production-2024-min-32-chars-required-for-security
```

**NEXTAUTH_SECRET**
```
attelia-nextauth-secret-production-2024-min-32-chars-required-for-security
```

**NEXTAUTH_URL** (Production deploy'dan sonra güncellenecek)
```
https://your-app.vercel.app
```

### OPSIYONEL Variables (Email için):

**SMTP_HOST**
```
smtp.gmail.com
```

**SMTP_PORT**
```
587
```

**SMTP_USER**
```
your-email@gmail.com
```

**SMTP_PASS**
```
your-app-password
```

**SMTP_FROM**
```
your-email@gmail.com
```

## 4. Build Settings Kontrol
Settings → General → Build & Development Settings:

- Framework Preset: **Next.js**
- Build Command: `npm run build` (otomatik)
- Output Directory: `.next` (otomatik)
- Install Command: `npm install` (otomatik)

## 5. Deploy Başlat
- Deploy butonuna tıkla veya otomatik deploy bekle
- Build sırasında Vercel otomatik olarak:
  ✅ `prisma generate` çalıştırır
  ✅ `prisma db push` ile schema'yı database'e gönderir
  ✅ Next.js build yapar

## 6. İlk Deploy Sonrası
1. Deployment URL'i al (örn: https://sat-nalmacozumleri.vercel.app)
2. NEXTAUTH_URL environment variable'ını bu URL ile güncelle
3. Redeploy yap

## 7. Database Schema Push (Manuel - sadece gerekirse)
Eğer schema değişikliği yaparsanız:

```bash
# Local'de test et
npx prisma db push

# Vercel'de otomatik olur, ama manuel için:
# Settings → Deployments → Redeploy
```

## 8. Prisma Studio (Database Yönetimi)
Local'de database'i görüntülemek için:

```bash
# .env dosyasını kullanarak
npx prisma studio
```

## Sorun Giderme

### Prisma Engine Hatası
Eğer "Failed to fetch engine" hatası alırsanız:
- Vercel otomatik olarak çözer
- Local'de: `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` kullanın

### Database Connection Hatası
- DATABASE_URL'in doğru olduğunu kontrol edin
- Prisma Cloud dashboard'da connection string'i kontrol edin

### Build Hatası
- Build logs'u kontrol edin
- TypeScript hatalarını düzeltin
- Prisma schema syntax'ını kontrol edin

## Başarı Kontrolleri

✅ Build başarılı
✅ Deployment live
✅ /login sayfası açılıyor
✅ /register sayfası açılıyor
✅ Kayıt işlemi çalışıyor
✅ Login işlemi çalışıyor
✅ Dashboard erişilebilir

## Production Checklist

- [ ] DATABASE_URL set edildi
- [ ] JWT_SECRET güçlü ve benzersiz
- [ ] NEXTAUTH_SECRET güçlü ve benzersiz
- [ ] NEXTAUTH_URL production domain ile güncellendi
- [ ] SMTP ayarları yapıldı (email için)
- [ ] Build başarılı
- [ ] Test kayıt yapıldı
- [ ] Test login yapıldı
- [ ] Prisma Studio ile database kontrol edildi

