Write-Host "🚀 Starting Backend Server..." -ForegroundColor Green

# Start the server in background
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "src/server.js" -WorkingDirectory $PWD

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test the health endpoint
Write-Host "🏥 Testing health endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5004/api/health" -Method GET
    Write-Host "✅ Health check passed: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test registration
Write-Host "🧪 Testing registration..." -ForegroundColor Cyan
$testData = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    confirmPassword = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5004/api/auth/register" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "✅ Registration test passed: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Registration test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "🎉 Backend is ready! Try registering at http://localhost:3000/login" -ForegroundColor Green 