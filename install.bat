@echo off
echo 🚀 Setting up AI Component Generator Platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Create environment files
echo 📝 Creating environment files...

REM Backend .env
(
echo MONGODB_URI=mongodb://localhost:27017/accio-job
echo NODE_ENV=development
echo PORT=5004
echo JWT_SECRET=90ce8812536cccbb0dc6ed6e14de5c3a015be70c248ad897e1ae8ac5cf89607e
echo OPENROUTER_API_KEY=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
echo AI_MODEL=anthropic/claude-3.5-sonnet
echo FRONTEND_URL=http://localhost:3000
echo REDIS_URL=redis://localhost:6379
) > backend\.env

REM Frontend .env.local
(
echo NEXT_PUBLIC_API_URL=http://localhost:5004
echo NEXT_PUBLIC_WS_URL=ws://localhost:5004
) > frontend\.env.local

echo ✅ Environment files created

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo ✅ Dependencies installed successfully

echo.
echo 🎉 Setup completed!
echo.
echo 📋 Next steps:
echo 1. Start MongoDB service
echo 2. Start Redis service
echo 3. Start the backend: cd backend ^&^& npm run dev
echo 4. Start the frontend: cd frontend ^&^& npm run dev
echo 5. Open http://localhost:3000 in your browser
echo.
echo 🔧 Available scripts:
echo   Backend:
echo     npm run dev    - Start development server
echo     npm start      - Start production server
echo     npm test       - Run tests
echo.
echo   Frontend:
echo     npm run dev    - Start development server
echo     npm run build  - Build for production
echo     npm start      - Start production server
echo     npm run lint   - Run linter
echo.
echo 📚 Documentation: README.md
pause 