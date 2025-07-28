# 🚨 QUICK CORS FIX - IMMEDIATE SOLUTION

## **STEP 1: STOP ALL SERVERS**
```bash
# Press Ctrl+C in both terminal windows to stop frontend and backend
```

## **STEP 2: RUN EMERGENCY FIX**

### **For Mac/Linux:**
```bash
cd backend
chmod +x emergency-fix.sh
./emergency-fix.sh
```

### **For Windows:**
```bash
cd backend
emergency-fix.bat
```

## **STEP 3: TEST CORS**

### **Test 1: Health Check**
```bash
curl http://localhost:5004/api/health
```

### **Test 2: CORS Test**
```bash
curl http://localhost:5004/api/cors-test
```

### **Test 3: Browser Test**
Open browser and go to: `http://localhost:5004/api/cors-test`

## **STEP 4: START FRONTEND**
```bash
# In a NEW terminal window
cd frontend
npm run dev
```

## **STEP 5: TEST REGISTRATION**

1. Go to `http://localhost:3000/login`
2. Click "Sign up" 
3. Fill in the form
4. Submit

## **🔧 IF STILL NOT WORKING:**

### **Option 1: Manual Restart**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### **Option 2: Clear Everything**
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

### **Option 3: Use Different Ports**
```bash
# Backend .env
PORT=5005

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:5005
```

## **🎯 EXPECTED RESULT:**
- ✅ Registration form submits without CORS errors
- ✅ User account is created successfully
- ✅ Redirected to dashboard after registration

## **📞 STILL HAVING ISSUES?**
1. Check browser console (F12) for specific errors
2. Check backend terminal for error messages
3. Make sure MongoDB and Redis are running
4. Try a different browser 