# 🔧 400 Bad Request Error - Quick Fix

## **Good News!** 🎉
The CORS issue is **FIXED**! The 400 error means the request is reaching the backend successfully.

## **STEP 1: Check Backend Console**
Look at your backend terminal for detailed error messages. You should see:
- Validation errors
- Request body data
- Specific field validation failures

## **STEP 2: Run Test Script**
```bash
cd backend
node test-registration.js
```

This will show you exactly what's causing the 400 error.

## **STEP 3: Common 400 Error Causes**

### **1. Validation Errors**
- **Name too short**: Must be 2-50 characters
- **Invalid email**: Must be valid email format
- **Password too short**: Must be at least 6 characters

### **2. User Already Exists**
- Email address already registered
- Check if you've registered this email before

### **3. Database Connection Issues**
- MongoDB not running
- Connection string issues

## **STEP 4: Quick Debug Steps**

### **Check Backend Logs**
Look for these messages in your backend terminal:
```
Registration request received: { name: "...", email: "...", password: "..." }
Validation failed for: /api/auth/register
Request body: { ... }
Validation errors: [ ... ]
```

### **Test with Simple Data**
Try registering with this exact data:
```json
{
  "name": "Test User",
  "email": "test@example.com", 
  "password": "password123"
}
```

## **STEP 5: Manual Test**
```bash
curl -X POST http://localhost:5004/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## **🔍 Expected Results**

### **If Validation Fails:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "type": "field",
      "value": "test",
      "msg": "Name must be between 2 and 50 characters",
      "path": "name",
      "location": "body"
    }
  ],
  "receivedData": { ... }
}
```

### **If User Exists:**
```json
{
  "error": "User with this email already exists"
}
```

### **If Successful:**
```json
{
  "message": "User registered successfully",
  "user": { ... },
  "token": "..."
}
```

## **🚨 Emergency Fix**

If you're still getting 400 errors:

1. **Clear Database** (if using local MongoDB):
```bash
mongo
use accio-job
db.users.drop()
exit
```

2. **Restart Backend**:
```bash
cd backend
npm run dev
```

3. **Try Registration Again**

## **📞 Still Having Issues?**

1. **Check the backend console output** - it will show exactly what's wrong
2. **Run the test script** - `node test-registration.js`
3. **Check MongoDB connection** - make sure it's running
4. **Try a different email** - in case the email is already registered

---

**The 400 error is much better than CORS!** It means your request is reaching the backend successfully. We just need to fix the validation or data issue. 🎯 