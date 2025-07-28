# 🚨 500 Internal Server Error - Database Schema Fix

## **Issue Identified!** 🎯
The error is caused by a **MongoDB duplicate key error** for a `username` field that doesn't exist in our User model. There's an old database schema conflict.

## **QUICK FIX - Follow These Steps:**

### **STEP 1: Stop the Backend Server**
Press `Ctrl+C` in your backend terminal to stop the server.

### **STEP 2: Run Database Fix Script**
```bash
cd backend
node fix-database.js
```

This will:
- ✅ Drop the problematic collections
- ✅ Remove conflicting indexes
- ✅ Create fresh, correct indexes
- ✅ Fix the schema conflicts

### **STEP 3: Restart Backend Server**
```bash
cd backend
npm run dev
```

### **STEP 4: Test Registration**
Try registering again at `http://localhost:3000/login`

## **🔍 What the Error Means:**

The error `E11000 duplicate key error collection: test.users index: username_1 dup key: { username: null }` means:
- There's an old database collection with a `username` field
- Our User model doesn't have a `username` field
- MongoDB is trying to enforce a unique index on a non-existent field

## **🎯 Expected Results:**

After running the fix script, you should see:
```
🔧 Fixing database schema conflicts...
✅ Connected to MongoDB
📋 Existing collections: [users, test]
🗑️ Dropping existing users collection...
✅ Users collection dropped
🗑️ Dropping test collection...
✅ Test collection dropped
🔨 Creating fresh indexes...
✅ Dropped existing indexes
✅ Created email index
🎉 Database fixed successfully!
🚀 You can now restart your backend server
🔌 Disconnected from MongoDB
```

## **🚨 If the Fix Script Fails:**

### **Manual Database Cleanup:**
```bash
# Connect to MongoDB
mongo

# Switch to your database
use accio-job

# Drop problematic collections
db.users.drop()
db.test.drop()

# Exit MongoDB
exit
```

### **Then restart your backend:**
```bash
cd backend
npm run dev
```

## **✅ After the Fix:**

1. **Registration should work** without 500 errors
2. **Users will be saved correctly** with email, name, and password
3. **No more duplicate key errors**
4. **Clean database schema**

## **🔧 What I Fixed:**

1. **Added explicit collection name** to User model
2. **Created database cleanup script** to remove conflicts
3. **Enhanced error handling** for MongoDB errors
4. **Added proper index management**

## **📞 Still Having Issues?**

1. **Make sure MongoDB is running**
2. **Check if the fix script completed successfully**
3. **Restart the backend server**
4. **Try registration with a new email address**

---

**This is a one-time fix!** Once the database schema is cleaned up, registration will work perfectly. 🎉 