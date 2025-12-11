# 📁 Google Drive Klasörüne Sheets Oluşturma Rehberi

Bu rehber, belirttiğiniz Google Drive klasörüne otomatik olarak Sheets dosyası oluşturmak için gerekli adımları içerir.

## 🎯 Önkoşullar

1. Google Cloud Console'da proje oluşturulmuş olmalı
2. Service Account oluşturulmuş olmalı
3. **Google Drive API** etkinleştirilmiş olmalı (Google Sheets API ile birlikte)

## 📋 Google Drive API'yi Etkinleştirme

1. [Google Cloud Console](https://console.cloud.google.com/) açın
2. Projenizi seçin
3. Sol menüden **APIs & Services > Library** seçin
4. Arama kutusuna "Google Drive API" yazın
5. **Google Drive API** sonucuna tıklayın
6. **Enable** butonuna tıklayın

## 🚀 Sheets Dosyasını Drive Klasörüne Oluşturma

### Seçenek 1: Script ile Otomatik Oluşturma (Önerilen)

1. **Paketleri yükleyin:**
   ```bash
   npm install
   ```

2. **Script'i çalıştırın:**
   ```bash
   npm run create-sheets-drive
   ```

3. **Script size Drive linkini soracak:**
   - Google Drive klasör linkinizi yapıştırın
   - Örnek format: `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j`

4. **Script otomatik olarak:**
   - ✅ Belirttiğiniz klasöre yeni Sheets dosyası oluşturur
   - ✅ Gerekli sheet'leri (Orders, Apartments, Users) ekler
   - ✅ Başlık satırlarını ekler
   - ✅ Service Account'a izin verir
   - ✅ Oluşturulan dosyanın ID'sini gösterir

### Seçenek 2: Environment Variable ile

Eğer Drive klasör ID'nizi `.env` dosyasına eklemek isterseniz:

```bash
# .env dosyası
GOOGLE_SERVICE_ACCOUNT='{"type":"service_account",...}'
GOOGLE_DRIVE_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j
```

Sonra script'i çalıştırın:
```bash
npm run create-sheets-drive
```

Script otomatik olarak `.env` dosyasındaki klasör ID'sini kullanacaktır.

## 🔐 Service Account'a Klasör İzni Verme

**ÖNEMLİ:** Service Account'un Drive klasörüne erişim yetkisi olmalıdır!

1. Google Drive klasörünüzü açın
2. Sağ üst köşedeki **Share** (Paylaş) butonuna tıklayın
3. Service Account email adresini ekleyin:
   - JSON dosyasındaki `client_email` değerini bulun
   - Örnek: `apartman-sheets-service@your-project.iam.gserviceaccount.com`
4. İzin seviyesini **Editor** olarak ayarlayın
5. **Send** tıklayın (email göndermenize gerek yok)

## 📋 Oluşturulan Dosya

Script başarıyla çalıştıktan sonra:

1. ✅ Belirttiğiniz klasörde "Apartman Verileri" adında bir Sheets dosyası oluşturulur
2. ✅ Dosyada 3 sekme olur: Orders, Apartments, Users
3. ✅ Her sekmede başlık satırları hazır olur
4. ✅ Script size dosya ID'sini verir

## 🔧 Environment Variable Ayarlama

Script size oluşturulan dosyanın ID'sini verecek. Bunu `.env` dosyasına veya Render.com'a ekleyin:

```bash
GOOGLE_SPREADSHEET_ID=olusturulan_dosya_id_buraya
```

## ✅ Kontrol Listesi

- [ ] Google Drive API etkinleştirildi
- [ ] Service Account oluşturuldu
- [ ] Service Account'a klasör erişim izni verildi
- [ ] `npm install` çalıştırıldı
- [ ] Script çalıştırıldı (`npm run create-sheets-drive`)
- [ ] Drive linki verildi
- [ ] Sheets dosyası oluşturuldu
- [ ] GOOGLE_SPREADSHEET_ID environment variable ayarlandı

## 🐛 Sorun Giderme

### "Permission denied" hatası

- Service Account'un klasöre erişim yetkisi olduğundan emin olun
- Klasörü Share butonundan Service Account email'ine paylaştığınızdan emin olun

### "API not enabled" hatası

- Google Drive API'nin etkinleştirildiğinden emin olun
- Google Cloud Console > APIs & Services > Library'den kontrol edin

### "Folder not found" hatası

- Drive linkini doğru formatta verdiğinizden emin olun
- Klasör ID'sinin doğru olduğundan emin olun
- Service Account'un klasöre erişim yetkisi olduğundan emin olun

## 📝 Notlar

- Script otomatik olarak gerekli sheet'leri ve başlıkları oluşturur
- İlk varsayılan sheet (Sheet1) otomatik olarak silinir
- Oluşturulan dosya ID'sini mutlaka GOOGLE_SPREADSHEET_ID olarak kaydedin

## 🎉 Tamamlandı!

Artık Google Drive klasörünüzde Sheets dosyanız hazır! 🚀

