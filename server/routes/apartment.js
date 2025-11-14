const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const sheetsService = require('../services/sheetsService');

// Tüm siparişleri getir
router.get('/orders', async (req, res) => {
  try {
    const data = await sheetsService.readData();
    // Tarihe göre sırala (en yeni önce)
    data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(data.orders);
  } catch (error) {
    res.status(500).json({ error: 'Siparişler getirilemedi', details: error.message });
  }
});

// Belirli bir dairenin siparişlerini getir
router.get('/orders/apartment/:apartmentNumber', async (req, res) => {
  try {
    const { apartmentNumber } = req.params;
    const data = await sheetsService.readData();
    const apartmentOrders = data.orders.filter(
      order => order.apartmentNumber === apartmentNumber
    );
    apartmentOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(apartmentOrders);
  } catch (error) {
    res.status(500).json({ error: 'Siparişler getirilemedi', details: error.message });
  }
});

// Sipariş saat kontrolü (GMT+3)
function getOrderTimeInfo() {
  // GMT+3 saat dilimi
  const now = new Date();
  const gmt3Time = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Istanbul"}));
  const hours = gmt3Time.getHours();
  const minutes = gmt3Time.getMinutes();
  const currentTime = hours * 60 + minutes; // Dakika cinsinden

  // Sipariş saatleri (dakika cinsinden)
  const MORNING_END = 7 * 60 + 30; // 07:30
  const LUNCH_END = 15 * 60; // 15:00
  const EVENING_END = 18 * 60 + 30; // 18:30
  const NIGHT_START = 19 * 60; // 19:00

  let orderType = '';
  let message = '';
  let canOrder = true;

  if (currentTime >= NIGHT_START || currentTime < MORNING_END) {
    // 19:00 - 07:30: Sabah siparişi (ertesi gün)
    orderType = 'morning';
    message = 'Ertesi gün sabah siparişi veriyorsunuz';
    canOrder = true;
  } else if (currentTime >= MORNING_END && currentTime < LUNCH_END) {
    // 07:30 - 15:00: Öğlen siparişi
    orderType = 'lunch';
    message = 'Öğlen için sipariş veriyorsunuz';
    canOrder = true;
  } else if (currentTime >= LUNCH_END && currentTime < EVENING_END) {
    // 15:00 - 18:30: Akşam siparişi
    orderType = 'evening';
    message = 'Akşam için sipariş veriyorsunuz (18:30\'a kadar)';
    canOrder = true;
  } else {
    // 18:30 - 19:00: Sipariş kabul edilmez
    orderType = 'closed';
    message = 'Sipariş kabul saatleri dışındasınız. Lütfen 19:00\'dan sonra tekrar deneyin.';
    canOrder = false;
  }

  return {
    canOrder,
    orderType,
    message,
    currentTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    timeZone: 'GMT+3'
  };
}

// Yeni sipariş ekle
router.post('/orders', async (req, res) => {
  try {
    const { apartmentNumber, orderText, contactInfo, isTrashCollection } = req.body;
    
    if (!apartmentNumber || !orderText) {
      return res.status(400).json({ error: 'Daire numarası ve sipariş metni gereklidir' });
    }

    // Sipariş saat kontrolü
    const timeInfo = getOrderTimeInfo();
    if (!timeInfo.canOrder) {
      return res.status(400).json({ 
        error: timeInfo.message,
        timeInfo: timeInfo
      });
    }

    const data = await sheetsService.readData();
    const newOrder = {
      id: uuidv4(),
      apartmentNumber: apartmentNumber.toString(),
      orderText,
      contactInfo: contactInfo || '',
      isTrashCollection: isTrashCollection || false,
      orderType: timeInfo.orderType, // morning, lunch, evening
      orderTimeMessage: timeInfo.message,
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

    const success = await sheetsService.writeData(data);
    if (success) {
      res.status(201).json({
        ...newOrder,
        timeInfo: timeInfo
      });
    } else {
      res.status(500).json({ error: 'Sipariş kaydedilemedi' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Sipariş eklenemedi', details: error.message });
  }
});

// Sipariş saat bilgisi endpoint
router.get('/order-time-info', (req, res) => {
  try {
    const timeInfo = getOrderTimeInfo();
    res.json(timeInfo);
  } catch (error) {
    res.status(500).json({ error: 'Saat bilgisi alınamadı', details: error.message });
  }
});

// Kullanıcı kayıt/giriş
router.post('/auth/login', async (req, res) => {
  try {
    const { apartmentNumber, password } = req.body;
    
    if (!apartmentNumber || !password) {
      return res.status(400).json({ error: 'Daire numarası ve şifre gereklidir' });
    }

    const usersData = await sheetsService.readUsersData();
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
      await sheetsService.writeUsersData(usersData);
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
router.patch('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Geçerli bir durum gereklidir (pending, completed, cancelled)' });
    }

    const data = await sheetsService.readData();
    const orderIndex = data.orders.findIndex(order => order.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    data.orders[orderIndex].status = status;
    data.orders[orderIndex].updatedAt = new Date().toISOString();

    const success = await sheetsService.writeData(data);
    if (success) {
      res.json(data.orders[orderIndex]);
    } else {
      res.status(500).json({ error: 'Sipariş güncellenemedi' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Sipariş güncellenemedi', details: error.message });
  }
});

// Sipariş sil
router.delete('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await sheetsService.readData();
    const orderIndex = data.orders.findIndex(order => order.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    data.orders.splice(orderIndex, 1);

    const success = await sheetsService.writeData(data);
    if (success) {
      res.json({ message: 'Sipariş silindi' });
    } else {
      res.status(500).json({ error: 'Sipariş silinemedi' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Sipariş silinemedi', details: error.message });
  }
});

// Tüm daireleri getir
router.get('/apartments', async (req, res) => {
  try {
    const data = await sheetsService.readData();
    res.json(data.apartments);
  } catch (error) {
    res.status(500).json({ error: 'Daireler getirilemedi', details: error.message });
  }
});

// İstatistikler
router.get('/stats', async (req, res) => {
  try {
    const data = await sheetsService.readData();
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

