# 🔧 Sorun Giderme Rehberi (Troubleshooting Guide)

Attelia Dental Satın Alma Platformu için kapsamlı sorun giderme kılavuzu.

## 📋 İçindekiler

1. [Genel Sorunlar](#genel-sorunlar)
2. [Kimlik Doğrulama Sorunları](#kimlik-doğrulama-sorunları)
3. [E-posta Bildirimi Sorunları](#e-posta-bildirimi-sorunları)
4. [Workflow Sorunları](#workflow-sorunları)
5. [Dosya Yükleme Sorunları](#dosya-yükleme-sorunları)
6. [Database Sorunları](#database-sorunları)
7. [Performance Sorunları](#performance-sorunları)
8. [Deployment Sorunları](#deployment-sorunları)
9. [Debug Araçları](#debug-araçları)

---

## 🚨 Genel Sorunlar

### Sayfa Yüklenmiyor / Beyaz Ekran

**Semptomlar:**
- Sayfa tamamen boş
- "Application error" mesajı
- Console'da JavaScript hataları

**Debug Adımları:**

1. **Browser Console Kontrolü:**
   ```
   F12 → Console sekmesi
   Kırmızı hata mesajlarını kontrol et
   ```

2. **Network Tab Kontrolü:**
   ```
   F12 → Network → Reload
   Hangi request fail oluyor?
   Status code: 500, 404, 403?
   ```

3. **Vercel Logs:**
   ```
   Vercel Dashboard → Project → Logs
   Runtime logs → Son 1 saat
   ```

**Olası Nedenler ve Çözümler:**

#### 1. Environment Variable Eksik

**Hata:**
```
Error: Environment variable "JWT_SECRET" is not defined
```

**Çözüm:**
```bash
# Vercel Dashboard'dan kontrol et
Settings → Environment Variables

# Eksik olanları ekle:
JWT_SECRET=your-secret-here
NEXTAUTH_SECRET=your-secret-here
DATABASE_URL=postgresql://...
```

#### 2. Database Bağlantı Hatası

**Hata:**
```
Error: Can't reach database server at `localhost:5432`
```

**Çözüm:**
```bash
# DATABASE_URL doğru mu kontrol et
echo $DATABASE_URL

# Connection string formatı:
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public

# SSL gerekiyorsa:
postgresql://...?sslmode=require
```

#### 3. Build Hatası

**Hata:**
```
Error: Module not found: Can't resolve '@/components/...'
```

**Çözüm:**
```bash
# Dependencies yükle
npm install --legacy-peer-deps

# Cache temizle
rm -rf .next
npm run build

# TypeScript hatalarını kontrol et
npm run type-check
```

---

### API Endpoint 404 Hatası

**Semptomlar:**
- API isteği 404 döner
- "Page not found"

**Kontrol Listesi:**

```bash
# 1. Route dosyası var mı?
ls -la app/api/[endpoint-path]/route.ts

# 2. Export doğru mu?
# ✅ DOĞRU:
export async function GET(request: NextRequest) { ... }

# ❌ YANLIŞ:
export default async function GET() { ... }

# 3. Vercel'de redeploy gerekebilir
git push origin main
```

---

## 🔐 Kimlik Doğrulama Sorunları

### Giriş Yapılamıyor - "Geçersiz Token"

**Semptomlar:**
- Login başarılı gibi görünüyor ama dashboard'a yönlendirmiyor
- "Geçersiz token" hatası
- Sürekli login sayfasına yönlendiriliyor

**Debug:**

```javascript
// Browser Console'da:
localStorage.getItem('token')

// Token varsa, jwt.io'da decode et:
// https://jwt.io
// - exp (expiration) geçmiş mi?
// - userId, companyId var mı?
```

**Olası Nedenler:**

#### 1. JWT_SECRET Değişmiş

**Problem:** Production'da JWT_SECRET değiştiyse tüm token'lar invalid olur.

**Çözüm:**
```
1. Kullanıcılardan logout/login isteyin
2. JWT_SECRET'ı değiştirmeyin (production'da)
3. Değiştirdiyseniz, tüm kullanıcılar logout olacak
```

#### 2. Token Expired

**Problem:** Token süresi dolmuş (default: 7 gün)

**Çözüm:**
```javascript
// lib/auth.ts'de süreyi artır:
const token = jwt.sign(
  payload,
  process.env.JWT_SECRET!,
  { expiresIn: '30d' }  // 7d → 30d
);
```

#### 3. CORS Hatası

**Problem:** Frontend ve backend farklı domain'lerde

**Hata:**
```
Access to fetch at 'https://api.example.com' from origin 'https://app.example.com'
has been blocked by CORS policy
```

**Çözüm:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // CORS headers ekle
  response.headers.set('Access-Control-Allow-Origin', 'https://app.example.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}
```

---

### Kullanıcı Kayıt Olmuyor

**Semptomlar:**
- Register butonuna basınca hata
- "E-posta zaten kullanılıyor" (ama değil)

**Debug:**

```sql
-- Database'de kullanıcı var mı?
SELECT * FROM "User" WHERE email = 'test@example.com';

-- Şirket oluştu mu?
SELECT * FROM "Company" WHERE subdomain = 'testcompany';
```

**Olası Nedenler:**

#### 1. Subdomain Conflict

**Problem:** Subdomain zaten kullanılıyor

**Çözüm:**
```typescript
// Farklı subdomain dene
// Veya database'deneski şirketi sil (development):
DELETE FROM "Company" WHERE subdomain = 'old-subdomain';
```

#### 2. Password Hash Hatası

**Problem:** bcrypt versiyonu yanlış

**Çözüm:**
```bash
npm uninstall bcryptjs
npm install bcrypt@^5.1.0
```

---

## 📧 E-posta Bildirimi Sorunları

### E-postalar Gönderilmiyor

**Semptomlar:**
- Kullanıcılar bildirim almıyor
- Workflow ilerliyor ama e-posta gelmiyor
- Logs'ta "Email sent" görünüyor ama gelmemiş

**Debug Adımları:**

#### 1. SMTP Ayarları Kontrolü

```bash
# Environment variables:
echo $SMTP_HOST
echo $SMTP_PORT
echo $SMTP_USER
# SMTP_PASS gösterilmemeli (güvenlik)

# Eksikse:
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-api-key
SMTP_FROM=noreply@yourdomain.com
```

#### 2. SendGrid Dashboard Kontrolü

```
1. SendGrid'e giriş yap
2. Activity → Recent Activity
3. Son 24 saatteki e-postalar
4. Status kontrol: Delivered, Bounced, Deferred?
```

**E-posta Durumları:**

| Status | Anlamı | Çözüm |
|--------|--------|-------|
| **Delivered** | ✅ Başarılı | - |
| **Deferred** | ⏳ Gecikti | Birkaç dk bekle |
| **Bounced** | ❌ Geri döndü | E-posta adresi hatalı |
| **Dropped** | 🚫 Engellendi | Spam listede veya unsubscribed |
| **Blocked** | 🛑 Bloklandı | Domain/IP kara listede |

#### 3. Spam Folder

**Kullanıcıya Söyle:**
```
1. Spam/Junk klasörünü kontrol et
2. Sender'ı "Safe" olarak işaretle
3. noreply@yourdomain.com'u contacts'a ekle
```

#### 4. Domain Verification

**Problem:** Domain authenticated değil

**Çözüm:**
```
1. SendGrid → Settings → Sender Authentication
2. Authenticate Your Domain
3. DNS records'u ekle (domain provider'da)
4. Verify (24 saate kadar sürebilir)

DNS Records Example:
em1234.yourdomain.com   CNAME   u1234567.wl123.sendgrid.net
s1._domainkey.yourdomain.com   CNAME   s1.domainkey.u1234567.wl123.sendgrid.net
s2._domainkey.yourdomain.com   CNAME   s2.domainkey.u1234567.wl123.sendgrid.net
```

#### 5. API Key Permissions

**Problem:** API key "Mail Send" permission'ı yok

**Çözüm:**
```
1. SendGrid → Settings → API Keys
2. [Your Key] → Edit
3. "Mail Send" permission ✅
4. Save
```

#### 6. Rate Limiting

**Problem:** SendGrid free tier limitleri:

```
Free Tier:
- 100 emails/day
- 200 emails/day (after verification)

Paid Tier:
- 40,000+/month
```

**Çözüm:**
```
1. SendGrid Dashboard → Usage
2. Quota control
3. Upgrade plan if needed
```

---

### E-posta Gönderiliyor Ama İçerik Yanlış

**Semptomlar:**
- E-posta geliyor ama template değişkenleri görünüyor
- Örn: "Merhaba {{userName}}" yerine düzgün isim olmalı

**Problem:** Template rendering hatası

**Debug:**

```typescript
// lib/email.ts'de:
console.log('Email variables:', {
  userName: user.name,
  requestNumber: request.requestNumber,
  // ... diğer değişkenler
});

// Template render:
const rendered = template
  .replace(/\{\{userName\}\}/g, user.name)
  .replace(/\{\{requestNumber\}\}/g, request.requestNumber);

console.log('Rendered email:', rendered);
```

**Çözüm:**
```typescript
// Tüm değişkenlerin tanımlı olduğundan emin ol
const variables = {
  userName: user?.name || 'Kullanıcı',
  requestNumber: request?.requestNumber || 'N/A',
  // Fallback değerler ekle
};
```

---

## 🔄 Workflow Sorunları

### Workflow Başlamıyor

**Semptomlar:**
- Purchase request oluşturuluyor
- Ama workflow instance yok
- Onay görevleri oluşmuyor

**Debug:**

```typescript
// Purchase request create sonrası:
console.log('Workflow check:', {
  workflowId: workflow?.id,
  isVisual: workflow?.isVisual,
  isActive: workflow?.isActive
});

// Workflow start result:
const result = await startWorkflow(...);
console.log('Workflow start result:', result);
```

**Olası Nedenler:**

#### 1. Workflow Aktif Değil

**Kontrol:**
```sql
SELECT id, name, "isActive", "isVisual"
FROM "ApprovalWorkflow"
WHERE "companyId" = 'your-company-id';
```

**Çözüm:**
```
Admin Panel → Workflows → [Workflow seç] → Aktif Et
```

#### 2. Workflow Validation Hatası

**Hata:**
```
Workflow validation failed: No start node found
```

**Çözüm:**
```
1. Workflow Designer'ı aç
2. Validation hatalarını kontrol et:
   ✗ Start node eksik
   ✗ Orphan node var
   ✗ Cycle tespit edildi
3. Hataları düzelt
4. Save
5. Tekrar aktif et
```

#### 3. Purchase Request Integration Hatası

**Kontrol:**
```typescript
// app/api/purchase-requests/route.ts
// Workflow start kodu var mı?

if (workflow && workflow.isVisual) {
  const workflowResult = await startWorkflow(
    workflow.id,
    purchaseRequest.id,
    decoded.userId
  );

  if (!workflowResult.success) {
    console.error('Workflow start failed:', workflowResult.error);
  }
}
```

---

### Workflow Takıldı / İlermiyor

**Semptomlar:**
- Workflow instance RUNNING durumunda
- Ama task oluşmuyor
- currentNodeId değişmiyor

**Debug:**

```sql
-- Workflow instance durumu:
SELECT
  id, status, "currentNodeId",
  "completedNodeIds", variables
FROM "WorkflowInstance"
WHERE id = 'instance-id';

-- İlgili tasks:
SELECT id, "nodeId", status, "assigneeId"
FROM "WorkflowTask"
WHERE "workflowInstanceId" = 'instance-id';
```

**Olası Nedenler:**

#### 1. Approver Bulunamadı

**Problem:** Approval node'da belirtilen role sahip kullanıcı yok

**Debug:**
```sql
-- APPROVER rolünde aktif kullanıcı var mı?
SELECT id, name, email, role, "isActive"
FROM "User"
WHERE role = 'APPROVER'
  AND "isActive" = true
  AND "companyId" = 'your-company-id';
```

**Çözüm:**
```
1. En az bir APPROVER kullanıcı ekle
2. Veya approval node config'i değiştir:
   - approverType: "user"
   - approverUsers: ["specific-user-id"]
```

#### 2. Decision Node Condition Hatası

**Problem:** Condition evaluate edilemiyor

**Debug:**
```javascript
// lib/workflow-executor.ts'de log ekle:
console.log('Decision evaluation:', {
  field: condition.field,
  operator: condition.operator,
  value: condition.value,
  actualValue: variables[condition.field],
  result: evaluate(condition, variables)
});
```

**Çözüm:**
```javascript
// Condition'ları kontrol et:
// - Field adı doğru mu? (estimatedTotal, priority, category)
// - Operator doğru mu? (>, <, ==, etc.)
// - Value type doğru mu? (number, string)

// Örnek düzeltme:
{
  field: "estimatedTotal",  // ✅
  operator: ">",
  value: 10000  // number, not "10000"
}
```

#### 3. Parallel Join Bekliyor

**Problem:** Parallel split'ten gelen tüm dallar complete olmamış

**Debug:**
```javascript
// Parallel join node'da hangi dallar complete?
const completedBranches = instance.completedNodeIds.filter(
  nodeId => parallellSplitOutputs.includes(nodeId)
);

console.log('Completed branches:', completedBranches.length);
console.log('Required branches:', totalBranches);
```

**Çözüm:**
```
Tüm parallel branch'lerin complete olmasını bekle.
Stuck bir branch varsa o branch'i debug et.
```

---

### Onay Kararı İşlenmiyor

**Semptomlar:**
- Approve/Reject butonuna basılıyor
- Ama task status değişmiyor
- Workflow devam etmiyor

**Debug:**

```javascript
// POST /api/workflows/tasks/[taskId]/decide
console.log('Decision request:', {
  taskId,
  approverId: decoded.userId,
  decision,
  comment
});

// handleApprovalDecision result:
const result = await handleApprovalDecision(...);
console.log('Decision result:', result);
```

**Olası Nedenler:**

#### 1. Permission Hatası

**Problem:** Kullanıcı task'ın assignee'si değil

**Kontrol:**
```sql
SELECT "assigneeId"
FROM "WorkflowTask"
WHERE id = 'task-id';

-- Eşleşiyor mu?
-- assigneeId === decoded.userId
```

**Çözüm:**
```
Sadece task'a atanan kullanıcı onay verebilir.
Admin dashboard'dan task assignee'sini kontrol et.
```

#### 2. Threshold Karşılanmadı

**Problem:** "all" threshold ama bir kişi onayladı

**Debug:**
```javascript
console.log('Threshold check:', {
  threshold: approvalConfig.threshold,
  totalApprovers: tasks.length,
  approvedCount: approvedTasks.length,
  rejectedCount: rejectedTasks.length,
  thresholdMet: isThresholdMet
});
```

**Çözümler:**

| Threshold | Requirement | Example |
|-----------|-------------|---------|
| `all` | Tümü onaylamalı | 3/3 approved |
| `any` | Herhangi biri | 1/3 approved |
| `majority` | Çoğunluk (>50%) | 2/3 approved |
| `count` | Belirli sayı | 2/5 approved (count=2) |

---

## 📎 Dosya Yükleme Sorunları

### Dosya Yüklenmiyor

**Semptomlar:**
- "Dosya yüklenemedi" hatası
- Upload button loading'de takılı kalıyor
- Console'da network error

**Debug:**

```javascript
// Browser Console:
// Network tab → Upload request:
// - Status code?
// - Response body?
// - Request size?

// Vercel Logs:
// Function timeout?
// Memory exceeded?
```

**Olası Nedenler:**

#### 1. Vercel Blob Token Eksik/Hatalı

**Kontrol:**
```bash
echo $BLOB_READ_WRITE_TOKEN

# Format:
# vercel_blob_rw_XXXXXXXXXX
```

**Çözüm:**
```
1. Vercel Dashboard → Storage → Blob
2. [Store seç] → Settings → Tokens
3. Create New Token
4. Copy token
5. Environment Variables'a ekle:
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
6. Redeploy
```

#### 2. Dosya Boyutu Limiti

**Limitler:**
```
- Single file: 10MB (configurable)
- Total request: 50MB
- Vercel Function timeout: 10s (Hobby), 60s (Pro)
```

**Hata:**
```
Error: File size exceeds maximum allowed size (10MB)
```

**Çözüm:**
```javascript
// lib/blob.ts'de limit artır:
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 10MB → 20MB

// Veya kullanıcıya dosyayı küçültmesini söyle:
// - Resimler için: tinypng.com, squoosh.app
// - PDF için: ilovepdf.com/compress_pdf
```

#### 3. File Type Desteklenmiyor

**Desteklenen Formatlar:**
```javascript
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];
```

**Hata:**
```
Error: File type 'application/zip' is not allowed
```

**Çözüm:**
```javascript
// lib/blob.ts'de type ekle (dikkatli!):
const ALLOWED_TYPES = [
  ...ALLOWED_TYPES,
  'application/zip'  // Güvenlik riski!
];
```

#### 4. Network Timeout

**Problem:** Yavaş internet bağlantısı

**Çözüm:**
```javascript
// app/api/settings/logo/route.ts
// Timeout artır:
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
  maxDuration: 60, // 10s → 60s (Pro plan gerekir)
};
```

---

### Dosya Yüklendi Ama Görünmüyor

**Semptomlar:**
- Upload başarılı mesajı
- Ama logo/dosya görünmüyor
- Broken image icon

**Debug:**

```javascript
// Browser console'da:
const logoUrl = document.querySelector('img')?.src;
console.log('Logo URL:', logoUrl);

// URL açılıyor mu?
// https://xxxxx.public.blob.vercel-storage.com/logo.png

// Status code: 404, 403, 200?
```

**Olası Nedenler:**

#### 1. Cache Sorunu

**Çözüm:**
```javascript
// Hard refresh:
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

// Veya cache-busting:
const logoUrl = `${company.logo}?t=${Date.now()}`;
```

#### 2. CDN Propagation

**Problem:** Vercel Blob CDN'e yeni yüklendi

**Çözüm:**
```
2-5 dakika bekle. CDN global olarak yayılıyor.
```

#### 3. Access Control

**Problem:** Blob private, public olmalı

**Çözüm:**
```typescript
// lib/blob.ts
const blob = await put(filename, file, {
  access: 'public',  // 'private' değil!
  addRandomSuffix: true,
});
```

---

## 🗄️ Database Sorunları

### Migration Hatası

**Hata:**
```
Error: Migration failed: relation "WorkflowInstance" already exists
```

**Debug:**

```bash
# Mevcut migrations:
npx prisma migrate status

# Database schema:
npx prisma db pull
```

**Çözümler:**

#### Development:

```bash
# Reset database (UYARI: Tüm data silinir!)
npx prisma migrate reset

# Yeni migration:
npx prisma migrate dev --name fix-migration
```

#### Production:

```bash
# DIKKAT: Production'da reset YAPMAYIN!

# Manuel migration:
npx prisma migrate resolve --applied "migration-name"

# Veya force:
npx prisma db push --accept-data-loss
```

---

### Connection Pool Exhausted

**Hata:**
```
Error: Connection pool timeout. Connection count: 50/50
```

**Problem:** Çok fazla eşzamanlı database bağlantısı

**Çözüm:**

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error'],
  // Connection pool settings:
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Connection pool limit artır:
// DATABASE_URL="postgresql://...?connection_limit=50&pool_timeout=20"
```

---

### Query Timeout

**Hata:**
```
Error: Query timeout after 10000ms
```

**Problem:** Yavaş query veya çok büyük dataset

**Debug:**

```typescript
// Prisma query logging:
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query:', e.query);
  console.log('Duration:', e.duration + 'ms');
});
```

**Çözümler:**

#### 1. Index Ekle

```prisma
// schema.prisma
model PurchaseRequest {
  // ...

  @@index([companyId, status])
  @@index([createdAt])
  @@index([requestNumber])
}
```

#### 2. Pagination Kullan

```typescript
// ❌ YANLIŞ: Tüm data'yı çek
const allRequests = await prisma.purchaseRequest.findMany();

// ✅ DOĞRU: Pagination
const requests = await prisma.purchaseRequest.findMany({
  take: 50,
  skip: page * 50,
  orderBy: { createdAt: 'desc' },
});
```

#### 3. Select Specific Fields

```typescript
// ❌ YANLIŞ: Tüm fields
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    purchaseRequests: {
      include: {
        items: true,
        suppliers: true,
        approvals: true,
        // ... çok fazla data!
      }
    }
  }
});

// ✅ DOĞRU: Sadece gerekli fields
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
  }
});
```

---

## ⚡ Performance Sorunları

### Sayfa Yavaş Yükleniyor

**Diagnosis:**

```bash
# 1. Vercel Analytics
Dashboard → Analytics → Performance
# - TTFB (Time to First Byte)
# - FCP (First Contentful Paint)
# - LCP (Largest Contentful Paint)

# 2. Lighthouse
# Chrome DevTools → Lighthouse → Analyze

# 3. Network Tab
# F12 → Network → Disable cache → Reload
# Hangi requestler yavaş?
```

**Optimizasyon:**

#### 1. Database Query Optimization

**N+1 Problem:**

```typescript
// ❌ YANLIŞ: N+1 query
const requests = await prisma.purchaseRequest.findMany();
for (const request of requests) {
  const requester = await prisma.user.findUnique({
    where: { id: request.requesterId }
  });
  // N additional queries!
}

// ✅ DOĞRU: Single query with include
const requests = await prisma.purchaseRequest.findMany({
  include: {
    requester: {
      select: { id: true, name: true, email: true }
    }
  }
});
```

#### 2. API Response Caching

```typescript
// app/api/purchase-requests/route.ts
export async function GET(request: NextRequest) {
  const data = await fetchData();

  return NextResponse.json(data, {
    headers: {
      // Cache for 1 minute
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    }
  });
}
```

#### 3. Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['xxxxx.public.blob.vercel-storage.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
};

// Component'te:
import Image from 'next/image';

<Image
  src={company.logo}
  alt="Logo"
  width={200}
  height={200}
  priority // Above fold için
/>
```

#### 4. Code Splitting

```typescript
// Dynamic import:
import dynamic from 'next/dynamic';

const WorkflowDesigner = dynamic(
  () => import('@/components/WorkflowDesigner'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false // Client-side only
  }
);
```

#### 5. Remove Console.logs

```typescript
// Production'da console.log'ları kaldır:
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.debug = () => {};
}

// Veya babel plugin:
// babel-plugin-transform-remove-console
```

---

### API Response Çok Yavaş (>2s)

**Debug:**

```typescript
// Timing middleware:
export function middleware(request: NextRequest) {
  const start = Date.now();

  return NextResponse.next({
    headers: {
      'X-Response-Time': `${Date.now() - start}ms`
    }
  });
}

// API route'da:
export async function GET() {
  const start = Date.now();

  const data = await fetchData();
  console.log('Query time:', Date.now() - start, 'ms');

  return NextResponse.json(data);
}
```

**Optimization:**

```typescript
// Parallel queries:
// ❌ YANLIŞ: Sequential (700ms + 500ms = 1200ms)
const users = await prisma.user.findMany(); // 700ms
const requests = await prisma.purchaseRequest.findMany(); // 500ms

// ✅ DOĞRU: Parallel (max(700ms, 500ms) = 700ms)
const [users, requests] = await Promise.all([
  prisma.user.findMany(),
  prisma.purchaseRequest.findMany(),
]);
```

---

## 🚀 Deployment Sorunları

### Vercel Build Fail

**Hata:**
```
Error: Build failed with exit code 1
```

**Debug:**

```bash
# Vercel Logs:
Vercel Dashboard → Deployments → [Failed deployment] → Logs

# Local test:
npm run build

# TypeScript errors:
npm run type-check
```

**Olası Nedenler:**

#### 1. TypeScript Error

```bash
# Tüm hatalar:
npx tsc --noEmit

# Örnek hata:
# src/components/Dashboard.tsx:45:12 - error TS2339:
# Property 'requestNumber' does not exist on type 'never'.
```

**Çözüm:** Hataları düzelt ve commit et.

#### 2. Environment Variable Eksik

**Build-time variables:**
```bash
# Vercel Dashboard → Settings → Environment Variables
# "Preview" ve "Production" için ayrı ayrı ekle

NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app
```

#### 3. Dependency Conflict

```bash
# Lock file conflict:
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Commit:
git add package-lock.json
git commit -m "Fix dependency conflict"
git push
```

---

### Deployment Başarılı Ama Site Çalışmıyor

**Semptomlar:**
- Build success
- Ama site 500 error
- Veya sayfa boş

**Debug:**

```bash
# Runtime logs:
Vercel Dashboard → Project → Logs → Runtime Logs

# Health check:
curl https://yourdomain.vercel.app/api/health

# Expected:
# {"status": "ok", "timestamp": "..."}
```

**Olası Nedenler:**

#### 1. Runtime Environment Variable Eksik

```bash
# Kontrol et:
Vercel Dashboard → Settings → Environment Variables

# Gerekli variables:
DATABASE_URL
JWT_SECRET
NEXTAUTH_SECRET
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
BLOB_READ_WRITE_TOKEN
```

#### 2. Database Migration

```bash
# Migration yapılmadıysa:
# Local'de:
DATABASE_URL="production-url" npx prisma migrate deploy

# Veya Vercel CLI:
vercel env pull .env.production
npx prisma migrate deploy
```

#### 3. Function Timeout

**Hata:**
```
Error: Function execution timed out after 10s
```

**Çözüm:**
```javascript
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30  // Hobby: 10s, Pro: 60s
    }
  }
}
```

---

## 🛠️ Debug Araçları

### 1. Prisma Studio

```bash
# Database GUI:
npx prisma studio

# http://localhost:5555 açılır
# Tüm tabloları görüntüle, düzenle
```

### 2. React DevTools

```bash
# Chrome extension:
# https://chrome.google.com/webstore
# "React Developer Tools"

# F12 → Components/Profiler sekmesi
```

### 3. Vercel CLI

```bash
# Install:
npm i -g vercel

# Login:
vercel login

# Logs:
vercel logs [deployment-url]

# Env variables:
vercel env ls
vercel env pull
```

### 4. Database Query Logger

```typescript
// lib/prisma.ts
export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'stdout' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// Tüm SQL queries console'da görünür
```

### 5. Email Testing (Development)

```bash
# Mailtrap kullan (production yerine):
# https://mailtrap.io

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass

# Tüm e-postalar Mailtrap inbox'a gider
# Kullanıcılara gerçekten gönderilmez
```

---

## 📞 Yardım Alma

### 1. Log Topla

```bash
# Application logs:
Vercel Dashboard → Logs → Runtime Logs → Last 1 hour

# Browser console:
F12 → Console → (Screenshot)

# Network errors:
F12 → Network → Failed requests → Response

# Database:
npx prisma studio → Tables → Data
```

### 2. Minimal Reproducible Example

```typescript
// Hatayı en basit haliyle reproduce et:

// ❌ Karmaşık:
// "Purchase request oluştururken, dosya yüklerken,
//  onay verirken bazen hata oluyor"

// ✅ Basit:
async function reproduce() {
  const result = await createPurchaseRequest({
    title: 'Test',
    estimatedTotal: 1000
  });
  // Error: ...
}
```

### 3. Version Info

```bash
# Package versions:
cat package.json | grep '"version"'

# Node version:
node -v

# npm version:
npm -v

# Prisma version:
npx prisma -v
```

### 4. Destek Kanalları

**Acil Sorunlar (Production Down):**
- 📧 critical@attelia.com
- 📱 +90 555 999 9999 (24/7)

**Normal Sorunlar:**
- 📧 support@attelia.com
- 💬 Slack: #support
- 📚 Docs: docs.attelia.com

**Topluluk:**
- 💬 Discord: discord.gg/attelia
- 📝 GitHub Issues: github.com/attelia/issues

---

## ✅ Checklist Before Asking for Help

Destek istemeden önce:

- [ ] Browser console'da error var mı?
- [ ] Network tab'de failed request var mı?
- [ ] Vercel logs kontrol ettim mi?
- [ ] Environment variables doğru mu?
- [ ] Database migration güncel mi?
- [ ] Google'da hatayı aradım mı?
- [ ] Documentation'ı okudum mu?
- [ ] Restart/rebuild denedim mi?
- [ ] Farklı browser'da denedim mi?
- [ ] Cache temizledim mi?

---

## 🎓 Debug Teknikleri

### Console.log Debugging

```typescript
// Strategic log placement:

console.log('1. Function started', { input });
const result = await someOperation();
console.log('2. Operation result', { result });

if (result.success) {
  console.log('3. Success path');
} else {
  console.log('3. Error path', { error: result.error });
}

console.log('4. Function ended');
```

### Try-Catch Wrapping

```typescript
try {
  const result = await riskyOperation();
  console.log('Success:', result);
} catch (error) {
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    name: error.name,
  });
  throw error; // Re-throw for upstream handling
}
```

### Network Tab Analysis

```
F12 → Network → Filter: Fetch/XHR

Her request için:
1. Request URL: Doğru endpoint?
2. Request Method: GET, POST, PUT, DELETE?
3. Status Code: 200, 404, 500?
4. Request Headers: Authorization var mı?
5. Request Payload: Data doğru mu?
6. Response: Error message?
7. Timing: Ne kadar sürdü?
```

---

**Last Updated:** 2024-11-07
**Version:** 1.0.0

💡 **Hatırlatma:** Çoğu sorun environment variables, database migration veya cache sorunlarından kaynaklanır. Önce bunları kontrol edin!
