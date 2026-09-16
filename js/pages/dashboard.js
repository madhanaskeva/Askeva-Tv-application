/* ==========================================================================
   pages/dashboard.js — the "what is happening right now" overview
   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils, ui = EVA.ui, icon = EVA.icon;
  var S = EVA.services;

  var ACT_ICON = {
    employee: { icon: 'user-plus', tone: '' },
    birthday: { icon: 'cake', tone: 'lime' },
    performer: { icon: 'trophy', tone: '' },
    announcement: { icon: 'megaphone', tone: '' },
    tv: { icon: 'tv', tone: 'dark' },
    settings: { icon: 'settings', tone: '' }
  };

  var SLIDE_ICON = {
    birthday: 'cake', performer: 'trophy', announcement: 'megaphone',
    recognition: 'sparkles', achievement: 'award', event: 'calendar', idle: 'tv'
  };

  function pct(part, whole) {
    return whole ? Math.round(U.clamp(part / whole, 0, 1) * 100) : 0;
  }

  function meter(value, label) {
    return '<span class="dash-meter" role="img" aria-label="' + U.attr(label) + '">' +
      '<i style="width:' + value + '%"></i></span>';
  }

  /** Card shell shared by every dashboard panel so heads and bodies align. */
  function panel(o) {
    return '<section class="card card--soft dash-panel' + (o.cls ? ' ' + o.cls : '') + '">' +
      '<div class="card__head card__head--soft">' +
        '<div class="dash-panel__heading">' +
          '<span class="dash-panel__icon">' + icon(o.icon) + '</span>' +
          '<div><h3 class="card__title">' + U.esc(o.title) + (o.count !== undefined
            ? ' <span class="dash-count">' + o.count + '</span>' : '') + '</h3>' +
          '<p class="card__sub">' + U.esc(o.sub) + '</p></div>' +
        '</div>' +
        (o.action || '') +
      '</div>' +
      '<div class="card__body dash-panel__body' + (o.flush ? ' card__body--flush' : '') + '">' + o.body + '</div>' +
      (o.foot ? '<div class="card__foot">' + o.foot + '</div>' : '') +
    '</section>';
  }

  /* ============================ HERO ============================ */

  function hero() {
    var tv = S.tv.stats();
    var bday = S.birthdays.stats();
    var ann = S.announcements.stats();
    var evt = S.events.stats();
    var pending = S.tv.pending();

    var glance = [
      { icon: 'cake', value: bday.today, label: U.pluralize(bday.today, 'birthday') + ' today', href: '#/birthdays', hot: bday.today > 0 },
      { icon: 'calendar', value: evt.active, label: U.pluralize(evt.active, 'event') + ' live', href: '#/events' },
      { icon: 'megaphone', value: ann.active, label: U.pluralize(ann.active, 'announcement') + ' live', href: '#/announcements' },
      { icon: 'layers', value: pending.changed ? pending.count : 0, label: 'slides waiting to push', href: '#/tv', hot: pending.changed }
    ];

    return '<header class="dash-hero">' +
      '<div class="dash-hero__main">' +
        '<div class="dash-hero__meta">' +
          '<span class="dash-chip">' + icon('calendar', { size: 13 }) + U.esc(U.longDate()) + '</span>' +
          '<span class="dash-chip dash-chip--mono" data-dash-clock>' + icon('clock', { size: 13 }) + '<span>' + U.clockTime() + '</span></span>' +
          '<span class="dash-chip ' + (tv.live ? 'dash-chip--live' : 'dash-chip--off') + '">' +
            '<i class="dash-chip__dot"></i>' + (tv.live ? 'TV on air' : 'TV on standby') + '</span>' +
        '</div>' +
        '<h1 class="dash-hero__title">Good ' + greeting() + ', <em>Admin</em></h1>' +
        '<p class="dash-hero__desc">Here is what the office TV is showing, what is ready to publish, and who to celebrate today.</p>' +
      '</div>' +
      '<div class="dash-hero__actions">' +
        '<button class="btn btn--soft" type="button" data-action="preview">' + icon('eye', { size: 16 }) + 'Preview TV</button>' +
        '<button class="btn btn--primary" type="button" data-action="push">' + icon('send', { size: 16 }) + 'Push to TV</button>' +
      '</div>' +
      '<div class="dash-glance">' + glance.map(function (g) {
        return '<a class="dash-glance__item' + (g.hot ? ' is-hot' : '') + '" href="' + g.href + '">' +
          '<span class="dash-glance__icon">' + icon(g.icon, { size: 15 }) + '</span>' +
          '<strong>' + g.value + '</strong><span>' + U.esc(g.label) + '</span>' +
        '</a>';
      }).join('') + '</div>' +
    '</header>';
  }

  /* ============================ STATS ============================ */

  function statsRow() {
    var emp = S.employees.stats();
    var perf = S.performers.stats();
    var bday = S.birthdays.stats();
    var ann = S.announcements.stats();
    var evt = S.events.stats();
    var tv = S.tv.stats();
    var pending = S.tv.pending();
    var liveContent = ann.active + evt.active;

    return '<div class="dash-stats">' +
      ui.statCard({
        icon: 'users', label: 'Total Employees', value: emp.total, href: '#/employees',
        foot: '<span class="stat__trend">' + icon('check-circle', { size: 13 }) + emp.active + ' active</span>' +
              '<span>· ' + emp.departments + ' depts</span>' +
              meter(pct(emp.active, emp.total), emp.active + ' of ' + emp.total + ' active')
      }) +
      ui.statCard({
        icon: 'trophy', label: 'Top Performers', value: perf.published, href: '#/performers',
        foot: '<span>' + perf.drafts + ' ' + U.pluralize(perf.drafts, 'draft') + ' waiting</span>' +
              meter(pct(perf.published, perf.total), perf.published + ' of ' + perf.total + ' published')
      }) +
      ui.statCard({
        icon: 'cake', label: 'Birthdays Today', value: bday.today, href: '#/birthdays',
        tone: bday.today ? 'lime' : '',
        foot: '<span>' + bday.live + ' on TV · ' + bday.upcoming7 + ' this week</span>' +
              meter(pct(bday.live, bday.today), bday.live + ' of ' + bday.today + ' wishes on TV')
      }) +
      ui.statCard({
        icon: 'megaphone', label: 'Active TV Content', value: liveContent, href: '#/announcements',
        foot: '<span>' + ann.active + ' notices · ' + evt.active + ' ' + U.pluralize(evt.active, 'event') + '</span>' +
              meter(pct(liveContent, ann.total + evt.total), liveContent + ' of ' + (ann.total + evt.total) + ' live')
      }) +
      ui.statCard({
        icon: 'layers', label: 'Published Slides', value: tv.slides, href: '#/tv',
        tone: tv.live ? 'dark' : '',
        badge: tv.live ? ui.badge('live') : ui.badge('inactive', { label: 'Standby' }),
        foot: '<span>' + U.duration(tv.loopSeconds) + ' loop · rev #' + tv.revision + '</span>' +
              meter(pct(tv.slides, Math.max(tv.slides, pending.count)), tv.slides + ' of ' + Math.max(tv.slides, pending.count) + ' slides live')
      }) +
    '</div>';
  }

  /* ============================ NOW PLAYING ============================ */

  function nowPlaying() {
    var tv = S.tv.stats();
    var live = S.tv.liveSlides();
    var pending = S.tv.pending();
    var first = live[0];

    // What the admin should look at next: the live loop, or what a push would send.
    var queue = tv.live && live.length ? live : pending.slides;
    var queueTitle = tv.live && live.length ? 'In the loop' : 'Ready to push';

    var queueHtml = queue.length
      ? '<ol class="dash-queue">' + queue.slice(0, 4).map(function (s, i) {
          return '<li class="dash-queue__item">' +
            '<span class="dash-queue__num">' + U.pad2(i + 1) + '</span>' +
            '<span class="dash-queue__icon">' + icon(SLIDE_ICON[s.type] || 'layers', { size: 14 }) + '</span>' +
            '<span class="dash-queue__label">' + U.esc(s.label) + '</span>' +
            '<span class="dash-queue__dur">' + (s.duration || 0) + 's</span>' +
          '</li>';
        }).join('') + '</ol>' +
        (queue.length > 4 ? '<div class="dash-queue__more">+ ' + (queue.length - 4) + ' more ' + U.pluralize(queue.length - 4, 'slide') + '</div>' : '')
      : '<p class="dash-queue__empty">Nothing is published yet.</p>';

    return '<div class="now-playing dash-now">' +
      '<div class="now-playing__screen dash-room' + (tv.live ? ' is-live' : '') + '">' +
        // A TV set on a wall: the same slides the office screen plays, inside a bezel.
        '<div class="tv-set">' +
          '<div class="tv-set__body">' +
            '<div class="tv-set__screen">' +
              '<div class="slide-stage" data-dash-stage></div>' +
              '<span class="tv-set__glare" aria-hidden="true"></span>' +
            '</div>' +
            '<div class="tv-set__chin">' +
              '<span class="tv-set__brand">Ask<em>EVA</em></span>' +
              '<span class="tv-set__slide" data-dash-slide-label>' + (tv.live ? U.esc(first ? first.label : '') : 'Standby') + '</span>' +
              '<button class="tv-set__btn" type="button" data-action="edit-current" title="Edit the slide on screen">' +
                icon('edit', { size: 11 }) + 'Edit</button>' +
              '<span class="tv-set__power"><i class="tv-set__led"></i>' + (tv.live ? 'On air' : 'Off') + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="tv-set__stand" aria-hidden="true"><i class="tv-set__neck"></i><i class="tv-set__base"></i></div>' +
        '</div>' +
      '</div>' +
      '<div class="now-playing__side dash-now__side">' +
        '<div class="now-playing__eyebrow">' +
          (tv.live ? '<i class="tv-status__dot"></i>Currently showing on TV' : 'Display on standby') +
        '</div>' +
        '<h2 class="now-playing__title">' +
          U.esc(tv.live && first ? first.label : 'Nothing is on the screen') + '</h2>' +
        '<p class="now-playing__desc">' +
          (tv.live
            ? 'The office display is looping ' + tv.slides + ' published ' + U.pluralize(tv.slides, 'slide') + '.'
            : 'Publish content and push it to the TV to start the loop.') +
        '</p>' +
        '<div class="now-playing__stats dash-now__stats">' +
          '<div class="np-stat"><div class="np-stat__k">Slides live</div><div class="np-stat__v">' + tv.slides + '</div></div>' +
          '<div class="np-stat"><div class="np-stat__k">Loop</div><div class="np-stat__v">' + U.esc(U.duration(tv.loopSeconds)) + '</div></div>' +
          '<div class="np-stat"><div class="np-stat__k">Last push</div><div class="np-stat__v np-stat__v--sm">' +
            U.esc(tv.publishedAt ? U.timeAgo(tv.publishedAt) : 'never') + '</div></div>' +
          '<div class="np-stat"><div class="np-stat__k">Pending</div><div class="np-stat__v">' +
            (pending.changed ? '<em>' + pending.count + '</em>' : '0') + '</div></div>' +
        '</div>' +
        '<div class="dash-now__queue">' +
          '<div class="dash-now__queue-head"><span>' + queueTitle + '</span><span>' + queue.length + ' ' + U.pluralize(queue.length, 'slide') + '</span></div>' +
          queueHtml +
        '</div>' +
        '<div class="now-playing__actions">' +
          '<button class="btn btn--primary btn--sm" type="button" data-action="push">' +
            icon('send', { size: 15 }) + (pending.changed ? 'Push changes' : 'Re-push') + '</button>' +
          '<button class="btn btn--soft btn--sm dash-now__ghost" type="button" data-action="preview">' + icon('eye', { size: 15 }) + 'Preview</button>' +
          '<a class="btn btn--soft btn--sm dash-now__ghost" href="#/tv">' + icon('sliders', { size: 15 }) + 'Playlist</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ============================ READY TO PUBLISH ============================ */

  function readyItems() {
    var items = [];

    S.birthdays.today().forEach(function (b) {
      if (b.wish && b.wish.status === 'draft') {
        items.push({ icon: 'cake', title: b.employee.name + '’s birthday', module: 'Birthday wish', status: 'draft', href: '#/birthdays' });
      }
    });
    S.performers.all().forEach(function (p) {
      if (p.status !== 'draft') return;
      items.push({
        icon: 'trophy', title: S.employees.display(p.employeeId).name,
        module: S.performers.periodMeta(p.period).title, status: 'draft', href: '#/performers'
      });
    });
    S.announcements.all().forEach(function (a) {
      if (a.status === 'draft' || a.status === 'scheduled') {
        items.push({ icon: 'megaphone', title: a.title, module: 'Announcement', status: a.status, href: '#/announcements' });
      }
    });
    S.events.all().forEach(function (e) {
      if (e.status === 'draft' || e.status === 'scheduled') {
        items.push({ icon: 'calendar', title: e.title, module: 'Event', status: e.status, href: '#/events' });
      }
    });
    S.achievements.all().forEach(function (a) {
      if (a.status === 'draft') {
        items.push({ icon: 'award', title: a.title, module: 'Achievement', status: 'draft', href: '#/achievements' });
      }
    });
    return items;
  }

  function readyPanel() {
    var items = readyItems();
    var pending = S.tv.pending();

    var body = items.length
      ? '<ul class="dash-list">' + items.slice(0, 5).map(function (it) {
          return '<li><a class="dash-row" href="' + it.href + '">' +
            '<span class="dash-row__icon">' + icon(it.icon, { size: 15 }) + '</span>' +
            '<span class="dash-row__main">' +
              '<span class="dash-row__title">' + U.esc(it.title) + '</span>' +
              '<span class="dash-row__sub">' + U.esc(it.module) + '</span>' +
            '</span>' +
            ui.badge(it.status) +
          '</a></li>';
        }).join('') + '</ul>' +
        (items.length > 5 ? '<div class="dash-list__more">+ ' + (items.length - 5) + ' more waiting</div>' : '')
      : ui.empty({ icon: 'check-circle', title: 'Everything is published', text: 'New drafts from any module will show up here.' });

    return panel({
      icon: 'send', title: 'Ready to Publish', count: items.length,
      sub: 'Drafts and scheduled content', body: body, flush: items.length > 0,
      foot: '<span class="mono muted">' + (pending.changed ? pending.count + ' slides differ from TV' : 'TV is up to date') + '</span>' +
        '<button class="btn btn--xs ' + (pending.changed ? 'btn--primary' : 'btn--soft') + '" type="button" data-action="push">' +
          icon('send', { size: 13 }) + 'Push to TV</button>'
    });
  }

  /* ============================ BIRTHDAYS ============================ */

  function todayPanel() {
    var bdays = S.birthdays.today();
    var next = S.birthdays.upcoming(365)[0];
    var body;

    if (!bdays.length) {
      body = ui.empty({
        icon: 'cake',
        title: 'No birthdays today',
        text: next ? 'Next up: ' + next.employee.name + ' in ' + next.daysUntil + ' ' + U.pluralize(next.daysUntil, 'day') + '.' : 'None scheduled.'
      });
    } else {
      body = '<ul class="dash-list">' + bdays.map(function (b) {
        var status = b.wish
          ? (b.wish.status === 'published' ? ui.badge('live', { label: 'On TV' }) : ui.badge('draft'))
          : ui.badge('inactive', { label: 'No message' });
        return '<li><a class="dash-row dash-row--bday" href="#/birthdays">' +
          ui.avatar(b.employee, { size: 'sm' }) +
          '<span class="dash-row__main">' +
            '<span class="dash-row__title">' + U.esc(b.employee.name) + '</span>' +
            '<span class="dash-row__sub">' + U.esc(b.employee.role || b.employee.department) + '</span>' +
          '</span>' + status +
        '</a></li>';
      }).join('') + '</ul>';
    }

    return panel({
      icon: 'cake', title: 'Today’s Birthdays', count: bdays.length,
      sub: U.formatDay(U.today()), body: body, flush: bdays.length > 0,
      foot: '<span class="mono muted">' + (next ? 'Next: ' + U.esc(next.employee.name.split(' ')[0]) + ' · ' + U.formatDay(next.employee.birthday, true) : 'No upcoming birthdays') + '</span>' +
        '<a class="btn btn--xs btn--soft" href="#/birthdays">Open ' + icon('arrow-right', { size: 13 }) + '</a>'
    });
  }

  /* ============================ PERFORMERS ============================ */

  function performersPanel() {
    var rows = S.performers.PERIODS.map(function (p) {
      var lead = S.performers.lead(p.key);
      if (!lead) {
        return '<li><a class="dash-row" href="#/performers">' +
          '<span class="dash-rank dash-rank--empty">—</span>' +
          '<span class="dash-row__main"><span class="dash-row__title muted">Not set</span>' +
          '<span class="dash-row__sub">' + U.esc(p.title) + '</span></span>' +
          '<span class="btn btn--xs btn--soft">Set</span>' +
        '</a></li>';
      }
      var emp = S.employees.display(lead.employeeId);
      var live = lead.status === 'published';
      return '<li><a class="dash-row" href="#/performers">' +
        '<span class="dash-rank' + (p.key === 'month' ? ' dash-rank--gold' : '') + '">' + ({ day: 'D', week: 'W', month: 'M' }[p.key] || '#') + '</span>' +
        ui.avatar(emp, { size: 'sm' }) +
        '<span class="dash-row__main">' +
          '<span class="dash-row__title">' + U.esc(emp.name) + '</span>' +
          '<span class="dash-row__sub">' + U.esc(p.label) + ' · ' + U.esc(lead.title) + '</span>' +
        '</span>' +
        (live ? ui.badge('live', { label: 'On TV' }) : ui.badge('draft')) +
      '</a></li>';
    }).join('');

    var perf = S.performers.stats();
    return panel({
      icon: 'trophy', title: 'Top Performers',
      sub: 'Day · Week · Month', body: '<ul class="dash-list">' + rows + '</ul>', flush: true,
      foot: '<span class="mono muted">' + perf.published + ' of ' + perf.total + ' cards on TV</span>' +
        '<a class="btn btn--xs btn--soft" href="#/performers">Manage ' + icon('arrow-right', { size: 13 }) + '</a>'
    });
  }

  /* ============================ ACTIVITY ============================ */

  function activityPanel() {
    var rows = S.activity.list(6);
    var body = rows.length
      ? '<div class="activity dash-activity">' + rows.map(function (a) {
          var meta = ACT_ICON[a.type] || ACT_ICON.employee;
          return '<div class="activity__item">' +
            '<span class="activity__icon' + (meta.tone ? ' activity__icon--' + meta.tone : '') + '">' +
              icon(meta.icon, { size: 15 }) + '</span>' +
            '<div class="activity__body">' +
              '<div class="activity__text">' + a.text + '</div>' +
            '</div>' +
            '<div class="activity__time dash-activity__time">' + U.esc(U.timeAgo(a.at)) + '</div>' +
          '</div>';
        }).join('') + '</div>'
      : ui.empty({ icon: 'activity', title: 'No activity yet', text: 'Changes you make will show up here.' });

    return panel({
      icon: 'activity', title: 'Recent Activity',
      sub: 'Everything published from this panel', body: body, flush: rows.length > 0, cls: 'dash-panel--wide'
    });
  }

  /* ============================ COMING UP ============================ */

  function upcomingItems() {
    var today = U.parseISO(U.today());
    var items = [];

    S.birthdays.upcoming(14).forEach(function (b) {
      var d = new Date(today);
      d.setDate(d.getDate() + b.daysUntil);
      items.push({ date: U.toISO(d), days: b.daysUntil, icon: 'cake', title: b.employee.name + '’s birthday', sub: b.employee.department, href: '#/birthdays' });
    });

    S.events.all().forEach(function (e) {
      if (e.status === 'inactive' || !e.startDate || e.startDate <= U.today()) return;
      var days = Math.round((U.parseISO(e.startDate) - today) / 86400000);
      if (days > 30) return;
      items.push({ date: e.startDate, days: days, icon: 'calendar', title: e.title, sub: e.location || e.category, href: '#/events' });
    });

    S.announcements.all().forEach(function (a) {
      if (a.status !== 'scheduled' || !a.startDate || a.startDate <= U.today()) return;
      var days = Math.round((U.parseISO(a.startDate) - today) / 86400000);
      items.push({ date: a.startDate, days: days, icon: 'megaphone', title: a.title, sub: 'Announcement goes live', href: '#/announcements' });
    });

    return items.sort(function (a, b) { return a.days - b.days; });
  }

  function upcomingPanel() {
    var items = upcomingItems();
    var body = items.length
      ? '<ul class="dash-timeline">' + items.slice(0, 6).map(function (it) {
          var d = U.parseISO(it.date);
          return '<li><a class="dash-timeline__item" href="' + it.href + '">' +
            '<span class="dash-date">' +
              '<span class="dash-date__d">' + d.getDate() + '</span>' +
              '<span class="dash-date__m">' + U.monthName(d.getMonth(), true) + '</span>' +
            '</span>' +
            '<span class="dash-row__main">' +
              '<span class="dash-row__title">' + U.esc(it.title) + '</span>' +
              '<span class="dash-row__sub">' + icon(it.icon, { size: 12 }) + U.esc(it.sub || '') + '</span>' +
            '</span>' +
            '<span class="dash-when">' + (it.days === 1 ? 'Tomorrow' : 'In ' + it.days + 'd') + '</span>' +
          '</a></li>';
        }).join('') + '</ul>'
      : ui.empty({ icon: 'calendar', title: 'A quiet fortnight', text: 'No birthdays or events in the next two weeks.' });

    return panel({
      icon: 'calendar', title: 'Coming Up', count: items.length,
      sub: 'Birthdays, events and scheduled posts', body: body, flush: items.length > 0
    });
  }

  /* ============================ PAGE ============================ */

  EVA.pages.dashboard = {
    title: 'Dashboard',

    render: function () {
      return '<div class="dash">' +
        hero() +

        '<div class="section">' + statsRow() + '</div>' +

        '<div class="section">' +
          '<div class="rail-label">Live on the office screen</div>' +
          nowPlaying() +
        '</div>' +

        '<div class="section">' +
          '<div class="rail-label">Needs your attention</div>' +
          '<div class="dash-grid dash-grid--3">' + readyPanel() + todayPanel() + performersPanel() + '</div>' +
        '</div>' +

        '<div class="section">' +
          '<div class="rail-label">Timeline</div>' +
          '<div class="dash-grid dash-grid--wide">' + activityPanel() + upcomingPanel() + '</div>' +
        '</div>' +
      '</div>';
    },

    mount: function (root) {
      var page = EVA.pages.dashboard;

      // Stop timers from the previous render before starting new ones.
      if (page._player) page._player.stop();
      if (page._clock) clearInterval(page._clock);

      var stage = root.querySelector('[data-dash-stage]');
      if (stage) {
        var slides = S.tv.liveSlides();
        var chinLabel = root.querySelector('[data-dash-slide-label]');
        var player = EVA.slides.player(stage, {
          settings: S.settings.get(),
          onChange: function (i, slide, total) {
            if (!chinLabel) return;
            chinLabel.textContent = slide ? U.pad2(i + 1) + '/' + U.pad2(total) + ' · ' + slide.label : 'Standby';
          }
        });
        if (S.tv.isLive() && slides.length) {
          player.load(slides).start();
        } else {
          player.showOff(S.tv.broadcast().live ? 'Nothing published yet' : 'Display stopped');
        }
        page._player = player;
      }

      var clock = root.querySelector('[data-dash-clock] span');
      if (clock) {
        page._clock = setInterval(function () {
          if (!document.body.contains(clock)) {
            clearInterval(page._clock);
            if (page._player) page._player.stop();
            return;
          }
          clock.textContent = U.clockTime();
        }, 15000);
      }

      root.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-action]');
        if (!btn) return;
        var action = btn.dataset.action;

        if (action === 'push') {
          EVA.publish.push({ reason: 'TV updated from the dashboard' })
            .then(function (ok) { if (ok) EVA.app.refresh(); });
        } else if (action === 'preview') {
          EVA.publish.preview({});
        } else if (action === 'edit-current') {
          openCurrentEditor();
        }
      });
    }
  };

  function openCurrentEditor() {
    var player = EVA.pages.dashboard._player;
    var slide = player && player.current;
    if (!slide) {
      ui.toast.info('Nothing to edit', 'Publish content to the TV first.');
      return;
    }

    var match = String(slide.id || '').match(/^sl_(bday|perf|ann|ach)_(.+)$/);
    if (slide.type === 'birthday' && match && EVA.pages.birthdays.openEditor) {
      EVA.pages.birthdays.openEditor(match[2], { onSaved: function () { EVA.app.refresh(); } });
    } else if (slide.type === 'performer' && match && EVA.pages.performers.openForm) {
      EVA.pages.performers.openForm(match[2], null, function () { EVA.app.refresh(); });
    } else if (slide.type === 'announcement' && match && EVA.pages.announcements.openForm) {
      EVA.pages.announcements.openForm(match[2], function () { EVA.app.refresh(); });
    } else if (slide.type === 'achievement' && match && EVA.pages.achievements.openForm) {
      EVA.pages.achievements.openForm(match[2], function () { EVA.app.refresh(); });
    } else {
      ui.toast.info('This content is managed from its module', 'Open its module from the sidebar to edit this slide.');
    }
  }

  function greeting() {
    var h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }
})(window.EVA = window.EVA || {});
