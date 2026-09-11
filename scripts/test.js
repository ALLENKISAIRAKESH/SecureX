/**
 * SecureX Automated Integration Test Suite
 * Run with: npm test
 */

const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://127.0.0.1:3000';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, text: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n🚀 Starting SecureX Integration Tests...');
  console.log(`Target: ${BASE_URL}\n`);

  try {
    // 1. Health Check
    console.log('[Suite 1: Health & System]');
    const health = await request('/api/health');
    assert(health.status === 200, 'Health endpoint responds with 200 OK');
    assert(health.data?.success === true, 'Health payload indicates success: true');

    // 2. Authentication Flow
    console.log('\n[Suite 2: Authentication & Sessions]');
    const testEmail = `test_${Date.now()}@securex.dev`;
    const testPassword = 'TestPassword@2026!';

    // Register
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Automated Tester', email: testEmail, password: testPassword }
    });
    assert(regRes.status === 201, 'Registration returns 201 Created');
    assert(Boolean(regRes.data?.token), 'Registration returns valid JWT token');

    // Duplicate email check
    const dupRes = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Automated Tester', email: testEmail, password: testPassword }
    });
    assert(dupRes.status === 409, 'Duplicate email registration returns 409 Conflict');

    // Login
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: testEmail, password: testPassword }
    });
    assert(loginRes.status === 200, 'Login returns 200 OK');
    const token = loginRes.data?.token;
    assert(Boolean(token), 'Login returns JWT bearer token');

    // Profile (/auth/me)
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(meRes.status === 200, 'GET /auth/me returns 200 OK');
    assert(meRes.data?.user?.email === testEmail, 'User profile matches registered email');

    // 3. API Key Management
    console.log('\n[Suite 3: Scoped API Keys]');
    const keyRes = await request('/api/keys', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'CI Test Key', permissions: ['read', 'write'] }
    });
    assert(keyRes.status === 201, 'API Key creation returns 201 Created');
    assert(keyRes.data?.key?.fullKey?.startsWith('sx_live_'), 'Key starts with sx_live_ prefix');

    // 4. Webhooks Management
    console.log('\n[Suite 4: Webhooks & HMAC Signatures]');
    const whRes = await request('/api/webhooks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { url: 'https://ci.test.local/webhook', description: 'CI Webhook' }
    });
    assert(whRes.status === 201, 'Webhook registration returns 201 Created');
    const webhookId = whRes.data?.webhook?.id;
    assert(Boolean(webhookId), 'Webhook ID returned');

    // Webhook Test Ping
    const pingRes = await request(`/api/webhooks/${webhookId}/test`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(pingRes.status === 200, 'Webhook ping test returns 200 OK');
    assert(pingRes.data?.delivery?.signature?.startsWith('sha256='), 'Dispatches valid HMAC-SHA256 signature header');

    // 5. User Directory & Analytics
    console.log('\n[Suite 5: User Directory & Audit Feeds]');
    const usersRes = await request('/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(usersRes.status === 200, 'GET /api/users returns 200 OK');
    assert(Array.isArray(usersRes.data?.users), 'User directory returns list of identities');

    const statsRes = await request('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(statsRes.status === 200, 'GET /api/dashboard/stats returns 200 OK');
    assert(typeof statsRes.data?.stats?.totalUsers === 'number', 'Stats payload contains totalUsers count');

    console.log('\n====================================================');
    console.log(`Test Results: ${passed} passed, ${failed} failed`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution error:', err.message);
    process.exit(1);
  }
}

runTests();
