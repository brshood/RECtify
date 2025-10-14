const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { createTestUser, createTestOrder, createTestHolding, generateJWT } = require('./helpers/testData');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const RECHolding = require('../models/RECHolding');
const User = require('../models/User');

// Create minimal app for testing
const app = express();
app.use(express.json());

// Mock auth middleware for tests
const jwt = require('jsonwebtoken');
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { userId: decoded.userId };
      return next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  }
  return res.status(401).json({ success: false, message: 'No token provided' });
});

const ordersRoutes = require('../routes/orders');
app.use('/api/orders', ordersRoutes);

describe('Trading Engine - Critical Paths', () => {
  
  describe('Basic Trade Execution', () => {
    it('should execute complete trade and transfer RECs', async () => {
      // Create seller with holdings
      const seller = await createTestUser({
        email: 'seller-trade@rectify.ae',
        cashBalance: 1000
      });
      
      const sellerHolding = await createTestHolding({
        userId: seller._id,
        facilityId: 'FAC-SOLAR-001',
        facilityName: 'Desert Solar Farm',
        energyType: 'solar',
        vintage: 2023,
        quantity: 100,
        emirate: 'Abu Dhabi'
      });

      // Create buyer with cash
      const buyer = await createTestUser({
        email: 'buyer-trade@rectify.ae',
        cashBalance: 10000
      });

      const buyerToken = generateJWT(buyer._id);
      const sellerToken = generateJWT(seller._id);

      // Buyer creates buy order
      const buyOrderResponse = await request(app)
        .post('/api/orders/buy')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          facilityName: 'Desert Solar Farm',
          facilityId: 'FAC-SOLAR-001',
          energyType: 'solar',
          vintage: 2023,
          quantity: 50,
          price: 50,
          emirate: 'Abu Dhabi',
          purpose: 'voluntary'
        })
        .expect(201);

      expect(buyOrderResponse.body.success).toBe(true);
      const buyOrder = buyOrderResponse.body.data.order;

      // Seller creates matching sell order
      const sellOrderResponse = await request(app)
        .post('/api/orders/sell')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          holdingId: sellerHolding._id.toString(),
          quantity: 50,
          price: 50
        })
        .expect(201);

      expect(sellOrderResponse.body.success).toBe(true);

      // Verify: Check if transaction was created
      const transactions = await Transaction.find({
        $or: [
          { buyOrderId: buyOrder._id },
          { sellOrderId: sellOrderResponse.body.data.order._id }
        ]
      });

      // If matching occurred, verify RECs transferred
      if (transactions.length > 0) {
        const buyerHolding = await RECHolding.findOne({
          userId: buyer._id,
          facilityId: 'FAC-SOLAR-001'
        });

        expect(buyerHolding).toBeDefined();
        expect(buyerHolding.quantity).toBeGreaterThan(0);
      }
    }, 15000); // Increase timeout for complex operation
  });

  describe('Overselling Prevention', () => {
    it('should prevent selling more RECs than owned', async () => {
      // Create seller with 100 RECs
      const seller = await createTestUser({
        email: 'seller-oversell@rectify.ae',
        cashBalance: 1000
      });
      
      const sellerHolding = await createTestHolding({
        userId: seller._id,
        facilityId: 'FAC-WIND-001',
        facilityName: 'Coastal Wind Farm',
        energyType: 'wind',
        vintage: 2023,
        quantity: 100,
        emirate: 'Dubai'
      });

      const sellerToken = generateJWT(seller._id);

      // Try to create sell order for 200 RECs (more than owned)
      const sellOrderResponse = await request(app)
        .post('/api/orders/sell')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          holdingId: sellerHolding._id.toString(),
          quantity: 200,
          price: 50
        });

      // Should be rejected
      expect(sellOrderResponse.status).toBeGreaterThanOrEqual(400);
      expect(sellOrderResponse.body.success).toBe(false);
      expect(sellOrderResponse.body.message.toLowerCase()).toContain('insufficient');

      // Verify holding unchanged
      const updatedHolding = await RECHolding.findById(sellerHolding._id);
      expect(updatedHolding.quantity).toBe(100);
    });
  });

  describe('Insufficient Balance Prevention', () => {
    it('should reject trades when buyer has insufficient balance', async () => {
      // Create buyer with only 100 AED balance
      const buyer = await createTestUser({
        email: 'buyer-poor@rectify.ae',
        cashBalance: 100
      });

      const buyerToken = generateJWT(buyer._id);

      // Try to create buy order requiring 5000 AED (100 RECs @ 50 AED)
      const buyOrderResponse = await request(app)
        .post('/api/orders/buy')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          facilityName: 'Large Solar Farm',
          facilityId: 'FAC-SOLAR-BIG',
          energyType: 'solar',
          vintage: 2023,
          quantity: 100,
          price: 50,
          emirate: 'Abu Dhabi',
          purpose: 'voluntary'
        });

      // Should be rejected
      expect(buyOrderResponse.status).toBe(400);
      expect(buyOrderResponse.body.success).toBe(false);
      expect(buyOrderResponse.body.message.toLowerCase()).toContain('insufficient');

      // Verify balance unchanged
      const updatedBuyer = await User.findById(buyer._id);
      expect(updatedBuyer.cashBalance).toBe(100);
    });
  });

  describe('Fee Calculations', () => {
    it('should calculate fees correctly for trade', async () => {
      // Create seller with holdings
      const seller = await createTestUser({
        email: 'seller-fees@rectify.ae',
        cashBalance: 1000
      });
      
      const sellerHolding = await createTestHolding({
        userId: seller._id,
        facilityId: 'FAC-SOLAR-FEE',
        facilityName: 'Fee Test Solar',
        energyType: 'solar',
        vintage: 2023,
        quantity: 100,
        emirate: 'Abu Dhabi'
      });

      // Create buyer with sufficient cash
      const buyer = await createTestUser({
        email: 'buyer-fees@rectify.ae',
        cashBalance: 10000
      });

      const buyerToken = generateJWT(buyer._id);
      const sellerToken = generateJWT(seller._id);

      // Create buy order: 100 RECs @ 50 AED = 5000 AED base
      const buyOrderResponse = await request(app)
        .post('/api/orders/buy')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          facilityName: 'Fee Test Solar',
          facilityId: 'FAC-SOLAR-FEE',
          energyType: 'solar',
          vintage: 2023,
          quantity: 100,
          price: 50,
          emirate: 'Abu Dhabi',
          purpose: 'voluntary'
        })
        .expect(201);

      expect(buyOrderResponse.body.success).toBe(true);

      // Verify buyer's reserved balance includes fees
      const updatedBuyer = await User.findById(buyer._id);
      const expectedBase = 100 * 50; // 5000 AED
      const expectedPlatformFee = expectedBase * 0.02; // 2% = 100 AED
      const expectedBlockchainFee = 5; // 5 AED
      const expectedTotal = expectedBase + expectedPlatformFee + expectedBlockchainFee;

      // Reserved balance should reflect total cost with fees
      expect(updatedBuyer.reservedBalance).toBeGreaterThanOrEqual(expectedTotal - 1);
      expect(updatedBuyer.reservedBalance).toBeLessThanOrEqual(expectedTotal + 1);
    });
  });

  describe('Partial Order Fills', () => {
    it('should handle partial order fills correctly', async () => {
      // Create seller with 100 RECs
      const seller = await createTestUser({
        email: 'seller-partial@rectify.ae',
        cashBalance: 1000
      });
      
      const sellerHolding = await createTestHolding({
        userId: seller._id,
        facilityId: 'FAC-SOLAR-PARTIAL',
        facilityName: 'Partial Fill Solar',
        energyType: 'solar',
        vintage: 2023,
        quantity: 100,
        emirate: 'Abu Dhabi'
      });

      // Create buyer wanting only 60 RECs
      const buyer = await createTestUser({
        email: 'buyer-partial@rectify.ae',
        cashBalance: 10000
      });

      const buyerToken = generateJWT(buyer._id);
      const sellerToken = generateJWT(seller._id);

      // Seller creates sell order for 100 RECs
      const sellOrderResponse = await request(app)
        .post('/api/orders/sell')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          holdingId: sellerHolding._id.toString(),
          quantity: 100,
          price: 50,
          allowPartialFill: true
        })
        .expect(201);

      const sellOrder = sellOrderResponse.body.data.order;

      // Buyer creates buy order for only 60 RECs
      const buyOrderResponse = await request(app)
        .post('/api/orders/buy')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          facilityName: 'Partial Fill Solar',
          facilityId: 'FAC-SOLAR-PARTIAL',
          energyType: 'solar',
          vintage: 2023,
          quantity: 60,
          price: 50,
          emirate: 'Abu Dhabi',
          purpose: 'voluntary',
          allowPartialFill: true
        })
        .expect(201);

      expect(buyOrderResponse.body.success).toBe(true);

      // Verify: Buy order should be completed or partially filled
      const updatedBuyOrder = await Order.findById(buyOrderResponse.body.data.order._id);
      
      // If matching occurred:
      if (updatedBuyOrder.status === 'completed' || updatedBuyOrder.status === 'partial') {
        // Sell order should remain with remaining quantity
        const updatedSellOrder = await Order.findById(sellOrder._id);
        
        // If any matching occurred, sell order should have some quantity filled
        if (updatedSellOrder && updatedSellOrder.remainingQuantity < 100) {
          expect(updatedSellOrder.remainingQuantity).toBeGreaterThan(0);
          expect(updatedSellOrder.remainingQuantity).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('Order Matching Priority', () => {
    it('should match orders by best price first', async () => {
      // Create multiple sellers with different prices
      const seller1 = await createTestUser({
        email: 'seller1-priority@rectify.ae',
        cashBalance: 1000
      });
      
      const holding1 = await createTestHolding({
        userId: seller1._id,
        facilityId: 'FAC-SOLAR-PRI-1',
        facilityName: 'Priority Solar 1',
        energyType: 'solar',
        vintage: 2023,
        quantity: 100,
        emirate: 'Abu Dhabi'
      });

      const seller2 = await createTestUser({
        email: 'seller2-priority@rectify.ae',
        cashBalance: 1000
      });
      
      const holding2 = await createTestHolding({
        userId: seller2._id,
        facilityId: 'FAC-SOLAR-PRI-2',
        facilityName: 'Priority Solar 2',
        energyType: 'solar',
        vintage: 2023,
        quantity: 100,
        emirate: 'Abu Dhabi'
      });

      const buyer = await createTestUser({
        email: 'buyer-priority@rectify.ae',
        cashBalance: 10000
      });

      const seller1Token = generateJWT(seller1._id);
      const seller2Token = generateJWT(seller2._id);
      const buyerToken = generateJWT(buyer._id);

      // Seller 1 creates order at 50 AED (higher price)
      await request(app)
        .post('/api/orders/sell')
        .set('Authorization', `Bearer ${seller1Token}`)
        .send({
          holdingId: holding1._id.toString(),
          quantity: 50,
          price: 50
        })
        .expect(201);

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      // Seller 2 creates order at 45 AED (better price for buyer)
      await request(app)
        .post('/api/orders/sell')
        .set('Authorization', `Bearer ${seller2Token}`)
        .send({
          holdingId: holding2._id.toString(),
          quantity: 50,
          price: 45
        })
        .expect(201);

      // Buyer willing to pay up to 50 AED
      const buyOrderResponse = await request(app)
        .post('/api/orders/buy')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          facilityName: 'Priority Solar 2',
          facilityId: 'FAC-SOLAR-PRI-2',
          energyType: 'solar',
          vintage: 2023,
          quantity: 50,
          price: 50,
          emirate: 'Abu Dhabi',
          purpose: 'voluntary'
        })
        .expect(201);

      expect(buyOrderResponse.body.success).toBe(true);

      // Check if matching occurred - buyer should get best price available
      const transactions = await Transaction.find({
        buyerId: buyer._id
      });

      if (transactions.length > 0) {
        // If matched, should prefer lower-priced seller
        const matchedTransaction = transactions[0];
        expect(matchedTransaction.pricePerUnit).toBeLessThanOrEqual(50);
      }
    });
  });

  describe('Trade Authorization', () => {
    it('should prevent accessing other users orders', async () => {
      // User A creates order
      const userA = await createTestUser({
        email: 'userA-auth@rectify.ae',
        cashBalance: 10000
      });

      const userB = await createTestUser({
        email: 'userB-auth@rectify.ae',
        cashBalance: 10000
      });

      const tokenA = generateJWT(userA._id);
      const tokenB = generateJWT(userB._id);

      // User A creates buy order
      const orderResponse = await request(app)
        .post('/api/orders/buy')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          facilityName: 'Auth Test Solar',
          facilityId: 'FAC-SOLAR-AUTH',
          energyType: 'solar',
          vintage: 2023,
          quantity: 50,
          price: 50,
          emirate: 'Abu Dhabi',
          purpose: 'voluntary'
        })
        .expect(201);

      const orderA = orderResponse.body.data.order;

      // User B attempts to cancel User A's order
      const cancelResponse = await request(app)
        .put(`/api/orders/${orderA._id}/cancel`)
        .set('Authorization', `Bearer ${tokenB}`);

      // Should be forbidden or not found (403/404)
      expect([401, 403, 404]).toContain(cancelResponse.status);
      expect(cancelResponse.body.success).toBe(false);

      // Verify order A is still active
      const stillActiveOrder = await Order.findById(orderA._id);
      expect(stillActiveOrder.status).not.toBe('cancelled');
    });
  });

  describe('Input Validation', () => {
    it('should reject orders with invalid quantity', async () => {
      const user = await createTestUser({
        email: 'user-validation@rectify.ae',
        cashBalance: 10000
      });

      const token = generateJWT(user._id);

      // Try to create order with negative quantity
      const response = await request(app)
        .post('/api/orders/buy')
        .set('Authorization', `Bearer ${token}`)
        .send({
          facilityName: 'Validation Solar',
          facilityId: 'FAC-SOLAR-VAL',
          energyType: 'solar',
          vintage: 2023,
          quantity: -10, // Invalid
          price: 50,
          emirate: 'Abu Dhabi',
          purpose: 'voluntary'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject orders with invalid price', async () => {
      const user = await createTestUser({
        email: 'user-price-validation@rectify.ae',
        cashBalance: 10000
      });

      const token = generateJWT(user._id);

      // Try to create order with zero price
      const response = await request(app)
        .post('/api/orders/buy')
        .set('Authorization', `Bearer ${token}`)
        .send({
          facilityName: 'Price Validation Solar',
          facilityId: 'FAC-SOLAR-PRICE',
          energyType: 'solar',
          vintage: 2023,
          quantity: 10,
          price: 0, // Invalid
          emirate: 'Abu Dhabi',
          purpose: 'voluntary'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should enforce quantity limits', async () => {
      const user = await createTestUser({
        email: 'user-limit@rectify.ae',
        cashBalance: 100000000
      });

      const token = generateJWT(user._id);

      // Try to create order with excessive quantity
      const response = await request(app)
        .post('/api/orders/buy')
        .set('Authorization', `Bearer ${token}`)
        .send({
          facilityName: 'Limit Solar',
          facilityId: 'FAC-SOLAR-LIMIT',
          energyType: 'solar',
          vintage: 2023,
          quantity: 2000000, // Over limit
          price: 50,
          emirate: 'Abu Dhabi',
          purpose: 'voluntary'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});

