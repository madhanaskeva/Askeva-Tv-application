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

  function statsRow() {
    var emp = S.employees.stats();
    var perf = S.performers.stats();
    var bday = S.birthdays.stats();
    var ann = S.announcements.stats();
    var tv = S.tv.stats();

    return '<div class="grid grid--stats">' +
      ui.statCard({
        icon: 'users', label: 'Total Employees', value: emp.total, href: '#/employees',
        foot: '<span class="stat__trend">' + icon('check-circle', { size: 13 }) + emp.active + ' active</span>' +
              '<span>· ' + emp.departments + ' departments</span>'
      }) +
      ui.statCard({
        icon: 'trophy', label: 'Top Performers', value: perf.published, href: '#/performers',
        foot: '<span>' + perf.drafts + ' ' + U.pluralize(perf.drafts, 'draft') + ' waiting</span>'
      }) +
      ui.statCard({
        icon: 'cake', label: 'Birthdays Today', value: bday.today, href: '#/birthdays',
        tone: bday.today ? 'lime' : '',
        foot: '<span>' + bday.upcoming7 + ' in the next 7 days</span>'
      }) +
      ui.statCard({
        icon: 'megaphone', label: 'Active TV Content', value: ann.active, href: '#/announcements',
        foot: '<span>' + ann.scheduled + ' scheduled · ' + ann.drafts + ' ' + U.pluralize(ann.drafts, 'draft') + '</span>'
      }) +
      ui.statCard({
        icon: 'layers', label: 'Published Slides', value: tv.slides, href: '#/tv',
        tone: tv.live ? 'dark' : '',
        badge: tv.live ? ui.badge('live') : ui.badge('inactive', { label: 'Standby' }),
        foot: '<span>' + U.duration(tv.loopSeconds) + ' loop · rev #' + tv.revision + '</span>'
      }) +
    '</div>';
  }





  function nowPlaying() {
    var tv = S.tv.stats();
    var slides = S.tv.liveSlides();
    var pending = S.tv.pending();
    var first = slides[0];

    return '<div class="now-playing">' +
      '<div class="now-playing__screen">' +
        '<div class="slide-stage" data-dash-stage></div>' +
        '<button class="now-playing__edit" type="button" data-action="edit-current" title="Edit current TV content">' +
          icon('edit', { size: 14 }) + 'Edit content</button>' +
      '</div>' +
      '<div class="now-playing__side">' +
        '<div class="now-playing__eyebrow">' +
          (tv.live ? '<i class="tv-status__dot"></i>CURRENTLY SHOWING ON TV' : 'DISPLAY ON STANDBY') +
        '</div>' +
        '<h2 class="now-playing__title">' +
          U.esc(tv.live && first ? first.label : 'Nothing is on the screen') + '</h2>' +
        '<p class="now-playing__desc">' +
          (tv.live
            ? 'The office display is looping ' + tv.slides + ' published ' + U.pluralize(tv.slides, 'slide') + '.'
            : 'Publish content and push it to the TV to start the loop.') +
        '</p>' +
        '<div class="now-playing__stats">' +
          '<div class="np-stat"><div class="np-stat__k">Slides live</div><div class="np-stat__v">' + tv.slides + '</div></div>' +
          '<div class="np-stat"><div class="np-stat__k">Loop length</div><div class="np-stat__v">' + U.esc(U.duration(tv.loopSeconds)) + '</div></div>' +
          '<div class="np-stat"><div class="np-stat__k">Last push</div><div class="np-stat__v" style="font-size:14px">' +
            U.esc(tv.publishedAt ? U.timeAgo(tv.publishedAt) : 'never') + '</div></div>' +
          '<div class="np-stat"><div class="np-stat__k">Pending</div><div class="np-stat__v">' +
            (pending.changed ? '<em>' + pending.count + '</em>' : '0') + '</div></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function todayPanel() {
    var bdays = S.birthdays.today().filter(function (b) { return b.wish && b.wish.status === 'published'; });
    var body;

    if (!bdays.length) {
      body = ui.empty({
        icon: 'cake',
        title: 'No birthdays on TV today',
        text: 'The next one is ' + (S.birthdays.upcoming(365)[0]
          ? U.esc(S.birthdays.upcoming(365)[0].employee.name) + ' in ' + S.birthdays.upcoming(365)[0].daysUntil + ' days.'
          : 'not scheduled.')
      });
    } else {
      body = '<div class="today-strip">' + bdays.map(function (b) {
        var status = ui.badge('live', { label: 'ON TV' });
        return '<div class="today-item today-item--birthday">' +
          ui.avatar(b.employee, { size: 'sm' }) +
          '<div class="person__meta" style="flex:1;min-width:0">' +
            '<div class="person__name">' + U.esc(b.employee.name) + '</div>' +
            '<div class="person__sub">' + U.esc(b.employee.department) + '</div>' +
          '</div>' + status +
          '<a class="btn btn--xs btn--soft" href="#/birthdays">' + icon('arrow-right', { size: 13 }) + '</a>' +
        '</div>';
      }).join('') + '</div>';
    }

    return '<section class="card card--soft">' +
      '<div class="card__head card__head--soft">' +
        '<div><h3 class="card__title">' + icon('cake') + 'Today\'s Birthdays</h3>' +
        '<p class="card__sub">' + U.esc(U.longDate()) + '</p></div>' +
        '<a class="btn btn--xs btn--soft" href="#/birthdays">Open</a>' +
      '</div>' +
      '<div class="card__body' + (bdays.length ? '' : ' card__body--tight') + '">' + body + '</div>' +
    '</section>';
  }

  function performersPanel() {
    var rows = S.performers.PERIODS.map(function (p) {
      var lead = S.performers.lead(p.key);
      if (!lead || lead.status !== 'published') {
        return '';
      }
      var emp = S.employees.display(lead.employeeId);
      return '<div class="lb-row">' +
        '<span class="lb-row__rank">' + U.pad2(lead.rank) + '</span>' +
        ui.avatar(emp, { size: 'sm' }) +
        '<div class="person__meta" style="flex:1;min-width:0">' +
          '<div class="person__name">' + U.esc(emp.name) + '</div>' +
          '<div class="person__sub">' + U.esc(p.label) + ' · ' + U.esc(U.truncate(lead.title, 28)) + '</div>' +
        '</div>' +
        ui.badge('live', { label: 'ON TV' }) +
      '</div>';
    }).filter(Boolean).join('');

    if (!rows) {
      rows = '<div style="padding: 20px; text-align: center; color: #666; font-size: 13px;">No performers on TV</div>';
    }

    return '<section class="card card--soft">' +
      '<div class="card__head card__head--soft">' +
        '<div><h3 class="card__title">' + icon('trophy') + 'Top Performers</h3>' +
        '<p class="card__sub">Day · Week · Month</p></div>' +
        '<a class="btn btn--xs btn--soft" href="#/performers">Manage</a>' +
      '</div>' +
      '<div class="card__body card__body--flush"><div class="leaderboard">' + rows + '</div></div>' +
    '</section>';
  }

  function activityPanel() {
    var rows = S.activity.list(3);
    var body = rows.length
      ? '<div class="activity">' + rows.map(function (a) {
          var meta = ACT_ICON[a.type] || ACT_ICON.employee;
          return '<div class="activity__item">' +
            '<span class="activity__icon' + (meta.tone ? ' activity__icon--' + meta.tone : '') + '">' +
              icon(meta.icon, { size: 15 }) + '</span>' +
            '<div class="activity__body">' +
              '<div class="activity__text">' + a.text + '</div>' +
              '<div class="activity__time">' + U.esc(U.timeAgo(a.at)) + ' · ' + U.esc(a.actor || 'Admin') + '</div>' +
            '</div>' +
          '</div>';
        }).join('') + '</div>'
      : ui.empty({ icon: 'activity', title: 'No activity yet', text: 'Changes you make will show up here.' });

    return '<section class="card card--soft">' +
      '<div class="card__head card__head--soft">' +
        '<div><h3 class="card__title">' + icon('activity') + 'Recent Activity</h3>' +
        '<p class="card__sub">Everything published from this panel</p></div>' +
      '</div>' +
      '<div class="card__body card__body--flush">' + body + '</div>' +
    '</section>';
  }

  function announcementsPanel() {
    var all = S.announcements.all().filter(function(a) { return a.status === 'published' && S.announcements.inWindow(a); });
    var rows = all.slice(0, 3).map(function (a) {
      return '<div class="lb-row">' +
        '<span class="lb-row__rank" style="color: var(--ink);">' + icon('megaphone', { size: 16 }) + '</span>' +
        '<div class="person__meta" style="flex:1;min-width:0">' +
          '<div class="person__name">' + U.esc(U.truncate(a.title, 35)) + '</div>' +
          '<div class="person__sub">' + U.esc(a.category) + (a.startDate ? ' · ' + a.startDate : '') + '</div>' +
        '</div>' +
        ui.badge('live', { label: 'ON TV' }) +
      '</div>';
    }).join('');

    if (!rows) {
       rows = '<div style="padding: 20px; text-align: center; color: #666; font-size: 13px;">No announcements</div>';
    }

    return '<section class="card card--soft">' +
      '<div class="card__head card__head--soft">' +
        '<div><h3 class="card__title">' + icon('megaphone') + 'Announcements</h3>' +
        '<p class="card__sub">Latest company updates</p></div>' +
        '<a class="btn btn--xs btn--soft" href="#/announcements">Manage</a>' +
      '</div>' +
      '<div class="card__body card__body--flush"><div class="leaderboard">' + rows + '</div></div>' +
    '</section>';
  }

  EVA.pages.dashboard = {
    title: 'Dashboard',

    render: function () {
      return '<div class="page__head">' +
          '<div class="page__head-text">' +
            '<h1 class="page__title">Good ' + greeting() + ', Admin</h1>' +
            '<p class="page__desc">Here is what the office TV is showing, what is ready to publish, and who to celebrate today.</p>' +
          '</div>' +
          '<div class="page__actions">' +
            '<button class="btn btn--soft" type="button" data-action="preview">' + icon('eye', { size: 16 }) + 'Preview TV</button>' +
            '<button class="btn btn--primary" type="button" data-action="push">' + icon('send', { size: 16 }) + 'Push to TV</button>' +
          '</div>' +
        '</div>' +

        '<div class="section">' + statsRow() + '</div>' +

        '<div class="section">' +
          '<div class="rail-label">Live on the office screen</div>' +
          nowPlaying() +
        '</div>' +

        '<div class="split">' +
          '<div class="stack">' + activityPanel() + '</div>' +
          '<div class="stack">' + todayPanel() + performersPanel() + announcementsPanel() + '</div>' +
        '</div>';
    },

    mount: function (root) {
      // live mini-preview of the broadcast
      var stage = root.querySelector('[data-dash-stage]');
      if (stage) {
        var slides = S.tv.liveSlides();
        var player = EVA.slides.player(stage, { settings: S.settings.get() });
        if (S.tv.isLive() && slides.length) {
          player.load(slides).start();
        } else {
          player.showOff(S.tv.broadcast().live ? 'Nothing published yet' : 'Display stopped');
        }
        EVA.pages.dashboard._player = player;
      }

      root.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-action]');
        if (!btn) return;
        var action = btn.dataset.action;

        if (action === 'push') {
          EVA.app.go('liveplaylist');
        } else if (action === 'preview') {
          EVA.publish.preview({});
        } else if (action === 'edit-current') {
          EVA.app.go('liveplaylist');
        } else if (action === 'add-employee') {
          EVA.pages.employees.openForm(null, function () { EVA.app.go('employees'); });
        } else if (action === 'add-wish') {
          EVA.app.go('birthdays');
        } else if (action === 'add-performer') {
          EVA.pages.performers.openForm(null, 'day', function () { EVA.app.go('performers'); });
        } else if (action === 'add-announcement') {
          EVA.pages.announcements.openForm(null, function () { EVA.app.go('announcements'); });
        }
      });
    }
  };



  function greeting() {
    var h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }
})(window.EVA = window.EVA || {});
