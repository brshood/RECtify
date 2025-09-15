const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const authRoutes = require('../../routes/auth');
const User = require('../../models/User');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user for login tests
    const userData = {
      email: 'test@rectify.ae',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      company: 'Test Company',
      emirate: 'Dubai'
    };

    testUser = new User(userData);
    await testUser.save();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@rectify.ae',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        company: 'New Company',
        role: 'trader',
        emirate: 'Dubai'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.firstName).toBe(userData.firstName);
      expect(response.body.user.lastName).toBe(userData.lastName);
      expect(response.body.user.company).toBe(userData.company);
      expect(response.body.user.role).toBe(userData.role);
      expect(response.body.user.emirate).toBe(userData.emirate);
    });

    it('should fail to register with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        company: 'New Company',
        role: 'trader',
        emirate: 'Dubai'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should fail to register with short password', async () => {
      const userData = {
        email: 'newuser@rectify.ae',
        password: '123',
        firstName: 'Jane',
        lastName: 'Smith',
        company: 'New Company',
        role: 'trader',
        emirate: 'Dubai'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should fail to register with missing required fields', async () => {
      const userData = {
        email: 'newuser@rectify.ae',
        password: 'password123'
        // Missing firstName, lastName, company, emirate
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should fail to register with invalid role', async () => {
      const userData = {
        email: 'newuser@rectify.ae',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        company: 'New Company',
        role: 'invalid-role',
        emirate: 'Dubai'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should fail to register with invalid emirate', async () => {
      const userData = {
        email: 'newuser@rectify.ae',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        company: 'New Company',
        role: 'trader',
        emirate: 'Invalid Emirate'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should fail to register with existing email', async () => {
      const userData = {
        email: 'test@rectify.ae', // Already exists from beforeEach
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        company: 'New Company',
        role: 'trader',
        emirate: 'Dubai'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists with this email');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@rectify.ae',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should fail login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@rectify.ae',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should fail login with invalid password', async () => {
      const loginData = {
        email: 'test@rectify.ae',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should fail login with invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should fail login with missing password', async () => {
      const loginData = {
        email: 'test@rectify.ae'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should fail login with inactive user', async () => {
      // Deactivate the test user
      testUser.isActive = false;
      await testUser.save();

      const loginData = {
        email: 'test@rectify.ae',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should increment login attempts on failed password', async () => {
      const loginData = {
        email: 'test@rectify.ae',
        password: 'wrongpassword'
      };

      // Make multiple failed attempts
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(400);
      }

      // Check that login attempts were incremented
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.loginAttempts).toBe(3);
    });

    it('should lock account after max failed attempts', async () => {
      const loginData = {
        email: 'test@rectify.ae',
        password: 'wrongpassword'
      };

      // Make max failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(400);
      }

      // Next attempt should be locked
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(423);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Account is locked');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const token = jwt.sign(
        { userId: testUser._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should fail logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No token provided, authorization denied');
    });

    it('should fail logout with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Token is not valid');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      const token = jwt.sign(
        { userId: testUser._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.id).toBe(testUser._id.toString());
    });

    it('should fail to get user without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No token provided, authorization denied');
    });

    it('should fail to get user with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Token is not valid');
    });

    it('should return 404 if user not found', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const token = jwt.sign(
        { userId: nonExistentUserId.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PUT /api/auth/profile', () => {
    let token;

    beforeEach(() => {
      token = jwt.sign(
        { userId: testUser._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    });

    it('should update profile successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        company: 'Updated Company',
        preferences: {
          currency: 'USD',
          language: 'ar',
          darkMode: true
        }
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.user.firstName).toBe(updateData.firstName);
      expect(response.body.user.lastName).toBe(updateData.lastName);
      expect(response.body.user.company).toBe(updateData.company);
      expect(response.body.user.preferences.currency).toBe(updateData.preferences.currency);
      expect(response.body.user.preferences.language).toBe(updateData.preferences.language);
      expect(response.body.user.preferences.darkMode).toBe(updateData.preferences.darkMode);
    });

    it('should fail to update profile without token', async () => {
      const updateData = {
        firstName: 'Updated'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No token provided, authorization denied');
    });

    it('should fail to update profile with invalid emirate', async () => {
      const updateData = {
        emirate: 'Invalid Emirate'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should fail to update profile with invalid currency', async () => {
      const updateData = {
        preferences: {
          currency: 'EUR'
        }
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should fail to update profile with empty firstName', async () => {
      const updateData = {
        firstName: ''
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 404 if user not found', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const tokenForNonExistentUser = jwt.sign(
        { userId: nonExistentUserId.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const updateData = {
        firstName: 'Updated'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${tokenForNonExistentUser}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });
});
