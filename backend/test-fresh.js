require('dotenv').config();

console.log('Environment check:');
console.log('BLOCKCHAIN_NETWORK:', process.env.BLOCKCHAIN_NETWORK);
console.log('INFURA_API_KEY:', process.env.INFURA_API_KEY);

// Create a fresh instance of the service
const { ethers } = require('ethers');

class FreshRECSecurityService {
  constructor() {
    this.provider = null;
    this.network = process.env.BLOCKCHAIN_NETWORK || 'localhost';
    this.isInitialized = false;
    console.log('Constructor - network set to:', this.network);
  }

  async initialize() {
    try {
      if (this.isInitialized) {
        return { success: true, message: 'Already initialized' };
      }

      // Re-read network from environment
      this.network = process.env.BLOCKCHAIN_NETWORK || 'localhost';
      console.log(`🔒 Initializing for network: ${this.network}`);

      if (this.network === 'localhost') {
        await this.initializeLocalProvider();
      } else {
        await this.initializeInfuraProvider();
      }

      this.isInitialized = true;
      console.log(`🔒 Service initialized on ${this.network}`);
      
      return { 
        success: true, 
        message: `REC Security connected to ${this.network}`,
        network: this.network,
        purpose: 'REC_TRANSACTION_SECURITY'
      };
    } catch (error) {
      console.error('❌ Failed to initialize:', error);
      return { 
        success: false, 
        message: 'Failed to initialize',
        error: error.message 
      };
    }
  }

  async initializeLocalProvider() {
    const localUrl = process.env.LOCAL_BLOCKCHAIN_URL || 'http://localhost:8545';
    console.log('🏠 Trying local provider at:', localUrl);
    
    try {
      this.provider = new ethers.JsonRpcProvider(localUrl);
      const network = await Promise.race([
        this.provider.getNetwork(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
      ]);
      console.log(`🏠 Local blockchain connected: ${network.name} (Chain ID: ${network.chainId})`);
    } catch (error) {
      console.log(`⚠️ Local blockchain not available, using mock mode`);
      this.provider = {
        getNetwork: () => Promise.resolve({ name: 'mock-local', chainId: 1337 }),
        getBlockNumber: () => Promise.resolve(12345)
      };
    }
  }

  async initializeInfuraProvider() {
    const apiKey = process.env.INFURA_API_KEY;
    console.log('☁️ Initializing Infura with API key:', apiKey);
    
    if (!apiKey) {
      throw new Error('INFURA_API_KEY is required for REC security integration');
    }

    const infuraUrl = `https://${this.network}.infura.io/v3/${apiKey}`;
    console.log('☁️ Infura URL:', infuraUrl);

    this.provider = new ethers.JsonRpcProvider(infuraUrl);
    
    // Test connection
    const network = await this.provider.getNetwork();
    console.log(`☁️ Infura connected: ${network.name} (Chain ID: ${network.chainId})`);
  }
}

async function test() {
  const service = new FreshRECSecurityService();
  const result = await service.initialize();
  console.log('Result:', result);
}

test();
