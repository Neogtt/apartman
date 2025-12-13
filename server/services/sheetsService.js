const { google } = require('googleapis');

// Google Sheets API yapılandırması
let sheets = null;
let spreadsheetId = null;

// Google Sheets API'yi başlat
async function initializeSheets() {
  try {
    // Service Account bilgileri environment variable'lardan alınacak
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT;

    if (!credentials) {
      console.warn('⚠️  GOOGLE_SERVICE_ACCOUNT environment variable bulunamadı. JSON dosya sistemi kullanılacak.');
      return false;
    }

    let auth;
    try {
      // JSON string'i parse et
      const creds = JSON.parse(credentials);
      auth = new google.auth.GoogleAuth({
        credentials: creds,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    } catch (error) {
      console.error('❌ Google credentials parse hatası:', error.message);
      return false;
    }

    const authClient = await auth.getClient();
    sheets = google.sheets({ version: 'v4', auth: authClient });
    spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      console.warn('⚠️  GOOGLE_SPREADSHEET_ID environment variable bulunamadı.');
      return false;
    }

    console.log('✅ Google Sheets API başarıyla başlatıldı');
    return true;
  } catch (error) {
    console.error('❌ Google Sheets API başlatma hatası:', error.message);
    return false;
  }
}

// Sheet adlarını tanımla
const SHEETS = {
  ORDERS: 'Orders',
  APARTMENTS: 'Apartments',
  USERS: 'Users'
};

// Sheet'i başlat (başlık satırlarını ekle)
async function initSheet(sheetName, headers) {
  if (!sheets || !spreadsheetId) {
    return false;
  }

  try {
    // Sheet'in var olup olmadığını kontrol et
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });

    const sheetExists = spreadsheet.data.sheets.some(
      sheet => sheet.properties.title === sheetName
    );

    if (!sheetExists) {
      // Yeni sheet oluştur
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });
    }

    // Başlık satırlarını ekle
    const range = `${sheetName}!A1:${String.fromCharCode(64 + headers.length)}1`;
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    });

    if (!existingData.data.values || existingData.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        resource: {
          values: [headers],
        },
      });
    }

    return true;
  } catch (error) {
    console.error(`Sheet ${sheetName} başlatma hatası:`, error.message);
    return false;
  }
}

// İlk başlatma
let isInitialized = false;
async function ensureInitialized() {
  if (!isInitialized) {
    isInitialized = await initializeSheets();
    if (isInitialized) {
      // Sheet'leri başlat
      await initSheet(SHEETS.ORDERS, [
        'id', 'apartmentNumber', 'orderText', 'contactInfo',
        'isTrashCollection', 'orderType', 'orderTimeMessage',
        'status', 'createdAt', 'updatedAt', 'price', 'isPaid', 'paymentNote'
      ]);
      await initSheet(SHEETS.APARTMENTS, ['number', 'contactInfo']);
      await initSheet(SHEETS.USERS, ['id', 'apartmentNumber', 'password', 'createdAt']);
    }
  }
  return isInitialized;
}

// Veri okuma fonksiyonları
async function readOrders() {
  const initialized = await ensureInitialized();
  if (!initialized) {
    return { orders: [], apartments: [] };
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: `${SHEETS.ORDERS}!A2:M1000`, // M sütunu paymentNote için
    });

    const rows = response.data.values || [];
    const orders = rows
      .filter(row => row.length > 0 && row[0]) // Boş satırları filtrele
      .map(row => ({
        id: row[0] || '',
        apartmentNumber: row[1] || '',
        orderText: row[2] || '',
        contactInfo: row[3] || '',
        isTrashCollection: row[4] === 'TRUE' || row[4] === true,
        orderType: row[5] || '',
        orderTimeMessage: row[6] || '',
        status: row[7] || 'pending',
        createdAt: row[8] || '',
        updatedAt: row[9] || '',
        price: row[10] || '', // Fiyat
        isPaid: row[11] === 'TRUE' || row[11] === true, // Ödendi mi?
        paymentNote: row[12] || '', // Ödeme notu
      }));

    // Apartments'ı da oku
    const apartments = await readApartments();

    return { orders, apartments };
  } catch (error) {
    console.error('Orders okuma hatası:', error.message);
    return { orders: [], apartments: [] };
  }
}

async function readApartments() {
  const initialized = await ensureInitialized();
  if (!initialized) {
    return [];
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: `${SHEETS.APARTMENTS}!A2:B1000`,
    });

    const rows = response.data.values || [];
    return rows
      .filter(row => row.length > 0 && row[0])
      .map(row => ({
        number: row[0] || '',
        contactInfo: row[1] || '',
      }));
  } catch (error) {
    console.error('Apartments okuma hatası:', error.message);
    return [];
  }
}

