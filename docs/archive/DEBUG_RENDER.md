# 🐛 Render.com Daire Listesi Boş Sorunu - Debug Rehberi

## 🔍 Sorun

apartman.onrender.com'da daire listesi boş geliyor.

## ✅ Kontrol Edilenler

1. ✅ Environment Variables doğru (GOOGLE_SERVICE_ACCOUNT, GOOGLE_SPREADSHEET_ID)
2. ✅ API Health Check çalışıyor (`/api/health`)
3. ✅ Local'de Google Sheets bağlantısı çalışıyor (30 daire var)

## 🔧 Yapılan Düzeltmeler

### 1. API URL Düzeltmesi

**Sorun:** Production'da frontend `http://localhost:3002/api` kullanıyordu.

**Çözüm:** `client/src/utils/api.js` dosyasında:
- Production'da relative path kullanılıyor: `/api`
- Development'ta localhost: `http://localhost:3002/api`

### 2. Error Handling İyileştirmesi

`ApartmentLogin.js` dosyasına detaylı hata mesajları eklendi.

## 🚀 Test Adımları

### 1. Tarayıcı Console'unu Kontrol Et

apartman.onrender.com'u açın ve **F12** → **Console** sekmesine bakın:

**Arayın:**
```
📋 Blocks response: [...]
```

**Veya hata mesajı:**
```
❌ Bloklar yüklenemedi: ...
```

### 2. API Endpoint'ini Direkt Test Et

Tarayıcıda şu URL'yi açın:
```
https://apartman.onrender.com/api/apartment/blocks
```

**Beklenen:** 30 daire JSON array'i
**Eğer boş geliyorsa:** Google Sheets bağlantı sorunu var

### 3. Network Tab'ı Kontrol Et

**F12** → **Network** sekmesi:
1. Sayfayı yenileyin (F5)
2. `/api/apartment/blocks` isteğini bulun
3. Status Code'u kontrol edin:
   - ✅ 200: Başarılı
   - ❌ 404: Route bulunamadı
   - ❌ 500: Server hatası

### 4. Render Logs Kontrol

Render Dashboard → Your Service → **Logs**:

**Arayın:**
```
✅ Google Sheets API başarıyla başlatıldı
```

**Eğer göremiyorsanız:**
```
⚠️  GOOGLE_SERVICE_ACCOUNT environment variable bulunamadı
```

Bu durumda Environment Variables'ı kontrol edin.

## 🔧 Hızlı Çözümler

### Çözüm 1: Service'i Yeniden Başlat

1. Render Dashboard → Your Service
2. **"Manual Deploy"** → **"Deploy latest commit"**
3. Veya **"Restart"** butonuna tıklayın

### Çözüm 2: Build Command'ı Kontrol

Render Dashboard → Your Service → **Settings** → **Build Command**:

Şu olmalı:
```
npm install && cd client && npm install && NODE_OPTIONS=--no-experimental-fetch npm run build && cd ..
```

### Çözüm 3: Environment Variables'ı Tekrar Kontrol

1. **GOOGLE_SERVICE_ACCOUNT**: JSON string (çok uzun)
2. **GOOGLE_SPREADSHEET_ID**: `1USqMZ7nRtrfN7pUSt100W9UI97ytFmM-UB41M3mO70c`
3. **NODE_ENV**: `production`
4. **NODE_OPTIONS**: `--no-experimental-fetch` (opsiyonel)

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

## ✅ Beklenen Sonuç

1. Tarayıcı Console'da: `📋 Blocks response: Array(30)`
2. API endpoint: 30 daire JSON array'i
3. Dropdown'da: 30 daire seçeneği görünmeli

---

**Hala sorun varsa, tarayıcı Console ve Network tab'ındaki hata mesajlarını paylaşın.**

