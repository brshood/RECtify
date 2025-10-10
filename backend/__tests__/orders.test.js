const request = require('supertest');
const express = require('express');
const { createTestUser, createTestOrder, createTestHolding, generateJWT } = require('./helpers/testData');
const Order = require('../models/Order');

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

describe('Orders API', () => {
  let user, token;

  beforeEach(async () => {
    user = await createTestUser({
      email: 'ordertest@rectify.ae',
      cashBalance: 100000
    });
    token = generateJWT(user._id);
  });

  describe('POST /api/orders', () => {
    it('should create a buy order with valid data', async () => {
      const orderData = {
        orderType: 'buy',
        facilityName: 'Solar Farm A',
        facilityId: 'FAC-SOLAR-A',
        energyType: 'solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi',
        purpose: 'compliance'
      };

      const response = await request(app)
        .post('/api/orders/buy')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.orderType).toBe('buy');
      expect(response.body.data.order.status).toBe('pending');
      const returnedUserId = typeof response.body.data.order.userId === 'object' 
        ? response.body.data.order.userId._id 
        : response.body.data.order.userId;
      expect(returnedUserId.toString()).toBe(user._id.toString());
    });

    it('should create a sell order when user has holdings', async () => {
      // Create holdings for user
      const holding = await createTestHolding(user._id, {
        facilityName: 'Solar Farm A',
        facilityId: 'FAC-SOLAR-A',
        energyType: 'solar',
        quantity: 500,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      const orderData = {
        orderType: 'sell',
        facilityName: 'Solar Farm A',
        facilityId: 'FAC-SOLAR-A',
        energyType: 'solar',
        quantity: 100,
        price: 55,
        vintage: 2024,
        emirate: 'Abu Dhabi',
        holdingId: holding._id.toString()
      };

      const response = await request(app)
        .post('/api/orders/sell')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.orderType).toBe('sell');
    });

    it('should reject sell order without sufficient holdings', async () => {
      // Create a holding first, then try to sell more than available
      const holding = await createTestHolding(user._id, {
        quantity: 50 // Only 50 available
      });

      const orderData = {
        holdingId: holding._id.toString(),
        quantity: 100, // Trying to sell 100
        price: 55
      };

      const response = await request(app)
        .post('/api/orders/sell')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message.toLowerCase()).toContain('insufficient'); // "Insufficient quantity"
    });

    it('should reject buy order without sufficient cash balance', async () => {
      const poorUser = await createTestUser({
        email: 'poor@rectify.ae',
        cashBalance: 100
      });
      const poorToken = generateJWT(poorUser._id);

      const orderData = {
        orderType: 'buy',
        facilityName: 'Solar Farm A',
        facilityId: 'FAC-SOLAR-A',
        energyType: 'solar',
        quantity: 1000,
        price: 1000, // Requires 1,000,000 AED
        vintage: 2024,
        emirate: 'Abu Dhabi',
        purpose: 'compliance'
      };

      const response = await request(app)
        .post('/api/orders/buy')
        .set('Authorization', `Bearer ${poorToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('fund'); // "Insufficient funds"
    });

    it('should reject order with invalid quantity', async () => {
      const orderData = {
        orderType: 'buy',
        facilityName: 'Solar Farm A',
        facilityId: 'FAC-SOLAR-A',
        energyType: 'solar',
        quantity: -100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi',
        purpose: 'compliance'
      };

      const response = await request(app)
        .post('/api/orders/buy')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/orders', () => {
    it('should return user orders', async () => {
      await createTestOrder(user._id, { orderType: 'buy' });
      await createTestOrder(user._id, { orderType: 'sell', holdingId: '507f1f77bcf86cd799439011' });

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('should filter orders by type', async () => {
      await createTestOrder(user._id, { orderType: 'buy' });
      await createTestOrder(user._id, { orderType: 'sell', holdingId: '507f1f77bcf86cd799439011' });

      const response = await request(app)
        .get('/api/orders?type=buy')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].orderType).toBe('buy');
    });

    it('should filter orders by status', async () => {
      await createTestOrder(user._id, { status: 'pending' });
      await createTestOrder(user._id, { status: 'completed' });

      const response = await request(app)
        .get('/api/orders?status=pending')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe('pending');
    });
  });

  describe('PUT /api/orders/:id/cancel', () => {
    it('should cancel active order', async () => {
      const order = await createTestOrder(user._id, { status: 'pending' });

      const response = await request(app)
        .put(`/api/orders/${order._id}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify order was cancelled
      const cancelledOrder = await Order.findById(order._id);
      expect(cancelledOrder.status).toBe('cancelled');
    });

    it('should not cancel another user\'s order', async () => {
      const otherUser = await createTestUser({ email: 'other@rectify.ae' });
      const otherOrder = await createTestOrder(otherUser._id);

      const response = await request(app)
        .put(`/api/orders/${otherOrder._id}/cancel`)
        .set('Authorization', `Bearer ${token}`);

      // May return 401 if token invalid, 403 if forbidden, or 404 if not found
      expect([401, 403, 404]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should not cancel completed order', async () => {
      const order = await createTestOrder(user._id, { status: 'completed' });

      const response = await request(app)
        .put(`/api/orders/${order._id}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});

