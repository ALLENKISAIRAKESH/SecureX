/* ── Dashboard Page ──────────────────────────────────────── */

function renderDashboard(activeTab = 'overview') {
  const user = API.getUser() || {};
  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return `
    <div class="dashboard-layout page-enter">
      <!-- Sidebar -->
      <aside class="sidebar" id="dashSidebar">
        <a class="sidebar-logo" href="#/">${SHIELD_SVG}<span>Secure<span class="text-gradient">X</span></span></a>

        <nav class="sidebar-nav">
          <button class="sidebar-link ${activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
            <span class="nav-icon">📊</span> Overview
          </button>
          <button class="sidebar-link ${activeTab === 'users' ? 'active' : ''}" data-tab="users">
            <span class="nav-icon">👥</span> Users
          </button>
          <button class="sidebar-link ${activeTab === 'keys' ? 'active' : ''}" data-tab="keys">
            <span class="nav-icon">🗝️</span> API Keys
          </button>
          <button class="sidebar-link ${activeTab === 'webhooks' ? 'active' : ''}" data-tab="webhooks">
            <span class="nav-icon">📡</span> Webhooks
          </button>
          <button class="sidebar-link ${activeTab === 'logs' ? 'active' : ''}" data-tab="logs">
            <span class="nav-icon">📋</span> Audit Logs
          </button>
          <button class="sidebar-link ${activeTab === 'security' ? 'active' : ''}" data-tab="security">
            <span class="nav-icon">🔐</span> Security
          </button>
          <button class="sidebar-link ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
            <span class="nav-icon">⚙️</span> Settings
          </button>
          <a class="sidebar-link" href="#/docs" style="text-decoration:none; margin-top: 12px; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
            <span class="nav-icon">📖</span> Developer Docs ↗
          </a>
        </nav>

        <div class="sidebar-user">
          <div class="sidebar-avatar">${initials}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${user.name || 'User'}</div>
            <div class="sidebar-user-email">${user.email || ''}</div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="dashboard-main" id="dashContent">
        <!-- Content loaded dynamically -->
      </main>
    </div>
  `;
}

async function initDashboard(activeTab = 'overview') {
  // Sidebar nav
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
    link.onclick = () => {
      const tab = link.dataset.tab;
      window.location.hash = tab === 'overview' ? '#/dashboard' : `#/dashboard/${tab}`;
    };
  });

  // Mobile sidebar toggle
  const sidebar = document.getElementById('dashSidebar');
  document.addEventListener('click', (e) => {
    if (sidebar && !sidebar.contains(e.target) && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
    }
  });

  // Load tab content
  const content = document.getElementById('dashContent');
  if (!content) return;

  switch (activeTab) {
    case 'overview':
      await loadOverview(content);
      break;
    case 'users':
      await loadUsersDirectory(content);
      break;
    case 'keys':
      await loadApiKeys(content);
      break;
    case 'webhooks':
      await loadWebhooks(content);
      break;
    case 'logs':
      await loadAuditLogs(content);
      break;
    case 'security':
      await loadSecurity(content);
      break;
    case 'settings':
      await loadSettings(content);
      break;
  }
}

