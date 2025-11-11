#!/bin/bash

echo "🏢 Apartman Görevlisi - Başlatılıyor..."

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "Backend bağımlılıkları yükleniyor..."
    npm install
fi

# Check if client/node_modules exists
if [ ! -d client/node_modules ]; then
    echo "Frontend bağımlılıkları yükleniyor..."
    cd client
    npm install
    cd ..
fi

# Create temp directory if it doesn't exist
mkdir -p temp

echo "Backend sunucu başlatılıyor..."
npm run dev &

# Wait a bit for backend to start
sleep 3

echo "Frontend başlatılıyor..."
cd client
npm start

