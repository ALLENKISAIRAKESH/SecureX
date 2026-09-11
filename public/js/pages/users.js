/* ── Users Directory & Identity Management Page ─────────────── */

let cachedUsersList = [];

async function loadUsersDirectory(container) {
  container.innerHTML = `
    <div class="dashboard-header">
      <div>
        <h2>Users & Identity Directory</h2>
        <p class="text-secondary">Manage authenticated identities, assign role permissions, and enforce security policies.</p>
      </div>
      <button class="btn btn-primary" id="btnInviteUser">
        + Invite User
      </button>
    </div>

    <!-- Quick Stats Cards -->
    <div class="stats-grid" style="margin-bottom: 24px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
      <div class="glass-card stat-card">
        <div class="stat-header">
          <span class="stat-label">Total Identities</span>
          <div class="stat-icon cyan">👥</div>
        </div>
        <div class="stat-value" id="statTotalUsers">--</div>
        <div class="stat-trend up">Registered users</div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-header">
          <span class="stat-label">Admin Privileges</span>
          <div class="stat-icon blue">🛡️</div>
        </div>
        <div class="stat-value" id="statAdminUsers">--</div>
        <div class="stat-trend up">Full access roles</div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-header">
          <span class="stat-label">2FA Adoption</span>
          <div class="stat-icon green">🔐</div>
        </div>
        <div class="stat-value" id="stat2FaAdoption">--%</div>
        <div class="stat-trend up">MFA enabled</div>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="glass-card" style="padding: 16px 20px; margin-bottom: 24px;">
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 240px;">
          <input type="text" id="userSearchInput" class="form-control" placeholder="Search by user name or email address..." style="width: 100%; padding: 10px 14px; font-size: 0.88rem; background: rgba(0,0,0,0.4); border: 1px solid var(--border-subtle); color: var(--text-primary); border-radius: 8px;">
        </div>
        <div style="min-width: 140px;">
          <select id="userRoleFilter" class="form-control" style="padding: 10px 14px; font-size: 0.88rem; background: rgba(0,0,0,0.4); color: var(--text-primary); border: 1px solid var(--border-subtle); border-radius: 8px;">
            <option value="">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Standard Users</option>
          </select>
        </div>
        <div style="min-width: 140px;">
          <select id="userStatusFilter" class="form-control" style="padding: 10px 14px; font-size: 0.88rem; background: rgba(0,0,0,0.4); color: var(--text-primary); border: 1px solid var(--border-subtle); border-radius: 8px;">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card" style="padding: 0; overflow: hidden;">
      <div class="table-container">
        <table class="table" id="usersTable">
          <thead>
            <tr>
              <th>USER IDENTITY</th>
              <th>ROLE</th>
              <th>ACCOUNT STATUS</th>
              <th>TWO-FACTOR</th>
              <th>ACTIVITY</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody id="usersListBody">
            <tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">Loading user identities...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  await fetchAndRenderUsers();

  // Search and filter listeners
  const searchInput = document.getElementById('userSearchInput');
  const roleFilter = document.getElementById('userRoleFilter');
  const statusFilter = document.getElementById('userStatusFilter');
  const btnInvite = document.getElementById('btnInviteUser');

  if (searchInput) {
    searchInput.oninput = () => renderUsersTable();
  }
  if (roleFilter) {
    roleFilter.onchange = () => fetchAndRenderUsers();
  }
  if (statusFilter) {
    statusFilter.onchange = () => fetchAndRenderUsers();
  }
  if (btnInvite) {
    btnInvite.onclick = () => showInviteUserModal();
  }
}

async function fetchAndRenderUsers() {
  const tbody = document.getElementById('usersListBody');
  if (!tbody) return;

  const role = document.getElementById('userRoleFilter')?.value || '';
  const status = document.getElementById('userStatusFilter')?.value || '';

  let query = '/users?limit=50';
  if (role) query += `&role=${role}`;
  if (status) query += `&status=${status}`;

  try {
    const res = await API.get(query);
    cachedUsersList = res.users || [];

    // Update stats chips
    const statTotal = document.getElementById('statTotalUsers');
    const statAdmins = document.getElementById('statAdminUsers');
    const stat2fa = document.getElementById('stat2FaAdoption');

    if (statTotal) statTotal.innerText = res.stats?.total ?? cachedUsersList.length;
    if (statAdmins) statAdmins.innerText = res.stats?.admins ?? cachedUsersList.filter(u => u.role === 'admin').length;
    if (stat2fa) stat2fa.innerText = `${res.stats?.twoFactorAdoption ?? 0}%`;

    renderUsersTable();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-rose); padding: 30px;">Error loading users: ${err.message}</td></tr>`;
  }
}

