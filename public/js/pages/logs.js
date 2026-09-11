/* ── Audit & Compliance Logs Explorer ───────────────────────── */

let currentAuditLogs = [];

async function loadAuditLogs(container) {
  container.innerHTML = `
    <div class="dashboard-header">
      <div>
        <h2>Audit & Compliance Logs</h2>
        <p class="text-secondary">Immutable event logs for security auditing, compliance, and incident response.</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-secondary" id="btnExportCsv">
          📥 Export CSV
        </button>
        <button class="btn btn-secondary" id="btnRefreshLogs">
          🔄 Refresh
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="card" style="padding: 16px 20px; margin-bottom: 24px;">
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 240px;">
          <input type="text" id="logSearchInput" class="form-control" placeholder="Search by user email, IP address, or action..." style="padding: 9px 14px; font-size: 0.88rem;">
        </div>
        <div style="min-width: 180px;">
          <select id="logActionFilter" class="form-control" style="padding: 9px 14px; font-size: 0.88rem; background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-subtle);">
            <option value="">All Security Events</option>
            <option value="login">Logins (Successful)</option>
            <option value="login_failed">Failed Logins (Blocked)</option>
            <option value="register">New Signups</option>
            <option value="2fa_enabled">2FA Activations</option>
            <option value="2fa_verified">2FA Verifications</option>
            <option value="api_key_created">API Key Creations</option>
            <option value="password_changed">Password Modifications</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="card" style="padding: 0; overflow: hidden;">
      <div class="table-container">
        <table class="table" id="auditLogsTable">
          <thead>
            <tr>
              <th>TIMESTAMP</th>
              <th>EVENT / ACTION</th>
              <th>USER</th>
              <th>IP ADDRESS</th>
              <th>SECURITY CONTEXT</th>
              <th>DETAILS</th>
            </tr>
          </thead>
          <tbody id="auditLogsBody">
            <tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">Loading security audit logs...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  await fetchAndRenderAuditLogs();

  // Wire up filter and search
  const searchInput = document.getElementById('logSearchInput');
  const actionFilter = document.getElementById('logActionFilter');
  const btnRefresh = document.getElementById('btnRefreshLogs');
  const btnExport = document.getElementById('btnExportCsv');

  if (searchInput) {
    searchInput.oninput = () => renderFilteredLogs();
  }

  if (actionFilter) {
    actionFilter.onchange = () => fetchAndRenderAuditLogs(actionFilter.value);
  }

  if (btnRefresh) {
    btnRefresh.onclick = () => fetchAndRenderAuditLogs(actionFilter?.value || '');
  }

  if (btnExport) {
    btnExport.onclick = () => exportLogsToCsv();
  }
}

async function fetchAndRenderAuditLogs(action = '') {
  const tbody = document.getElementById('auditLogsBody');
  if (!tbody) return;

  try {
    const url = action ? `/dashboard/activity?limit=50&action=${action}` : '/dashboard/activity?limit=50';
    const res = await API.get(url);
    currentAuditLogs = res.logs || [];
    renderFilteredLogs();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-rose); padding: 30px;">Error loading logs: ${err.message}</td></tr>`;
  }
}

