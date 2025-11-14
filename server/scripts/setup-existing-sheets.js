#!/usr/bin/env node

/**
 * Mevcut bir Google Sheets dosyasına sheet'leri ve başlıkları ekleme script'i
 * 
 * Kullanım:
 *   GOOGLE_SPREADSHEET_ID=your_sheet_id node server/scripts/setup-existing-sheets.js
 * 
 * Önkoşullar:
 *   - GOOGLE_SERVICE_ACCOUNT environment variable ayarlanmış olmalı
 *   - GOOGLE_SPREADSHEET_ID environment variable ayarlanmış olmalı (veya komut satırından)
 *   - Sheets dosyası oluşturulmuş ve Service Account'a izin verilmiş olmalı
 */

require('dotenv').config();
const { google } = require('googleapis');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupExistingSheets() {
  console.log('📊 Mevcut Google Sheets dosyasına sheet\'ler ekleniyor...\n');

  // Google credentials kontrolü
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!credentials) {
    console.error('❌ GOOGLE_SERVICE_ACCOUNT environment variable bulunamadı!');
    process.exit(1);
  }

  let auth;
  try {
    const creds = JSON.parse(credentials);
    auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive'
      ],
    });
  } catch (error) {
    console.error('❌ Google credentials parse hatası:', error.message);
    process.exit(1);
  }

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  // Spreadsheet ID'yi al
  let spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  
  if (!spreadsheetId) {
    console.log('📋 Google Sheets dosyasının ID\'sini girin:');
    console.log('   URL\'den ID\'yi kopyalayın: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit');
    console.log('   Veya .env dosyasına GOOGLE_SPREADSHEET_ID ekleyin\n');
    const id = await question('Spreadsheet ID: ');
    spreadsheetId = id.trim();
    
    if (!spreadsheetId) {
      console.error('❌ Spreadsheet ID gerekli!');
      rl.close();
      process.exit(1);
    }
  }

  console.log(`\n📋 Spreadsheet ID: ${spreadsheetId}\n`);

  try {
    // Spreadsheet'in varlığını kontrol et
    console.log('🔍 Sheets dosyası kontrol ediliyor...');
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId
    });
    
    console.log('✅ Sheets dosyası bulundu:', spreadsheet.data.properties.title);
    console.log('📊 Mevcut sheet sayısı:', spreadsheet.data.sheets.length, '\n');

    // Mevcut sheet'leri kontrol et
    const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);
    console.log('📋 Mevcut sheet\'ler:', existingSheets.join(', '), '\n');

    // Sheet'leri ve başlıkları oluştur
    console.log('📝 Sheet\'ler oluşturuluyor...\n');

    // İlk varsayılan sheet'i sil (Sheet1)
    const defaultSheetId = spreadsheet.data.sheets[0].properties.sheetId;
    const defaultSheetTitle = spreadsheet.data.sheets[0].properties.title;
    
    if (defaultSheetTitle === 'Sheet1' && existingSheets.length === 1) {
      try {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: spreadsheetId,
          resource: {
            requests: [{
              deleteSheet: {
                sheetId: defaultSheetId
              }
            }]
          }
        });
        console.log('✅ Varsayılan Sheet1 silindi\n');
      } catch (error) {
        console.log('⚠️  Sheet1 silinemedi, devam ediliyor...\n');
      }
    }

    // Orders sheet'i oluştur
    if (!existingSheets.includes('Orders')) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Orders'
              }
            }
          }]
        }
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: 'Orders!A1:J1',
        valueInputOption: 'RAW',
        resource: {
          values: [[
            'id', 'apartmentNumber', 'orderText', 'contactInfo', 
            'isTrashCollection', 'orderType', 'orderTimeMessage', 
            'status', 'createdAt', 'updatedAt'
          ]]
        }
      });
      console.log('✅ Orders sheet\'i oluşturuldu ve başlıklar eklendi');
    } else {
      console.log('ℹ️  Orders sheet\'i zaten mevcut');
    }

    // Apartments sheet'i oluştur
    if (!existingSheets.includes('Apartments')) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Apartments'
              }
            }
          }]
        }
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: 'Apartments!A1:B1',
        valueInputOption: 'RAW',
        resource: {
          values: [['number', 'contactInfo']]
        }
      });
      console.log('✅ Apartments sheet\'i oluşturuldu ve başlıklar eklendi');
    } else {
      console.log('ℹ️  Apartments sheet\'i zaten mevcut');
    }

    // Users sheet'i oluştur
    if (!existingSheets.includes('Users')) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Users'
              }
            }
          }]
        }
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: 'Users!A1:D1',
        valueInputOption: 'RAW',
        resource: {
          values: [['id', 'apartmentNumber', 'password', 'createdAt']]
        }
      });
      console.log('✅ Users sheet\'i oluşturuldu ve başlıklar eklendi');
    } else {
      console.log('ℹ️  Users sheet\'i zaten mevcut');
    }

    console.log('\n🎉 Sheet\'ler başarıyla oluşturuldu!');
    console.log(`📊 Sheets dosyası: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
    console.log(`\n✅ GOOGLE_SPREADSHEET_ID=${spreadsheetId}`);
    console.log('💡 Bu ID\'yi .env dosyanıza ekleyin veya güncelleyin.\n');

  } catch (error) {
    console.error('❌ Hata oluştu:', error.message);
    if (error.response) {
      console.error('   HTTP Status:', error.response.status);
      console.error('   Detaylar:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 404) {
        console.error('\n💡 Spreadsheet ID\'si yanlış olabilir veya dosyaya erişim izniniz yok.');
      } else if (error.response.status === 403) {
        console.error('\n💡 Service Account\'a dosya erişim izni verilmemiş!');
        const creds = JSON.parse(credentials);
        console.error('   Lütfen Sheets dosyasını paylaşın:');
        console.error('   Email:', creds.client_email);
        console.error('   İzin: Editor');
      }
    } else {
      console.error('   Stack:', error.stack);
    }
    rl.close();
    process.exit(1);
  }

  rl.close();
}

setupExistingSheets().catch(error => {
  console.error('❌ Beklenmeyen hata:', error);
  rl.close();
  process.exit(1);
});

