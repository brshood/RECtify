const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper to fetch current user and ensure admin privileges
async function ensureAdmin(req) {
  const currentUser = await User.findById(req.user.userId);
  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }
  return currentUser;
}

// @route   GET /api/users
// @desc    List users for admin management
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const adminUser = await ensureAdmin(req);
    if (!adminUser) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select('firstName lastName email role tier company cashBalance cashCurrency verificationStatus lastLogin createdAt')
      .lean();

    const payload = users.map((user) => ({
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      tier: user.tier,
      company: user.company,
      cashBalance: user.cashBalance ?? 0,
      cashCurrency: user.cashCurrency || 'AED',
      verificationStatus: user.verificationStatus,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      isSelf: user._id.toString() === adminUser._id.toString()
    }));

    res.json({
      success: true,
      data: payload
    });
  } catch (error) {
    console.error('Admin user list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics (for admin dashboard)
// @access  Private (Admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    const adminUser = await ensureAdmin(req);
    if (!adminUser) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          verifiedUsers: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'verified'] }, 1, 0] } },
          pendingUsers: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'pending'] }, 1, 0] } }
        }
      }
    ]);

    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const tierStats = await User.aggregate([
      { $group: { _id: '$tier', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        pendingUsers: 0
      },
      roleDistribution: roleStats,
      tierDistribution: tierStats
    });

  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
