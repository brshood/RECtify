const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// Mock request, response, and next
const mockReq = (token = null) => ({
  header: jest.fn((headerName) => {
    if (headerName === 'Authorization' && token) {
      return `Bearer ${token}`;
    }
    return null;
  })
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Auth Middleware', () => {
  let testUser;
  let validToken;

  beforeEach(async () => {
    // Create a test user
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

    // Generate a valid token
    validToken = jwt.sign(
      { userId: testUser._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should allow access with valid token', async () => {
    const req = mockReq(validToken);
    const res = mockRes();

    await auth(req, res, mockNext);

    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe(testUser._id.toString());
    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should deny access without token', async () => {
    const req = mockReq();
    const res = mockRes();

    await auth(req, res, mockNext);

    expect(req.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No token provided, authorization denied'
    });
  });

  it('should deny access with invalid token', async () => {
    const req = mockReq('invalid-token');
    const res = mockRes();

    await auth(req, res, mockNext);

    expect(req.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token is not valid'
    });
  });

  it('should deny access with expired token', async () => {
    // Create an expired token
    const expiredToken = jwt.sign(
      { userId: testUser._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' }
    );

    const req = mockReq(expiredToken);
    const res = mockRes();

    await auth(req, res, mockNext);

    expect(req.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token has expired'
    });
  });

  it('should deny access when user does not exist', async () => {
    // Create token for non-existent user
    const nonExistentUserId = new mongoose.Types.ObjectId();
    const tokenForNonExistentUser = jwt.sign(
      { userId: nonExistentUserId.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const req = mockReq(tokenForNonExistentUser);
    const res = mockRes();

    await auth(req, res, mockNext);

    expect(req.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token is not valid or user is inactive'
    });
  });

  it('should deny access when user is inactive', async () => {
    // Deactivate the test user
    testUser.isActive = false;
    await testUser.save();

    const req = mockReq(validToken);
    const res = mockRes();

    await auth(req, res, mockNext);

    expect(req.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token is not valid or user is inactive'
    });
  });

  it('should handle malformed Authorization header', async () => {
    const req = {
      header: jest.fn((headerName) => {
        if (headerName === 'Authorization') {
          return 'InvalidFormat token123';
        }
        return null;
      })
    };
    const res = mockRes();

    await auth(req, res, mockNext);

    expect(req.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token is not valid'
    });
  });

  it('should handle server errors gracefully', async () => {
    // Mock jwt.verify to throw an unexpected error
    const originalVerify = jwt.verify;
    jwt.verify = jest.fn().mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const req = mockReq(validToken);
    const res = mockRes();

    await auth(req, res, mockNext);

    expect(req.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Server error in authentication'
    });

    // Restore original function
    jwt.verify = originalVerify;
  });

  it('should handle database connection errors', async () => {
    // Mock User.findById to throw an error
    const originalFindById = User.findById;
    User.findById = jest.fn().mockRejectedValue(new Error('Database error'));

    const req = mockReq(validToken);
    const res = mockRes();

    await auth(req, res, mockNext);

    expect(req.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Server error in authentication'
    });

    // Restore original function
    User.findById = originalFindById;
  });
});
