const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock the User model
const mockUser = {
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

jest.mock('../../models/User', () => mockUser);

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn()
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

// Create a simple express app for testing
const app = express();
app.use(express.json());

// Mock auth routes
const authRoutes = require('../../routes/auth');
app.use('/api/auth', authRoutes);

describe('Auth Routes - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-32-chars';
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@rectify.ae',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        company: 'Test Company',
        role: 'trader',
        emirate: 'Dubai'
      };

      // Mock User.findOne to return null (user doesn't exist)
      mockUser.findOne.mockResolvedValue(null);
      
      // Mock bcrypt.hash
      bcrypt.hash.mockResolvedValue('hashed-password123');
      
      // Mock User.create
      mockUser.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...userData,
        password: 'hashed-password123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Mock jwt.sign
      jwt.sign.mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBe('mock-jwt-token');
      expect(mockUser.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockUser.create).toHaveBeenCalled();
    });

    it('should reject registration with existing email', async () => {
      const userData = {
        email: 'existing@rectify.ae',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };

      // Mock User.findOne to return existing user
      mockUser.findOne.mockResolvedValue({
        _id: '507f1f77bcf86cd799439012',
        email: userData.email
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
      expect(mockUser.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(mockUser.create).not.toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        email: 'test@rectify.ae'
        // Missing password, firstName, lastName
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@rectify.ae',
        password: 'password123'
      };

      const userData = {
        _id: '507f1f77bcf86cd799439011',
        email: loginData.email,
        password: 'hashed-password123',
        firstName: 'Test',
        lastName: 'User',
        isActive: true
      };

      // Mock User.findOne
      mockUser.findOne.mockResolvedValue(userData);
      
      // Mock bcrypt.compare
      bcrypt.compare.mockResolvedValue(true);
      
      // Mock jwt.sign
      jwt.sign.mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBe('mock-jwt-token');
      expect(mockUser.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, userData.password);
    });

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        email: 'test@rectify.ae',
        password: 'wrongpassword'
      };

      const userData = {
        _id: '507f1f77bcf86cd799439011',
        email: loginData.email,
        password: 'hashed-password123',
        isActive: true
      };

      // Mock User.findOne
      mockUser.findOne.mockResolvedValue(userData);
      
      // Mock bcrypt.compare to return false
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, userData.password);
    });

    it('should reject login for inactive user', async () => {
      const loginData = {
        email: 'inactive@rectify.ae',
        password: 'password123'
      };

      const userData = {
        _id: '507f1f77bcf86cd799439011',
        email: loginData.email,
        password: 'hashed-password123',
        isActive: false
      };

      // Mock User.findOne
      mockUser.findOne.mockResolvedValue(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Account is deactivated');
    });

    it('should reject login for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@rectify.ae',
        password: 'password123'
      };

      // Mock User.findOne to return null
      mockUser.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
      expect(mockUser.findOne).toHaveBeenCalledWith({ email: loginData.email });
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data with valid token', async () => {
      const userData = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@rectify.ae',
        firstName: 'Test',
        lastName: 'User',
        role: 'trader',
        isActive: true
      };

      // Mock User.findById
      mockUser.findById.mockResolvedValue(userData);
      
      // Mock jwt.verify
      jwt.verify.mockReturnValue({ userId: userData._id });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer mock-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
      expect(mockUser.findById).toHaveBeenCalledWith(userData._id);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer mock-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('logged out');
    });
  });
});
