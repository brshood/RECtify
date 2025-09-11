const RECSecurityService = require('./RECSecurityService');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const RECHolding = require('../models/RECHolding');
const User = require('../models/User');

/**
 * REC Trading Service - Secure Peer-to-Peer REC Trading
 * Purpose: Handle REC transactions with blockchain security and audit trail
 * NOT for payment processing - only for REC ownership and compliance
 */
class RECTradingService {
  constructor() {
    this.recSecurityService = RECSecurityService;
    this.isInitialized = false;
  }

  /**
   * Initialize REC trading service
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return { success: true, message: 'REC Trading service already initialized' };
      }

      // Initialize REC security service
      const securityInit = await this.recSecurityService.initialize();
      if (!securityInit.success) {
        throw new Error(`REC Security initialization failed: ${securityInit.message}`);
      }

      this.isInitialized = true;
      console.log('✅ REC Trading service initialized successfully');
      
      return { 
        success: true, 
        message: 'REC Trading service initialized',
        security: securityInit
      };
    } catch (error) {
      console.error('❌ Failed to initialize REC Trading service:', error);
      return { 
        success: false, 
        message: 'Failed to initialize REC Trading service',
        error: error.message 
      };
    }
  }

  /**
   * Execute secure REC trade between buyer and seller
   * @param {Object} tradeData - Trade execution data
   * @returns {Promise<Object>} Trade execution result
   */
  async executeSecureRECTrade(tradeData) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const {
        buyOrderId,
        sellOrderId,
        quantity,
        buyerId,
        sellerId,
        pricePerUnit,
        facilityDetails
      } = tradeData;

      // Validate orders exist and are matchable
      const buyOrder = await Order.findById(buyOrderId);
      const sellOrder = await Order.findById(sellOrderId);

      if (!buyOrder || !sellOrder) {
        throw new Error('One or both orders not found');
      }

      if (!buyOrder.canMatch() || !sellOrder.canMatch()) {
        throw new Error('Orders cannot be matched in current status');
      }

      // Create transaction record in database
      const transaction = new Transaction({
        buyerId,
        sellerId,
        buyOrderId,
        sellOrderId,
        facilityName: facilityDetails.facilityName,
        facilityId: facilityDetails.facilityId,
        energyType: facilityDetails.energyType,
        vintage: facilityDetails.vintage,
        emirate: facilityDetails.emirate,
        certificationStandard: facilityDetails.certificationStandard,
        quantity,
        pricePerUnit,
        totalAmount: quantity * pricePerUnit,
        buyerPlatformFee: quantity * pricePerUnit * 0.02, // 2%
        sellerPlatformFee: quantity * pricePerUnit * 0.02, // 2%
        blockchainFee: 5.00, // Fixed AED 5.00
        status: 'processing',
        settlementStatus: 'pending'
      });

      await transaction.save();

      // Get user addresses (mock addresses for now - in production these would be from user profiles)
      const buyerAddress = await this.getUserWalletAddress(buyerId);
      const sellerAddress = await this.getUserWalletAddress(sellerId);

      // Record REC transaction on blockchain for security and audit
      const blockchainRecord = await this.recSecurityService.recordRECTransaction({
        buyerAddress,
        sellerAddress,
        recQuantity: quantity,
        facilityDetails,
        transactionId: transaction._id.toString(),
        pricePerUnit
      });

      if (!blockchainRecord.success) {
        await transaction.markFailed('Blockchain recording failed');
        throw new Error(`Blockchain recording failed: ${blockchainRecord.message}`);
      }

      // Update transaction with blockchain details
      transaction.blockchainTxHash = blockchainRecord.blockchainHash;
      transaction.internalRef = blockchainRecord.blockchainTxId;
      await transaction.save();

      // Complete the REC transfer in database
      await this.completeRECTransfer(transaction);

      // Update order statuses
      await this.updateOrderStatuses(transaction);

      // Update user portfolio totals
      await this.updateUserPortfolios(transaction);

      // Mark transaction as completed
      await transaction.markCompleted();

      console.log(`✅ Secure REC trade completed: ${transaction._id}`);

