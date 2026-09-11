const express = require('express');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const ApiKey = require('../models/ApiKey');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

/* ── Dashboard Stats ─────────────────────────────────────── */

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalKeys = await ApiKey.countDocuments({ userId: req.userId, isActive: true });

    // Users registered in last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });

    // Login count this week
    const loginsThisWeek = await ActivityLog.countDocuments({
      action: 'login',
      createdAt: { $gte: weekAgo }
    });

    // Failed logins (threat blocks)
    const failedLogins = await ActivityLog.countDocuments({
      action: 'login_failed',
      createdAt: { $gte: weekAgo }
    });

    // API calls (all activity)
    const totalActivity = await ActivityLog.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    // Daily login data for chart (last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await ActivityLog.countDocuments({
        action: { $in: ['login', 'register'] },
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });

      chartData.push({
        date: dayStart.toISOString().split('T')[0],
        label: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        count
      });
    }

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeKeys: totalKeys,
        apiCalls: totalActivity,
        threatBlocks: failedLogins,
        newUsersThisWeek,
        loginsThisWeek
      },
      chartData
    });
  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── Activity Log ────────────────────────────────────────── */

router.get('/activity', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.action) filter.action = req.query.action;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .lean(),
      ActivityLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      logs: logs.map(log => ({
        id: log._id,
        action: log.action,
        userName: log.userId?.name || 'Unknown',
        userEmail: log.userId?.email || 'N/A',
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
        metadata: log.metadata
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Activity log error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
