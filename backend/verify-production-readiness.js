require('dotenv').config();
const { ethers } = require('ethers');

async function verifyProductionReadiness() {
  console.log('🔍 PRODUCTION READINESS VERIFICATION');
  console.log('='.repeat(50));
  
  let allChecksPassed = true;
  
  // 1. Environment Variables Check
  console.log('\n1️⃣ Environment Variables:');
  
  const requiredVars = [
    'BLOCKCHAIN_NETWORK',
    'INFURA_API_KEY',
    'INFURA_API_KEY_SECRET'
  ];
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      console.log(`   ✅ ${varName}: SET`);
    } else {
      console.log(`   ❌ ${varName}: MISSING`);
      allChecksPassed = false;
    }
  }
  
  // 2. Network Configuration Check
  console.log('\n2️⃣ Network Configuration:');
  if (process.env.BLOCKCHAIN_NETWORK === 'mainnet') {
    console.log('   ✅ Network: mainnet (Production ready)');
  } else {
    console.log(`   ❌ Network: ${process.env.BLOCKCHAIN_NETWORK} (Should be mainnet)`);
    allChecksPassed = false;
  }
  
  // 3. Infura Connection Test
  console.log('\n3️⃣ Infura Connection Test:');
  try {
    const infuraUrl = `https://${process.env.BLOCKCHAIN_NETWORK}.infura.io/v3/${process.env.INFURA_API_KEY}`;
    const provider = new ethers.JsonRpcProvider(infuraUrl);
    
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    console.log(`   ✅ Connected to: ${network.name}`);
    console.log(`   ✅ Chain ID: ${network.chainId}`);
    console.log(`   ✅ Current Block: ${blockNumber.toLocaleString()}`);
    console.log('   ✅ Infura connection working');
  } catch (error) {
    console.log(`   ❌ Infura connection failed: ${error.message}`);
    allChecksPassed = false;
  }
  
  // 4. REC Security Service Test
  console.log('\n4️⃣ REC Security Service Test:');
  try {
    // Force reload to ensure fresh environment
    delete require.cache[require.resolve('./services/RECSecurityService')];
    const RECSecurityService = require('./services/RECSecurityService');
    
    const initResult = await RECSecurityService.initialize();
    if (initResult.success) {
      console.log('   ✅ Service initialized successfully');
      console.log(`   ✅ Network: ${initResult.network}`);
      console.log(`   ✅ Status: ${initResult.status || 'active'}`);
      
      // Test transaction recording
      const txResult = await RECSecurityService.recordRECTransaction({
        buyerAddress: '0x1234567890123456789012345678901234567890',
        sellerAddress: '0x0987654321098765432109876543210987654321',
        recQuantity: 1,
        facilityDetails: {
          facilityName: 'Production Test Facility',
          facilityId: 'prod-test-001',
          energyType: 'solar',
          vintage: 2024,
          emirate: 'Dubai',
          certificationStandard: 'I-REC'
        },
        transactionId: 'prod-test-' + Date.now(),
        pricePerUnit: 1.00
      });
      
      if (txResult.success) {
        console.log('   ✅ Transaction recording working');
        console.log(`   ✅ Blockchain Tx ID: ${txResult.blockchainTxId}`);
      } else {
        console.log(`   ❌ Transaction recording failed: ${txResult.message}`);
        allChecksPassed = false;
      }
    } else {
      console.log(`   ❌ Service initialization failed: ${initResult.message}`);
      allChecksPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ Service test failed: ${error.message}`);
    allChecksPassed = false;
  }
  
  // 5. Production Configuration Check
  console.log('\n5️⃣ Production Configuration:');
  
  // Check if we're in production mode
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (isProduction) {
    console.log('   ✅ Running in production mode');
  } else {
    console.log('   ⚠️  Running in development mode (will be production when deployed)');
  }
  
  // Check port configuration
  const port = process.env.PORT || 5000;
  console.log(`   Port: ${port}`);
  
  // 6. Dependencies Check
  console.log('\n6️⃣ Critical Dependencies:');
  const criticalDeps = ['ethers', 'express', 'mongoose', 'cors', 'helmet'];
  
  for (const dep of criticalDeps) {
    try {
      require(dep);
      console.log(`   ✅ ${dep}: Available`);
    } catch (error) {
      console.log(`   ❌ ${dep}: Missing`);
      allChecksPassed = false;
    }
  }
  
  // 7. Final Assessment
  console.log('\n' + '='.repeat(50));
  if (allChecksPassed) {
    console.log('🎉 PRODUCTION READINESS: PASSED');
    console.log('✅ All systems ready for production deployment');
    console.log('✅ Blockchain integration fully operational');
    console.log('✅ Environment variables properly configured');
    console.log('✅ Infura connection working');
    console.log('✅ REC Security Service operational');
    console.log('\n🚀 READY TO DEPLOY TO PRODUCTION!');
  } else {
    console.log('❌ PRODUCTION READINESS: FAILED');
    console.log('⚠️  Some checks failed - review and fix before deployment');
  }
  
  return allChecksPassed;
}

verifyProductionReadiness().then(success => {
  process.exit(success ? 0 : 1);
});
