# ✅ Render.com Deploy Kontrol Listesi

apartman.onrender.com adresinde daire seçimi görünmüyorsa, aşağıdaki adımları kontrol edin:

## 🔍 Kontrol Adımları

### 1. Render.com Deploy Durumu

**Render Dashboard'da kontrol edin:**
- https://dashboard.render.com → Your Service → **Logs**
- Build başarılı mı? (Yeşil tick görünmeli)
- Service çalışıyor mu? (Running durumunda olmalı)

**Log'larda şunları arayın:**
```
✅ Google Sheets API başarıyla başlatıldı
🚀 Apartman Görevlisi Server çalışıyor
```

### 2. Environment Variables Kontrolü

**Render Dashboard → Your Service → Environment** sekmesinde şunlar olmalı:

- ✅ **GOOGLE_SERVICE_ACCOUNT**: Service Account JSON (çok uzun)
- ✅ **GOOGLE_SPREADSHEET_ID**: `1USqMZ7nRtrfN7pUSt100W9UI97ytFmM-UB41M3mO70c`
- ✅ **NODE_ENV**: `production`
- ✅ **NODE_OPTIONS**: `--no-experimental-fetch` (opsiyonel)
- ✅ **PORT**: `3002` (opsiyonel, Render otomatik atar)

**Kontrol:** Her bir variable'ın değeri doğru mu?

### 3. Google Sheets Bağlantı Kontrolü

**Render Logs'ta şu hatayı görüyor musunuz?**
```
⚠️  GOOGLE_SERVICE_ACCOUNT environment variable bulunamadı
```

**Veya:**
```
❌ Google Sheets API başlatma hatası
```

**Çözüm:**
- Environment Variables'ı tekrar kontrol edin
- Service'i yeniden başlatın (Restart)

### 4. API Endpoint Testi

Tarayıcınızda şu URL'leri test edin:

**Health Check:**
```
https://apartman.onrender.com/api/health
```
Beklenen cevap: `{"status":"ok","message":"Apartman Görevlisi API is running"}`

**Blocks Endpoint:**
```
https://apartman.onrender.com/api/apartment/blocks
```
Beklenen cevap: 30 daire listesi (JSON array)

### 5. Build Başarısız Olduysa

**Hata:** "Build failed"
**Kontrol:**
- Logs'u kontrol edin
- `package.json` dosyası doğru mu?
- Node.js versiyonu doğru mu? (20.18.0)

**Çözüm:**
- Render Dashboard → Manual Deploy → Deploy latest commit

### 6. Service Çalışmıyorsa

**Hata:** Service "Stopped" veya "Failed" durumunda
**Kontrol:**
- Logs'u kontrol edin
- Environment Variables eksik olabilir
- Google Sheets bağlantı hatası olabilir

**Çözüm:**
- Service'i Restart edin
- Environment Variables'ı kontrol edin

### 7. Frontend Build Hatası

**Hata:** Client build failed
**Kontrol:**
- `client/package.json` doğru mu?
- React build başarılı mı?

**Çözüm:**
- Build loglarını kontrol edin
- `npm run build` yerel olarak çalıştırın

## 🔧 Hızlı Çözümler

### Service'i Yeniden Başlat
1. Render Dashboard → Your Service
2. Sağ üstteki **"Manual Deploy"** → **"Deploy latest commit"**
3. Veya **"Restart"** butonuna tıklayın

### Environment Variables Kontrolü
1. Render Dashboard → Your Service → **Environment**
2. Her bir variable'ı kontrol edin
3. Eksik varsa ekleyin
4. Service'i yeniden başlatın

### Google Sheets Bağlantısını Test Et
Render.com'da **Logs** sekmesinde şunu görmelisiniz:
```
✅ Google Sheets API başarıyla başlatıldı
```

Görmüyorsanız, `GOOGLE_SERVICE_ACCOUNT` ve `GOOGLE_SPREADSHEET_ID` değerlerini kontrol edin.

## 📊 Test URL'leri

**Health Check:**
```
https://apartman.onrender.com/api/health
```

**Blocks API:**
```
https://apartman.onrender.com/api/apartment/blocks
```

**Ana Sayfa:**
```
https://apartman.onrender.com/
```

## ✅ Başarı Kriterleri

1. ✅ Build başarılı
2. ✅ Service "Running" durumunda
3. ✅ Logs'ta "Google Sheets API başarıyla başlatıldı" görünüyor
4. ✅ `/api/health` endpoint çalışıyor
5. ✅ `/api/apartment/blocks` endpoint 30 daire döndürüyor
6. ✅ Ana sayfada daire seçimi görünüyor

## 🐛 Yaygın Sorunlar

### Sorun: "Cannot GET /api/apartment/blocks"
**Çözüm:** Service çalışmıyor veya route yanlış. Logs'u kontrol edin.

### Sorun: Daire listesi boş geliyor
**Çözüm:** Google Sheets bağlantısı yok. Environment Variables'ı kontrol edin.

### Sorun: Service başlatılamıyor
**Çözüm:** Port hatası olabilir. `PORT` environment variable'ını kontrol edin.

---

**Tüm adımları kontrol ettikten sonra hala sorun varsa, Render Dashboard'daki Logs'u paylaşın.**

