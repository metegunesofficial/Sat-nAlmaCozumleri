# 👥 Kullanıcı Rehberi

Attelia Dental Satın Alma Platformu kullanım kılavuzu.

## 📋 İçindekiler

1. [Giriş](#giriş)
2. [İlk Kullanım](#ilk-kullanım)
3. [Satın Alma Talebi Oluşturma](#satın-alma-talebi-oluşturma)
4. [Talepleri Görüntüleme ve Yönetme](#talepleri-görüntüleme-ve-yönetme)
5. [Onay Süreçleri](#onay-süreçleri)
6. [Dashboard Kullanımı](#dashboard-kullanımı)
7. [Sık Sorulan Sorular](#sık-sorulan-sorular)

---

## 🎯 Giriş

Attelia Dental Satın Alma Platformu, diş kliniklerinin satın alma süreçlerini dijitalleştiren ve otomatikleştiren bir sistemdir.

### Platform Özellikleri

✅ **Kolay Talep Oluşturma** - Birkaç tıkla satın alma talebi oluşturun
✅ **Otomatik Onay İş Akışları** - Akıllı workflow sistemi ile otomatik onaylar
✅ **E-posta Bildirimleri** - Her adımda otomatik bilgilendirme
✅ **Çoklu Tedarikçi Desteği** - Birden fazla tedarikçi ile teklif karşılaştırması
✅ **Dosya Ekleme** - Teklifler, faturalar ve belgeler ekleyin
✅ **Detaylı Raporlama** - Tüm süreçleri takip edin
✅ **White-Label** - Kliniğinizin logosu ve renkleri ile kişiselleştirilmiş arayüz

### Kullanıcı Rolleri

**🔵 REQUESTER (Talep Eden)**
- Satın alma talebi oluşturabilir
- Kendi taleplerini görüntüleyebilir ve düzenleyebilir
- Talep durumlarını takip edebilir

**🟢 APPROVER (Onaylayan)**
- Kendisine atanan talepleri onaylayabilir/reddedebilir
- Tüm talepleri görüntüleyebilir
- Yorum ve not ekleyebilir

**🔴 ADMIN (Yönetici)**
- Tüm sisteme tam erişim
- Kullanıcı yönetimi
- Workflow tasarımı
- Ayarlar ve kişiselleştirme

---

## 🚀 İlk Kullanım

### 1. Kayıt Olma

Sisteme ilk kez giriş yapacaksanız:

**Adım 1:** Ana sayfada **"Kayıt Ol"** butonuna tıklayın

**Adım 2:** Kayıt formunu doldurun:

```
📝 Kişisel Bilgiler
• Ad Soyad: Tam adınız
• E-posta: İş e-posta adresiniz
• Şifre: Güçlü bir şifre (min. 8 karakter)
• Departman: Çalıştığınız departman (örn: "Dental Operasyonlar")

🏢 Şirket Bilgileri (İlk Kullanıcı İçin)
• Şirket Adı: Kliniğinizin adı
• Alt Alan Adı: Benzersiz URL (örn: "mydental" → mydental.attelia.com)
```

**Adım 3:** **"Kayıt Ol"** butonuna tıklayın

**Adım 4:** E-postanıza gelen doğrulama bağlantısına tıklayın (gelecekte eklenecek)

✅ **İlk kayıt olan kullanıcı otomatik olarak ADMIN rolü alır!**

---

### 2. Giriş Yapma

**Adım 1:** Ana sayfada **"Giriş Yap"** butonuna tıklayın

**Adım 2:** E-posta ve şifrenizi girin

**Adım 3:** **"Giriş"** butonuna tıklayın

🔐 **Şifrenizi mi unuttunuz?** "Şifremi Unuttum" linkine tıklayarak sıfırlama bağlantısı alabilirsiniz (gelecekte eklenecek).

---

### 3. Profil Ayarları

İlk girişte profilinizi tamamlamanız önerilir:

**Adım 1:** Sağ üstteki profil ikonuna tıklayın

**Adım 2:** **"Profil Ayarları"** seçeneğini seçin

**Adım 3:** Bilgilerinizi güncelleyin:
- Ad Soyad
- Telefon
- Departman
- Profil Fotoğrafı

**Adım 4:** **"Kaydet"** butonuna tıklayın

---

## 📝 Satın Alma Talebi Oluşturma

### Yeni Talep Oluşturma

**Adım 1:** Sol menüden **"Satın Alma Talepleri"** sekmesine gidin

**Adım 2:** Sağ üstteki **"+ Yeni Talep"** butonuna tıklayın

**Adım 3:** Talep formunu doldurun:

#### 📋 Temel Bilgiler

```
• Başlık: Talebin kısa açıklaması
  Örnek: "Aylık Diş Malzemeleri Siparişi"

• Açıklama: Detaylı açıklama
  Örnek: "Kasım ayı için rutin malzeme ihtiyacı"

• Kategori: Seçenekler
  - Malzemeler (SUPPLIES)
  - Ekipman (EQUIPMENT)
  - Hizmetler (SERVICES)
  - Bakım (MAINTENANCE)
  - Diğer (OTHER)

• Öncelik: Aciliyet seviyesi
  - 🔵 Düşük (LOW)
  - 🟡 Orta (MEDIUM)
  - 🟠 Yüksek (HIGH)
  - 🔴 Acil (URGENT)

• Para Birimi: TRY, USD, EUR

• Tahmini Toplam: Genel bütçe tahmini

• Beklenen Teslimat Tarihi: (Opsiyonel)
```

---

#### 📦 Ürün/Hizmet Detayları

Her ürün için aşağıdaki bilgileri girin:

```
1. Ürün Adı: "Nitril Eldiven"
2. Açıklama: "Pudrasız, mavi, large beden"
3. Miktar: 50
4. Birim: Kutu
5. Tahmini Birim Fiyat: 150₺
6. Tahmini Toplam: 7,500₺ (otomatik hesaplanır)
```

**Ürün Ekleme:**
- **"+ Ürün Ekle"** butonuna tıklayarak yeni satır ekleyin
- Her talebe birden fazla ürün eklenebilir
- ❌ simgesine tıklayarak ürün silebilirsiniz

**💡 İpucu:** Tahmini fiyatları mümkün olduğunca gerçekçi girin. Bu, onay sürecini hızlandırır.

---

#### 🏢 Tedarikçi Bilgileri

En az bir tedarikçi eklemeniz önerilir:

```
• Tedarikçi Adı: "ABC Dental Malzemeleri"
• İletişim Kişisi: "Ahmet Yılmaz"
• E-posta: contact@abcdental.com
• Telefon: +90 555 123 4567
• Adres: "İstanbul, Türkiye"
```

**Birden Fazla Tedarikçi:**
- **"+ Tedarikçi Ekle"** butonuna tıklayın
- Fiyat karşılaştırması için birden fazla tedarikçi ekleyebilirsiniz
- Her tedarikçiden ayrı teklif alabilirsiniz

---

#### 📎 Dosya Ekleme

Talebe belgeler ekleyebilirsiniz:

**Desteklenen Dosya Türleri:**
- PDF (Teklifler, faturalar)
- Excel/Word (Ürün listeleri)
- Resimler (JPG, PNG - Ürün fotoğrafları)

**Dosya Ekleme:**
1. **"Dosya Seç"** butonuna tıklayın
2. Bilgisayarınızdan dosya seçin
3. Dosya otomatik olarak yüklenecektir
4. ❌ simgesine tıklayarak dosya silebilirsiniz

**💡 İpucu:** Tedarikçi tekliflerini PDF olarak eklerseniz, onay süreci daha hızlı ilerler.

---

#### ✅ Talebi Gönderme

**Adım 1:** Tüm bilgileri kontrol edin

**Adım 2:** **"Talep Oluştur"** butonuna tıklayın

**Adım 3:** Onay mesajını bekleyin:

```
✅ Satın alma talebi başarıyla oluşturuldu!
Talep Numarası: PR-2024-001
Onay süreci başlatıldı. E-posta bildirimlerini kontrol edin.
```

**Otomatik İşlemler:**
- 📧 Size onay e-postası gönderilir
- 🔄 Workflow otomatik başlatılır
- 👥 Onaylayanlar e-posta ile bilgilendirilir
- 📊 Dashboard'da görüntülenir

---

## 📊 Talepleri Görüntüleme ve Yönetme

### Talep Listesi

**Sol menüden "Satın Alma Talepleri"** sekmesine gidin.

#### 🔍 Filtreleme ve Arama

**Durum Filtresi:**
- 🔵 Beklemede (PENDING)
- 🟢 Onaylandı (APPROVED)
- 🔴 Reddedildi (REJECTED)
- 🟡 İşlemde (IN_PROGRESS)

**Öncelik Filtresi:**
- 🔵 Düşük
- 🟡 Orta
- 🟠 Yüksek
- 🔴 Acil

**Arama:**
- Talep numarasına göre (örn: "PR-2024-001")
- Başlığa göre (örn: "Eldiven")
- İçeriğe göre arama yapın

**Sıralama:**
- Tarih (En yeni / En eski)
- Tutar (En yüksek / En düşük)
- Öncelik (En acil / En az acil)

---

### Talep Detayları

Bir talebe tıklayarak detaylarını görüntüleyin:

#### 📄 Genel Bilgiler
```
Talep Numarası: PR-2024-001
Durum: ⏳ Beklemede
Öncelik: 🟡 Orta
Oluşturma Tarihi: 07.11.2024 14:30
Talep Eden: John Doe
Departman: Dental Operasyonlar
```

#### 💰 Finansal Bilgiler
```
Tahmini Toplam: 15,000₺
Para Birimi: TRY
Bütçe Durumu: ✅ Uygun
```

#### 📦 Ürün Listesi
- Tüm ürünler tablo halinde
- Miktar, birim fiyat, toplam
- Toplam tutar hesabı

#### 🏢 Tedarikçiler
- Eklenen tüm tedarikçiler
- İletişim bilgileri
- Teklif durumları

#### 📎 Ekler
- Yüklenen tüm dosyalar
- İndirme linkleri
- Dosya türleri ve boyutları

#### ✅ Onay Durumu
```
🔄 Workflow: Standard Approval Workflow

Onay Aşamaları:
1. ✅ Manager Onayı (Tamamlandı)
   - Onaylayan: Jane Manager
   - Tarih: 07.11.2024 15:00
   - Yorum: "Bütçe onaylandı"

2. ⏳ Finance Onayı (Beklemede)
   - Onaylayan: Finance Team
   - Son Tarih: 10.11.2024

3. ⏸️ Purchase Execution (Bekleniyor)
```

---

### Talep Düzenleme

Kendi taleplerinizi düzenleyebilirsiniz (onay başlamadan):

**Adım 1:** Talep detaylarına gidin

**Adım 2:** **"Düzenle"** butonuna tıklayın

**Adım 3:** Değişiklikleri yapın

**Adım 4:** **"Güncelle"** butonuna tıklayın

**⚠️ Dikkat:**
- Onay süreci başladıysa düzenleyemezsiniz
- Düzenleme yaptıktan sonra workflow yeniden başlar

---

### Talep İptali

Kendi taleplerinizi iptal edebilirsiniz:

**Adım 1:** Talep detaylarına gidin

**Adım 2:** **"İptal Et"** butonuna tıklayın

**Adım 3:** İptal nedenini girin

**Adım 4:** Onaylayın

**⚠️ Dikkat:**
- İptal edilen talepler geri alınamaz
- İlgili tüm kişiler e-posta ile bilgilendirilir

---

## ✅ Onay Süreçleri

### Onay Bekleyen Görevlerim

**APPROVER** rolündeki kullanıcılar için:

**Adım 1:** Dashboard'da **"Onay Bekleyen Görevlerim"** kartına gidin

**Adım 2:** Görev listesini görüntüleyin:

```
📋 Bekleyen Görevler (3)

1. PR-2024-001 - Dental Malzemeleri
   Tutar: 15,000₺
   Öncelik: 🟡 Orta
   Talep Eden: John Doe
   Son Tarih: 10.11.2024
   [Detay] [Onayla] [Reddet]

2. PR-2024-002 - Ekipman Alımı
   Tutar: 50,000₺
   Öncelik: 🔴 Acil
   Talep Eden: Jane Smith
   Son Tarih: 08.11.2024
   [Detay] [Onayla] [Reddet]
```

---

### Talep Onaylama

**Adım 1:** Görev detaylarına gidin veya **"Onayla"** butonuna tıklayın

**Adım 2:** Talep detaylarını inceleyin:
- Ürün listesi
- Fiyat bilgileri
- Tedarikçi teklifleri
- Eklenen dosyalar

**Adım 3:** Yorum ekleyin (opsiyonel):
```
Örnek: "Q4 bütçesinden onaylandı. Tedarikçi ABC ile devam edilebilir."
```

**Adım 4:** **"Onayla"** butonuna tıklayın

**Adım 5:** Onay mesajını bekleyin:
```
✅ Talep onaylandı!
Workflow bir sonraki aşamaya geçti.
İlgili kişiler e-posta ile bilgilendirildi.
```

**Otomatik İşlemler:**
- 📧 Talep sahibine onay e-postası gönderilir
- 🔄 Workflow bir sonraki adıma geçer
- 👥 Bir sonraki onaylayanlara bildirim gönderilir
- 📊 Dashboard güncellenir

---

### Talep Reddetme

**Adım 1:** Görev detaylarına gidin veya **"Reddet"** butonuna tıklayın

**Adım 2:** Red nedenini girin (zorunlu):
```
Örnek: "Bütçe limiti aşıldı. Önce Finance ile görüşülmeli."
```

**Adım 3:** **"Reddet"** butonuna tıklayın

**Adım 4:** Onay iletişim kutusunda **"Evet, Reddet"** seçeneğine tıklayın

**Adım 5:** Red mesajını bekleyin:
```
❌ Talep reddedildi
Workflow sonlandırıldı.
İlgili kişiler e-posta ile bilgilendirildi.
```

**Otomatik İşlemler:**
- 📧 Talep sahibine red e-postası gönderilir
- 🔄 Workflow sonlanır
- 📊 Talep durumu "Reddedildi" olarak güncellenir
- ⏰ Talep sahibi yeni düzenleme yapabilir

---

### Toplu Onay

Birden fazla talebi aynı anda onaylayabilirsiniz:

**Adım 1:** "Onay Bekleyen Görevlerim" sayfasına gidin

**Adım 2:** Onaylamak istediğiniz taleplerin yanındaki checkbox'ları işaretleyin

**Adım 3:** **"Toplu Onayla"** butonuna tıklayın

**Adım 4:** Genel yorum ekleyin (opsiyonel)

**Adım 5:** Onaylayın

**⚠️ Dikkat:** Toplu onayda her talebi ayrı ayrı incelediğinizden emin olun!

---

## 📊 Dashboard Kullanımı

### Ana Dashboard

Dashboard, sisteminizin özet görünümünü sağlar:

#### 📈 İstatistikler (Kartlar)

```
┌─────────────────────┐  ┌─────────────────────┐
│ Toplam Talepler     │  │ Bekleyen Talepler   │
│      156            │  │       12            │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ Onaylananlar        │  │ Reddedilenler       │
│      120            │  │       24            │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ Toplam Tutar        │  │ Bekleyen Tutar      │
│  2,500,000₺         │  │    180,000₺         │
└─────────────────────┘  └─────────────────────┘
```

---

#### 📋 Bekleyen Görevlerim

Onay bekleyen tüm görevleriniz:

```
🔔 Onay Bekleyen Görevler (3)

• PR-2024-015 - Dental Malzemeleri (15,000₺)
  Son Tarih: 2 gün kaldı
  [Detay] [Onayla]

• PR-2024-016 - Ekipman Bakımı (5,000₺)
  Son Tarih: 5 gün kaldı
  [Detay] [Onayla]
```

---

#### 📊 Son Aktiviteler

Son sistem aktiviteleri:

```
⏰ Son Aktiviteler

• 14:30 - Jane Manager PR-2024-015'i onayladı
• 14:15 - John Doe yeni talep oluşturdu (PR-2024-016)
• 13:45 - Finance Team PR-2024-014'ü reddetti
• 13:20 - Admin yeni workflow oluşturdu
```

---

#### 📈 Grafik ve Raporlar

**Aylık Talep Grafiği:**
- Son 12 ayın talep sayıları
- Kategori bazında dağılım
- Toplam tutar trendleri

**Departman Bazında Harcama:**
- Her departmanın toplam harcaması
- Karşılaştırmalı görünüm
- Bütçe kullanım oranları

**Tedarikçi Analizi:**
- En çok çalışılan tedarikçiler
- Ortalama teslimat süreleri
- Fiyat karşılaştırmaları

---

### Widget Kişiselleştirme

Dashboard'unuzu özelleştirebilirsiniz:

**Adım 1:** Sağ üstteki ⚙️ ikonuna tıklayın

**Adım 2:** **"Dashboard Ayarları"** seçeneğini seçin

**Adım 3:** Widget'ları sürükle-bırak ile yeniden düzenleyin

**Adım 4:** İstemediğiniz widget'ları gizleyin

**Adım 5:** **"Kaydet"** butonuna tıklayın

---

## 🔔 Bildirimler

### E-posta Bildirimleri

Sistem, aşağıdaki durumlarda otomatik e-posta gönderir:

**Talep Eden İçin:**
- ✅ Talep başarıyla oluşturuldu
- ✅ Talep onaylandı
- ❌ Talep reddedildi
- 🔄 Talep durumu değişti
- 💬 Onaylayan yorum ekledi

**Onaylayan İçin:**
- 🔔 Yeni onay görevi atandı
- ⏰ Onay süresi dolmak üzere (24 saat kala)
- ⏱️ Onay süresi doldu
- 🔄 Workflow durumu değişti

**Admin İçin:**
- 📊 Günlük özet rapor
- ⚠️ Sistem uyarıları
- 👥 Yeni kullanıcı kaydı

---

### Bildirim Ayarları

E-posta bildirimlerinizi özelleştirebilirsiniz:

**Adım 1:** Profil → **"Bildirim Ayarları"**

**Adım 2:** Almak istediğiniz bildirimleri seçin:

```
☑️ Talep onaylandı
☑️ Talep reddedildi
☑️ Yeni görev atandı
☐ Günlük özet e-posta
☐ Haftalık rapor
```

**Adım 3:** **"Kaydet"** butonuna tıklayın

---

## 🎨 Kişiselleştirme (Admin)

### Şirket Bilgileri

**Adım 1:** Sol menüden **"Ayarlar"** → **"Şirket Bilgileri"**

**Adım 2:** Bilgileri güncelleyin:
- Şirket Adı
- Logo (Yükle/Değiştir)
- Ana Renk
- İkincil Renk

**Adım 3:** **"Kaydet"** butonuna tıklayın

**💡 Logo Önerileri:**
- Boyut: 200x200px
- Format: PNG, SVG (şeffaf arkaplan)
- Max dosya boyutu: 2MB

---

### Logo Yükleme

**Adım 1:** **"Logo Yükle"** butonuna tıklayın

**Adım 2:** Dosya seçin (PNG, JPG, SVG)

**Adım 3:** Önizlemeyi kontrol edin

**Adım 4:** **"Yükle"** butonuna tıklayın

**Adım 5:** Logo tüm sayfalarda otomatik güncellenir

---

### Renk Teması

**Adım 1:** **"Renk Seç"** butonuna tıklayın

**Adım 2:** Renk paletinden seçim yapın veya hex kod girin

**Adım 3:** Önizlemeyi kontrol edin

**Adım 4:** **"Uygula"** butonuna tıklayın

**Önerilen Renk Kombinasyonları:**
- 🔵 Mavi: #2563eb / #1e40af (Profesyonel)
- 🟢 Yeşil: #10b981 / #059669 (Taze)
- 🟣 Mor: #8b5cf6 / #7c3aed (Modern)
- 🔴 Kırmızı: #ef4444 / #dc2626 (Dinamik)

---

## 🔐 Güvenlik İpuçları

### Şifre Güvenliği

✅ **Güçlü Şifre Oluşturun:**
- Minimum 8 karakter
- Büyük ve küçük harf
- Rakam ve özel karakter
- Tahmin edilemez

❌ **Kullanmayın:**
- Doğum tarihi
- 123456 gibi basit şifreler
- Aynı şifreyi farklı sitelerde

**Şifre Değiştirme:**
1. Profil → Güvenlik
2. "Şifre Değiştir"
3. Mevcut şifreyi girin
4. Yeni şifreyi iki kez girin
5. Kaydet

---

### Hesap Güvenliği

🔒 **Güvenli Oturum:**
- Her kullanımdan sonra çıkış yapın
- Ortak bilgisayarlarda "Beni Hatırla" kullanmayın
- Şüpheli aktivite görürseniz şifrenizi değiştirin

📧 **E-posta Güvenliği:**
- Sisteme kayıtlı e-posta adresinizi koruyun
- Phishing e-postalarına dikkat edin
- Şüpheli linklere tıklamayın

---

## 📱 Mobil Kullanım

Platform, mobil cihazlarda da sorunsuz çalışır:

### Responsive Tasarım

✅ **Tüm Cihazlarda:**
- Telefon (iOS, Android)
- Tablet
- Masaüstü

✅ **Tüm Özellikler:**
- Talep oluşturma
- Onay verme
- Dosya yükleme
- Raporları görüntüleme

**💡 İpucu:** Tarayıcınızda "Ana Ekrana Ekle" seçeneğini kullanarak uygulama gibi kullanabilirsiniz.

---

## ❓ Sık Sorulan Sorular (SSS)

### Genel Sorular

**S: Kaç tane talep oluşturabilirim?**
A: Sınırsız talep oluşturabilirsiniz.

**S: Talep numaraları nasıl oluşuyor?**
A: Otomatik olarak "PR-YYYY-XXX" formatında oluşur (örn: PR-2024-001).

**S: Oluşturduğum talebi iptal edebilir miyim?**
A: Evet, onay süreci başlamadan önce iptal edebilirsiniz.

**S: Onaylandıktan sonra talep değiştirilebilir mi?**
A: Hayır, onaylanan talepler değiştirilemez. Yeni talep oluşturmanız gerekir.

---

### Onay Süreçleri

**S: Onay ne kadar sürer?**
A: Workflow'a bağlı olarak 1-5 iş günü arasında değişir.

**S: Onayım reddedildi, ne yapmalıyım?**
A: Red nedenini okuyun, gerekli düzeltmeleri yapın ve yeni talep oluşturun.

**S: Onay sürecini hızlandırabilir miyim?**
A: Önceliği "Acil" olarak işaretleyebilir ve onaylayanlarla iletişime geçebilirsiniz.

**S: Birden fazla onaylayan var mı?**
A: Evet, workflow'a göre birden fazla kişinin onayı gerekebilir.

---

### Teknik Sorular

**S: Hangi tarayıcıları destekliyorsunuz?**
A: Chrome, Firefox, Safari, Edge (son 2 sürüm).

**S: Dosya yükleme limiti nedir?**
A: Tek dosya için 10MB, toplam 50MB.

**S: Verilerim güvende mi?**
A: Evet, tüm veriler şifrelenmiş olarak saklanır ve yedeklenir.

**S: İnternet olmadan çalışır mı?**
A: Hayır, aktif internet bağlantısı gereklidir.

---

### Sorun Giderme

**S: Giriş yapamıyorum**
Çözüm:
1. E-posta ve şifrenizi kontrol edin
2. Caps Lock kapalı mı kontrol edin
3. "Şifremi Unuttum" seçeneğini kullanın
4. Hala çözemezseniz admin ile iletişime geçin

**S: E-posta bildirimi gelmiyor**
Çözüm:
1. Spam klasörünü kontrol edin
2. Bildirim ayarlarınızı kontrol edin
3. E-posta adresinizin doğru olduğunu kontrol edin
4. Admin ile iletişime geçin

**S: Dosya yüklenmiyor**
Çözüm:
1. Dosya boyutunu kontrol edin (max 10MB)
2. Dosya formatını kontrol edin (PDF, JPG, PNG, DOC, XLS)
3. İnternet bağlantınızı kontrol edin
4. Farklı tarayıcı deneyin

**S: Sayfa yüklenmiyor**
Çözüm:
1. Sayfayı yenileyin (F5)
2. Tarayıcı cache'ini temizleyin
3. Farklı tarayıcı deneyin
4. Admin ile iletişime geçin

---

## 📞 Destek

### Yardıma mı İhtiyacınız Var?

**📧 E-posta:** support@attelia.com

**📱 Telefon:** +90 555 000 0000 (Mesai saatleri: 09:00 - 18:00)

**💬 Canlı Destek:** Sağ alttaki chat ikonuna tıklayın (gelecekte eklenecek)

**📚 Dokümantasyon:** [docs.attelia.com](https://docs.attelia.com)

---

## 🎓 Video Eğitimler (Gelecekte Eklenecek)

- 🎬 Platform Tanıtımı (5 dk)
- 🎬 İlk Talep Oluşturma (8 dk)
- 🎬 Onay Süreci Yönetimi (10 dk)
- 🎬 Dashboard Kullanımı (6 dk)
- 🎬 Admin Paneli Eğitimi (15 dk)

---

## 📚 Ek Kaynaklar

- [Admin Rehberi](./ADMIN_GUIDE.md) - Yöneticiler için detaylı kılavuz
- [API Dokümantasyonu](./API_DOCUMENTATION.md) - Geliştiriciler için
- [Deployment Rehberi](./DEPLOYMENT.md) - Kurulum kılavuzu

---

**Son Güncelleme:** 07.11.2024
**Versiyon:** 1.0.0

🎉 **Attelia Dental Satın Alma Platformu'nu kullandığınız için teşekkürler!**
