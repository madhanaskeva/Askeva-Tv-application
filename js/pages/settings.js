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
            '<div class="settings-card__actions"><button class="btn btn--primary" type="submit">' + icon('save', { size: 16 }) + 'Save settings</button></div>' +
          '</form></div>' +
        '</section></div>';
    },

    mount: function (root) {
      var form = root.querySelector('#settingsForm');
      if (!form) return;
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