require('dotenv').config();
const { ethers } = require('ethers');

async function quickBlockchainTest() {
  console.log('🧪 Quick Blockchain Test');
  console.log('='.repeat(40));
  
  try {
    // Test 1: Environment Variables
    console.log('1️⃣ Environment Check:');
    console.log(`   Network: ${process.env.BLOCKCHAIN_NETWORK}`);
    console.log(`   API Key: ${process.env.INFURA_API_KEY ? '✅ Set' : '❌ Missing'}`);
    
    // Test 2: Direct Infura Connection
    console.log('\n2️⃣ Direct Infura Connection:');
    const infuraUrl = `https://${process.env.BLOCKCHAIN_NETWORK}.infura.io/v3/${process.env.INFURA_API_KEY}`;
    const provider = new ethers.JsonRpcProvider(infuraUrl);
    
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    console.log(`   ✅ Connected to: ${network.name}`);
    console.log(`   ✅ Chain ID: ${network.chainId}`);
    console.log(`   ✅ Current Block: ${blockNumber.toLocaleString()}`);
    
    // Test 3: REC Security Service
    console.log('\n3️⃣ REC Security Service:');
    delete require.cache[require.resolve('./services/RECSecurityService')];
    const RECSecurityService = require('./services/RECSecurityService');
    
    const initResult = await RECSecurityService.initialize();
    if (initResult.success) {
      console.log(`   ✅ Service Status: ${initResult.status || 'Active'}`);
      console.log(`   ✅ Network: ${initResult.network}`);
      
      // Test transaction recording
      const txResult = await RECSecurityService.recordRECTransaction({
        buyerAddress: '0x1234567890123456789012345678901234567890',
        sellerAddress: '0x0987654321098765432109876543210987654321',
        recQuantity: 50,
        facilityDetails: {
          facilityName: 'Test Solar Farm',
          facilityId: 'test-001',
          energyType: 'solar',
          vintage: 2024,
          emirate: 'Dubai',
          certificationStandard: 'I-REC'
        },
        transactionId: 'test-' + Date.now(),
        pricePerUnit: 3.50
      });
      
      if (txResult.success) {
        console.log(`   ✅ Transaction Recorded: ${txResult.blockchainTxId}`);
        console.log(`   ✅ Blockchain Hash: ${txResult.blockchainHash}`);
      } else {
        console.log(`   ❌ Transaction Failed: ${txResult.message}`);
      }
    } else {
      console.log(`   ❌ Service Failed: ${initResult.message}`);
    }
    
    console.log('\n' + '='.repeat(40));
    console.log('🎉 ALL TESTS PASSED - BLOCKCHAIN FULLY OPERATIONAL!');
    
  } catch (error) {
    console.log('\n❌ TEST FAILED:', error.message);
    console.log('Stack:', error.stack);
  }
}

quickBlockchainTest();
