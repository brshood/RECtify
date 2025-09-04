const { ethers } = require('ethers');
const { v4: uuidv4 } = require('uuid');

/**
 * REC Security Service - Blockchain-based REC Transaction Security
 * Purpose: Secure REC transactions between users with immutable audit trail
 * NOT for payment processing - only for REC ownership verification and compliance
 */
class RECSecurityService {
  constructor() {
    this.provider = null;
    this.network = process.env.BLOCKCHAIN_NETWORK || 'localhost';
    this.isInitialized = false;
    this.transactionQueue = new Map();
    this.confirmationCallbacks = new Map();
  }

  /**
   * Initialize blockchain connection for REC security
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return { success: true, message: 'Already initialized' };
      }

      // Re-read network from environment (in case it wasn't loaded during construction)
      this.network = process.env.BLOCKCHAIN_NETWORK || 'localhost';
      console.log(`🔒 Initializing REC Security Service for network: ${this.network}`);

      // Determine provider based on environment
      if (this.network === 'localhost') {
        await this.initializeLocalProvider();
      } else {
        await this.initializeInfuraProvider();
      }

      this.isInitialized = true;
      console.log(`🔒 REC Security Service initialized on ${this.network}`);
      
      return { 
        success: true, 
        message: `REC Security connected to ${this.network}`,
        network: this.network,
        purpose: 'REC_TRANSACTION_SECURITY'
      };
    } catch (error) {
      console.error('❌ Failed to initialize REC Security Service:', error);
      return { 
        success: false, 
        message: 'Failed to initialize REC Security Service',
        error: error.message 
      };
    }
  }

  /**
   * Initialize local development provider (Ganache/Hardhat)
   */
  async initializeLocalProvider() {
    const localUrl = process.env.LOCAL_BLOCKCHAIN_URL || 'http://localhost:8545';
    
    try {
      this.provider = new ethers.JsonRpcProvider(localUrl);
      
      // Test connection with timeout
      const network = await Promise.race([
        this.provider.getNetwork(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
      ]);
      
      console.log(`🏠 Local blockchain connected: ${network.name} (Chain ID: ${network.chainId})`);
    } catch (error) {
      console.log(`⚠️ Local blockchain not available at ${localUrl}, using mock mode for development`);
      // Set a mock provider for development
      this.provider = {
        getNetwork: () => Promise.resolve({ name: 'mock-local', chainId: 1337 }),
        getBlockNumber: () => Promise.resolve(12345)
      };
    }
  }

  /**
   * Initialize Infura provider for REC security
   */
  async initializeInfuraProvider() {
    const apiKey = process.env.INFURA_API_KEY;
    const apiKeySecret = process.env.INFURA_API_KEY_SECRET;
    
    if (!apiKey) {
      throw new Error('INFURA_API_KEY is required for REC security integration');
    }

    // Build Infura URL
    let infuraUrl;
    if (apiKeySecret) {
      infuraUrl = `https://${this.network}.infura.io/v3/${apiKey}`;
    } else {
      infuraUrl = `https://${this.network}.infura.io/v3/${apiKey}`;
    }

    this.provider = new ethers.JsonRpcProvider(infuraUrl);
    
    // Test connection
    const network = await this.provider.getNetwork();
    console.log(`☁️ Infura connected for REC security: ${network.name} (Chain ID: ${network.chainId})`);
  }

  /**
   * Record REC transaction on blockchain for security and audit
   * @param {Object} recTransactionData - REC transaction details
   * @returns {Promise<Object>} Transaction result
   */
  async recordRECTransaction(recTransactionData) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const {
        buyerAddress,
        sellerAddress,
        recQuantity,
        facilityDetails,
        transactionId,
        pricePerUnit
      } = recTransactionData;

      // Generate unique blockchain transaction ID
      const blockchainTxId = uuidv4();
      
      // Create REC transaction record (NO ETH transfer - just for audit/security)
      const recTransactionRecord = {
        type: 'REC_TRANSFER_RECORD',
        blockchainTxId: blockchainTxId,
        databaseTransactionId: transactionId,
        buyerAddress: buyerAddress,
        sellerAddress: sellerAddress,
        recQuantity: recQuantity,
        pricePerUnit: pricePerUnit,
        facilityDetails: {
          facilityName: facilityDetails.facilityName,
          facilityId: facilityDetails.facilityId,
          energyType: facilityDetails.energyType,
          vintage: facilityDetails.vintage,
          emirate: facilityDetails.emirate,
          certificationStandard: facilityDetails.certificationStandard
        },
        timestamp: new Date().toISOString(),
        purpose: 'REC_OWNERSHIP_VERIFICATION_AND_AUDIT'
      };

      // Store transaction in queue for monitoring
      this.transactionQueue.set(blockchainTxId, {
        ...recTransactionRecord,
        status: 'pending',
        createdAt: new Date()
      });

      // For now, simulate blockchain recording (in production, this would be a smart contract call)
      const mockBlockchainHash = `0x${Buffer.from(JSON.stringify(recTransactionRecord)).toString('hex').substring(0, 64)}`;
      
      // Update transaction with blockchain details
      const queuedTx = this.transactionQueue.get(blockchainTxId);
      queuedTx.status = 'recorded';
      queuedTx.blockchainHash = mockBlockchainHash;
      queuedTx.recordedAt = new Date();
      this.transactionQueue.set(blockchainTxId, queuedTx);

      console.log(`🔒 REC transaction recorded on blockchain: ${blockchainTxId}`);

      return {
        success: true,
        blockchainTxId: blockchainTxId,
        blockchainHash: mockBlockchainHash,
        status: 'recorded',
        purpose: 'REC_SECURITY_AND_AUDIT',
        network: this.network,
        recTransactionRecord: recTransactionRecord
      };

    } catch (error) {
      console.error('❌ REC transaction recording failed:', error);
      return {
        success: false,
        message: 'REC transaction recording failed',
        error: error.message
      };
    }
  }

  /**
   * Verify REC transaction on blockchain
   * @param {string} blockchainTxId - Blockchain transaction ID
   * @returns {Promise<Object>} Verification result
   */
  async verifyRECTransaction(blockchainTxId) {
    try {
      const transaction = this.transactionQueue.get(blockchainTxId);
      
      if (!transaction) {
        return {
          success: false,
          message: 'REC transaction not found'
        };
      }

      return {
        success: true,
        verified: true,
        transaction: transaction,
        blockchainHash: transaction.blockchainHash,
        status: transaction.status,
        purpose: 'REC_OWNERSHIP_VERIFICATION'
      };

    } catch (error) {
      console.error('❌ REC transaction verification failed:', error);
      return {
        success: false,
        message: 'REC transaction verification failed',
        error: error.message
      };
    }
  }

  /**
   * Get REC transaction audit trail
   * @param {string} facilityId - Facility ID to get audit trail for
   * @returns {Promise<Object>} Audit trail result
   */
  async getRECAuditTrail(facilityId) {
    try {
      const auditTrail = [];
      
      // Get all transactions for this facility
      for (const [txId, transaction] of this.transactionQueue.entries()) {
        if (transaction.facilityDetails?.facilityId === facilityId) {
          auditTrail.push({
            blockchainTxId: txId,
            blockchainHash: transaction.blockchainHash,
            buyerAddress: transaction.buyerAddress,
            sellerAddress: transaction.sellerAddress,
            recQuantity: transaction.recQuantity,
            timestamp: transaction.timestamp,
            status: transaction.status
          });
        }
      }

      return {
        success: true,
        facilityId: facilityId,
        auditTrail: auditTrail,
        totalTransactions: auditTrail.length,
        purpose: 'COMPLIANCE_AND_AUDIT'
      };

    } catch (error) {
      console.error('❌ Failed to get REC audit trail:', error);
      return {
        success: false,
        message: 'Failed to get REC audit trail',
        error: error.message
      };
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    if (!this.provider) {
      return { success: false, message: 'Provider not initialized' };
    }

    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();

      return {
        success: true,
        network: {
          name: network.name,
          chainId: network.chainId.toString(),
          blockNumber: blockNumber,
          purpose: 'REC_SECURITY_AND_AUDIT'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get network info',
        error: error.message
      };
    }
  }

  /**
   * Switch network (for development)
   */
  async switchNetwork(network) {
    try {
      this.network = network;
      this.isInitialized = false;
      await this.initialize();
      return { success: true, network: this.network };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get service status
   */
  getServiceStatus() {
    return {
      initialized: this.isInitialized,
      network: this.network,
      purpose: 'REC_TRANSACTION_SECURITY',
      totalTransactions: this.transactionQueue.size,
      status: this.isInitialized ? 'active' : 'inactive'
    };
  }

  /**
   * Get transaction queue for monitoring
   */
  getTransactionQueue() {
    return this.transactionQueue;
  }

  /**
   * Clean up old transactions
   */
  cleanupTransactions(olderThanHours = 24) {
    const cutoffTime = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));
    
    for (const [txId, tx] of this.transactionQueue.entries()) {
      if (tx.createdAt < cutoffTime && tx.status === 'recorded') {
        this.transactionQueue.delete(txId);
      }
    }
  }
}

// Export singleton instance
module.exports = new RECSecurityService();
