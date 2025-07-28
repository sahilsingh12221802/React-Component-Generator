@echo off
echo 🚨 EMERGENCY CORS FIX - Starting...

REM Kill any existing Node.js processes on port 5004
echo 🔪 Killing existing processes on port 5004...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5004') do taskkill /f /pid %%a 2>nul

REM Clear Node.js cache
echo 🧹 Clearing Node.js cache...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

REM Ensure .env file exists
echo 📝 Ensuring .env file exists...
if not exist .env (
    copy env.example .env
    echo ✅ Created .env file
) else (
    echo ✅ .env file already exists
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

echo.
echo 🚀 Starting backend server with CORS fix...
echo 📡 Backend will be available at: http://localhost:5004
echo 🔗 Frontend should connect to: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
npm run dev 