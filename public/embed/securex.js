/**
 * SecureX Drop-in Client SDK (v1.0.0)
 * Allows any web application to embed SecureX authentication in 3 lines of code.
 */

(function (window) {
  'use strict';

  const DEFAULT_API = window.location.origin;

  const SecureX = {
    _config: {
      apiUrl: DEFAULT_API,
      clientId: null,
      theme: 'dark'
    },
    _callbacks: {
      login: [],
      logout: []
    },

    init(options = {}) {
      this._config = Object.assign({}, this._config, options);
      return this;
    },

    on(event, callback) {
      if (this._callbacks[event]) {
        this._callbacks[event].push(callback);
      }
      return this;
    },

    _trigger(event, data) {
      if (this._callbacks[event]) {
        this._callbacks[event].forEach(fn => fn(data));
      }
    },

    getToken() {
      return localStorage.getItem('sx_sdk_token');
    },

    getUser() {
      const u = localStorage.getItem('sx_sdk_user');
      try { return u ? JSON.parse(u) : null; } catch { return null; }
    },

    isLoggedIn() {
      return Boolean(this.getToken());
    },

    logout() {
      localStorage.removeItem('sx_sdk_token');
      localStorage.removeItem('sx_sdk_user');
      this._trigger('logout', null);
    },

    openLogin(options = {}) {
      this._createModal('login', options);
    },

    openRegister(options = {}) {
      this._createModal('register', options);
    },

    _closeModal() {
      const el = document.getElementById('sx-embed-overlay');
      if (el) el.remove();
    },

    _createModal(initialMode, options) {
      this._closeModal();

      const overlay = document.createElement('div');
      overlay.id = 'sx-embed-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(4, 7, 18, 0.78);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        padding: 16px;
        box-sizing: border-box;
      `;

      overlay.innerHTML = `
        <div id="sx-embed-box" style="
          background: #0d121f;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 212, 255, 0.15);
          width: 100%;
          max-width: 420px;
          color: #f8fafc;
          padding: 32px;
          position: relative;
          box-sizing: border-box;
        ">
          <!-- Close Button -->
          <button id="sx-close-btn" style="
            position: absolute;
            top: 18px; right: 18px;
            background: none; border: none;
            color: #64748b; font-size: 20px;
            cursor: pointer; padding: 4px 8px;
            line-height: 1;
          ">✕</button>

          <!-- Header -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 1.25rem; color: #fff; margin-bottom: 6px;">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <defs><linearGradient id="sx-g" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#00d4ff"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>
                <path d="M16 2L4 7v9c0 7.73 5.11 14.26 12 16 6.89-1.74 12-8.27 12-16V7L16 2z" stroke="url(#sx-g)" stroke-width="2.5" fill="rgba(0,212,255,0.1)"/>
                <path d="M12 16l3 3 5-6" stroke="url(#sx-g)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Secure<span style="color: #00d4ff;">X</span></span>
            </div>
            <div id="sx-title-text" style="color: #94a3b8; font-size: 0.9rem;">Sign in to your account</div>
          </div>

          <!-- Alert -->
          <div id="sx-alert" style="display: none; padding: 10px 14px; border-radius: 8px; font-size: 0.82rem; margin-bottom: 16px; background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3);"></div>

          <!-- Form -->
          <form id="sx-form" onsubmit="return false;">
            <div id="sx-name-group" style="display: ${initialMode === 'register' ? 'block' : 'none'}; margin-bottom: 14px;">
              <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 6px;">Full Name</label>
              <input type="text" id="sx-input-name" placeholder="Alex Chen" style="
                width: 100%; box-sizing: border-box;
                background: #151c2e; border: 1px solid rgba(255,255,255,0.12);
                border-radius: 8px; color: #fff; padding: 10px 14px; font-size: 0.9rem; outline: none;
              ">
            </div>

            <div style="margin-bottom: 14px;">
              <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 6px;">Email Address</label>
              <input type="email" id="sx-input-email" placeholder="alex@securex.dev" required style="
                width: 100%; box-sizing: border-box;
                background: #151c2e; border: 1px solid rgba(255,255,255,0.12);
                border-radius: 8px; color: #fff; padding: 10px 14px; font-size: 0.9rem; outline: none;
              ">
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 6px;">Password</label>
              <input type="password" id="sx-input-password" placeholder="••••••••••••" required style="
                width: 100%; box-sizing: border-box;
                background: #151c2e; border: 1px solid rgba(255,255,255,0.12);
                border-radius: 8px; color: #fff; padding: 10px 14px; font-size: 0.9rem; outline: none;
              ">
            </div>

            <!-- Submit Button -->
            <button id="sx-submit-btn" type="submit" style="
              width: 100%; box-sizing: border-box;
              background: linear-gradient(135deg, #00d4ff, #8b5cf6);
              color: #fff; font-weight: 600; font-size: 0.95rem;
              padding: 12px; border: none; border-radius: 8px;
              cursor: pointer; transition: opacity 0.2s;
            ">
              ${initialMode === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <!-- Toggle Mode -->
          <div style="text-align: center; margin-top: 18px; font-size: 0.85rem; color: #94a3b8;">
            <span id="sx-toggle-prompt">${initialMode === 'register' ? 'Already have an account?' : "Don't have an account?"}</span>
            <a href="javascript:void(0)" id="sx-toggle-btn" style="color: #00d4ff; text-decoration: none; font-weight: 600; margin-left: 4px;">
              ${initialMode === 'register' ? 'Sign In' : 'Sign Up'}
            </a>
          </div>

          <!-- Footer badge -->
          <div style="text-align: center; margin-top: 20px; font-size: 0.75rem; color: #475569;">
            Secured by <strong>SecureX Auth-as-a-Service</strong>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      // Event Handlers
      let currentMode = initialMode;
      const form = document.getElementById('sx-form');
      const closeBtn = document.getElementById('sx-close-btn');
      const toggleBtn = document.getElementById('sx-toggle-btn');
      const togglePrompt = document.getElementById('sx-toggle-prompt');
      const titleText = document.getElementById('sx-title-text');
      const nameGroup = document.getElementById('sx-name-group');
      const submitBtn = document.getElementById('sx-submit-btn');
      const alertBox = document.getElementById('sx-alert');

      closeBtn.onclick = () => {
        this._closeModal();
        if (options.onCancel) options.onCancel();
      };

      overlay.onclick = (e) => {
        if (e.target === overlay) {
          this._closeModal();
          if (options.onCancel) options.onCancel();
        }
      };

      toggleBtn.onclick = () => {
        currentMode = currentMode === 'login' ? 'register' : 'login';
        if (currentMode === 'register') {
          nameGroup.style.display = 'block';
          titleText.innerText = 'Create a new account';
          submitBtn.innerText = 'Create Account';
          togglePrompt.innerText = 'Already have an account?';
          toggleBtn.innerText = 'Sign In';
        } else {
          nameGroup.style.display = 'none';
          titleText.innerText = 'Sign in to your account';
          submitBtn.innerText = 'Sign In';
          togglePrompt.innerText = "Don't have an account?";
          toggleBtn.innerText = 'Sign Up';
        }
        alertBox.style.display = 'none';
      };

      form.onsubmit = async () => {
        const email = document.getElementById('sx-input-email').value;
        const password = document.getElementById('sx-input-password').value;
        const name = document.getElementById('sx-input-name')?.value;

        alertBox.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
        submitBtn.innerText = 'Authenticating...';

        try {
          const endpoint = currentMode === 'register' ? '/api/auth/register' : '/api/auth/login';
          const payload = currentMode === 'register' ? { name, email, password } : { email, password };

          const res = await fetch(`${this._config.apiUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.message || 'Authentication failed.');
          }

          // Save credentials in client storage
          if (data.token) {
            localStorage.setItem('sx_sdk_token', data.token);
            localStorage.setItem('sx_sdk_user', JSON.stringify(data.user));
          }

          this._closeModal();
          this._trigger('login', { token: data.token, user: data.user });
          if (options.onSuccess) options.onSuccess({ token: data.token, user: data.user });
        } catch (err) {
          alertBox.innerText = err.message;
          alertBox.style.display = 'block';
          if (options.onError) options.onError(err);
        } finally {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.innerText = currentMode === 'register' ? 'Create Account' : 'Sign In';
        }
      };
    }
  };

  window.SecureX = SecureX;
})(window);
