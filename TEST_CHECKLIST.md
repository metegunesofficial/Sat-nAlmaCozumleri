# ✅ Test Checklist - ZORUNLU

Bu değişiklikler test edilmeden production'a gitmemeli!

**Date:** 2025-11-11
**Branch:** claude/analyze-structure-implementation-011CUzGxFkxC7vxSUTWu35zv

---

## 🚀 Lokal Test Adımları

### 1. Setup (İlk Kurulum)
```bash
# Repository'yi clone et
git clone <repo-url>
cd Sat-nAlmaCozumleri

# Branch'e geç
git checkout claude/analyze-structure-implementation-011CUzGxFkxC7vxSUTWu35zv

# Dependencies yükle
npm install

# Environment variables ayarla
cp .env.example .env
# .env dosyasını düzenle:
# JWT_SECRET="$(openssl rand -base64 32)"
```

### 2. Database Setup
```bash
# Prisma client oluştur
npx prisma generate

# Database migration (kritik!)
npx prisma migrate dev --name add-notifications-audit-approvers

# Seed data yükle
npx prisma db seed
```

### 3. Build Test
```bash
# Build folder temizle
rm -rf .next

# TypeScript check
npx tsc --noEmit
# ✅ Hata olmamalı

# Production build
npm run build
# ✅ Build başarılı olmalı
```

### 4. Development Test
```bash
# Dev server başlat
npm run dev

# Browser'da aç: http://localhost:3000
```

---

## 🧪 Fonksiyonel Testler

