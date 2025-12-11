# 🚀 Render.com Deploy Yönergesi - Apartman Görevlisi

Bu doküman, Apartman Görevlisi uygulamasını Render.com'da deploy etmek için adım adım talimatları içerir.

## 📋 Ön Gereksinimler

1. GitHub hesabı (kodunuz GitHub'da olmalı)
2. Render.com hesabı (ücretsiz kayıt: https://render.com)
3. Google Service Account JSON dosyası
4. Google Sheets dosyası oluşturulmuş olmalı

## 🎯 Adım Adım Deploy

### 1. GitHub Repository Hazırlığı

Kodunuz zaten GitHub'da: https://github.com/Neogtt/apartman

### 2. Render.com'da Yeni Web Service Oluşturma

1. **Render Dashboard'a gidin**: https://dashboard.render.com
2. **"New +"** butonuna tıklayın
3. **"Web Service"** seçin
4. **GitHub repository'nizi bağlayın**:
   - "Connect GitHub" butonuna tıklayın
   - GitHub hesabınızı bağlayın
   - `Neogtt/apartman` repository'sini seçin

### 3. Service Ayarları

Aşağıdaki ayarları yapın:

#### Basic Settings
- **Name**: `apartman-gorevlisi` (veya istediğiniz isim)
- **Region**: En yakın bölgeyi seçin (örn: Frankfurt)
- **Branch**: `main`
- **Root Directory**: (boş bırakın, root'tan başlasın)

#### Build & Deploy
- **Environment**: `Node`
- **Build Command**: 
  ```bash
  npm install && cd client && npm install && npm run build && cd ..
  ```
- **Start Command**: 
  ```bash
  npm start
  ```

#### Environment Variables (ÖNEMLİ! ⚠️)

**Zorunlu Environment Variables:**

1. **GOOGLE_SERVICE_ACCOUNT**:
   - Service Account JSON dosyasının **tam içeriğini** buraya yapıştırın
   - Tek satır olarak, tırnak işaretleri dahil
   - Örnek format:
     ```
     {"type":"service_account","project_id":"apartman-478214","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"apartman@apartman-478214.iam.gserviceaccount.com",...}
     ```

2. **GOOGLE_SPREADSHEET_ID**:
   - Google Sheets dosyanızın ID'si
   - Örnek: `1USqMZ7nRtrfN7pUSt100W9UI97ytFmM-UB41M3mO70c`

3. **NODE_ENV**:
   - Değer: `production`

4. **PORT**:
   - Değer: Render otomatik atar, ancak `3002` yazabilirsiniz

**Environment Variables Nasıl Eklenecek:**

1. Render Dashboard → Your Service → **Environment** sekmesine gidin
2. **"Add Environment Variable"** butonuna tıklayın
3. Her bir variable'ı tek tek ekleyin:
   - Key: `GOOGLE_SERVICE_ACCOUNT`
   - Value: JSON dosyasının tam içeriği (tek satır)

⚠️ **ÖNEMLİ NOTLAR:**
- `GOOGLE_SERVICE_ACCOUNT` değeri çok uzun olacak (JSON string)
- Tırnak işaretlerini kaldırmayın, olduğu gibi yapıştırın
- `\n` karakterleri JSON içinde olmalı (private key için)
- Render'ın text area'ında tam olarak görünmeyebilir ama sorun değil

### 4. Plan Seçimi

- **Free Plan** seçin (başlangıç için yeterli)
- Not: Free plan'da 15 dakika idle kalırsa uyur, ilk istekte uyanır

### 5. Deploy

1. **"Create Web Service"** butonuna tıklayın
2. Render otomatik olarak:
   - Repository'yi clone eder
   - Dependencies'leri yükler
   - Frontend'i build eder
   - Uygulamayı başlatır

### 6. Deploy Süreci

Deploy işlemi yaklaşık 5-10 dakika sürebilir. Logları takip edebilirsiniz:

- ✅ Build başarılı olursa yeşil tick görürsünüz
- ❌ Hata olursa logları kontrol edin
- Log'larda "Google Sheets API başarıyla başlatıldı" mesajını görmelisiniz

### 7. Uygulama URL'i

Deploy tamamlandıktan sonra:
- Render size bir URL verecek: `https://apartman-gorevlisi.onrender.com` (veya benzeri)
- Bu URL'den uygulamanıza erişebilirsiniz

## ✅ Deploy Sonrası Kontroller

### 1. Log Kontrolü

Render Dashboard → Your Service → **Logs** sekmesine gidin ve şunu kontrol edin:

```
✅ Google Sheets API başarıyla başlatıldı
🚀 Apartman Görevlisi Server çalışıyor: http://localhost:3002
```

### 2. Health Check

Tarayıcınızda şu URL'yi açın:
```
https://your-service-name.onrender.com/api/health
```

Şu cevabı görmelisiniz:
```json
{"status":"ok","message":"Apartman Görevlisi API is running"}
```

### 3. Google Sheets Kontrolü

1. Google Sheets dosyanızı açın
2. Yeni bir sipariş verin (uygulamadan)
3. Sheets'te verinin göründüğünü kontrol edin

## 🔧 Önemli Notlar

### Veri Depolama ✅

✅ **Çözüldü!**: Artık Google Sheets kullanıyoruz, veriler bulutta saklanıyor.
- Render'ın free plan'ında bile veriler kalıcı
- Tüm cihazlardan aynı verilere erişim
- Otomatik yedekleme (Google Sheets)

### Environment Variables

Production'da güvenlik için:
- Service Account JSON'u environment variable olarak saklıyoruz (güvenli)
- Şifreler Google Sheets'te saklanıyor (production'da hash'lenmeli)

### Custom Domain (Opsiyonel)

1. Render Dashboard → Service → Settings → Custom Domains
2. Domain'inizi ekleyin
3. DNS ayarlarını yapın (Render size talimat verir)

## 📝 render.yaml Kullanımı (Alternatif)

⚠️ **ÖNEMLİ**: `render.yaml` dosyasında environment variables eklemek **GÜVENLİ DEĞİLDİR** çünkü dosya Git'te public olabilir.

**Yerine:** Render Dashboard'dan manuel olarak ekleyin.

## 🐛 Sorun Giderme

### Build Hatası

**Problem**: Build sırasında hata alıyorsunuz
**Çözüm**: 
- Logları kontrol edin
- `package.json` dosyasındaki script'leri kontrol edin
- Node.js versiyonunu kontrol edin (18+ gerekli)

### Google Sheets Bağlantı Hatası

**Problem**: "Google Sheets API başlatılamadı" hatası
**Çözüm**: 
- `GOOGLE_SERVICE_ACCOUNT` environment variable'ını kontrol edin
- JSON formatının doğru olduğundan emin olun
- `GOOGLE_SPREADSHEET_ID` değerini kontrol edin
- Service Account'un Sheets dosyasına erişim izni olduğundan emin olun

### Port Hatası

**Problem**: "Port already in use" hatası
**Çözüm**: 
- `PORT` environment variable'ını Render'ın otomatik atadığı port'a bırakın
- Veya `process.env.PORT` kullanın (zaten kullanılıyor)

### Uygulama Uyuyor

**Problem**: Free plan'da 15 dakika idle kalınca uyuyor
**Çözüm**: 
- İlk istekte otomatik uyanır (30-60 saniye sürebilir)
- Veya ücretli plan'a geçin (her zaman aktif)

## 🔒 Güvenlik

1. **Environment Variables**: Service Account JSON'u environment variable olarak saklıyoruz ✅
2. **HTTPS**: Render otomatik HTTPS sağlar ✅
3. **Şifreler**: Production'da şifreleri hash'leyin (gelecek güncelleme)

## 📊 Monitoring

Render Dashboard'da:
- **Logs**: Canlı logları görüntüleyin
- **Metrics**: CPU, Memory kullanımını izleyin
- **Events**: Deploy geçmişini görün

## 🚀 Hızlı Başlangıç

```bash
# 1. GitHub'da repository hazır (✓)
# 2. Google Sheets kurulumu tamamlandı (✓)
# 3. Render.com'a git
https://dashboard.render.com

# 4. New Web Service
# 5. GitHub repo'yu bağla
# 6. Environment Variables ekle (YUKARIDAKİ GİBİ)
# 7. Deploy!
```

## 📞 Destek

- Render Dokümantasyon: https://render.com/docs
- Render Support: https://render.com/support

---

**Başarılar! 🎉**

Artık verileriniz Google Sheets'te, tüm cihazlardan erişilebilir! 🚀
