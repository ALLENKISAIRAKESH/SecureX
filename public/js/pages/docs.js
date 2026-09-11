/* ── Developer Documentation & Interactive API Playground ──────────────── */

function renderDocs() {
  return `
    <div class="landing-page page-enter" style="min-height: 100vh;">
      <!-- Orbs -->
      <div class="orb-container">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>

      <!-- Navbar -->
      <nav class="navbar" style="border-bottom: 1px solid var(--border-subtle); backdrop-filter: blur(12px);">
        <div class="nav-inner">
          <a class="nav-logo" href="#/">${SHIELD_SVG}<span>Secure<span class="text-gradient">X</span></span></a>
          <div class="nav-links">
            <a class="nav-link" href="#/">← Back to Home</a>
            <a class="nav-link active" href="#/docs">Docs & API</a>
            <a class="nav-link" href="#/dashboard">Dashboard</a>
          </div>
          <div class="nav-actions">
            ${API.isLoggedIn()
              ? '<a class="btn btn-primary btn-sm" href="#/dashboard">Dashboard →</a>'
              : '<a class="btn btn-ghost btn-sm" href="#/login">Sign in</a><a class="btn btn-primary btn-sm" href="#/register">Get API Keys</a>'
            }
          </div>
        </div>
      </nav>

      <!-- Docs Main Container -->
      <div class="container" style="padding: 100px 24px 60px; max-width: 1200px; margin: 0 auto; position: relative; z-index: 2;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 48px;">
          <div class="badge badge-cyan" style="margin-bottom: 12px;">DEVELOPER PLATFORM</div>
          <h1 style="font-size: 2.75rem; font-weight: 800; margin-bottom: 12px;">Documentation & <span class="text-gradient">API Playground</span></h1>
          <p style="color: var(--text-secondary); max-width: 680px; margin: 0 auto; font-size: 1.1rem;">
            Explore the SecureX Auth API, test real endpoints in the interactive console, or integrate our SDK in minutes.
          </p>
        </div>

        <!-- Navigation Tabs -->
        <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 36px; flex-wrap: wrap;">
          <button class="btn btn-secondary docs-tab-btn active" data-target="tab-quickstart">⚡ Quickstart Guide</button>
          <button class="btn btn-secondary docs-tab-btn" data-target="tab-playground">🧪 Interactive API Console</button>
          <button class="btn btn-secondary docs-tab-btn" data-target="tab-sdks">📦 SDKs & Libraries</button>
          <button class="btn btn-secondary docs-tab-btn" data-target="tab-widget">🎨 Drop-in Login Widget</button>
        </div>

        <!-- Tab 1: Quickstart Guide -->
        <div class="docs-tab-content" id="tab-quickstart">
          <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
            
            <div class="card card-glow" style="padding: 28px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <span style="font-size: 1.5rem; background: rgba(0, 212, 255, 0.1); padding: 8px 12px; border-radius: 10px;">1</span>
                <h3 style="margin: 0; font-size: 1.25rem;">Install the SDK</h3>
              </div>
              <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 16px;">
                Install the lightweight SecureX client for Node.js, Next.js, or browser environments.
              </p>
              <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; font-family: monospace; font-size: 0.88rem; display: flex; justify-content: space-between; align-items: center;">
                <code style="color: var(--accent-cyan);">npm install @securex/auth</code>
                <button class="btn btn-ghost btn-sm copy-snippet-btn" data-copy="npm install @securex/auth" style="padding: 4px 8px; font-size: 0.75rem;">Copy</button>
              </div>
            </div>

            <div class="card card-glow" style="padding: 28px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <span style="font-size: 1.5rem; background: rgba(139, 92, 246, 0.1); padding: 8px 12px; border-radius: 10px;">2</span>
                <h3 style="margin: 0; font-size: 1.25rem;">Obtain API Key</h3>
              </div>
              <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 16px;">
                Generate a live key from your SecureX Dashboard to authorize requests.
              </p>
              <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; font-family: monospace; font-size: 0.88rem;">
                <span style="color: var(--text-muted);">Key format:</span> <code style="color: var(--accent-purple);">sx_live_9a8f2...</code>
              </div>
            </div>

            <div class="card card-glow" style="padding: 28px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <span style="font-size: 1.5rem; background: rgba(16, 185, 129, 0.1); padding: 8px 12px; border-radius: 10px;">3</span>
                <h3 style="margin: 0; font-size: 1.25rem;">Protect Any Route</h3>
              </div>
              <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 16px;">
                Enforce authentication, 2FA checks, and role requirements in one line of middleware.
              </p>
              <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; font-family: monospace; font-size: 0.88rem;">
                <code style="color: var(--accent-emerald);">app.use('/api', securex.protect());</code>
              </div>
            </div>

          </div>

          <!-- Code Walkthrough Example -->
          <div class="card" style="margin-top: 32px; padding: 28px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="margin: 0; font-size: 1.2rem;">Full Node.js / Express Example</h3>
              <button class="btn btn-secondary btn-sm copy-snippet-btn" data-copy="// SecureX Express Implementation
const express = require('express');
const { SecureX } = require('@securex/auth');

const app = express();
const auth = new SecureX({ apiKey: process.env.SECUREX_KEY });

// Public authentication endpoint
app.post('/login', async (req, res) => {
  const session = await auth.login(req.body.email, req.body.password);
  res.json(session);
});

// Guarded enterprise route
app.get('/admin', auth.protect({ role: 'admin' }), (req, res) => {
  res.json({ secret: 'Protected enterprise data' });
});

app.listen(8080);">Copy Code</button>
            </div>
            <pre style="background: rgba(11, 15, 25, 0.85); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 20px; overflow-x: auto; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 0.9rem; line-height: 1.6; color: #e2e8f0; margin: 0;">
<span style="color:#8b5cf6;">const</span> express = <span style="color:#00d4ff;">require</span>(<span style="color:#10b981;">'express'</span>);
<span style="color:#8b5cf6;">const</span> { SecureX } = <span style="color:#00d4ff;">require</span>(<span style="color:#10b981;">'@securex/auth'</span>);

<span style="color:#8b5cf6;">const</span> app = express();
<span style="color:#8b5cf6;">const</span> auth = <span style="color:#8b5cf6;">new</span> <span style="color:#00d4ff;">SecureX</span>({ apiKey: process.env.<span style="color:#f59e0b;">SECUREX_KEY</span> });

<span style="color:#64748b;">// Public authentication endpoint</span>
app.<span style="color:#00d4ff;">post</span>(<span style="color:#10b981;">'/login'</span>, <span style="color:#8b5cf6;">async</span> (req, res) =&gt; {
  <span style="color:#8b5cf6;">const</span> session = <span style="color:#8b5cf6;">await</span> auth.<span style="color:#00d4ff;">login</span>(req.body.email, req.body.password);
  res.json(session);
});

<span style="color:#64748b;">// Guarded enterprise route</span>
app.<span style="color:#00d4ff;">get</span>(<span style="color:#10b981;">'/admin'</span>, auth.<span style="color:#00d4ff;">protect</span>({ role: <span style="color:#10b981;">'admin'</span> }), (req, res) =&gt; {
  res.json({ secret: <span style="color:#10b981;">'Protected enterprise data'</span> });
});</pre>
          </div>
        </div>

        <!-- Tab 2: Interactive API Console -->
        <div class="docs-tab-content" id="tab-playground" style="display: none;">
          <div class="card" style="padding: 28px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
              <div>
                <h3 style="margin: 0 0 6px; font-size: 1.3rem;">Live API Testing Console</h3>
                <p style="color: var(--text-secondary); margin: 0; font-size: 0.95rem;">Send real HTTP requests directly to the SecureX backend instance.</p>
              </div>
              <div style="display: flex; gap: 12px; align-items: center;">
                <span class="badge badge-emerald">Live Server: http://localhost:3000</span>
              </div>
            </div>

            <!-- Endpoint Selector -->
            <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 280px;">
                <label style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px;">Select Endpoint</label>
                <select id="apiEndpointSelect" class="form-control" style="width: 100%; background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-subtle); padding: 10px 14px; border-radius: 8px;">
                  <option value="health">GET /api/health — System Health & Status</option>
                  <option value="stats">GET /api/dashboard/stats — Overview Statistics (Auth required)</option>
                  <option value="activity">GET /api/dashboard/activity — Audit Logs (Auth required)</option>
                  <option value="keys">GET /api/keys — Active API Keys (Auth required)</option>
                  <option value="webhooks">GET /api/webhooks — Webhook Endpoints (Auth required)</option>
                  <option value="login">POST /api/auth/login — User Authentication</option>
                  <option value="register">POST /api/auth/register — User Registration</option>
                </select>
              </div>
              <div style="display: flex; align-items: flex-end;">
                <button class="btn btn-primary" id="btnExecuteApi" style="min-width: 140px; height: 44px;">
                  <span>▶ Send Request</span>
                </button>
              </div>
            </div>

            <!-- Request Parameters / Body -->
            <div id="requestBodyContainer" style="margin-bottom: 24px; display: none;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-size: 0.85rem; color: var(--text-secondary);">Request Payload (JSON)</label>
                <span style="font-size: 0.75rem; color: var(--accent-cyan);">application/json</span>
              </div>
              <textarea id="apiRequestBody" rows="5" class="form-control" style="width: 100%; font-family: monospace; font-size: 0.9rem; background: rgba(0,0,0,0.5); color: #00d4ff; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px;"></textarea>
            </div>

            <!-- Response Viewer -->
            <div style="border-top: 1px solid var(--border-subtle); padding-top: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <h4 style="margin: 0; font-size: 1rem;">Server Response</h4>
                  <span id="responseStatusBadge" class="badge badge-purple" style="display: none;">Ready</span>
                  <span id="responseLatencyBadge" style="font-size: 0.8rem; color: var(--text-muted); display: none;">0 ms</span>
                </div>
                <button class="btn btn-ghost btn-sm" id="btnCopyResponse" style="font-size: 0.8rem;">Copy Response</button>
              </div>
              
              <pre id="apiResponseOutput" style="background: rgba(0,0,0,0.6); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 16px; max-height: 380px; overflow-y: auto; font-family: monospace; font-size: 0.88rem; color: #a5f3fc; line-height: 1.5; margin: 0;">Click "Send Request" to test the selected endpoint live.</pre>
            </div>

          </div>
        </div>

        <!-- Tab 3: SDKs & Libraries -->
        <div class="docs-tab-content" id="tab-sdks" style="display: none;">
          <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
            
            <div class="card" style="padding: 24px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <span style="font-size: 1.6rem;">🟨</span>
                <div>
                  <h3 style="margin: 0; font-size: 1.15rem;">JavaScript / TypeScript</h3>
                  <span style="font-size: 0.8rem; color: var(--accent-cyan);">Node.js, React, Next.js, Express</span>
                </div>
              </div>
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px;">
                Full-featured TypeScript client with automatic JWT refresh, cookie management, and React hooks.
              </p>
              <div style="background: rgba(0,0,0,0.4); padding: 10px 14px; border-radius: 6px; font-family: monospace; font-size: 0.85rem; color: var(--text-primary); margin-bottom: 14px;">
                npm install @securex/sdk
              </div>
              <pre style="background: rgba(0,0,0,0.6); border-radius: 6px; padding: 12px; font-size: 0.8rem; font-family: monospace; color: #e2e8f0; margin: 0; overflow-x: auto;">
import { SecureXClient } from '@securex/sdk';
const sx = new SecureXClient({ key: 'sx_live_...' });
const session = await sx.verify(req);</pre>
            </div>

            <div class="card" style="padding: 24px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <span style="font-size: 1.6rem;">🐍</span>
                <div>
                  <h3 style="margin: 0; font-size: 1.15rem;">Python</h3>
                  <span style="font-size: 0.8rem; color: var(--accent-purple);">Django, FastAPI, Flask</span>
                </div>
              </div>
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px;">
                Idiomatic Python library featuring Pydantic types, async HTTPX client, and FastAPI dependency injection.
              </p>
              <div style="background: rgba(0,0,0,0.4); padding: 10px 14px; border-radius: 6px; font-family: monospace; font-size: 0.85rem; color: var(--text-primary); margin-bottom: 14px;">
                pip install securex-auth
              </div>
              <pre style="background: rgba(0,0,0,0.6); border-radius: 6px; padding: 12px; font-size: 0.8rem; font-family: monospace; color: #e2e8f0; margin: 0; overflow-x: auto;">
from securex import SecureX
sx = SecureX(api_key="sx_live_...")
user = sx.authenticate_token(bearer_token)</pre>
            </div>

            <div class="card" style="padding: 24px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <span style="font-size: 1.6rem;">🌐</span>
                <div>
                  <h3 style="margin: 0; font-size: 1.15rem;">Raw HTTP / cURL</h3>
                  <span style="font-size: 0.8rem; color: var(--accent-emerald);">Universal REST API</span>
                </div>
              </div>
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px;">
                Standard RFC-compliant JSON endpoints suitable for any programming language or backend service.
              </p>
              <div style="background: rgba(0,0,0,0.4); padding: 10px 14px; border-radius: 6px; font-family: monospace; font-size: 0.85rem; color: var(--text-primary); margin-bottom: 14px;">
                curl -H "Authorization: Bearer sx_live_..."
              </div>
              <pre style="background: rgba(0,0,0,0.6); border-radius: 6px; padding: 12px; font-size: 0.8rem; font-family: monospace; color: #e2e8f0; margin: 0; overflow-x: auto;">
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"</pre>
            </div>

          </div>
        </div>

        <!-- Tab 4: Drop-in Login Widget -->
        <div class="docs-tab-content" id="tab-widget" style="display: none;">
          <div class="card card-glow" style="padding: 32px;">
            <div style="max-width: 800px; margin: 0 auto; text-align: center;">
              <div class="badge badge-purple" style="margin-bottom: 12px;">EMBEDDABLE AUTHENTICATION</div>
              <h2 style="font-size: 2rem; margin-bottom: 12px;">Add Auth in 3 Lines of HTML</h2>
              <p style="color: var(--text-secondary); margin-bottom: 28px;">
                Embed the SecureX Drop-in Modal into any static website or web app without writing backend code.
              </p>

              <!-- Widget Demo Box -->
              <div style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 24px; margin-bottom: 28px; text-align: left;">
                <pre style="font-family: monospace; font-size: 0.9rem; color: #93c5fd; margin: 0; line-height: 1.6;">
&lt;!-- Include SecureX Script --&gt;
&lt;script src="http://localhost:3000/embed/securex.js"&gt;&lt;/script&gt;

&lt;!-- Trigger Button --&gt;
&lt;button onclick="SecureX.openLogin({ clientId: 'sx_live_app_01' })"&gt;
  Sign in with SecureX
&lt;/button&gt;</pre>
              </div>

              <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                <button class="btn btn-primary btn-lg" id="btnPreviewWidget">
                  ✨ Preview Drop-in Modal Now
                </button>
                <a class="btn btn-secondary btn-lg" href="/demo.html" target="_blank" style="text-decoration:none;">
                  🚀 Open Live Client Demo ↗
                </a>
                <a class="btn btn-secondary btn-lg" href="#/register">
                  Create Production App →
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

function initDocs() {
  // Tab switching logic
  const tabBtns = document.querySelectorAll('.docs-tab-btn');
  const tabContents = document.querySelectorAll('.docs-tab-content');

  tabBtns.forEach(btn => {
    btn.onclick = () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => (c.style.display = 'none'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.target);
      if (target) target.style.display = 'block';
    };
  });

  // Copy buttons
  document.querySelectorAll('.copy-snippet-btn').forEach(btn => {
    btn.onclick = () => {
      navigator.clipboard.writeText(btn.dataset.copy);
      Toast.success('Snippet copied to clipboard!');
    };
  });

  // API Playground Logic
  const select = document.getElementById('apiEndpointSelect');
  const bodyContainer = document.getElementById('requestBodyContainer');
  const bodyInput = document.getElementById('apiRequestBody');
  const btnExecute = document.getElementById('btnExecuteApi');
  const output = document.getElementById('apiResponseOutput');
  const statusBadge = document.getElementById('responseStatusBadge');
  const latencyBadge = document.getElementById('responseLatencyBadge');
  const btnCopyResponse = document.getElementById('btnCopyResponse');

  const payloads = {
    register: JSON.stringify({ name: 'Jane Doe', email: 'jane.test@example.com', password: 'SecureX@StrongPassword123!' }, null, 2),
    login: JSON.stringify({ email: 'alex@securex.dev', password: 'SecureX@2026!' }, null, 2)
  };

  select.onchange = () => {
    const val = select.value;
    if (val === 'register' || val === 'login') {
      bodyContainer.style.display = 'block';
      bodyInput.value = payloads[val] || '{}';
    } else {
      bodyContainer.style.display = 'none';
    }
  };

  btnExecute.onclick = async () => {
    const ep = select.value;
    output.innerText = 'Sending request to SecureX API...';
    btnExecute.disabled = true;
    const startTime = performance.now();

    try {
      let res;
      if (ep === 'health') {
        res = await fetch('/api/health');
      } else if (ep === 'stats') {
        res = await fetch('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${API.token || ''}` }
        });
      } else if (ep === 'activity') {
        res = await fetch('/api/dashboard/activity?limit=5', {
          headers: { Authorization: `Bearer ${API.token || ''}` }
        });
      } else if (ep === 'keys') {
        res = await fetch('/api/keys', {
          headers: { Authorization: `Bearer ${API.token || ''}` }
        });
      } else if (ep === 'webhooks') {
        res = await fetch('/api/webhooks', {
          headers: { Authorization: `Bearer ${API.token || ''}` }
        });
      } else if (ep === 'login') {
        res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyInput.value
        });
      } else if (ep === 'register') {
        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyInput.value
        });
      }

      const latency = Math.round(performance.now() - startTime);
      const data = await res.json();

      statusBadge.style.display = 'inline-block';
      statusBadge.className = `badge ${res.ok ? 'badge-emerald' : 'badge-rose'}`;
      statusBadge.innerText = `${res.status} ${res.statusText || (res.ok ? 'OK' : 'Error')}`;

      latencyBadge.style.display = 'inline-block';
      latencyBadge.innerText = `${latency} ms`;

      output.innerText = JSON.stringify(data, null, 2);
    } catch (err) {
      statusBadge.style.display = 'inline-block';
      statusBadge.className = 'badge badge-rose';
      statusBadge.innerText = 'Network Error';
      output.innerText = `Error: ${err.message}`;
    } finally {
      btnExecute.disabled = false;
    }
  };

  btnCopyResponse.onclick = () => {
    navigator.clipboard.writeText(output.innerText);
    Toast.success('Response JSON copied!');
  };

  // Drop-in Modal Preview Demo
  const btnPreviewWidget = document.getElementById('btnPreviewWidget');
  if (btnPreviewWidget) {
    btnPreviewWidget.onclick = () => {
      Modal.confirm({
        title: '🔐 SecureX Embedded Auth Widget',
        message: `
          <div style="text-align: left; padding: 12px 0;">
            <p style="color: var(--text-secondary); margin-bottom: 16px; font-size: 0.9rem;">
              This is a live preview of the client-side modal rendered inside third-party apps when they invoke <code>SecureX.openLogin()</code>:
            </p>
            <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 10px; padding: 20px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
                ${SHIELD_SVG}
                <strong style="font-size: 1.1rem;">Acme Corp <span style="font-weight: 400; color: var(--text-muted); font-size: 0.85rem;">via SecureX</span></strong>
              </div>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <input type="email" class="form-control" placeholder="user@acme.com" value="alex@securex.dev" readonly>
                <input type="password" class="form-control" value="••••••••••••" readonly>
                <button class="btn btn-primary" style="width: 100%; margin-top: 4px;" onclick="Toast.success('Signed in via SecureX Single Sign-On!')">Authenticate Session</button>
              </div>
            </div>
          </div>
        `,
        confirmText: 'Awesome, Got It!',
        cancelText: 'Close',
        onConfirm: () => {}
      });
    };
  }
}
