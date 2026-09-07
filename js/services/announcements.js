/* ==========================================================================
   announcements.js — company announcements, notices, events
   ========================================================================== */
(function (EVA) {
  'use strict';

  var store = EVA.store;
  var U = EVA.utils;
  var COLL = 'announcements';

  store.defaults[COLL] = EVA.seed.announcements;

  var CATEGORIES = ['Announcement', 'Important Notice', 'Team Message'];
  var PRIORITIES = ['low', 'normal', 'high', 'urgent'];
  var STATUSES = ['draft', 'scheduled', 'published', 'inactive'];

  function normalize(data) {
    return {
      title: String(data.title || '').trim(),
      description: String(data.description || '').trim(),
      image: String(data.image || '').trim(),
      category: CATEGORIES.indexOf(data.category) > -1 ? data.category : 'Announcement',
      priority: PRIORITIES.indexOf(data.priority) > -1 ? data.priority : 'normal',
      startDate: data.startDate || U.today(),
      endDate: data.endDate || '',
      duration: U.clamp(parseInt(data.duration, 10) || 10, 3, 120),
      status: STATUSES.indexOf(data.status) > -1 ? data.status : 'draft'
    };
  }

  /** Is the announcement inside its scheduled window today? */
  function inWindow(a) {
    var today = U.today();
    if (a.startDate && a.startDate > today) return false;
    if (a.endDate && a.endDate < today) return false;
    return true;
  }

  var service = {
    CATEGORIES: CATEGORIES,
    PRIORITIES: PRIORITIES,
    STATUSES: STATUSES,
    inWindow: inWindow,

    all: function () { return store.list(COLL); },
    get: function (id) { return store.get(COLL, id); },

    query: function (q) {
      q = q || {};
      var rows = store.list(COLL);
      var term = String(q.search || '').trim().toLowerCase();
      if (term) {
        rows = rows.filter(function (a) {
          return (a.title + ' ' + a.description + ' ' + a.category).toLowerCase().indexOf(term) > -1;
        });
      }
      if (q.status && q.status !== 'all') {
        rows = rows.filter(function (a) { return a.status === q.status; });
      }
      if (q.priority && q.priority !== 'all') {
        rows = rows.filter(function (a) { return a.priority === q.priority; });
      }
      var weight = { urgent: 0, high: 1, normal: 2, low: 3 };
      if (q.sort === 'priority') {
        rows = rows.slice().sort(function (a, b) { return weight[a.priority] - weight[b.priority]; });
      } else if (q.sort === 'title') {
        rows = U.sortBy(rows, 'title', q.dir || 'asc');
      } else {
        rows = U.sortBy(rows, 'startDate', q.dir || 'desc');
      }
      return rows;
    },

    /** Published and inside its date window — what the TV is allowed to show. */
    forTV: function () {
      var weight = { urgent: 0, high: 1, normal: 2, low: 3 };
      return store.list(COLL)
        .filter(function (a) { return a.status === 'published' && inWindow(a); })
        .sort(function (a, b) { return weight[a.priority] - weight[b.priority]; });
    },

    /** Scheduled items whose start date has arrived. */
    dueForPublish: function () {
      return store.list(COLL).filter(function (a) {
        return a.status === 'scheduled' && a.startDate <= U.today();
      });
    },

    validate: function (data) {
      var errors = {};
      var d = normalize(data);
      if (U.required(d.title)) errors.title = 'Give the announcement a title';
      else if (d.title.length > 80) errors.title = 'Keep the title under 80 characters for the TV';
      if (U.required(d.description)) errors.description = 'Add some detail';
      else if (d.description.length > 400) errors.description = 'Keep the description under 400 characters';

      var s = U.dateField(d.startDate, true);
      if (s) errors.startDate = s;
      var e = U.dateField(d.endDate, false);
      if (e) errors.endDate = e;
      var range = U.rangeField(d.startDate, d.endDate);
      if (range) errors.endDate = range;

      if (d.duration < 3 || d.duration > 120) errors.duration = 'Duration must be 3–120 seconds';
      return { valid: Object.keys(errors).length === 0, errors: errors, data: d };
    },

    create: function (data) {
      var rec = store.insert(COLL, normalize(data));
      EVA.services.activity.log('announcement',
        'Announcement <strong>' + U.esc(rec.title) + '</strong> ' +
        (rec.status === 'published' ? 'published' : 'saved as ' + rec.status));
      return rec;
    },

    update: function (id, data) {
      var rec = store.update(COLL, id, normalize(data));
      if (rec) {
        EVA.services.activity.log('announcement',
          'Announcement <strong>' + U.esc(rec.title) + '</strong> updated');
      }
      return rec;
    },

    publish: function (id) {
      var rec = store.update(COLL, id, { status: 'published', publishedAt: new Date().toISOString() });
      if (rec) {
        EVA.services.activity.log('announcement',
          'Announcement <strong>' + U.esc(rec.title) + '</strong> published to the TV');
      }
      return rec;
    },

    unpublish: function (id) {
      return store.update(COLL, id, { status: 'inactive' });
    },

    remove: function (id) {
      var rec = service.get(id);
      var ok = store.remove(COLL, id);
      if (ok && rec) {
        EVA.services.activity.log('announcement',
          'Announcement <strong>' + U.esc(rec.title) + '</strong> deleted');
      }
      return ok;
    },

    stats: function () {
      var rows = store.list(COLL);
      return {
        total: rows.length,
        published: rows.filter(function (a) { return a.status === 'published'; }).length,
        active: service.forTV().length,
        scheduled: rows.filter(function (a) { return a.status === 'scheduled'; }).length,
        drafts: rows.filter(function (a) { return a.status === 'draft'; }).length
      };
    }
  };

  EVA.services = EVA.services || {};
  EVA.services.announcements = service;
})(window.EVA = window.EVA || {});
