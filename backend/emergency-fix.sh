#!/bin/bash

echo "🚨 EMERGENCY CORS FIX - Starting..."

# Kill any existing Node.js processes on port 5004
echo "🔪 Killing existing processes on port 5004..."
lsof -ti:5004 | xargs kill -9 2>/dev/null || echo "No processes found on port 5004"

# Clear Node.js cache
echo "🧹 Clearing Node.js cache..."
rm -rf .next 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null

# Ensure .env file exists
echo "📝 Ensuring .env file exists..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start MongoDB if not running (macOS/Linux)
echo "🗄️ Checking MongoDB..."
if command -v mongod &> /dev/null; then
    if ! pgrep -x "mongod" > /dev/null; then
        echo "⚠️ Starting MongoDB..."
        mongod --fork --logpath /dev/null || echo "MongoDB already running"
    else
        echo "✅ MongoDB is running"
    fi
fi

# Start Redis if not running (macOS/Linux)
echo "🔴 Checking Redis..."
if command -v redis-server &> /dev/null; then
    if ! pgrep -x "redis-server" > /dev/null; then
        echo "⚠️ Starting Redis..."
        redis-server --daemonize yes || echo "Redis already running"
    else
        echo "✅ Redis is running"
    fi
fi

echo ""
echo "🚀 Starting backend server with CORS fix..."
echo "📡 Backend will be available at: http://localhost:5004"
echo "🔗 Frontend should connect to: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm run dev 