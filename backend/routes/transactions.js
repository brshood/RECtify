const express = require('express');
const { validationResult, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const router = express.Router();

// @route   GET /api/transactions
// @desc    Get user's transactions
// @access  Private
router.get('/', [
  auth,
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'disputed']).withMessage('Invalid status')
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

    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status;

    let query = {
      $or: [
        { buyerId: req.user.userId },
        { sellerId: req.user.userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('buyerId', 'firstName lastName company')
      .populate('sellerId', 'firstName lastName company')
      .populate('buyOrderId')
      .populate('sellOrderId')
      .lean();

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transactions'
    });
  }
});

// @route   GET /api/transactions/history
// @desc    Get all completed transactions for order book display
// @access  Private
router.get('/history', [
  auth,
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
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

    const limit = parseInt(req.query.limit) || 20;

    const transactions = await Transaction.find({
      status: 'completed'
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('buyerId', 'firstName lastName company')
      .populate('sellerId', 'firstName lastName company')
      .lean();

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction history'
    });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get transaction details
// @access  Private
router.get('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid transaction ID')
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

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      $or: [
        { buyerId: req.user.userId },
        { sellerId: req.user.userId }
      ]
    })
    .populate('buyerId', 'firstName lastName company')
    .populate('sellerId', 'firstName lastName company')
    .populate('buyOrderId')
    .populate('sellOrderId');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction'
    });
  }
});

// @route   GET /api/transactions/market/stats
// @desc    Get market statistics
// @access  Private
router.get('/market/stats', [
  auth,
  query('timeframe').optional().isIn(['24h', '7d', '30d', '1y']).withMessage('Invalid timeframe')
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

    const timeframe = req.query.timeframe || '30d';
    const stats = await Transaction.getMarketStats(timeframe);

    res.json({
      success: true,
      data: {
        timeframe,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching market stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching market stats'
    });
  }
});

// @route   GET /api/transactions/market/price-history/:facilityName
// @desc    Get price history for a facility
// @access  Private
router.get('/market/price-history/:facilityName', [
  auth,
  param('facilityName').notEmpty().withMessage('Facility name is required'),
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
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

    const facilityName = req.params.facilityName;
    const days = parseInt(req.query.days) || 30;

    const priceHistory = await Transaction.getPriceHistory(facilityName, days);

    res.json({
      success: true,
      data: {
        facilityName,
        days,
        priceHistory
      }
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching price history'
    });
  }
});

// @route   PUT /api/transactions/:id/complete
// @desc    Mark transaction as completed (admin only)
// @access  Private
router.put('/:id/complete', [
  auth,
  param('id').isMongoId().withMessage('Invalid transaction ID')
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

    // Check if user has admin permissions
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin' && user.role !== 'compliance-officer') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is already completed'
      });
    }

    await transaction.markCompleted();

    res.json({
      success: true,
      message: 'Transaction marked as completed',
      data: transaction
    });
  } catch (error) {
    console.error('Error completing transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing transaction'
    });
  }
});

// @route   PUT /api/transactions/:id/fail
// @desc    Mark transaction as failed (admin only)
// @access  Private
router.put('/:id/fail', [
  auth,
  param('id').isMongoId().withMessage('Invalid transaction ID')
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

    // Check if user has admin permissions
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin' && user.role !== 'compliance-officer') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot fail a completed transaction'
      });
    }

    const reason = req.body.reason || 'Administrative action';
    await transaction.markFailed(reason);

    res.json({
      success: true,
      message: 'Transaction marked as failed',
      data: transaction
    });
  } catch (error) {
    console.error('Error failing transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while failing transaction'
    });
  }
});

module.exports = router;
