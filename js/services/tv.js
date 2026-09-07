/* ==========================================================================
   tv.js — playlist, slide compilation and the publish pipeline.

   THE CONTRACT
   ------------
   The admin panel never talks to the TV directly. It compiles published
   content into a flat list of slide objects and writes them to the
   `broadcast` document. The TV display reads that document and renders it.
   Anything not published never reaches the broadcast.

   Slide shape:
     { id, type, duration, label, data }
   ========================================================================== */
(function (EVA) {
  'use strict';

  var store = EVA.store;
  var U = EVA.utils;
  var PLAYLIST = 'playlist';
  var BROADCAST = 'broadcast';

  store.defaults[PLAYLIST] = EVA.seed.playlist;
  store.defaults[BROADCAST] = EVA.seed.broadcast;

  var SLOT_META = {
    birthday:     { icon: 'cake',      name: 'Birthday Wishes',      hint: 'Today\'s birthdays with a published message' },
    performer:    { icon: 'trophy',    name: 'Top Performers',       hint: 'Published day / week / month recognition' },
    announcement: { icon: 'megaphone', name: 'Announcements',        hint: 'Published announcements inside their date window' },
    recognition:  { icon: 'sparkles',  name: 'Employee Recognition', hint: 'Montage of everyone recognised this period' },
    event:        { icon: 'calendar',  name: 'Events & Celebrations',hint: 'Published events inside their date window' },
    achievement:  { icon: 'award',     name: 'Achievements',         hint: 'Intern conversions, work anniversaries, etc.' },
    idle:         { icon: 'tv',        name: 'AskEVA Standby Card',  hint: 'Branded filler card with the time' }
  };

  function person(emp) {
    return {
      name: emp.name,
      role: emp.role,
      department: emp.department,
      photo: emp.photo || '',
      initials: U.initials(emp.name)
    };
  }

  var service = {
    SLOT_META: SLOT_META,

    /* ---------------- playlist ---------------- */

    playlist: function () {
      return store.list(PLAYLIST).slice().sort(function (a, b) { return a.order - b.order; });
    },

    enabledSlots: function () {
      return service.playlist().filter(function (s) { return s.enabled; });
    },

    toggleSlot: function (id) {
      var slot = store.get(PLAYLIST, id);
      if (!slot) return null;
      var next = store.update(PLAYLIST, id, { enabled: !slot.enabled });
      EVA.services.activity.log('tv',
        '<strong>' + U.esc(slot.name) + '</strong> ' + (next.enabled ? 'enabled' : 'disabled') + ' in the playlist');
      return next;
    },

    setDuration: function (id, secs) {
      return store.update(PLAYLIST, id, { duration: U.clamp(parseInt(secs, 10) || 10, 3, 120) });
    },

    /** Move a slot to a new index and renumber the whole list. */
    reorder: function (id, toIndex) {
      var rows = service.playlist();
      var from = rows.findIndex(function (r) { return r.id === id; });
      if (from < 0) return rows;
      var moved = rows.splice(from, 1)[0];
      rows.splice(U.clamp(toIndex, 0, rows.length), 0, moved);
      rows = rows.map(function (r, i) { return Object.assign({}, r, { order: i }); });
      store.replace(PLAYLIST, rows, { action: 'reorder' });
      return rows;
    },

    move: function (id, delta) {
      var rows = service.playlist();
      var i = rows.findIndex(function (r) { return r.id === id; });
      if (i < 0) return rows;
      return service.reorder(id, i + delta);
    },

    /* ---------------- slide compilation ---------------- */

    /**
     * Build the slide deck from everything currently published.
     * Pure: does not write anything.
     */
    buildSlides: function () {
      var settings = EVA.services.settings.get();
      var slides = [];

      service.enabledSlots().forEach(function (slot) {
        var dur = slot.duration || settings.defaultDuration;

        if (slot.type === 'birthday') {
          EVA.services.birthdays.forTV().forEach(function (t) {
            slides.push({
              id: 'sl_bday_' + t.employee.id,
              type: 'birthday',
              duration: dur,
              label: 'Birthday — ' + t.employee.name,
              data: Object.assign(person(t.employee), { message: t.wish.message })
            });
          });
        }

        if (slot.type === 'performer') {
          EVA.services.performers.forTV().forEach(function (p) {
            var emp = EVA.services.employees.get(p.employeeId);
            if (!emp) return;
            var meta = EVA.services.performers.periodMeta(p.period);
            slides.push({
              id: 'sl_perf_' + p.id,
              type: 'performer',
              duration: dur,
              label: meta.title + ' — ' + emp.name,
              data: Object.assign(person(emp), {
                rank: p.rank,
                title: p.title,
                description: p.description,
                periodTitle: meta.title,
                periodLabel: meta.label
              })
            });
          });
        }

        if (slot.type === 'announcement') {
          EVA.services.announcements.forTV().forEach(function (a) {
            slides.push({
              id: 'sl_ann_' + a.id,
              type: 'announcement',
              duration: a.duration || dur,
              label: 'Announcement — ' + a.title,
              data: {
                title: a.title,
                text: a.description,
                image: a.image,
                category: a.category,
                priority: a.priority
              }
            });
          });
        }

        if (slot.type === 'recognition') {
          var people = EVA.services.performers.forTV()
            .map(function (p) {
              var emp = EVA.services.employees.get(p.employeeId);
              if (!emp) return null;
              return Object.assign(person(emp), {
                tag: EVA.services.performers.periodMeta(p.period).label
              });
            })
            .filter(Boolean)
            .slice(0, 3);
          if (people.length >= 2) {
            slides.push({
              id: 'sl_recog',
              type: 'recognition',
              duration: dur,
              label: 'Employee Recognition montage',
              data: { title: 'Recognised this month', people: people }
            });
          }
        }

        if (slot.type === 'event') {
          EVA.services.events.forTV().forEach(function (e) {
            slides.push({
              id: 'sl_evt_' + e.id,
              type: 'event',
              duration: dur,
              label: e.category + ' — ' + e.title,
              data: {
                title: e.title,
                text: e.description,
                image: e.image,
                category: e.category,
                priority: e.priority,
                location: e.location,
                startDate: e.startDate
              }
            });
          });
        }

        if (slot.type === 'achievement') {
          EVA.services.achievements.forTV().forEach(function (a) {
            var emp = EVA.services.employees.get(a.employeeId);
            if (!emp) return;
            slides.push({
              id: 'sl_ach_' + a.id,
              type: 'achievement',
              duration: dur,
              label: a.type + ' — ' + emp.name,
              data: Object.assign(person(emp), {
                type: a.type,
                title: a.title,
                description: a.description
              })
            });
          });
        }

        if (slot.type === 'idle') {
          slides.push({
            id: 'sl_idle',
            type: 'idle',
            duration: dur,
            label: 'AskEVA standby card',
            data: { companyName: settings.companyName, tagline: settings.tagline }
          });
        }
      });

      return slides;
    },

    /* ---------------- broadcast ---------------- */

    broadcast: function () {
      return Object.assign(EVA.seed.broadcast(), store.readDoc(BROADCAST));
    },

    liveSlides: function () {
      var b = service.broadcast();
      return b.live ? (b.slides || []) : [];
    },

    isLive: function () {
      var b = service.broadcast();
      return !!(b.live && b.slides && b.slides.length);
    },

    /** Human label for whatever is on screen right now. */
    currentLabel: function () {
      var slides = service.liveSlides();
      if (!slides.length) return 'Nothing published';
      return slides[0].label;
    },

    /** Slides that WOULD publish, but are not on air yet. */
    pending: function () {
      var next = service.buildSlides();
      var live = service.liveSlides();
      var liveIds = live.map(function (s) { return s.id; });
      var same = JSON.stringify(next) === JSON.stringify(live);
      return {
        slides: next,
        count: next.length,
        added: next.filter(function (s) { return liveIds.indexOf(s.id) < 0; }).length,
        removed: live.filter(function (s) {
          return next.map(function (n) { return n.id; }).indexOf(s.id) < 0;
        }).length,
        changed: !same,
        empty: next.length === 0
      };
    },

    hasPendingChanges: function () { return service.pending().changed; },

    /**
     * Compile + write the broadcast. This is the single "Push to TV" action.
     */
    publish: function (opts) {
      opts = opts || {};
      var slides = service.buildSlides();
      var prev = service.broadcast();
      var next = {
        live: true,
        slides: slides,
        publishedAt: new Date().toISOString(),
        publishedBy: opts.by || 'Admin',
        revision: (prev.revision || 0) + 1,
        settings: EVA.services.settings.get()
      };
      store.writeDoc(BROADCAST, next, { action: 'publish' });
      EVA.services.activity.log('tv',
        opts.reason ||
        ('TV updated — <strong>' + slides.length + ' ' + U.pluralize(slides.length, 'slide') + '</strong> pushed to the office display'));
      return next;
    },

    /** Re-push the same deck; bumps the revision so the TV reloads. */
    refresh: function () {
      return service.publish({ reason: 'TV display refreshed' });
    },

    stop: function () {
      var prev = service.broadcast();
      var next = Object.assign({}, prev, {
        live: false,
        stoppedAt: new Date().toISOString(),
        revision: (prev.revision || 0) + 1
      });
      store.writeDoc(BROADCAST, next, { action: 'stop' });
      EVA.services.activity.log('tv', 'TV display stopped — screen is on standby');
      return next;
    },

    resume: function () {
      var prev = service.broadcast();
      if (!prev.slides || !prev.slides.length) return service.publish({ reason: 'TV display started' });
      var next = Object.assign({}, prev, { live: true, revision: (prev.revision || 0) + 1 });
      store.writeDoc(BROADCAST, next, { action: 'resume' });
      EVA.services.activity.log('tv', 'TV display resumed');
      return next;
    },

    stats: function () {
      var b = service.broadcast();
      var pending = service.pending();
      var slots = service.playlist();
      return {
        live: service.isLive(),
        slides: (b.slides || []).length,
        pendingSlides: pending.count,
        hasChanges: pending.changed,
        activeSlots: slots.filter(function (s) { return s.enabled; }).length,
        totalSlots: slots.length,
        publishedAt: b.publishedAt,
        revision: b.revision || 0,
        loopSeconds: (b.slides || []).reduce(function (t, s) { return t + (s.duration || 0); }, 0)
      };
    }
  };

  EVA.services = EVA.services || {};
  EVA.services.tv = service;
})(window.EVA = window.EVA || {});
