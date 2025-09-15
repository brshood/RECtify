const jwt = require('jsonwebtoken');

// Mock User model before importing auth middleware
jest.mock('../../models/User', () => ({
  findById: jest.fn(),
}));

const auth = require('../../middleware/auth');
const User = require('../../models/User');

describe('Auth Middleware - Unit Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      header: jest.fn(),
      user: undefined,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
    
    // Set test JWT secret
    process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-32-chars';
  });

  it('should allow access with valid token', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    mockReq.header.mockReturnValue(`Bearer ${token}`);
    User.findById.mockResolvedValue({ _id: userId, isActive: true });

    await auth(mockReq, mockRes, mockNext);

    expect(mockReq.header).toHaveBeenCalledWith('Authorization');
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(mockReq.user).toEqual({ userId });
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it('should deny access without token', async () => {
    mockReq.header.mockReturnValue(undefined);

    await auth(mockReq, mockRes, mockNext);

    expect(mockReq.header).toHaveBeenCalledWith('Authorization');
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'No token provided, authorization denied',
    });
    expect(mockReq.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should deny access with invalid token format', async () => {
    mockReq.header.mockReturnValue('InvalidToken'); // Missing "Bearer " prefix

    await auth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token is not valid',
    });
    expect(mockReq.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should deny access with malformed token', async () => {
    mockReq.header.mockReturnValue('Bearer invalidtoken');

    // Mock jwt.verify to throw an error
    const originalVerify = jwt.verify;
    jwt.verify = jest.fn(() => {
      throw new Error('Invalid token');
    });

    await auth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token is not valid',
    });
    expect(mockReq.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();

    // Restore original function
    jwt.verify = originalVerify;
  });

  it('should deny access when user does not exist', async () => {
    const userId = '507f1f77bcf86cd799439012';
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    mockReq.header.mockReturnValue(`Bearer ${token}`);
    User.findById.mockResolvedValue(null); // User not found

    await auth(mockReq, mockRes, mockNext);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token is not valid or user is inactive',
    });
    expect(mockReq.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should deny access when user is inactive', async () => {
    const userId = '507f1f77bcf86cd799439013';
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    mockReq.header.mockReturnValue(`Bearer ${token}`);
    User.findById.mockResolvedValue({ _id: userId, isActive: false }); // User inactive

    await auth(mockReq, mockRes, mockNext);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token is not valid or user is inactive',
    });
    expect(mockReq.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle server errors gracefully', async () => {
    mockReq.header.mockReturnValue('Bearer validtoken');
    
    // Mock User.findById to throw an error
    User.findById.mockRejectedValue(new Error('Database error'));

    await auth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Server error in authentication',
    });
    expect(mockReq.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
  });
});
