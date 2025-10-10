const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const { auditLog, setEntityId, setAuditMetadata } = require('../middleware/auditLog');
const Order = require('../models/Order');
const RECHolding = require('../models/RECHolding');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const RECTradingService = require('../services/RECTradingService');
const RECSecurityService = require('../services/RECSecurityService');
const router = express.Router();

// Rate limiting for order creation - prevents order spam
const orderCreateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 orders per minute per IP
  message: {
    success: false,
    message: 'Too many orders created. Please slow down and try again.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

// Rate limiting for order cancellation - prevents cancellation spam
const orderCancelLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Max 20 cancellations per minute per IP
  message: {
    success: false,
    message: 'Too many cancellation requests. Please slow down.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

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

    // Add network statistics
    const networkStats = {
      totalActiveOrders: orderBook.buyOrders.length + orderBook.sellOrders.length,
      totalBuyOrders: orderBook.buyOrders.length,
      totalSellOrders: orderBook.sellOrders.length,
      uniqueParticipants: new Set([
        ...orderBook.buyOrders.map(o => o.userId._id.toString()),
        ...orderBook.sellOrders.map(o => o.userId._id.toString())
      ]).size,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      data: {
        ...orderBook,
        networkStats
      }
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
  orderCreateLimiter,
  auth,
  auditLog('ORDER_CREATE', 'Order', { includeBody: true }),
  body('facilityName').notEmpty().trim().withMessage('Facility name is required'),
  body('facilityId').notEmpty().trim().withMessage('Facility ID is required'),
  body('energyType').isIn(['solar', 'wind', 'hydro', 'biomass', 'geothermal', 'nuclear']).withMessage('Invalid energy type'),
  body('vintage').isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('Invalid vintage year'),
  body('quantity')
    .isFloat({ min: 1, max: 1000000 })
    .withMessage('Quantity must be between 1 and 1,000,000')
    .customSanitizer(value => Math.floor(value)), // Ensure integer quantity
  body('price')
    .isFloat({ min: 0.01, max: 100000 })
    .withMessage('Price must be between 0.01 and 100,000 AED')
    .customSanitizer(value => Math.round(value * 100) / 100), // Round to 2 decimals
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

    // Integer math reservation in fils
    const subtotalFils = Math.round(quantity * price * 100);
    const platformFeeFils = Math.round(subtotalFils * 0.02);
    const blockchainFeeFils = 500; // always charge AED 5 buyer fee
    const requiredFils = subtotalFils + platformFeeFils + blockchainFeeFils;

    // Check available (balance - reserved)
    const availableAED = (user.cashBalance || 0) - (user.reservedBalance || 0);
    if (availableAED < requiredFils / 100) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Required AED ${(requiredFils/100).toFixed(2)} including fees.`
      });
    }

    const order = new Order({
      userId: req.user.userId,
      orderType: 'buy',
      facilityName,
      facilityId,
      energyType,
      vintage,
      quantity,
      remainingQuantity: quantity,
      price,
      totalValue: quantity * price,
      emirate,
      purpose,
      certificationStandard,
      allowPartialFill,
      minFillQuantity,
      createdBy: `${user.firstName} ${user.lastName}`,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      buyerReservedFils: requiredFils
    });

    // Reserve funds
    user.reservedBalance = (user.reservedBalance || 0) + (requiredFils / 100);

    await Promise.all([order.save(), user.save()]);

    // Set entity ID for audit logging
    setEntityId(res, order._id);
    setAuditMetadata(res, { 
      orderType: 'buy', 
      quantity, 
      price, 
      totalValue: order.totalValue,
      facilityId,
      energyType
    });

    // Try to match with existing sell orders using blockchain-enabled trading
    const matchingOrders = await Order.findMatchingOrders(order);
    let matchedQuantity = 0;

    for (const sellOrder of matchingOrders) {
      if (matchedQuantity >= order.remainingQuantity) break;
      
      const matchQuantity = Math.min(
        order.remainingQuantity - matchedQuantity,
        sellOrder.remainingQuantity
      );

      if (matchQuantity >= Math.max(order.minFillQuantity, sellOrder.minFillQuantity)) {
        // Execute trade with direct blockchain integration
        const tradeResult = await executeBlockchainTrade(order, sellOrder, matchQuantity);
        
        if (tradeResult.success) {
          matchedQuantity += matchQuantity;
          console.log(`✅ Trade executed: ${tradeResult.transactionId}`);
        } else {
          console.error(`❌ Trade failed: ${tradeResult.message}`);
          // Fall back to traditional matching
          await executeTraditionalMatch(order, sellOrder, matchQuantity);
          matchedQuantity += matchQuantity;
        }
      }
    }

    const updatedOrder = await Order.findById(order._id).populate('userId', 'firstName lastName company').lean();

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
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while creating buy order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/orders/sell
// @desc    Create sell order
// @access  Private
router.post('/sell', [
  orderCreateLimiter,
  auth,
  auditLog('ORDER_CREATE', 'Order', { includeBody: true }),
  body('holdingId').isMongoId().withMessage('Valid holding ID is required'),
  body('quantity')
    .isFloat({ min: 1, max: 1000000 })
    .withMessage('Quantity must be between 1 and 1,000,000')
    .customSanitizer(value => Math.floor(value)), // Ensure integer quantity
  body('price')
    .isFloat({ min: 0.01, max: 100000 })
    .withMessage('Price must be between 0.01 and 100,000 AED')
    .customSanitizer(value => Math.round(value * 100) / 100), // Round to 2 decimals
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
      remainingQuantity: quantity,
      price,
      totalValue: quantity * price,
      emirate: holding.emirate,
      certificationStandard: holding.certificationStandard,
      holdingId,
      allowPartialFill,
      minFillQuantity,
      createdBy: `${user.firstName} ${user.lastName}`,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await order.save();

    // Set entity ID for audit logging
    setEntityId(res, order._id);
    setAuditMetadata(res, { 
      orderType: 'sell', 
      quantity, 
      price, 
      totalValue: order.totalValue,
      holdingId,
      facilityId: holding.facilityId,
      energyType: holding.energyType
    });

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
          facilityName: order.facilityName, // Use seller's facility details
          facilityId: order.facilityId,
          energyType: order.energyType,
          vintage: order.vintage,
          emirate: order.emirate,
          certificationStandard: order.certificationStandard,
          quantity: matchQuantity,
          pricePerUnit: order.price, // Seller's price
          totalAmount: matchQuantity * order.price,
          buyerPlatformFee: matchQuantity * order.price * buyOrder.platformFeeRate,
          sellerPlatformFee: matchQuantity * order.price * order.platformFeeRate,
          blockchainFee: order.blockchainFee,
          status: 'completed',
          settlementStatus: 'completed',
          settlementDate: new Date()
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

          // Add to buyer's holding (using seller's facility details)
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
              totalValue: matchQuantity * order.price,
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

    const updatedOrder = await Order.findById(order._id).populate('userId', 'firstName lastName company').lean();

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
  orderCancelLimiter,
  auth,
  auditLog('ORDER_CANCEL', 'Order', { includeParams: true }),
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

    // Set entity ID for audit logging
    setEntityId(res, order._id);
    setAuditMetadata(res, { 
      orderType: order.orderType, 
      previousStatus: order.status,
      remainingQuantity: order.remainingQuantity
    });

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

// Helper function for traditional matching (fallback)
// Direct blockchain trade execution
async function executeBlockchainTrade(buyOrder, sellOrder, quantity) {
  try {
    console.log(`🔒 Executing blockchain trade for ${quantity} units`);
    
    // Initialize blockchain service if needed
    if (!RECSecurityService.getServiceStatus().initialized) {
      console.log('🔄 Initializing blockchain service...');
      const initResult = await RECSecurityService.initialize();
      if (!initResult.success) {
        throw new Error(`Blockchain initialization failed: ${initResult.message}`);
      }
    }
    
    // Create transaction record first
    const transaction = new Transaction({
      buyerId: buyOrder.userId,
      sellerId: sellOrder.userId,
      buyOrderId: buyOrder._id,
      sellOrderId: sellOrder._id,
      facilityName: sellOrder.facilityName,
      facilityId: sellOrder.facilityId || `${sellOrder.facilityName}-${sellOrder.vintage}`,
      energyType: sellOrder.energyType,
      vintage: sellOrder.vintage,
      emirate: sellOrder.emirate,
      certificationStandard: sellOrder.certificationStandard,
      quantity,
      pricePerUnit: sellOrder.price,
      totalAmount: quantity * sellOrder.price,
      buyerPlatformFee: quantity * sellOrder.price * 0.02,
      sellerPlatformFee: quantity * sellOrder.price * 0.02,
      blockchainFee: 5.00, // Blockchain fee
      status: 'processing',
      settlementStatus: 'pending'
    });

    await transaction.save();

    // Record transaction on blockchain
    const blockchainResult = await RECSecurityService.recordRECTransaction({
      buyerAddress: `0x${buyOrder.userId.toString().padStart(40, '0')}`,
      sellerAddress: `0x${sellOrder.userId.toString().padStart(40, '0')}`,
      recQuantity: quantity,
      facilityDetails: {
        facilityName: sellOrder.facilityName,
        facilityId: sellOrder.facilityId || `${sellOrder.facilityName}-${sellOrder.vintage}`,
        energyType: sellOrder.energyType,
        vintage: sellOrder.vintage,
        emirate: sellOrder.emirate,
        certificationStandard: sellOrder.certificationStandard
      },
      transactionId: transaction._id.toString(),
      pricePerUnit: sellOrder.price
    });

    if (blockchainResult.success) {
      // Update transaction with blockchain details
      transaction.blockchainTxHash = blockchainResult.blockchainHash;
      transaction.internalRef = blockchainResult.blockchainTxId;
      await transaction.save();
      
      console.log(`🔒 Blockchain transaction recorded: ${blockchainResult.blockchainHash}`);
    } else {
      console.log(`⚠️ Blockchain recording failed: ${blockchainResult.message}`);
      // Continue with trade even if blockchain fails
    }

    // Complete REC transfer
    await completeRECTransfer(transaction);

    // Settle cash (always includes AED 5)
    await RECTradingService.updateUserBalances(transaction);

    // Update order statuses
    await updateOrderStatuses(transaction);

    // Update user portfolios
    await updateUserPortfolios(transaction);

    // Mark transaction as completed
    await transaction.markCompleted();

    console.log(`✅ Blockchain trade completed: ${transaction._id}`);
    return { success: true, transactionId: transaction._id };
  } catch (error) {
    console.error('❌ Blockchain trade failed:', error);
    return { success: false, error: error.message };
  }
}

// Traditional order matching function (fallback when blockchain fails)
async function executeTraditionalMatch(buyOrder, sellOrder, quantity) {
  try {
    console.log(`🔄 Executing traditional match for ${quantity} units`);
    
    // Create transaction record
    const transaction = new Transaction({
      buyerId: buyOrder.userId,
      sellerId: sellOrder.userId,
      buyOrderId: buyOrder._id,
      sellOrderId: sellOrder._id,
      facilityName: sellOrder.facilityName,
      facilityId: sellOrder.facilityId || `${sellOrder.facilityName}-${sellOrder.vintage}`,
      energyType: sellOrder.energyType,
      vintage: sellOrder.vintage,
      emirate: sellOrder.emirate,
      certificationStandard: sellOrder.certificationStandard,
      quantity,
      pricePerUnit: sellOrder.price,
      totalAmount: quantity * sellOrder.price,
      buyerPlatformFee: quantity * sellOrder.price * 0.02,
      sellerPlatformFee: quantity * sellOrder.price * 0.02,
      blockchainFee: 0, // No blockchain fee for traditional matching
      status: 'processing',
      settlementStatus: 'pending'
    });

    await transaction.save();

    // Complete REC transfer
    await completeRECTransfer(transaction);

    // Settle cash (always includes AED 5)
    await RECTradingService.updateUserBalances(transaction);

    // Update order statuses
    await updateOrderStatuses(transaction);

    // Update user portfolios
    await updateUserPortfolios(transaction);

    // Mark transaction as completed
    await transaction.markCompleted();

    console.log(`✅ Traditional match completed: ${transaction._id}`);
    return { success: true, transactionId: transaction._id };
  } catch (error) {
    console.error('❌ Traditional match failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to complete REC transfer
async function completeRECTransfer(transaction) {
  const { sellerId, buyerId, quantity, facilityId, energyType, vintage, certificationStandard, pricePerUnit } = transaction;

  // Get seller's holding
  const sellerHolding = await RECHolding.findOne({
    userId: sellerId,
    facilityId: facilityId,
    energyType: energyType,
    vintage: vintage,
    certificationStandard: certificationStandard
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
    energyType: energyType,
    vintage: vintage,
    certificationStandard: certificationStandard
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
      facilityName: transaction.facilityName,
      facilityId: facilityId,
      energyType: energyType,
      vintage: vintage,
      quantity,
      averagePurchasePrice: pricePerUnit,
      totalValue: quantity * pricePerUnit,
      emirate: transaction.emirate,
      certificationStandard: certificationStandard
    });
    await buyerHolding.save();
  }
}

// Helper function to update order statuses
async function updateOrderStatuses(transaction) {
  const { buyOrderId, sellOrderId, quantity } = transaction;

  // Update buy order
  const buyOrder = await Order.findById(buyOrderId);
  if (buyOrder) {
    await buyOrder.fillPartial(quantity);
    // Release leftover reservation if completed
    if (buyOrder.status === 'completed' && buyOrder.buyerReservedFils > 0) {
      const buyer = await User.findById(buyOrder.userId);
      if (buyer) {
        const releaseAED = buyOrder.buyerReservedFils / 100;
        buyer.reservedBalance = Math.max(0, (buyer.reservedBalance || 0) - releaseAED);
        await buyer.save();
      }
      buyOrder.buyerReservedFils = 0;
      await buyOrder.save();
    }
  }

  // Update sell order
  const sellOrder = await Order.findById(sellOrderId);
  if (sellOrder) {
    await sellOrder.fillPartial(quantity);
  }
}

// Helper function to update user portfolios
async function updateUserPortfolios(transaction) {
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

module.exports = router;
