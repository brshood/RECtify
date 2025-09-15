const request = require('supertest');
const express = require('express');
const ordersRoutes = require('../../routes/orders');
const Order = require('../../models/Order'); // Mocked Order model
const Transaction = require('../../models/Transaction'); // Mocked Transaction model
const User = require('../../models/User'); // Mocked User model
const jwt = require('jsonwebtoken'); // Mocked jsonwebtoken
const bcrypt = require('bcryptjs'); // Mocked bcryptjs

// Mock the entire Order module
jest.mock('../../models/Order', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  deleteMany: jest.fn(),
  aggregate: jest.fn(),
}));

// Mock the entire Transaction module
jest.mock('../../models/Transaction', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  aggregate: jest.fn(),
}));

// Mock the entire User module
jest.mock('../../models/User', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

// Mock the auth middleware to simplify route testing
jest.mock('../../middleware/auth', () => jest.fn((req, res, next) => {
  req.user = { userId: 'mockUserId', role: 'trader' }; // Mock authenticated user
  next();
}));

const app = express();
app.use(express.json());
app.use('/api/orders', ordersRoutes);

describe('Orders Routes - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'supersecretjwtkeythatisatleast32characterslong';
  });

  describe('GET /api/orders', () => {
    it('should get all orders successfully', async () => {
      const mockOrders = [
        {
          _id: 'order1',
          orderType: 'buy',
          quantity: 100,
          price: 25.50,
          status: 'pending',
          userId: 'mockUserId',
          facilityName: 'Solar Farm Dubai',
          energyType: 'Solar',
          vintage: 2024,
          emirate: 'Dubai',
        },
        {
          _id: 'order2',
          orderType: 'sell',
          quantity: 50,
          price: 30.00,
          status: 'pending',
          userId: 'mockUserId2',
          facilityName: 'Wind Farm Abu Dhabi',
          energyType: 'Wind',
          vintage: 2024,
          emirate: 'Abu Dhabi',
        },
      ];

      Order.find.mockResolvedValue(mockOrders);

      const res = await request(app)
        .get('/api/orders');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].orderType).toBe('buy');
      expect(res.body.data[1].orderType).toBe('sell');
      expect(Order.find).toHaveBeenCalledWith({ status: { $ne: 'cancelled' } });
    });

    it('should filter orders by type when specified', async () => {
      const mockBuyOrders = [
        {
          _id: 'order1',
          orderType: 'buy',
          quantity: 100,
          price: 25.50,
          status: 'pending',
        },
      ];

      Order.find.mockResolvedValue(mockBuyOrders);

      const res = await request(app)
        .get('/api/orders?type=buy');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].orderType).toBe('buy');
      expect(Order.find).toHaveBeenCalledWith({ 
        status: { $ne: 'cancelled' },
        orderType: 'buy'
      });
    });

    it('should handle database errors', async () => {
      Order.find.mockRejectedValue(new Error('Database connection failed'));

      const res = await request(app)
        .get('/api/orders');

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Server error');
    });
  });

  describe('POST /api/orders', () => {
    it('should create a new buy order successfully', async () => {
      const orderData = {
        orderType: 'buy',
        facilityName: 'Solar Farm Dubai',
        energyType: 'Solar',
        vintage: 2024,
        quantity: 100,
        price: 25.50,
        emirate: 'Dubai',
      };

      const mockCreatedOrder = {
        _id: 'newOrderId',
        ...orderData,
        userId: 'mockUserId',
        status: 'pending',
        createdAt: new Date(),
      };

      Order.create.mockResolvedValue(mockCreatedOrder);

      const res = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderType).toBe('buy');
      expect(res.body.data.quantity).toBe(100);
      expect(res.body.data.price).toBe(25.50);
      expect(Order.create).toHaveBeenCalledWith({
        ...orderData,
        userId: 'mockUserId',
      });
    });

    it('should create a new sell order successfully', async () => {
      const orderData = {
        orderType: 'sell',
        facilityName: 'Wind Farm Abu Dhabi',
        energyType: 'Wind',
        vintage: 2024,
        quantity: 50,
        price: 30.00,
        emirate: 'Abu Dhabi',
      };

      const mockCreatedOrder = {
        _id: 'newOrderId',
        ...orderData,
        userId: 'mockUserId',
        status: 'pending',
        createdAt: new Date(),
      };

      Order.create.mockResolvedValue(mockCreatedOrder);

      const res = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderType).toBe('sell');
      expect(res.body.data.quantity).toBe(50);
      expect(res.body.data.price).toBe(30.00);
    });

    it('should validate required fields', async () => {
      const incompleteOrderData = {
        orderType: 'buy',
        quantity: 100,
        // Missing required fields
      };

      const res = await request(app)
        .post('/api/orders')
        .send(incompleteOrderData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('validation');
    });

    it('should validate order type', async () => {
      const invalidOrderData = {
        orderType: 'invalid',
        facilityName: 'Solar Farm Dubai',
        energyType: 'Solar',
        vintage: 2024,
        quantity: 100,
        price: 25.50,
        emirate: 'Dubai',
      };

      const res = await request(app)
        .post('/api/orders')
        .send(invalidOrderData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should validate quantity is positive', async () => {
      const invalidOrderData = {
        orderType: 'buy',
        facilityName: 'Solar Farm Dubai',
        energyType: 'Solar',
        vintage: 2024,
        quantity: -10, // Invalid quantity
        price: 25.50,
        emirate: 'Dubai',
      };

      const res = await request(app)
        .post('/api/orders')
        .send(invalidOrderData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should validate price is positive', async () => {
      const invalidOrderData = {
        orderType: 'buy',
        facilityName: 'Solar Farm Dubai',
        energyType: 'Solar',
        vintage: 2024,
        quantity: 100,
        price: -5.00, // Invalid price
        emirate: 'Dubai',
      };

      const res = await request(app)
        .post('/api/orders')
        .send(invalidOrderData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle database errors during order creation', async () => {
      const orderData = {
        orderType: 'buy',
        facilityName: 'Solar Farm Dubai',
        energyType: 'Solar',
        vintage: 2024,
        quantity: 100,
        price: 25.50,
        emirate: 'Dubai',
      };

      Order.create.mockRejectedValue(new Error('Database connection failed'));

      const res = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Server error');
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('should update an order successfully', async () => {
      const orderId = 'order123';
      const updateData = {
        quantity: 150,
        price: 26.00,
      };

      const mockUpdatedOrder = {
        _id: orderId,
        orderType: 'buy',
        quantity: 150,
        price: 26.00,
        status: 'pending',
        userId: 'mockUserId',
      };

      Order.findByIdAndUpdate.mockResolvedValue(mockUpdatedOrder);

      const res = await request(app)
        .put(`/api/orders/${orderId}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quantity).toBe(150);
      expect(res.body.data.price).toBe(26.00);
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        orderId,
        updateData,
        { new: true, runValidators: true }
      );
    });

    it('should return 404 if order not found', async () => {
      const orderId = 'nonexistent';
      const updateData = { quantity: 150 };

      Order.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/orders/${orderId}`)
        .send(updateData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Order not found');
    });

    it('should prevent updating other users orders', async () => {
      const orderId = 'otherUserOrder';
      const updateData = { quantity: 150 };

      const mockOrder = {
        _id: orderId,
        userId: 'otherUserId', // Different user
        quantity: 100,
        price: 25.50,
      };

      Order.findByIdAndUpdate.mockResolvedValue(mockOrder);

      const res = await request(app)
        .put(`/api/orders/${orderId}`)
        .send(updateData);

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authorized to update this order');
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('should cancel an order successfully', async () => {
      const orderId = 'order123';

      const mockOrder = {
        _id: orderId,
        userId: 'mockUserId',
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };

      Order.findById.mockResolvedValue(mockOrder);

      const res = await request(app)
        .delete(`/api/orders/${orderId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Order cancelled successfully');
      expect(mockOrder.status).toBe('cancelled');
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should return 404 if order not found', async () => {
      const orderId = 'nonexistent';

      Order.findById.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/orders/${orderId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Order not found');
    });

    it('should prevent cancelling other users orders', async () => {
      const orderId = 'otherUserOrder';

      const mockOrder = {
        _id: orderId,
        userId: 'otherUserId', // Different user
        status: 'pending',
      };

      Order.findById.mockResolvedValue(mockOrder);

      const res = await request(app)
        .delete(`/api/orders/${orderId}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authorized to cancel this order');
    });

    it('should prevent cancelling already matched orders', async () => {
      const orderId = 'matchedOrder';

      const mockOrder = {
        _id: orderId,
        userId: 'mockUserId',
        status: 'matched', // Already matched
      };

      Order.findById.mockResolvedValue(mockOrder);

      const res = await request(app)
        .delete(`/api/orders/${orderId}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Cannot cancel matched order');
    });
  });

  describe('GET /api/orders/market-data', () => {
    it('should get market data successfully', async () => {
      const mockMarketData = {
        totalOrders: 25,
        buyOrders: 15,
        sellOrders: 10,
        averagePrice: 27.50,
        priceRange: {
          min: 20.00,
          max: 35.00,
        },
        volumeByEnergyType: {
          Solar: 500,
          Wind: 300,
        },
        volumeByEmirate: {
          Dubai: 400,
          'Abu Dhabi': 400,
        },
      };

      Order.aggregate.mockResolvedValue([mockMarketData]);

      const res = await request(app)
        .get('/api/orders/market-data');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalOrders).toBe(25);
      expect(res.body.data.buyOrders).toBe(15);
      expect(res.body.data.sellOrders).toBe(10);
    });

    it('should handle market data aggregation errors', async () => {
      Order.aggregate.mockRejectedValue(new Error('Aggregation failed'));

      const res = await request(app)
        .get('/api/orders/market-data');

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Server error');
    });
  });
});
