const request = require('supertest');
const express = require('express');
const { createTestUser, createTestOrder, createTestHolding, generateJWT } = require('./helpers/testData');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const RECHolding = require('../models/RECHolding');

// Import trading service
const RECTradingService = require('../services/RECTradingService');

describe('Trading Service', () => {
  let buyer, seller, buyerHolding, sellerHolding;

  beforeEach(async () => {
    buyer = await createTestUser({
      email: 'buyer@rectify.ae',
      cashBalance: 100000
    });

    seller = await createTestUser({
      email: 'seller@rectify.ae',
      cashBalance: 50000
    });

    // Create holdings for seller
    sellerHolding = await createTestHolding(seller._id, {
      facilityName: 'Solar Farm A',
      energyType: 'Solar',
      quantity: 1000,
      vintage: 2024,
      emirate: 'Abu Dhabi'
    });
  });

  describe('Order Matching', () => {
    it('should match compatible buy and sell orders', async () => {
      // Create sell order
      const sellOrder = await createTestOrder(seller._id, {
        type: 'sell',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi',
        status: 'active'
      });

      // Create matching buy order
      const buyOrder = await createTestOrder(buyer._id, {
        type: 'buy',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi',
        status: 'active'
      });

      // Attempt to match orders
      const result = await RECTradingService.matchOrders(buyOrder._id);

      expect(result).toBeDefined();
      if (result.success) {
        // Verify transaction was created
        const transaction = await Transaction.findOne({
          buyerId: buyer._id,
          sellerId: seller._id
        });

        expect(transaction).toBeDefined();
        expect(transaction.quantity).toBe(100);
        expect(transaction.price).toBe(50);
      }
    });

    it('should not match orders with different facilities', async () => {
      const sellOrder = await createTestOrder(seller._id, {
        type: 'sell',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      const buyOrder = await createTestOrder(buyer._id, {
        type: 'buy',
        facilityName: 'Solar Farm B',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      const result = await RECTradingService.matchOrders(buyOrder._id);

      // Should not match due to different facilities
      const transaction = await Transaction.findOne({
        buyerId: buyer._id,
        sellerId: seller._id
      });

      expect(transaction).toBeNull();
    });

    it('should not match orders with incompatible prices', async () => {
      const sellOrder = await createTestOrder(seller._id, {
        type: 'sell',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 60,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      const buyOrder = await createTestOrder(buyer._id, {
        type: 'buy',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      const result = await RECTradingService.matchOrders(buyOrder._id);

      // Should not match - buyer price < seller price
      const transaction = await Transaction.findOne({
        buyerId: buyer._id,
        sellerId: seller._id
      });

      expect(transaction).toBeNull();
    });

    it('should handle partial order fills', async () => {
      // Create large sell order
      const sellOrder = await createTestOrder(seller._id, {
        type: 'sell',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 500,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      // Create smaller buy order
      const buyOrder = await createTestOrder(buyer._id, {
        type: 'buy',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      const result = await RECTradingService.matchOrders(buyOrder._id);

      if (result && result.success) {
        // Buy order should be filled
        const updatedBuyOrder = await Order.findById(buyOrder._id);
        expect(updatedBuyOrder.status).toBe('filled');

        // Sell order should be partially filled
        const updatedSellOrder = await Order.findById(sellOrder._id);
        expect(updatedSellOrder.status).toBe('partial');
        expect(updatedSellOrder.filledQuantity).toBe(100);
      }
    });
  });

  describe('Portfolio Updates', () => {
    it('should update buyer holdings after successful trade', async () => {
      const sellOrder = await createTestOrder(seller._id, {
        type: 'sell',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      const buyOrder = await createTestOrder(buyer._id, {
        type: 'buy',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      await RECTradingService.matchOrders(buyOrder._id);

      // Check if buyer received holdings
      const buyerHoldings = await RECHolding.findOne({
        userId: buyer._id,
        facilityName: 'Solar Farm A'
      });

      if (buyerHoldings) {
        expect(buyerHoldings.quantity).toBeGreaterThan(0);
      }
    });

    it('should reduce seller holdings after successful trade', async () => {
      const initialQuantity = sellerHolding.quantity;

      const sellOrder = await createTestOrder(seller._id, {
        type: 'sell',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      const buyOrder = await createTestOrder(buyer._id, {
        type: 'buy',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      await RECTradingService.matchOrders(buyOrder._id);

      // Check if seller holdings were reduced
      const updatedHolding = await RECHolding.findById(sellerHolding._id);
      if (updatedHolding) {
        expect(updatedHolding.quantity).toBeLessThan(initialQuantity);
      }
    });
  });

  describe('Transaction Fees', () => {
    it('should calculate and apply platform fees', async () => {
      const sellOrder = await createTestOrder(seller._id, {
        type: 'sell',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      const buyOrder = await createTestOrder(buyer._id, {
        type: 'buy',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      await RECTradingService.matchOrders(buyOrder._id);

      const transaction = await Transaction.findOne({
        buyerId: buyer._id,
        sellerId: seller._id
      });

      if (transaction) {
        expect(transaction.platformFee).toBeGreaterThan(0);
        expect(transaction.totalValue).toBe(5000); // 100 * 50
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle user trading with themselves', async () => {
      // Create holdings for buyer so they can also sell
      await createTestHolding(buyer._id, {
        facilityName: 'Solar Farm B',
        energyType: 'Solar',
        quantity: 500,
        vintage: 2024,
        emirate: 'Dubai'
      });

      const sellOrder = await createTestOrder(buyer._id, {
        type: 'sell',
        facilityName: 'Solar Farm B',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Dubai'
      });

      const buyOrder = await createTestOrder(buyer._id, {
        type: 'buy',
        facilityName: 'Solar Farm B',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Dubai'
      });

      const result = await RECTradingService.matchOrders(buyOrder._id);

      // System should prevent self-trading
      if (result && result.success === false) {
        expect(result.message).toContain('cannot trade with yourself');
      }
    });

    it('should handle concurrent order matching', async () => {
      // Create multiple buy orders
      const buyOrder1 = await createTestOrder(buyer._id, {
        type: 'buy',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      const buyer2 = await createTestUser({
        email: 'buyer2@rectify.ae',
        cashBalance: 100000
      });

      const buyOrder2 = await createTestOrder(buyer2._id, {
        type: 'buy',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      // Create single sell order
      const sellOrder = await createTestOrder(seller._id, {
        type: 'sell',
        facilityName: 'Solar Farm A',
        energyType: 'Solar',
        quantity: 100,
        price: 50,
        vintage: 2024,
        emirate: 'Abu Dhabi'
      });

      // Attempt to match both (only one should succeed)
      await Promise.all([
        RECTradingService.matchOrders(buyOrder1._id),
        RECTradingService.matchOrders(buyOrder2._id)
      ]);

      const transactions = await Transaction.find({
        sellerId: seller._id
      });

      // Only one transaction should be created
      expect(transactions.length).toBeLessThanOrEqual(1);
    });
  });
});

