/* ==========================================================================
   ui.js — reusable presentational components + overlay controllers.
   Everything returns an HTML string (render) or a controller (modal/toast).
   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils;
  var icon = EVA.icon;
  var ui = {};

  /* ============================ PRIMITIVES ============================ */

  var STATUS_LABEL = {
    draft: 'Draft', scheduled: 'Scheduled', published: 'Published', live: 'Live',
    inactive: 'Inactive', active: 'Active', 'on-leave': 'On leave'
  };
  var STATUS_CLASS = {
    draft: 'draft', scheduled: 'scheduled', published: 'published', live: 'live',
    inactive: 'inactive', active: 'active', 'on-leave': 'onleave'
  };

  ui.badge = function (status, opts) {
    opts = opts || {};
    var label = opts.label || STATUS_LABEL[status] || U.titleCase(status || '');
    var cls = STATUS_CLASS[status] || 'neutral';
    var dot = (status === 'live' || opts.dot) ? '<i class="badge__dot"></i>' : '';
    return '<span class="badge badge--' + cls + '">' + dot + U.esc(label) + '</span>';
  };

  ui.priorityBadge = function (p) {
    return '<span class="badge badge--p-' + U.esc(p) + '">' + U.esc(U.titleCase(p)) + '</span>';
  };

  ui.avatar = function (personOrName, opts) {
    opts = opts || {};
    var p = typeof personOrName === 'string' ? { name: personOrName } : (personOrName || {});
    var size = opts.size ? ' avatar--' + opts.size : '';
    var extra = opts.cls ? ' ' + opts.cls : '';
    var inner = p.photo
      ? '<img src="' + U.attr(p.photo) + '" alt="" onerror="this.remove()">'
      : U.esc(U.initials(p.name));
    return '<span class="avatar' + size + extra + '">' + inner + '</span>';
  };

  ui.person = function (emp, opts) {
    opts = opts || {};
    var sub = opts.sub !== undefined ? opts.sub : (emp.role || '');
    return '<div class="person">' +
      ui.avatar(emp, { size: opts.size || 'sm' }) +
      '<div class="person__meta">' +
        '<div class="person__name">' + U.esc(emp.name) + '</div>' +
        (sub ? '<div class="person__sub">' + U.esc(sub) + '</div>' : '') +
      '</div>' +
    '</div>';
  };

  ui.statCard = function (o) {
    return '<' + (o.href ? 'a href="' + U.attr(o.href) + '"' : 'button type="button"') +
      ' class="stat"' + (o.action ? ' data-action="' + U.attr(o.action) + '"' : '') + '>' +
      '<div class="stat__top">' +
        '<span class="stat__icon' + (o.tone ? ' stat__icon--' + o.tone : '') + '">' + icon(o.icon) + '</span>' +
        (o.badge || '') +
      '</div>' +
      '<div class="stat__label">' + U.esc(o.label) + '</div>' +
      '<div class="stat__value">' + U.esc(String(o.value)) +
        (o.unit ? '<small>' + U.esc(o.unit) + '</small>' : '') + '</div>' +
      (o.foot ? '<div class="stat__foot">' + o.foot + '</div>' : '') +
      '</' + (o.href ? 'a' : 'button') + '>';
  };

  ui.empty = function (o) {
    return '<div class="empty">' +
      '<div class="empty__icon">' + icon(o.icon || 'inbox', { size: 25 }) + '</div>' +
      '<div class="empty__title">' + U.esc(o.title) + '</div>' +
      (o.text ? '<p class="empty__text">' + U.esc(o.text) + '</p>' : '') +
      (o.actions ? '<div class="empty__actions">' + o.actions + '</div>' : '') +
    '</div>';
  };

  ui.spinner = function () { return '<span class="spinner"></span>'; };

  ui.sectionLabel = function (text) {
    return '<div class="rail-label">' + U.esc(text) + '</div>';
  };

  /* ============================ FORM FIELDS ============================ */

  ui.field = function (o) {
    var id = o.id || o.name;
    var err = o.error ? ' has-error' : '';
    var control;

    if (o.type === 'textarea') {
      control = '<textarea class="textarea' + err + '" id="' + U.attr(id) + '" name="' + U.attr(o.name) + '"' +
        (o.placeholder ? ' placeholder="' + U.attr(o.placeholder) + '"' : '') +
        (o.rows ? ' rows="' + o.rows + '"' : '') +
        (o.maxlength ? ' maxlength="' + o.maxlength + '"' : '') +
        '>' + U.esc(o.value || '') + '</textarea>';
    } else if (o.type === 'select') {
      control = '<div class="input-group">' +
        '<select class="input' + err + '" id="' + U.attr(id) + '" name="' + U.attr(o.name) + '">' +
        (o.placeholder ? '<option value="">' + U.esc(o.placeholder) + '</option>' : '') +
        (o.options || []).map(function (opt) {
          var val = typeof opt === 'string' ? opt : opt.value;
          var lab = typeof opt === 'string' ? opt : opt.label;
          return '<option value="' + U.attr(val) + '"' +
            (String(val) === String(o.value) ? ' selected' : '') + '>' + U.esc(lab) + '</option>';
        }).join('') +
        '</select>' + icon('chevron-down', { size: 15 }) + '</div>';
    } else {
      control = '<input class="input' + err + '" type="' + (o.type || 'text') + '" id="' + U.attr(id) + '"' +
        ' name="' + U.attr(o.name) + '" value="' + U.attr(o.value === undefined || o.value === null ? '' : o.value) + '"' +
        (o.placeholder ? ' placeholder="' + U.attr(o.placeholder) + '"' : '') +
        (o.min !== undefined ? ' min="' + o.min + '"' : '') +
        (o.max !== undefined ? ' max="' + o.max + '"' : '') +
        (o.maxlength ? ' maxlength="' + o.maxlength + '"' : '') +
        (o.readonly ? ' readonly' : '') +
        (o.autofocus ? ' autofocus' : '') + '>';
    }

    return '<label class="field" for="' + U.attr(id) + '">' +
      '<span class="field__label">' + U.esc(o.label) +
        (o.required ? '<span class="req">*</span>' : '') + '</span>' +
      control +
      (o.error ? '<span class="field__error" data-error-for="' + U.attr(o.name) + '">' +
        icon('alert-triangle', { size: 13 }) + U.esc(o.error) + '</span>'
        : '<span class="field__error" data-error-for="' + U.attr(o.name) + '" hidden></span>') +
      (o.hint ? '<span class="field__hint">' + U.esc(o.hint) + '</span>' : '') +
    '</label>';
  };

  ui.switchField = function (o) {
    return '<label class="switch">' +
      '<input type="checkbox" name="' + U.attr(o.name) + '"' + (o.checked ? ' checked' : '') + '>' +
      '<span class="switch__track"></span>' +
      (o.label ? '<span class="switch__label">' + U.esc(o.label) + '</span>' : '') +
    '</label>';
  };

  ui.imageUpload = function (o) {
    var id = o.id || o.name;
    var preview = o.value ? '<img src="' + U.attr(o.value) + '" style="max-height: 120px; border-radius: 6px; margin-top: 8px; display: block; border: 1px solid rgba(8,21,14,0.1);">' : '';
    return '<label class="field" for="' + U.attr(id) + '_file">' +
      '<span class="field__label">' + U.esc(o.label || 'Image') + '</span>' +
      '<div style="display: flex; gap: 10px; align-items: flex-start; flex-direction: column;">' +
        '<input type="file" id="' + U.attr(id) + '_file" accept="image/*" class="input image-upload-file" data-target="' + U.attr(id) + '" data-preview-target="' + U.attr(id) + '_preview" data-upload-state="idle">' +
        '<input type="hidden" id="' + U.attr(id) + '" name="' + U.attr(o.name) + '" value="' + U.attr(o.value || '') + '">' +
        '<div id="' + U.attr(id) + '_preview">' + preview + '</div>' +
      '</div>' +
      (o.hint ? '<span class="field__hint">' + U.esc(o.hint) + '</span>' : '') +
    '</label>';
  };

  /** Read a form into a plain object (checkboxes -> booleans). */
  ui.readForm = function (form) {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name) return;
      if (el.type === 'checkbox') data[el.name] = el.checked;
      else if (el.type === 'radio') { if (el.checked) data[el.name] = el.value; }
      else data[el.name] = el.value;
    });
    return data;
  };

  /** Paint validation errors returned by a service validator. */
  ui.showErrors = function (form, errors) {
    Array.prototype.forEach.call(form.querySelectorAll('[data-error-for]'), function (el) {
      el.hidden = true;
      el.textContent = '';
    });
    Array.prototype.forEach.call(form.querySelectorAll('.input, .textarea'), function (el) {
      el.classList.remove('has-error');
    });
    var first = null;
    Object.keys(errors || {}).forEach(function (name) {
      var slot = form.querySelector('[data-error-for="' + name + '"]');
      var input = form.elements[name];
      if (slot) {
        slot.hidden = false;
        slot.innerHTML = icon('alert-triangle', { size: 13 }) + U.esc(errors[name]);
      }
      if (input && input.classList) input.classList.add('has-error');
      if (!first && input) first = input;
    });
    if (first && first.focus) first.focus();
  };

  ui.setBusy = function (btn, busy, label) {
    if (!btn) return;
    if (busy) {
      btn.dataset.label = btn.innerHTML;
      btn.innerHTML = ui.spinner() + (label ? '<span>' + U.esc(label) + '</span>' : '');
      btn.disabled = true;
    } else {
      if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
      btn.disabled = false;
    }
  };

  /* ============================ TOASTS ============================ */

  function toastHost() {
    var host = document.getElementById('toasts');
    if (!host) {
      host = document.createElement('div');
      host.id = 'toasts';
      host.className = 'toasts';
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    return host;
  }

  ui.toast = function (o) {
    if (typeof o === 'string') o = { title: o };
    var host = toastHost();
    var life = o.duration || 3600;
    var el = document.createElement('div');
    el.className = 'toast' + (o.type ? ' toast--' + o.type : '');
    el.innerHTML =
      '<span class="toast__icon">' + icon(o.icon || (o.type === 'error' ? 'alert-triangle' : o.type === 'info' ? 'info' : 'check'), { size: 15 }) + '</span>' +
      '<div class="toast__body">' +
        '<div class="toast__title">' + U.esc(o.title) + '</div>' +
        (o.msg ? '<div class="toast__msg">' + U.esc(o.msg) + '</div>' : '') +
      '</div>' +
      '<button class="toast__close" type="button" aria-label="Dismiss">' + icon('x', { size: 14 }) + '</button>' +
      '<i class="toast__bar" style="animation-duration:' + life + 'ms"></i>';

    host.appendChild(el);
    var timer = setTimeout(close, life);
    function close() {
      clearTimeout(timer);
      el.classList.add('is-leaving');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 200);
    }
    el.querySelector('.toast__close').addEventListener('click', close);
    return { close: close };
  };

  ui.toast.success = function (title, msg) { return ui.toast({ title: title, msg: msg, type: 'success' }); };
  ui.toast.error = function (title, msg) { return ui.toast({ title: title, msg: msg, type: 'error' }); };
  ui.toast.info = function (title, msg) { return ui.toast({ title: title, msg: msg, type: 'info' }); };

  /* ============================ OVERLAYS ============================ */

  var openOverlays = [];

  function trapFocus(container, e) {
    var focusables = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input:not([type="hidden"]), select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function mountOverlay(o) {
    var overlay = document.createElement('div');
    overlay.className = o.overlayClass || 'overlay';
    overlay.innerHTML = o.html;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    var ctrl = {
      el: overlay,
      panel: overlay.firstElementChild,
      close: function (result) {
        var i = openOverlays.indexOf(ctrl);
        if (i > -1) openOverlays.splice(i, 1);
        overlay.classList.add('is-closing');
        document.removeEventListener('keydown', onKey, true);
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          if (!openOverlays.length) document.body.style.overflow = '';
        }, 160);
        if (o.onClose) o.onClose(result);
      }
    };

    function onKey(e) {
      if (openOverlays[openOverlays.length - 1] !== ctrl) return;
      if (e.key === 'Escape' && o.dismissible !== false) { e.preventDefault(); ctrl.close(null); }
      if (e.key === 'Tab') trapFocus(overlay, e);
    }
    document.addEventListener('keydown', onKey, true);

    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay && o.dismissible !== false) ctrl.close(null);
    });

    // wire [data-close] buttons
    Array.prototype.forEach.call(overlay.querySelectorAll('[data-close]'), function (btn) {
      btn.addEventListener('click', function () { ctrl.close(null); });
    });

    openOverlays.push(ctrl);
    if (o.onMount) o.onMount(ctrl);

    // autofocus
    var af = overlay.querySelector('[autofocus]') || overlay.querySelector('input, textarea, select, button');
    if (af && af.focus) setTimeout(function () { af.focus(); }, 60);

    return ctrl;
  }

  /**
   * modal({ title, sub, icon, size, body, foot, onMount, onClose })
   */
  ui.modal = function (o) {
    var size = o.size ? ' modal--' + o.size : '';
    var html =
      '<div class="modal' + size + '" role="dialog" aria-modal="true" aria-label="' + U.attr(o.title || 'Dialog') + '">' +
        (o.title ? '<div class="modal__head">' +
          '<div>' +
            '<h2 class="modal__title">' + (o.icon ? icon(o.icon, { size: 18 }) : '') + U.esc(o.title) + '</h2>' +
            (o.sub ? '<p class="modal__sub">' + U.esc(o.sub) + '</p>' : '') +
          '</div>' +
          '<button class="modal__close" type="button" data-close aria-label="Close">' + icon('x', { size: 17 }) + '</button>' +
        '</div>' : '') +
        '<div class="modal__body' + (o.flush ? ' modal__body--flush' : '') + '">' + (o.body || '') + '</div>' +
        (o.foot ? '<div class="modal__foot' + (o.footSplit ? ' modal__foot--split' : '') + '">' + o.foot + '</div>' : '') +
      '</div>';
    return mountOverlay({
      html: html, onMount: o.onMount, onClose: o.onClose, dismissible: o.dismissible
    });
  };

  /**
   * confirm({ title, text, confirmLabel, cancelLabel, tone, icon, preview })
   * -> Promise<boolean>
   */
  ui.confirm = function (o) {
    return new Promise(function (resolve) {
      var settled = false;
      var tone = o.tone === 'danger' ? ' confirm__icon--danger' : '';
      var body =
        '<div class="confirm">' +
          '<div class="confirm__icon' + tone + '">' + icon(o.icon || (o.tone === 'danger' ? 'alert-triangle' : 'send'), { size: 26 }) + '</div>' +
          '<h2 class="confirm__title">' + U.esc(o.title) + '</h2>' +
          '<p class="confirm__text">' + (o.html || U.esc(o.text || '')) + '</p>' +
          (o.preview ? '<div class="confirm__preview">' + o.preview + '</div>' : '') +
        '</div>';
      var foot =
        '<button class="btn btn--soft" type="button" data-close>' + U.esc(o.cancelLabel || 'Cancel') + '</button>' +
        '<button class="btn ' + (o.tone === 'danger' ? 'btn--danger' : 'btn--primary') + '" type="button" data-confirm>' +
          (o.confirmIcon !== false ? icon(o.tone === 'danger' ? 'trash' : 'send', { size: 16 }) : '') +
          U.esc(o.confirmLabel || 'Confirm') + '</button>';

      var ctrl = ui.modal({
        size: 'sm', body: body, foot: foot,
        onMount: function (c) {
          c.el.querySelector('[data-confirm]').addEventListener('click', function () {
            settled = true;
            c.close(true);
            resolve(true);
          });
        },
        onClose: function () { if (!settled) resolve(false); }
      });
      return ctrl;
    });
  };

  /**
   * drawer({ title, sub, body, foot, onMount, onClose })
   */
  ui.drawer = function (o) {
    var html =
      '<aside class="drawer" role="dialog" aria-modal="true" aria-label="' + U.attr(o.title || 'Panel') + '">' +
        '<div class="drawer__head">' +
          '<div>' +
            '<h2 class="modal__title">' + (o.icon ? icon(o.icon, { size: 18 }) : '') + U.esc(o.title) + '</h2>' +
            (o.sub ? '<p class="modal__sub">' + U.esc(o.sub) + '</p>' : '') +
          '</div>' +
          '<button class="modal__close" type="button" data-close aria-label="Close">' + icon('x', { size: 17 }) + '</button>' +
        '</div>' +
        '<div class="drawer__body">' + (o.body || '') + '</div>' +
        (o.foot ? '<div class="drawer__foot">' + o.foot + '</div>' : '') +
      '</aside>';
    return mountOverlay({
      html: html, overlayClass: 'drawer-overlay',
      onMount: o.onMount, onClose: o.onClose, dismissible: o.dismissible
    });
  };

  ui.closeAll = function () {
    openOverlays.slice().forEach(function (c) { c.close(null); });
  };

  document.addEventListener('change', function(e) {
    if (e.target && e.target.classList.contains('image-upload-file')) {
      var file = e.target.files[0];
      var hiddenInput = document.getElementById(e.target.dataset.target);
      var previewDiv = document.getElementById(e.target.dataset.previewTarget);
      if (!file) return;

      var form = e.target.form;
      var actionButtons = form ? form.querySelectorAll('[data-preview], [data-save], [data-publish]') : [];
      Array.prototype.forEach.call(actionButtons, function (button) { button.disabled = true; });
      e.target.dataset.uploadState = 'reading';
      
      // Limit file size to 2MB to prevent localStorage issues
      if (file.size > 2 * 1024 * 1024) {
        ui.toast.error('Image too large', 'Please select an image smaller than 2MB.');
        e.target.value = '';
        e.target.dataset.uploadState = 'idle';
        Array.prototype.forEach.call(actionButtons, function (button) { button.disabled = false; });
        return;
      }
      
      var reader = new FileReader();
      reader.onload = function(e2) {
        if (hiddenInput) {
          hiddenInput.value = e2.target.result;
          hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
          hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (previewDiv) previewDiv.innerHTML = '<img src="' + e2.target.result + '" style="max-height: 120px; border-radius: 6px; margin-top: 8px; display: block; border: 1px solid rgba(8,21,14,0.1);">';
        e.target.dataset.uploadState = 'ready';
        Array.prototype.forEach.call(actionButtons, function (button) { button.disabled = false; });
      };
      reader.readAsDataURL(file);
    }
  });

  EVA.ui = ui;
})(window.EVA = window.EVA || {});
