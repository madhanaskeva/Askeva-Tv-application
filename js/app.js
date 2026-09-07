/* ==========================================================================
   app.js — shell, hash router, and the render loop.
   Pages register themselves on EVA.pages and expose { render(), mount() }.
   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils;
  var icon = EVA.icon;
  var ui = EVA.ui;

  var NAV = [
    { group: 'Manage' },
    { id: 'dashboard',     label: 'Dashboard',       icon: 'dashboard' },
    { id: 'employees',     label: 'Employees',       icon: 'users' },
    { id: 'performers',    label: 'Top Performers',  icon: 'trophy' },
    { id: 'birthdays',     label: 'Birthday Wishes', icon: 'cake' },
    { id: 'announcements', label: 'Announcements',   icon: 'megaphone' },
    { id: 'events',        label: 'Events',          icon: 'calendar' },
    { id: 'achievements',  label: 'Achievements',    icon: 'sparkles' },
    { group: 'Broadcast' },
    { id: 'tv',            label: 'TV Display',      icon: 'tv' },
    { id: 'settings',      label: 'Settings',        icon: 'settings' }
  ];

  var app = {
    route: { name: 'dashboard', params: [] },
    booted: false,
    _suspend: false
  };

  /* ---------------- routing ---------------- */

  function parseHash() {
    var raw = (window.location.hash || '').replace(/^#\/?/, '');
    var parts = raw.split('/').filter(Boolean);
    var name = parts[0] || 'dashboard';
    if (!EVA.pages[name]) name = 'dashboard';
    return { name: name, params: parts.slice(1) };
  }

  app.go = function (path) {
    window.location.hash = '#/' + String(path).replace(/^#?\/?/, '');
  };

  app.refresh = function () {
    if (app._suspend) return;
    renderPage(true);
  };

  /* ---------------- shell ---------------- */

  function navCounts() {
    return {
      employees: EVA.services.employees.stats().total,
      birthdays: EVA.services.birthdays.stats().today,
      announcements: EVA.services.announcements.stats().active,
      events: EVA.services.events.stats().active,
      performers: EVA.services.performers.stats().published,
      achievements: EVA.services.achievements.stats().published
    };
  }

  function renderSidebar() {
    var counts = navCounts();
    var tvStats = EVA.services.tv.stats();
    var settings = EVA.services.settings.get();
    var name = settings.companyName || 'AskEVA';

    var items = NAV.map(function (n) {
      if (n.group) return '<div class="nav__label">' + U.esc(n.group) + '</div>';
      var active = app.route.name === n.id ? ' is-active' : '';
      var badge = '';
      if (n.id === 'employees' && counts.employees) badge = '<span class="nav__count">' + counts.employees + '</span>';
      if (n.id === 'birthdays' && counts.birthdays) badge = '<span class="nav__count">' + counts.birthdays + '</span>';
      if (n.id === 'announcements' && counts.announcements) badge = '<span class="nav__count">' + counts.announcements + '</span>';
      if (n.id === 'events' && counts.events) badge = '<span class="nav__count">' + counts.events + '</span>';
      if (n.id === 'achievements' && counts.achievements) badge = '<span class="nav__count">' + counts.achievements + '</span>';
      if (n.id === 'tv') badge = tvStats.live ? '<span class="nav__dot" title="Live"></span>' : '';
      return '<a class="nav__item' + active + '" href="#/' + n.id + '">' +
        icon(n.icon) + '<span>' + U.esc(n.label) + '</span>' + badge + '</a>';
    }).join('');

    var statusCls = tvStats.live ? '' : ' is-off';
    var statusLabel = tvStats.live ? 'On Air' : 'Standby';
    var statusTitle = tvStats.live ? EVA.services.tv.currentLabel() : 'Display stopped';
    var statusMeta = tvStats.live
      ? tvStats.slides + ' ' + U.pluralize(tvStats.slides, 'slide') + ' · ' + U.duration(tvStats.loopSeconds) + ' loop'
      : 'Nothing is playing';

    return '<aside class="sidebar" id="sidebar">' +
      '<div class="sidebar__inner">' +
        '<div class="brand">' +
          '<span class="brand__mark">' + icon('tv') + '</span>' +
          '<div class="brand__text">' +
            '<div class="brand__name">' + U.esc(name.replace(/EVA$/i, '')) +
              (/eva$/i.test(name) ? '<em>EVA</em>' : '') + '</div>' +
            '<div class="brand__sub">' + U.esc(settings.tagline || 'Office TV') + '</div>' +
          '</div>' +
        '</div>' +
        '<nav class="nav">' + items + '</nav>' +
        '<div class="sidebar__foot">' +
          '<a class="tv-status' + statusCls + '" href="#/tv">' +
            '<div class="tv-status__row">' +
              '<i class="tv-status__dot"></i>' +
              '<span class="tv-status__label">' + statusLabel + '</span>' +
            '</div>' +
            '<div class="tv-status__title">' + U.esc(statusTitle) + '</div>' +
            '<div class="tv-status__meta">' + icon('layers', { size: 12 }) + '<span>' + U.esc(statusMeta) + '</span></div>' +
          '</a>' +
        '</div>' +
      '</div>' +
    '</aside>' +
    '<div class="sidebar__scrim" id="sidebarScrim"></div>';
  }

  function renderHeader() {
    var page = EVA.pages[app.route.name];
    var pending = EVA.services.tv.pending();
    return '<header class="header">' +
      '<div class="header__inner">' +
        '<button class="icon-btn nav-toggle" id="navToggle" aria-label="Menu">' + icon('menu') + '</button>' +
        '<div class="header__titles">' +
          '<div class="header__title">' + U.esc(page.title) + '</div>' +
          '<div class="header__sub">' + U.esc(U.longDate()) + '</div>' +
        '</div>' +
        '<div class="search">' + icon('search') +
          '<input type="search" id="globalSearch" placeholder="Search employees, announcements…" aria-label="Search">' +
          '<kbd>/</kbd>' +
        '</div>' +
        '<div class="header__actions">' +
          '<a class="btn btn--soft btn--sm" href="' + U.attr(EVA.services.settings.tvUrl()) + '" target="_blank" rel="noopener">' +
            icon('external-link', { size: 15 }) + 'Open TV' +
          '</a>' +
          '<button class="btn btn--primary btn--sm" type="button" data-app-action="push">' +
            icon('send', { size: 15 }) + 'Push to TV' +
          '</button>' +
          '<span class="header__divider"></span>' +
          '<button class="icon-btn" type="button" data-app-action="notifications" aria-label="Pending changes">' +
            icon('bell') + (pending.changed ? '<i class="icon-btn__badge"></i>' : '') +
          '</button>' +
          '<div class="admin-menu">' +
            '<button class="admin-btn" type="button" id="adminBtn" aria-haspopup="true" aria-expanded="false">' +
              '<span class="avatar avatar--dark">AD</span>' +
              '<span class="admin-btn__meta">' +
                '<span class="admin-btn__name">Admin</span>' +
                '<span class="admin-btn__role">Office TV owner</span>' +
              '</span>' + icon('chevron-down') +
            '</button>' +
            '<div class="menu" id="adminMenu" hidden>' +
              '<div class="menu__head"><strong>Admin</strong><span>askeva.aitools26@gmail.com</span></div>' +
              '<a class="menu__item" href="#/settings">' + icon('settings') + 'Settings</a>' +
              '<a class="menu__item" href="' + U.attr(EVA.services.settings.tvUrl()) + '" target="_blank" rel="noopener">' +
                icon('tv') + 'Open TV display</a>' +
              '<button class="menu__item" type="button" data-app-action="preview">' + icon('eye') + 'Preview TV</button>' +
              '<div class="menu__sep"></div>' +
              '<button class="menu__item" type="button" data-app-action="reseed">' + icon('refresh') + 'Reset demo data</button>' +
              '<button class="menu__item is-danger" type="button" data-app-action="signout">' + icon('log-out') + 'Sign out</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</header>';
  }

  function renderShell() {
    var root = document.getElementById('app');
    root.className = 'app';
    root.innerHTML =
      renderSidebar() +
      '<div class="main">' + renderHeader() + '<main class="page" id="pageRoot"></main></div>';
    bindShell();
  }

  /* ---------------- page rendering ---------------- */

  function captureFocus() {
    var el = document.activeElement;
    if (!el || !el.dataset || !el.dataset.focusKey) return null;
    return {
      key: el.dataset.focusKey,
      start: el.selectionStart,
      end: el.selectionEnd
    };
  }

  function restoreFocus(snap) {
    if (!snap) return;
    var el = document.querySelector('[data-focus-key="' + snap.key + '"]');
    if (!el) return;
    el.focus();
    if (snap.start !== null && snap.start !== undefined && el.setSelectionRange) {
      try { el.setSelectionRange(snap.start, snap.end); } catch (e) { /* not a text input */ }
    }
  }

  function renderPage(keepScroll) {
    var page = EVA.pages[app.route.name];
    if (!page) { app.go('dashboard'); return; }

    var scroll = keepScroll ? window.scrollY : 0;
    var focus = keepScroll ? captureFocus() : null;

    // shell chrome depends on live data too
    var sidebar = document.getElementById('sidebar');
    if (sidebar) {
      var wasOpen = sidebar.classList.contains('is-open');
      var wrap = document.createElement('div');
      wrap.innerHTML = renderSidebar();
      var scrim = document.getElementById('sidebarScrim');
      sidebar.replaceWith(wrap.firstElementChild);
      if (scrim) scrim.replaceWith(wrap.lastElementChild);
      if (wasOpen) document.getElementById('sidebar').classList.add('is-open');
    }
    var header = document.querySelector('.header');
    if (header) {
      var hw = document.createElement('div');
      hw.innerHTML = renderHeader();
      header.replaceWith(hw.firstElementChild);
    }
    bindShell();

    var host = document.getElementById('pageRoot');
    var newHost = host.cloneNode(false);
    host.parentNode.replaceChild(newHost, host);
    
    newHost.innerHTML = page.render(app.route.params);
    if (page.mount) page.mount(newHost, app.route.params);

    document.title = page.title + ' · AskEVA Office TV';

    if (keepScroll) {
      window.scrollTo(0, scroll);
      restoreFocus(focus);
    } else {
      window.scrollTo(0, 0);
    }
  }

  /* ---------------- shell events ---------------- */

  function bindShell() {
    var toggle = document.getElementById('navToggle');
    var sidebar = document.getElementById('sidebar');
    var scrim = document.getElementById('sidebarScrim');
    if (toggle && sidebar) {
      toggle.onclick = function () {
        sidebar.classList.toggle('is-open');
        if (scrim) scrim.classList.toggle('is-open');
      };
    }
    if (scrim) {
      scrim.onclick = function () {
        sidebar.classList.remove('is-open');
        scrim.classList.remove('is-open');
      };
    }

    var adminBtn = document.getElementById('adminBtn');
    var adminMenu = document.getElementById('adminMenu');
    if (adminBtn && adminMenu) {
      adminBtn.onclick = function (e) {
        e.stopPropagation();
        adminMenu.hidden = !adminMenu.hidden;
        adminBtn.setAttribute('aria-expanded', String(!adminMenu.hidden));
      };
      document.addEventListener('click', function (e) {
        if (!adminMenu.hidden && !adminMenu.contains(e.target) && e.target !== adminBtn) {
          adminMenu.hidden = true;
          adminBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    var search = document.getElementById('globalSearch');
    if (search) {
      search.onkeydown = function (e) {
        if (e.key === 'Enter' && search.value.trim()) {
          var term = search.value.trim();
          search.value = '';
          if (EVA.pages.employees.setSearch) EVA.pages.employees.setSearch(term);
          app.go('employees');
        }
      };
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-app-action]'), function (el) {
      el.onclick = function () { appAction(el.dataset.appAction); };
    });
  }

  function appAction(action) {
    var menu = document.getElementById('adminMenu');
    if (menu) menu.hidden = true;

    if (action === 'push') {
      EVA.publish.push({ reason: 'TV updated from the header' }).then(function (ok) { if (ok) app.refresh(); });
    } else if (action === 'preview') {
      EVA.publish.preview({});
    } else if (action === 'notifications') {
      showPending();
    } else if (action === 'reseed') {
      ui.confirm({
        title: 'Reset demo data?',
        text: 'Every employee, wish, performer and announcement will be restored to the sample dataset. This cannot be undone.',
        confirmLabel: 'Reset everything',
        tone: 'danger'
      }).then(function (ok) {
        if (!ok) return;
        EVA.store.clearAll();
        ui.toast.success('Demo data restored');
        setTimeout(function () { window.location.reload(); }, 500);
      });
    } else if (action === 'signout') {
      ui.toast.info('Single-admin demo', 'Sign-in is not part of this prototype.');
    }
  }

  function showPending() {
    var p = EVA.services.tv.pending();
    var live = EVA.services.tv.stats();

    var body = p.changed
      ? '<p class="confirm__text" style="text-align:left;margin-bottom:14px">You have content that is not on the office TV yet.</p>' +
        '<div class="kv"><span class="kv__k">Slides ready</span><span class="kv__v">' + p.count + '</span></div>' +
        '<div class="kv"><span class="kv__k">New since last push</span><span class="kv__v">' + p.added + '</span></div>' +
        '<div class="kv"><span class="kv__k">Removed</span><span class="kv__v">' + p.removed + '</span></div>' +
        '<div class="kv"><span class="kv__k">Currently live</span><span class="kv__v">' + live.slides + '</span></div>'
      : ui.empty({
          icon: 'check-circle',
          title: 'The TV is up to date',
          text: 'Everything you have published is already on the office display.'
        });

    ui.modal({
      title: p.changed ? 'Pending changes' : 'TV status',
      sub: live.publishedAt ? 'Last push ' + U.timeAgo(live.publishedAt) : 'Never published',
      icon: 'bell',
      size: 'sm',
      body: body,
      foot: p.changed
        ? '<button class="btn btn--soft" type="button" data-close>Later</button>' +
          '<button class="btn btn--primary" type="button" data-push>' + icon('send', { size: 16 }) + 'Push to TV</button>'
        : '<button class="btn btn--soft" type="button" data-close>Close</button>',
      onMount: function (ctrl) {
        var b = ctrl.el.querySelector('[data-push]');
        if (b) b.onclick = function () {
          ctrl.close();
          EVA.publish.push({}).then(function (ok) { if (ok) app.refresh(); });
        };
      }
    });
  }

  /* ---------------- boot ---------------- */

  function onHashChange() {
    app.route = parseHash();
    renderPage(false);
    var sb = document.getElementById('sidebar');
    var sc = document.getElementById('sidebarScrim');
    if (sb) sb.classList.remove('is-open');
    if (sc) sc.classList.remove('is-open');
  }

  app.boot = function () {
    app.route = parseHash();
    renderShell();
    renderPage(false);
    app.booted = true;

    window.addEventListener('hashchange', onHashChange);

    // Re-render when data changes (including from the TV window or another tab)
    var debounced = U.debounce(function () { app.refresh(); }, 80);
    EVA.store.subscribe(function () { if (app.booted) debounced(); });

    // Keyboard: "/" focuses search, Esc closes overlays
    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      var typing = tag === 'input' || tag === 'textarea' || tag === 'select';
      if (e.key === '/' && !typing) {
        e.preventDefault();
        var s = document.getElementById('globalSearch');
        if (s) s.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        var s2 = document.getElementById('globalSearch');
        if (s2) s2.focus();
      }
    });

    // Auto-publish scheduled announcements whose start date has arrived
    var due = EVA.services.announcements.dueForPublish();
    if (due.length) {
      due.forEach(function (a) { EVA.services.announcements.publish(a.id); });
      ui.toast.info(due.length + ' scheduled ' + U.pluralize(due.length, 'announcement') + ' went live',
        'Push to TV to put them on the screen.');
    }
  };

  EVA.app = app;
  EVA.pages = EVA.pages || {};
})(window.EVA = window.EVA || {});
