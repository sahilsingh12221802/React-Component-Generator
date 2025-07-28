const axios = require('axios');

async function testFinal() {
  try {
    console.log('🧪 FINAL TEST - Registration should work now!');
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    };
    
    console.log('📤 Sending registration data:', testData);
    
    const response = await axios.post('http://localhost:5004/api/auth/register', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ SUCCESS! Registration worked!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
  }
}

// Wait a bit for server to start, then test
setTimeout(testFinal, 2000); 