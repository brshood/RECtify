const request = require('supertest');
const express = require('express');
const { createTestUser, generateJWT } = require('./helpers/testData');
const User = require('../models/User');

// Create minimal app for testing
const app = express();
app.use(express.json());
const authRoutes = require('../routes/auth');
app.use('/api/auth', authRoutes);

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: 'newuser@rectify.ae',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        role: 'trader',
        emirate: 'Dubai'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'weak',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        role: 'trader',
        emirate: 'Dubai'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject duplicate email registration', async () => {
      const existingUser = await createTestUser({
        email: 'duplicate@rectify.ae'
      });

      const userData = {
        email: 'duplicate@rectify.ae',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Doe',
        company: 'Test Company',
        role: 'trader',
        emirate: 'Dubai'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should sanitize XSS attempts in input', async () => {
      const userData = {
        email: 'xss@rectify.ae',
        password: 'SecurePass123!',
        firstName: '<script>alert("xss")</script>John',
        lastName: 'Doe',
        company: 'Test Company',
        role: 'trader',
        emirate: 'Dubai'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.firstName).not.toContain('<script>');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const user = await createTestUser({
        email: 'login@rectify.ae'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@rectify.ae',
          password: 'TestPassword123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('login@rectify.ae');
    });

    it('should reject invalid credentials', async () => {
      const user = await createTestUser({
        email: 'wrongpass@rectify.ae'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrongpass@rectify.ae',
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should lock account after 5 failed attempts', async () => {
      const user = await createTestUser({
        email: 'locktest@rectify.ae'
      });

      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'locktest@rectify.ae',
            password: 'WrongPassword123!'
          });
      }

      // 6th attempt should be locked
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'locktest@rectify.ae',
          password: 'TestPassword123!'
        })
        .expect(423);

      expect(response.body.message).toContain('locked');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const user = await createTestUser({
        email: 'me@rectify.ae'
      });
      const token = generateJWT(user._id);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('me@rectify.ae');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send reset code for valid email', async () => {
      const user = await createTestUser({
        email: 'reset@rectify.ae'
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'reset@rectify.ae' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('code');

      // Verify reset token was created
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.passwordResetToken).toBeDefined();
      expect(updatedUser.passwordResetExpires).toBeDefined();
    });

    it('should not reveal if email does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@rectify.ae' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});

