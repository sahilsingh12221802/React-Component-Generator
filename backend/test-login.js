const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing login endpoint...');
    
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    console.log('📤 Sending login data:', loginData);
    
    const response = await axios.post('http://localhost:5004/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
  }
}

// Wait for server to start
setTimeout(testLogin, 3000); 