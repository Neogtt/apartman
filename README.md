# 🏢 Apartman Görevlisi Sipariş Yönetim Sistemi

Ev sahipleri ve apartman görevlisi için sipariş yönetim uygulaması.

## 📋 Özellikler

- 🏠 **3 Blok Sistemi**: A, B, C blokları - her blokta 10 daire
- 🔐 **Şifreli Giriş**: Her daire için şifre ile giriş
- 📝 **Otomatik Daire Tanıma**: Giriş yapan kullanıcının daire numarası otomatik doldurulur
- 🗑️ **Çöp Alma Seçeneği**: Çöp alma işaretlenirse görevli kapıyı çalmaz
- 🏢 **Görevli Paneli**: Tüm siparişleri görüntüleme ve yönetme
- 📊 **İstatistikler**: Toplam, bekleyen, tamamlanan sipariş sayıları
- 🔍 **Arama ve Filtreleme**: Daire numarası veya sipariş metni ile arama
- 📱 **Mobil Uyumlu**: Telefon ve tablette çalışır

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle

```bash
cd ~/apartman
npm run install-all
```

### 2. Programı Başlat

**Geliştirme Modu:**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
npm run client
```

**Production Modu:**
```bash
# Önce build al
npm run build

# Sonra başlat
npm start
```

## 🌐 Kullanım

1. Tarayıcıda açın: `http://localhost:3000`
2. **Giriş**: Daire numaranızı seçin ve şifrenizi girin (ilk girişte şifre otomatik oluşturulur)
3. **Sipariş Ver**: Ev sahipleri sipariş verebilir
4. **Görevli Paneli**: Görevli tüm siparişleri görüntüleyip yönetebilir

## 📁 Veri Depolama

- Siparişler: `temp/apartment-orders.json`
- Kullanıcılar: `temp/apartment-users.json`

## 🔧 Teknolojiler

- **Backend**: Node.js, Express
- **Frontend**: React
- **Veri Depolama**: JSON dosyaları

## 📝 Notlar

- Veriler `temp/` klasöründe saklanır
- Backend port: 3002
- Frontend port: 3000
- Her daire için ilk girişte şifre otomatik oluşturulur

## 🚀 GitHub'a Deploy

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/Neogtt/apartman.git
git branch -M main
git push -u origin main
```
