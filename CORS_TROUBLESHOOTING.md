# CORS and Backend Troubleshooting Guide

## Issue: CORS Error on Registration/Login

If you're seeing this error:
```
Access to XMLHttpRequest at 'http://localhost:5004/api/auth/register' from origin 'http://localhost:3000' has been blocked by CORS policy
```

## 🔧 **Quick Fixes**

### 1. **Restart Both Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. **Clear Browser Cache**
- Open Developer Tools (F12)
- Right-click the refresh button
- Select "Empty Cache and Hard Reload"

### 3. **Check Environment Variables**

#### Backend (.env)
```bash
cd backend
# Make sure .env file exists and contains:
MONGODB_URI=mongodb://localhost:27017/accio-job
NODE_ENV=development
PORT=5004
JWT_SECRET=90ce8812536cccbb0dc6ed6e14de5c3a015be70c248ad897e1ae8ac5cf89607e
OPENROUTER_API_KEY=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
AI_MODEL=anthropic/claude-3.5-sonnet
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
```

#### Frontend (.env.local)
```bash
cd frontend
# Make sure .env.local file exists and contains:
NEXT_PUBLIC_API_URL=http://localhost:5004
NEXT_PUBLIC_WS_URL=ws://localhost:5004
```

## 🚀 **Step-by-Step Solution**

### Step 1: Verify Backend is Running
```bash
# Check if backend is accessible
curl http://localhost:5004/api/health
```

Expected response:
```json
{"status":"OK","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Step 2: Test CORS Preflight
```bash
# Test CORS headers
curl -X OPTIONS http://localhost:5004/api/auth/register \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

Expected headers:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With
```

### Step 3: Test Registration Endpoint
```bash
# Test registration directly
curl -X POST http://localhost:5004/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🔍 **Common Issues and Solutions**

### Issue 1: Backend Not Running
**Symptoms**: Connection refused, timeout errors
**Solution**:
```bash
cd backend
npm install
npm run dev
```

### Issue 2: MongoDB Not Connected
**Symptoms**: Database connection errors
**Solution**:
```bash
# Start MongoDB locally
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### Issue 3: Redis Not Connected
**Symptoms**: Redis connection errors
**Solution**:
```bash
# Start Redis locally
redis-server

# Or use Redis Cloud (cloud)
# Update REDIS_URL in .env
```

### Issue 4: Port Already in Use
**Symptoms**: EADDRINUSE error
**Solution**:
```bash
# Find process using port 5004
lsof -i :5004

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=5005
```

### Issue 5: Environment Variables Not Loaded
**Symptoms**: Undefined variables
**Solution**:
```bash
# Make sure .env file exists
cd backend
cp env.example .env

# Restart server
npm run dev
```

## 🧪 **Testing Tools**

### 1. Backend Test Script
```bash
cd backend
node test-server.js
```

### 2. Browser Developer Tools
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try to register/login
4. Check the failed request
5. Look for CORS headers in response

### 3. Postman/Insomnia Test
```http
POST http://localhost:5004/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

## 🔧 **Advanced Debugging**

### 1. Enable Detailed Logging
Add to `backend/src/server.js`:
```javascript
// Add before routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});
```

### 2. Check CORS Configuration
Verify in `backend/src/server.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

### 3. Test with Different Browsers
- Chrome
- Firefox
- Safari
- Edge

## 🚨 **Emergency Fixes**

### If Nothing Works:

1. **Complete Reset**:
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev

# Frontend
cd frontend
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

2. **Use Different Ports**:
```bash
# Backend .env
PORT=5005
FRONTEND_URL=http://localhost:3000

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:5005
```

3. **Disable CORS Temporarily** (Development only):
```javascript
// In backend/src/server.js
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));
```

## 📋 **Checklist**

- [ ] Backend server is running on port 5004
- [ ] Frontend server is running on port 3000
- [ ] MongoDB is connected
- [ ] Redis is connected
- [ ] .env files are properly configured
- [ ] CORS headers are present in response
- [ ] No firewall blocking connections
- [ ] Browser cache is cleared
- [ ] All dependencies are installed

## 🆘 **Still Having Issues?**

1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure both servers are running without errors
4. Try the test scripts provided
5. Check if MongoDB and Redis are accessible
6. Verify network connectivity between frontend and backend

---

**Need more help?** Check the browser console and server logs for specific error messages. 