      return {
        success: true,
        transactionId: transaction._id,
        blockchainTxHash: blockchainRecord.blockchainHash,
        blockchainTxId: blockchainRecord.blockchainTxId,
        status: 'completed',
        message: 'Secure REC trade completed successfully',
        purpose: 'REC_OWNERSHIP_TRANSFER_WITH_BLOCKCHAIN_SECURITY'
      };

    } catch (error) {
      console.error('❌ Secure REC trade execution failed:', error);
      return {
        success: false,
        message: 'Secure REC trade execution failed',
        error: error.message
      };
    }
  }

  /**
   * Complete REC transfer in database
   */
  async completeRECTransfer(transaction) {
    const { sellerId, buyerId, quantity, facilityDetails, pricePerUnit } = transaction;

    // Ensure facilityId exists, create fallback if needed
    const facilityId = facilityDetails.facilityId || `${facilityDetails.facilityName}-${facilityDetails.vintage}`;

    // Get seller's holding
    const sellerHolding = await RECHolding.findOne({
      userId: sellerId,
      facilityId: facilityId,
      energyType: facilityDetails.energyType,
      vintage: facilityDetails.vintage,
      certificationStandard: facilityDetails.certificationStandard
    });

    if (!sellerHolding || sellerHolding.quantity < quantity) {
      throw new Error('Insufficient REC quantity in seller holding');
    }

    // Reduce seller's holding
    sellerHolding.quantity -= quantity;
    if (sellerHolding.quantity === 0) {
      await RECHolding.findByIdAndDelete(sellerHolding._id);
    } else {
      await sellerHolding.save();
    }

    // Add to buyer's holding
    let buyerHolding = await RECHolding.findOne({
      userId: buyerId,
      facilityId: facilityId,
      energyType: facilityDetails.energyType,
      vintage: facilityDetails.vintage,
      certificationStandard: facilityDetails.certificationStandard
    });

    if (buyerHolding) {
      const newTotalQuantity = buyerHolding.quantity + quantity;
      const newTotalValue = buyerHolding.totalValue + (quantity * pricePerUnit);
      buyerHolding.quantity = newTotalQuantity;
      buyerHolding.averagePurchasePrice = newTotalValue / newTotalQuantity;
      buyerHolding.totalValue = newTotalValue;
      await buyerHolding.save();
    } else {
      buyerHolding = new RECHolding({
        userId: buyerId,
        facilityName: facilityDetails.facilityName,
        facilityId: facilityId,
        energyType: facilityDetails.energyType,
        vintage: facilityDetails.vintage,
        quantity,
        averagePurchasePrice: pricePerUnit,
        totalValue: quantity * pricePerUnit,
        emirate: facilityDetails.emirate,
        certificationStandard: facilityDetails.certificationStandard
      });
      await buyerHolding.save();
    }
  }

  /**
   * Update order statuses after trade completion
   */
  async updateOrderStatuses(transaction) {
    const { buyOrderId, sellOrderId, quantity } = transaction;

    // Update buy order
    const buyOrder = await Order.findById(buyOrderId);
    if (buyOrder) {
      await buyOrder.fillPartial(quantity);
    }

    // Update sell order
    const sellOrder = await Order.findById(sellOrderId);
    if (sellOrder) {
      await sellOrder.fillPartial(quantity);
    }
  }

  /**
   * Update user portfolio totals
   */
  async updateUserPortfolios(transaction) {
    const { buyerId, sellerId } = transaction;

    // Update buyer portfolio
    const buyerSummary = await RECHolding.getUserTotalRECs(buyerId);
    await User.findByIdAndUpdate(buyerId, {
      totalRecs: buyerSummary.totalQuantity,
      portfolioValue: buyerSummary.totalValue
    });

    // Update seller portfolio
    const sellerSummary = await RECHolding.getUserTotalRECs(sellerId);
    await User.findByIdAndUpdate(sellerId, {
      totalRecs: sellerSummary.totalQuantity,
      portfolioValue: sellerSummary.totalValue
    });
  }

  /**
   * Get user wallet address (placeholder for wallet integration)
   */
  async getUserWalletAddress(userId) {
    // This would integrate with user wallet profiles
    // For now, return a mock address based on user ID
    return `0x${userId.toString().padStart(40, '0')}`;
  }

  /**
   * Verify REC transaction on blockchain
   */
  async verifyRECTransaction(transactionId) {
    try {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return { success: false, message: 'Transaction not found' };
      }

      if (!transaction.internalRef) {
        return { success: false, message: 'No blockchain reference found' };
      }

      const verification = await this.recSecurityService.verifyRECTransaction(transaction.internalRef);
      
      return {
        success: true,
        transactionId: transactionId,
        verified: verification.verified,
        blockchainHash: verification.blockchainHash,
        purpose: 'REC_OWNERSHIP_VERIFICATION'
      };
    } catch (error) {
      return {
        success: false,
        message: 'REC transaction verification failed',
        error: error.message
      };
    }
  }

  /**
   * Get REC audit trail for compliance
   */
  async getRECAuditTrail(facilityId) {
    try {
      const auditTrail = await this.recSecurityService.getRECAuditTrail(facilityId);
      return auditTrail;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get REC audit trail',
        error: error.message
      };
    }
  }

  /**
   * Get service status
   */
  getServiceStatus() {
    return {
      initialized: this.isInitialized,
      securityService: this.recSecurityService.getServiceStatus(),
      purpose: 'SECURE_REC_TRADING_WITH_BLOCKCHAIN_AUDIT'
    };
  }
}

// Export singleton instance
module.exports = new RECTradingService();
