const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '../../temp/apartment-orders.json');
const USERS_FILE = path.join(__dirname, '../../temp/apartment-users.json');

// Veri dosyasını başlat
function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      orders: [],
      apartments: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Kullanıcı dosyasını başlat
function initUsersFile() {
  if (!fs.existsSync(USERS_FILE)) {
    const initialUsers = {
      users: []
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2));
  }
}

// Kullanıcı verilerini oku
function readUsers() {
  initUsersFile();
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Kullanıcı okuma hatası:', error);
    return { users: [] };
  }
}

// Kullanıcı verilerine yaz
function writeUsers(data) {
  initUsersFile();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Kullanıcı yazma hatası:', error);
    return false;
  }
}

// Veri dosyasını oku
function readData() {
  initDataFile();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Veri okuma hatası:', error);
    return { orders: [], apartments: [] };
  }
}

// Veri dosyasına yaz
function writeData(data) {
  initDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Veri yazma hatası:', error);
    return false;
  }
}

// Tüm siparişleri getir
router.get('/orders', (req, res) => {
  try {
    const data = readData();
    // Tarihe göre sırala (en yeni önce)
    data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(data.orders);
  } catch (error) {
    res.status(500).json({ error: 'Siparişler getirilemedi', details: error.message });
  }
});

// Belirli bir dairenin siparişlerini getir
router.get('/orders/apartment/:apartmentNumber', (req, res) => {
  try {
    const { apartmentNumber } = req.params;
    const data = readData();
    const apartmentOrders = data.orders.filter(
      order => order.apartmentNumber === apartmentNumber
    );
    apartmentOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(apartmentOrders);
  } catch (error) {
    res.status(500).json({ error: 'Siparişler getirilemedi', details: error.message });
  }
});

// Yeni sipariş ekle
router.post('/orders', (req, res) => {
  try {
    const { apartmentNumber, orderText, contactInfo, isTrashCollection } = req.body;
    
    if (!apartmentNumber || !orderText) {
      return res.status(400).json({ error: 'Daire numarası ve sipariş metni gereklidir' });
    }

    const data = readData();
    const newOrder = {
      id: uuidv4(),
      apartmentNumber: apartmentNumber.toString(),
      orderText,
      contactInfo: contactInfo || '',
      isTrashCollection: isTrashCollection || false,
      status: 'pending', // pending, completed, cancelled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.orders.push(newOrder);
    
    // Daire listesine ekle (yoksa)
    if (!data.apartments.find(apt => apt.number === apartmentNumber.toString())) {
      data.apartments.push({
        number: apartmentNumber.toString(),
        contactInfo: contactInfo || ''
      });
    }

    if (writeData(data)) {
      res.status(201).json(newOrder);
    } else {
      res.status(500).json({ error: 'Sipariş kaydedilemedi' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Sipariş eklenemedi', details: error.message });
  }
});

// Kullanıcı kayıt/giriş
router.post('/auth/login', (req, res) => {
  try {
    const { apartmentNumber, password } = req.body;
    
    if (!apartmentNumber || !password) {
      return res.status(400).json({ error: 'Daire numarası ve şifre gereklidir' });
    }

    const usersData = readUsers();
    const apartmentKey = apartmentNumber.toString().toUpperCase();
    
    // Kullanıcı var mı kontrol et
    let user = usersData.users.find(u => u.apartmentNumber === apartmentKey);
    
    if (!user) {
      // Yeni kullanıcı oluştur
      user = {
        id: uuidv4(),
        apartmentNumber: apartmentKey,
        password: password, // Basit şifre (production'da hash'lenmeli)
        createdAt: new Date().toISOString()
      };
      usersData.users.push(user);
      writeUsers(usersData);
    } else {
      // Şifre kontrolü
      if (user.password !== password) {
        return res.status(401).json({ error: 'Şifre hatalı' });
      }
    }

    // Şifreyi response'da gönderme
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword,
      apartmentNumber: user.apartmentNumber
    });
  } catch (error) {
    res.status(500).json({ error: 'Giriş hatası', details: error.message });
  }
});

// Blok ve daire listesi
router.get('/blocks', (req, res) => {
  try {
    const blocks = ['A', 'B', 'C'];
    const apartmentsPerBlock = 10;
    const apartments = [];
    
    blocks.forEach(block => {
      for (let i = 1; i <= apartmentsPerBlock; i++) {
        apartments.push({
          value: `${block}${i}`,
          label: `${block} Blok - Daire ${i}`
        });
      }
    });
    
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ error: 'Bloklar getirilemedi', details: error.message });
  }
});

// Görevli giriş
router.post('/auth/staff-login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir' });
    }

    // Görevli bilgileri (production'da veritabanından alınmalı)
    const STAFF_CREDENTIALS = {
      username: 'gorevli1',
      password: '123456'
    };

    if (username === STAFF_CREDENTIALS.username && password === STAFF_CREDENTIALS.password) {
      res.json({
        success: true,
        message: 'Giriş başarılı',
        user: {
          username: STAFF_CREDENTIALS.username,
          role: 'staff'
        }
      });
    } else {
      res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Giriş hatası', details: error.message });
  }
});

// Sipariş durumunu güncelle
router.patch('/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Geçerli bir durum gereklidir (pending, completed, cancelled)' });
    }

    const data = readData();
    const orderIndex = data.orders.findIndex(order => order.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    data.orders[orderIndex].status = status;
    data.orders[orderIndex].updatedAt = new Date().toISOString();

    if (writeData(data)) {
      res.json(data.orders[orderIndex]);
    } else {
      res.status(500).json({ error: 'Sipariş güncellenemedi' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Sipariş güncellenemedi', details: error.message });
  }
});

// Sipariş sil
router.delete('/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const orderIndex = data.orders.findIndex(order => order.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    data.orders.splice(orderIndex, 1);

    if (writeData(data)) {
      res.json({ message: 'Sipariş silindi' });
    } else {
      res.status(500).json({ error: 'Sipariş silinemedi' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Sipariş silinemedi', details: error.message });
  }
});

// Tüm daireleri getir
router.get('/apartments', (req, res) => {
  try {
    const data = readData();
    res.json(data.apartments);
  } catch (error) {
    res.status(500).json({ error: 'Daireler getirilemedi', details: error.message });
  }
});

// İstatistikler
router.get('/stats', (req, res) => {
  try {
    const data = readData();
    const stats = {
      totalOrders: data.orders.length,
      pendingOrders: data.orders.filter(o => o.status === 'pending').length,
      completedOrders: data.orders.filter(o => o.status === 'completed').length,
      totalApartments: data.apartments.length,
      apartmentsWithPendingOrders: new Set(
        data.orders.filter(o => o.status === 'pending').map(o => o.apartmentNumber)
      ).size
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'İstatistikler getirilemedi', details: error.message });
  }
});

module.exports = router;

