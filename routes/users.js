const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Helper for scrypt hash
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

/* ── List Users ────────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.status) {
      filter.isActive = req.query.status === 'active';
    }

    const [users, total, totalUsers, total2FA, totalAdmins] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-passwordHash -salt -twoFactorSecret -backupCodes')
        .lean(),
      User.countDocuments(filter),
      User.countDocuments(),
      User.countDocuments({ twoFactorEnabled: true }),
      User.countDocuments({ role: 'admin' })
    ]);

    res.json({
      success: true,
      users: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        twoFactorEnabled: u.twoFactorEnabled,
        lastLoginAt: u.lastLoginAt,
        loginCount: u.loginCount || 0,
        createdAt: u.createdAt
      })),
      stats: {
        total: totalUsers,
        admins: totalAdmins,
        twoFactorAdoption: totalUsers > 0 ? Math.round((total2FA / totalUsers) * 100) : 0
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('List users error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── Create / Invite User ──────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    const initialPassword = password || ('Sx_' + crypto.randomBytes(6).toString('hex') + '!');
    const { salt, hash } = hashPassword(initialPassword);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role === 'admin' ? 'admin' : 'user',
      passwordHash: hash,
      salt
    });

    await user.save();

    await ActivityLog.create({
      userId: req.userId,
      action: 'register',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { createdByAdmin: true, targetUserId: user._id, targetEmail: user.email }
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      initialPassword
    });
  } catch (err) {
    console.error('Create user error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── Update User (Role, Status) ────────────────────────────── */
router.put('/:id', async (req, res) => {
  try {
    const { role, isActive, name } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (role && ['user', 'admin'].includes(role)) {
      user.role = role;
    }
    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }
    if (name && name.trim().length >= 2) {
      user.name = name.trim();
    }

    await user.save();

    await ActivityLog.create({
      userId: req.userId,
      action: 'profile_updated',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { targetUserId: user._id, changes: { role, isActive, name } }
    });

    res.json({
      success: true,
      message: 'User updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (err) {
    console.error('Update user error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── Reset User Password ───────────────────────────────────── */
router.post('/:id/reset-password', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const tempPassword = 'SxTemp_' + crypto.randomBytes(6).toString('hex') + '!';
    const { salt, hash } = hashPassword(tempPassword);

    user.passwordHash = hash;
    user.salt = salt;
    await user.save();

    await ActivityLog.create({
      userId: req.userId,
      action: 'password_changed',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { adminReset: true, targetUserId: user._id }
    });

    res.json({
      success: true,
      message: 'Password reset successfully.',
      temporaryPassword: tempPassword
    });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── Delete User ───────────────────────────────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account from the user directory.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await ActivityLog.create({
      userId: req.userId,
      action: 'profile_updated',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { deletedUserEmail: user.email }
    });

    res.json({ success: true, message: 'User account removed.' });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
