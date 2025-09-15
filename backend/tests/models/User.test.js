const mongoose = require('mongoose');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid user', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.company).toBe(userData.company);
      expect(savedUser.emirate).toBe(userData.emirate);
      expect(savedUser.role).toBe('trader');
      expect(savedUser.tier).toBe('basic');
      expect(savedUser.verificationStatus).toBe('pending');
      expect(savedUser.isActive).toBe(true);
    });

    it('should require email', async () => {
      const userData = {
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require valid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require unique email', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai'
      };

      await new User(userData).save();
      
      const duplicateUser = new User(userData);
      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should require password with minimum length', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: '123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require firstName', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require lastName', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'John',
        company: 'Test Company',
        emirate: 'Dubai'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require company', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        emirate: 'Dubai'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require valid emirate', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Invalid Emirate'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should accept valid emirates', async () => {
      const validEmirates = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'];
      
      for (const emirate of validEmirates) {
        const userData = {
          email: `test-${emirate.replace(/\s+/g, '')}@rectify.ae`,
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          company: 'Test Company',
          emirate: emirate
        };

        const user = new User(userData);
        await expect(user.save()).resolves.toBeDefined();
      }
    });
  });

  describe('Role-based Permissions', () => {
    it('should set trader permissions correctly', async () => {
      const userData = {
        email: 'trader@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai',
        role: 'trader',
        tier: 'basic'
      };

      const user = new User(userData);
      await user.save();

      expect(user.permissions.canTrade).toBe(true);
      expect(user.permissions.canRegisterFacilities).toBe(false);
      expect(user.permissions.canViewAnalytics).toBe(false);
      expect(user.permissions.canExportReports).toBe(false);
      expect(user.permissions.canManageUsers).toBe(false);
    });

    it('should set premium trader permissions correctly', async () => {
      const userData = {
        email: 'premium-trader@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai',
        role: 'trader',
        tier: 'premium'
      };

      const user = new User(userData);
      await user.save();

      expect(user.permissions.canTrade).toBe(true);
      expect(user.permissions.canRegisterFacilities).toBe(false);
      expect(user.permissions.canViewAnalytics).toBe(true);
      expect(user.permissions.canExportReports).toBe(true);
      expect(user.permissions.canManageUsers).toBe(false);
    });

    it('should set facility-owner permissions correctly', async () => {
      const userData = {
        email: 'facility-owner@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai',
        role: 'facility-owner'
      };

      const user = new User(userData);
      await user.save();

      expect(user.permissions.canTrade).toBe(true);
      expect(user.permissions.canRegisterFacilities).toBe(true);
      expect(user.permissions.canViewAnalytics).toBe(true);
      expect(user.permissions.canExportReports).toBe(true);
      expect(user.permissions.canManageUsers).toBe(false);
    });

    it('should set compliance-officer permissions correctly', async () => {
      const userData = {
        email: 'compliance@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai',
        role: 'compliance-officer'
      };

      const user = new User(userData);
      await user.save();

      expect(user.permissions.canTrade).toBe(false);
      expect(user.permissions.canRegisterFacilities).toBe(false);
      expect(user.permissions.canViewAnalytics).toBe(true);
      expect(user.permissions.canExportReports).toBe(true);
      expect(user.permissions.canManageUsers).toBe(true);
    });

    it('should set admin permissions correctly', async () => {
      const userData = {
        email: 'admin@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai',
        role: 'admin'
      };

      const user = new User(userData);
      await user.save();

      expect(user.permissions.canTrade).toBe(true);
      expect(user.permissions.canRegisterFacilities).toBe(true);
      expect(user.permissions.canViewAnalytics).toBe(true);
      expect(user.permissions.canExportReports).toBe(true);
      expect(user.permissions.canManageUsers).toBe(true);
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai'
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe('password123');
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it('should not hash password if not modified', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai'
      };

      const user = new User(userData);
      await user.save();
      const originalPassword = user.password;

      user.firstName = 'Jane';
      await user.save();

      expect(user.password).toBe(originalPassword);
    });
  });

  describe('Password Comparison', () => {
    it('should compare password correctly', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai'
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Account Lockout', () => {
    it('should increment login attempts', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai'
      };

      const user = new User(userData);
      await user.save();

      await user.incLoginAttempts();
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.loginAttempts).toBe(1);
    });

    it('should lock account after max attempts', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai'
      };

      const user = new User(userData);
      await user.save();

      // Increment attempts to max
      for (let i = 0; i < 5; i++) {
        await user.incLoginAttempts();
      }

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.lockUntil).toBeDefined();
      expect(updatedUser.isLocked).toBe(true);
    });

    it('should throw error when trying to login with locked account', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai'
      };

      const user = new User(userData);
      await user.save();

      // Lock the account
      user.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours from now
      await user.save();

      await expect(user.comparePassword('password123')).rejects.toThrow('Account is temporarily locked');
    });

    it('should reset login attempts on successful login', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai'
      };

      const user = new User(userData);
      await user.save();

      // Increment attempts
      await user.incLoginAttempts();
      await user.incLoginAttempts();

      // Successful login should reset attempts
      await user.comparePassword('password123');
      
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.loginAttempts).toBe(0);
    });
  });

  describe('JSON Transformation', () => {
    it('should transform to JSON without sensitive fields', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai'
      };

      const user = new User(userData);
      await user.save();

      const jsonUser = user.toJSON();

      expect(jsonUser.id).toBeDefined();
      expect(jsonUser.password).toBeUndefined();
      expect(jsonUser.__v).toBeUndefined();
      expect(jsonUser.email).toBe('test@rectify.ae');
      expect(jsonUser.firstName).toBe('John');
      expect(jsonUser.lastName).toBe('Doe');
    });
  });

  describe('Default Values', () => {
    it('should set default values correctly', async () => {
      const userData = {
        email: 'test@rectify.ae',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        emirate: 'Dubai'
      };

      const user = new User(userData);
      await user.save();

      expect(user.role).toBe('trader');
      expect(user.tier).toBe('basic');
      expect(user.verificationStatus).toBe('pending');
      expect(user.isActive).toBe(true);
      expect(user.loginAttempts).toBe(0);
      expect(user.emailVerified).toBe(false);
      expect(user.twoFactorEnabled).toBe(false);
      expect(user.portfolioValue).toBe(0);
      expect(user.totalRecs).toBe(0);
      expect(user.cashBalance).toBe(0);
      expect(user.reservedBalance).toBe(0);
      expect(user.cashCurrency).toBe('AED');
      expect(user.preferences.currency).toBe('AED');
      expect(user.preferences.language).toBe('en');
      expect(user.preferences.notifications).toBe(true);
      expect(user.preferences.darkMode).toBe(false);
      expect(user.preferences.dashboardLayout).toBe('default');
    });
  });
});
