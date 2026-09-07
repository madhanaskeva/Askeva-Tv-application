/* ==========================================================================
   achievements.js — employee achievements (Intern to Full-Time, Anniversaries, etc.)
   ========================================================================== */
(function (EVA) {
  'use strict';

  var store = EVA.store;
  var U = EVA.utils;
  var COLL = 'achievements';

  store.defaults[COLL] = (EVA.seed && EVA.seed.achievements) ? EVA.seed.achievements() : [];

  function normalize(data) {
    return {
      employeeId: data.employeeId || '',
      type: String(data.type || 'Custom').trim(),
      title: String(data.title || '').trim(),
      description: String(data.description || '').trim(),
      status: data.status === 'published' ? 'published' : 'draft',
      publishedAt: data.publishedAt || null,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  var service = {
    all: function () { return store.list(COLL); },

    get: function (id) { return store.get(COLL, id); },

    published: function () {
      return store.list(COLL).filter(function (a) { return a.status === 'published'; });
    },

    forTV: function () {
      return service.published().sort(function(a, b) {
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      });
    },

    validate: function (data) {
      var errors = {};
      var d = normalize(data);
      if (!d.employeeId) errors.employeeId = 'Select the employee for this achievement';
      else if (!EVA.services.employees.get(d.employeeId)) errors.employeeId = 'That employee no longer exists';
      if (U.required(d.title)) errors.title = 'Give the achievement a short title';
      else if (d.title.length > 70) errors.title = 'Keep the title under 70 characters so it fits the TV';
      if (d.description.length > 220) errors.description = 'Keep the description under 220 characters';
      return { valid: Object.keys(errors).length === 0, errors: errors, data: d };
    },

    create: function (data) {
      var rec = store.insert(COLL, normalize(data));
      var emp = EVA.services.employees.display(rec.employeeId);
      EVA.services.activity.log('achievement',
        'Achievement <strong>' + U.esc(rec.title) + '</strong> added for <strong>' + U.esc(emp.name) + '</strong>');
      return rec;
    },

    update: function (id, data) {
      var rec = store.update(COLL, id, normalize(data));
      if (rec) {
        var emp = EVA.services.employees.display(rec.employeeId);
        EVA.services.activity.log('achievement',
          'Achievement for <strong>' + U.esc(emp.name) + '</strong> updated');
      }
      return rec;
    },

    publish: function (id) {
      var rec = store.update(COLL, id, { status: 'published', publishedAt: new Date().toISOString() });
      if (rec) {
        var emp = EVA.services.employees.display(rec.employeeId);
        EVA.services.activity.log('achievement',
          '<strong>' + U.esc(emp.name) + '</strong>\'s achievement published');
      }
      return rec;
    },

    unpublish: function (id) {
      return store.update(COLL, id, { status: 'draft', publishedAt: null });
    },

    remove: function (id) {
      var rec = service.get(id);
      var ok = store.remove(COLL, id);
      if (ok && rec) {
        var emp = EVA.services.employees.display(rec.employeeId);
        EVA.services.activity.log('achievement',
          'Achievement for <strong>' + U.esc(emp.name) + '</strong> removed');
      }
      return ok;
    },

    removeByEmployee: function (employeeId) {
      store.list(COLL)
        .filter(function (p) { return p.employeeId === employeeId; })
        .forEach(function (p) { store.remove(COLL, p.id); });
    },

    stats: function () {
      var rows = store.list(COLL);
      return {
        total: rows.length,
        published: rows.filter(function (p) { return p.status === 'published'; }).length,
        drafts: rows.filter(function (p) { return p.status === 'draft'; }).length
      };
    }
  };

  EVA.services = EVA.services || {};
  EVA.services.achievements = service;
})(window.EVA = window.EVA || {});
