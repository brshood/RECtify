const { ethers } = require('ethers');
require('dotenv').config({ path: './backend/.env' });

async function testInfuraConnection() {
  try {
    console.log('🔍 Testing Infura connection...');
    console.log('Network:', process.env.BLOCKCHAIN_NETWORK);
    
    const infuraUrl = `https://${process.env.BLOCKCHAIN_NETWORK}.infura.io/v3/${process.env.INFURA_API_KEY}`;
    
    const provider = new ethers.JsonRpcProvider(infuraUrl);
    
    // Test connection
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    console.log('✅ Infura connection successful!');
    console.log('Network:', network.name, '(Chain ID:', network.chainId.toString() + ')');
    console.log('Current block:', blockNumber);
    
    return true;
  } catch (error) {
    console.error('❌ Infura connection failed:', error.message);
    return false;
  }
}

testInfuraConnection().then(success => {
  process.exit(success ? 0 : 1);
});
