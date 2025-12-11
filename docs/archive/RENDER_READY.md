# ✅ Render.com Deploy Hazırlık Kontrolü

## 📋 Render Deploy İçin Gerekli Dosyalar

### ✅ Hazır Dosyalar

1. **render.yaml** ✓
   - Node.js versiyonu: 20.18.0
   - Build command: Hazır
   - Start command: Hazır
   - Environment variables: Tanımlı

2. **package.json** ✓
   - Node.js engine: 20.18.0
   - Tüm dependencies: Hazır
   - Scripts: Hazır

3. **.nvmrc** ✓
   - Root klasörde: 20.18.0
   - client/.nvmrc: 20.18.0

4. **server/index.js** ✓
   - PORT environment variable desteği
   - Static file serving
   - API routes

5. **server/routes/apartment.js** ✓
   - Google Sheets entegrasyonu
   - Tüm endpoint'ler hazır

6. **server/services/sheetsService.js** ✓
   - Google Sheets API entegrasyonu
   - Fallback JSON desteği

### ✅ .gitignore Kontrolü

- ✅ `.env` - Git'e eklenmeyecek
- ✅ `RENDER_ENV_VALUES.txt` - Git'e eklenmeyecek
- ✅ `apartman-*.json` - Service Account JSON'ları git'e eklenmeyecek
- ✅ `temp/` - Veri dosyaları git'e eklenmeyecek
- ✅ `node_modules/` - Dependencies git'e eklenmeyecek
- ✅ Geçici dosyalar ignore edildi

## 🔐 Environment Variables (Render.com'da Ayarlanmalı)

Render Dashboard → Your Service → Environment sekmesinde:

1. **GOOGLE_SERVICE_ACCOUNT**: Service Account JSON string
2. **GOOGLE_SPREADSHEET_ID**: `1USqMZ7nRtrfN7pUSt100W9UI97ytFmM-UB41M3mO70c`
3. **NODE_ENV**: `production`
4. **PORT**: `3002` (opsiyonel, Render otomatik atar)
5. **NODE_OPTIONS**: `--no-experimental-fetch` (opsiyonel)

## 🚀 Deploy Adımları

### 1. GitHub'a Push Yap

```bash
git add .
git commit -m "Prepare for Render deploy"
git push origin main
```

### 2. Render.com'da Service Oluştur

1. Render Dashboard → **New +** → **Web Service**
2. GitHub repo'yu bağla: `Neogtt/apartman`
3. Service ayarları:
   - **Name**: `apartman-gorevlisi`
   - **Build Command**: `npm install && cd client && npm install && NODE_OPTIONS=--no-experimental-fetch npm run build && cd ..`
   - **Start Command**: `npm start`

### 3. Environment Variables Ekle

Render Dashboard → Your Service → **Environment**:

`RENDER_ENV_VALUES.txt` dosyasındaki değerleri ekleyin (ama o dosyayı git'e push etmeyin!)

### 4. Deploy Et

- **"Create Web Service"** butonuna tıklayın
- Veya GitHub push sonrası otomatik deploy başlayacak

## ✅ Deploy Sonrası Kontrol

### 1. Logs Kontrolü

Render Dashboard → Your Service → **Logs**:

```
✅ Google Sheets API başarıyla başlatıldı
🚀 Apartman Görevlisi Server çalışıyor
```

### 2. Health Check

```
https://apartman.onrender.com/api/health
```

Beklenen: `{"status":"ok","message":"Apartman Görevlisi API is running"}`

### 3. Blocks API Test

```
https://apartman.onrender.com/api/apartment/blocks
```

Beklenen: 30 daire JSON array'i

### 4. Ana Sayfa Test

```
https://apartman.onrender.com/
```

Daire dropdown'unda 30 daire görünmeli.

## 🔧 Sorun Giderme

### Build Hatası

**Kontrol:**
- Node.js versiyonu 20.18.0 mı?
- `.nvmrc` dosyaları var mı?
- Build command doğru mu?

### Google Sheets Bağlantı Hatası

**Kontrol:**
- GOOGLE_SERVICE_ACCOUNT environment variable var mı?
- GOOGLE_SPREADSHEET_ID doğru mu?
- Service Account Sheets dosyasına erişim izni var mı?

### Daire Listesi Boş

**Kontrol:**
- `/api/apartment/blocks` endpoint çalışıyor mu?
- Google Sheets'te 30 daire var mı?
- Frontend'te API URL doğru mu? (Production'da `/api` olmalı)

---

**Tüm kontroller tamamlandı! Deploy edilmeye hazır! 🚀**

