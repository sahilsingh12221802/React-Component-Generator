const axios = require('axios');

async function testRegistration() {
  try {
    console.log('🧪 Testing registration endpoint...');
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    console.log('📤 Sending registration request with data:', testData);
    
    const response = await axios.post('http://localhost:5004/api/auth/register', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      }
    });
    
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
    console.error('Headers:', error.response?.headers);
  }
}

async function testHealth() {
  try {
    console.log('🏥 Testing health endpoint...');
    const response = await axios.get('http://localhost:5004/api/health');
    console.log('✅ Health check passed:', response.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

async function testCORS() {
  try {
    console.log('🌐 Testing CORS endpoint...');
    const response = await axios.get('http://localhost:5004/api/cors-test');
    console.log('✅ CORS test passed:', response.data);
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting registration tests...\n');
  
  await testHealth();
  console.log('');
  
  await testCORS();
  console.log('');
  
  await testRegistration();
  console.log('');
  
  console.log('🏁 Tests completed!');
}

runTests(); 