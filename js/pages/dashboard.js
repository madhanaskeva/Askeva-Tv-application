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
        '<div class="now-playing__actions">' +
          '<button class="btn btn--primary btn--sm" type="button" data-action="push">' +
            icon('send', { size: 15 }) + (pending.changed ? 'Push changes to TV' : 'Re-push to TV') + '</button>' +
          '<button class="btn btn--soft btn--sm" type="button" data-action="preview">' +
            icon('eye', { size: 15 }) + 'Preview</button>' +
          '<a class="btn btn--soft btn--sm" href="#/tv">' + icon('sliders', { size: 15 }) + 'Manage</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function quickActions() {
    var items = [
      { action: 'add-employee', icon: 'user-plus', label: 'Add Employee', sub: 'New directory entry' },
      { action: 'add-wish', icon: 'cake', label: 'Add Birthday Wish', sub: 'Write a message' },
      { action: 'add-performer', icon: 'trophy', label: 'Add Top Performer', sub: 'Recognise someone' },
      { action: 'add-announcement', icon: 'megaphone', label: 'Create Announcement', sub: 'Notice or event' },
      { action: 'push', icon: 'send', label: 'Push to TV', sub: 'Publish the deck', accent: true }
    ];
    return '<div class="qa-grid">' + items.map(function (i) {
      return '<button class="qa' + (i.accent ? ' qa--accent' : '') + '" type="button" data-action="' + i.action + '">' +
        '<span class="qa__icon">' + icon(i.icon) + '</span>' +
        '<span><span class="qa__label">' + U.esc(i.label) + '</span>' +
        '<span class="qa__sub">' + U.esc(i.sub) + '</span></span>' +
      '</button>';
    }).join('') + '</div>';
  }

  function todayPanel() {
    var bdays = S.birthdays.today();
    var body;

    if (!bdays.length) {
      body = ui.empty({
        icon: 'cake',
        title: 'No birthdays today',
        text: 'The next one is ' + (S.birthdays.upcoming(365)[0]
          ? U.esc(S.birthdays.upcoming(365)[0].employee.name) + ' in ' + S.birthdays.upcoming(365)[0].daysUntil + ' days.'
          : 'not scheduled.')
      });
    } else {
      body = '<div class="today-strip">' + bdays.map(function (b) {
        var status = b.wish
          ? (b.wish.status === 'published' ? ui.badge('live', { label: 'On TV' }) : ui.badge('draft'))
          : ui.badge('inactive', { label: 'No message' });
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
      if (!lead) {
        return '<div class="lb-row">' +
          '<span class="lb-row__rank">—</span>' +
          '<div class="person__meta" style="flex:1"><div class="person__name muted">Not set</div>' +
          '<div class="person__sub">' + U.esc(p.title) + '</div></div>' +
          '<a class="btn btn--xs btn--soft" href="#/performers">Set</a>' +
        '</div>';
      }
      var emp = S.employees.display(lead.employeeId);
      return '<div class="lb-row">' +
        '<span class="lb-row__rank">' + U.pad2(lead.rank) + '</span>' +
        ui.avatar(emp, { size: 'sm' }) +
        '<div class="person__meta" style="flex:1;min-width:0">' +
          '<div class="person__name">' + U.esc(emp.name) + '</div>' +
          '<div class="person__sub">' + U.esc(p.label) + ' · ' + U.esc(U.truncate(lead.title, 28)) + '</div>' +
        '</div>' +
        ui.badge(lead.status === 'published' ? 'live' : 'draft', lead.status === 'published' ? { label: 'On TV' } : {}) +
      '</div>';
    }).join('');

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
    var rows = S.activity.list(8);
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

        '<div class="section">' +
          '<div class="rail-label">Quick actions</div>' +
          quickActions() +
        '</div>' +

        '<div class="split">' +
          '<div class="stack">' + activityPanel() + '</div>' +
          '<div class="stack">' + todayPanel() + performersPanel() + '</div>' +
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
          EVA.publish.push({ reason: 'TV updated from the dashboard' })
            .then(function (ok) { if (ok) EVA.app.refresh(); });
        } else if (action === 'preview') {
          EVA.publish.preview({});
        } else if (action === 'edit-current') {
          openCurrentEditor();
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
      ui.toast.info('This content is managed from its module', 'Open Content Media to edit this slide.');
    }
  }

  function greeting() {
    var h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }
})(window.EVA = window.EVA || {});
