const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const RECHolding = require('../models/RECHolding');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const router = express.Router();

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', [
  auth,
  query('status').optional().isIn(['pending', 'partial', 'completed', 'cancelled', 'expired']).withMessage('Invalid status'),
  query('type').optional().isIn(['buy', 'sell']).withMessage('Invalid order type'),
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

    const { status, type, limit = 50 } = req.query;
    const query = { userId: req.user.userId };
    
    if (status) query.status = status;
    if (type) query.orderType = type;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('holdingId')
      .lean();

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @route   GET /api/orders/book
// @desc    Get public order book
// @access  Private
router.get('/book', [
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

    const limit = parseInt(req.query.limit) || 50;
    const orderBook = await Order.getOrderBook(limit);

    res.json({
      success: true,
      data: orderBook
    });
  } catch (error) {
    console.error('Error fetching order book:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order book'
    });
  }
});

// @route   GET /api/orders/available-for-buy
// @desc    Get available sell orders for buy form dropdowns
// @access  Private
router.get('/available-for-buy', [
  auth,
  query('energyType').optional().isIn(['solar', 'wind', 'hydro', 'biomass', 'geothermal', 'nuclear']).withMessage('Invalid energy type'),
  query('emirate').optional().isIn(['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain']).withMessage('Invalid emirate'),
  query('vintage').optional().isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('Invalid vintage year')
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

    const { energyType, emirate, vintage } = req.query;
    
    // Build query for available sell orders
    const orderQuery = {
      orderType: 'sell',
      status: { $in: ['pending', 'partial'] },
      isPublic: true,
      expiresAt: { $gt: new Date() },
      userId: { $ne: req.user.userId } // Don't show user's own orders
    };

    // Add filters if provided
    if (energyType) orderQuery.energyType = energyType;
    if (emirate) orderQuery.emirate = emirate;
    if (vintage) orderQuery.vintage = parseInt(vintage);

    const sellOrders = await Order.find(orderQuery)
      .populate('userId', 'firstName lastName company')
      .sort({ price: 1, createdAt: 1 }) // Lowest price first
      .lean();

    // Group by facility and energy type to get unique options
    const facilities = {};
    const energyTypes = new Set();
    const emirates = new Set();
    const vintages = new Set();

    sellOrders.forEach(order => {
      // Group by facility
      const facilityKey = `${order.facilityName}-${order.energyType}-${order.vintage}`;
      if (!facilities[facilityKey]) {
        facilities[facilityKey] = {
          facilityName: order.facilityName,
          facilityId: order.facilityId,
          energyType: order.energyType,
          vintage: order.vintage,
          emirate: order.emirate,
          minPrice: order.price,
          maxPrice: order.price,
          totalQuantity: order.remainingQuantity,
          orderCount: 1
        };
      } else {
        facilities[facilityKey].minPrice = Math.min(facilities[facilityKey].minPrice, order.price);
        facilities[facilityKey].maxPrice = Math.max(facilities[facilityKey].maxPrice, order.price);
        facilities[facilityKey].totalQuantity += order.remainingQuantity;
        facilities[facilityKey].orderCount += 1;
      }

      // Collect unique values for dropdowns
      energyTypes.add(order.energyType);
      emirates.add(order.emirate);
      vintages.add(order.vintage);
    });

    // Convert to arrays and sort
    const facilityOptions = Object.values(facilities).sort((a, b) => {
      // Sort by energy type, then by facility name
      if (a.energyType !== b.energyType) {
        return a.energyType.localeCompare(b.energyType);
      }
      return a.facilityName.localeCompare(b.facilityName);
    });

    res.json({
      success: true,
      data: {
        facilities: facilityOptions,
        energyTypes: Array.from(energyTypes).sort(),
        emirates: Array.from(emirates).sort(),
        vintages: Array.from(vintages).sort((a, b) => b - a), // Most recent first
        totalSellOrders: sellOrders.length
      }
    });
  } catch (error) {
    console.error('Error fetching available sell orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching available sell orders'
    });
  }
});

