const express = require('express');
const { body, validationResult, param } = require('express-validator');
const auth = require('../middleware/auth');
const RECHolding = require('../models/RECHolding');
const User = require('../models/User');
const router = express.Router();

// @route   GET /api/holdings
// @desc    Get user's REC holdings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const holdings = await RECHolding.find({ userId: req.user.userId })
      .sort({ acquisitionDate: -1 });
    
    const summary = await RECHolding.getUserTotalRECs(req.user.userId);
    const byFacility = await RECHolding.getUserHoldingsByFacility(req.user.userId);
    
    res.json({
      success: true,
      data: {
        holdings,
        summary,
        byFacility
      }
    });
  } catch (error) {
    console.error('Error fetching holdings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching holdings'
    });
  }
});

// @route   GET /api/holdings/:id
// @desc    Get specific holding details
// @access  Private
router.get('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid holding ID')
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

    const holding = await RECHolding.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: 'Holding not found'
      });
    }

    res.json({
      success: true,
      data: holding
    });
  } catch (error) {
    console.error('Error fetching holding:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching holding'
    });
  }
});

// @route   POST /api/holdings
// @desc    Create new REC holding (for admin/system use)
// @access  Private
router.post('/', [
  auth,
  body('facilityName').notEmpty().trim().withMessage('Facility name is required'),
  body('facilityId').notEmpty().trim().withMessage('Facility ID is required'),
  body('energyType').isIn(['solar', 'wind', 'hydro', 'biomass', 'geothermal', 'nuclear']).withMessage('Invalid energy type'),
  body('vintage').isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('Invalid vintage year'),
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('averagePurchasePrice').isFloat({ min: 0.01 }).withMessage('Purchase price must be greater than 0'),
  body('emirate').isIn(['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain']).withMessage('Invalid emirate'),
  body('certificationStandard').optional().isIn(['I-REC', 'TIGR', 'Green-e', 'EKOenergy']).withMessage('Invalid certification standard')
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

    const {
      facilityName,
      facilityId,
      energyType,
      vintage,
      quantity,
      averagePurchasePrice,
      emirate,
      certificationStandard
    } = req.body;

    // Check if holding already exists for this user and facility
    let holding = await RECHolding.findOne({
      userId: req.user.userId,
      facilityId,
      energyType,
      vintage,
      certificationStandard
    });

    if (holding) {
      // Update existing holding
      const newTotalQuantity = holding.quantity + quantity;
      const newTotalValue = (holding.totalValue + (quantity * averagePurchasePrice));
      const newAveragePrice = newTotalValue / newTotalQuantity;

      holding.quantity = newTotalQuantity;
      holding.averagePurchasePrice = newAveragePrice;
      holding.totalValue = newTotalValue;
      await holding.save();
    } else {
      // Create new holding
      holding = new RECHolding({
        userId: req.user.userId,
        facilityName,
        facilityId,
        energyType,
        vintage,
        quantity,
        averagePurchasePrice,
        emirate,
        certificationStandard
      });
      await holding.save();
    }

    // Update user's total RECs
    const userSummary = await RECHolding.getUserTotalRECs(req.user.userId);
    await User.findByIdAndUpdate(req.user.userId, {
      totalRecs: userSummary.totalQuantity,
      portfolioValue: userSummary.totalValue
    });

    res.status(201).json({
      success: true,
      message: 'REC holding created/updated successfully',
      data: holding
    });
  } catch (error) {
    console.error('Error creating holding:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating holding'
    });
  }
});

// @route   PUT /api/holdings/:id/lock
// @desc    Lock REC holding (prevent trading)
// @access  Private
router.put('/:id/lock', [
  auth,
  param('id').isMongoId().withMessage('Invalid holding ID'),
  body('lockUntil').optional().isISO8601().withMessage('Invalid lock until date')
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

    const holding = await RECHolding.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: 'Holding not found'
      });
    }

    const lockUntil = req.body.lockUntil ? new Date(req.body.lockUntil) : null;
    await holding.lock(lockUntil);

    res.json({
      success: true,
      message: 'Holding locked successfully',
      data: holding
    });
  } catch (error) {
    console.error('Error locking holding:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while locking holding'
    });
  }
});

// @route   PUT /api/holdings/:id/unlock
// @desc    Unlock REC holding
// @access  Private
router.put('/:id/unlock', [
  auth,
  param('id').isMongoId().withMessage('Invalid holding ID')
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

    const holding = await RECHolding.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: 'Holding not found'
      });
    }

    await holding.unlock();

    res.json({
      success: true,
      message: 'Holding unlocked successfully',
      data: holding
    });
  } catch (error) {
    console.error('Error unlocking holding:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unlocking holding'
    });
  }
});

// @route   DELETE /api/holdings/:id
// @desc    Delete REC holding (admin only or when quantity is 0)
// @access  Private
router.delete('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid holding ID')
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

    const holding = await RECHolding.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: 'Holding not found'
      });
    }

    // Only allow deletion if quantity is 0 or user is admin
    const user = await User.findById(req.user.userId);
    if (holding.quantity > 0 && user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete holding with remaining quantity'
      });
    }

    await RECHolding.findByIdAndDelete(req.params.id);

    // Update user's total RECs
    const userSummary = await RECHolding.getUserTotalRECs(req.user.userId);
    await User.findByIdAndUpdate(req.user.userId, {
      totalRecs: userSummary.totalQuantity,
      portfolioValue: userSummary.totalValue
    });

    res.json({
      success: true,
      message: 'Holding deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting holding:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting holding'
    });
  }
});

module.exports = router;
