/* ==========================================================================
   employees.js — employee directory CRUD
   ========================================================================== */
(function (EVA) {
  'use strict';

  var store = EVA.store;
  var U = EVA.utils;
  var COLL = 'employees';

  store.defaults[COLL] = EVA.seed.employees;

  var STATUSES = ['active', 'on-leave', 'inactive'];

  function normalize(data) {
    return {
      name: String(data.name || '').trim(),
      employeeId: String(data.employeeId || '').trim().toUpperCase(),
      role: String(data.role || '').trim(),
      department: String(data.department || '').trim(),
      email: String(data.email || '').trim(),
      birthday: data.birthday || '',
      joiningDate: data.joiningDate || '',
      status: STATUSES.indexOf(data.status) > -1 ? data.status : 'active',
      photo: String(data.photo || '').trim()
    };
  }

  var service = {
    STATUSES: STATUSES,

    all: function () { return store.list(COLL); },

    get: function (id) { return store.get(COLL, id); },

    /** Resolve an employee to a display-safe shape (never returns null). */
    display: function (id) {
      var e = service.get(id);
      if (!e) return { id: id, name: 'Unknown employee', role: '—', department: '—', photo: '', missing: true };
      return e;
    },

    /**
     * query({ search, department, role, status, sort, dir })
     * Kept deliberately close to a REST query string.
     */
    query: function (q) {
      q = q || {};
      var rows = store.list(COLL);
      var term = String(q.search || '').trim().toLowerCase();

      if (term) {
        rows = rows.filter(function (e) {
          return [e.name, e.role, e.department, e.employeeId, e.email]
            .join(' ').toLowerCase().indexOf(term) > -1;
        });
      }
      if (q.department && q.department !== 'all') {
        rows = rows.filter(function (e) { return e.department === q.department; });
      }
      if (q.role && q.role !== 'all') {
        rows = rows.filter(function (e) { return e.role === q.role; });
      }
      if (q.status && q.status !== 'all') {
        rows = rows.filter(function (e) { return e.status === q.status; });
      }

      var sort = q.sort || 'name';
      var dir = q.dir || 'asc';
      if (sort === 'birthday') {
        rows = U.sortBy(rows, function (e) {
          var d = U.daysUntilBirthday(e.birthday);
          return d === null ? 9999 : d;
        }, dir);
      } else if (sort === 'joiningDate') {
        rows = U.sortBy(rows, 'joiningDate', dir);
      } else {
        rows = U.sortBy(rows, sort, dir);
      }
      return rows;
    },

    departments: function () {
      var used = store.list(COLL).map(function (e) { return e.department; });
      return U.unique(EVA.seed.departments.concat(used)).filter(Boolean).sort();
    },

    roles: function () {
      var used = store.list(COLL).map(function (e) { return e.role; });
      return U.unique(used).filter(Boolean).sort();
    },

    validate: function (data, id) {
      var errors = {};
      var d = normalize(data);

      if (U.required(d.name)) errors.name = 'Employee name is required';
      else if (d.name.length < 2) errors.name = 'Name looks too short';

      if (U.required(d.employeeId)) errors.employeeId = 'Employee ID is required';
      else {
        var clash = store.list(COLL).filter(function (e) {
          return e.employeeId.toUpperCase() === d.employeeId && e.id !== id;
        })[0];
        if (clash) errors.employeeId = 'That ID is already used by ' + clash.name;
      }

      if (U.required(d.role)) errors.role = 'Role is required';
      if (U.required(d.department)) errors.department = 'Pick a department';

      var bday = U.dateField(d.birthday, true);
      if (bday) errors.birthday = bday;

      var join = U.dateField(d.joiningDate, false);
      if (join) errors.joiningDate = join;

      if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
        errors.email = 'Enter a valid email address';
      }

      return { valid: Object.keys(errors).length === 0, errors: errors, data: d };
    },

    /** Next free employee ID, e.g. EVA-013 */
    nextEmployeeId: function () {
      var nums = store.list(COLL)
        .map(function (e) { return parseInt(String(e.employeeId).replace(/\D/g, ''), 10); })
        .filter(function (n) { return !isNaN(n); });
      var next = (nums.length ? Math.max.apply(null, nums) : 0) + 1;
      return 'EVA-' + U.pad2(next).padStart(3, '0');
    },

    create: function (data) {
      var rec = store.insert(COLL, normalize(data));
      EVA.services.activity.log('employee',
        'Employee <strong>' + U.esc(rec.name) + '</strong> added to the directory');
      return rec;
    },

    update: function (id, data) {
      var rec = store.update(COLL, id, normalize(data));
      if (rec) {
        EVA.services.activity.log('employee',
          'Employee <strong>' + U.esc(rec.name) + '</strong> updated');
      }
      return rec;
    },

    remove: function (id) {
      var emp = service.get(id);
      if (!emp) return false;
      var ok = store.remove(COLL, id);
      if (ok) {
        // cascade: drop recognition and wishes that point at this person
        EVA.services.performers.removeByEmployee(id);
        EVA.services.birthdays.removeByEmployee(id);
        EVA.services.activity.log('employee',
          'Employee <strong>' + U.esc(emp.name) + '</strong> removed');
      }
      return ok;
    },

    stats: function () {
      var rows = store.list(COLL);
      return {
        total: rows.length,
        active: rows.filter(function (e) { return e.status === 'active'; }).length,
        onLeave: rows.filter(function (e) { return e.status === 'on-leave'; }).length,
        inactive: rows.filter(function (e) { return e.status === 'inactive'; }).length,
        departments: U.unique(rows.map(function (e) { return e.department; })).filter(Boolean).length
      };
    }
  };

  EVA.services = EVA.services || {};
  EVA.services.employees = service;
})(window.EVA = window.EVA || {});
