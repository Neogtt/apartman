# 📊 Google Sheets Kurulum Kılavuzu

Bu kılavuz, apartman uygulamasının verilerini Google Sheets'te saklamak için gerekli adımları içerir.

## 🎯 Neden Google Sheets?

- ✅ Render.com'da verilerin kalıcı olmasını sağlar
- ✅ Tüm cihazlardan aynı verilere erişim
- ✅ Verileri Excel'de görüntüleyebilme
- ✅ Otomatik yedekleme

## 📋 Adım Adım Kurulum

### 1. Google Cloud Console'da Proje Oluşturma

1. Tarayıcınızda [Google Cloud Console](https://console.cloud.google.com/) açın
2. Üst kısımdaki proje seçiciden **New Project** tıklayın
3. Proje adı verin (örn: `apartman-project`)
4. **Create** tıklayın

### 2. Google Sheets API'yi Etkinleştirme

1. Sol menüden **APIs & Services > Library** seçin
2. Arama kutusuna "Google Sheets API" yazın
3. **Google Sheets API** sonucuna tıklayın
4. **Enable** butonuna tıklayın

### 3. Service Account Oluşturma

1. Sol menüden **APIs & Services > Credentials** seçin
2. Üst kısımdaki **+ CREATE CREDENTIALS** butonuna tıklayın
3. **Service account** seçin
4. Service account details:
   - **Service account name**: `apartman-sheets-service`
   - **Service account ID**: Otomatik oluşturulacak
5. **Create and Continue** tıklayın
6. **Grant this service account access to project** kısmını atlayabilirsiniz
7. **Done** tıklayın

### 4. Service Account Key (JSON) İndirme

1. Oluşturduğunuz Service Account'a tıklayın (listede görünecek)
2. Üst kısımdaki **KEYS** sekmesine tıklayın
3. **ADD KEY > Create new key** seçin
4. **JSON** formatını seçin
5. **Create** tıklayın
6. JSON dosyası indirilecek - bu dosyayı güvenli bir yerde saklayın

### 5. Google Sheet Oluşturma

1. [Google Sheets](https://sheets.google.com/) açın
2. Yeni bir boş spreadsheet oluşturun
3. Dosya adını değiştirin: **Apartman Verileri** (veya istediğiniz bir isim)
4. URL'den Spreadsheet ID'yi kopyalayın:
   ```
   https://docs.google.com/spreadsheets/d/[BURASI_SPREADSHEET_ID]/edit
   ```
   Örnek: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t`

### 6. Service Account'a İzin Verme

1. Google Sheet'in sağ üst köşesindeki **Share** (Paylaş) butonuna tıklayın
2. İndirdiğiniz JSON dosyasını açın ve `client_email` değerini bulun
   Örnek: `apartman-sheets-service@your-project.iam.gserviceaccount.com`
3. Bu email adresini Share kutusuna yapıştırın
4. İzin seviyesini **Editor** olarak ayarlayın
5. **Send** butonuna tıklayın (email göndermenize gerek yok, sadece izin veriyorsunuz)

### 7. Environment Variables Ayarlama

#### Render.com'da:

1. Render.com dashboard'unuzda servisinize gidin
2. Sol menüden **Environment** sekmesine tıklayın
3. **Environment Variables** bölümünde:

   **Yeni Variable Ekleyin:**
   - **Key**: `GOOGLE_SERVICE_ACCOUNT`
   - **Value**: İndirdiğiniz JSON dosyasının **tam içeriğini** buraya yapıştırın
     - Dosyayı bir metin editöründe açın
     - Tüm içeriği kopyalayın (tek satır olmalı, tırnak işaretleri dahil)
     - Örnek format:
       ```json
       {"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
       ```

   **Yeni Variable Ekleyin:**
   - **Key**: `GOOGLE_SPREADSHEET_ID`
   - **Value**: Google Sheet'in ID'sini yapıştırın (5. adımdan)
     - Örnek: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t`

4. **Save Changes** tıklayın
5. Servisi yeniden başlatın (Restart)

#### Yerel Geliştirme İçin (.env dosyası):

Proje kök dizininde `.env` dosyası oluşturun:

```bash
GOOGLE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'

GOOGLE_SPREADSHEET_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
```

**Önemli**: `.env` dosyasını git'e commit etmeyin! `.gitignore` dosyasında olduğundan emin olun.

### 8. Test Etme

1. Servisi başlatın (Render.com otomatik başlatacak veya yerel: `npm start`)
2. Uygulamada bir sipariş verin
3. Google Sheet'inizi açın - verilerin orada göründüğünü kontrol edin
4. Sheet'te 3 sekme olmalı:
   - **Orders**: Siparişler
   - **Apartments**: Daireler
   - **Users**: Kullanıcılar

## 🔍 Sorun Giderme

### Veriler görünmüyor

1. Service Account'un Sheet'e erişim yetkisi olduğundan emin olun
2. Environment variable'ların doğru ayarlandığını kontrol edin
3. Server loglarını kontrol edin:
   - ✅ "Google Sheets API başarıyla başlatıldı" mesajını görmelisiniz
   - ❌ Hata mesajları varsa logları kontrol edin

### "Permission denied" hatası

- Service Account email'inin Sheet'e eklendiğinden emin olun
- Editor yetkisi verdiğinizden emin olun

### JSON parse hatası

- GOOGLE_SERVICE_ACCOUNT değerinin tam bir JSON olduğundan emin olun
- Tırnak işaretlerinin doğru kaçışlandığından emin olun

## 📝 Notlar

- Service Account JSON dosyasını **asla** git'e commit etmeyin
- Sheet ID'yi paylaşabilirsiniz (güvenlik sorunu yok)
- Herhangi bir problemde uygulama otomatik olarak yerel JSON dosyalarını kullanır

## 🎉 Tamamlandı!

Artık verileriniz Google Sheets'te saklanıyor ve tüm cihazlardan erişilebilir!

