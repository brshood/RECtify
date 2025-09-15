const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');

// Mock User model
const mockUser = {
  _id: 'mock-user-id',
  isActive: true,
  isLocked: false
};

jest.mock('../../models/User', () => ({
  findById: jest.fn(() => Promise.resolve(mockUser))
}));

describe('Auth Middleware - Simple Unit Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      header: jest.fn()
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should allow access with valid token', async () => {
    mockReq.header.mockReturnValue('Bearer valid-token');
    
    await auth(mockReq, mockRes, mockNext);

    expect(mockReq.user).toBeDefined();
    expect(mockReq.user.userId).toBe('mock-user-id');
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should deny access without token', async () => {
    mockReq.header.mockReturnValue(null);
    
    await auth(mockReq, mockRes, mockNext);

    expect(mockReq.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'No token provided, authorization denied'
    });
  });

  it('should deny access with invalid token', async () => {
    mockReq.header.mockReturnValue('Bearer invalid-token');
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    
    await auth(mockReq, mockRes, mockNext);

    expect(mockReq.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token is not valid'
    });
  });

  it('should deny access when user does not exist', async () => {
    mockReq.header.mockReturnValue('Bearer valid-token');
    const User = require('../../models/User');
    User.findById.mockResolvedValue(null);
    
    await auth(mockReq, mockRes, mockNext);

    expect(mockReq.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token is not valid or user is inactive'
    });
  });

  it('should deny access when user is inactive', async () => {
    mockReq.header.mockReturnValue('Bearer valid-token');
    const User = require('../../models/User');
    User.findById.mockResolvedValue({ ...mockUser, isActive: false });
    
    await auth(mockReq, mockRes, mockNext);

    expect(mockReq.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token is not valid or user is inactive'
    });
  });

  it('should handle malformed Authorization header', async () => {
    mockReq.header.mockReturnValue('InvalidFormat token123');
    
    await auth(mockReq, mockRes, mockNext);

    expect(mockReq.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token is not valid'
    });
  });

  it('should handle expired token', async () => {
    mockReq.header.mockReturnValue('Bearer expired-token');
    jwt.verify.mockImplementation(() => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      throw error;
    });
    
    await auth(mockReq, mockRes, mockNext);

    expect(mockReq.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token has expired'
    });
  });

  it('should handle server errors gracefully', async () => {
    mockReq.header.mockReturnValue('Bearer valid-token');
    const User = require('../../models/User');
    User.findById.mockRejectedValue(new Error('Database error'));
    
    await auth(mockReq, mockRes, mockNext);

    expect(mockReq.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Server error in authentication'
    });
  });
});
