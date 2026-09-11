/* ── Webhooks Management Page ───────────────────────────────── */

async function loadWebhooks(container) {
  container.innerHTML = `
    <div class="dashboard-header">
      <div>
        <h2>Webhooks & Integrations</h2>
        <p class="text-secondary">Receive real-time signed HTTP POST payloads when authentication events occur.</p>
      </div>
      <button class="btn btn-primary" id="btnCreateWebhook">+ Add Endpoint</button>
    </div>

    <!-- Info banner -->
    <div class="card" style="margin-bottom: 24px; padding: 18px 24px; border-left: 4px solid var(--accent-cyan); background: rgba(0, 212, 255, 0.03);">
      <div style="display: flex; gap: 14px; align-items: center;">
        <span style="font-size: 1.5rem;">🔒</span>
        <div>
          <strong style="color: var(--text-primary); font-size: 0.95rem;">HMAC SHA-256 Verified Security</strong>
          <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 4px 0 0;">
            All webhook payloads contain an <code>X-SecureX-Signature</code> header generated using your endpoint's signing secret.
          </p>
        </div>
      </div>
    </div>

    <div class="card" style="padding: 0; overflow: hidden;">
      <div class="table-container">
        <table class="table" id="webhooksTable">
          <thead>
            <tr>
              <th>ENDPOINT URL</th>
              <th>EVENTS SUBSCRIBED</th>
              <th>SIGNING SECRET</th>
              <th>LAST DELIVERY</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody id="webhooksListBody">
            <tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">Loading webhooks...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  await fetchWebhooksList();

  // Create Webhook Button
  const btnCreate = document.getElementById('btnCreateWebhook');
  if (btnCreate) {
    btnCreate.onclick = () => showCreateWebhookModal();
  }
}

async function fetchWebhooksList() {
  const tbody = document.getElementById('webhooksListBody');
  if (!tbody) return;

  try {
    const res = await API.get('/webhooks');
    const webhooks = res.webhooks || [];

    if (webhooks.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 2.5rem; margin-bottom: 12px;">📡</div>
            <h4 style="margin: 0 0 6px; font-size: 1.1rem;">No Webhook Endpoints Configured</h4>
            <p style="color: var(--text-secondary); font-size: 0.88rem; max-width: 440px; margin: 0 auto 16px;">
              Connect your servers to receive automated notifications whenever users sign up, log in, or update security credentials.
            </p>
            <button class="btn btn-primary btn-sm" onclick="showCreateWebhookModal()">+ Add Your First Endpoint</button>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = webhooks.map(wh => {
      const eventBadges = wh.events.map(e => `<span class="badge badge-purple" style="font-size: 0.72rem; margin: 2px;">${e}</span>`).join('');
      const statusBadge = wh.lastStatus === 200
        ? '<span class="badge badge-emerald">200 OK</span>'
        : (wh.lastStatus ? `<span class="badge badge-rose">${wh.lastStatus}</span>` : '<span style="color: var(--text-muted); font-size: 0.8rem;">Never triggered</span>');

      return `
        <tr>
          <td>
            <div style="font-weight: 600; font-size: 0.92rem; color: var(--text-primary);">${wh.url}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">${wh.description || 'Webhook'}</div>
          </td>
          <td>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; max-width: 260px;">
              ${eventBadges}
            </div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <code style="font-size: 0.8rem; background: rgba(0,0,0,0.3); padding: 3px 6px; border-radius: 4px; color: var(--accent-cyan);">${wh.secret.slice(0, 10)}•••••</code>
              <button class="btn btn-ghost btn-sm" style="padding: 2px 6px; font-size: 0.75rem;" onclick="copyWebhookSecret('${wh.secret}')">Copy</button>
            </div>
          </td>
          <td>
            <div>${statusBadge}</div>
            ${wh.lastTriggered ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${new Date(wh.lastTriggered).toLocaleTimeString()}</div>` : ''}
          </td>
          <td>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="sendTestWebhookPing('${wh.id}')" title="Send a test ping event">
                ⚡ Test Ping
              </button>
              <button class="btn btn-ghost btn-sm" style="color: var(--accent-rose);" onclick="deleteWebhookEndpoint('${wh.id}')" title="Delete endpoint">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--accent-rose); padding: 30px;">Error loading webhooks: ${err.message}</td></tr>`;
  }
}

