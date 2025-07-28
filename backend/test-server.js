const axios = require('axios');

async function testBackend() {
  try {
    console.log('Testing backend server...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5004/api/health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test CORS preflight
    const corsResponse = await axios.options('http://localhost:5004/api/auth/register', {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('✅ CORS preflight passed:', corsResponse.headers);
    
    // Test registration endpoint
    const registerResponse = await axios.post('http://localhost:5004/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPass123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      }
    });
    console.log('✅ Registration test passed:', registerResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

testBackend(); 