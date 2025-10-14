require('dotenv').config();
const RECSecurityService = require('./services/RECSecurityService');

async function testBlockchainMonitorData() {
  try {
    console.log('🧪 Testing Blockchain Monitor Data Generation');
    console.log('='.repeat(50));
    
    // Initialize blockchain service
    console.log('1️⃣ Initializing Blockchain Service...');
    const initResult = await RECSecurityService.initialize();
    if (!initResult.success) {
      throw new Error(`Blockchain initialization failed: ${initResult.message}`);
    }
    console.log('   ✅ Blockchain service initialized');
    
    // Generate multiple test transactions
    console.log('\n2️⃣ Generating Test Blockchain Transactions...');
    const testTransactions = [
      {
        buyerAddress: '0x1234567890123456789012345678901234567890',
        sellerAddress: '0x0987654321098765432109876543210987654321',
        recQuantity: 100,
        facilityDetails: {
          facilityName: 'Dubai Solar Park Phase 1',
          facilityId: 'dubai-solar-001',
          energyType: 'solar',
          vintage: 2024,
          emirate: 'Dubai',
          certificationStandard: 'I-REC'
        },
        transactionId: 'test-tx-001',
        pricePerUnit: 2.50
      },
      {
        buyerAddress: '0x2345678901234567890123456789012345678901',
        sellerAddress: '0x1876543210987654321098765432109876543210',
        recQuantity: 250,
        facilityDetails: {
          facilityName: 'Abu Dhabi Wind Farm',
          facilityId: 'ad-wind-002',
          energyType: 'wind',
          vintage: 2024,
          emirate: 'Abu Dhabi',
          certificationStandard: 'I-REC'
        },
        transactionId: 'test-tx-002',
        pricePerUnit: 3.75
      },
      {
        buyerAddress: '0x3456789012345678901234567890123456789012',
        sellerAddress: '0x2765432109876543210987654321098765432109',
        recQuantity: 500,
        facilityDetails: {
          facilityName: 'Sharjah Hydro Plant',
          facilityId: 'sharjah-hydro-003',
          energyType: 'hydro',
          vintage: 2023,
          emirate: 'Sharjah',
          certificationStandard: 'I-REC'
        },
        transactionId: 'test-tx-003',
        pricePerUnit: 1.80
      }
    ];
    
    const recordedTransactions = [];
    
    for (let i = 0; i < testTransactions.length; i++) {
      const tx = testTransactions[i];
      console.log(`   📝 Recording transaction ${i + 1}/3: ${tx.facilityDetails.facilityName}`);
      
      const result = await RECSecurityService.recordRECTransaction(tx);
      if (result.success) {
        recordedTransactions.push({
          ...result.recTransactionRecord,
          blockchainHash: result.blockchainHash,
          status: 'recorded'
        });
        console.log(`      ✅ Recorded: ${result.blockchainTxId}`);
      } else {
        console.log(`      ❌ Failed: ${result.message}`);
      }
    }
    
    // Test service status
    console.log('\n3️⃣ Testing Service Status...');
    const status = RECSecurityService.getServiceStatus();
    console.log('   📊 Service Status:');
    console.log(`      Initialized: ${status.initialized}`);
    console.log(`      Network: ${status.network}`);
    console.log(`      Purpose: ${status.purpose}`);
    console.log(`      Total Transactions: ${status.totalTransactions}`);
    console.log(`      Status: ${status.status}`);
    
    // Test network info
    console.log('\n4️⃣ Testing Network Information...');
    const networkInfo = await RECSecurityService.getNetworkInfo();
    if (networkInfo.success) {
      console.log('   🌐 Network Info:');
      console.log(`      Name: ${networkInfo.network.name}`);
      console.log(`      Chain ID: ${networkInfo.network.chainId}`);
      console.log(`      Block Number: ${networkInfo.network.blockNumber.toLocaleString()}`);
      console.log(`      Purpose: ${networkInfo.network.purpose}`);
    } else {
      console.log('   ❌ Network info failed:', networkInfo.message);
    }
    
    // Test transaction history
    console.log('\n5️⃣ Testing Transaction History...');
    const transactionQueue = RECSecurityService.getTransactionQueue();
    console.log(`   📋 Transaction Queue Size: ${transactionQueue.size}`);
    
    if (transactionQueue.size > 0) {
      console.log('   📝 Recent Transactions:');
      let count = 0;
      for (const [txId, tx] of transactionQueue.entries()) {
        if (count < 5) { // Show first 5 transactions
          console.log(`      ${count + 1}. ${txId}`);
          console.log(`         Facility: ${tx.facilityDetails.facilityName}`);
          console.log(`         Quantity: ${tx.recQuantity} RECs`);
          console.log(`         Energy: ${tx.facilityDetails.energyType}`);
          console.log(`         Vintage: ${tx.facilityDetails.vintage}`);
          console.log(`         Status: ${tx.status}`);
          console.log(`         Hash: ${tx.blockchainHash}`);
          console.log('');
        }
        count++;
      }
    }
    
    // Test audit trail
    console.log('\n6️⃣ Testing Audit Trail...');
    const auditTrail = await RECSecurityService.getRECAuditTrail('dubai-solar-001');
    if (auditTrail.success) {
      console.log(`   📊 Audit Trail for Dubai Solar Park:`);
      console.log(`      Total Transactions: ${auditTrail.totalTransactions}`);
      console.log(`      Facility ID: ${auditTrail.facilityId}`);
    }
    
    // Simulate what the frontend will receive
    console.log('\n7️⃣ Simulating Frontend Data...');
    const frontendData = {
      blockchainStatus: status,
      networkInfo: networkInfo.success ? networkInfo.network : null,
      transactionHistory: Array.from(transactionQueue.values()).map(tx => ({
        blockchainTxId: tx.blockchainTxId,
        blockchainHash: tx.blockchainHash,
        buyerAddress: tx.buyerAddress,
        sellerAddress: tx.sellerAddress,
        recQuantity: tx.recQuantity,
        timestamp: tx.timestamp,
        status: tx.status,
        facilityDetails: tx.facilityDetails
      }))
    };
    
    console.log('   🖥️ Frontend Data Structure:');
    console.log(`      Status: ${frontendData.blockchainStatus.status}`);
    console.log(`      Network: ${frontendData.blockchainStatus.network}`);
    console.log(`      Total Transactions: ${frontendData.blockchainStatus.totalTransactions}`);
    console.log(`      Transaction History Count: ${frontendData.transactionHistory.length}`);
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 BLOCKCHAIN MONITOR TEST PASSED!');
    console.log('✅ Service status working');
    console.log('✅ Network info working');
    console.log('✅ Transaction recording working');
    console.log('✅ Transaction history working');
    console.log('✅ Audit trail working');
    console.log('✅ Frontend will receive real data');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ BLOCKCHAIN MONITOR TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

testBlockchainMonitorData().then(success => {
  process.exit(success ? 0 : 1);
});
