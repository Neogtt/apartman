# 🔐 GitHub Authentication Kurulumu

GitHub'a sürekli bağlı kalmak için iki yöntem var. **SSH Key** yöntemi önerilir.

## 🔑 Yöntem 1: SSH Key (Önerilen - Daha Güvenli)

### Adım 1: SSH Key Oluşturma

Terminal'de şu komutu çalıştırın:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

**Sorular:**
- "Enter file in which to save the key": Enter'a basın (varsayılan yolu kullanın)
- "Enter passphrase": Enter'a basın (boş bırakabilirsiniz veya şifre koyabilirsiniz)

### Adım 2: SSH Agent'ı Başlatma

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Adım 3: SSH Key'i GitHub'a Ekleme

1. **Public key'i kopyalayın:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   Çıkan metni kopyalayın (örn: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...`)

2. **GitHub'a gidin:**
   - https://github.com/settings/keys
   - **"New SSH key"** butonuna tıklayın
   - **Title**: İstediğiniz bir isim (örn: "MacBook")
   - **Key**: Kopyaladığınız public key'i yapıştırın
   - **"Add SSH key"** tıklayın

### Adım 4: Git Remote'u SSH'a Çevir

```bash
cd /Users/kemalcelikkalkan/apartman
git remote set-url origin git@github.com:Neogtt/apartman.git
```

### Adım 5: Test Et

```bash
ssh -T git@github.com
```

**Beklenen cevap:** `Hi Neogtt! You've successfully authenticated...`

Artık `git push` yapabilirsiniz, şifre sorulmayacak! 🎉

---

## 🔑 Yöntem 2: Personal Access Token (PAT)

### Adım 1: Personal Access Token Oluşturma

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **"Generate new token (classic)"** tıklayın
3. **Note**: İstediğiniz bir isim (örn: "Render Deploy")
4. **Expiration**: Seçtiğiniz süre (90 days, 1 year, vb.)
5. **Scopes**: `repo` işaretleyin (tüm alt seçenekler otomatik işaretlenir)
6. **"Generate token"** tıklayın
7. **Token'ı kopyalayın** (bir daha göremeyeceksiniz!)

### Adım 2: Git Credential Helper Kurulumu

**macOS için:**
```bash
git config --global credential.helper osxkeychain
```

**Linux için:**
```bash
git config --global credential.helper cache
```

### Adım 3: İlk Push

```bash
cd /Users/kemalcelikkalkan/apartman
git push origin main
```

**Sorulduğunda:**
- **Username**: GitHub kullanıcı adınız (örn: Neogtt)
- **Password**: Oluşturduğunuz Personal Access Token'ı yapıştırın (şifre değil!)

İlk kez başarılı olduktan sonra macOS keychain'de saklanacak ve bir daha sormayacak.

---

## ✅ Hangisini Kullanmalıyım?

### SSH Key Önerilir Çünkü:
- ✅ Daha güvenli
- ✅ Süresiz (token süresi dolmaz)
- ✅ Şifre sorulmaz
- ✅ Daha pratik

### Personal Access Token İyi Çünkü:
- ✅ Daha hızlı kurulum
- ✅ HTTPS kullanır (bazı ağlarda SSH kapalı olabilir)
- ⚠️ Süresi dolabilir (yenilemeniz gerekebilir)

---

## 🔧 Sorun Giderme

### SSH Key Sorunları

**"Permission denied" hatası:**
```bash
# SSH key'i kontrol et
ls -la ~/.ssh/

# SSH agent'ı yeniden başlat
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# GitHub bağlantısını test et
ssh -T git@github.com
```

### Personal Access Token Sorunları

**"Authentication failed" hatası:**
- Token'ın süresi dolmuş olabilir → Yeni token oluşturun
- Token'ı şifre olarak kullandığınızdan emin olun (kullanıcı adı değil!)

**"credential helper" hatası:**
```bash
git config --global credential.helper osxkeychain
```

---

## 📝 Notlar

- SSH key kurulumu bir kez yapılır, sonra sorunsuz çalışır
- Personal Access Token kullanıyorsanız, token'ın süresini kontrol edin
- macOS'ta keychain otomatik şifreleri saklar

---

**Her iki yöntem de çalışır, SSH key önerilir! 🚀**

