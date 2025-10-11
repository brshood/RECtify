const express = require('express');
const { validationResult, param, query, body } = require('express-validator');
const auth = require('../middleware/auth');
const RECSecurityService = require('../services/RECSecurityService');
const RECTradingService = require('../services/RECTradingService');
const router = express.Router();

// @route   GET /api/rec-security/config
// @desc    Get REC security configuration (non-sensitive)
// @access  Public
router.get('/config', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        blockchain_network: process.env.BLOCKCHAIN_NETWORK || 'localhost',
        infura_configured: !!(process.env.INFURA_API_KEY && process.env.INFURA_API_KEY !== 'your_infura_api_key_here'),
        infura_secret_configured: !!(process.env.INFURA_API_KEY_SECRET && process.env.INFURA_API_KEY_SECRET !== 'your_infura_project_secret_here'),
        local_blockchain_url: process.env.LOCAL_BLOCKCHAIN_URL || 'http://localhost:8545',
        gas_limit: process.env.BLOCKCHAIN_GAS_LIMIT || '100000',
        confirmation_timeout: process.env.BLOCKCHAIN_CONFIRMATION_TIMEOUT || '300000',
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('Error getting REC security config:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting REC security config'
    });
  }
});

// @route   GET /api/rec-security/status
// @desc    Get REC security service status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    const status = RECSecurityService.getServiceStatus();
    
    res.json({
      success: true,
      data: {
        status: status,
        service: 'REC Security Service',
        purpose: 'REC_TRANSACTION_SECURITY_AND_AUDIT',
        features: [
          'REC ownership verification',
          'Immutable transaction records',
          'Compliance audit trail',
          'Fraud prevention'
        ]
      }
    });
  } catch (error) {
    console.error('Error getting REC security status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting REC security status'
    });
  }
});

// @route   POST /api/rec-security/initialize
// @desc    Initialize REC security service
// @access  Private
router.post('/initialize', auth, async (req, res) => {
  try {
    const result = await RECSecurityService.initialize();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'REC Security service initialized successfully',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to initialize REC Security service',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error initializing REC Security service:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while initializing REC Security service'
    });
  }
});

// @route   GET /api/rec-security/network-info
// @desc    Get blockchain network information
// @access  Private
router.get('/network-info', auth, async (req, res) => {
  try {
    const networkInfo = await RECSecurityService.getNetworkInfo();
    
    if (networkInfo.success) {
      res.json({
        success: true,
        data: {
          ...networkInfo.network,
          purpose: 'REC_SECURITY_AND_AUDIT'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: networkInfo.message,
        error: networkInfo.error
      });
    }
  } catch (error) {
    console.error('Error getting network info:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting network info'
    });
  }
});

// @route   GET /api/rec-security/verify/:transactionId
// @desc    Verify REC transaction on blockchain
// @access  Private
router.get('/verify/:transactionId', [
  auth,
  param('transactionId').isMongoId().withMessage('Invalid transaction ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const transactionId = req.params.transactionId;
    const verification = await RECTradingService.verifyRECTransaction(transactionId);
    
    if (verification.success) {
      res.json({
        success: true,
        data: {
          transactionId: transactionId,
          verified: verification.verified,
          blockchainHash: verification.blockchainHash,
          purpose: 'REC_OWNERSHIP_VERIFICATION'
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: verification.message
      });
    }
  } catch (error) {
    console.error('Error verifying REC transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying REC transaction'
    });
  }
});

// @route   GET /api/rec-security/audit-trail/:facilityId
// @desc    Get REC audit trail for facility
// @access  Private
router.get('/audit-trail/:facilityId', [
  auth,
  param('facilityId').notEmpty().withMessage('Facility ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const facilityId = req.params.facilityId;
    const auditTrail = await RECTradingService.getRECAuditTrail(facilityId);
    
    if (auditTrail.success) {
      res.json({
        success: true,
        data: {
          facilityId: facilityId,
          auditTrail: auditTrail.auditTrail,
          totalTransactions: auditTrail.totalTransactions,
          purpose: 'COMPLIANCE_AND_AUDIT'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: auditTrail.message,
        error: auditTrail.error
      });
    }
  } catch (error) {
    console.error('Error getting REC audit trail:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting REC audit trail'
    });
  }
});

// @route   POST /api/rec-security/switch-network
// @desc    Switch blockchain network (development only)
// @access  Private
router.post('/switch-network', [
  auth,
  body('network').isIn(['localhost', 'sepolia', 'goerli', 'mainnet']).withMessage('Invalid network')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { network } = req.body;
    const result = await RECSecurityService.switchNetwork(network);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Switched to ${network} network for REC security`,
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to switch network',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error switching network:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while switching network'
    });
  }
});

// @route   GET /api/rec-security/trading-status
// @desc    Get REC trading service status
// @access  Private
router.get('/trading-status', auth, async (req, res) => {
  try {
    const status = RECTradingService.getServiceStatus();
    
    res.json({
      success: true,
      data: {
        service: 'REC Trading Service',
        purpose: 'SECURE_REC_TRADING_WITH_BLOCKCHAIN_AUDIT',
        status: status,
        features: [
          'Secure peer-to-peer REC trading',
          'Blockchain-based transaction security',
          'Immutable audit trail',
          'Compliance verification'
        ]
      }
    });
  } catch (error) {
    console.error('Error getting REC trading status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting REC trading status'
    });
  }
});

// @route   GET /api/rec-security/transaction-history
// @desc    Get blockchain transaction history
// @access  Private
router.get('/transaction-history', auth, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    // Get transaction history from the blockchain service
    const transactionHistory = [];
    
    // Get all transactions from the blockchain service's transaction queue
    const serviceStatus = RECSecurityService.getServiceStatus();
    if (serviceStatus.initialized) {
      // Get real transactions from the blockchain service's transaction queue
      const realTransactions = Array.from(RECSecurityService.getTransactionQueue().values()).map(tx => ({
        blockchainTxId: tx.blockchainTxId,
        blockchainHash: tx.blockchainHash,
        buyerAddress: tx.buyerAddress,
        sellerAddress: tx.sellerAddress,
        recQuantity: tx.recQuantity,
        timestamp: tx.timestamp,
        status: tx.status,
        facilityDetails: tx.facilityDetails
      }));

      // Only return real transactions - no mock data
      const transactionsToReturn = realTransactions;

      // Apply pagination
      const startIndex = parseInt(offset);
      const endIndex = startIndex + parseInt(limit);
      const paginatedTransactions = transactionsToReturn.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          transactions: paginatedTransactions,
          total: transactionsToReturn.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          purpose: 'BLOCKCHAIN_TRANSACTION_HISTORY'
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          transactions: [],
          total: 0,
          limit: parseInt(limit),
          offset: parseInt(offset),
          message: 'Blockchain service not initialized',
          purpose: 'BLOCKCHAIN_TRANSACTION_HISTORY'
        }
      });
    }
  } catch (error) {
    console.error('Error getting blockchain transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting blockchain transaction history'
    });
  }
});

module.exports = router;
