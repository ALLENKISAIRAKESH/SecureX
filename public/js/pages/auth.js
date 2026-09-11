/* ── Auth Pages (Login / Register) ────────────────────────── */

function renderAuth(mode = 'login') {
  const isLogin = mode === 'login';

  return `
    <div class="auth-page page-enter">
      <div class="orb-container">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>

      <!-- Minimal navbar -->
      <nav class="navbar">
        <div class="nav-inner">
          <a class="nav-logo" href="#/">${SHIELD_SVG}<span>Secure<span class="text-gradient">X</span></span></a>
        </div>
      </nav>

      <div class="auth-card glass-card">
        <div class="logo-section">
          ${SHIELD_SVG}
          <h2>${isLogin ? 'Welcome back' : 'Create your account'}</h2>
          <p>${isLogin ? 'Sign in to your SecureX dashboard' : 'Start securing your applications today'}</p>
        </div>

        <div class="auth-tabs">
          <button class="auth-tab ${isLogin ? 'active' : ''}" id="authLoginTab">Sign in</button>
          <button class="auth-tab ${!isLogin ? 'active' : ''}" id="authRegisterTab">Sign up</button>
        </div>

        <form id="authForm" autocomplete="on">
          ${!isLogin ? `
          <div class="input-group">
            <label for="authName">Full Name</label>
            <input class="input-field" id="authName" type="text" placeholder="John Doe" autocomplete="name" required>
          </div>
          ` : ''}

          <div class="input-group">
            <label for="authEmail">Email Address</label>
            <input class="input-field" id="authEmail" type="email" placeholder="you@example.com" autocomplete="email" required>
          </div>

          <div class="input-group">
            <label for="authPassword">Password</label>
            <input class="input-field" id="authPassword" type="password" placeholder="${isLogin ? 'Enter your password' : 'Min 8 chars, uppercase, number, symbol'}" autocomplete="${isLogin ? 'current-password' : 'new-password'}" required>
            ${!isLogin ? `
            <div class="pw-strength" id="pwStrength">
              <div class="pw-meter">
                <div class="pw-meter-bar" id="pwBar1"></div>
                <div class="pw-meter-bar" id="pwBar2"></div>
                <div class="pw-meter-bar" id="pwBar3"></div>
                <div class="pw-meter-bar" id="pwBar4"></div>
              </div>
              <span class="pw-label" id="pwLabel"></span>
            </div>
            ` : ''}
          </div>

          ${!isLogin ? `
          <div class="input-group">
            <label for="authConfirmPassword">Confirm Password</label>
            <input class="input-field" id="authConfirmPassword" type="password" placeholder="Re-enter your password" autocomplete="new-password" required>
          </div>
          ` : ''}

          <button class="btn btn-primary btn-lg" type="submit" id="authSubmitBtn" style="width:100%">
            ${isLogin ? 'Sign in' : 'Create Account'}
          </button>
        </form>

        <!-- Social Auth Divider -->
        <div style="display: flex; align-items: center; margin: 20px 0; color: var(--text-muted); font-size: 0.78rem;">
          <div style="flex: 1; height: 1px; background: var(--border-subtle);"></div>
          <span style="padding: 0 12px; letter-spacing: 0.05em; font-weight: 600;">OR CONTINUE WITH</span>
          <div style="flex: 1; height: 1px; background: var(--border-subtle);"></div>
        </div>

        <!-- Social Buttons -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <button class="btn btn-secondary" id="btnGoogleAuth" style="display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.88rem; padding: 10px;">
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.3l3.7 2.9C6.2 7.3 8.9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/><path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.3C.6 9.3 0 11.6 0 14s.6 4.7 1.6 6.7l3.7-2.9z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.1L1.6 16.1C3.5 19.8 7.4 23 12 23z"/></svg>
            Google
          </button>
          <button class="btn btn-secondary" id="btnGithubAuth" style="display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.88rem; padding: 10px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            GitHub
          </button>
        </div>

        <!-- Magic link option -->
        <button class="btn btn-ghost" id="btnMagicLinkAuth" style="width: 100%; font-size: 0.85rem; color: var(--accent-cyan); margin-bottom: 12px; padding: 6px;">
          ✨ Email me a passwordless Magic Link
        </button>

        <div class="auth-footer">
          ${isLogin
            ? 'Don\'t have an account? <a href="#/register">Sign up</a>'
            : 'Already have an account? <a href="#/login">Sign in</a>'}
        </div>
      </div>
    </div>
  `;
}

