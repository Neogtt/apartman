#!/usr/bin/env node

/**
 * Mevcut JSON verilerini Google Sheets'e aktarma script'i
 * 
 * Kullanım:
 *   node server/scripts/migrate-to-sheets.js
 * 
 * Önkoşullar:
 *   - GOOGLE_SERVICE_ACCOUNT environment variable ayarlanmış olmalı
 *   - GOOGLE_SPREADSHEET_ID environment variable ayarlanmış olmalı
 *   - Google Sheet oluşturulmuş ve Service Account'a izin verilmiş olmalı
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const sheetsService = require('../services/sheetsService');

const DATA_FILE = path.join(__dirname, '../../temp/apartment-orders.json');
const USERS_FILE = path.join(__dirname, '../../temp/apartment-users.json');

async function migrateData() {
  console.log('🚀 Google Sheets\'e veri aktarımı başlıyor...\n');

  // Google Sheets bağlantısını kontrol et
  const initialized = await sheetsService.ensureInitialized();
  if (!initialized) {
    console.error('❌ Google Sheets bağlantısı kurulamadı!');
    console.error('Lütfen GOOGLE_SERVICE_ACCOUNT ve GOOGLE_SPREADSHEET_ID environment variable\'larını kontrol edin.');
    process.exit(1);
  }

  console.log('✅ Google Sheets bağlantısı başarılı\n');

  // JSON dosyalarından verileri oku
  let ordersData = { orders: [], apartments: [] };
  let usersData = { users: [] };

  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      ordersData = JSON.parse(data);
      console.log(`📦 ${ordersData.orders.length} sipariş bulundu`);
      console.log(`🏠 ${ordersData.apartments.length} daire bulundu\n`);
    } else {
      console.log('⚠️  apartment-orders.json dosyası bulunamadı, boş veri ile devam ediliyor\n');
    }

    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      usersData = JSON.parse(data);
      console.log(`👥 ${usersData.users.length} kullanıcı bulundu\n`);
    } else {
      console.log('⚠️  apartment-users.json dosyası bulunamadı, boş veri ile devam ediliyor\n');
    }
  } catch (error) {
    console.error('❌ JSON dosyaları okunurken hata:', error.message);
    process.exit(1);
  }

  // Verileri Google Sheets'e yaz
  try {
    console.log('📤 Veriler Google Sheets\'e yazılıyor...\n');

    // Siparişler ve daireler
    if (ordersData.orders.length > 0 || ordersData.apartments.length > 0) {
      const success = await sheetsService.writeData(ordersData);
      if (success) {
        console.log(`✅ ${ordersData.orders.length} sipariş aktarıldı`);
        console.log(`✅ ${ordersData.apartments.length} daire aktarıldı\n`);
      } else {
        console.error('❌ Siparişler ve daireler aktarılamadı');
      }
    } else {
      console.log('ℹ️  Aktarılacak sipariş/daire verisi yok\n');
    }

    // Kullanıcılar
    if (usersData.users.length > 0) {
      const success = await sheetsService.writeUsersData(usersData);
      if (success) {
        console.log(`✅ ${usersData.users.length} kullanıcı aktarıldı\n`);
      } else {
        console.error('❌ Kullanıcılar aktarılamadı');
      }
    } else {
      console.log('ℹ️  Aktarılacak kullanıcı verisi yok\n');
    }

    console.log('🎉 Veri aktarımı tamamlandı!');
    console.log('📊 Google Sheets\'inizi kontrol edin: https://docs.google.com/spreadsheets/d/' + process.env.GOOGLE_SPREADSHEET_ID);
    
  } catch (error) {
    console.error('❌ Veri aktarımı sırasında hata:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Script'i çalıştır
migrateData().catch(error => {
  console.error('❌ Beklenmeyen hata:', error);
  process.exit(1);
});