function copyWebhookSecret(secret) {
  navigator.clipboard.writeText(secret);
  Toast.success('Signing secret copied to clipboard!');
}

async function sendTestWebhookPing(webhookId) {
  Toast.info('Dispatching signed test event...');
  try {
    const res = await API.post(`/webhooks/${webhookId}/test`);
    if (res.success) {
      Modal.confirm({
        title: '✅ Webhook Ping Delivered Successfully',
        message: `
          <div style="text-align: left; font-size: 0.88rem; line-height: 1.5;">
            <p style="margin-bottom: 12px; color: var(--text-secondary);">
              SecureX dispatched a simulated test event with valid <strong>HMAC-SHA256 signature</strong> verification:
            </p>
            <div style="background: rgba(0,0,0,0.5); padding: 12px; border-radius: 8px; font-family: monospace; font-size: 0.8rem; margin-bottom: 12px; border: 1px solid var(--border-subtle);">
              <div><strong style="color: var(--accent-cyan);">Status:</strong> 200 OK</div>
              <div><strong style="color: var(--accent-cyan);">Roundtrip:</strong> ${res.delivery.latencyMs} ms</div>
              <div style="word-break: break-all;"><strong style="color: var(--accent-purple);">Signature:</strong> ${res.delivery.signature}</div>
            </div>
            <div style="background: rgba(0,0,0,0.5); padding: 12px; border-radius: 8px; font-family: monospace; font-size: 0.78rem; max-height: 160px; overflow-y: auto; color: #a7f3d0;">
              ${JSON.stringify(res.delivery.payload, null, 2)}
            </div>
          </div>
        `,
        confirmText: 'Done',
        cancelText: 'Close',
        onConfirm: () => fetchWebhooksList()
      });
    }
  } catch (err) {
    Toast.error(err.message || 'Failed to dispatch test ping.');
  }
}

function showCreateWebhookModal() {
  Modal.form({
    title: 'Register Webhook Endpoint',
    fields: [
      { id: 'whUrl', label: 'Endpoint HTTPS URL', type: 'text', placeholder: 'https://api.yourdomain.com/webhooks/securex', required: true },
      { id: 'whDesc', label: 'Description', type: 'text', placeholder: 'Production event sync handler', required: false },
      {
        id: 'whEvents',
        label: 'Subscribe to Events',
        type: 'select',
        options: [
          { value: 'all', label: 'All Authentication Events (Recommended)' },
          { value: 'user.login', label: 'User Logins (user.login)' },
          { value: 'user.registered', label: 'User Signups (user.registered)' },
          { value: 'user.2fa_enabled', label: 'Security Updates (user.2fa_enabled)' }
        ]
      }
    ],
    confirmText: 'Create Webhook',
    onSubmit: async (data) => {
      if (!data.whUrl) {
        Toast.error('Please provide a valid endpoint URL.');
        return false;
      }
      try {
        const events = data.whEvents === 'all'
          ? ['user.registered', 'user.login', 'user.2fa_enabled', 'apikey.created']
          : [data.whEvents];

        const res = await API.post('/webhooks', {
          url: data.whUrl,
          description: data.whDesc,
          events
        });

        if (res.success) {
          Toast.success('Webhook endpoint registered!');
          await fetchWebhooksList();
          return true;
        }
      } catch (err) {
        Toast.error(err.message || 'Failed to register webhook.');
        return false;
      }
    }
  });
}

async function deleteWebhookEndpoint(webhookId) {
  Modal.confirm({
    title: 'Remove Webhook Endpoint?',
    message: 'Your application will no longer receive automated event notifications at this URL. This action cannot be undone.',
    confirmText: 'Delete Endpoint',
    confirmClass: 'btn-danger',
    onConfirm: async () => {
      try {
        await API.delete(`/webhooks/${webhookId}`);
        Toast.success('Webhook endpoint deleted.');
        await fetchWebhooksList();
      } catch (err) {
        Toast.error(err.message || 'Failed to delete webhook.');
      }
    }
  });
}
