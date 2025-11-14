#!/usr/bin/env node

/**
 * Google Drive klasörüne yeni Sheets dosyası oluşturma script'i
 * 
 * Kullanım:
 *   node server/scripts/create-sheets-in-drive.js
 * 
 * Önkoşullar:
 *   - GOOGLE_SERVICE_ACCOUNT environment variable ayarlanmış olmalı
 *   - GOOGLE_DRIVE_FOLDER_ID environment variable ayarlanmış olmalı (veya komut satırından verilebilir)
 *   - Google Drive API etkinleştirilmiş olmalı
 */

require('dotenv').config();
const { google } = require('googleapis');
const readline = require('readline');

// Kullanıcıdan input almak için
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createSheetsInDrive() {
  console.log('🚀 Google Drive klasörüne Sheets dosyası oluşturuluyor...\n');

  // Google credentials kontrolü
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!credentials) {
    console.error('❌ GOOGLE_SERVICE_ACCOUNT environment variable bulunamadı!');
    console.error('Lütfen .env dosyasında veya environment variable olarak ayarlayın.');
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
  const drive = google.drive({ version: 'v3', auth: authClient });
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  // Drive folder ID'yi al
  let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  
  if (!folderId) {
    // Kullanıcıdan link al
    console.log('📁 Google Drive klasör linkinizi yapıştırın:');
    console.log('   Örnek: https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j');
    const driveLink = await question('Drive linki: ');
    
    // Link'ten folder ID'yi çıkar
    const folderIdMatch = driveLink.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (!folderIdMatch) {
      console.error('❌ Geçersiz Drive linki formatı!');
      console.error('Link şu formatta olmalı: https://drive.google.com/drive/folders/FOLDER_ID');
      rl.close();
      process.exit(1);
    }
    folderId = folderIdMatch[1];
  }

  console.log(`\n📂 Klasör ID: ${folderId}\n`);

  try {
    // Klasörün varlığını kontrol et
    try {
      const folderInfo = await drive.files.get({
        fileId: folderId,
        fields: 'id, name, mimeType'
      });
      console.log('✅ Klasör bulundu:', folderInfo.data.name || folderInfo.data.id);
      console.log('   MIME Type:', folderInfo.data.mimeType, '\n');
      
      // MIME type kontrolü - folder olmalı
      if (folderInfo.data.mimeType !== 'application/vnd.google-apps.folder') {
        console.warn('⚠️  Uyarı: Bu bir klasör değil, dosya gibi görünüyor!');
      }
    } catch (error) {
      console.error('❌ Klasör erişim hatası!');
      if (error.response) {
        console.error('   HTTP Status:', error.response.status);
        console.error('   Hata Detayı:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.status === 404) {
          console.error('\n💡 Çözüm:');
          console.error('   1. Klasör ID\'sinin doğru olduğundan emin olun');
          console.error('   2. Service Account email\'ine klasöre erişim izni verin:');
          console.error('      Email: apartman@apartman-478208.iam.gserviceaccount.com');
          console.error('      İzin: Editor (Düzenleyici)');
        } else if (error.response.status === 403) {
          console.error('\n💡 Çözüm:');
          console.error('   Service Account\'a klasör erişim izni verilmemiş!');
          console.error('   1. Google Drive klasörünüzü açın');
          console.error('   2. Share butonuna tıklayın');
          console.error('   3. Bu email\'i ekleyin: apartman@apartman-478208.iam.gserviceaccount.com');
          console.error('   4. Editor izni verin');
        }
      } else {
        console.error('   Hata:', error.message);
      }
      rl.close();
      process.exit(1);
    }

    // Yeni Sheets dosyası oluştur (klasör belirtmeden - root'ta oluşturulacak)
    console.log('📊 Yeni Sheets dosyası oluşturuluyor (Drive root\'ta)...');
    console.log('💡 Oluşturulduktan sonra dosyayı APARTMAN klasörüne taşımanız gerekecek.\n');
    
    const fileMetadata = {
      name: 'Apartman Verileri',
      mimeType: 'application/vnd.google-apps.spreadsheet'
      // parents belirtilmedi - root'ta oluşturulacak
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      fields: 'id, name, webViewLink'
    });

    const spreadsheetId = file.data.id;
    const fileLink = file.data.webViewLink;

    console.log('✅ Sheets dosyası oluşturuldu!');
    console.log(`📋 Dosya ID: ${spreadsheetId}`);
    console.log(`🔗 Link: ${fileLink}\n`);

    // Service Account'a Editor yetkisi ver
    try {
      const creds = JSON.parse(credentials);
      const serviceAccountEmail = creds.client_email;
      
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          role: 'writer',
          type: 'user',
          emailAddress: serviceAccountEmail
        }
      });
      console.log('✅ Service Account\'a izin verildi\n');
    } catch (error) {
      // İzin zaten varsa hata vermeyebilir
      console.log('ℹ️  İzin kontrolü yapıldı\n');
    }

    // Sheet'leri ve başlıkları oluştur
    console.log('📝 Sheet\'ler oluşturuluyor...\n');

    // Mevcut ilk sheet'i sil (Sheet1)
    try {
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId
      });
      
      const defaultSheetId = spreadsheet.data.sheets[0].properties.sheetId;
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
    } catch (error) {
      console.log('⚠️  Varsayılan sheet silinemedi, devam ediliyor...');
    }

    // Orders sheet'i oluştur
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
    console.log('✅ Orders sheet\'i oluşturuldu');

    // Apartments sheet'i oluştur
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
    console.log('✅ Apartments sheet\'i oluşturuldu');

    // Users sheet'i oluştur
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
    console.log('✅ Users sheet\'i oluşturuldu\n');

    console.log('🎉 Sheets dosyası başarıyla oluşturuldu!\n');
    console.log('📋 Şimdi yapmanız gerekenler:');
    console.log(`   1. Environment variable ekleyin: GOOGLE_SPREADSHEET_ID=${spreadsheetId}`);
    console.log(`   2. Google Sheet linkiniz: ${fileLink}`);
    console.log(`   3. Render.com'da veya .env dosyasında GOOGLE_SPREADSHEET_ID değerini ayarlayın\n`);

  } catch (error) {
    console.error('❌ Hata oluştu:', error.message);
    if (error.response) {
      console.error('Detaylar:', JSON.stringify(error.response.data, null, 2));
    }
    rl.close();
    process.exit(1);
  }

  rl.close();
}

// Script'i çalıştır
createSheetsInDrive().catch(error => {
  console.error('❌ Beklenmeyen hata:', error);
  rl.close();
  process.exit(1);
});

