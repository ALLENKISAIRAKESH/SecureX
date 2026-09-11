/* ── Modal Component ─────────────────────────────────────── */

const Modal = {
  show({ title, body, actions = '', onClose = null }) {
    this.close();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'activeModal';
    overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" id="modalCloseBtn">×</button>
        </div>
        <div class="modal-body">${body}</div>
        ${actions ? `<div class="modal-actions">${actions}</div>` : ''}
      </div>
    `;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close(onClose);
    });

    document.body.appendChild(overlay);

    const closeBtn = document.getElementById('modalCloseBtn');
    if (closeBtn) closeBtn.onclick = () => this.close(onClose);

    return overlay;
  },

  confirm({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmClass = 'btn-primary', onConfirm = null }) {
    const actionsHtml = `
      <button class="btn btn-secondary" id="modalCancelBtn">${cancelText}</button>
      <button class="btn ${confirmClass}" id="modalConfirmBtn">${confirmText}</button>
    `;
    const overlay = this.show({
      title,
      body: `<div>${message}</div>`,
      actions: actionsHtml
    });

    const cancelBtn = document.getElementById('modalCancelBtn');
    const confirmBtn = document.getElementById('modalConfirmBtn');

    if (cancelBtn) {
      cancelBtn.onclick = () => this.close();
    }
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        this.close();
        if (onConfirm) onConfirm();
      };
    }
    return overlay;
  },

  form({ title, fields = [], confirmText = 'Submit', cancelText = 'Cancel', onSubmit = null }) {
    const fieldsHtml = fields.map(f => {
      if (f.type === 'select') {
        const opts = (f.options || []).map(o => `<option value="${o.value}">${o.label}</option>`).join('');
        return `
          <div class="form-group" style="margin-bottom: 14px;">
            <label style="display:block; margin-bottom:6px; font-size:0.85rem; color:var(--text-secondary);">${f.label}</label>
            <select id="${f.id}" class="form-control" style="width:100%; background:var(--bg-card); color:var(--text-primary); border:1px solid var(--border-subtle); padding:9px 12px; border-radius:6px;">
              ${opts}
            </select>
          </div>
        `;
      }
      return `
        <div class="form-group" style="margin-bottom: 14px;">
          <label style="display:block; margin-bottom:6px; font-size:0.85rem; color:var(--text-secondary);">${f.label}</label>
          <input type="${f.type || 'text'}" id="${f.id}" class="form-control" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''} style="width:100%; padding:10px 14px; border-radius:6px; background: rgba(11, 15, 25, 0.75); border: 1px solid var(--border-subtle); color: var(--text-primary);">
        </div>
      `;
    }).join('');

    const actionsHtml = `
      <button class="btn btn-secondary" id="modalCancelBtn">${cancelText}</button>
      <button class="btn btn-primary" id="modalSubmitBtn">${confirmText}</button>
    `;

    const overlay = this.show({
      title,
      body: `<form id="dynamicModalForm" onsubmit="return false;">${fieldsHtml}</form>`,
      actions: actionsHtml
    });

    const cancelBtn = document.getElementById('modalCancelBtn');
    const submitBtn = document.getElementById('modalSubmitBtn');

    if (cancelBtn) cancelBtn.onclick = () => this.close();
    if (submitBtn) {
      submitBtn.onclick = async () => {
        const data = {};
        fields.forEach(f => {
          const el = document.getElementById(f.id);
          if (el) data[f.id] = el.value;
        });
        if (onSubmit) {
          const ok = await onSubmit(data);
          if (ok !== false) Modal.close();
        } else {
          Modal.close();
        }
      };
    }
    return overlay;
  },

  close(callback) {
    const modal = document.getElementById('activeModal');
    if (modal) {
      modal.remove();
      if (callback) callback();
    }
  }
};
