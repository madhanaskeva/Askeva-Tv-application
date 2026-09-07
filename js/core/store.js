/* ==========================================================================
   store.js — persistence layer + pub/sub.

   This is the ONLY module that talks to storage. Every service goes through
   it, so swapping localStorage for a REST API means reimplementing the six
   primitives below (list/get/insert/update/remove/replace) against fetch()
   and keeping the same return shapes.
   ========================================================================== */
(function (EVA) {
  'use strict';

  var NS = 'askeva.officetv.v1';
  var KEY_BROADCAST = NS + '.broadcast';   // the admin -> TV contract
  var listeners = [];
  var memory = {};                          // fallback when storage is unavailable
  var storageOK = (function () {
    try {
      var k = NS + '.__t';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();      

  function key(collection) { return NS + '.' + collection; }

  function readRaw(collection) {
    var k = key(collection);
    if (!storageOK) return memory[k] !== undefined ? memory[k] : null;
    try {
      var raw = window.localStorage.getItem(k);
      return raw === null ? null : JSON.parse(raw);
    } catch (e) {
      console.warn('[store] unreadable collection:', collection, e);
      return null;
    }
  }

  function writeRaw(collection, value) {
    var k = key(collection);
    memory[k] = value;
    if (storageOK) {
      try {
        window.localStorage.setItem(k, JSON.stringify(value));
      } catch (e) {
        console.warn('[store] write failed (quota?):', collection, e);
      }
    }
    return value;
  }

  /* ---------------- pub/sub ---------------- */

  function emit(collection, meta) {
    var evt = { collection: collection, meta: meta || {}, at: Date.now() };
    listeners.slice().forEach(function (fn) {
      try { fn(evt); } catch (e) { console.error('[store] listener error', e); }
    });
  }

  /* ---------------- public API ---------------- */

  var store = {
    NS: NS,
    KEY_BROADCAST: KEY_BROADCAST,
    isPersistent: storageOK,

    /** Register a defaults factory per collection; used on first read. */
    defaults: {},

    subscribe: function (fn) {
      listeners.push(fn);
      return function () {
        var i = listeners.indexOf(fn);
        if (i > -1) listeners.splice(i, 1);
      };
    },

    emit: emit,

    /* --- documents (single object collections: settings, broadcast) --- */

    readDoc: function (collection) {
      var v = readRaw(collection);
      if (v === null) {
        v = typeof store.defaults[collection] === 'function' ? store.defaults[collection]() : {};
        writeRaw(collection, v);
      }
      return v;
    },

    writeDoc: function (collection, value, meta) {
      writeRaw(collection, value);
      emit(collection, meta);
      return value;
    },

    patchDoc: function (collection, patch, meta) {
      var cur = store.readDoc(collection);
      var next = Object.assign({}, cur, patch);
      return store.writeDoc(collection, next, meta);
    },

    /* --- record collections (arrays) --- */

    list: function (collection) {
      var v = readRaw(collection);
      if (v === null) {
        v = typeof store.defaults[collection] === 'function' ? store.defaults[collection]() : [];
        writeRaw(collection, v);
      }
      return Array.isArray(v) ? v : [];
    },

    get: function (collection, id) {
      var found = store.list(collection).filter(function (r) { return r.id === id; })[0];
      return found || null;
    },

    insert: function (collection, record) {
      var rows = store.list(collection);
      var now = new Date().toISOString();
      record = Object.assign({
        id: EVA.utils.uid(collection.slice(0, 3)),
        createdAt: now,
        updatedAt: now
      }, record);
      rows.push(record);
      writeRaw(collection, rows);
      emit(collection, { action: 'insert', id: record.id });
      return record;
    },

    update: function (collection, id, patch) {
      var rows = store.list(collection);
      var next = null;
      rows = rows.map(function (r) {
        if (r.id !== id) return r;
        next = Object.assign({}, r, patch, { id: r.id, updatedAt: new Date().toISOString() });
        return next;
      });
      writeRaw(collection, rows);
      emit(collection, { action: 'update', id: id });
      return next;
    },

    remove: function (collection, id) {
      var rows = store.list(collection);
      var kept = rows.filter(function (r) { return r.id !== id; });
      writeRaw(collection, kept);
      emit(collection, { action: 'remove', id: id });
      return rows.length !== kept.length;
    },

    /** Wholesale replace (used for reordering the playlist). */
    replace: function (collection, rows, meta) {
      writeRaw(collection, rows);
      emit(collection, Object.assign({ action: 'replace' }, meta));
      return rows;
    },

    /* --- maintenance --- */

    has: function (collection) { return readRaw(collection) !== null; },

    clearAll: function () {
      if (storageOK) {
        Object.keys(window.localStorage)
          .filter(function (k) { return k.indexOf(NS) === 0; })
          .forEach(function (k) { window.localStorage.removeItem(k); });
      }
      memory = {};
      emit('*', { action: 'clear' });
    },

    exportAll: function () {
      var out = {};
      if (storageOK) {
        Object.keys(window.localStorage)
          .filter(function (k) { return k.indexOf(NS) === 0; })
          .forEach(function (k) {
            try { out[k.replace(NS + '.', '')] = JSON.parse(window.localStorage.getItem(k)); }
            catch (e) { /* skip unreadable */ }
          });
      }
      return out;
    }
  };

  /* ---------------- cross-tab / cross-window sync ----------------
     The admin panel and the TV display are separate documents. A write in
     one fires 'storage' in the other, which we translate into a normal
     store event so every screen reacts identically.                       */
  window.addEventListener('storage', function (e) {
    if (!e.key || e.key.indexOf(NS) !== 0) return;
    var collection = e.key.replace(NS + '.', '');
    emit(collection, { action: 'external' });
  });

  EVA.store = store;
})(window.EVA = window.EVA || {});
