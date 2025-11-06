# Prisma TypeScript Pattern'leri ve Kuralları

Bu dosya, Prisma ile TypeScript kullanırken MUTLAKA uyulması gereken pattern'leri içerir.

## 🚨 KRİTİK PATTERN'LER

### Pattern 1: Optional Relation Field Assignment

```typescript
// ❌ ASLA BÖYLE YAPMA
const data = {
  workflowId: workflow?.id,  // Type: string | undefined
  categoryId: category?.id,   // Type: string | undefined
}
await prisma.model.create({ data })

// ✅ DOĞRU YÖNTEM 1: Conditional Spreading
const data = {
  ...baseData,
  ...(workflow?.id && { workflowId: workflow.id }),
  ...(category?.id && { categoryId: category.id }),
}

// ✅ DOĞRU YÖNTEM 2: Özelliği Kullanma
const data = {
  ...baseData,
  // Optional field'ları hiç ekleme
}

// ✅ DOĞRU YÖNTEM 3: Connect Pattern
const data = {
  ...baseData,
  workflow: workflow ? { connect: { id: workflow.id } } : undefined,
}
```

### Pattern 2: Zorunlu Field'lar

```typescript
// ❌ YANLIŞ - Zorunlu field eksik
await prisma.purchaseRequest.create({
  data: {
    title: 'Test',
    // companyId eksik ama şemada zorunlu!
  }
})

// ✅ DOĞRU - Önce user'dan gerekli bilgiyi al
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { companyId: true, departmentId: true }
})

if (!user?.companyId) {
  throw new Error('Company bilgisi bulunamadı')
}

await prisma.purchaseRequest.create({
  data: {
    title: 'Test',
    companyId: user.companyId,  // ✅ Zorunlu field
    requesterId: userId,
    departmentId: user.departmentId,
  }
})
```

### Pattern 3: Include ile Relation Kullanımı

```typescript
// ❌ YANLIŞ - Şemada olmayan relation
const result = await prisma.workflow.findMany({
  include: {
    steps: {
      include: {
        approvers: true,  // Bu relation şemada yok!
      }
    }
  }
})

// ✅ DOĞRU - Önce şemayı kontrol et
const result = await prisma.workflow.findMany({
  include: {
    steps: true,  // Sadece tanımlı relation'ları kullan
  }
})
```

### Pattern 4: Multi-tenant Filtering

```typescript
// ❌ YANLIŞ - Company filtrelemesi yok
const requests = await prisma.purchaseRequest.findMany({
  where: {
    status: 'PENDING'
  }
})

// ✅ DOĞRU - Her zaman companyId ile filtrele
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { companyId: true }
})

const requests = await prisma.purchaseRequest.findMany({
  where: {
    companyId: user.companyId,  // ✅ Company isolation
    status: 'PENDING'
  }
})
```

---

## 📋 DEPLOYMENT ÖNCESİ CHECKLIST

### API Route Kontrolleri

```typescript
// Her API route için bu kontrolleri yap:

export async function POST(request: NextRequest) {
  // 1. Authentication
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return error(401)

  const decoded = verifyToken(token)
  if (!decoded) return error(401)

  // 2. User ve Company Bilgisi
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { companyId: true }  // ✅ Gerekli field'ları al
  })

  if (!user?.companyId) return error(400, 'Şirket bilgisi bulunamadı')

  // 3. Data Hazırlama
  const body = await request.json()

  // 4. Prisma Operation - MUTLAKA companyId ekle
  const result = await prisma.model.create({
    data: {
      companyId: user.companyId,  // ✅ Zorunlu
      userId: decoded.userId,      // ✅ Zorunlu
      ...body,
      // Optional field'lar için conditional spreading
      ...(body.categoryId && { categoryId: body.categoryId }),
    }
  })

  return NextResponse.json({ success: true, data: result })
}
```

---

## 🔍 ŞEMA KONTROLÜ

Yeni bir API route yazmadan önce:

```bash
# 1. Prisma şemasını oku
cat prisma/schema.prisma | grep -A 30 "model ModelName"

# 2. Hangi field'lar zorunlu?
# - String (?) yok -> Zorunlu
# - String? var -> Optional

# 3. Hangi relation'lar var?
# - @relation ile tanımlı olanlar

# 4. Unique constraint'ler var mı?
# - @@unique([field1, field2])
```

---

## ⚡ HIZLI REFERANS

### Prisma Type Hatası Gördüğünde:

1. **"not assignable to type"** → Optional field hatası, conditional spreading kullan
2. **"missing properties"** → Zorunlu field eksik, şemayı kontrol et
3. **"does not exist in type"** → Relation şemada yok, include'u kaldır
4. **"Unique constraint failed"** → Duplicate data, önce kontrol et

### Hata Çözüm Sırası:

1. ✅ Route'u devre dışı bırak (deployment kurtarma)
2. ✅ Prisma şemasını incele
3. ✅ Eksik field'ları ekle veya optional'ları düzelt
4. ✅ Test et
5. ✅ Route'u tekrar aktif et

---

## 🎯 GOLDEN RULES

1. **Şema is the source of truth** - Code'a değil, şemaya göre yaz
2. **Optional = Conditional Spread** - `?.` gördün mü, `...()` kullan
3. **Company First** - Her işlemde `companyId` olmalı
4. **Fail Safe** - Çalışmayan route'u kapat, deployment'ı kurtar
5. **Document Everything** - Her hatayı bu dosyaya ekle

---

*Bu pattern'lere uymazsan deployment fail olur!*
