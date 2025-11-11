# 🚀 Render.com Deploy Yönergesi - Apartman Görevlisi

Bu doküman, Apartman Görevlisi uygulamasını Render.com'da deploy etmek için adım adım talimatları içerir.

## 📋 Ön Gereksinimler

1. GitHub hesabı (kodunuz GitHub'da olmalı)
2. Render.com hesabı (ücretsiz kayıt: https://render.com)

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

#### Environment Variables
Aşağıdaki environment variable'ları ekleyin:

```
NODE_ENV=production
PORT=3002
```

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

### 7. Uygulama URL'i

Deploy tamamlandıktan sonra:
- Render size bir URL verecek: `https://apartman-gorevlisi.onrender.com` (veya benzeri)
- Bu URL'den uygulamanıza erişebilirsiniz

## 🔧 Önemli Notlar

### Veri Depolama

⚠️ **ÖNEMLİ**: Render'ın free plan'ında disk storage geçicidir. Uygulama yeniden başlatıldığında veriler kaybolabilir.

**Çözüm seçenekleri:**
1. **Render Disk** (ücretli): Kalıcı storage için
2. **External Database**: MongoDB, PostgreSQL gibi
3. **Cloud Storage**: AWS S3, Google Cloud Storage

### Environment Variables

Production'da güvenlik için:
- Görevli şifrelerini environment variable olarak saklayın
- API key'leri environment variable olarak kullanın

### Custom Domain (Opsiyonel)

1. Render Dashboard → Service → Settings → Custom Domains
2. Domain'inizi ekleyin
3. DNS ayarlarını yapın (Render size talimat verir)

## 📝 render.yaml Kullanımı (Alternatif)

Eğer `render.yaml` dosyasını kullanmak isterseniz:

1. Repository'nize `render.yaml` dosyasını ekleyin (zaten ekli)
2. Render Dashboard'da:
   - "New +" → "Blueprint"
   - Repository'nizi seçin
   - Render otomatik olarak `render.yaml` dosyasını okuyacak

## 🐛 Sorun Giderme

### Build Hatası

**Problem**: Build sırasında hata alıyorsunuz
**Çözüm**: 
- Logları kontrol edin
- `package.json` dosyasındaki script'leri kontrol edin
- Node.js versiyonunu kontrol edin (18+ gerekli)

### Port Hatası

**Problem**: "Port already in use" hatası
**Çözüm**: 
- `PORT` environment variable'ını Render'ın otomatik atadığı port'a bırakın
- Veya `process.env.PORT` kullanın (zaten kullanılıyor)

### Veri Kaybı

**Problem**: Uygulama yeniden başladığında veriler kayboluyor
**Çözüm**: 
- Render Disk kullanın (ücretli)
- Veya external database kullanın

### Uygulama Uyuyor

**Problem**: Free plan'da 15 dakika idle kalınca uyuyor
**Çözüm**: 
- İlk istekte otomatik uyanır (30-60 saniye sürebilir)
- Veya ücretli plan'a geçin (her zaman aktif)

## 🔒 Güvenlik

1. **Environment Variables**: Hassas bilgileri environment variable olarak saklayın
2. **HTTPS**: Render otomatik HTTPS sağlar
3. **Şifreler**: Production'da şifreleri hash'leyin (şu an basit şifre kullanılıyor)

## 📊 Monitoring

Render Dashboard'da:
- **Logs**: Canlı logları görüntüleyin
- **Metrics**: CPU, Memory kullanımını izleyin
- **Events**: Deploy geçmişini görün

## 🚀 Hızlı Başlangıç

```bash
# 1. GitHub'da repository hazır (✓)
# 2. Render.com'a git
https://dashboard.render.com

# 3. New Web Service
# 4. GitHub repo'yu bağla
# 5. Ayarları yukarıdaki gibi yap
# 6. Deploy!
```

## 📞 Destek

- Render Dokümantasyon: https://render.com/docs
- Render Support: https://render.com/support

---

**Başarılar! 🎉**

