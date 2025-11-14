#!/usr/bin/env node

/**
 * Tüm daireleri (3 blok x 10 daire = 30 daire) Google Sheets'e ekleme script'i
 */

require('dotenv').config();
const sheetsService = require('../services/sheetsService');

async function addAllApartments() {
  console.log('🚀 Tüm daireler Google Sheets\'e ekleniyor...\n');

  try {
    // Google Sheets bağlantısını kontrol et
    const initialized = await sheetsService.ensureInitialized();
    if (!initialized) {
      console.error('❌ Google Sheets bağlantısı kurulamadı!');
      process.exit(1);
    }

    console.log('✅ Google Sheets bağlantısı başarılı\n');

    // Tüm daireleri oluştur
    const blocks = ['A', 'B', 'C'];
    const apartmentsPerBlock = 10;
    const allApartments = [];

    blocks.forEach(block => {
      for (let i = 1; i <= apartmentsPerBlock; i++) {
        allApartments.push({
          number: `${block}${i}`,
          contactInfo: ''
        });
      }
    });

    console.log(`📋 ${allApartments.length} daire oluşturuluyor...\n`);

    // Mevcut verileri oku
    const data = await sheetsService.readData();

    // Mevcut daireleri bir Set'e koy (tekrar eklememek için)
    const existingApartments = new Set(
      data.apartments.map(apt => apt.number.toUpperCase())
    );

    // Yeni daireleri ekle (varsa atla)
    let added = 0;
    let skipped = 0;

    allApartments.forEach(apt => {
      const aptNumber = apt.number.toUpperCase();
      if (!existingApartments.has(aptNumber)) {
        data.apartments.push(apt);
        added++;
      } else {
        skipped++;
      }
    });

    // Alfabetik sırala
    data.apartments.sort((a, b) => {
      const aBlock = a.number.charAt(0);
      const bBlock = b.number.charAt(0);
      const aNum = parseInt(a.number.substring(1)) || 0;
      const bNum = parseInt(b.number.substring(1)) || 0;
      
      if (aBlock !== bBlock) {
        return aBlock.localeCompare(bBlock);
      }
      return aNum - bNum;
    });

    // Google Sheets'e yaz
    console.log('📤 Google Sheets\'e yazılıyor...\n');
    const success = await sheetsService.writeData(data);

    if (success) {
      console.log('✅ Başarılı!\n');
      console.log(`   ✓ ${added} yeni daire eklendi`);
      console.log(`   ⏭️  ${skipped} daire zaten mevcuttu (atlandı)`);
      console.log(`   📊 Toplam ${data.apartments.length} daire Google Sheets'te\n`);
      console.log('🎉 Tüm daireler Google Sheets\'e eklendi!');
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

addAllApartments();