function renderUsersTable() {
  const tbody = document.getElementById('usersListBody');
  if (!tbody) return;

  const query = (document.getElementById('userSearchInput')?.value || '').toLowerCase();
  const filtered = cachedUsersList.filter(u => {
    if (!query) return true;
    return (
      (u.name || '').toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query)
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 50px 20px; color: var(--text-muted);">
          No user identities found matching your criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(u => {
    const initials = (u.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const roleBadge = u.role === 'admin'
      ? '<span class="badge badge-cyan" style="font-size:0.75rem;">ADMIN</span>'
      : '<span class="badge badge-purple" style="font-size:0.75rem;">USER</span>';

    const statusBadge = u.isActive !== false
      ? '<span class="badge badge-emerald" style="font-size:0.75rem;">🟢 Active</span>'
      : '<span class="badge badge-rose" style="font-size:0.75rem;">🔴 Suspended</span>';

    const twoFaBadge = u.twoFactorEnabled
      ? '<span class="badge badge-emerald" style="font-size:0.75rem;">🔐 Enabled</span>'
      : '<span style="color:var(--text-muted); font-size:0.8rem;">— Disabled</span>';

    const lastLogin = u.lastLoginAt
      ? new Date(u.lastLoginAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : 'Never';

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: #fff;">
              ${initials}
            </div>
            <div>
              <div style="font-weight: 600; font-size: 0.92rem; color: var(--text-primary);">${u.name}</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">${u.email}</div>
            </div>
          </div>
        </td>
        <td>
          <button class="btn btn-ghost btn-sm" style="padding: 2px 6px;" onclick="editUserRole('${u.id}', '${u.role}')" title="Click to modify role">
            ${roleBadge} ✏️
          </button>
        </td>
        <td>
          <button class="btn btn-ghost btn-sm" style="padding: 2px 6px;" onclick="toggleUserStatus('${u.id}', ${u.isActive !== false})" title="Click to toggle suspension">
            ${statusBadge}
          </button>
        </td>
        <td>${twoFaBadge}</td>
        <td>
          <div style="font-size: 0.82rem; color: var(--text-secondary);">${u.loginCount || 0} logins</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Last: ${lastLogin}</div>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-sm" style="padding: 5px 9px; font-size: 0.78rem;" onclick="resetUserPassword('${u.id}', '${u.name}')" title="Reset Password">
              🔑 Reset
            </button>
            <button class="btn btn-ghost btn-sm" style="padding: 5px 9px; font-size: 0.78rem; color: var(--accent-rose);" onclick="deleteUser('${u.id}', '${u.email}')" title="Remove User">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function showInviteUserModal() {
  Modal.form({
    title: 'Invite / Add End-User',
    fields: [
      { id: 'newUserName', label: 'Full Name', type: 'text', placeholder: 'Sarah Connor', required: true },
      { id: 'newUserEmail', label: 'Email Address', type: 'email', placeholder: 'sarah@skynet.org', required: true },
      {
        id: 'newUserRole',
        label: 'Account Role',
        type: 'select',
        options: [
          { value: 'user', label: 'Standard User (Default permissions)' },
          { value: 'admin', label: 'Admin (Full access to SecureX API & Dashboard)' }
        ]
      },
      { id: 'newUserPassword', label: 'Initial Password (Leave blank to auto-generate)', type: 'password', placeholder: '••••••••••••', required: false }
    ],
    confirmText: 'Create Identity',
    onSubmit: async (data) => {
      if (!data.newUserName || !data.newUserEmail) {
        Toast.error('Please enter name and email.');
        return false;
      }
      try {
        const res = await API.post('/users', {
          name: data.newUserName,
          email: data.newUserEmail,
          role: data.newUserRole,
          password: data.newUserPassword || undefined
        });

        if (res.success) {
          Modal.confirm({
            title: '✅ Identity Created Successfully',
            message: `
              <div style="text-align: left; font-size: 0.88rem; line-height: 1.6;">
                <p style="margin-bottom: 12px; color: var(--text-secondary);">
                  The user has been registered in the SecureX directory with the following temporary credentials:
                </p>
                <div style="background: rgba(0,0,0,0.5); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 12px; font-family: monospace; font-size: 0.85rem;">
                  <div><strong style="color: var(--accent-cyan);">Email:</strong> ${res.user.email}</div>
                  <div><strong style="color: var(--accent-cyan);">Role:</strong> ${res.user.role.toUpperCase()}</div>
                  <div style="margin-top: 6px;"><strong style="color: var(--accent-emerald);">Initial Password:</strong> <code style="color: #67e8f9; background: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 4px;">${res.initialPassword}</code></div>
                </div>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">
                  Copy these credentials to deliver to the user. They can reset their password upon initial sign-in.
                </p>
              </div>
            `,
            confirmText: 'Done',
            cancelText: 'Copy Password',
            confirmClass: 'btn-primary',
            onConfirm: () => fetchAndRenderUsers()
          });
          return true;
        }
      } catch (err) {
        Toast.error(err.message || 'Failed to create user.');
        return false;
      }
    }
  });
}

function editUserRole(userId, currentRole) {
  const newRole = currentRole === 'admin' ? 'user' : 'admin';
  Modal.confirm({
    title: `Change User Role to ${newRole.toUpperCase()}?`,
    message: `
      Are you sure you want to change this account's permissions to <strong>${newRole.toUpperCase()}</strong>?
      ${newRole === 'admin' ? '<p style="color: var(--accent-rose); font-size: 0.85rem; margin-top: 8px;">⚠️ Admins have full access to API keys, webhooks, and billing settings.</p>' : ''}
    `,
    confirmText: `Set Role to ${newRole.toUpperCase()}`,
    onConfirm: async () => {
      try {
        await API.put(`/users/${userId}`, { role: newRole });
        Toast.success(`Role updated to ${newRole}.`);
        await fetchAndRenderUsers();
      } catch (err) {
        Toast.error(err.message || 'Failed to update user role.');
      }
    }
  });
}

function toggleUserStatus(userId, isCurrentlyActive) {
  const newStatus = !isCurrentlyActive;
  Modal.confirm({
    title: newStatus ? 'Reactivate User Account?' : 'Suspend User Account?',
    message: newStatus
      ? 'The user will regain ability to authenticate and issue API calls.'
      : 'The user will be immediately blocked from signing in or refreshing active JWT sessions.',
    confirmText: newStatus ? 'Reactivate' : 'Suspend Account',
    confirmClass: newStatus ? 'btn-primary' : 'btn-danger',
    onConfirm: async () => {
      try {
        await API.put(`/users/${userId}`, { isActive: newStatus });
        Toast.success(newStatus ? 'Account reactivated.' : 'Account suspended.');
        await fetchAndRenderUsers();
      } catch (err) {
        Toast.error(err.message || 'Failed to update account status.');
      }
    }
  });
}

function resetUserPassword(userId, userName) {
  Modal.confirm({
    title: `Reset Password for ${userName}?`,
    message: 'SecureX will invalidate the existing credentials and generate a temporary password for this user.',
    confirmText: 'Generate Temporary Password',
    onConfirm: async () => {
      try {
        const res = await API.post(`/users/${userId}/reset-password`);
        if (res.success) {
          Modal.confirm({
            title: '🔑 Temporary Password Generated',
            message: `
              <div style="text-align: left; font-size: 0.88rem;">
                <p style="color: var(--text-secondary); margin-bottom: 12px;">
                  Provide this temporary password to the user to regain access:
                </p>
                <div style="background: rgba(0,0,0,0.5); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-family: monospace; font-size: 0.95rem; color: var(--accent-cyan); text-align: center; letter-spacing: 0.05em;">
                  ${res.temporaryPassword}
                </div>
              </div>
            `,
            confirmText: 'Copy & Close',
            cancelText: 'Close',
            onConfirm: () => {
              navigator.clipboard.writeText(res.temporaryPassword);
              Toast.success('Password copied to clipboard!');
            }
          });
        }
      } catch (err) {
        Toast.error(err.message || 'Failed to reset password.');
      }
    }
  });
}

function deleteUser(userId, userEmail) {
  Modal.confirm({
    title: 'Delete User Identity?',
    message: `Are you sure you want to permanently delete <strong>${userEmail}</strong>? All associated sessions will be revoked. This action cannot be reversed.`,
    confirmText: 'Delete Permanently',
    confirmClass: 'btn-danger',
    onConfirm: async () => {
      try {
        await API.delete(`/users/${userId}`);
        Toast.success('User identity removed.');
        await fetchAndRenderUsers();
      } catch (err) {
        Toast.error(err.message || 'Failed to delete user.');
      }
    }
  });
}
