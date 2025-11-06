# Vercel Deployment Kuralları ve Hatalar

Bu dosya, Vercel deployment sürecinde karşılaşılan hataları ve çözümleri içerir. Bu kurallar mutlaka uygulanmalıdır.

## 🚫 ASLA KULLANILMAMASI GEREKEN PATTERN'LER

### 1. Prisma Optional Field Hatası - `workflowId`
**HATA:**
```typescript
// ❌ YANLIŞ - TypeScript hatası verir
const data = {
  workflowId: workflow?.id  // string | undefined
}

prisma.purchaseRequest.create({ data })
```

**NEDEN:** Prisma'nın tip sistemi, optional field'ların ya değer içermesi ya da hiç olmaması gerektiğini söyler. `undefined` değeri kabul edilmez.

**ÇÖZÜM:**
```typescript
// ✅ DOĞRU - Conditional spreading kullan
const data = {
  ...(workflow?.id && { workflowId: workflow.id })
}

// VEYA daha basit: Özelliği tamamen kaldır
const data = {
  // workflowId olmadan
}
```

**KURAL:** Workflow gibi karmaşık özellikler deployment'ı tehlikeye atıyorsa, özelliği tamamen devre dışı bırak.

---

### 2. Eksik Zorunlu Field - `companyId`
**HATA:**
```typescript
// ❌ YANLIŞ - companyId eksik
await prisma.purchaseRequest.create({
  data: {
    requesterId: userId,
    departmentId: deptId,
    // companyId eksik!
  }
})
```

**NEDEN:** Prisma şemasında `companyId` zorunlu bir field ama API route'unda eksik.

**ÇÖZÜM:**
```typescript
// ✅ DOĞRU - User'dan companyId al
const user = await prisma.user.findUnique({
  where: { id: decoded.userId },
  select: { companyId: true }
})

if (!user?.companyId) {
  return NextResponse.json({ error: 'Şirket bilgisi bulunamadı' }, { status: 400 })
}

await prisma.purchaseRequest.create({
  data: {
    companyId: user.companyId,  // ✅ Zorunlu field eklendi
    requesterId: userId,
    departmentId: deptId,
  }
})
```

**KURAL:** Her Prisma create/update işleminden önce, şemadaki tüm zorunlu field'ların varlığını kontrol et.

---

### 3. Olmayan Prisma Relation Kullanımı - `approvers`
**HATA:**
```typescript
// ❌ YANLIŞ - approvers relation şemada yok
include: {
  steps: {
    include: {
      approvers: { ... }  // Bu relation tanımlı değil!
    }
  }
}
```

**NEDEN:** Code'da kullanılan `approvers` relation'ı Prisma şemasında tanımlı değil.

**ÇÖZÜM:**
```typescript
// ✅ DOĞRU - Route'u devre dışı bırak
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Bu özellik şu anda devre dışı' },
    { status: 503 }
  )
}
```

**KURAL:** Şema ile uyumsuz API route'ları hemen devre dışı bırak. Deploy edilebilirlik > Özellik çokluğu.

---

## ✅ DEPLOYMENT KURALLAR CHECKLIST

### Kural 1: Prisma Şema Uyumluluğu
- [ ] Her API route'unda kullanılan model field'ları şemada var mı?
- [ ] Tüm zorunlu field'lar değer alıyor mu?
- [ ] Kullanılan relation'lar şemada tanımlı mı?

### Kural 2: Optional Field'lar
- [ ] Optional field'lar için conditional spreading kullanılıyor mu?
- [ ] `undefined` değerleri direkt olarak assign edilmiyor mu?

### Kural 3: Multi-tenant (companyId)
- [ ] Her create/update işleminde `companyId` ekleniyor mu?
- [ ] GET request'lerde `companyId` filtrelemesi var mı?
- [ ] User'ın `companyId` kontrolü yapılıyor mu?

### Kural 4: Hata Önceliği
- [ ] Karmaşık özellikler (workflow, approval) deployment'ı engelliyor mu?
- [ ] Engelleyen özellikler geçici olarak devre dışı bırakıldı mı?
- [ ] Devre dışı route'lar 503 hatası dönüyor mu?

---

## 🔧 DEPLOYMENT SONRASI İYILEŞTİRMELER

Bu özellikler ileride eklenebilir ama ASLA deployment'ı engellememelidir:

1. **Workflow Sistemi** - Prisma şeması güncellenmeden kullanılmamalı
2. **Approval Workflow** - ApprovalStep modelindeki relation'lar düzeltilmeden kullanılmamalı
3. **Dynamic Field Assignment** - Optional field'lar için uygun pattern kullanılmalı

---

## 📝 GEÇMİŞ DEPLOYMENT HATALARI

### 2025-11-06: Vercel Deployment Hatası

**Karşılaşılan Hatalar:**
1. ❌ `workflowId: workflow?.id` - TypeScript optional field hatası
2. ❌ Missing `companyId` in PurchaseRequest creation
3. ❌ Non-existent `approvers` relation in workflow routes

**Uygulanan Çözümler:**
1. ✅ Workflow özelliğini tamamen kaldırdık
2. ✅ `companyId` field'ını tüm purchase request işlemlerine ekledik
3. ✅ Workflow API route'larını devre dışı bıraktık

**Commit'ler:**
- `23695c1` - Remove workflow functionality from purchase request creation
- `d81ed01` - Add companyId to purchase request operations
- `6428bf4` - Disable workflows API routes

**Sonuç:** ✅ Deployment başarılı

---

## 🎯 ÖZET KURALLAR

1. **Deployment > Özellikler**: Deployment başarısız oluyorsa, özelliği kaldır
2. **Şema First**: Code yazmadan önce Prisma şemasını kontrol et
3. **Optional Fields**: Conditional spreading veya hiç kullanma
4. **Company Isolation**: Her işlemde `companyId` zorunlu
5. **Fail Fast**: Hata alınca hemen ilgili route'u devre dışı bırak

---

*Son güncelleme: 2025-11-06*
*Bu dosyayı her deployment hatasından sonra güncelle!*
