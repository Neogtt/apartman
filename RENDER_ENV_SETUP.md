# 🔧 Render.com Environment Variables Kurulumu

Bu dosya, Render.com'da environment variables'ları nasıl ekleyeceğinizi adım adım açıklar.

## 📋 Eklenmesi Gereken Environment Variables

### 1. GOOGLE_SERVICE_ACCOUNT

**Değer**: Service Account JSON dosyasının tam içeriği (tek satır)

**Nasıl Alınır:**
1. Proje kök dizinindeki `.env` dosyasını açın
2. `GOOGLE_SERVICE_ACCOUNT=` satırından sonraki tüm JSON string'i kopyalayın
3. VEYA `apartman-478208-68a810deb298.json` dosyasını açın ve tüm içeriği kopyalayın

**Önemli:**
- JSON'u tek satır olarak yapıştırın
- Tırnak işaretlerini kaldırmayın
- `\n` karakterleri JSON içinde olmalı

**Örnek Format:**
```
{"type":"service_account","project_id":"apartman-478214","private_key_id":"7bc18d4503ddaed07dc1d3800721f6d562d399ce","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCvvTVzMvsmbPpk\n...","client_email":"apartman@apartman-478214.iam.gserviceaccount.com",...}
```

### 2. GOOGLE_SPREADSHEET_ID

**Değer**: `1USqMZ7nRtrfN7pUSt100W9UI97ytFmM-UB41M3mO70c`

### 3. NODE_ENV

**Değer**: `production`

### 4. PORT (Opsiyonel)

**Değer**: `3002` (Render otomatik atayabilir)

## 🚀 Render.com'da Environment Variables Ekleme

### Adım 1: Service Sayfasına Git

1. Render Dashboard açın: https://dashboard.render.com
2. Servisinize tıklayın (`apartman-gorevlisi` veya oluşturduğunuz isim)

### Adım 2: Environment Sekmesine Git

Sol menüden **"Environment"** sekmesine tıklayın

### Adım 3: Environment Variables Ekle

Her bir variable için:

1. **"Add Environment Variable"** butonuna tıklayın
2. **Key** alanına variable adını yazın
3. **Value** alanına değeri yapıştırın
4. **"Save Changes"** butonuna tıklayın

**Sırayla Ekleyin:**

#### 1. GOOGLE_SERVICE_ACCOUNT
- **Key**: `GOOGLE_SERVICE_ACCOUNT`
- **Value**: JSON dosyasının tam içeriği (çok uzun olacak, sorun değil)
- ⚠️ **ÖNEMLİ**: Tırnak işaretlerini kaldırmayın, olduğu gibi yapıştırın

#### 2. GOOGLE_SPREADSHEET_ID
- **Key**: `GOOGLE_SPREADSHEET_ID`
- **Value**: `1USqMZ7nRtrfN7pUSt100W9UI97ytFmM-UB41M3mO70c`

#### 3. NODE_ENV
- **Key**: `NODE_ENV`
- **Value**: `production`

#### 4. PORT (Opsiyonel)
- **Key**: `PORT`
- **Value**: `3002`

### Adım 4: Servisi Yeniden Başlat

Environment variables ekledikten sonra:

1. Sağ üstteki **"Manual Deploy"** → **"Deploy latest commit"** tıklayın
2. VEYA servisi **"Restart"** edin

## ✅ Kontrol

Deploy tamamlandıktan sonra:

1. **Logs** sekmesine gidin
2. Şu mesajı görmelisiniz:
   ```
   ✅ Google Sheets API başarıyla başlatıldı
   🚀 Apartman Görevlisi Server çalışıyor
   ```

3. Tarayıcıda test edin:
   ```
   https://your-service.onrender.com/api/health
   ```

## 🐛 Sorun Giderme

### JSON Parse Hatası

**Problem**: "JSON parse hatası" görüyorsunuz
**Çözüm**: 
- JSON'un tek satır olduğundan emin olun
- Tırnak işaretlerinin JSON içinde olduğundan emin olun
- Özel karakterlerin kaçışlandığından emin olun

### Google Sheets Bağlantı Hatası

**Problem**: "Google Sheets API başlatılamadı"
**Çözüm**: 
- `GOOGLE_SERVICE_ACCOUNT` değerini kontrol edin
- `GOOGLE_SPREADSHEET_ID` değerini kontrol edin
- Service Account'un Sheets dosyasına erişim izni olduğundan emin olun

### Değer Çok Uzun Görünüyor

**Problem**: Render'da GOOGLE_SERVICE_ACCOUNT değeri çok uzun
**Çözüm**: 
- Bu normal! JSON çok uzun olacak, sorun değil
- Render text area'da tam görünmeyebilir ama kaydedilecek

## 📝 Notlar

- ⚠️ Environment variables'ları render.yaml dosyasına **Ekleme** (güvenlik sorunu)
- ✅ Render Dashboard'dan manuel ekleyin
- ✅ Değişiklikler için servisi yeniden başlatmanız gerekebilir
- ✅ Environment variables'lar şifrelenmiş olarak saklanır

---

**Hazır! Artık Render.com'da deploy edebilirsiniz! 🚀**

