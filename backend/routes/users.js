const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/stats
// @desc    Get user statistics (for admin dashboard)
// @access  Private (Admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.permissions.canManageUsers) {
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
