/* ==========================================================================
   birthdays.js — birthday wishes.
   Birthdays themselves live on the employee record; this service manages the
   *message* attached to a given employee for the current year.
   ========================================================================== */
(function (EVA) {
  'use strict';

  var store = EVA.store;
  var U = EVA.utils;
  var COLL = 'wishes';
  var UPCOMING_WINDOW = 30;
  var PAST_WINDOW = 30;

  store.defaults[COLL] = EVA.seed.wishes;

  function currentYear() { return new Date().getFullYear(); }

  function wishFor(employeeId) {
    return store.list(COLL).filter(function (w) {
      return w.employeeId === employeeId && w.year === currentYear();
    })[0] || null;
  }

  function entry(emp) {
    return {
      employee: emp,
      wish: wishFor(emp.id),
      daysUntil: U.daysUntilBirthday(emp.birthday),
      daysSince: U.daysSinceBirthday(emp.birthday),
      birthday: emp.birthday
    };
  }

  var service = {
    UPCOMING_WINDOW: UPCOMING_WINDOW,

    all: function () { return store.list(COLL); },
    get: function (id) { return store.get(COLL, id); },
    wishFor: wishFor,

    defaultMessage: function (emp) {
      var tpl = EVA.services.settings.get().defaultBirthdayMessage || '';
      var name = emp ? String(emp.name).split(' ')[0] : 'there';
      return 'Happy birthday ' + name + '! ' + tpl;
    },

    /** Employees whose birthday is today. */
    today: function () {
      return EVA.services.employees.all()
        .filter(function (e) { return e.status !== 'inactive' && U.daysUntilBirthday(e.birthday) === 0; })
        .map(entry);
    },

    upcoming: function (windowDays) {
      var w = windowDays || UPCOMING_WINDOW;
      return EVA.services.employees.all()
        .filter(function (e) {
          if (e.status === 'inactive') return false;
          var d = U.daysUntilBirthday(e.birthday);
          return d !== null && d > 0 && d <= w;
        })
        .map(entry)
        .sort(function (a, b) { return a.daysUntil - b.daysUntil; });
    },

    past: function (windowDays) {
      var w = windowDays || PAST_WINDOW;
      return EVA.services.employees.all()
        .filter(function (e) {
          if (e.status === 'inactive') return false;
          var d = U.daysSinceBirthday(e.birthday);
          return d !== null && d > 0 && d <= w;
        })
        .map(entry)
        .sort(function (a, b) { return a.daysSince - b.daysSince; });
    },

    /** Get the existing wish or build (and store) a draft from the template. */
    ensure: function (employeeId) {
      var existing = wishFor(employeeId);
      if (existing) return existing;
      var emp = EVA.services.employees.get(employeeId);
      if (!emp) return null;
      return store.insert(COLL, {
        employeeId: employeeId,
        message: service.defaultMessage(emp),
        status: 'draft',
        publishedAt: null,
        year: currentYear()
      });
    },

    validate: function (data) {
      var errors = {};
      var msg = String(data.message || '').trim();
      if (!data.employeeId) errors.employeeId = 'Select an employee';
      if (U.required(msg)) errors.message = 'Write a birthday message';
      else if (msg.length < 8) errors.message = 'That message is a little too short';
      else if (msg.length > 200) errors.message = 'Keep it under 200 characters so it reads well on the TV';
      return {
        valid: Object.keys(errors).length === 0,
        errors: errors,
        data: { employeeId: data.employeeId, message: msg }
      };
    },

    saveMessage: function (id, message, photo) {
      var updateData = { message: String(message || '').trim() };
      if (photo !== undefined) updateData.photo = photo;
      return store.update(COLL, id, updateData);
    },

    create: function (data) {
      var rec = store.insert(COLL, {
        employeeId: data.employeeId,
        message: String(data.message || '').trim(),
        photo: data.photo || '',
        status: data.status === 'published' ? 'published' : 'draft',
        publishedAt: data.status === 'published' ? new Date().toISOString() : null,
        year: currentYear()
      });
      var emp = EVA.services.employees.display(rec.employeeId);
      EVA.services.activity.log('birthday',
        'Birthday message created for <strong>' + U.esc(emp.name) + '</strong>');
      return rec;
    },

    publish: function (id) {
      var rec = store.update(COLL, id, { status: 'published', publishedAt: new Date().toISOString() });
      if (rec) {
        var emp = EVA.services.employees.display(rec.employeeId);
        EVA.services.activity.log('birthday',
          'Birthday message for <strong>' + U.esc(emp.name) + '</strong> published');
      }
      return rec;
    },

    unpublish: function (id) {
      return store.update(COLL, id, { status: 'draft', publishedAt: null });
    },

    remove: function (id) { return store.remove(COLL, id); },

    removeByEmployee: function (employeeId) {
      store.list(COLL)
        .filter(function (w) { return w.employeeId === employeeId; })
        .forEach(function (w) { store.remove(COLL, w.id); });
    },

    /** All birthdays that have a published message — what the TV shows. */
    forTV: function () {
      return store.list(COLL)
        .filter(function (w) {
          return w.status === 'published';
        })
        .map(function (w) {
          var emp = EVA.services.employees.get(w.employeeId);
          if (!emp || emp.status === 'inactive') return null;
          return {
            employee: emp,
            wish: w,
            daysUntil: U.daysUntilBirthday(emp.birthday),
            daysSince: U.daysSinceBirthday(emp.birthday),
            birthday: emp.birthday
          };
        })
        .filter(Boolean);
    },

    stats: function () {
      return {
        today: service.today().length,
        upcoming7: service.upcoming(7).length,
        upcoming30: service.upcoming(30).length,
        readyToPublish: store.list(COLL).filter(function (w) {
          return w.status === 'draft';
        }).length,
        live: service.forTV().length
      };
    }
  };

  EVA.services = EVA.services || {};
  EVA.services.birthdays = service;
})(window.EVA = window.EVA || {});
