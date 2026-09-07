/* ==========================================================================
   activity.js — append-only audit trail shown on the dashboard
   ========================================================================== */
(function (EVA) {
  'use strict';

  var store = EVA.store;
  var COLL = 'activity';
  var MAX = 60;

  store.defaults[COLL] = EVA.seed.activity;

  var service = {
    list: function (limit) {
      var rows = store.list(COLL).slice().sort(function (a, b) {
        return new Date(b.at) - new Date(a.at);
      });
      return limit ? rows.slice(0, limit) : rows;
    },

    /** log('birthday', 'Message for <strong>X</strong> published') */
    log: function (type, text) {
      var rows = store.list(COLL);
      rows.push({
        id: EVA.utils.uid('act'),
        type: type,
        text: text,
        actor: 'Admin',
        at: new Date().toISOString()
      });
      // keep the trail bounded — oldest first out
      rows.sort(function (a, b) { return new Date(a.at) - new Date(b.at); });
      if (rows.length > MAX) rows = rows.slice(rows.length - MAX);
      store.replace(COLL, rows, { action: 'log' });
      return rows[rows.length - 1];
    },

    clear: function () { store.replace(COLL, [], { action: 'clear' }); }
  };

  EVA.services = EVA.services || {};
  EVA.services.activity = service;
})(window.EVA = window.EVA || {});
