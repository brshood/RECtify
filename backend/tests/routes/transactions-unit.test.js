const request = require('supertest');
const express = require('express');
const transactionsRoutes = require('../../routes/transactions');
const Transaction = require('../../models/Transaction'); // Mocked Transaction model
const Order = require('../../models/Order'); // Mocked Order model
const User = require('../../models/User'); // Mocked User model
const jwt = require('jsonwebtoken'); // Mocked jsonwebtoken

// Mock the entire Transaction module
jest.mock('../../models/Transaction', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  aggregate: jest.fn(),
}));

// Mock the entire Order module
jest.mock('../../models/Order', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

// Mock the entire User module
jest.mock('../../models/User', () => ({
  findById: jest.fn(),
}));

// Mock the auth middleware to simplify route testing
jest.mock('../../middleware/auth', () => jest.fn((req, res, next) => {
  req.user = { userId: 'mockUserId', role: 'trader' }; // Mock authenticated user
  next();
}));

const app = express();
app.use(express.json());
app.use('/api/transactions', transactionsRoutes);

describe('Transactions Routes - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'supersecretjwtkeythatisatleast32characterslong';
  });

  describe('GET /api/transactions', () => {
    it('should get all transactions successfully', async () => {
      const mockTransactions = [
        {
          _id: 'tx1',
          buyerId: 'buyer1',
          sellerId: 'seller1',
          orderId: 'order1',
          quantity: 100,
          price: 25.50,
          transactionDate: new Date(),
          status: 'completed',
          certificateIds: ['REC001', 'REC002'],
        },
        {
          _id: 'tx2',
          buyerId: 'buyer2',
          sellerId: 'seller2',
          orderId: 'order2',
          quantity: 50,
          price: 30.00,
          transactionDate: new Date(),
          status: 'completed',
          certificateIds: ['REC003'],
        },
      ];

      Transaction.find.mockResolvedValue(mockTransactions);

      const res = await request(app)
        .get('/api/transactions');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].quantity).toBe(100);
      expect(res.body.data[1].quantity).toBe(50);
      expect(Transaction.find).toHaveBeenCalledWith({});
    });

    it('should filter transactions by user when specified', async () => {
      const mockUserTransactions = [
        {
          _id: 'tx1',
          buyerId: 'mockUserId',
          sellerId: 'seller1',
          orderId: 'order1',
          quantity: 100,
          price: 25.50,
          transactionDate: new Date(),
          status: 'completed',
        },
      ];

      Transaction.find.mockResolvedValue(mockUserTransactions);

      const res = await request(app)
        .get('/api/transactions?userId=mockUserId');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].buyerId).toBe('mockUserId');
      expect(Transaction.find).toHaveBeenCalledWith({
        $or: [
          { buyerId: 'mockUserId' },
          { sellerId: 'mockUserId' }
        ]
      });
    });

    it('should filter transactions by status when specified', async () => {
      const mockCompletedTransactions = [
        {
          _id: 'tx1',
          buyerId: 'buyer1',
          sellerId: 'seller1',
          orderId: 'order1',
          quantity: 100,
          price: 25.50,
          transactionDate: new Date(),
          status: 'completed',
        },
      ];

      Transaction.find.mockResolvedValue(mockCompletedTransactions);

      const res = await request(app)
        .get('/api/transactions?status=completed');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('completed');
      expect(Transaction.find).toHaveBeenCalledWith({ status: 'completed' });
    });

    it('should handle database errors', async () => {
      Transaction.find.mockRejectedValue(new Error('Database connection failed'));

      const res = await request(app)
        .get('/api/transactions');

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Server error');
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('should get a specific transaction successfully', async () => {
      const transactionId = 'tx123';
      const mockTransaction = {
        _id: transactionId,
        buyerId: 'buyer1',
        sellerId: 'seller1',
        orderId: 'order1',
        quantity: 100,
        price: 25.50,
        transactionDate: new Date(),
        status: 'completed',
        certificateIds: ['REC001', 'REC002'],
      };

      Transaction.findById.mockResolvedValue(mockTransaction);

      const res = await request(app)
        .get(`/api/transactions/${transactionId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(transactionId);
      expect(res.body.data.quantity).toBe(100);
      expect(res.body.data.price).toBe(25.50);
      expect(Transaction.findById).toHaveBeenCalledWith(transactionId);
    });

    it('should return 404 if transaction not found', async () => {
      const transactionId = 'nonexistent';

      Transaction.findById.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/transactions/${transactionId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Transaction not found');
    });

    it('should handle database errors', async () => {
      const transactionId = 'tx123';

      Transaction.findById.mockRejectedValue(new Error('Database connection failed'));

      const res = await request(app)
        .get(`/api/transactions/${transactionId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Server error');
    });
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction successfully', async () => {
      const transactionData = {
        buyerId: 'buyer1',
        sellerId: 'seller1',
        orderId: 'order1',
        quantity: 100,
        price: 25.50,
        certificateIds: ['REC001', 'REC002'],
      };

      const mockCreatedTransaction = {
        _id: 'newTxId',
        ...transactionData,
        transactionDate: new Date(),
        status: 'completed',
      };

      Transaction.create.mockResolvedValue(mockCreatedTransaction);

      const res = await request(app)
        .post('/api/transactions')
        .send(transactionData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.buyerId).toBe('buyer1');
      expect(res.body.data.sellerId).toBe('seller1');
      expect(res.body.data.quantity).toBe(100);
      expect(res.body.data.price).toBe(25.50);
      expect(res.body.data.status).toBe('completed');
      expect(Transaction.create).toHaveBeenCalledWith({
        ...transactionData,
        status: 'completed',
      });
    });

    it('should validate required fields', async () => {
      const incompleteTransactionData = {
        buyerId: 'buyer1',
        // Missing required fields
      };

      const res = await request(app)
        .post('/api/transactions')
        .send(incompleteTransactionData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('validation');
    });

    it('should validate quantity is positive', async () => {
      const invalidTransactionData = {
        buyerId: 'buyer1',
        sellerId: 'seller1',
        orderId: 'order1',
        quantity: -10, // Invalid quantity
        price: 25.50,
        certificateIds: ['REC001'],
      };

      const res = await request(app)
        .post('/api/transactions')
        .send(invalidTransactionData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should validate price is positive', async () => {
      const invalidTransactionData = {
        buyerId: 'buyer1',
        sellerId: 'seller1',
        orderId: 'order1',
        quantity: 100,
        price: -5.00, // Invalid price
        certificateIds: ['REC001'],
      };

      const res = await request(app)
        .post('/api/transactions')
        .send(invalidTransactionData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle database errors during transaction creation', async () => {
      const transactionData = {
        buyerId: 'buyer1',
        sellerId: 'seller1',
        orderId: 'order1',
        quantity: 100,
        price: 25.50,
        certificateIds: ['REC001'],
      };

      Transaction.create.mockRejectedValue(new Error('Database connection failed'));

      const res = await request(app)
        .post('/api/transactions')
        .send(transactionData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Server error');
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('should update transaction status successfully', async () => {
      const transactionId = 'tx123';
      const updateData = {
        status: 'failed',
      };

      const mockUpdatedTransaction = {
        _id: transactionId,
        buyerId: 'buyer1',
        sellerId: 'seller1',
        orderId: 'order1',
        quantity: 100,
        price: 25.50,
        status: 'failed',
        transactionDate: new Date(),
      };

      Transaction.findByIdAndUpdate.mockResolvedValue(mockUpdatedTransaction);

      const res = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('failed');
      expect(Transaction.findByIdAndUpdate).toHaveBeenCalledWith(
        transactionId,
        updateData,
        { new: true, runValidators: true }
      );
    });

    it('should return 404 if transaction not found', async () => {
      const transactionId = 'nonexistent';
      const updateData = { status: 'failed' };

      Transaction.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .send(updateData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Transaction not found');
    });

    it('should validate status values', async () => {
      const transactionId = 'tx123';
      const invalidUpdateData = {
        status: 'invalid_status',
      };

      const res = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .send(invalidUpdateData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/transactions/analytics', () => {
    it('should get transaction analytics successfully', async () => {
      const mockAnalytics = {
        totalTransactions: 50,
        totalVolume: 5000,
        totalValue: 125000,
        averagePrice: 25.00,
        transactionsByStatus: {
          completed: 45,
          pending: 3,
          failed: 2,
        },
        volumeByEnergyType: {
          Solar: 3000,
          Wind: 2000,
        },
        volumeByEmirate: {
          Dubai: 2500,
          'Abu Dhabi': 2500,
        },
        monthlyTrend: [
          { month: '2024-01', volume: 1000, value: 25000 },
          { month: '2024-02', volume: 1200, value: 30000 },
        ],
      };

      Transaction.aggregate.mockResolvedValue([mockAnalytics]);

      const res = await request(app)
        .get('/api/transactions/analytics');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalTransactions).toBe(50);
      expect(res.body.data.totalVolume).toBe(5000);
      expect(res.body.data.totalValue).toBe(125000);
      expect(res.body.data.averagePrice).toBe(25.00);
    });

    it('should handle analytics aggregation errors', async () => {
      Transaction.aggregate.mockRejectedValue(new Error('Aggregation failed'));

      const res = await request(app)
        .get('/api/transactions/analytics');

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Server error');
    });
  });

  describe('GET /api/transactions/user/:userId', () => {
    it('should get user transactions successfully', async () => {
      const userId = 'user123';
      const mockUserTransactions = [
        {
          _id: 'tx1',
          buyerId: userId,
          sellerId: 'seller1',
          orderId: 'order1',
          quantity: 100,
          price: 25.50,
          transactionDate: new Date(),
          status: 'completed',
        },
        {
          _id: 'tx2',
          buyerId: 'buyer1',
          sellerId: userId,
          orderId: 'order2',
          quantity: 50,
          price: 30.00,
          transactionDate: new Date(),
          status: 'completed',
        },
      ];

      Transaction.find.mockResolvedValue(mockUserTransactions);

      const res = await request(app)
        .get(`/api/transactions/user/${userId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(Transaction.find).toHaveBeenCalledWith({
        $or: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      });
    });

    it('should handle user not found', async () => {
      const userId = 'nonexistent';

      Transaction.find.mockResolvedValue([]);

      const res = await request(app)
        .get(`/api/transactions/user/${userId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });
  });
});
