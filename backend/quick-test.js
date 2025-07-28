const axios = require('axios');

async function quickTest() {
  try {
    console.log('🧪 Quick test - checking what data format works...');
    
    // Test 1: Basic object
    console.log('\n📤 Test 1: Basic object');
    const test1 = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    try {
      const response1 = await axios.post('http://localhost:5004/api/auth/register-test', test1);
      console.log('✅ Test 1 passed:', response1.data);
    } catch (error) {
      console.log('❌ Test 1 failed:', error.response?.data);
    }
    
    // Test 2: With confirmPassword
    console.log('\n📤 Test 2: With confirmPassword');
    const test2 = {
      name: 'Test User',
      email: 'test2@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    };
    
    try {
      const response2 = await axios.post('http://localhost:5004/api/auth/register-test', test2);
      console.log('✅ Test 2 passed:', response2.data);
    } catch (error) {
      console.log('❌ Test 2 failed:', error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
  }
}

quickTest(); 