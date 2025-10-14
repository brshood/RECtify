const axios = require('axios');

async function testBlockchainAPI() {
  try {
    console.log('🔍 Testing Blockchain API endpoints...');
    
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('Health status:', healthResponse.data.status);
    console.log('Database:', healthResponse.data.database);
    
    // Test blockchain status (this will fail without auth, but we can see the response)
    console.log('\n2. Testing blockchain status endpoint...');
    try {
      const statusResponse = await axios.get('http://localhost:5000/api/rec-security/status');
      console.log('Blockchain status:', statusResponse.data);
    } catch (error) {
      console.log('Status endpoint response:', error.response?.data || error.message);
    }
    
    // Test network info
    console.log('\n3. Testing network info endpoint...');
    try {
      const networkResponse = await axios.get('http://localhost:5000/api/rec-security/network-info');
      console.log('Network info:', networkResponse.data);
    } catch (error) {
      console.log('Network info response:', error.response?.data || error.message);
    }
    
    console.log('\n✅ API tests completed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testBlockchainAPI();
