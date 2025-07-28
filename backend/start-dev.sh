#!/bin/bash

echo "🚀 Starting AI Component Generator Backend..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Please start MongoDB first:"
        echo "   mongod"
        echo "   Or use MongoDB Atlas"
    fi
else
    echo "⚠️  MongoDB not found. Please install MongoDB or use MongoDB Atlas"
fi

# Check if Redis is running
echo "🔍 Checking Redis connection..."
if command -v redis-server &> /dev/null; then
    if pgrep -x "redis-server" > /dev/null; then
        echo "✅ Redis is running"
    else
        echo "⚠️  Redis is not running. Please start Redis first:"
        echo "   redis-server"
        echo "   Or use Redis Cloud"
    fi
else
    echo "⚠️  Redis not found. Please install Redis or use Redis Cloud"
fi

echo ""
echo "🎯 Starting development server..."
echo "📡 Backend will be available at: http://localhost:5004"
echo "🔗 Frontend should connect to: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev 