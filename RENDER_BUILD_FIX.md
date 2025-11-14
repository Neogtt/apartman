# 🔧 Render.com Build Hatası Çözümü

## ❌ Sorun

Build sırasında şu hata alıyorsunuz:
```
SecurityError: Cannot initialize local storage without a `--localstorage-file` path
```

Bu, Node.js 25.2.0 versiyonundaki bir sorundan kaynaklanıyor.

## ✅ Çözüm

### 1. Node.js Versiyonunu Sabitleme

`package.json` dosyasında Node.js versiyonunu sabitledik:
```json
"engines": {
  "node": "20.18.0",
  "npm": ">=9.0.0"
}
```

### 2. render.yaml Güncelleme

`render.yaml` dosyasını güncelledik:
- `nodeVersion: 20.18.0` eklendi
- Build command'a `NODE_OPTIONS=--openssl-legacy-provider` eklendi

### 3. .nvmrc Dosyası

Hem root hem de `client/` klasörüne `.nvmrc` dosyası ekledik:
```
20.18.0
```

Bu dosya Render'ın Node.js versiyonunu otomatik algılamasını sağlar.

### 4. Render.com'da Ayarlar

Eğer `render.yaml` kullanmıyorsanız, Render Dashboard'dan manuel ayarlayın:

1. **Render Dashboard** → Your Service → **Settings**
2. **Environment** sekmesine gidin
3. **Build Command** güncelle:
   ```
   npm install && cd client && npm install && NODE_OPTIONS=--no-experimental-fetch npm run build && cd ..
   ```
4. **Node Version** ayarla: `20.18.0` (veya Environment Variables'dan `NODE_VERSION=20.18.0`)
5. **Environment Variable** ekle:
   - Key: `NODE_OPTIONS`
   - Value: `--no-experimental-fetch`

### 4. Environment Variables (Opsiyonel)

Render Dashboard → Environment sekmesinde şunu ekleyin:
- **Key**: `NODE_VERSION`
- **Value**: `20.18.0`

## 🚀 Deploy

1. Değişiklikleri GitHub'a push yapın:
   ```bash
   git add .
   git commit -m "Fix: Node.js version to 20.18.0 for Render build"
   git push
   ```

2. Render.com'da **"Manual Deploy"** → **"Deploy latest commit"** tıklayın

3. Veya otomatik deploy bekle (GitHub push sonrası)

## ✅ Kontrol

Build loglarında şunu görmelisiniz:
```
==> Requesting Node.js version 20.18.0
==> Using Node.js version 20.18.0
```

Ve build başarılı olmalı! 🎉

## 📝 Notlar

- Node.js 20.18.0 LTS versiyonu (Long Term Support)
- Bu versiyon Render.com'da sorunsuz çalışır
- React build bu versiyonda localStorage hatası vermez

