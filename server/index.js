// Deprecation uyarılarını bastır (hem development hem production'da)
const originalEmitWarning = process.emitWarning;
process.emitWarning = function(warning, ...args) {
  if (warning && typeof warning === 'string' && warning.includes('DEP0060')) {
    return; // util._extend uyarısını bastır
  }
  return originalEmitWarning.call(process, warning, ...args);
};

// Ayrıca console.warn ile gelen uyarıları da filtrele
const originalWarn = console.warn;
console.warn = function(...args) {
  const message = args.join(' ');
  if (message.includes('DEP0060') || message.includes('util._extend')) {
    return; // DEP0060 uyarısını bastır
  }
  return originalWarn.apply(console, args);
};

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
// Render.com otomatik PORT atar, yoksa 3002 kullan
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from React app
const buildPath = path.join(__dirname, '../client/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  console.log('Serving static files from:', buildPath);
}
// Development modunda build klasörü olmayabilir, bu normal

// Import routes
const apartmentRoutes = require('./routes/apartment');

// API Routes
app.use('/api/apartment', apartmentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Apartman Görevlisi API is running' });
});

// Serve React app (sadece production build varsa)
// Bu route en sona konulmalı ki API route'ları önce çalışsın
app.get('*', (req, res) => {
  // API route'ları zaten yukarıda handle edildi, buraya gelmemeli
  // Ama yine de kontrol edelim
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(__dirname, '../client/build', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Development modunda frontend ayrı bir port'ta çalışıyor
    res.json({
      message: 'Frontend development server is running on http://localhost:3000',
      info: 'Please access the application at http://localhost:3000',
      api: 'API is available at http://localhost:3002/api'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Sunucu hatası',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Apartman Görevlisi Server çalışıyor: http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
});

