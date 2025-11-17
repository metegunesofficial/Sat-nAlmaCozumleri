# 🚀 HIZLI DEPLOYMENT REHBERİ

## ⚡ 3 Adımda Deploy Et

### 📋 Adım 1: Environment Variables Ekle (5 dakika)

1. **Vercel Dashboard'a git:** https://vercel.com/dashboard
2. Projenizi seçin: **Sat-nAlmaCozumleri**
3. **Settings** → **Environment Variables**
4. `VERCEL_ENV_VARS.txt` dosyasını aç (proje kök dizininde)
5. Her değişkeni tek tek ekle:
   - Variable Name: `DATABASE_URL`
   - Value: `prisma+postgres://...` (dosyadan kopyala)
   - Environments: **Production, Preview, Development** (hepsini seç) ✓
   - **Save**
6. Toplam 7 değişken ekle:
   - DATABASE_URL
   - POSTGRES_URL
   - NEXTAUTH_URL
   - NEXTAUTH_SECRET
   - JWT_SECRET
   - NEXT_PUBLIC_APP_NAME
   - NEXT_PUBLIC_APP_URL

### 🚀 Adım 2: Deploy Et (1 dakika)

**Otomatik deployment:**
```bash
git push origin claude/fix-todo-mi2sy63cuk1d42gk-01MTLhvfAqpUt8TDCavfewho
```

**VEYA** Vercel Dashboard'da:
- **Deployments** sekmesine git
- **Redeploy** butonuna tıkla
- Build log'ları izle (~2-3 dakika)

### 🗄️ Adım 3: Database Migration (2 dakika)

Deploy başarılı olduktan sonra:

**Yöntem A - Vercel CLI (Terminal):**
```bash
npm install -g vercel
vercel login
vercel link
npx prisma migrate deploy
npx prisma db seed
```

**Yöntem B - Prisma Studio:**
```bash
# Lokalden çalıştır
npx prisma studio
# Tarayıcı açılacak, vercel.app URL'si ile bağlan
```

---

## ✅ Tamamlandı!

Siten hazır: https://sat-nalma-cozumleri.vercel.app

### 🧪 Test Et:

1. **Ana Sayfa:** https://sat-nalma-cozumleri.vercel.app
2. **Login:** https://sat-nalma-cozumleri.vercel.app/login
3. **API:** https://sat-nalma-cozumleri.vercel.app/api/categories

**Test Kullanıcısı (seed sonrası):**
- Email: `admin@attelia.com`
- Şifre: `password123`

---

## 🆘 Sorun Çözme

### Build Hatası
- Environment variables doğru mu?
- Copy-paste hatasız mı?
- Tüm 7 değişken eklendi mi?

### Migration Hatası
- DATABASE_URL doğru mu?
- Prisma Accelerate aktif mi?

### 404 Hatası
- Build başarılı oldu mu?
- Domain doğru mu?

---

## 📊 Ne Değişti?

✅ **vercel.json** eklendi → Otomatik Prisma generate
✅ **package.json** güncellendi → postinstall script
✅ **VERCEL_ENV_VARS.txt** hazır → Copy-paste için
✅ Build otomatikleşti
✅ Production ready

---

**SON ADIM:** Vercel Dashboard'a git ve environment variables ekle!
