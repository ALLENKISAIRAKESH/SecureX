const express = require('express');
const crypto = require('crypto');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { authenticate, generateToken } = require('../middleware/auth');

const router = express.Router();

/* ── Helpers ─────────────────────────────────────────────── */

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordStrength(pw) {
  const issues = [];
  if (!pw || pw.length < 8) issues.push('At least 8 characters');
  if (!/[A-Z]/.test(pw)) issues.push('One uppercase letter');
  if (!/[a-z]/.test(pw)) issues.push('One lowercase letter');
  if (!/[0-9]/.test(pw)) issues.push('One number');
  if (!/[^A-Za-z0-9]/.test(pw)) issues.push('One special character');
  return issues;
}

function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    codes.push({
      code: crypto.randomBytes(4).toString('hex').toUpperCase(),
      used: false
    });
  }
  return codes;
}

async function logActivity(userId, action, req, metadata = {}) {
  try {
    await ActivityLog.create({
      userId,
      action,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'] || null,
      metadata
    });
  } catch (_) { /* non-critical */ }
}

/* ── Register ────────────────────────────────────────────── */

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must contain at least 2 characters.' });
    }
    if (!email || !validEmail(email)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    }

    const pwIssues = passwordStrength(password);
    if (pwIssues.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Password requirements not met.',
        requirements: pwIssues
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      salt
    });

    const token = generateToken(user);
    await logActivity(user._id, 'register', req);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── Login ───────────────────────────────────────────────── */

router.post('/login', async (req, res) => {
  try {
    const { email, password, totpCode } = req.body;

    if (!email || !validEmail(email)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must contain at least 8 characters.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      await logActivity(null, 'login_failed', req, { email });
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const suppliedHash = hashPassword(password, user.salt);
    const matches = crypto.timingSafeEqual(
      Buffer.from(suppliedHash, 'hex'),
      Buffer.from(user.passwordHash, 'hex')
    );
    if (!matches) {
      await logActivity(user._id, 'login_failed', req);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // 2FA check
    if (user.twoFactorEnabled) {
      if (!totpCode) {
        return res.json({
          success: true,
          requires2FA: true,
          message: 'Enter your two-factor authentication code.'
        });
      }

      const isValid = authenticator.check(totpCode, user.twoFactorSecret);
      // Check backup codes if TOTP fails
      if (!isValid) {
        const backupCode = user.backupCodes.find(c => c.code === totpCode.toUpperCase() && !c.used);
        if (backupCode) {
          backupCode.used = true;
          await user.save();
        } else {
          return res.status(401).json({ success: false, message: 'Invalid authentication code.' });
        }
      }
    }

    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip || req.connection?.remoteAddress;
    user.loginCount += 1;
    await user.save();

    const token = generateToken(user);
    await logActivity(user._id, 'login', req);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── Profile ─────────────────────────────────────────────── */

router.get('/me', authenticate, async (req, res) => {
  const user = await User.findById(req.userId).select('-passwordHash -salt -twoFactorSecret -backupCodes');
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLoginAt: user.lastLoginAt,
      loginCount: user.loginCount,
      createdAt: user.createdAt
    }
  });
});

router.put('/me', authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must contain at least 2 characters.' });
    }

    await User.findByIdAndUpdate(req.userId, { name: name.trim() });
    await logActivity(req.userId, 'profile_updated', req);

    res.json({ success: true, message: 'Profile updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── Change Password ─────────────────────────────────────── */

router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    const currentHash = hashPassword(currentPassword, user.salt);
    const matches = crypto.timingSafeEqual(
      Buffer.from(currentHash, 'hex'),
      Buffer.from(user.passwordHash, 'hex')
    );
    if (!matches) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const pwIssues = passwordStrength(newPassword);
    if (pwIssues.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'New password requirements not met.',
        requirements: pwIssues
      });
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    user.passwordHash = hashPassword(newPassword, newSalt);
    user.salt = newSalt;
    await user.save();

    await logActivity(user._id, 'password_changed', req);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── 2FA Setup ───────────────────────────────────────────── */

router.post('/2fa/setup', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: '2FA is already enabled.' });
    }

    const secret = authenticator.generateSecret();
    const issuer = process.env.TOTP_ISSUER || 'SecureX';
    const otpauthUrl = authenticator.keyuri(user.email, issuer, secret);

    user.twoFactorSecret = secret;
    await user.save();

    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

    res.json({
      success: true,
      secret,
      qrCode: qrDataUrl,
      message: 'Scan the QR code with your authenticator app, then verify with a code.'
    });
  } catch (err) {
    console.error('2FA setup error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/2fa/verify', authenticate, async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.userId);

    if (!user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: 'Please initiate 2FA setup first.' });
    }

    const isValid = authenticator.check(code, user.twoFactorSecret);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid code. Please try again.' });
    }

    const backupCodes = generateBackupCodes();
    user.twoFactorEnabled = true;
    user.backupCodes = backupCodes;
    await user.save();

    await logActivity(user._id, '2fa_enabled', req);

    res.json({
      success: true,
      message: 'Two-factor authentication enabled.',
      backupCodes: backupCodes.map(c => c.code)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/2fa/disable', authenticate, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.userId);

    const hash = hashPassword(password, user.salt);
    const matches = crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(user.passwordHash, 'hex')
    );
    if (!matches) {
      return res.status(401).json({ success: false, message: 'Password is incorrect.' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.backupCodes = [];
    await user.save();

    await logActivity(user._id, '2fa_disabled', req);

    res.json({ success: true, message: 'Two-factor authentication disabled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── Current User Profile (Me) ────────────────────────────── */

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash -salt -twoFactorSecret -backupCodes');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.put('/me', authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.name = name.trim();
    await user.save();

    await logActivity(user._id, 'profile_updated', req);

    res.json({
      success: true,
      message: 'Profile updated.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── Change Password ───────────────────────────────────────── */

router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password required.' });
    }

    const issues = passwordStrength(newPassword);
    if (issues.length > 0) {
      return res.status(400).json({ success: false, message: `Password requirements not met: ${issues.join(', ')}.` });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const hash = hashPassword(currentPassword, user.salt);
    const matches = crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(user.passwordHash, 'hex')
    );
    if (!matches) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = hashPassword(newPassword, newSalt);

    user.salt = newSalt;
    user.passwordHash = newHash;
    await user.save();

    await logActivity(user._id, 'password_changed', req);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/* ── Logout (stateless — client discards token) ──────────── */

router.post('/logout', authenticate, async (req, res) => {
  await logActivity(req.userId, 'logout', req);
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
