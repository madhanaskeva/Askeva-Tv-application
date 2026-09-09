/* ==========================================================================
   pages/tv.js — Live Playlist view
   ==========================================================================
   Shows the current TV queue in a form that matches the mock: a dark local
   sidebar on the left and a stack of reorderable playlist cards on the right.
   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils, ui = EVA.ui, icon = EVA.icon;
  var S = EVA.services;

  function deckSlides() {
    var live = S.tv.liveSlides();
    var pending = S.tv.pending().slides;
    var deck = live.length ? live : pending;
    return deck.slice(0, 5);
  }

  function typeLabel(type) {
    var map = {
      birthday: 'BIRTHDAY',
      performer: 'NOTICE',
      announcement: 'ANNOUNCEMENT',
      recognition: 'CONVERSION',
      event: 'EVENT',
      achievement: 'ACHIEVEMENT',
      idle: 'STANDBY'
    };
    return map[type] || U.titleCase(type || 'Slide');
  }

  function headline(slide) {
    if (!slide) return '';
    var d = slide.data || {};
    if (slide.type === 'birthday') return 'Happy Birthday, ' + (d.name || 'Employee') + '!';
    if (slide.type === 'performer') return d.title || slide.label || 'Top Performer';
    if (slide.type === 'announcement') return d.title || slide.label || 'Announcement';
    if (slide.type === 'recognition') return d.title || slide.label || 'Employee Recognition';
    if (slide.type === 'event') return d.title || slide.label || 'Event';
    if (slide.type === 'achievement') return d.title || slide.label || 'Achievement';
    if (slide.type === 'idle') return d.companyName || 'AskEVA Standby Card';
    return slide.label || 'Slide';
  }

  function subline(slide) {
    if (!slide) return '';
    var d = slide.data || {};
    if (slide.type === 'birthday') return d.role || d.department || 'Office milestone';
    if (slide.type === 'performer') return d.periodLabel || d.department || 'Top performer';
    if (slide.type === 'announcement') return d.category || 'Notice';
    if (slide.type === 'recognition') return d.title || 'Recognition';
    if (slide.type === 'event') return d.location || d.category || 'Upcoming event';
    if (slide.type === 'achievement') return d.type || 'Achievement';
    if (slide.type === 'idle') return d.tagline || 'Office TV';
    return d.department || d.role || '';
  }

  function renderNavItem(item, active, count) {
    var cls = 'live-nav__item' + (active ? ' is-active' : '') + (item.muted ? ' is-muted' : '');
    var body = '<span class="live-nav__icon">' + icon(item.icon, { size: 16 }) + '</span>' +
      '<span class="live-nav__label">' + U.esc(item.label) + '</span>' +
      (count ? '<span class="live-nav__count">' + U.esc(String(count)) + '</span>' : '');

    if (item.href) {
      return '<a class="' + cls + '" href="' + U.attr(item.href) + '">' + body + '</a>';
    }
    return '<button class="' + cls + '" type="button" data-live-nav="' + U.attr(item.action || item.label) + '">' + body + '</button>';
  }

  function renderRow(slide, index) {
    var tag = typeLabel(slide.type);
    return '<article class="pl-card" draggable="true" data-live-item data-slide-id="' + U.attr(slide.id) + '">' +
      '<div class="pl-card__controls">' +
        '<button class="pl-card__move" type="button" data-move="up" aria-label="Move up">' + icon('arrow-up', { size: 13 }) + '</button>' +
        '<div class="pl-card__num" data-live-num>' + (index + 1) + '</div>' +
        '<button class="pl-card__move" type="button" data-move="down" aria-label="Move down">' + icon('arrow-down', { size: 13 }) + '</button>' +
      '</div>' +
      '<div class="pl-card__grip" title="Drag to reorder">' + icon('grip', { size: 16 }) + '</div>' +
      '<div class="pl-card__accent"></div>' +
      '<div class="pl-card__body">' +
        '<div class="pl-card__tag">' + U.esc(tag) + '</div>' +
        '<h3 class="pl-card__title">' + U.esc(headline(slide)) + '</h3>' +
        '<p class="pl-card__sub">' + U.esc(subline(slide)) + '</p>' +
      '</div>' +
      '<div class="pl-card__actions">' +
        '<button class="pl-card__icon" type="button" data-action="preview" aria-label="Preview slide">' + icon('eye', { size: 16 }) + '</button>' +
        '<button class="pl-card__icon" type="button" data-action="remove" aria-label="Remove slide">' + icon('trash', { size: 16 }) + '</button>' +
      '</div>' +
    '</article>';
  }

  function renderDeck() {
    var slides = deckSlides();
    if (!slides.length) {
      return ui.empty({
        icon: 'tv',
        title: 'No slides are broadcasting yet',
        text: 'Publish some content and push it to the TV to build the live playlist.'
      });
    }
    return '<div class="pl-stack" data-playlist-host>' +
      slides.map(function (slide, i) { return renderRow(slide, i); }).join('') +
    '</div>';
  }

  function localNav() {
    var deck = deckSlides();
    return '<aside class="live-nav" aria-label="Live Playlist navigation">' +
      '<div class="live-nav__head">' +
        '<div class="live-nav__title">Navigation</div>' +
        '<div class="live-nav__desc">Quick access to the core office-TV modules.</div>' +
      '</div>' +
      '<div class="live-nav__list">' +
        renderNavItem({ label: 'Dashboard', href: '#/dashboard', icon: 'dashboard' }) +
        renderNavItem({ label: 'Live Playlist', href: '#/tv', icon: 'list' }, true, deck.length) +
        renderNavItem({ label: 'Directory', href: '#/employees', icon: 'users' }, false, S.employees.stats().total) +
        renderNavItem({ label: 'Best Performer', href: '#/performers', icon: 'trophy' }) +
        renderNavItem({ label: 'Notices & Holidays', href: '#/announcements', icon: 'megaphone' }) +
      '</div>' +
    '</aside>';
  }

  function renumber(host) {
    var rows = Array.prototype.slice.call(host.querySelectorAll('[data-live-item]'));
    rows.forEach(function (row, i) {
      row.dataset.order = String(i);
      var num = row.querySelector('[data-live-num]');
      if (num) num.textContent = String(i + 1);
      var up = row.querySelector('[data-move="up"]');
      var down = row.querySelector('[data-move="down"]');
      if (up) up.disabled = i === 0;
      if (down) down.disabled = i === rows.length - 1;
    });
    return rows;
  }

  function moveRow(row, dir) {
    var host = row.parentNode;
    var rows = renumber(host);
    var i = rows.indexOf(row);
    if (i < 0) return;
    var nextIndex = i + dir;
    if (nextIndex < 0 || nextIndex >= rows.length) return;
    var ref = dir < 0 ? row.previousElementSibling : row.nextElementSibling;
    if (dir < 0 && ref) host.insertBefore(row, ref);
    if (dir > 0 && ref) host.insertBefore(ref, row);
    renumber(host);
  }

  function slideById(id) {
    return deckSlides().filter(function (s) { return s.id === id; })[0] || null;
  }

  EVA.pages.tv = {
    title: 'Live Playlist',

    render: function () {
      var deck = deckSlides();
      return '<div class="live-playlist-page">' +
        localNav() +
        '<div class="live-playlist-main">' +
          '<div class="page__head live-playlist-head">' +
            '<div class="page__head-text">' +
              '<h1 class="page__title">Live Playlist</h1>' +
              '<p class="page__desc">' + U.esc(deck.length) + ' ' + U.pluralize(deck.length, 'slide') + ' broadcasting on TV - drag or use arrows to reorder.</p>' +
            '</div>' +
            '<div class="page__actions">' +
              '<button class="btn btn--soft" type="button" data-action="preview-all">' + icon('eye', { size: 16 }) + 'Preview deck</button>' +
              '<button class="btn btn--primary" type="button" data-action="push">' + icon('send', { size: 16 }) + 'Push to TV</button>' +
            '</div>' +
          '</div>' +
          '<div class="section">' +
            '<div class="live-playlist-board">' +
              renderDeck() +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    },

    mount: function (root) {
      var host = root.querySelector('[data-playlist-host]');

      root.addEventListener('click', function (e) {
        var action = e.target.closest('[data-action]');
        if (action) {
          var act = action.dataset.action;
          if (act === 'push') {
            EVA.publish.push({ reason: 'TV updated from Live Playlist' }).then(function (ok) {
              if (ok) EVA.app.refresh();
            });
          } else if (act === 'preview-all') {
            EVA.publish.preview({ title: 'Live Playlist', slides: deckSlides() });
          } else if (act === 'preview' || act === 'remove') {
            var row = e.target.closest('[data-live-item]');
            var slide = row ? slideById(row.dataset.slideId) : null;
            if (!slide) return;
            if (act === 'preview') {
              EVA.publish.preview({ title: 'Preview slide', slides: [slide] });
            } else {
              ui.confirm({
                title: 'Remove this row from the live preview?',
                text: 'This only updates the local playlist mock for now. Publish changes when you are happy with the order.',
                confirmLabel: 'Remove row',
                tone: 'danger'
              }).then(function (ok) {
                if (!ok || !row || !row.parentNode) return;
                row.parentNode.removeChild(row);
                if (host) renumber(host);
              });
            }
          }
        }

        var move = e.target.closest('[data-move]');
        if (move) {
          var row2 = e.target.closest('[data-live-item]');
          if (!row2) return;
          moveRow(row2, move.dataset.move === 'up' ? -1 : 1);
        }
      });

      if (host) {
        renumber(host);
        host.addEventListener('dragstart', function (e) {
          var row = e.target.closest('[data-live-item]');
          if (!row) return;
          row.classList.add('is-dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', row.dataset.slideId || '');
        });
        host.addEventListener('dragend', function (e) {
          var row = e.target.closest('[data-live-item]');
          if (row) row.classList.remove('is-dragging');
          Array.prototype.forEach.call(host.querySelectorAll('.is-over'), function (el) { el.classList.remove('is-over'); });
        });
        host.addEventListener('dragover', function (e) {
          var over = e.target.closest('[data-live-item]');
          if (!over) return;
          e.preventDefault();
          var dragging = host.querySelector('.is-dragging');
          if (!dragging || dragging === over) return;
          var rect = over.getBoundingClientRect();
          var before = (e.clientY - rect.top) < (rect.height / 2);
          host.insertBefore(dragging, before ? over : over.nextSibling);
          Array.prototype.forEach.call(host.querySelectorAll('.is-over'), function (el) { el.classList.remove('is-over'); });
          over.classList.add('is-over');
          renumber(host);
        });
        host.addEventListener('dragleave', function (e) {
          var row = e.target.closest('[data-live-item]');
          if (row) row.classList.remove('is-over');
        });
      }
    }
  };
})(window.EVA = window.EVA || {});
