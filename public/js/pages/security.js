/* ── Security Page ───────────────────────────────────────── */

async function loadSecurity(container) {
  const meRes = await API.get('/auth/me');
  const user = meRes.success ? meRes.user : {};

  container.innerHTML = `
    <div class="dashboard-header">
      <div>
        <h1>Security</h1>
        <p>Manage your authentication and security settings.</p>
      </div>
    </div>

    <!-- 2FA Section -->
    <div class="glass-card security-section-card">
      <h3>Two-Factor Authentication</h3>
      <p>Add an extra layer of security to your account with TOTP-based two-factor authentication.</p>
      <div class="twofa-status">
        ${user.twoFactorEnabled
          ? '<span class="badge badge-green">✓ Enabled</span>'
          : '<span class="badge badge-amber">Not Enabled</span>'
        }
      </div>
      <div id="twofaActions">
        ${user.twoFactorEnabled
          ? '<button class="btn btn-danger btn-sm" id="disable2faBtn">Disable 2FA</button>'
          : '<button class="btn btn-primary btn-sm" id="enable2faBtn">Enable 2FA</button>'
        }
      </div>
      <div id="twofaSetupArea"></div>
    </div>

    <!-- Change Password -->
    <div class="glass-card security-section-card">
      <h3>Change Password</h3>
      <p>Update your password to keep your account secure.</p>
      <form id="changePasswordForm" style="max-width:400px">
        <div class="input-group">
          <label for="currentPassword">Current Password</label>
          <input class="input-field" id="currentPassword" type="password" placeholder="Enter current password" required>
        </div>
        <div class="input-group">
          <label for="newPassword">New Password</label>
          <input class="input-field" id="newPassword" type="password" placeholder="Min 8 chars, uppercase, number, symbol" required>
        </div>
        <div class="input-group">
          <label for="confirmNewPassword">Confirm New Password</label>
          <input class="input-field" id="confirmNewPassword" type="password" placeholder="Re-enter new password" required>
        </div>
        <button class="btn btn-primary" type="submit">Update Password</button>
      </form>
    </div>

    <!-- Account Info -->
    <div class="glass-card security-section-card">
      <h3>Account Information</h3>
      <p>Details about your SecureX account.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">
        <div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">Member Since</div>
          <div style="font-size:14px;font-weight:600">${user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</div>
        </div>
        <div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">Last Login</div>
          <div style="font-size:14px;font-weight:600">${user.lastLoginAt ? timeAgo(user.lastLoginAt) : '—'}</div>
        </div>
        <div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">Total Logins</div>
          <div style="font-size:14px;font-weight:600">${user.loginCount || 0}</div>
        </div>
        <div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">Account Role</div>
          <div style="font-size:14px;font-weight:600;text-transform:capitalize">${user.role || 'user'}</div>
        </div>
      </div>
    </div>

    <!-- Active Devices & Sessions -->
    <div class="glass-card security-section-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
        <div>
          <h3>Active Devices & Sessions</h3>
          <p style="margin: 0;">Manage logged-in devices and revoke compromised browser sessions.</p>
        </div>
        <button class="btn btn-secondary btn-sm" id="btnRevokeAllSessions">Revoke Other Sessions</button>
      </div>
      <div id="activeSessionsList" style="display: flex; flex-direction: column; gap: 10px; margin-top: 16px;">
        <!-- Filled dynamically -->
      </div>
    </div>
  `;

  loadActiveSessions();

  // 2FA Enable
  const enableBtn = document.getElementById('enable2faBtn');
  if (enableBtn) {
    enableBtn.onclick = async () => {
      enableBtn.disabled = true;
      enableBtn.textContent = 'Setting up...';

      const res = await API.post('/auth/2fa/setup');
      if (!res.success) {
        Toast.error(res.message);
        enableBtn.disabled = false;
        enableBtn.textContent = 'Enable 2FA';
        return;
      }

      const setupArea = document.getElementById('twofaSetupArea');
      setupArea.innerHTML = `
        <div style="margin-top:20px;padding:20px;background:var(--bg-primary);border:1px solid var(--border-default);border-radius:var(--radius-lg)">
          <div class="qr-container">
            <img src="${res.qrCode}" alt="2FA QR Code">
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">Scan this QR code with Google Authenticator, Authy, or any TOTP app.</p>
            <div style="font-family:monospace;font-size:12px;color:var(--text-muted);padding:8px;background:var(--bg-card);border-radius:var(--radius-sm);word-break:break-all">${res.secret}</div>
          </div>
          <form id="verify2faForm" style="margin-top:16px;max-width:300px;margin-left:auto;margin-right:auto">
            <div class="input-group">
              <label for="verify2faCode">Enter 6-digit code to verify</label>
              <input class="input-field" id="verify2faCode" type="text" placeholder="000000" maxlength="6" style="text-align:center;font-size:20px;letter-spacing:6px;font-weight:700" required>
            </div>
            <button class="btn btn-primary" type="submit" style="width:100%">Verify & Enable</button>
          </form>
        </div>
      `;

      enableBtn.style.display = 'none';

      document.getElementById('verify2faForm').onsubmit = async (e) => {
        e.preventDefault();
        const code = document.getElementById('verify2faCode').value;
        const verifyRes = await API.post('/auth/2fa/verify', { code });

        if (verifyRes.success) {
          Toast.success('Two-factor authentication enabled!');

          // Show backup codes
          Modal.show({
            title: '🔐 Save Your Backup Codes',
            body: `
              <p style="color:var(--text-secondary);font-size:14px;margin-bottom:16px">Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.</p>
              <div class="backup-codes-grid">
                ${verifyRes.backupCodes.map(code => `<div class="backup-code">${code}</div>`).join('')}
              </div>
              <p style="color:var(--red);font-size:13px;font-weight:600;margin-top:12px">⚠️ Each code can only be used once.</p>
            `,
            actions: `<button class="btn btn-primary" onclick="Modal.close();loadSecurity(document.getElementById('dashContent'))">I've Saved Them</button>`
          });
        } else {
          Toast.error(verifyRes.message);
        }
      };
    };
  }

  // 2FA Disable
  const disableBtn = document.getElementById('disable2faBtn');
  if (disableBtn) {
    disableBtn.onclick = () => {
      Modal.show({
        title: 'Disable Two-Factor Authentication',
        body: `
          <p style="color:var(--text-secondary);font-size:14px;margin-bottom:16px">This will remove 2FA from your account and reduce your security. Enter your password to confirm.</p>
          <div class="input-group">
            <label for="disable2faPassword">Password</label>
            <input class="input-field" id="disable2faPassword" type="password" placeholder="Enter your password" required>
          </div>
        `,
        actions: `
          <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
          <button class="btn btn-danger" id="confirmDisable2fa">Disable 2FA</button>
        `
      });

      document.getElementById('confirmDisable2fa').onclick = async () => {
        const password = document.getElementById('disable2faPassword').value;
        const res = await API.post('/auth/2fa/disable', { password });
        Modal.close();

        if (res.success) {
          Toast.success('Two-factor authentication disabled.');
          await loadSecurity(container);
        } else {
          Toast.error(res.message);
        }
      };
    };
  }

  // Change Password
  document.getElementById('changePasswordForm').onsubmit = async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
      Toast.error('New passwords do not match.');
      return;
    }

    const res = await API.post('/auth/change-password', { currentPassword, newPassword });
    if (res.success) {
      Toast.success('Password changed successfully.');
      document.getElementById('changePasswordForm').reset();
    } else {
      Toast.error(res.message || 'Failed to change password.');
    }
  };
}

