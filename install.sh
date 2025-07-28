#!/bin/bash

echo "🚀 Setting up AI Component Generator Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Create environment files
echo "📝 Creating environment files..."

# Backend .env
cat > backend/.env << EOF
MONGODB_URI=mongodb://localhost:27017/accio-job
NODE_ENV=development
PORT=5004
JWT_SECRET=90ce8812536cccbb0dc6ed6e14de5c3a015be70c248ad897e1ae8ac5cf89607e
OPENROUTER_API_KEY=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
AI_MODEL=anthropic/claude-3.5-sonnet
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
EOF

# Frontend .env.local
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5004
NEXT_PUBLIC_WS_URL=ws://localhost:5004
EOF

echo "✅ Environment files created"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Dependencies installed successfully"

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if ! command -v mongosh &> /dev/null; then
    echo "⚠️  MongoDB is not installed or not in PATH. Please install MongoDB and start the service."
else
    if mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Please start MongoDB service."
    fi
fi

# Check if Redis is running
echo "🔍 Checking Redis connection..."
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis is not installed or not in PATH. Please install Redis and start the service."
else
    if redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis is running"
    else
        echo "⚠️  Redis is not running. Please start Redis service."
    fi
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Start MongoDB service"
echo "2. Start Redis service"
echo "3. Start the backend: cd backend && npm run dev"
echo "4. Start the frontend: cd frontend && npm run dev"
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "🔧 Available scripts:"
echo "  Backend:"
echo "    npm run dev    - Start development server"
echo "    npm start      - Start production server"
echo "    npm test       - Run tests"
echo ""
echo "  Frontend:"
echo "    npm run dev    - Start development server"
echo "    npm run build  - Build for production"
echo "    npm start      - Start production server"
echo "    npm run lint   - Run linter"
echo ""
echo "📚 Documentation: README.md" 