function render2FAPrompt() {
  return `
    <div class="auth-page page-enter">
      <div class="orb-container">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>

      <nav class="navbar">
        <div class="nav-inner">
          <a class="nav-logo" href="#/">${SHIELD_SVG}<span>Secure<span class="text-gradient">X</span></span></a>
        </div>
      </nav>

      <div class="auth-card glass-card">
        <div class="logo-section">
          <div style="font-size:48px;margin-bottom:12px">🔐</div>
          <h2>Two-Factor Authentication</h2>
          <p>Enter the 6-digit code from your authenticator app, or use a backup code.</p>
        </div>

        <form id="twoFaForm">
          <div class="input-group">
            <label for="totpCode">Authentication Code</label>
            <input class="input-field" id="totpCode" type="text" placeholder="000000" maxlength="8" autocomplete="one-time-code" required style="text-align:center;font-size:24px;letter-spacing:8px;font-weight:700">
          </div>
          <button class="btn btn-primary btn-lg" type="submit" id="twoFaSubmitBtn" style="width:100%">Verify</button>
        </form>

        <div class="auth-footer" style="margin-top:20px">
          <a href="#/login">← Back to Sign in</a>
        </div>
      </div>
    </div>
  `;
}

function initAuthPage(mode) {
  const loginTab = document.getElementById('authLoginTab');
  const registerTab = document.getElementById('authRegisterTab');
  if (loginTab) loginTab.onclick = () => { window.location.hash = '#/login'; };
  if (registerTab) registerTab.onclick = () => { window.location.hash = '#/register'; };

  // Password strength meter
  const pwInput = document.getElementById('authPassword');
  if (pwInput && mode === 'register') {
    pwInput.addEventListener('input', () => updatePasswordStrength(pwInput.value));
  }

  // Form submit
  const form = document.getElementById('authForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = document.getElementById('authSubmitBtn');
      btn.disabled = true;
      btn.textContent = mode === 'login' ? 'Signing in...' : 'Creating account...';

      try {
        if (mode === 'register') {
          const pw = document.getElementById('authPassword').value;
          const confirmPw = document.getElementById('authConfirmPassword').value;
          if (pw !== confirmPw) {
            Toast.error('Passwords do not match.');
            btn.disabled = false;
            btn.textContent = 'Create Account';
            return;
          }
        }

        const body = {
          email: document.getElementById('authEmail').value,
          password: document.getElementById('authPassword').value
        };
        if (mode === 'register') body.name = document.getElementById('authName').value;

        const data = await API.post(`/auth/${mode}`, body);

        if (data.success && data.requires2FA) {
          // Store credentials temporarily for 2FA step
          window._pendingAuth = body;
          window.location.hash = '#/2fa';
          return;
        }

        if (data.success) {
          API.setToken(data.token);
          API.setUser(data.user);
          Toast.success(data.message);
          window.location.hash = '#/dashboard';
        } else {
          Toast.error(data.message);
        }
      } catch (err) {
        Toast.error('Something went wrong.');
      }

      btn.disabled = false;
      btn.textContent = mode === 'login' ? 'Sign in' : 'Create Account';
    };
  }

  // Social OAuth (Google / GitHub)
  const btnGoogle = document.getElementById('btnGoogleAuth');
  const btnGithub = document.getElementById('btnGithubAuth');
  const btnMagic = document.getElementById('btnMagicLinkAuth');

  if (btnGoogle) {
    btnGoogle.onclick = async () => {
      btnGoogle.disabled = true;
      btnGoogle.innerHTML = 'Connecting...';
      try {
        const res = await API.post('/auth/oauth/google', {
          email: 'google.dev@example.com',
          name: 'Google Developer'
        });
        if (res.success) {
          API.setToken(res.token);
          API.setUser(res.user);
          Toast.success('Signed in with Google!');
          window.location.hash = '#/dashboard';
        }
      } catch (err) {
        Toast.error('Google Sign-in failed.');
      } finally {
        btnGoogle.disabled = false;
      }
    };
  }

  if (btnGithub) {
    btnGithub.onclick = async () => {
      btnGithub.disabled = true;
      btnGithub.innerHTML = 'Connecting...';
      try {
        const res = await API.post('/auth/oauth/github', {
          email: 'octocat@github.com',
          name: 'GitHub Engineer'
        });
        if (res.success) {
          API.setToken(res.token);
          API.setUser(res.user);
          Toast.success('Signed in with GitHub!');
          window.location.hash = '#/dashboard';
        }
      } catch (err) {
        Toast.error('GitHub Sign-in failed.');
      } finally {
        btnGithub.disabled = false;
      }
    };
  }

  if (btnMagic) {
    btnMagic.onclick = async () => {
      const emailInput = document.getElementById('authEmail');
      const email = emailInput ? emailInput.value : '';
      if (!email) {
        Toast.info('Please enter your email above first.');
        if (emailInput) emailInput.focus();
        return;
      }
      try {
        const res = await API.post('/auth/magic-link', { email });
        if (res.success) {
          Modal.confirm({
            title: '✨ Magic Sign-in Link Generated',
            message: `
              <div style="text-align: left; font-size: 0.88rem;">
                <p style="color: var(--text-secondary); margin-bottom: 12px;">
                  In production, SecureX emails this link to <strong>${email}</strong>. In this live environment, click below to verify immediately:
                </p>
                <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 12px; font-family: monospace; font-size: 0.8rem; color: var(--accent-cyan); word-break: break-all;">
                  ${window.location.origin}/#/login?magicToken=${res.token}
                </div>
              </div>
            `,
            confirmText: '🚀 Authenticate Now with Magic Link',
            cancelText: 'Close',
            onConfirm: async () => {
              const verifyRes = await API.post('/auth/magic-link/verify', { token: res.token });
              if (verifyRes.success) {
                API.setToken(verifyRes.token);
                API.setUser(verifyRes.user);
                Toast.success('Signed in via Magic Link!');
                window.location.hash = '#/dashboard';
              }
            }
          });
        }
      } catch (err) {
        Toast.error(err.message || 'Failed to send magic link.');
      }
    };
  }
}

