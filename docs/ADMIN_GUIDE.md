# 🔧 Yönetici Rehberi (Admin Guide)

Attelia Dental Satın Alma Platformu sistem yöneticileri için kapsamlı kılavuz.

## 📋 İçindekiler

1. [Admin Paneline Giriş](#admin-paneline-giriş)
2. [Kullanıcı Yönetimi](#kullanıcı-yönetimi)
3. [Görsel Workflow Tasarımı](#görsel-workflow-tasarımı)
4. [Şirket Ayarları ve Kişiselleştirme](#şirket-ayarları-ve-kişiselleştirme)
5. [E-posta Şablonları](#e-posta-şablonları)
6. [Sistem İzleme ve Raporlama](#sistem-izleme-ve-raporlama)
7. [Yedekleme ve Güvenlik](#yedekleme-ve-güvenlik)
8. [Sorun Giderme](#sorun-giderme)

---

## 🎯 Admin Paneline Giriş

### Admin Rolü ve Yetkiler

ADMIN rolü, sistemin tüm özelliklerine erişim sağlar:

✅ **Tam Yetkiler:**
- Kullanıcı ekleme, düzenleme, silme
- Workflow oluşturma ve yönetme
- Şirket ayarlarını değiştirme
- Tüm talepleri görüntüleme ve yönetme
- E-posta şablonlarını düzenleme
- Sistem loglarını görüntüleme
- Raporlara erişim

### İlk Admin Kullanıcısı

🔐 **Önemli:** İlk kayıt olan kullanıcı otomatik olarak ADMIN rolü alır ve şirket oluşturur.

**İlk Kurulum Adımları:**

1. ✅ İlk kullanıcı kaydı (otomatik ADMIN)
2. ✅ Şirket bilgilerini tamamlama
3. ✅ Logo yükleme
4. ✅ Renk temasını ayarlama
5. ✅ İlk workflow oluşturma
6. ✅ Diğer kullanıcıları ekleme
7. ✅ E-posta ayarlarını test etme

---

## 👥 Kullanıcı Yönetimi

### Kullanıcı Listesi

**Adım 1:** Sol menüden **"Kullanıcılar"** sekmesine gidin

**Adım 2:** Kullanıcı listesini görüntüleyin:

```
┌─────────────────────────────────────────────────────────┐
│ 👤 Kullanıcılar (25)                    [+ Yeni Kullanıcı]│
├─────────────────────────────────────────────────────────┤
│                                                           │
│ 🔍 Ara: [_______________]  Rol: [Tümü ▼]  Durum: [Tümü ▼]│
│                                                           │
│ Ad Soyad         E-posta              Rol        Durum   │
│ ─────────────────────────────────────────────────────── │
│ John Doe         john@clinic.com      ADMIN     ✅ Aktif │
│ Jane Manager     jane@clinic.com      APPROVER  ✅ Aktif │
│ Mike Smith       mike@clinic.com      REQUESTER ✅ Aktif │
│ ...                                                       │
└─────────────────────────────────────────────────────────┘
```

**Filtreleme Seçenekleri:**
- **Rol:** Tümü / ADMIN / APPROVER / REQUESTER
- **Durum:** Tümü / Aktif / Pasif
- **Arama:** Ad, soyad veya e-posta

---

### Yeni Kullanıcı Ekleme

**Adım 1:** Sağ üstteki **"+ Yeni Kullanıcı"** butonuna tıklayın

**Adım 2:** Kullanıcı formunu doldurun:

```
📝 Kullanıcı Bilgileri

• Ad Soyad: *
  Örnek: "Ayşe Yılmaz"

• E-posta: *
  Örnek: "ayse@clinic.com"
  ⚠️ Her kullanıcı benzersiz e-posta adresi olmalı

• Şifre: *
  Minimum 8 karakter, büyük/küçük harf, rakam
  Örnek: "SecurePass123!"

• Rol: * [Seçiniz ▼]
  - ADMIN: Tam yetki
  - APPROVER: Onay yetkisi
  - REQUESTER: Talep oluşturma

• Departman:
  Örnek: "Dental Operasyonlar"

• Telefon:
  Örnek: "+90 555 123 4567"

• Durum:
  ☑️ Aktif (giriş yapabilir)
  ☐ Pasif (giriş yapamaz)
```

**Adım 3:** **"Kullanıcı Oluştur"** butonuna tıklayın

**Adım 4:** Onay mesajını bekleyin:

```
✅ Kullanıcı başarıyla oluşturuldu!
E-posta: ayse@clinic.com
Geçici şifre kullanıcıya e-posta ile gönderildi.
```

**💡 İpuçları:**
- İlk girişte kullanıcıdan şifre değiştirmesini isteyin
- Her departman için en az bir APPROVER atayın
- E-posta adreslerinin aktif olduğundan emin olun

---

### Kullanıcı Düzenleme

**Adım 1:** Kullanıcı listesinden düzenlemek istediğiniz kullanıcıya tıklayın

**Adım 2:** **"Düzenle"** butonuna tıklayın

**Adım 3:** Bilgileri güncelleyin:

**Düzenlenebilir Alanlar:**
- Ad Soyad
- Rol (ADMIN, APPROVER, REQUESTER)
- Departman
- Telefon
- Durum (Aktif/Pasif)

**Düzenlenemez Alanlar:**
- E-posta (güvenlik nedeniyle)
- Şirket ID

**Adım 4:** **"Güncelle"** butonuna tıklayın

**⚠️ Dikkat:**
- Kendi rolünüzü değiştiremezsiniz
- En az bir ADMIN kullanıcı olmalıdır
- Kullanıcının aktif görevleri varsa rol değiştirilemez

---

### Kullanıcı Silme / Deaktif Etme

**Soft Delete (Önerilen):**

**Adım 1:** Kullanıcı detaylarına gidin

**Adım 2:** **"Deaktif Et"** butonuna tıklayın

**Adım 3:** Onay iletişim kutusunda **"Evet"** seçeneğine tıklayın

**Sonuç:**
- Kullanıcı giriş yapamaz
- Geçmiş kayıtlar korunur
- Gerekirse tekrar aktif edilebilir

---

**Hard Delete (Dikkatli Kullanın):**

**Adım 1:** Kullanıcı detaylarına gidin

**Adım 2:** **"Sil"** butonuna tıklayın

**Adım 3:** Silme nedenini girin

**Adım 4:** "DELETE" yazarak onaylayın

**⚠️ UYARI:**
- Bu işlem geri alınamaz!
- Aktif görevleri olan kullanıcılar silinemez
- Geçmiş kayıtlar "Deleted User" olarak görünür

---

### Kullanıcı Şifre Sıfırlama

**Adım 1:** Kullanıcı detaylarına gidin

**Adım 2:** **"Şifre Sıfırla"** butonuna tıklayın

**Adım 3:** Yeni geçici şifre oluştur veya rastgele oluştur

**Adım 4:** **"Şifre Gönder"** butonuna tıklayın

**Sonuç:**
```
✅ Şifre sıfırlama e-postası gönderildi!
Kullanıcı e-postasına gelen bağlantı ile şifresini değiştirebilir.
Bağlantı 24 saat geçerlidir.
```

---

### Toplu Kullanıcı Yönetimi

**Toplu İçe Aktarma (CSV):**

**Adım 1:** **"Toplu İçe Aktar"** butonuna tıklayın

**Adım 2:** CSV şablonunu indirin

**CSV Format:**
```csv
name,email,role,department,phone
John Doe,john@clinic.com,REQUESTER,Dental Ops,+90 555 111 1111
Jane Smith,jane@clinic.com,APPROVER,Management,+90 555 222 2222
Mike Johnson,mike@clinic.com,ADMIN,IT,+90 555 333 3333
```

**Adım 3:** CSV dosyasını doldurun

**Adım 4:** Dosyayı yükleyin

**Adım 5:** Önizlemeyi kontrol edin

**Adım 6:** **"İçe Aktar"** butonuna tıklayın

**Sonuç:**
```
✅ 15 kullanıcı başarıyla eklendi
⚠️ 2 kullanıcı atlandı (e-posta zaten mevcut)
❌ 1 kullanıcı hata (geçersiz format)
```

---

## 🔄 Görsel Workflow Tasarımı

### Workflow Designer'a Giriş

**Adım 1:** Sol menüden **"Görsel Workflow Designer"** sekmesine gidin

**Adım 2:** Canvas görünümünü görüntüleyin:

```
┌─────────────────────────────────────────────────────────┐
│ 🔄 Workflow Designer                    [💾 Kaydet] [▶️ Test]│
├─────────────────────────────────────────────────────────┤
│ Sol Panel (Nodes)    │    Canvas           │  Properties │
│                      │                     │             │
│ 🟢 Start             │   [Canvas Area]     │  Node       │
│ 🔵 Approval          │                     │  Config     │
│ 🟡 Decision          │                     │  Panel      │
│ 🟣 Parallel          │                     │             │
│ 🟠 Notification      │                     │             │
│ ⚫ End                │                     │             │
└─────────────────────────────────────────────────────────┘
```

---

### Node Türleri

#### 🟢 Start Node (Başlangıç)

**Kullanım:** Her workflow bir Start node ile başlamalıdır.

**Konfigürasyon:**
- Label: "Workflow Başlangıcı"
- Otomatik tetikleyici: Purchase Request oluşturulduğunda

**Kurallar:**
- ✅ Her workflow'da tam olarak 1 Start node olmalı
- ✅ Gelen edge olamaz
- ✅ Minimum 1 giden edge olmalı

---

#### 🔵 Approval Node (Onay)

**Kullanım:** Onay gerektiren adımlar için.

**Konfigürasyon:**

```javascript
{
  label: "Manager Approval",
  approverType: "role",        // role, user, dynamic
  approverRole: "APPROVER",    // Rol seçimi
  approverUsers: [],           // Belirli kullanıcılar
  threshold: "all",            // all, any, majority, count
  thresholdCount: 1,           // count için
  timeoutDays: 3,              // Süre (gün)
  escalationEnabled: false,    // Eskalasyon
  escalationDays: 1,           // Eskalasyon süresi
  escalationApprover: null     // Eskalasyon onaylayıcı
}
```

**Approver Types:**

1. **role** - Role göre:
   ```javascript
   approverType: "role"
   approverRole: "APPROVER"
   ```
   Tüm APPROVER rolündeki kullanıcılar

2. **user** - Belirli kullanıcılar:
   ```javascript
   approverType: "user"
   approverUsers: ["user1", "user2", "user3"]
   ```

3. **dynamic** - Dinamik belirleme:
   ```javascript
   approverType: "dynamic"
   dynamicRule: "requester.department.manager"
   ```
   Talep edenin departman müdürü

**Threshold Options:**

```javascript
// Tümü onaylamalı
threshold: "all"

// Herhangi biri onaylarsa yeterli
threshold: "any"

// Çoğunluk onaylamalı (>50%)
threshold: "majority"

// Belirli sayıda onay
threshold: "count"
thresholdCount: 2  // En az 2 kişi

// Ağırlıklı onay (gelecekte)
threshold: "weighted"
```

**Örnek Senaryolar:**

**Senaryo 1: Tek Manager Onayı**
```javascript
{
  label: "Manager Approval",
  approverType: "role",
  approverRole: "APPROVER",
  threshold: "any",
  timeoutDays: 3
}
```

**Senaryo 2: 3 Kişiden En Az 2'si**
```javascript
{
  label: "Committee Approval",
  approverType: "user",
  approverUsers: ["user1", "user2", "user3"],
  threshold: "count",
  thresholdCount: 2,
  timeoutDays: 5
}
```

**Senaryo 3: Departman Müdürü**
```javascript
{
  label: "Department Head Approval",
  approverType: "dynamic",
  dynamicRule: "requester.department.manager",
  threshold: "all",
  timeoutDays: 2
}
```

---

#### 🟡 Decision Node (Karar)

**Kullanım:** Koşullara göre dallanma.

**Konfigürasyon:**

```javascript
{
  label: "Check Amount",
  conditions: [
    {
      field: "estimatedTotal",
      operator: ">",
      value: 10000,
      label: "Yüksek Tutar"
    },
    {
      field: "estimatedTotal",
      operator: "<=",
      value: 10000,
      label: "Düşük Tutar"
    }
  ]
}
```

**Desteklenen Operatörler:**
- `==` - Eşittir
- `!=` - Eşit değildir
- `>` - Büyüktür
- `<` - Küçüktür
- `>=` - Büyük eşittir
- `<=` - Küçük eşittir
- `contains` - İçerir (string)
- `in` - İçinde (array)

**Kullanılabilir Alanlar:**
- `estimatedTotal` - Tahmini toplam tutar
- `priority` - Öncelik (LOW, MEDIUM, HIGH, URGENT)
- `category` - Kategori
- `requester.department` - Talep eden departmanı
- `requester.role` - Talep eden rolü

**Örnek Senaryolar:**

**Senaryo 1: Tutar Kontrolü**
```javascript
{
  label: "Tutar > 50,000₺?",
  conditions: [
    {
      field: "estimatedTotal",
      operator: ">",
      value: 50000,
      label: "Evet (CFO Onayı Gerek)"
    },
    {
      field: "estimatedTotal",
      operator: "<=",
      value: 50000,
      label: "Hayır (Manager Yeterli)"
    }
  ]
}
```

**Senaryo 2: Kategori Kontrolü**
```javascript
{
  label: "Ekipman mı?",
  conditions: [
    {
      field: "category",
      operator: "==",
      value: "EQUIPMENT",
      label: "Evet (Teknik Onay)"
    },
    {
      field: "category",
      operator: "!=",
      value: "EQUIPMENT",
      label: "Hayır (Standart Süreç)"
    }
  ]
}
```

**Senaryo 3: Öncelik Kontrolü**
```javascript
{
  label: "Acil mi?",
  conditions: [
    {
      field: "priority",
      operator: "in",
      value: ["HIGH", "URGENT"],
      label: "Evet (Hızlı Onay)"
    },
    {
      field: "priority",
      operator: "in",
      value: ["LOW", "MEDIUM"],
      label: "Hayır (Normal Süreç)"
    }
  ]
}
```

---

#### 🟣 Parallel Split/Join (Paralel)

**Parallel Split - Çatallanma:**

```javascript
{
  type: "parallel-split",
  label: "Paralel Onaylar",
  branches: 3
}
```

**Kullanım:** Aynı anda birden fazla onay için.

**Örnek:**
- Finance onayı
- Technical onayı
- Manager onayı

Hepsi paralel olarak ilerler.

---

**Parallel Join - Birleştirme:**

```javascript
{
  type: "parallel-join",
  label: "Tüm Onayları Bekle"
}
```

**Kullanım:** Paralel dalların birleşmesi için.

**Kural:** Her split için bir join olmalıdır!

---

#### 🟠 Notification Node (Bildirim)

**Kullanım:** E-posta bildirimi göndermek için.

**Konfigürasyon:**

```javascript
{
  label: "Bilgilendirme E-postası",
  recipients: "requester",      // requester, approvers, custom
  customEmails: [],             // custom için
  template: "PURCHASE_REQUEST_APPROVED",
  subject: "Talebiniz Onaylandı",
  includeDetails: true
}
```

**Recipient Options:**
- `requester` - Talep edene
- `approvers` - Tüm onaylayanlar
- `custom` - Belirli e-postalar
- `department` - Tüm departman

**Örnek:**

```javascript
{
  label: "Finance'e Bildir",
  recipients: "custom",
  customEmails: ["finance@clinic.com"],
  template: "CUSTOM",
  subject: "Yeni Satın Alma Onaylandı",
  body: "{{requestNumber}} numaralı talep onaylandı."
}
```

---

#### ⚫ End Node (Bitiş)

**Kullanım:** Workflow sonlandırma.

**Konfigürasyon:**

```javascript
{
  label: "Workflow Tamamlandı",
  status: "APPROVED"  // APPROVED, REJECTED
}
```

**Kurallar:**
- ✅ Her workflow'da en az 1 End node olmalı
- ✅ Giden edge olamaz
- ✅ Status belirtilmeli

**End Types:**

1. **Approved End:**
   ```javascript
   status: "APPROVED"
   ```
   Talep otomatik olarak APPROVED durumuna geçer.

2. **Rejected End:**
   ```javascript
   status: "REJECTED"
   ```
   Talep otomatik olarak REJECTED durumuna geçer.

---

### Workflow Oluşturma Adım Adım

**Adım 1: Basit Workflow**

**Hedef:** Manager onayı → Otomatik onayla

```
[Start] → [Manager Approval] → [End: APPROVED]
```

**Uygulama:**

1. **Start node ekle** (sol panelden sürükle)
   - Position: (100, 100)
   - Label: "Başlat"

2. **Approval node ekle**
   - Position: (300, 100)
   - Label: "Manager Onayı"
   - Config:
     ```javascript
     approverType: "role"
     approverRole: "APPROVER"
     threshold: "any"
     timeoutDays: 3
     ```

3. **End node ekle**
   - Position: (500, 100)
   - Label: "Onaylandı"
   - Status: "APPROVED"

4. **Edge'leri bağla**
   - Start → Approval
   - Approval → End

5. **Kaydet ve Test**

---

**Adım 2: Tutar Bazlı Workflow**

**Hedef:**
- < 10K: Otomatik onayla
- \> 10K: Manager onayı gerek

```
[Start] → [Decision: tutar > 10K?]
           ├─ TRUE → [Manager Approval] → [End: APPROVED]
           └─ FALSE → [End: APPROVED]
```

**Uygulama:**

1. **Start node ekle**
   - Position: (100, 100)

2. **Decision node ekle**
   - Position: (300, 100)
   - Label: "Tutar > 10,000₺?"
   - Conditions:
     ```javascript
     [
       {
         field: "estimatedTotal",
         operator: ">",
         value: 10000,
         label: "Evet"
       },
       {
         field: "estimatedTotal",
         operator: "<=",
         value: 10000,
         label: "Hayır"
       }
     ]
     ```

3. **Approval node ekle** (TRUE branch için)
   - Position: (500, 50)
   - Label: "Manager Onayı"

4. **End nodes ekle**
   - End 1 (Approval'dan): (700, 50) - "Onaylandı"
   - End 2 (Decision'dan): (500, 150) - "Otomatik Onay"

5. **Edge'leri bağla**
   - Start → Decision
   - Decision (TRUE) → Approval
   - Decision (FALSE) → End 2
   - Approval → End 1

---

**Adım 3: Multi-Level Approval**

**Hedef:**
- Manager onayı
- Finance onayı
- CEO onayı (paralel)

```
[Start] → [Manager] → [Parallel Split]
                       ├─ [Finance]
                       └─ [CEO]
          [Parallel Join] → [End]
```

**Uygulama:**

1. **Start** (100, 100)

2. **Manager Approval** (300, 100)

3. **Parallel Split** (500, 100)
   - Branches: 2

4. **Finance Approval** (700, 50)
5. **CEO Approval** (700, 150)

6. **Parallel Join** (900, 100)

7. **End** (1100, 100)

8. **Edge'leri bağla**
   - Start → Manager
   - Manager → Parallel Split
   - Split → Finance
   - Split → CEO
   - Finance → Join
   - CEO → Join
   - Join → End

---

### Workflow Validation

Kaydetmeden önce otomatik validasyon:

**✅ Geçerli Workflow:**
```
✓ 1 Start node mevcut
✓ En az 1 End node mevcut
✓ Orphan node yok
✓ Cycle yok
✓ Tüm decision node'lar 2+ edge'e sahip
✓ Parallel split/join dengeli
✓ Tüm approval node'lar configured
```

**❌ Hatalı Workflow:**
```
✗ 2 Start node var (sadece 1 olmalı)
✗ End node yok
✗ Node-5 orphan (bağlantısız)
✗ Cycle tespit edildi: Node-2 → Node-3 → Node-2
✗ Decision-1 sadece 1 edge'e sahip (min 2 gerekli)
✗ Parallel-Split-1 için Join bulunamadı
✗ Approval-2 configuration eksik
```

---

### Workflow Test Etme

**Adım 1:** Workflow Designer'da **"▶️ Test"** butonuna tıklayın

**Adım 2:** Test senaryosu seçin veya oluşturun:

```javascript
{
  estimatedTotal: 15000,
  priority: "HIGH",
  category: "EQUIPMENT",
  requester: {
    id: "user123",
    department: "Dental Ops",
    role: "REQUESTER"
  }
}
```

**Adım 3:** **"Simülasyon Başlat"** butonuna tıklayın

**Adım 4:** Simülasyon sonuçlarını inceleyin:

```
🔄 Workflow Simülasyonu

Adım 1: ✅ Start node executed
        Variables: { estimatedTotal: 15000, ... }

Adım 2: ✅ Decision node evaluated
        Condition: estimatedTotal > 10000 = TRUE
        Branch: "Yüksek Tutar" seçildi

Adım 3: ⏳ Approval node reached
        Assignees: Jane Manager (jane@clinic.com)
        Status: WAITING_APPROVAL

Simülasyon Tamamlandı! ✅
Workflow beklendiği gibi çalışıyor.
```

---

### Workflow Aktivasyonu

**Adım 1:** Workflow listesinden workflow seçin

**Adım 2:** **"Aktif Et"** butonuna tıklayın

**Adım 3:** Onay iletişim kutusunda **"Evet"** seçeneğine tıklayın

**Sonuç:**
```
✅ Workflow aktif edildi!
Artık yeni purchase request'ler bu workflow'u kullanacak.

⚠️ Dikkat: Bir anda sadece 1 workflow aktif olabilir.
Önceki aktif workflow otomatik deaktif edildi.
```

---

## 🎨 Şirket Ayarları ve Kişiselleştirme

### Şirket Profili

**Adım 1:** Sol menüden **"Ayarlar"** → **"Şirket Bilgileri"**

**Adım 2:** Bilgileri güncelleyin:

```
🏢 Şirket Bilgileri

• Şirket Adı:
  "Attelia Dental Clinic"

• Alt Alan Adı: (değiştirilemez)
  "attelia" → attelia.example.com

• Şirket Adresi:
  "İstanbul, Türkiye"

• Telefon:
  "+90 555 000 0000"

• E-posta:
  "info@attelia.com"

• Website:
  "https://www.attelia.com"
```

**Adım 3:** **"Kaydet"** butonuna tıklayın

---

### Logo Yönetimi

**Logo Yükleme:**

**Adım 1:** **"Logo Yükle"** butonuna tıklayın

**Adım 2:** Dosya seçin

**Teknik Gereksinimler:**
- Format: PNG, JPG, SVG
- Boyut: Minimum 200x200px, Maximum 2000x2000px
- Dosya boyutu: Max 2MB
- Önerilen: 400x400px, PNG, şeffaf arkaplan

**Adım 3:** Önizlemeyi kontrol edin

**Adım 4:** **"Yükle ve Kaydet"** butonuna tıklayın

**Sonuç:**
```
✅ Logo başarıyla yüklendi!
Logo tüm sayfalarda görünecektir.
Tarayıcı cache'i nedeniyle değişiklik 5-10 dakika sürebilir.
```

**Logo Kaldırma:**
1. Mevcut logo altında **"Logoyu Kaldır"** tıklayın
2. Onaylayın
3. Varsayılan logo gösterilecektir

---

### Renk Teması

**Adım 1:** **"Renk Teması"** sekmesine gidin

**Adım 2:** Primary (Ana) renk seçin:

**Color Picker:**
```
🎨 Ana Renk

   [Color Wheel]

   Hex: #2563eb
   RGB: (37, 99, 235)

   Önizleme:
   ┌─────────────────┐
   │  Button         │
   │  Link           │
   │  Active Menu    │
   └─────────────────┘
```

**Adım 3:** Secondary (İkincil) renk seçin:

```
🎨 İkincil Renk

   Hex: #1e40af
   RGB: (30, 64, 175)

   Önizleme:
   ┌─────────────────┐
   │  Hover Effect   │
   │  Borders        │
   └─────────────────┘
```

**Adım 4:** **"Önizle"** butonuna tıklayarak tüm sayfada görün

**Adım 5:** **"Uygula"** butonuna tıklayın

**Önerilen Renk Paletleri:**

```
🔵 Profesyonel Mavi
Primary: #2563eb
Secondary: #1e40af

🟢 Taze Yeşil
Primary: #10b981
Secondary: #059669

🟣 Modern Mor
Primary: #8b5cf6
Secondary: #7c3aed

🔴 Enerjik Kırmızı
Primary: #ef4444
Secondary: #dc2626

🟠 Sıcak Turuncu
Primary: #f59e0b
Secondary: #d97706
```

---

## 📧 E-posta Şablonları

### Şablon Listesi

**Adım 1:** Sol menüden **"Ayarlar"** → **"E-posta Şablonları"**

**Adım 2:** Şablon listesini görüntüleyin:

```
📧 E-posta Şablonları

┌─────────────────────────────────────────────────────┐
│ Talep Oluşturuldu (PURCHASE_REQUEST_CREATED)        │
│ Durum: ✅ Aktif                        [Düzenle]    │
├─────────────────────────────────────────────────────┤
│ Konu: Yeni Satın Alma Talebi: {{requestNumber}}    │
│                                                      │
│ Merhaba {{userName}},                                │
│ Talebiniz başarıyla oluşturuldu...                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Talep Onaylandı (PURCHASE_REQUEST_APPROVED)         │
│ Durum: ✅ Aktif                        [Düzenle]    │
├─────────────────────────────────────────────────────┤
│ Konu: Talebiniz Onaylandı: {{requestNumber}}       │
│                                                      │
│ Merhaba {{userName}},                                │
│ {{requestNumber}} numaralı talebiniz onaylandı...   │
└─────────────────────────────────────────────────────┘
```

---

### Şablon Düzenleme

**Adım 1:** Düzenlemek istediğiniz şablona tıklayın

**Adım 2:** **"Düzenle"** butonuna tıklayın

**Adım 3:** Şablon editörünü kullanın:

```
📝 E-posta Şablonu Düzenle

Şablon Adı: PURCHASE_REQUEST_CREATED

┌─────────────────────────────────────────────────────┐
│ Konu:                                                │
│ [Yeni Satın Alma Talebi: {{requestNumber}}]         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ E-posta İçeriği: (HTML destekli)                     │
│                                                      │
│ Merhaba {{userName}},                                │
│                                                      │
│ {{requestNumber}} numaralı satın alma talebiniz      │
│ başarıyla oluşturuldu.                               │
│                                                      │
│ 📋 Talep Detayları:                                  │
│ • Başlık: {{title}}                                  │
│ • Kategori: {{category}}                             │
│ • Tutar: {{estimatedTotal}} {{currency}}             │
│ • Öncelik: {{priority}}                              │
│                                                      │
│ Onay süreci otomatik olarak başlatıldı.             │
│                                                      │
│ Talep detaylarını görüntülemek için:                 │
│ {{appUrl}}/purchase-requests/{{requestId}}          │
│                                                      │
│ İyi çalışmalar,                                      │
│ {{companyName}} Satın Alma Sistemi                   │
└─────────────────────────────────────────────────────┘
```

**Adım 4:** Değişkenleri kullanın:

**Kullanılabilir Değişkenler:**

```javascript
// Kullanıcı Bilgileri
{{userName}}          // John Doe
{{userEmail}}         // john@clinic.com
{{userRole}}          // REQUESTER

// Talep Bilgileri
{{requestNumber}}     // PR-2024-001
{{title}}             // Dental Malzemeleri
{{description}}       // Detaylı açıklama
{{category}}          // SUPPLIES
{{priority}}          // MEDIUM
{{estimatedTotal}}    // 15000
{{currency}}          // TRY
{{status}}            // PENDING

// Şirket Bilgileri
{{companyName}}       // Attelia Dental Clinic
{{companyEmail}}      // info@attelia.com
{{appUrl}}            // https://attelia.example.com

// Onay Bilgileri
{{approverName}}      // Jane Manager
{{approvalComment}}   // Onay yorumu
{{approvalDate}}      // 07.11.2024

// Sistem Bilgileri
{{currentDate}}       // 07.11.2024
{{currentTime}}       // 14:30
```

**Adım 5:** **"Test E-postası Gönder"** butonuna tıklayarak test edin

**Adım 6:** **"Kaydet"** butonuna tıklayın

---

### Yeni Şablon Oluşturma

**Adım 1:** **"+ Yeni Şablon"** butonuna tıklayın

**Adım 2:** Şablon türünü seçin:

```
🎯 Şablon Türü Seç

○ PURCHASE_REQUEST_CREATED       - Talep oluşturuldu
○ PURCHASE_REQUEST_APPROVED      - Talep onaylandı
○ PURCHASE_REQUEST_REJECTED      - Talep reddedildi
○ WORKFLOW_TASK_ASSIGNED         - Görev atandı
○ WORKFLOW_TASK_REMINDER         - Görev hatırlatıcı
○ WORKFLOW_TASK_OVERDUE          - Görev gecikti
● CUSTOM                         - Özel şablon
```

**Adım 3:** Şablon içeriğini oluşturun (yukarıdaki gibi)

**Adım 4:** Test edin ve kaydedin

---

## 📊 Sistem İzleme ve Raporlama

### Dashboard Metrikleri

**Ana Metrikler:**

```
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│ 📊 Toplam Talepler │  │ ⏳ Aktif Workflow  │  │ 👥 Aktif Kullanıcı │
│      1,245         │  │         15         │  │        48          │
└────────────────────┘  └────────────────────┘  └────────────────────┘

┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│ 💰 Toplam Tutar    │  │ ⚡ Ort. Onay Süresi│  │ ✅ Onay Oranı      │
│   12.5M ₺          │  │      2.3 gün       │  │       94%          │
└────────────────────┘  └────────────────────┘  └────────────────────┘
```

---

### Detaylı Raporlar

**1. Talep Raporu:**

**Adım 1:** **"Raporlar"** → **"Talep Raporu"**

**Adım 2:** Filtreleri ayarlayın:

```
📅 Tarih Aralığı: [01.10.2024] - [01.11.2024]
📊 Durum: [Tümü ▼]
👥 Departman: [Tümü ▼]
📋 Kategori: [Tümü ▼]
```

**Adım 3:** **"Rapor Oluştur"** tıklayın

**Çıktı:**
```
📊 Satın Alma Raporu
Dönem: 01.10.2024 - 01.11.2024

Özet:
• Toplam Talep: 156
• Onaylanan: 120 (77%)
• Reddedilen: 24 (15%)
• Bekleyen: 12 (8%)

Toplam Tutar: 2,500,000₺
• Onaylanan: 2,100,000₺
• Reddedilen: 250,000₺
• Bekleyen: 150,000₺

Kategori Dağılımı:
• Malzemeler: 45%
• Ekipman: 30%
• Hizmetler: 15%
• Diğer: 10%

[Excel'e Aktar] [PDF'e Aktar] [E-posta Gönder]
```

---

**2. Departman Raporu:**

```
📊 Departman Bazında Harcama

Dental Operasyonlar:
• Talep Sayısı: 78
• Toplam Tutar: 1,200,000₺
• Ortalama: 15,384₺

Yönetim:
• Talep Sayısı: 45
• Toplam Tutar: 800,000₺
• Ortalama: 17,777₺

IT:
• Talep Sayısı: 33
• Toplam Tutar: 500,000₺
• Ortalama: 15,151₺
```

---

**3. Kullanıcı Aktivite Raporu:**

```
👥 En Aktif Kullanıcılar (Son 30 Gün)

1. John Doe (REQUESTER)
   • 45 talep oluşturdu
   • Ortalama tutar: 18,500₺
   • Onay oranı: 95%

2. Jane Manager (APPROVER)
   • 120 onay verdi
   • Ortalama süre: 1.8 gün
   • Red oranı: 5%

3. Mike Admin (ADMIN)
   • 15 kullanıcı ekledi
   • 3 workflow oluşturdu
   • 250 ayar değişikliği
```

---

### Sistem Logları

**Adım 1:** **"Ayarlar"** → **"Sistem Logları"**

**Adım 2:** Log seviyesini seçin:

```
🔍 Log Seviyeleri

○ INFO     - Bilgi logları
○ WARNING  - Uyarılar
○ ERROR    - Hatalar
● ALL      - Tüm loglar
```

**Adım 3:** Logları görüntüleyin:

```
⏰ 14:35:22 [INFO] User login successful (john@clinic.com)
⏰ 14:36:15 [INFO] Purchase request created (PR-2024-015)
⏰ 14:36:20 [INFO] Workflow started (wf-123 → inst-456)
⏰ 14:37:45 [WARNING] Email send delayed (queue full)
⏰ 14:38:10 [ERROR] Database connection timeout (retry 1/3)
⏰ 14:38:15 [INFO] Database connection restored
⏰ 14:40:22 [INFO] Approval task assigned (task-789)
```

**Filtreleme:**
- Tarih aralığı
- Log seviyesi
- Kullanıcı
- Modül (Auth, Workflow, Email, Database)

---

## 🔒 Yedekleme ve Güvenlik

### Database Backup

**Otomatik Yedekleme:**

Vercel Postgres kullanıyorsanız:
- ✅ Günlük otomatik yedekleme
- ✅ 7 gün saklama
- ✅ Point-in-time recovery

**Manuel Yedekleme:**

```bash
# Database yedekleme
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Yedekleme geri yükleme
psql $DATABASE_URL < backup-20241107.sql
```

---

### Dosya Backup

Vercel Blob dosyaları otomatik replike edilir, ancak kritik dosyalar için:

```javascript
// Backup scripti (gelecekte eklenecek)
// lib/backup-blob.ts

export async function backupBlobs() {
  const { list } = await blob.list();

  for (const file of list.blobs) {
    // S3 veya başka storage'a kopyala
    await copyToBackup(file);
  }
}
```

---

### Güvenlik Kontrol Listesi

**✅ Yapılandırma:**

- [ ] Güçlü JWT_SECRET kullanılıyor (min 32 char)
- [ ] HTTPS aktif (Vercel otomatik)
- [ ] CORS doğru ayarlanmış
- [ ] Rate limiting aktif
- [ ] SQL injection koruması (Prisma)
- [ ] XSS koruması aktif
- [ ] CSRF token kullanımı
- [ ] File upload limitleri ayarlanmış

**✅ Kullanıcı Güvenliği:**

- [ ] Şifre politikası aktif (min 8 char)
- [ ] 2FA desteği (gelecekte)
- [ ] Session timeout ayarlandı
- [ ] Başarısız login denemeleri loglanıyor
- [ ] Şifre sıfırlama token'ı süreli

**✅ Veri Güvenliği:**

- [ ] Günlük database backup
- [ ] Dosya backupları yapılıyor
- [ ] Tenant isolation test edildi
- [ ] Hassas veriler encrypt edilmiş
- [ ] Audit trail aktif

---

## 🔧 Sorun Giderme

### Sık Karşılaşılan Sorunlar

#### 1. E-posta Gönderilmiyor

**Semptomlar:**
- Kullanıcılar bildirim almıyor
- Workflow ilerliyor ama e-posta gelmiyor

**Kontrol Listesi:**

```bash
# 1. SMTP ayarlarını kontrol et
echo $SMTP_HOST
echo $SMTP_PORT
echo $SMTP_USER
# SMTP_PASS görünmemeli (güvenlik)

# 2. SendGrid durumunu kontrol et
# SendGrid Dashboard → Activity → Recent Activity

# 3. Email queue'yu kontrol et (gelecekte)
# Dashboard → Email Queue

# 4. Log'ları kontrol et
# Ayarlar → Sistem Logları → Filter: "email"
```

**Çözümler:**

1. **SMTP bağlantısı test et:**
   ```javascript
   // Test endpoint: /api/test-email
   POST /api/test-email
   {
     "to": "test@example.com",
     "subject": "Test Email",
     "body": "This is a test"
   }
   ```

2. **SendGrid API key kontrol:**
   - Settings → API Keys
   - "Mail Send" permission var mı?
   - API key expired değil mi?

3. **Domain verification:**
   - SendGrid → Sender Authentication
   - Domain authenticated mı?
   - DNS records doğru mu?

---

#### 2. Workflow Çalışmıyor

**Semptomlar:**
- Talep oluşturuluyor ama workflow başlamıyor
- Task ataması yapılmıyor

**Debug Adımları:**

```javascript
// 1. Workflow aktif mi?
GET /api/workflows?isActive=true

// 2. Workflow instance oluştu mu?
GET /api/purchase-requests/:id
// Check: workflowInstances[]

// 3. Log'ları kontrol et
// Sistem Logları → "workflow"
```

**Olası Nedenler:**

1. **Workflow aktif değil:**
   ```
   Çözüm: Workflow'u aktif et
   Workflows → [Workflow seç] → Aktif Et
   ```

2. **Validation hatası:**
   ```
   Çözüm: Workflow Designer'da validation hataları kontrol et
   ✗ Orphan node var
   ✗ Cycle tespit edildi
   → Hataları düzelt ve kaydet
   ```

3. **Approver bulunamadı:**
   ```
   Çözüm:
   - Approval node config kontrol et
   - Belirtilen role sahip aktif kullanıcı var mı?
   - Kullanıcılar → Filter: Role = APPROVER
   ```

---

#### 3. Permission Hatası

**Semptomlar:**
- "Yetkisiz erişim" mesajı
- Kullanıcı istediği işlemi yapamıyor

**Kontrol:**

```
1. Kullanıcı rolünü kontrol et
   Kullanıcılar → [User seç] → Rol: ?

2. Endpoint permission tablosunu kontrol et
   API_DOCUMENTATION.md → Permission System

3. Token geçerli mi?
   - Browser console → Application → Local Storage → token
   - jwt.io'da decode et
   - exp (expiration) geçmiş mi?
```

**Çözüm:**

```javascript
// Rolü güncelle
PUT /api/users/:id
{
  "role": "APPROVER"  // veya ADMIN
}

// Token yenile
// Kullanıcıdan logout/login isteyin
```

---

#### 4. Dosya Yüklenmiyor

**Semptomlar:**
- "Dosya yüklenemedi" hatası
- Yükleme sonsuz loading

**Kontrol:**

```bash
# 1. Vercel Blob token kontrol
echo $BLOB_READ_WRITE_TOKEN

# 2. Vercel Dashboard
# Storage → Blob → Store exists?

# 3. Dosya boyutu
# Max: 10MB per file
```

**Çözümler:**

1. **Token yenile:**
   ```
   Vercel Dashboard → Storage → Blob
   → [Store seç] → Tokens → Create Token
   → Environment Variables'a ekle
   ```

2. **Dosya boyutunu küçült:**
   ```
   - Resimler için: optimize edin (tinypng.com)
   - PDF için: sıkıştırın
   - Max 10MB
   ```

3. **Format kontrol:**
   ```
   Desteklenen: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG
   Desteklenmeyen: EXE, ZIP, RAR
   ```

---

#### 5. Multi-Tenant Isolation Problemi

**Semptomlar:**
- Kullanıcılar başka şirketin verilerini görüyor
- Data leak

**🚨 CRİTİK:** Bu bir güvenlik sorunudur!

**Immediate Actions:**

1. **Sistemi kapat (production):**
   ```bash
   # Vercel'de environment variable ekle
   MAINTENANCE_MODE=true
   ```

2. **Logları incele:**
   ```
   Sistem Logları → ERROR
   Filter: "tenant", "company"
   ```

3. **Database kontrol:**
   ```sql
   -- Her query'de companyId filter var mı?
   SELECT * FROM PurchaseRequest
   WHERE companyId = ?  -- ZORUNLU!
   ```

**Prevention:**

```typescript
// Her API route'da:
const decoded = verifyToken(token);

// ✅ DOĞRU
const requests = await prisma.purchaseRequest.findMany({
  where: {
    companyId: decoded.companyId,  // ZORUNLU!
    status: 'PENDING'
  }
});

// ❌ YANLIŞ
const requests = await prisma.purchaseRequest.findMany({
  where: {
    status: 'PENDING'  // companyId yok!
  }
});
```

---

### Performance İyileştirme

**Yavaş Sayfa Yükleme:**

**Diagnosis:**

```bash
# 1. Vercel Analytics kontrol
# Dashboard → Analytics → Performance

# 2. Browser DevTools
# F12 → Network → Reload
# Hangi request yavaş?

# 3. Database query time
# Prisma logging aktif et
```

**Optimizasyon:**

1. **Database Indexing:**
   ```prisma
   // Frequently queried fields
   @@index([companyId, status])
   @@index([createdAt])
   ```

2. **API Response Caching:**
   ```typescript
   export async function GET() {
     return NextResponse.json(data, {
       headers: {
         'Cache-Control': 'public, s-maxage=60'
       }
     });
   }
   ```

3. **Image Optimization:**
   ```typescript
   // next.config.js
   images: {
     formats: ['image/avif', 'image/webp'],
   }
   ```

---

## 📞 Admin Destek

### Kritik Sorunlar İçin

**🚨 Acil Durumlar:**
- Site erişilemez
- Data leak
- Security breach

**İletişim:**
- 📧 critical@attelia.com
- 📱 +90 555 999 9999 (24/7)

---

### Normal Destek

**📧 E-posta:** admin-support@attelia.com
**💬 Slack:** #admin-support (eğer varsa)
**📚 Docs:** [docs.attelia.com/admin](https://docs.attelia.com/admin)

---

## 📚 Ek Kaynaklar

- [Kullanıcı Rehberi](./USER_GUIDE.md)
- [API Dokümantasyonu](./API_DOCUMENTATION.md)
- [Deployment Rehberi](./DEPLOYMENT.md)
- [Sorun Giderme](./TROUBLESHOOTING.md) (gelecekte)

---

**Son Güncelleme:** 07.11.2024
**Versiyon:** 1.0.0

🔧 **Admin yetkilerinizi sorumlu kullanın!**
