/**
 * SecureX Database Seed Script
 * Run with: npm run seed
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const ActivityLog = require('../models/ActivityLog');
const Webhook = require('../models/Webhook');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

async function seed() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/securex';
  console.log('Connecting to MongoDB at:', mongoUri);
  await mongoose.connect(mongoUri);
  console.log('✓ Connected');

  console.log('Clearing existing demo data...');
  await Promise.all([
    User.deleteMany({ email: { $in: ['alex@securex.dev', 'sarah@cyberdyne.io', 'david@startup.co'] } }),
    ApiKey.deleteMany({ name: { $in: ['Production Cloud Key', 'Staging Webhook Client'] } }),
    Webhook.deleteMany({ description: { $in: ['Enterprise User Sync Webhook'] } })
  ]);

  console.log('Creating demo users...');
  const alexPw = hashPassword('SecureX@2026!');
  const sarahPw = hashPassword('SecureX@2026!');
  const davidPw = hashPassword('SecureX@2026!');

  const [alex, sarah, david] = await User.create([
    {
      name: 'Alex Chen',
      email: 'alex@securex.dev',
      role: 'admin',
      passwordHash: alexPw.hash,
      salt: alexPw.salt,
      loginCount: 14,
      lastLoginAt: new Date(),
      lastLoginIp: '127.0.0.1',
      twoFactorEnabled: false
    },
    {
      name: 'Sarah Connor',
      email: 'sarah@cyberdyne.io',
      role: 'admin',
      passwordHash: sarahPw.hash,
      salt: sarahPw.salt,
      loginCount: 5,
      lastLoginAt: new Date(Date.now() - 3600 * 1000 * 4),
      lastLoginIp: '192.168.1.45',
      twoFactorEnabled: true
    },
    {
      name: 'David Miller',
      email: 'david@startup.co',
      role: 'user',
      passwordHash: davidPw.hash,
      salt: davidPw.salt,
      loginCount: 2,
      lastLoginAt: new Date(Date.now() - 3600 * 1000 * 24),
      lastLoginIp: '10.0.0.12',
      twoFactorEnabled: false
    }
  ]);

  console.log('Creating demo API keys...');
  const rawKey1 = 'sx_live_' + crypto.randomBytes(24).toString('hex');
  const hashKey1 = crypto.createHash('sha256').update(rawKey1).digest('hex');

  await ApiKey.create([
    {
      userId: alex._id,
      name: 'Production Cloud Key',
      prefix: rawKey1.slice(0, 16),
      keyHash: hashKey1,
      permissions: ['read', 'write', 'admin'],
      isActive: true,
      lastUsedAt: new Date()
    }
  ]);

  console.log('Creating demo webhook endpoint...');
  await Webhook.create({
    userId: alex._id,
    url: 'https://api.acme.corp/webhooks/securex',
    description: 'Enterprise User Sync Webhook',
    secret: 'whsec_' + crypto.randomBytes(24).toString('hex'),
    events: ['user.registered', 'user.login', 'user.2fa_enabled', 'apikey.created'],
    isActive: true,
    lastTriggered: new Date(),
    lastStatus: 200
  });

  console.log('Generating 7 days of audit and analytics history...');
  const logs = [];
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const dayDate = new Date(Date.now() - daysAgo * 24 * 3600 * 1000);
    const countForDay = Math.floor(Math.random() * 8) + 4;

    for (let i = 0; i < countForDay; i++) {
      const actions = ['login', 'login', 'login', 'login_failed', 'api_key_created', 'register'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const user = Math.random() > 0.3 ? alex : (Math.random() > 0.5 ? sarah : david);

      logs.push({
        userId: action === 'login_failed' ? null : user._id,
        action,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
        metadata: { source: 'seed', day: daysAgo },
        createdAt: dayDate,
        updatedAt: dayDate
      });
    }
  }

  await ActivityLog.insertMany(logs);

  console.log('====================================================');
  console.log('✓ SecureX Demo Data Successfully Seeded!');
  console.log('  Admin User: alex@securex.dev / SecureX@2026!');
  console.log('  User 2:     sarah@cyberdyne.io / SecureX@2026!');
  console.log('  User 3:     david@startup.co / SecureX@2026!');
  console.log(`  Seeded ${logs.length} activity log entries for charts.`);
  console.log('====================================================');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