function init2FAPage() {
  const form = document.getElementById('twoFaForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = document.getElementById('twoFaSubmitBtn');
      btn.disabled = true;
      btn.textContent = 'Verifying...';

      const pending = window._pendingAuth;
      if (!pending) {
        Toast.error('Session expired. Please login again.');
        window.location.hash = '#/login';
        return;
      }

      const data = await API.post('/auth/login', {
        ...pending,
        totpCode: document.getElementById('totpCode').value
      });

      if (data.success && data.token) {
        API.setToken(data.token);
        API.setUser(data.user);
        delete window._pendingAuth;
        Toast.success('Login successful.');
        window.location.hash = '#/dashboard';
      } else {
        Toast.error(data.message || 'Invalid code.');
        btn.disabled = false;
        btn.textContent = 'Verify';
      }
    };
  }

  // Auto-focus
  const input = document.getElementById('totpCode');
  if (input) input.focus();
}

function updatePasswordStrength(pw) {
  const bars = [document.getElementById('pwBar1'), document.getElementById('pwBar2'), document.getElementById('pwBar3'), document.getElementById('pwBar4')];
  const label = document.getElementById('pwLabel');
  if (!bars[0] || !label) return;

  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = ['', 'weak', 'fair', 'good', 'strong'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const level = levels[score] || '';

  bars.forEach((bar, i) => {
    bar.className = 'pw-meter-bar';
    if (i < score) bar.classList.add('active', level);
  });

  label.className = `pw-label ${level}`;
  label.textContent = pw.length > 0 ? labels[score] : '';
}
