// Force reload the module to get fresh environment variables
delete require.cache[require.resolve('./services/RECSecurityService')];
const RECSecurityService = require('./services/RECSecurityService');

async function testRECSecurityService() {
  try {
    console.log('🔍 Testing REC Security Service...');
    
    // Initialize the service
    console.log('Initializing REC Security Service...');
    const initResult = await RECSecurityService.initialize();
    
    if (initResult.success) {
      console.log('✅ REC Security Service initialized successfully!');
      console.log('Message:', initResult.message);
      console.log('Network:', initResult.network);
      console.log('Purpose:', initResult.purpose);
      
      // Get service status
      const status = RECSecurityService.getServiceStatus();
      console.log('\n📊 Service Status:');
      console.log('Initialized:', status.initialized);
      console.log('Network:', status.network);
      console.log('Purpose:', status.purpose);
      console.log('Total Transactions:', status.totalTransactions);
      console.log('Status:', status.status);
      
      // Get network info
      const networkInfo = await RECSecurityService.getNetworkInfo();
      if (networkInfo.success) {
        console.log('\n🌐 Network Information:');
        console.log('Network Name:', networkInfo.network.name);
        console.log('Chain ID:', networkInfo.network.chainId);
        console.log('Block Number:', networkInfo.network.blockNumber);
        console.log('Purpose:', networkInfo.network.purpose);
      } else {
        console.log('❌ Failed to get network info:', networkInfo.message);
      }
      
      return true;
    } else {
      console.log('❌ REC Security Service initialization failed:');
      console.log('Message:', initResult.message);
      console.log('Error:', initResult.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testRECSecurityService().then(success => {
  process.exit(success ? 0 : 1);
});
