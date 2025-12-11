# 📊 Google Sheets Template Oluşturma Rehberi

Bu rehber, Google Sheets template'inizi oluşturmanız ve mevcut verilerinizi aktarmanız için adımları içerir.

## 🎯 Hızlı Başlangıç

### Seçenek 1: Otomatik Template Oluşturma (Önerilen)

Uygulama ilk çalıştığında otomatik olarak gerekli sheet'leri oluşturur. Sadece:

1. ✅ Boş bir Google Sheet oluşturun
2. ✅ Service Account'a izin verin (GOOGLE_SHEETS_SETUP.md'ye bakın)
3. ✅ Environment variable'ları ayarlayın
4. ✅ Uygulamayı başlatın - sheet'ler otomatik oluşturulacak!

**Sheet'ler otomatik olarak şu şekilde oluşturulur:**
- **Orders** sekmesi: Siparişler için
- **Apartments** sekmesi: Daire listesi için
- **Users** sekmesi: Kullanıcı bilgileri için

### Seçenek 2: Manuel Template Oluşturma

Eğer kendiniz template oluşturmak isterseniz:

#### 1. Google Sheet Oluşturma

1. [Google Sheets](https://sheets.google.com/) açın
2. Yeni bir boş spreadsheet oluşturun
3. Adını "Apartman Verileri" olarak değiştirin

#### 2. Gerekli Sheet'leri (Sekmeler) Oluşturma

**Orders Sekmesi:**
1. Alt kısımdaki "+" butonuna tıklayarak yeni sheet ekleyin
2. Sheet adını "Orders" olarak değiştirin
3. A1 hücresinden başlayarak şu başlıkları ekleyin:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| id | apartmentNumber | orderText | contactInfo | isTrashCollection | orderType | orderTimeMessage | status | createdAt | updatedAt |

**Apartments Sekmesi:**
1. Yeni bir sheet ekleyin
2. Sheet adını "Apartments" olarak değiştirin
3. A1 ve B1 hücrelerine şu başlıkları ekleyin:

| A | B |
|---|---|
| number | contactInfo |

**Users Sekmesi:**
1. Yeni bir sheet ekleyin
2. Sheet adını "Users" olarak değiştirin
3. A1'den D1'e kadar şu başlıkları ekleyin:

| A | B | C | D |
|---|---|---|---|
| id | apartmentNumber | password | createdAt |

#### 3. İlk Sheet'i Silme (Opsiyonel)

İlk boş sheet'i (Sheet1) silebilirsiniz.

## 📤 Mevcut Verileri Aktarma

Eğer yerel JSON dosyalarınızda veri varsa, bunları Google Sheets'e aktarmak için:

### Adım 1: Environment Variables Ayarlama

`.env` dosyası oluşturun (veya Render.com'da ayarlayın):

```bash
GOOGLE_SERVICE_ACCOUNT='{"type":"service_account",...}'
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
```

### Adım 2: Migration Script'ini Çalıştırma

```bash
npm run migrate-sheets
```

Bu script:
- ✅ Mevcut JSON dosyalarını okuyacak
- ✅ Google Sheets'e bağlanacak
- ✅ Tüm verileri aktaracak
- ✅ İşlem sonucunu raporlayacak

### Manuel Aktarma

Eğer script çalışmazsa, verileri manuel olarak da ekleyebilirsiniz:

1. `temp/apartment-orders.json` dosyasını açın
2. `temp/apartment-users.json` dosyasını açın
3. Verileri Google Sheets'e kopyalayın

## ✅ Kontrol Listesi

Kurulum tamamlandıktan sonra:

- [ ] Google Sheet oluşturuldu
- [ ] Service Account'a izin verildi
- [ ] Environment variables ayarlandı
- [ ] Uygulama başlatıldı ve sheet'ler otomatik oluşturuldu
- [ ] (Opsiyonel) Mevcut veriler migration script ile aktarıldı
- [ ] Google Sheet'te 3 sekme görünüyor: Orders, Apartments, Users
- [ ] Uygulamadan test siparişi verildi ve Sheet'te göründü

## 🐛 Sorun Giderme

### Sheet'ler oluşturulmadı

- Service Account'un Sheet'e erişim yetkisi olduğundan emin olun
- Environment variable'ların doğru ayarlandığını kontrol edin
- Server loglarında "Google Sheets API başarıyla başlatıldı" mesajını kontrol edin

### Veriler görünmüyor

- Migration script'i çalıştırın: `npm run migrate-sheets`
- Google Sheet'inizi yenileyin (F5)
- Uygulamadan yeni bir sipariş verin ve Sheet'te görünüp görünmediğini kontrol edin

### Migration script hata veriyor

- `.env` dosyasının doğru konumda olduğundan emin olun (proje kök dizini)
- Environment variable'ların doğru formatda olduğunu kontrol edin
- Google Sheets API'nin etkinleştirildiğinden emin olun

## 📝 Notlar

- **Otomatik Oluşturma**: Uygulama ilk çalıştığında gerekli sheet'leri otomatik oluşturur
- **Manuel Oluşturma**: İsterseniz manuel olarak da oluşturabilirsiniz
- **Başlık Satırları**: Başlık satırları otomatik oluşturulur, manuel eklemenize gerek yok
- **Veri Formatı**: Veriler JSON'dan Sheet'e aktarılırken otomatik formatlanır

## 🎉 Tamamlandı!

Artık Google Sheets template'iniz hazır ve verileriniz bulutta saklanıyor! 🚀

