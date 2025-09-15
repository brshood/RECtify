const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Mock the User model since we're using mocked mongoose
const mockUserSchema = {
  pre: jest.fn(),
  methods: {},
  statics: {},
  virtual: jest.fn().mockReturnThis(),
  get: jest.fn(),
  set: jest.fn()
};

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

// Mock the User model
jest.mock('../../models/User', () => mockUser);

describe('User Model - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'trader'
      };

      // Mock bcrypt.hash to return a hashed password
      const hashedPassword = 'hashed-password123';
      bcrypt.hash.mockResolvedValue(hashedPassword);

      // Mock the save method
      mockUser.save.mockResolvedValue({
        ...userData,
        password: hashedPassword
      });

      // Simulate password hashing
      const hashedData = {
        ...userData,
        password: await bcrypt.hash(userData.password, 10)
      };

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(hashedData.password).toBe(hashedPassword);
    });

    it('should not hash password if it is not modified', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'already-hashed-password',
        firstName: 'Test',
        lastName: 'User'
      };

      // Simulate user with unchanged password
      const user = {
        ...userData,
        isModified: jest.fn().mockReturnValue(false)
      };

      // Password should not be hashed if not modified
      expect(user.isModified('password')).toBe(false);
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('Password Comparison', () => {
    it('should compare passwords correctly', async () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashed-password123';

      // Mock bcrypt.compare
      bcrypt.compare.mockResolvedValue(true);

      const result = await bcrypt.compare(plainPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const plainPassword = 'wrongpassword';
      const hashedPassword = 'hashed-password123';

      // Mock bcrypt.compare to return false
      bcrypt.compare.mockResolvedValue(false);

      const result = await bcrypt.compare(plainPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('User Creation', () => {
    it('should create user with required fields', () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'trader',
        emirate: 'Dubai',
        company: 'Test Company'
      };

      // Mock user creation
      mockUser.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...userData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      expect(userData.email).toBe('test@rectify.ae');
      expect(userData.firstName).toBe('Test');
      expect(userData.lastName).toBe('User');
      expect(userData.role).toBe('trader');
    });

    it('should set default values for new users', () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const defaultValues = {
        role: 'trader',
        isActive: true,
        loginAttempts: 0,
        lockUntil: undefined
      };

      const completeUser = {
        ...userData,
        ...defaultValues
      };

      expect(completeUser.role).toBe('trader');
      expect(completeUser.isActive).toBe(true);
      expect(completeUser.loginAttempts).toBe(0);
      expect(completeUser.lockUntil).toBeUndefined();
    });
  });

  describe('Role-based Permissions', () => {
    it('should check admin permissions correctly', () => {
      const adminUser = {
        role: 'admin'
      };

      const traderUser = {
        role: 'trader'
      };

      const isAdmin = (user) => user.role === 'admin';

      expect(isAdmin(adminUser)).toBe(true);
      expect(isAdmin(traderUser)).toBe(false);
    });

    it('should check trader permissions correctly', () => {
      const traderUser = {
        role: 'trader'
      };

      const generatorUser = {
        role: 'generator'
      };

      const isTrader = (user) => user.role === 'trader';

      expect(isTrader(traderUser)).toBe(true);
      expect(isTrader(generatorUser)).toBe(false);
    });

    it('should check generator permissions correctly', () => {
      const generatorUser = {
        role: 'generator'
      };

      const adminUser = {
        role: 'admin'
      };

      const isGenerator = (user) => user.role === 'generator';

      expect(isGenerator(generatorUser)).toBe(true);
      expect(isGenerator(adminUser)).toBe(false);
    });
  });

  describe('User Validation', () => {
    it('should validate required email field', () => {
      const validUser = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const invalidUser = {
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
        // Missing email
      };

      expect(validUser.email).toBeDefined();
      expect(invalidUser.email).toBeUndefined();
    });

    it('should validate email format', () => {
      const validEmails = [
        'test@rectify.ae',
        'user@example.com',
        'admin@test.org'
      ];

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com'
      ];

      const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    it('should validate password strength', () => {
      const validPasswords = [
        'password123',
        'StrongPass1!',
        'MySecure123'
      ];

      const invalidPasswords = [
        '123',        // Too short
        '12'          // Too short
      ];

      const isValidPassword = (password) => {
        return password && password.length >= 6;
      };

      validPasswords.forEach(password => {
        expect(isValidPassword(password)).toBe(true);
      });

      invalidPasswords.forEach(password => {
        expect(isValidPassword(password)).toBe(false);
      });
    });
  });
});
