// Test the blockchain service as it would be used in the server
require('dotenv').config();

// Force reload the RECSecurityService module
delete require.cache[require.resolve('./services/RECSecurityService')];
const RECSecurityService = require('./services/RECSecurityService');

async function testServerBlockchain() {
  try {
    console.log('🔍 Testing Blockchain Service in Server Context...');
    console.log('Environment BLOCKCHAIN_NETWORK:', process.env.BLOCKCHAIN_NETWORK);
    
    // Test initialization
    console.log('\n1. Initializing REC Security Service...');
    const initResult = await RECSecurityService.initialize();
    
    if (initResult.success) {
      console.log('✅ Initialization successful!');
      console.log('Network:', initResult.network);
      console.log('Message:', initResult.message);
      
      // Test service status
      console.log('\n2. Getting service status...');
      const status = RECSecurityService.getServiceStatus();
      console.log('Status:', JSON.stringify(status, null, 2));
      
      // Test network info
      console.log('\n3. Getting network information...');
      const networkInfo = await RECSecurityService.getNetworkInfo();
      if (networkInfo.success) {
        console.log('Network Info:', JSON.stringify(networkInfo.network, null, 2));
      } else {
        console.log('Network Info Error:', networkInfo.message);
      }
      
      // Test recording a transaction
      console.log('\n4. Testing REC transaction recording...');
      const transactionData = {
        buyerAddress: '0x1234567890123456789012345678901234567890',
        sellerAddress: '0x0987654321098765432109876543210987654321',
        recQuantity: 100,
        facilityDetails: {
          facilityName: 'Test Solar Farm',
          facilityId: 'test-facility-001',
          energyType: 'solar',
          vintage: 2024,
          emirate: 'Dubai',
          certificationStandard: 'I-REC'
        },
        transactionId: 'test-tx-001',
        pricePerUnit: 2.50
      };
      
      const recordResult = await RECSecurityService.recordRECTransaction(transactionData);
      if (recordResult.success) {
        console.log('✅ Transaction recorded successfully!');
        console.log('Blockchain Tx ID:', recordResult.blockchainTxId);
        console.log('Blockchain Hash:', recordResult.blockchainHash);
      } else {
        console.log('❌ Transaction recording failed:', recordResult.message);
      }
      
      return true;
    } else {
      console.log('❌ Initialization failed:', initResult.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

testServerBlockchain().then(success => {
  console.log('\n' + '='.repeat(50));
  console.log(success ? '🎉 All tests passed!' : '❌ Some tests failed');
  process.exit(success ? 0 : 1);
});
