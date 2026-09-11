/* ── API Keys Page ───────────────────────────────────────── */

async function loadApiKeys(container) {
  container.innerHTML = `
    <div class="dashboard-header">
      <div>
        <h1>API Keys</h1>
        <p>Manage your API keys for integrating SecureX into your applications.</p>
      </div>
      <button class="btn btn-primary btn-sm" id="createKeyBtn">+ Create Key</button>
    </div>
    <div id="keysListWrap">
      <div class="glass-card" style="padding:40px;text-align:center;color:var(--text-tertiary)">Loading keys...</div>
    </div>
  `;

  document.getElementById('createKeyBtn').onclick = showCreateKeyModal;

  await refreshKeysList();
}

async function refreshKeysList() {
  const wrap = document.getElementById('keysListWrap');
  if (!wrap) return;

  const res = await API.get('/keys');

  if (!res.success) {
    wrap.innerHTML = '<div class="glass-card" style="padding:40px;text-align:center;color:var(--red)">Failed to load API keys.</div>';
    return;
  }

  if (res.keys.length === 0) {
    wrap.innerHTML = `
      <div class="glass-card" style="padding:60px;text-align:center">
        <div style="font-size:48px;margin-bottom:16px">🗝️</div>
        <h3 style="margin-bottom:8px">No API Keys Yet</h3>
        <p style="color:var(--text-secondary);margin-bottom:20px">Create your first API key to start integrating SecureX into your apps.</p>
        <button class="btn btn-primary" onclick="showCreateKeyModal()">Create Your First Key</button>
      </div>
    `;
    return;
  }

  wrap.innerHTML = `
    <div class="keys-list">
      ${res.keys.map(key => `
        <div class="glass-card key-item">
          <div class="key-info">
            <div class="key-name">${key.name}</div>
            <div class="key-value">${key.prefix}</div>
            <div class="key-meta">
              <span>Created ${timeAgo(key.createdAt)}</span>
              <span>•</span>
              <span>${key.permissions.join(', ')}</span>
              <span>•</span>
              <span>${key.isActive ? '🟢 Active' : '🔴 Revoked'}</span>
              ${key.lastUsedAt ? `<span>• Last used ${timeAgo(key.lastUsedAt)}</span>` : ''}
            </div>
          </div>
          <div class="key-actions">
            ${key.isActive ? `<button class="btn btn-danger btn-sm" onclick="revokeKey('${key.id}', '${key.name}')">Revoke</button>` : '<span class="badge badge-red">Revoked</span>'}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function showCreateKeyModal() {
  Modal.show({
    title: 'Create API Key',
    body: `
      <div class="input-group">
        <label for="newKeyName">Key Name</label>
        <input class="input-field" id="newKeyName" type="text" placeholder="e.g., Production Backend">
      </div>
      <div class="input-group">
        <label>Permissions</label>
        <div style="display:flex;gap:12px;margin-top:8px">
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;cursor:pointer;color:var(--text-secondary)">
            <input type="checkbox" class="key-perm" value="read" checked> Read
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;cursor:pointer;color:var(--text-secondary)">
            <input type="checkbox" class="key-perm" value="write"> Write
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:14px;cursor:pointer;color:var(--text-secondary)">
            <input type="checkbox" class="key-perm" value="admin"> Admin
          </label>
        </div>
      </div>
    `,
    actions: `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" id="confirmCreateKey">Create Key</button>
    `
  });

  document.getElementById('confirmCreateKey').onclick = async () => {
    const name = document.getElementById('newKeyName').value.trim();
    if (!name) {
      Toast.error('Please enter a key name.');
      return;
    }

    const permissions = Array.from(document.querySelectorAll('.key-perm:checked')).map(el => el.value);
    const res = await API.post('/keys', { name, permissions });

    Modal.close();

    if (res.success) {
      // Show the full key (only shown once!)
      Modal.show({
        title: '🔑 API Key Created',
        body: `
          <div style="background:var(--bg-primary);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:16px;margin-bottom:16px">
            <div style="font-family:monospace;font-size:14px;color:var(--cyan);word-break:break-all" id="fullKeyDisplay">${res.key.fullKey}</div>
          </div>
          <p style="color:var(--red);font-size:13px;font-weight:600">⚠️ Copy this key now. It won't be shown again.</p>
        `,
        actions: `
          <button class="btn btn-secondary" onclick="navigator.clipboard.writeText('${res.key.fullKey}');Toast.success('Copied!');Modal.close()">📋 Copy & Close</button>
        `
      });

      Toast.success('API key created.');
      await refreshKeysList();
    } else {
      Toast.error(res.message);
    }
  };
}

async function revokeKey(id, name) {
  Modal.show({
    title: 'Revoke API Key',
    body: `<p style="color:var(--text-secondary)">Are you sure you want to revoke <strong>${name}</strong>? This action cannot be undone. Any application using this key will lose access.</p>`,
    actions: `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-danger" id="confirmRevoke">Revoke Key</button>
    `
  });

  document.getElementById('confirmRevoke').onclick = async () => {
    const res = await API.del(`/keys/${id}`);
    Modal.close();
    if (res.success) {
      Toast.success('API key revoked.');
      await refreshKeysList();
    } else {
      Toast.error(res.message);
    }
  };
}
