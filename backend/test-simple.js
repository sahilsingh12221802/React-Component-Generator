const axios = require('axios');

async function testRegistration() {
  try {
    console.log('🧪 Testing registration with correct data format...');
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    console.log('📤 Sending data:', testData);
    
    const response = await axios.post('http://localhost:5004/api/auth/register', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
  }
}

testRegistration(); 