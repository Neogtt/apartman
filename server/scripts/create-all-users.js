#!/usr/bin/env node

/**
 * Tüm daireler için kullanıcı oluşturma script'i
 * Her daire için password: 123456
 */

require('dotenv').config();
const sheetsService = require('../services/sheetsService');
const { v4: uuidv4 } = require('uuid');

async function createAllUsers() {
  console.log('🚀 Tüm daireler için kullanıcılar oluşturuluyor...\n');

  try {
    // Google Sheets bağlantısını kontrol et
    const initialized = await sheetsService.ensureInitialized();
    if (!initialized) {
      console.error('❌ Google Sheets bağlantısı kurulamadı!');
      process.exit(1);
    }

    console.log('✅ Google Sheets bağlantısı başarılı\n');

    // Tüm daireleri al
    const apartmentsData = await sheetsService.readData();
    const allApartments = apartmentsData.apartments.map(apt => apt.number.toUpperCase());

    console.log(`📋 ${allApartments.length} daire bulundu\n`);

    // Mevcut kullanıcıları al
    const usersData = await sheetsService.readUsersData();
    const existingUsers = new Set(
      usersData.users.map(user => user.apartmentNumber.toUpperCase())
    );

    console.log(`👥 ${usersData.users.length} mevcut kullanıcı bulundu\n`);

    // Yeni kullanıcılar oluştur
    let created = 0;
    let updated = 0;
    const defaultPassword = '123456';

    allApartments.forEach(apartmentNumber => {
      const aptKey = apartmentNumber.toUpperCase();
      const existingUser = usersData.users.find(
        u => u.apartmentNumber.toUpperCase() === aptKey
      );

      if (!existingUser) {
        // Yeni kullanıcı oluştur
        usersData.users.push({
          id: uuidv4(),
          apartmentNumber: aptKey,
          password: defaultPassword,
          createdAt: new Date().toISOString()
        });
        created++;
      } else {
        // Mevcut kullanıcının şifresini güncelle
        existingUser.password = defaultPassword;
        updated++;
      }
    });

    // Alfabetik sırala
    usersData.users.sort((a, b) => {
      const aBlock = a.apartmentNumber.charAt(0);
      const bBlock = b.apartmentNumber.charAt(0);
      const aNum = parseInt(a.apartmentNumber.substring(1)) || 0;
      const bNum = parseInt(b.apartmentNumber.substring(1)) || 0;
      
      if (aBlock !== bBlock) {
        return aBlock.localeCompare(bBlock);
      }
      return aNum - bNum;
    });

    // Google Sheets'e yaz
    console.log('📤 Google Sheets\'e yazılıyor...\n');
    const success = await sheetsService.writeUsersData(usersData);

    if (success) {
      console.log('✅ Başarılı!\n');
      console.log(`   ✓ ${created} yeni kullanıcı oluşturuldu`);
      console.log(`   🔄 ${updated} mevcut kullanıcının şifresi güncellendi`);
      console.log(`   📊 Toplam ${usersData.users.length} kullanıcı Google Sheets'te\n`);
      console.log('🔑 Tüm daireler için şifre: 123456\n');
      console.log('🎉 Tüm kullanıcılar oluşturuldu!');
      console.log(`📊 Kontrol edin: https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SPREADSHEET_ID || 'GOOGLE_SPREADSHEET_ID'}/edit`);
    } else {
      console.error('❌ Google Sheets\'e yazılamadı!');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createAllUsers();