async function readUsers() {
  const initialized = await ensureInitialized();
  if (!initialized) {
    return { users: [] };
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: `${SHEETS.USERS}!A2:D1000`,
    });

    const rows = response.data.values || [];
    const users = rows
      .filter(row => row.length > 0 && row[0])
      .map(row => ({
        id: row[0] || '',
        apartmentNumber: row[1] || '',
        password: row[2] || '',
        createdAt: row[3] || '',
      }));

    return { users };
  } catch (error) {
    console.error('Users okuma hatası:', error.message);
    return { users: [] };
  }
}

// Veri yazma fonksiyonları
async function writeOrders(data) {
  const initialized = await ensureInitialized();
  if (!initialized) {
    return false;
  }

  try {
    // Önce mevcut verileri temizle (başlık hariç)
    await sheets.spreadsheets.values.clear({
      spreadsheetId: spreadsheetId,
      range: `${SHEETS.ORDERS}!A2:M1000`,
    });

    // Yeni verileri ekle
    const values = data.orders.map(order => [
      order.id,
      order.apartmentNumber,
      order.orderText,
      order.contactInfo,
      order.isTrashCollection ? 'TRUE' : 'FALSE',
      order.orderType,
      order.orderTimeMessage,
      order.status,
      order.createdAt,
      order.updatedAt,
      order.price || '',
      order.isPaid ? 'TRUE' : 'FALSE',
      order.paymentNote || '',
    ]);

    if (values.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `${SHEETS.ORDERS}!A2`,
        valueInputOption: 'RAW',
        resource: { values },
      });
    }

    // Apartments'ı da kaydet
    await writeApartments(data.apartments);

    return true;
  } catch (error) {
    console.error('Orders yazma hatası:', error.message);
    return false;
  }
}

async function writeApartments(apartments) {
  const initialized = await ensureInitialized();
  if (!initialized) {
    return false;
  }

  try {
    // Mevcut verileri temizle
    await sheets.spreadsheets.values.clear({
      spreadsheetId: spreadsheetId,
      range: `${SHEETS.APARTMENTS}!A2:B1000`,
    });

    // Yeni verileri ekle
    const values = apartments.map(apt => [apt.number, apt.contactInfo]);

    if (values.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `${SHEETS.APARTMENTS}!A2`,
        valueInputOption: 'RAW',
        resource: { values },
      });
    }

    return true;
  } catch (error) {
    console.error('Apartments yazma hatası:', error.message);
    return false;
  }
}

async function writeUsers(data) {
  const initialized = await ensureInitialized();
  if (!initialized) {
    return false;
  }

  try {
    // Mevcut verileri temizle
    await sheets.spreadsheets.values.clear({
      spreadsheetId: spreadsheetId,
      range: `${SHEETS.USERS}!A2:D1000`,
    });

    // Yeni verileri ekle
    const values = data.users.map(user => [
      user.id,
      user.apartmentNumber,
      user.password,
      user.createdAt,
    ]);

    if (values.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `${SHEETS.USERS}!A2`,
        valueInputOption: 'RAW',
        resource: { values },
      });
    }

    return true;
  } catch (error) {
    console.error('Users yazma hatası:', error.message);
    return false;
  }
}

// Fallback için JSON dosya sistemini kullan
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../temp/apartment-orders.json');
const USERS_FILE = path.join(__dirname, '../../temp/apartment-users.json');

function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = { orders: [], apartments: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

function initUsersFile() {
  if (!fs.existsSync(USERS_FILE)) {
    const initialUsers = { users: [] };
    fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2));
  }
}

// Hybrid fonksiyonlar (önce Sheets, yoksa JSON)
async function readData() {
  const initialized = await ensureInitialized();
  if (initialized) {
    return await readOrders();
  }

  // Fallback: JSON dosyasından oku
  initDataFile();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Veri okuma hatası:', error.message);
    return { orders: [], apartments: [] };
  }
}

async function writeData(data) {
  const initialized = await ensureInitialized();
  if (initialized) {
    return await writeOrders(data);
  }

  // Fallback: JSON dosyasına yaz
  initDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Veri yazma hatası:', error.message);
    return false;
  }
}

async function readUsersData() {
  const initialized = await ensureInitialized();
  if (initialized) {
    return await readUsers();
  }

  // Fallback: JSON dosyasından oku
  initUsersFile();
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Kullanıcı okuma hatası:', error.message);
    return { users: [] };
  }
}

async function writeUsersData(data) {
  const initialized = await ensureInitialized();
  if (initialized) {
    return await writeUsers(data);
  }

  // Fallback: JSON dosyasına yaz
  initUsersFile();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Kullanıcı yazma hatası:', error.message);
    return false;
  }
}

module.exports = {
  readData,
  writeData,
  readUsersData,
  writeUsersData,
  readApartments,
  ensureInitialized,
};

