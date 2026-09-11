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
