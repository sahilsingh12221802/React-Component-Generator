const mongoose = require('mongoose');
require('dotenv').config();

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database schema conflicts...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get the database
    const db = mongoose.connection.db;
    
    // Drop the problematic collection if it exists
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    console.log('📋 Existing collections:', collectionNames);
    
    // Drop the test.users collection if it exists (it has the problematic index)
    if (collectionNames.includes('users')) {
      console.log('🗑️ Dropping existing users collection...');
      await db.collection('users').drop();
      console.log('✅ Users collection dropped');
    }
    
    // Also drop any test collection if it exists
    if (collectionNames.includes('test')) {
      console.log('🗑️ Dropping test collection...');
      await db.collection('test').drop();
      console.log('✅ Test collection dropped');
    }
    
    // Create fresh indexes for the User model
    console.log('🔨 Creating fresh indexes...');
    const User = require('./src/models/User');
    
    // Drop all existing indexes
    await User.collection.dropIndexes();
    console.log('✅ Dropped existing indexes');
    
    // Create new indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log('✅ Created email index');
    
    console.log('🎉 Database fixed successfully!');
    console.log('🚀 You can now restart your backend server');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixDatabase(); 