### Auth & Login ✓
- [ ] `/login` sayfası açılıyor
- [ ] Demo hesaplarla giriş yapılabiliyor (seed'den)
- [ ] Giriş sonrası `/dashboard`'a yönlendiriliyor
- [ ] Token localStorage'a kaydediliyor
- [ ] Logout çalışıyor

**Test Kullanıcıları (seed'den):**
```
Admin: admin@attelia.com / password123
Manager: manager@attelia.com / password123
Employee: employee@attelia.com / password123
```

### Admin Sayfaları - API Entegrasyonu ✓
- [ ] `/admin/products` - Ürünler listeleniyor (mock değil, gerçek API)
- [ ] `/admin/departments` - Departmanlar listeleniyor
- [ ] `/admin/users` - Kullanıcılar listeleniyor
- [ ] `/admin/suppliers` - Tedarikçiler listeleniyor
- [ ] Loading states gösteriliyor
- [ ] CRUD işlemleri çalışıyor (create/edit/delete)

### Workflow Sistemi - CRITICAL ✓
- [ ] `/admin/workflows` - Workflow listesi görünüyor
- [ ] Mock data doğru field'ları kullanıyor (`stepOrder`, `stepName`)
- [ ] API'den workflow çekme çalışıyor (seed data gösteriliyor)
- [ ] Workflow oluşturma çalışıyor
- [ ] Workflow düzenleme çalışıyor

**Workflow API Test:**
```bash
# Token al
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@attelia.com","password":"password123"}' \
  | jq -r '.data.token')

# Workflows listele
curl http://localhost:3000/api/workflows \
  -H "Authorization: Bearer $TOKEN" \
  | jq

# Sonuç: steps[] içinde stepOrder ve stepName olmalı
```

### Purchase Request - Approval Flow ✓
- [ ] Yeni talep oluşturma çalışıyor
- [ ] Workflow otomatik atanıyor (tutara göre)
- [ ] Approval steps doğru sırayla gösteriliyor
- [ ] Onaylama/Reddetme çalışıyor
- [ ] Approval history görünüyor

---

## 🆕 Yeni Özellikler Testleri

### Dosya Yükleme ✓
- [ ] FileUpload component render oluyor
- [ ] Dosya seçme çalışıyor
- [ ] `/api/upload` endpoint çalışıyor
- [ ] Dosyalar `/public/uploads/` altına kaydediliyor
- [ ] Preview gösteriliyor (resimler için)

**Test:**
```bash
# Manuel test: Admin > Products > Add Product > Upload image
```

### Bildirim Sistemi ✓
- [ ] Notification API endpoints çalışıyor

**API Test:**
```bash
# Bildirimleri listele
curl http://localhost:3000/api/notifications \
  -H "Authorization: Bearer $TOKEN" \
  | jq

# Okunmamış sayısı
curl http://localhost:3000/api/notifications?unreadOnly=true \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data.unreadCount'
```

### Export Fonksiyonları ✓
- [ ] Export butonları çalışıyor
- [ ] CSV dosyası indiriliyor
- [ ] Türkçe karakterler doğru gösteriliyor
- [ ] Tarih ve para formatları doğru

**Test:**
```javascript
// Browser console'da test et:
import { exportToCSV, formatters } from '/lib/export.ts'

const data = [
  { name: 'Test', price: 100, date: new Date() }
]
const columns = [
  { key: 'name', label: 'İsim' },
  { key: 'price', label: 'Fiyat', format: formatters.currency },
  { key: 'date', label: 'Tarih', format: formatters.date }
]
exportToCSV(data, columns, 'test.csv')
```

### Audit Log ✓
- [ ] AuditLog tablosu oluştu (migration'dan sonra)
- [ ] Audit utility fonksiyonları import edilebiliyor

**Database Check:**
```sql
-- Prisma Studio'da kontrol et
npx prisma studio

-- AuditLog tablosunu gör
SELECT * FROM "AuditLog" LIMIT 10;
```

---

## 🔴 Kritik Kontroller - FAIL ETMEMELI

### Schema Migration
```bash
# Migration dosyasını kontrol et
ls prisma/migrations/

# Son migration'ı gör
cat prisma/migrations/$(ls -t prisma/migrations/ | head -1)/migration.sql

# Kontrolle şunlar:
- [ ] ApprovalStep tablosu stepOrder ve stepName field'ları var
- [ ] Notification tablosu oluştu
- [ ] AuditLog tablosu oluştu
- [ ] approvers many-to-many relation oluştu
```

### Console Errors
```bash
# Dev mode'da browser console'u aç
# ❌ Kırmızı error olmamalı
# ⚠️ Sarı warning'ler kabul edilebilir
```

### Build Output
```bash
npm run build 2>&1 | grep -i error
# ❌ Hiçbir error olmamalı

npm run build 2>&1 | grep -i warning | wc -l
# ⚠️ Warning sayısı not edilmeli
```

---

## 🐛 Bilinen Sorunlar & Beklenen Davranış

### E-posta Servisi
**Durum:** Yapılandırılmamış
**Davranış:** Email fonksiyonları console'a log atar ama mail göndermez
**Kabul Edilebilir:** ✅ Evet, production'da yapılandırılacak

### Cache Sistemi
**Durum:** In-memory cache (Redis yok)
**Davranış:** Her deploy'da cache sıfırlanır
**Kabul Edilebilir:** ✅ Evet, production'da Redis eklenebilir

### Rate Limiting
**Durum:** Yok
**Davranış:** API'ye sınırsız istek atılabilir
**Kabul Edilebilir:** ⚠️ Staging'de OK, production'da ekle

---

## 📊 Test Sonuçları (Doldurulacak)

### Environment
- [ ] Node Version: __________
- [ ] npm Version: __________
- [ ] Database: PostgreSQL __________
- [ ] OS: __________

### Test Tarihi: __________
### Test Eden: __________

### Sonuçlar
- [ ] ✅ Tüm testler geçti
- [ ] ⚠️ Minor issues var (detay: __________)
- [ ] ❌ Critical issues var (detay: __________)

### Notlar:
```
(Test sırasında karşılaşılan sorunlar, performans gözlemleri, vs.)
```

---

## 🚨 Sorun Çözüm Rehberi

### Migration Hatası
```
Error: Migration failed
```
**Çözüm:**
```bash
# Migration'ı reset et
npx prisma migrate reset
# Seed data yeniden yükle
npx prisma db seed
```

### JWT_SECRET Hatası
```
Error: JWT_SECRET environment variable is required
```
**Çözüm:**
```bash
# .env dosyasına ekle
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
```

### Build Hatası
```
Error: TypeScript compilation failed
```
**Çözüm:**
```bash
# node_modules sil ve yeniden yükle
rm -rf node_modules package-lock.json
npm install

# Prisma client yeniden oluştur
npx prisma generate
```

### API 500 Hatası
```
GET /api/workflows → 500 Internal Server Error
```
**Çözüm:**
```bash
# Console'da detaylı hata mesajını kontrol et
# Database migration eksik olabilir
npx prisma migrate dev
```

---

## ✅ Test Başarılı - Production Hazır

Tüm testler geçtiğinde:

```bash
# 1. Main branch'i güncelle
git checkout main
git merge claude/analyze-structure-implementation-011CUzGxFkxC7vxSUTWu35zv

# 2. Production'a push
git push origin main

# 3. Vercel'de deploy
# Auto-deploy olacak veya manuel trigger

# 4. Production migration
# Vercel dashboard > Project > Environment Variables kontrol et
# Database migration Vercel build sırasında otomatik çalışacak
```

---

**⚠️ ÖNEMLİ:** Bu checklist'teki tüm itemler test edilmeden production'a geçme!
