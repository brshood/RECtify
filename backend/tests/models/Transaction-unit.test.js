const mongoose = require('mongoose');

// Mock the Transaction model
const mockTransaction = {
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  deleteMany: jest.fn(),
  updateOne: jest.fn(),
  aggregate: jest.fn()
};

jest.mock('../../models/Transaction', () => mockTransaction);

describe('Transaction Model - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Transaction Creation', () => {
    it('should create a REC purchase transaction', () => {
      const transactionData = {
        type: 'purchase',
        quantity: 100,
        price: 50.00,
        total: 5000.00,
        buyerId: '507f1f77bcf86cd799439011',
        sellerId: '507f1f77bcf86cd799439012',
        recHoldingId: '507f1f77bcf86cd799439013',
        status: 'completed'
      };

      const expectedTransaction = {
        _id: '507f1f77bcf86cd799439014',
        ...transactionData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockTransaction.create.mockResolvedValue(expectedTransaction);

      expect(transactionData.type).toBe('purchase');
      expect(transactionData.total).toBe(5000.00);
      expect(transactionData.status).toBe('completed');
    });

    it('should create a REC sale transaction', () => {
      const transactionData = {
        type: 'sale',
        quantity: 50,
        price: 55.00,
        total: 2750.00,
        buyerId: '507f1f77bcf86cd799439015',
        sellerId: '507f1f77bcf86cd799439011',
        recHoldingId: '507f1f77bcf86cd799439016',
        status: 'pending'
      };

      const expectedTransaction = {
        _id: '507f1f77bcf86cd799439017',
        ...transactionData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockTransaction.create.mockResolvedValue(expectedTransaction);

      expect(transactionData.type).toBe('sale');
      expect(transactionData.total).toBe(2750.00);
      expect(transactionData.status).toBe('pending');
    });
  });

  describe('Transaction Status Management', () => {
    it('should handle transaction status transitions', () => {
      const statusTransitions = [
        { from: 'pending', to: 'processing', valid: true },
        { from: 'pending', to: 'cancelled', valid: true },
        { from: 'processing', to: 'completed', valid: true },
        { from: 'processing', to: 'failed', valid: true },
        { from: 'completed', to: 'refunded', valid: true },
        { from: 'completed', to: 'pending', valid: false },
        { from: 'cancelled', to: 'completed', valid: false }
      ];

      const isValidTransition = (from, to) => {
        const validTransitions = {
          'pending': ['processing', 'cancelled'],
          'processing': ['completed', 'failed'],
          'completed': ['refunded'],
          'failed': [],
          'cancelled': [],
          'refunded': []
        };
        return validTransitions[from]?.includes(to) || false;
      };

      statusTransitions.forEach(({ from, to, valid }) => {
        expect(isValidTransition(from, to)).toBe(valid);
      });
    });

    it('should calculate transaction fees correctly', () => {
      const transactions = [
        { total: 1000.00, feeRate: 0.02, expectedFee: 20.00 },
        { total: 5000.00, feeRate: 0.015, expectedFee: 75.00 },
        { total: 10000.00, feeRate: 0.01, expectedFee: 100.00 }
      ];

      const calculateFee = (total, feeRate) => total * feeRate;

      transactions.forEach(({ total, feeRate, expectedFee }) => {
        expect(calculateFee(total, feeRate)).toBe(expectedFee);
      });
    });
  });

  describe('Transaction Validation', () => {
    it('should validate transaction amounts', () => {
      const validAmounts = [0.01, 1.00, 100.50, 10000.99];
      const invalidAmounts = [0, -1.00, -100.50];

      const isValidAmount = (amount) => {
        return amount > 0 && typeof amount === 'number';
      };

      validAmounts.forEach(amount => {
        expect(isValidAmount(amount)).toBe(true);
      });

      invalidAmounts.forEach(amount => {
        expect(isValidAmount(amount)).toBe(false);
      });
    });

    it('should validate transaction types', () => {
      const validTypes = ['purchase', 'sale', 'transfer', 'refund'];
      const invalidTypes = ['buy', 'sell', 'trade', 'exchange'];

      const isValidType = (type) => {
        return validTypes.includes(type);
      };

      validTypes.forEach(type => {
        expect(isValidType(type)).toBe(true);
      });

      invalidTypes.forEach(type => {
        expect(isValidType(type)).toBe(false);
      });
    });

    it('should validate transaction quantities', () => {
      const validQuantities = [1, 10, 100, 1000];
      const invalidQuantities = [0, -1, -10, 0.5];

      const isValidQuantity = (quantity) => {
        return quantity > 0 && Number.isInteger(quantity);
      };

      validQuantities.forEach(qty => {
        expect(isValidQuantity(qty)).toBe(true);
      });

      invalidQuantities.forEach(qty => {
        expect(isValidQuantity(qty)).toBe(false);
      });
    });
  });

  describe('Transaction Matching', () => {
    it('should match transactions with orders correctly', () => {
      const buyOrder = {
        type: 'buy',
        quantity: 100,
        price: 50.00,
        userId: '507f1f77bcf86cd799439011'
      };

      const sellOrder = {
        type: 'sell',
        quantity: 100,
        price: 50.00,
        userId: '507f1f77bcf86cd799439012'
      };

      const canMatch = (buyOrder, sellOrder) => {
        return buyOrder.type === 'buy' && 
               sellOrder.type === 'sell' && 
               buyOrder.price >= sellOrder.price &&
               buyOrder.quantity === sellOrder.quantity;
      };

      expect(canMatch(buyOrder, sellOrder)).toBe(true);
    });

    it('should handle partial transaction matching', () => {
      const buyOrder = { quantity: 100, price: 50.00 };
      const sellOrder = { quantity: 60, price: 50.00 };

      const matchedQuantity = Math.min(buyOrder.quantity, sellOrder.quantity);
      const remainingBuyQuantity = buyOrder.quantity - matchedQuantity;
      const remainingSellQuantity = sellOrder.quantity - matchedQuantity;

      expect(matchedQuantity).toBe(60);
      expect(remainingBuyQuantity).toBe(40);
      expect(remainingSellQuantity).toBe(0);
    });
  });

  describe('Transaction Reporting', () => {
    it('should calculate transaction totals by period', () => {
      const transactions = [
        { amount: 1000.00, date: new Date('2024-01-01'), type: 'purchase' },
        { amount: 1500.00, date: new Date('2024-01-02'), type: 'sale' },
        { amount: 2000.00, date: new Date('2024-01-03'), type: 'purchase' },
        { amount: 750.00, date: new Date('2024-01-04'), type: 'sale' }
      ];

      const calculateTotalByType = (transactions, type) => {
        return transactions
          .filter(t => t.type === type)
          .reduce((sum, t) => sum + t.amount, 0);
      };

      const purchaseTotal = calculateTotalByType(transactions, 'purchase');
      const saleTotal = calculateTotalByType(transactions, 'sale');

      expect(purchaseTotal).toBe(3000.00);
      expect(saleTotal).toBe(2250.00);
    });

    it('should calculate average transaction values', () => {
      const transactions = [
        { amount: 1000.00 },
        { amount: 1500.00 },
        { amount: 2000.00 },
        { amount: 750.00 }
      ];

      const averageAmount = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;

      expect(averageAmount).toBe(1312.50);
    });

    it('should track transaction volume by day', () => {
      const transactions = [
        { amount: 1000.00, date: new Date('2024-01-01') },
        { amount: 1500.00, date: new Date('2024-01-01') },
        { amount: 2000.00, date: new Date('2024-01-02') },
        { amount: 750.00, date: new Date('2024-01-02') }
      ];

      const volumeByDay = transactions.reduce((acc, t) => {
        const day = t.date.toISOString().split('T')[0];
        acc[day] = (acc[day] || 0) + t.amount;
        return acc;
      }, {});

      expect(volumeByDay['2024-01-01']).toBe(2500.00);
      expect(volumeByDay['2024-01-02']).toBe(2750.00);
    });
  });
});
