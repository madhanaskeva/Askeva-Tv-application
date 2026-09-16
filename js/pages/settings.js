/* ==========================================================================\n+   pages/settings.js — company and display settings\n+   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils, ui = EVA.ui, icon = EVA.icon;
  var S = EVA.services;

  EVA.pages.settings = {
    title: 'Settings',

    render: function () {
      var settings = S.settings.get();
      return '<div class="page__head">' +
          '<div class="page__head-text">' +
            '<h1 class="page__title">Settings</h1>' +
            '<p class="page__desc">Configure the office identity and TV display defaults.</p>' +
          '</div>' +
        '</div>' +
        '<div class="section"><section class="card settings-card">' +
          '<div class="card__head"><div><h2 class="card__title">' + icon('settings') + 'Office and display</h2>' +
            '<p class="card__sub">These defaults are used across your content and TV slides.</p></div></div>' +
          '<div class="card__body"><form id="settingsForm" novalidate>' +
            '<div class="field-row">' +
              ui.field({ label: 'Company name', name: 'companyName', value: settings.companyName, required: true }) +
              ui.field({ label: 'Tagline', name: 'tagline', value: settings.tagline }) +
            '</div>' +
            '<div class="field-row">' +
              ui.field({ type: 'number', label: 'Default slide duration (seconds)', name: 'defaultDuration', value: settings.defaultDuration, min: 3, max: 120, required: true }) +
              ui.field({ type: 'number', label: 'Refresh interval (seconds)', name: 'refreshInterval', value: settings.refreshInterval, min: 5, max: 600, required: true }) +
            '</div>' +
            ui.field({ label: 'Default birthday message', name: 'defaultBirthdayMessage', value: settings.defaultBirthdayMessage, required: true }) +
            '<div class="field-group" style="margin-top: 30px;">' +
              '<h3 style="font-size:14px; font-weight:600; margin-bottom:12px; color:var(--ink);">Screen Sleep Schedule (Eco Mode)</h3>' +
              '<div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">' +
                '<span style="font-size:13px; font-weight:500;">Active Window:</span>' +
                '<input type="time" name="activeWindowStart" class="input" style="width:auto; padding:6px 12px; font-family:monospace;" value="' + (settings.activeWindowStart || '08:00') + '">' +
                '<span style="font-size:13px; color:var(--ink-500); font-weight:500;">to</span>' +
                '<input type="time" name="activeWindowEnd" class="input" style="width:auto; padding:6px 12px; font-family:monospace;" value="' + (settings.activeWindowEnd || '19:00') + '">' +
              '</div>' +
              '<label class="switch">' +
                '<input type="checkbox" name="autoSleep" ' + (settings.autoSleep ? 'checked' : '') + '>' +
                '<div class="switch__track"></div>' +
                '<div class="switch__label">Auto-Sleep [ON]</div>' +
              '</label>' +
            '</div>' +
            '<div class="settings-card__actions" style="margin-top:25px;"><button class="btn btn--primary" type="submit">' + icon('save', { size: 16 }) + 'Save settings</button></div>' +
          '</form></div>' +
        '</section></div>';
    },

    mount: function (root) {
      var form = root.querySelector('#settingsForm');
      if (!form) return;
      
      var autoSleepToggle = form.querySelector('[name="autoSleep"]');
      var autoSleepLabel = form.querySelector('.switch__label');
      if (autoSleepToggle && autoSleepLabel) {
        autoSleepToggle.addEventListener('change', function() {
          autoSleepLabel.textContent = 'Auto-Sleep [' + (this.checked ? 'ON' : 'OFF') + ']';
        });
        autoSleepLabel.textContent = 'Auto-Sleep [' + (autoSleepToggle.checked ? 'ON' : 'OFF') + ']';
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var data = ui.readForm(form);
        var result = S.settings.validate(data);
        if (!result.valid) { ui.showErrors(form, result.errors); return; }
        S.settings.save(data);
        ui.toast.success('Settings saved', 'Your office TV defaults have been updated.');
      });
    }
  };
})(window.EVA = window.EVA || {});