/* ── API Client ──────────────────────────────────────────── */

const API = {
  baseUrl: '/api',

  getToken() {
    return localStorage.getItem('sx_token');
  },

  setToken(token) {
    localStorage.setItem('sx_token', token);
  },

  clearToken() {
    localStorage.removeItem('sx_token');
    localStorage.removeItem('sx_user');
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('sx_user'));
    } catch { return null; }
  },

  setUser(user) {
    localStorage.setItem('sx_user', JSON.stringify(user));
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(url, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      const data = await res.json();

      if (res.status === 401) {
        this.clearToken();
        if (window.location.hash !== '#/login') {
          window.location.hash = '#/login';
        }
        return data;
      }

      return data;
    } catch (err) {
      return { success: false, message: 'Unable to reach the server.' };
    }
  },

  get(path) { return this.request(path); },
  post(path, body) { return this.request(path, { method: 'POST', body }); },
  put(path, body) { return this.request(path, { method: 'PUT', body }); },
  del(path) { return this.request(path, { method: 'DELETE' }); }
};