function renderFilteredLogs() {
  const tbody = document.getElementById('auditLogsBody');
  if (!tbody) return;

  const query = (document.getElementById('logSearchInput')?.value || '').toLowerCase();
  const filtered = currentAuditLogs.filter(log => {
    if (!query) return true;
    return (
      (log.userName || '').toLowerCase().includes(query) ||
      (log.userEmail || '').toLowerCase().includes(query) ||
      (log.action || '').toLowerCase().includes(query) ||
      (log.ipAddress || '').toLowerCase().includes(query)
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 50px 20px; color: var(--text-muted);">
          No audit logs matching your search criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(log => {
    const actionBadge = getActionBadgeHtml(log.action);
    const dateStr = new Date(log.createdAt).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    return `
      <tr>
        <td style="font-family: monospace; font-size: 0.82rem; color: var(--text-secondary); white-space: nowrap;">
          ${dateStr}
        </td>
        <td>${actionBadge}</td>
        <td>
          <div style="font-weight: 500; font-size: 0.9rem;">${log.userName}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${log.userEmail}</div>
        </td>
        <td style="font-family: monospace; font-size: 0.82rem; color: var(--text-secondary);">
          ${log.ipAddress || '127.0.0.1'}
        </td>
        <td style="font-size: 0.82rem; color: var(--text-secondary);">
          ${log.metadata?.method || 'JWT Auth'} ${log.metadata?.target ? `(${log.metadata.target})` : ''}
        </td>
        <td>
          <button class="btn btn-ghost btn-sm" style="font-size: 0.78rem; padding: 4px 8px;" onclick="viewAuditLogDetail('${log.id}')">
            Inspect
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function getActionBadgeHtml(action) {
  const map = {
    login: '<span class="badge badge-emerald">LOGIN SUCCESS</span>',
    login_failed: '<span class="badge badge-rose">THREAT BLOCKED</span>',
    register: '<span class="badge badge-cyan">ACCOUNT CREATED</span>',
    '2fa_enabled': '<span class="badge badge-purple">2FA ACTIVATED</span>',
    '2fa_verified': '<span class="badge badge-emerald">2FA CHALLENGE PASSED</span>',
    api_key_created: '<span class="badge badge-cyan">API KEY GENERATED</span>',
    api_key_revoked: '<span class="badge badge-rose">KEY REVOKED</span>',
    password_changed: '<span class="badge badge-purple">PASSWORD UPDATED</span>',
    profile_updated: '<span class="badge badge-purple">PROFILE UPDATED</span>'
  };
  return map[action] || `<span class="badge badge-purple">${action.toUpperCase()}</span>`;
}

function viewAuditLogDetail(logId) {
  const log = currentAuditLogs.find(l => l.id === logId);
  if (!log) return;

  Modal.confirm({
    title: `📋 Audit Event: ${log.action}`,
    message: `
      <div style="text-align: left; font-size: 0.88rem; line-height: 1.6;">
        <div style="background: rgba(0,0,0,0.5); padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 12px; font-family: monospace; font-size: 0.82rem;">
          <div><strong style="color: var(--accent-cyan);">Event ID:</strong> ${log.id}</div>
          <div><strong style="color: var(--accent-cyan);">Timestamp:</strong> ${new Date(log.createdAt).toISOString()}</div>
          <div><strong style="color: var(--accent-cyan);">Actor:</strong> ${log.userName} (${log.userEmail})</div>
          <div><strong style="color: var(--accent-cyan);">Origin IP:</strong> ${log.ipAddress || '127.0.0.1'}</div>
        </div>
        <strong style="font-size: 0.85rem; color: var(--text-secondary);">Metadata & Payload Context:</strong>
        <pre style="background: rgba(0,0,0,0.5); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); font-family: monospace; font-size: 0.8rem; color: #a5f3fc; max-height: 160px; overflow-y: auto; margin-top: 6px;">
${JSON.stringify(log.metadata || {}, null, 2)}
        </pre>
      </div>
    `,
    confirmText: 'Done',
    cancelText: 'Close',
    onConfirm: () => {}
  });
}

function exportLogsToCsv() {
  if (!currentAuditLogs || currentAuditLogs.length === 0) {
    Toast.error('No logs available to export.');
    return;
  }

  const headers = ['Timestamp', 'Event', 'User Name', 'User Email', 'IP Address', 'Metadata'];
  const rows = currentAuditLogs.map(l => [
    `"${new Date(l.createdAt).toISOString()}"`,
    `"${l.action}"`,
    `"${l.userName || ''}"`,
    `"${l.userEmail || ''}"`,
    `"${l.ipAddress || ''}"`,
    `"${JSON.stringify(l.metadata || {}).replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `securex-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  Toast.success('Audit logs downloaded as CSV.');
}
