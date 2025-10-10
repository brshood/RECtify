const request = require('supertest');
const express = require('express');
const { createTestUser, createTestOrder, createTestHolding, generateJWT } = require('./helpers/testData');
const Order = require('../models/Order');

// Create minimal app for testing
const app = express();
app.use(express.json());
const auth = require('../middleware/auth');
const ordersRoutes = require('../routes/orders');
app.use('/api/orders', auth, ordersRoutes);

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
        type: 'buy',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('buy');
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.userId.toString()).toBe(user._id.toString());
    });

    it('should create a sell order when user has holdings', async () => {
      // Create holdings for user
      await createTestHolding(user._id, {
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 500,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      const orderData = {
        type: 'sell',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 55,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('sell');
    });

    it('should reject sell order without sufficient holdings', async () => {
      const orderData = {
        type: 'sell',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 55,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('holdings');
    });

    it('should reject buy order without sufficient cash balance', async () => {
      const poorUser = await createTestUser({
        email: 'poor@rectify.ae',
        cashBalance: 100
      });
      const poorToken = generateJWT(poorUser._id);

      const orderData = {
        type: 'buy',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 1000,
        price: 1000, // Requires 1,000,000 AED
        vintage: 2024,
        emirate: 'Abu Dhabi'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${poorToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('balance');
    });

    it('should reject order with invalid quantity', async () => {
      const orderData = {
        type: 'buy',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: -100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/orders', () => {
    it('should return user orders', async () => {
      await createTestOrder(user._id, { type: 'buy' });
      await createTestOrder(user._id, { type: 'sell' });

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('should filter orders by type', async () => {
      await createTestOrder(user._id, { type: 'buy' });
      await createTestOrder(user._id, { type: 'sell' });

      const response = await request(app)
        .get('/api/orders?type=buy')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].type).toBe('buy');
    });

    it('should filter orders by status', async () => {
      await createTestOrder(user._id, { status: 'active' });
      await createTestOrder(user._id, { status: 'filled' });

      const response = await request(app)
        .get('/api/orders?status=active')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe('active');
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('should cancel active order', async () => {
      const order = await createTestOrder(user._id, { status: 'active' });

      const response = await request(app)
        .delete(`/api/orders/${order._id}`)
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
        .delete(`/api/orders/${otherOrder._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should not cancel filled order', async () => {
      const order = await createTestOrder(user._id, { status: 'filled' });

      const response = await request(app)
        .delete(`/api/orders/${order._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});

