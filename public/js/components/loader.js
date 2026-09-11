/* ── Loading Overlay ─────────────────────────────────────── */

const Loader = {
  show(text = 'Loading...') {
    this.hide();
    const el = document.createElement('div');
    el.className = 'loader-overlay';
    el.id = 'globalLoader';
    el.innerHTML = `<div class="loader-spinner"></div><div class="loader-text">${text}</div>`;
    document.body.appendChild(el);
  },

  hide() {
    const el = document.getElementById('globalLoader');
    if (el) el.remove();
  }
};
