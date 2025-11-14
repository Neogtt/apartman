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

Uygulama Google Sheets API kullanarak verileri bulutta tutar. Eğer Google Sheets yapılandırılmamışsa, veriler yerel `temp/` klasöründe JSON dosyalarında saklanır.

### ☁️ Google Sheets Kurulumu (Önerilen - Render.com için gerekli)

Render.com'da verilerin kalıcı olması için Google Sheets kullanılmalıdır.

#### 1. Google Cloud Console'da Proje Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Yeni bir proje oluşturun veya mevcut bir projeyi seçin
3. **APIs & Services > Library** bölümüne gidin
4. "Google Sheets API" arayın ve etkinleştirin

#### 2. Service Account Oluşturma

1. **APIs & Services > Credentials** bölümüne gidin
2. **Create Credentials > Service Account** seçin
3. Service Account için bir isim verin (örn: `apartman-sheets`)
4. **Create and Continue** tıklayın
5. Role kısmını boş bırakabilirsiniz, **Done** tıklayın

#### 3. Service Account Key'i İndirme

1. Oluşturduğunuz Service Account'a tıklayın
2. **Keys** sekmesine gidin
3. **Add Key > Create new key** seçin
4. Format olarak **JSON** seçin
5. İndirilen JSON dosyasını güvenli bir yerde saklayın

#### 4. Google Sheet Oluşturma ve İzin Verme

1. [Google Sheets](https://sheets.google.com/)'te yeni bir boş sheet oluşturun
2. Sheet'in adını hatırlayın (örn: `Apartman Verileri`)
3. Sheet'in URL'sinden **Spreadsheet ID**'yi kopyalayın:
   - URL şu şekilde olacak: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
4. Oluşturduğunuz Service Account'un email adresini bulun (JSON dosyasındaki `client_email` alanı)
5. Google Sheet'in sağ üst köşesindeki **Share** butonuna tıklayın
6. Service Account email'ini ekleyin ve **Editor** yetkisi verin
7. **Send** tıklayın (email göndermenize gerek yok)

#### 5. Environment Variables Ayarlama (Render.com)

1. Render.com'da servisinizin **Environment** sekmesine gidin
2. Aşağıdaki environment variable'ları ekleyin:

**GOOGLE_SERVICE_ACCOUNT**: İndirdiğiniz JSON dosyasının **tam içeriğini** buraya yapıştırın (tırnak işaretleri olmadan, tek satır olarak)

**GOOGLE_SPREADSHEET_ID**: Google Sheet'in ID'sini buraya yapıştırın

**Örnek:**
```
GOOGLE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

GOOGLE_SPREADSHEET_ID=1a2b3c4d5e6f7g8h9i0j
```

#### 6. Yerel Geliştirme İçin

Yerel geliştirme için `.env` dosyası oluşturun:

```bash
# .env dosyası
GOOGLE_SERVICE_ACCOUNT='{"type":"service_account",...}'
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
```

**Not**: `.env` dosyasını git'e commit etmeyin! `.gitignore` dosyasına ekleyin.

### 📋 Fallback (Yedek) Sistem

Eğer Google Sheets yapılandırılmamışsa, uygulama otomatik olarak yerel JSON dosyalarını kullanır:
- Siparişler: `temp/apartment-orders.json`
- Kullanıcılar: `temp/apartment-users.json`

## 🔧 Teknolojiler

- **Backend**: Node.js, Express
- **Frontend**: React
- **Veri Depolama**: Google Sheets API (Bulut) veya JSON dosyaları (Yerel)

## 📝 Notlar

- Google Sheets yapılandırılmışsa veriler bulutta tutulur (tüm cihazlardan erişilebilir)
- Google Sheets yapılandırılmamışsa veriler yerel `temp/` klasöründe saklanır
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
