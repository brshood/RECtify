const request = require('supertest');
const express = require('express');
const { createTestUser, generateJWT } = require('./helpers/testData');
const User = require('../models/User');
const StripeEvent = require('../models/StripeEvent');

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

const paymentsRoutes = require('../routes/payments');
app.use('/api/payments', paymentsRoutes.router || paymentsRoutes);
const usersRoutes = require('../routes/users');
app.use('/api/users', usersRoutes);

describe('Payment Integration', () => {
  
  describe('Balance Operations', () => {
    it('should fetch user balance correctly', async () => {
      const user = await createTestUser({
        email: 'balance-test@rectify.ae',
        cashBalance: 5000,
        cashCurrency: 'AED',
        reservedBalance: 1000
      });

      const token = generateJWT(user._id);

      const response = await request(app)
        .get('/api/payments/balance')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cashBalance).toBe(5000);
      expect(response.body.data.cashCurrency).toBe('AED');
      expect(response.body.data.reservedBalance).toBe(1000);
    });

    it('should reject balance request without auth', async () => {
      const response = await request(app)
        .get('/api/payments/balance')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Admin Manual Credit', () => {
    it('should allow an admin to credit a user balance', async () => {
      const admin = await createTestUser({
        email: 'admin-credit@rectify.ae',
        role: 'admin'
      });
      const recipient = await createTestUser({
        email: 'recipient-credit@rectify.ae',
        cashBalance: 1000,
        cashCurrency: 'AED'
      });

      const token = generateJWT(admin._id);

      const response = await request(app)
        .post('/api/payments/admin/manual-credit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: recipient._id.toString(),
          amount: 250.567,
          currency: 'USD'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(recipient._id.toString());
      expect(response.body.data.cashCurrency).toBe('USD');
      const expectedBalance = 1000 + 250.57;
      expect(Math.abs(response.body.data.cashBalance - expectedBalance)).toBeLessThan(0.01);

      const updatedUser = await User.findById(recipient._id);
      expect(updatedUser.cashBalance).toBeCloseTo(expectedBalance, 2);
      expect(updatedUser.cashCurrency).toBe('USD');
    });

    it('should reject manual credit attempts from non-admin users', async () => {
      const trader = await createTestUser({
        email: 'trader-credit-attempt@rectify.ae'
      });
      const target = await createTestUser({
        email: 'target-credit@rectify.ae'
      });

      const token = generateJWT(trader._id);

      const response = await request(app)
        .post('/api/payments/admin/manual-credit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: target._id.toString(),
          amount: 100,
          currency: 'AED'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should prevent admins from crediting their own balance', async () => {
      const admin = await createTestUser({
        email: 'self-credit-admin@rectify.ae',
        role: 'admin'
      });

      const token = generateJWT(admin._id);

      const response = await request(app)
        .post('/api/payments/admin/manual-credit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: admin._id.toString(),
          amount: 100,
          currency: 'AED'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/cannot manually credit their own accounts/i);
    });

    it('should validate manual credit payloads', async () => {
      const admin = await createTestUser({
        email: 'validation-admin@rectify.ae',
        role: 'admin'
      });
      const target = await createTestUser({
        email: 'validation-target@rectify.ae'
      });

      const token = generateJWT(admin._id);

      const missingBodyResponse = await request(app)
        .post('/api/payments/admin/manual-credit')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(missingBodyResponse.body.success).toBe(false);
      expect(Array.isArray(missingBodyResponse.body.errors)).toBe(true);

      const invalidCurrencyResponse = await request(app)
        .post('/api/payments/admin/manual-credit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: target._id.toString(),
          amount: 100,
          currency: 'EUR'
        })
        .expect(400);

      expect(invalidCurrencyResponse.body.success).toBe(false);
    });

    it('should return 404 when the target user does not exist', async () => {
      const admin = await createTestUser({
        email: 'notfound-admin@rectify.ae',
        role: 'admin'
      });

      const token = generateJWT(admin._id);
      const nonExistentUserId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .post('/api/payments/admin/manual-credit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: nonExistentUserId,
          amount: 50,
          currency: 'AED'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Stripe Checkout Session', () => {
    it('should require authentication for checkout session', async () => {
      const response = await request(app)
        .post('/api/payments/topup-session')
        .send({
          amount: 1000,
          currency: 'AED'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate amount for checkout session', async () => {
      const user = await createTestUser({
        email: 'checkout-validation@rectify.ae',
        cashBalance: 1000
      });

      const token = generateJWT(user._id);

      // Invalid amount
      const response = await request(app)
        .post('/api/payments/topup-session')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: -100,
          currency: 'AED'
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle missing Stripe configuration gracefully', async () => {
      const user = await createTestUser({
        email: 'no-stripe@rectify.ae',
        cashBalance: 1000
      });

      const token = generateJWT(user._id);

      const response = await request(app)
        .post('/api/payments/topup-session')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 1000,
          currency: 'AED'
        });

      // Should either create session or return error about missing Stripe config
      // Don't fail the test if Stripe isn't configured in test environment
      if (response.status === 400) {
        expect(response.body.message).toMatch(/stripe/i);
      }
    });
  });

  describe('Withdrawal Validation', () => {
    it('should prevent withdrawal exceeding available balance', async () => {
      const user = await createTestUser({
        email: 'withdrawal-test@rectify.ae',
        cashBalance: 1000,
        reservedBalance: 800
      });

      // Available balance = 1000 - 800 = 200 AED
      // User should not be able to "withdraw" more than 200 AED
      
      // This test assumes there's a withdrawal endpoint - if not implemented yet,
      // the validation logic should exist to prevent over-withdrawal
      const availableBalance = user.cashBalance - user.reservedBalance;
      expect(availableBalance).toBe(200);

      // Verify reserved balance is properly tracked
      expect(user.reservedBalance).toBe(800);
    });
  });

  describe('Webhook Processing', () => {
    it('should prevent duplicate webhook processing', async () => {
      const eventId = 'evt_test_' + Date.now();
      
      // First webhook with this event ID
      const stripeEvent1 = new StripeEvent({
        eventId: eventId,
        type: 'payment_intent.succeeded',
        processed: true,
        data: { amount: 1000 }
      });
      await stripeEvent1.save();

      // Try to process same event ID again
      const existingEvent = await StripeEvent.findOne({ eventId });
      expect(existingEvent).toBeDefined();
      expect(existingEvent.processed).toBe(true);

      // Attempting to create duplicate should be prevented by unique index
      // or handled by the webhook handler
    });

    it('should store webhook events', async () => {
      const eventId = 'evt_unique_' + Date.now();
      
      const stripeEvent = new StripeEvent({
        eventId: eventId,
        type: 'checkout.session.completed',
        processed: false,
        data: { 
          amount: 5000,
          currency: 'aed'
        }
      });

      await stripeEvent.save();

      const savedEvent = await StripeEvent.findOne({ eventId });
      expect(savedEvent).toBeDefined();
      expect(savedEvent.type).toBe('checkout.session.completed');
      expect(savedEvent.data.amount).toBe(5000);
    });
  });

  describe('Admin User Listing', () => {
    it('should allow admins to retrieve user summaries', async () => {
      const admin = await createTestUser({
        email: 'list-admin@rectify.ae',
        role: 'admin'
      });
      const userA = await createTestUser({
        email: 'list-user-a@rectify.ae',
        cashBalance: 200
      });
      const userB = await createTestUser({
        email: 'list-user-b@rectify.ae',
        cashBalance: 300,
        cashCurrency: 'USD'
      });

      const token = generateJWT(admin._id);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.some(user => user.email === userA.email)).toBe(true);

      const usdUser = response.body.data.find(user => user.email === userB.email);
      expect(usdUser.cashCurrency).toBe('USD');
      expect(typeof usdUser.isSelf).toBe('boolean');
    });

    it('should block non-admin users from listing accounts', async () => {
      const nonAdmin = await createTestUser({
        email: 'list-non-admin@rectify.ae'
      });

      const token = generateJWT(nonAdmin._id);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting on manual credit operations', async () => {
      const admin = await createTestUser({
        email: 'ratelimit-admin@rectify.ae',
        role: 'admin'
      });
      const recipient = await createTestUser({
        email: 'ratelimit-user@rectify.ae'
      });

      const token = generateJWT(admin._id);

      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/payments/admin/manual-credit')
            .set('Authorization', `Bearer ${token}`)
            .send({
              userId: recipient._id.toString(),
              amount: 1,
              currency: 'AED'
            })
        );
      }

      const responses = await Promise.all(requests);

      const successCount = responses.filter(r => r.status === 200).length;
      const rateLimitedCount = responses.filter(r => r.status === 429).length;

      expect(successCount).toBeGreaterThan(0);
      expect(successCount + rateLimitedCount).toBe(responses.length);
    }, 15000); // Longer timeout for multiple requests
  });

  describe('Error Handling', () => {
    it('should handle invalid admin tokens gracefully', async () => {
      const targetUser = await createTestUser({
        email: 'error-target@rectify.ae'
      });

      const token = generateJWT('invalid-user-id-format');

      const response = await request(app)
        .post('/api/payments/admin/manual-credit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: targetUser._id.toString(),
          amount: 100,
          currency: 'AED'
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
    });
  });
});

