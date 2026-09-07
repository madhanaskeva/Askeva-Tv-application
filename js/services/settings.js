/* ==========================================================================
   settings.js — company + TV display configuration
   ========================================================================== */
(function (EVA) {
  'use strict';

  var store = EVA.store;
  var U = EVA.utils;
  var COLL = 'settings';

  store.defaults[COLL] = EVA.seed.settings;

  var THEMES = [
    { key: 'askeva-dark', name: 'AskEVA Dark', swatch: ['#08150E', '#C7F53F', '#FFFFFF'] },
    { key: 'lime-wash',   name: 'Lime Wash',   swatch: ['#0E2418', '#C7F53F', '#F4F1E6'] },
    { key: 'mono',        name: 'Mono Ink',    swatch: ['#08150E', '#5D6A63', '#FFFFFF'] }
  ];

  var service = {
    THEMES: THEMES,

    get: function () {
      return Object.assign(EVA.seed.settings(), store.readDoc(COLL));
    },

    validate: function (data) {
      var errors = {};
      if (U.required(data.companyName)) errors.companyName = 'Company name is required';
      var dur = parseInt(data.defaultDuration, 10);
      if (isNaN(dur) || dur < 3 || dur > 120) errors.defaultDuration = 'Use 3–120 seconds';
      var ref = parseInt(data.refreshInterval, 10);
      if (isNaN(ref) || ref < 5 || ref > 600) errors.refreshInterval = 'Use 5–600 seconds';
      if (U.required(data.defaultBirthdayMessage)) errors.defaultBirthdayMessage = 'Add a default message';
      return { valid: Object.keys(errors).length === 0, errors: errors };
    },

    save: function (patch) {
      var next = Object.assign({}, service.get(), patch);
      next.defaultDuration = U.clamp(parseInt(next.defaultDuration, 10) || 12, 3, 120);
      next.refreshInterval = U.clamp(parseInt(next.refreshInterval, 10) || 15, 5, 600);
      store.writeDoc(COLL, next, { action: 'settings' });
      EVA.services.activity.log('settings', 'Display settings updated');
      return next;
    },

    reset: function () {
      var d = EVA.seed.settings();
      store.writeDoc(COLL, d, { action: 'reset' });
      return d;
    },

    /** Absolute URL of the TV display, safe for file:// and http://. */
    tvUrl: function () {
      var path = service.get().tvPath || 'tv.html';
      try {
        return new URL(path, window.location.href).href;
      } catch (e) {
        return path;
      }
    }
  };

  EVA.services = EVA.services || {};
  EVA.services.settings = service;
})(window.EVA = window.EVA || {});