async function loadOverview(container) {
  container.innerHTML = `
    <div class="dashboard-header">
      <div>
        <h1>Overview</h1>
        <p>Welcome back! Here's what's happening with your account.</p>
      </div>
      <button class="btn btn-secondary btn-sm" id="mobileMenuBtn" style="display:none">☰ Menu</button>
    </div>
    <div class="stats-grid" id="statsGrid">
      <div class="glass-card stat-card"><div class="stat-label">Loading...</div></div>
      <div class="glass-card stat-card"><div class="stat-label">Loading...</div></div>
      <div class="glass-card stat-card"><div class="stat-label">Loading...</div></div>
      <div class="glass-card stat-card"><div class="stat-label">Loading...</div></div>
    </div>
    <div class="glass-card chart-container">
      <h3>Authentication Requests</h3>
      <div class="chart-canvas-wrap"><canvas id="authChart"></canvas></div>
    </div>
    <div class="glass-card activity-section">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h3>Recent Activity</h3>
        <span class="badge badge-cyan" id="activityCount">—</span>
      </div>
      <div id="activityTableWrap">Loading...</div>
    </div>
  `;

  // Mobile menu
  const menuBtn = document.getElementById('mobileMenuBtn');
  if (menuBtn && window.innerWidth <= 900) {
    menuBtn.style.display = 'block';
    menuBtn.onclick = () => {
      document.getElementById('dashSidebar')?.classList.toggle('open');
    };
  }

  // Fetch data
  const [statsRes, activityRes] = await Promise.all([
    API.get('/dashboard/stats'),
    API.get('/dashboard/activity?limit=10')
  ]);

  if (statsRes.success) {
    const s = statsRes.stats;
    document.getElementById('statsGrid').innerHTML = `
      <div class="glass-card stat-card">
        <div class="stat-header">
          <span class="stat-label">Total Users</span>
          <div class="stat-icon cyan">👥</div>
        </div>
        <div class="stat-value">${formatNum(s.totalUsers)}</div>
        <div class="stat-trend up">↑ ${s.newUsersThisWeek} this week</div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-header">
          <span class="stat-label">Logins This Week</span>
          <div class="stat-icon green">🔓</div>
        </div>
        <div class="stat-value">${formatNum(s.loginsThisWeek)}</div>
        <div class="stat-trend up">Active sessions</div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-header">
          <span class="stat-label">API Activity</span>
          <div class="stat-icon blue">⚡</div>
        </div>
        <div class="stat-value">${formatNum(s.apiCalls)}</div>
        <div class="stat-trend up">${s.activeKeys} active keys</div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-header">
          <span class="stat-label">Threat Blocks</span>
          <div class="stat-icon red">🛡️</div>
        </div>
        <div class="stat-value">${formatNum(s.threatBlocks)}</div>
        <div class="stat-trend ${s.threatBlocks > 0 ? 'down' : 'up'}">${s.threatBlocks > 0 ? 'Failed attempts' : 'All clear'}</div>
      </div>
    `;

    // Draw chart
    if (statsRes.chartData) {
      const labels = statsRes.chartData.map(d => d.label);
      const data = statsRes.chartData.map(d => d.count);
      setTimeout(() => Chart.draw('authChart', labels, data), 100);
    }
  }

  if (activityRes.success) {
    const count = document.getElementById('activityCount');
    if (count) count.textContent = `${activityRes.pagination.total} events`;

    const wrap = document.getElementById('activityTableWrap');
    if (activityRes.logs.length === 0) {
      wrap.innerHTML = '<p style="color:var(--text-tertiary);text-align:center;padding:40px">No activity recorded yet. Start by inviting team members!</p>';
    } else {
      wrap.innerHTML = `
        <table class="activity-table">
          <thead><tr><th>User</th><th>Action</th><th>Time</th><th>IP Address</th></tr></thead>
          <tbody>
            ${activityRes.logs.map(log => {
              const initials = (log.userName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
              return `
                <tr>
                  <td>
                    <div class="activity-user">
                      <div class="activity-avatar">${initials}</div>
                      <div>
                        <div class="activity-name">${log.userName}</div>
                        <div style="font-size:12px;color:var(--text-muted)">${log.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge ${actionBadge(log.action)}">${formatAction(log.action)}</span></td>
                  <td>${timeAgo(log.createdAt)}</td>
                  <td style="font-family:monospace;font-size:13px">${log.ipAddress || '—'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }
  }
}

// Dashboard Helpers

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function formatAction(action) {
  const map = {
    'register': 'Register',
    'login': 'Login',
    'login_failed': 'Failed Login',
    'logout': 'Logout',
    '2fa_enabled': '2FA Enabled',
    '2fa_disabled': '2FA Disabled',
    'api_key_created': 'Key Created',
    'api_key_revoked': 'Key Revoked',
    'password_changed': 'Password Changed',
    'profile_updated': 'Profile Updated'
  };
  return map[action] || action;
}

function actionBadge(action) {
  if (['login', 'register'].includes(action)) return 'badge-green';
  if (['login_failed'].includes(action)) return 'badge-red';
  if (['2fa_enabled', '2fa_disabled'].includes(action)) return 'badge-purple';
  if (['api_key_created', 'api_key_revoked'].includes(action)) return 'badge-cyan';
  return 'badge-amber';
}

function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return new Date(dateStr).toLocaleDateString();
}

async function loadSettings(container) {
  const user = API.getUser() || {};

  container.innerHTML = `
    <div class="dashboard-header">
      <div>
        <h1>Settings</h1>
        <p>Manage your account settings and preferences.</p>
      </div>
    </div>

    <div class="glass-card security-section-card">
      <h3>Profile</h3>
      <p>Update your personal information.</p>
      <form id="profileForm">
        <div class="input-group">
          <label for="settingsName">Full Name</label>
          <input class="input-field" id="settingsName" type="text" value="${user.name || ''}" required>
        </div>
        <div class="input-group">
          <label for="settingsEmail">Email Address</label>
          <input class="input-field" id="settingsEmail" type="email" value="${user.email || ''}" disabled style="opacity:0.5">
          <span style="font-size:12px;color:var(--text-muted);margin-top:6px;display:block">Email cannot be changed at this time.</span>
        </div>
        <button class="btn btn-primary" type="submit">Save Changes</button>
      </form>
    </div>

    <div class="glass-card security-section-card" style="border-color: rgba(239, 68, 68, 0.2)">
      <h3 style="color: var(--red)">Danger Zone</h3>
      <p>Irreversible actions for your account.</p>
      <button class="btn btn-danger" id="logoutAllBtn">Sign Out</button>
    </div>
  `;

  document.getElementById('profileForm').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('settingsName').value;
    const res = await API.put('/auth/me', { name });
    if (res.success) {
      const u = API.getUser();
      u.name = name;
      API.setUser(u);
      Toast.success('Profile updated.');
    } else {
      Toast.error(res.message);
    }
  };

  document.getElementById('logoutAllBtn').onclick = async () => {
    await API.post('/auth/logout');
    API.clearToken();
    Toast.info('Signed out.');
    window.location.hash = '#/';
  };
}