async function loadActiveSessions() {
  const container = document.getElementById('activeSessionsList');
  if (!container) return;

  try {
    const res = await API.get('/auth/sessions');
    const sessions = res.sessions || [];

    container.innerHTML = sessions.map(s => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <span style="font-size: 1.4rem;">${s.device.includes('iPhone') || s.device.includes('Mobile') ? '📱' : '💻'}</span>
          <div>
            <div style="font-weight: 600; font-size: 0.92rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
              ${s.device} • ${s.browser}
              ${s.isCurrent ? '<span class="badge badge-emerald" style="font-size: 0.7rem;">THIS DEVICE</span>' : ''}
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
              IP: ${s.ipAddress} • <span style="color: var(--text-muted);">${s.lastActive}</span>
            </div>
          </div>
        </div>
        <div>
          ${s.isCurrent ? '<span style="font-size: 0.8rem; color: var(--accent-emerald);">Active</span>' : '<button class="btn btn-ghost btn-sm" style="color: var(--accent-rose); font-size: 0.8rem;" onclick="Toast.info(\'Session revoked.\'); this.closest(\'div\').parentElement.remove();">Revoke</button>'}
        </div>
      </div>
    `).join('');

    const revokeAllBtn = document.getElementById('btnRevokeAllSessions');
    if (revokeAllBtn) {
      revokeAllBtn.onclick = async () => {
        const revokeRes = await API.post('/auth/sessions/revoke-all');
        if (revokeRes.success) {
          Toast.success('All other device sessions have been revoked.');
          await loadActiveSessions();
        }
      };
    }
  } catch {
    container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem;">Could not load active sessions.</div>';
  }
}
