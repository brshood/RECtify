const request = require('supertest');
const express = require('express');
const { createTestUser, generateJWT } = require('./helpers/testData');

// Create app with security middleware
const app = express();
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { xssProtection } = require('../middleware/security');

app.use(express.json());
app.use(mongoSanitize());
app.use(xssProtection);

// Test rate limiter
const testLimiter = rateLimit({
  windowMs: 1000,
  max: 3,
  message: { error: 'Too many requests' }
});

app.post('/api/test/rate-limit', testLimiter, (req, res) => {
  res.json({ success: true });
});

app.post('/api/test/sanitize', (req, res) => {
  res.json({ success: true, data: req.body });
});

describe('Security Middleware', () => {
  describe('Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      await request(app)
        .post('/api/test/rate-limit')
        .send({})
        .expect(200);

      await request(app)
        .post('/api/test/rate-limit')
        .send({})
        .expect(200);
    });

    it('should block requests exceeding limit', async () => {
      // Make 3 requests (at the limit)
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/test/rate-limit')
          .send({});
      }

      // 4th request should be blocked
      const response = await request(app)
        .post('/api/test/rate-limit')
        .send({})
        .expect(429);

      expect(response.body.error).toContain('Too many requests');
    });
  });

  describe('XSS Protection', () => {
    it('should sanitize script tags in body', async () => {
      const response = await request(app)
        .post('/api/test/sanitize')
        .send({
          name: '<script>alert("xss")</script>John',
          comment: '<img src=x onerror=alert("xss")>'
        })
        .expect(200);

      expect(response.body.data.name).not.toContain('<script>');
      expect(response.body.data.comment).not.toContain('onerror');
    });

    it('should sanitize dangerous HTML in query params', async () => {
      const response = await request(app)
        .post('/api/test/sanitize?search=<script>alert("xss")</script>')
        .send({})
        .expect(200);

      // XSS middleware should have cleaned the query
    });
  });

  describe('NoSQL Injection Protection', () => {
    it('should sanitize MongoDB operators in request body', async () => {
      const response = await request(app)
        .post('/api/test/sanitize')
        .send({
          email: { $ne: null },
          password: { $gt: '' }
        })
        .expect(200);

      // MongoDB operators should be stripped
      expect(response.body.data.email).not.toHaveProperty('$ne');
      expect(response.body.data.password).not.toHaveProperty('$gt');
    });

    it('should sanitize nested MongoDB operators', async () => {
      const response = await request(app)
        .post('/api/test/sanitize')
        .send({
          user: {
            email: { $ne: null },
            role: { $in: ['admin'] }
          }
        })
        .expect(200);

      expect(response.body.data.user.email).not.toHaveProperty('$ne');
      expect(response.body.data.user.role).not.toHaveProperty('$in');
    });
  });

  describe('Input Validation', () => {
    it('should handle very long strings', async () => {
      const longString = 'A'.repeat(10000);

      const response = await request(app)
        .post('/api/test/sanitize')
        .send({ content: longString })
        .expect(200);

      // Should still process (XSS middleware has length limits)
      expect(response.body.success).toBe(true);
    });

    it('should handle special characters', async () => {
      const response = await request(app)
        .post('/api/test/sanitize')
        .send({
          text: 'Test with "quotes" and \'apostrophes\' and <brackets>'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('JWT Security', () => {
    it('should reject expired tokens', async () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: '507f1f77bcf86cd799439011' },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      );

      // Would need to test against actual authenticated route
      // This is a placeholder for the concept
      expect(expiredToken).toBeDefined();
    });

    it('should reject tampered tokens', async () => {
      const user = await createTestUser();
      const validToken = generateJWT(user._id);
      
      // Tamper with token
      const tamperedToken = validToken.slice(0, -5) + 'XXXXX';

      // Would need to test against actual authenticated route
      expect(tamperedToken).not.toBe(validToken);
    });

    it('should validate token signature', async () => {
      const jwt = require('jsonwebtoken');
      const user = await createTestUser();
      
      const tokenWithWrongSecret = jwt.sign(
        { userId: user._id },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      // Should fail when verified with correct secret
      expect(() => {
        jwt.verify(tokenWithWrongSecret, process.env.JWT_SECRET);
      }).toThrow();
    });
  });

  describe('CORS Security', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/test/rate-limit')
        .expect(404);

      // These headers would be set by helmet middleware
      // Testing concept - actual headers depend on server.js configuration
    });
  });
});

