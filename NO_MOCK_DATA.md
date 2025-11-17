# 🚫 NO MOCK DATA POLICY

## ⚠️ PROJE KURALI: MOCK DATA YASAK!

**Tarih**: 2025-11-17
**Durum**: ZORUNLU KURAL
**Uygulanabilirlik**: Tüm dosyalar, tüm environment'lar

---

## 📋 Kural

> **Bu projede MOCK DATA kullanımı KESINLIKLE YASAKTIR!**
>
> Tüm veriler SADECE gerçek veritabanından gelmelidir.

---

## ❌ YAPILMAMASI GEREKENLER

### 1. Mock Data Dosyaları
```typescript
// ❌ YASAK
export const mockUsers = [...]
export const mockProducts = [...]
export const mockData = {...}
```

### 2. Mock API Calls
```typescript
// ❌ YASAK
const mockApiCall = async () => {
  return { data: [...] }
}
```

### 3. Hardcoded Data
```typescript
// ❌ YASAK
const data = [
  { id: 1, name: 'Test' },
  { id: 2, name: 'Test 2' }
]
```

### 4. Development-only Mock Services
```typescript
// ❌ YASAK
if (process.env.NODE_ENV === 'development') {
  return mockData
}
```

---

## ✅ YAPILMASI GEREKENLER

### 1. Real API Calls
```typescript
// ✅ DOĞRU
const response = await fetch('/api/users')
const data = await response.json()
```

### 2. Prisma Database Queries
```typescript
// ✅ DOĞRU
const users = await prisma.user.findMany()
```

### 3. Loading States
```typescript
// ✅ DOĞRU
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchRealData()
}, [])
```

### 4. Empty States
```typescript
// ✅ DOĞRU
{data.length === 0 && (
  <EmptyState message="Henüz veri yok" />
)}
```

---

## 🔍 Silinen Mock Data Dosyaları

### lib/mockData.ts - SİLİNDİ
- ~~mockCompanies~~
- ~~mockDepartments~~
- ~~mockPurchaseRequests~~
- ~~mockProducts~~
- ~~mockCategories~~
- ~~mockBudgetData~~
- ~~mockReportData~~

---

## 📝 Güncelenen Dosyalar

### 1. app/dashboard/page.tsx
- **Önce**: Mock budget data
- **Sonra**: Real API call to `/api/reports/budget`

### 2. app/reports/page.tsx
- **Önce**: Mock report data
- **Sonra**: Real API calls to report endpoints

### 3. app/requests/page.tsx
- **Önce**: Mock purchase requests
- **Sonra**: Real API call to `/api/purchase-requests`

### 4. app/requests/[id]/page.tsx
- **Önce**: Mock single request
- **Sonra**: Real API call to `/api/purchase-requests/[id]`

---

## 🚨 CI/CD Check

### Pre-commit Hook (Future)
```bash
# Commit öncesi mock data kontrolü
if grep -r "mock\|Mock\|MOCK" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules .; then
  echo "❌ HATA: Mock data tespit edildi! Commit reddedildi."
  exit 1
fi
```

---

## 🎯 Test Data

### Geliştirme İçin
Test data sadece **seed.ts** dosyasında ve sadece veritabanına yazılır:

```typescript
// ✅ DOĞRU - prisma/seed.ts
await prisma.user.create({
  data: {
    email: 'test@example.com',
    name: 'Test User'
  }
})
```

### Test Environment
```bash
# Test database seed
npm run db:seed

# Test data viewing
npx prisma studio
```

---

## 📊 İstatistikler

- **Toplam Silinen Satır**: ~260 satır
- **Silinen Dosya**: 1 adet (lib/mockData.ts)
- **Güncellenen Dosya**: 4 adet
- **Mock Data Sayısı**: 0 ✅

---

## 🔒 Enforcement

1. **Code Review**: Her PR'da mock data kontrolü yapılacak
2. **Linter**: ESLint rule eklenecek (gelecekte)
3. **CI**: GitHub Actions ile otomatik kontrol (gelecekte)

---

## ⚡ Neden Bu Kural?

1. **Production ile Uyum**: Geliştirmede production ile aynı veri akışı
2. **Gerçek Test**: Gerçek API'larla gerçek testler
3. **Bakım Kolaylığı**: İki veri kaynağı yerine tek kaynak
4. **Hata Önleme**: Mock/real mismatch hataları yok
5. **Performans**: Gerçek query performance'ı erken tespit

---

**Son Güncelleme**: 2025-11-17
**Kural Durumu**: ✅ AKTIF
**Uyumluluk**: %100
