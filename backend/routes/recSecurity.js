const express = require('express');
const { validationResult, param, query, body } = require('express-validator');
const auth = require('../middleware/auth');
const RECSecurityService = require('../services/RECSecurityService');
const RECTradingService = require('../services/RECTradingService');
const router = express.Router();

// @route   GET /api/rec-security/status
// @desc    Get REC security service status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    const status = RECSecurityService.getServiceStatus();
    
    res.json({
      success: true,
      data: {
        service: 'REC Security Service',
        purpose: 'REC_TRANSACTION_SECURITY_AND_AUDIT',
        status: status,
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
      // In a real implementation, this would fetch from the blockchain service
      // For now, we'll return mock data that represents the blockchain records
      const mockTransactions = [
        {
          blockchainTxId: 'tx_001',
          blockchainHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          buyerAddress: '0xBuyer1234567890123456789012345678901234567890',
          sellerAddress: '0xSeller1234567890123456789012345678901234567890',
          recQuantity: 100,
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          status: 'recorded',
          facilityDetails: {
            facilityName: 'Solar Farm Alpha',
            facilityId: 'SF001',
            energyType: 'solar',
            vintage: 2024,
            emirate: 'Dubai',
            certificationStandard: 'I-REC'
          }
        },
        {
          blockchainTxId: 'tx_002',
          blockchainHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          buyerAddress: '0xBuyer78901234567890123456789012345678901234567890',
          sellerAddress: '0xSeller78901234567890123456789012345678901234567890',
          recQuantity: 250,
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          status: 'recorded',
          facilityDetails: {
            facilityName: 'Wind Farm Beta',
            facilityId: 'WF002',
            energyType: 'wind',
            vintage: 2024,
            emirate: 'Abu Dhabi',
            certificationStandard: 'I-REC'
          }
        },
        {
          blockchainTxId: 'tx_003',
          blockchainHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
          buyerAddress: '0xBuyer45678901234567890123456789012345678901234567890',
          sellerAddress: '0xSeller45678901234567890123456789012345678901234567890',
          recQuantity: 75,
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'recorded',
          facilityDetails: {
            facilityName: 'Hydro Plant Gamma',
            facilityId: 'HP003',
            energyType: 'hydro',
            vintage: 2023,
            emirate: 'Sharjah',
            certificationStandard: 'I-REC'
          }
        }
      ];

      // Apply pagination
      const startIndex = parseInt(offset);
      const endIndex = startIndex + parseInt(limit);
      const paginatedTransactions = mockTransactions.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          transactions: paginatedTransactions,
          total: mockTransactions.length,
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
