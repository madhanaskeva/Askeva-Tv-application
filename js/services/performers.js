/* ==========================================================================
   performers.js — employee recognition (day / week / month)
   ========================================================================== */
(function (EVA) {
  'use strict';

  var store = EVA.store;
  var U = EVA.utils;
  var COLL = 'performers';

  store.defaults[COLL] = EVA.seed.performers;

  var PERIODS = [
    { key: 'day',   label: 'Today',      title: 'Top Performer of the Day',   icon: 'zap' },
    { key: 'week',  label: 'This Week',  title: 'Top Performer of the Week',  icon: 'trophy' },
    { key: 'month', label: 'This Month', title: 'Top Performer of the Month', icon: 'award' }
  ];

  function normalize(data) {
    return {
      employeeId: data.employeeId || '',
      period: ['day', 'week', 'month'].indexOf(data.period) > -1 ? data.period : 'day',
      rank: Math.max(1, parseInt(data.rank, 10) || 1),
      title: String(data.title || '').trim(),
      description: String(data.description || '').trim(),
      status: data.status === 'published' ? 'published' : 'draft',
      publishedAt: data.publishedAt || null
    };
  }

  var service = {
    PERIODS: PERIODS,

    periodMeta: function (key) {
      return PERIODS.filter(function (p) { return p.key === key; })[0] || PERIODS[0];
    },

    all: function () { return store.list(COLL); },

    get: function (id) { return store.get(COLL, id); },

    byPeriod: function (period) {
      return U.sortBy(store.list(COLL).filter(function (p) { return p.period === period; }), 'rank', 'asc');
    },

    /** The headline (rank 1) performer for a period. */
    lead: function (period) {
      return service.byPeriod(period)[0] || null;
    },

    published: function () {
      return store.list(COLL).filter(function (p) { return p.status === 'published'; });
    },

    /** Everything currently eligible to appear on the TV, ordered day→week→month. */
    forTV: function () {
      var order = { day: 0, week: 1, month: 2 };
      return service.published().sort(function (a, b) {
        if (order[a.period] !== order[b.period]) return order[a.period] - order[b.period];
        return a.rank - b.rank;
      });
    },

    validate: function (data) {
      var errors = {};
      var d = normalize(data);
      if (!d.employeeId) errors.employeeId = 'Select the employee being recognised';
      else if (!EVA.services.employees.get(d.employeeId)) errors.employeeId = 'That employee no longer exists';
      if (U.required(d.title)) errors.title = 'Give the achievement a short title';
      else if (d.title.length > 70) errors.title = 'Keep the title under 70 characters so it fits the TV';
      if (d.description.length > 220) errors.description = 'Keep the description under 220 characters';
      if (d.rank < 1 || d.rank > 20) errors.rank = 'Rank must be between 1 and 20';
      return { valid: Object.keys(errors).length === 0, errors: errors, data: d };
    },

    /** Suggested next rank inside a period. */
    nextRank: function (period) {
      var rows = service.byPeriod(period);
      return rows.length ? Math.max.apply(null, rows.map(function (r) { return r.rank; })) + 1 : 1;
    },

    create: function (data) {
      var rec = store.insert(COLL, normalize(data));
      var emp = EVA.services.employees.display(rec.employeeId);
      EVA.services.activity.log('performer',
        service.periodMeta(rec.period).title + ' set to <strong>' + U.esc(emp.name) + '</strong>');
      return rec;
    },

    update: function (id, data) {
      var rec = store.update(COLL, id, normalize(data));
      if (rec) {
        var emp = EVA.services.employees.display(rec.employeeId);
        EVA.services.activity.log('performer',
          'Recognition for <strong>' + U.esc(emp.name) + '</strong> updated');
      }
      return rec;
    },

    /** Swap the employee behind an existing recognition card. */
    changeEmployee: function (id, employeeId) {
      var rec = store.update(COLL, id, { employeeId: employeeId, status: 'draft', publishedAt: null });
      if (rec) {
        var emp = EVA.services.employees.display(employeeId);
        EVA.services.activity.log('performer',
          'Recognition reassigned to <strong>' + U.esc(emp.name) + '</strong>');
      }
      return rec;
    },

    publish: function (id) {
      var rec = store.update(COLL, id, { status: 'published', publishedAt: new Date().toISOString() });
      if (rec) {
        var emp = EVA.services.employees.display(rec.employeeId);
        EVA.services.activity.log('performer',
          '<strong>' + U.esc(emp.name) + '</strong> published as ' + service.periodMeta(rec.period).title);
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
        EVA.services.activity.log('performer',
          'Recognition for <strong>' + U.esc(emp.name) + '</strong> removed');
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
  EVA.services.performers = service;
})(window.EVA = window.EVA || {});
