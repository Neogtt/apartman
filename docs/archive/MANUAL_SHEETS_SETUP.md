# 📊 Manuel Google Sheets Kurulumu

Depolama kotası dolduğu için otomatik oluşturma çalışmıyor. Manuel olarak Sheets dosyası oluşturabilirsiniz.

## Adımlar

### 1. Google Sheets'te Yeni Dosya Oluşturma

1. [Google Sheets](https://sheets.google.com/) açın
2. **Boş** bir spreadsheet oluşturun
3. Dosya adını değiştirin: **Apartman Verileri**

### 2. Dosyayı Drive Klasörüne Taşıma

1. Oluşturduğunuz Sheets dosyasını açın
2. Üst kısımdaki **Dosya > Taşı** (Move) seçin
3. Veya dosyaya sağ tıklayıp **Taşı** seçin
4. Klasör ID'sini girin veya **APARTMAN** klasörünü seçin: `1qKCHl9uP-Dkyeu7MerTNAiAQ0Ie5lPIT`

### 3. Spreadsheet ID'yi Alma

1. Google Sheets dosyasının URL'sinden ID'yi kopyalayın
2. URL şu şekilde olacak: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
3. **SPREADSHEET_ID** kısmını kopyalayın

### 4. Sheet'leri (Sekmeleri) Oluşturma

#### Orders Sekmesi:
1. Alt kısımdaki "+" ile yeni sheet ekleyin
2. Adını "Orders" yapın
3. A1-J1 hücrelerine şu başlıkları ekleyin:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| id | apartmentNumber | orderText | contactInfo | isTrashCollection | orderType | orderTimeMessage | status | createdAt | updatedAt |

#### Apartments Sekmesi:
1. Yeni sheet ekleyin, adını "Apartments" yapın
2. A1-B1 hücrelerine:

| A | B |
|---|---|
| number | contactInfo |

#### Users Sekmesi:
1. Yeni sheet ekleyin, adını "Users" yapın
2. A1-D1 hücrelerine:

| A | B | C | D |
|---|---|---|---|
| id | apartmentNumber | password | createdAt |

### 5. İlk Sheet'i Silme

İlk varsayılan "Sheet1" sheet'ini silebilirsiniz (sağ tık > Sil)

### 6. Service Account'a İzin Verme

1. Sheets dosyasının sağ üst köşesindeki **Share** butonuna tıklayın
2. Bu email'i ekleyin: **apartman@apartman-478214.iam.gserviceaccount.com**
3. İzin seviyesini **Editor** olarak ayarlayın
4. **Send** tıklayın

### 7. Environment Variable Güncelleme

`.env` dosyasında `GOOGLE_SPREADSHEET_ID` değerini ayarlayın:

```bash
GOOGLE_SPREADSHEET_ID=olusturdugunuz_spreadsheet_id_buraya
```

Veya script ile güncelleyin:
```bash
# .env dosyasını düzenleyin ve GOOGLE_SPREADSHEET_ID satırını ekleyin/güncelleyin
```

### 8. Mevcut Verileri Aktarma (Opsiyonel)

Eğer yerel JSON dosyalarında veri varsa:

```bash
npm run migrate-sheets
```

Bu script mevcut verileri Google Sheets'e aktaracaktır.

## ✅ Kontrol

1. Sheets dosyası oluşturuldu
2. 3 sekme var: Orders, Apartments, Users
3. Her sekmede başlık satırları var
4. Service Account'a izin verildi
5. GOOGLE_SPREADSHEET_ID .env dosyasına eklendi

## 🎉 Tamamlandı!

Artık verileriniz Google Sheets'te saklanacak!