// @route   POST /api/orders/buy
// @desc    Create buy order
// @access  Private
router.post('/buy', [
  auth,
  body('facilityName').notEmpty().trim().withMessage('Facility name is required'),
  body('facilityId').notEmpty().trim().withMessage('Facility ID is required'),
  body('energyType').isIn(['solar', 'wind', 'hydro', 'biomass', 'geothermal', 'nuclear']).withMessage('Invalid energy type'),
  body('vintage').isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('Invalid vintage year'),
  body('quantity').isFloat({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('emirate').isIn(['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain']).withMessage('Invalid emirate'),
  body('purpose').isIn(['compliance', 'voluntary', 'resale', 'offset']).withMessage('Invalid purpose'),
  body('certificationStandard').optional().isIn(['I-REC', 'TIGR', 'Green-e', 'EKOenergy']).withMessage('Invalid certification standard'),
  body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date'),
  body('allowPartialFill').optional().isBoolean().withMessage('Allow partial fill must be boolean'),
  body('minFillQuantity').optional().isFloat({ min: 1 }).withMessage('Minimum fill quantity must be at least 1')
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

    const user = await User.findById(req.user.userId);
    if (!user.permissions.canTrade) {
      return res.status(403).json({
        success: false,
        message: 'User does not have trading permissions'
      });
    }

    const {
      facilityName,
      facilityId,
      energyType,
      vintage,
      quantity,
      price,
      emirate,
      purpose,
      certificationStandard = 'I-REC',
      expiresAt,
      allowPartialFill = true,
      minFillQuantity = 1
    } = req.body;

    const order = new Order({
      userId: req.user.userId,
      orderType: 'buy',
      facilityName,
      facilityId,
      energyType,
      vintage,
      quantity,
      price,
      emirate,
      purpose,
      certificationStandard,
      allowPartialFill,
      minFillQuantity,
      createdBy: `${user.firstName} ${user.lastName}`,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await order.save();

    // Try to match with existing sell orders
    const matchingOrders = await Order.findMatchingOrders(order);
    let matchedQuantity = 0;

    for (const sellOrder of matchingOrders) {
      if (matchedQuantity >= order.remainingQuantity) break;
      
      const matchQuantity = Math.min(
        order.remainingQuantity - matchedQuantity,
        sellOrder.remainingQuantity
      );

      if (matchQuantity >= Math.max(order.minFillQuantity, sellOrder.minFillQuantity)) {
        // Create transaction
        const transaction = new Transaction({
          buyerId: order.userId,
          sellerId: sellOrder.userId,
          buyOrderId: order._id,
          sellOrderId: sellOrder._id,
          facilityName: order.facilityName,
          facilityId: order.facilityId,
          energyType: order.energyType,
          vintage: order.vintage,
          emirate: order.emirate,
          certificationStandard: order.certificationStandard,
          quantity: matchQuantity,
          pricePerUnit: sellOrder.price, // Seller's price takes precedence
          buyerPlatformFee: matchQuantity * sellOrder.price * order.platformFeeRate,
          sellerPlatformFee: matchQuantity * sellOrder.price * sellOrder.platformFeeRate,
          blockchainFee: order.blockchainFee
        });

        await transaction.save();

        // Update orders
        await order.fillPartial(matchQuantity);
        await sellOrder.fillPartial(matchQuantity);
        
        matchedQuantity += matchQuantity;

        // Transfer RECs from seller to buyer
        const sellerHolding = await RECHolding.findById(sellOrder.holdingId);
        if (sellerHolding && sellerHolding.quantity >= matchQuantity) {
          // Reduce seller's holding
          sellerHolding.quantity -= matchQuantity;
          if (sellerHolding.quantity === 0) {
            await RECHolding.findByIdAndDelete(sellerHolding._id);
          } else {
            await sellerHolding.save();
          }

          // Add to buyer's holding
          let buyerHolding = await RECHolding.findOne({
            userId: order.userId,
            facilityId: order.facilityId,
            energyType: order.energyType,
            vintage: order.vintage,
            certificationStandard: order.certificationStandard
          });

          if (buyerHolding) {
            const newTotalQuantity = buyerHolding.quantity + matchQuantity;
            const newTotalValue = buyerHolding.totalValue + (matchQuantity * sellOrder.price);
            buyerHolding.quantity = newTotalQuantity;
            buyerHolding.averagePurchasePrice = newTotalValue / newTotalQuantity;
            buyerHolding.totalValue = newTotalValue;
            await buyerHolding.save();
          } else {
            buyerHolding = new RECHolding({
              userId: order.userId,
              facilityName: order.facilityName,
              facilityId: order.facilityId,
              energyType: order.energyType,
              vintage: order.vintage,
              quantity: matchQuantity,
              averagePurchasePrice: sellOrder.price,
              emirate: order.emirate,
              certificationStandard: order.certificationStandard
            });
            await buyerHolding.save();
          }

          // Update user totals
          const buyerSummary = await RECHolding.getUserTotalRECs(order.userId);
          await User.findByIdAndUpdate(order.userId, {
            totalRecs: buyerSummary.totalQuantity,
            portfolioValue: buyerSummary.totalValue
          });

          const sellerSummary = await RECHolding.getUserTotalRECs(sellOrder.userId);
          await User.findByIdAndUpdate(sellOrder.userId, {
            totalRecs: sellerSummary.totalQuantity,
            portfolioValue: sellerSummary.totalValue
          });
        }
      }
    }

    const updatedOrder = await Order.findById(order._id).populate('userId', 'firstName lastName company');

    res.status(201).json({
      success: true,
      message: 'Buy order created successfully',
      data: {
        order: updatedOrder,
        matchedQuantity
      }
    });
  } catch (error) {
    console.error('Error creating buy order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating buy order'
    });
  }
});

// @route   POST /api/orders/sell
// @desc    Create sell order
// @access  Private
router.post('/sell', [
  auth,
  body('holdingId').isMongoId().withMessage('Valid holding ID is required'),
  body('quantity').isFloat({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date'),
  body('allowPartialFill').optional().isBoolean().withMessage('Allow partial fill must be boolean'),
  body('minFillQuantity').optional().isFloat({ min: 1 }).withMessage('Minimum fill quantity must be at least 1')
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

    const user = await User.findById(req.user.userId);
    if (!user.permissions.canTrade) {
      return res.status(403).json({
        success: false,
        message: 'User does not have trading permissions'
      });
    }

    const {
      holdingId,
      quantity,
      price,
      expiresAt,
      allowPartialFill = true,
      minFillQuantity = 1
    } = req.body;

    // Verify holding ownership and availability
    const holding = await RECHolding.findOne({
      _id: holdingId,
      userId: req.user.userId
    });

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: 'REC holding not found'
      });
    }

    if (!holding.canTrade()) {
      return res.status(400).json({
        success: false,
        message: 'REC holding is locked and cannot be traded'
      });
    }

    if (holding.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient REC quantity in holding'
      });
    }

    const order = new Order({
      userId: req.user.userId,
      orderType: 'sell',
      facilityName: holding.facilityName,
      facilityId: holding.facilityId,
      energyType: holding.energyType,
      vintage: holding.vintage,
      quantity,
      price,
      emirate: holding.emirate,
      certificationStandard: holding.certificationStandard,
      holdingId,
      allowPartialFill,
      minFillQuantity,
      createdBy: `${user.firstName} ${user.lastName}`,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await order.save();

    // Lock the RECs in the holding
    await holding.lock();

    // Try to match with existing buy orders
    const matchingOrders = await Order.findMatchingOrders(order);
    let matchedQuantity = 0;

    for (const buyOrder of matchingOrders) {
      if (matchedQuantity >= order.remainingQuantity) break;
      
      const matchQuantity = Math.min(
        order.remainingQuantity - matchedQuantity,
        buyOrder.remainingQuantity
      );

      if (matchQuantity >= Math.max(order.minFillQuantity, buyOrder.minFillQuantity)) {
        // Create transaction (similar to buy order logic)
        const transaction = new Transaction({
          buyerId: buyOrder.userId,
          sellerId: order.userId,
          buyOrderId: buyOrder._id,
          sellOrderId: order._id,
          facilityName: order.facilityName,
          facilityId: order.facilityId,
          energyType: order.energyType,
          vintage: order.vintage,
          emirate: order.emirate,
          certificationStandard: order.certificationStandard,
          quantity: matchQuantity,
          pricePerUnit: order.price, // Seller's price
          buyerPlatformFee: matchQuantity * order.price * buyOrder.platformFeeRate,
          sellerPlatformFee: matchQuantity * order.price * order.platformFeeRate,
          blockchainFee: order.blockchainFee
        });

        await transaction.save();

        // Update orders
        await order.fillPartial(matchQuantity);
        await buyOrder.fillPartial(matchQuantity);
        
        matchedQuantity += matchQuantity;
        
        // Transfer RECs from seller (this order) to buyer
        const sellerHolding = await RECHolding.findById(order.holdingId);
        if (sellerHolding && sellerHolding.quantity >= matchQuantity) {
          // Reduce seller's holding
          sellerHolding.quantity -= matchQuantity;
          if (sellerHolding.quantity === 0) {
            await RECHolding.findByIdAndDelete(sellerHolding._id);
          } else {
            await sellerHolding.save();
          }

          // Add to buyer's holding
          let buyerHolding = await RECHolding.findOne({
            userId: buyOrder.userId,
            facilityId: order.facilityId,
            energyType: order.energyType,
            vintage: order.vintage,
            certificationStandard: order.certificationStandard
          });

          if (buyerHolding) {
            const newTotalQuantity = buyerHolding.quantity + matchQuantity;
            const newTotalValue = buyerHolding.totalValue + (matchQuantity * order.price);
            buyerHolding.quantity = newTotalQuantity;
            buyerHolding.averagePurchasePrice = newTotalValue / newTotalQuantity;
            buyerHolding.totalValue = newTotalValue;
            await buyerHolding.save();
          } else {
            buyerHolding = new RECHolding({
              userId: buyOrder.userId,
              facilityName: order.facilityName,
              facilityId: order.facilityId,
              energyType: order.energyType,
              vintage: order.vintage,
              quantity: matchQuantity,
              averagePurchasePrice: order.price,
              emirate: order.emirate,
              certificationStandard: order.certificationStandard
            });
            await buyerHolding.save();
          }

          // Update user totals
          const buyerSummary = await RECHolding.getUserTotalRECs(buyOrder.userId);
          await User.findByIdAndUpdate(buyOrder.userId, {
            totalRecs: buyerSummary.totalQuantity,
            portfolioValue: buyerSummary.totalValue
          });

          const sellerSummary = await RECHolding.getUserTotalRECs(order.userId);
          await User.findByIdAndUpdate(order.userId, {
            totalRecs: sellerSummary.totalQuantity,
            portfolioValue: sellerSummary.totalValue
          });
        }
      }
    }

    const updatedOrder = await Order.findById(order._id).populate('userId', 'firstName lastName company');

    res.status(201).json({
      success: true,
      message: 'Sell order created successfully',
      data: {
        order: updatedOrder,
        matchedQuantity
      }
    });
  } catch (error) {
    console.error('Error creating sell order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating sell order'
    });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', [
  auth,
  param('id').isMongoId().withMessage('Invalid order ID')
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

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.canMatch()) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled in current status'
      });
    }

    await order.cancel();

    // Unlock RECs if it's a sell order
    if (order.orderType === 'sell' && order.holdingId) {
      const holding = await RECHolding.findById(order.holdingId);
      if (holding) {
        await holding.unlock();
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details
// @access  Private
router.get('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid order ID')
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

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).populate('holdingId').populate('userId', 'firstName lastName company');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
});

module.exports = router;
