/* ==========================================================================
   slides.js — renders a broadcast slide.
   Loaded by BOTH the admin panel (preview) and the TV display, so a slide
   always looks identical in the preview and on the office screen.
   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils;
  var icon = EVA.icon;
  var S = {};

  function avatar(data, round) {
    var inner = data.photo
      ? '<img src="' + U.attr(data.photo) + '" alt="">'
      : U.esc(data.initials || U.initials(data.name));
    return '<div class="slide__avatar' + (round ? ' slide__avatar--round' : '') + '">' + inner + '</div>';
  }

  function brand(settings) {
    var name = (settings && settings.companyName) || 'AskEVA';
    return '<div class="slide__brand"><i></i><span>' + U.esc(name) + '</span></div>';
  }

  function confetti(n) {
    var out = '';
    for (var i = 0; i < n; i++) {
      var top = (Math.random() * 90 + 3).toFixed(1);
      var left = (Math.random() * 94 + 3).toFixed(1);
      var rot = Math.floor(Math.random() * 90);
      var op = (Math.random() * 0.35 + 0.18).toFixed(2);
      out += '<i class="confetti" style="top:' + top + '%;left:' + left + '%;transform:rotate(' + rot + 'deg);opacity:' + op + '"></i>';
    }
    return out;
  }

  /* ---------------- per-type renderers ---------------- */

  var RENDER = {
    birthday: function (d, settings) {
      return '<div class="slide slide--birthday">' +
        confetti(14) +
        '<div class="slide__title">' + icon('gift', { size: 44 }) + 'HAPPY BIRTHDAY</div>' +
        avatar(d, true) +
        '<div class="slide__name">' + U.esc(d.name) + '</div>' +
        '<div class="slide__role">' + U.esc(d.role || '') +
          (d.department ? ' · <em>' + U.esc(d.department) + '</em>' : '') + '</div>' +
        (d.message ? '<p class="slide__quote">' + U.esc(d.message) + '</p>' : '') +
        brand(settings) +
      '</div>';
    },

    performer: function (d, settings) {
      return '<div class="slide slide--performer">' +
        '<div class="slide__kicker">' + U.esc(d.periodTitle || 'Top Performer') + '</div>' +
        '<div class="slide__rank"><sup>#</sup>' + U.pad2(d.rank || 1) + '</div>' +
        '<div class="slide__name">' + U.esc(d.name) + '</div>' +
        '<div class="slide__role">' + U.esc(d.role || '') +
          (d.department ? ' · <em>' + U.esc(d.department) + '</em>' : '') + '</div>' +
        (d.title ? '<div class="slide__achv">' + icon('trophy', { size: 26 }) + U.esc(d.title) + '</div>' : '') +
        (d.description ? '<p class="slide__quote">' + U.esc(d.description) + '</p>' : '') +
        brand(settings) +
      '</div>';
    },

    announcement: function (d, settings) {
      var urgent = d.priority === 'urgent' ? ' slide--urgent' : '';
      return '<div class="slide slide--announcement' + urgent + '">' +
        '<div class="slide__kicker">' +
          (d.priority === 'urgent' ? icon('alert-triangle', { size: 20 }) : icon('megaphone', { size: 20 })) +
          U.esc(d.category || 'Announcement') + '</div>' +
        (d.image ? '<div class="slide__media"><img src="' + U.attr(d.image) + '" alt=""></div>' : '') +
        '<h1 class="slide__title">' + U.esc(d.title) + '</h1>' +
        (d.text ? '<p class="slide__text">' + U.esc(d.text) + '</p>' : '') +
        brand(settings) +
      '</div>';
    },

    recognition: function (d, settings) {
      var cards = (d.people || []).map(function (p) {
        return '<div class="recog-card">' +
          '<div class="recog-card__avatar">' +
            (p.photo ? '<img src="' + U.attr(p.photo) + '" alt="">' : U.esc(p.initials || U.initials(p.name))) +
          '</div>' +
          '<div class="recog-card__name">' + U.esc(p.name) + '</div>' +
          '<div class="recog-card__role">' + U.esc(p.role || '') + '</div>' +
          (p.tag ? '<div class="recog-card__tag">' + U.esc(p.tag) + '</div>' : '') +
        '</div>';
      }).join('');
      return '<div class="slide slide--recognition">' +
        '<div class="slide__kicker slide__kicker--ghost">Employee Recognition</div>' +
        '<h2 class="slide__title">' + U.esc(d.title || 'Recognised this month') + '</h2>' +
        '<div class="recog-row">' + cards + '</div>' +
        brand(settings) +
      '</div>';
    },

    event: function (d, settings) {
      return '<div class="slide slide--event' + (d.priority === 'urgent' ? ' slide--urgent' : '') + '">' +
        '<div class="slide__kicker' + (d.priority === 'urgent' ? '' : ' slide__kicker--ghost') + '">' +
          icon('calendar', { size: 20 }) + U.esc(d.category) + '</div>' +
        (d.image ? '<div class="slide__media"><img src="' + U.attr(d.image) + '" alt=""></div>' : '') +
        '<div class="slide__title">' + U.esc(d.title) + '</div>' +
        (d.text ? '<div class="slide__text">' + U.esc(d.text) + '</div>' : '') +
        (d.location ? '<div class="slide__meta-row" style="margin-top: 3cqi; color: #C7F53F; font-size: 3cqi; display: flex; align-items: center; justify-content: center; gap: 1cqi; font-weight: bold;">' + icon('map-pin', { size: 24 }) + ' ' + U.esc(d.location) + '</div>' : '') +
        (d.startDate ? '<div class="slide__meta-row" style="margin-top: 1cqi; color: rgba(255,255,255,0.7); font-size: 2.5cqi; display: flex; align-items: center; justify-content: center; gap: 1cqi;">' + icon('clock', { size: 20 }) + ' ' + U.esc(U.formatDate(d.startDate, true)) + '</div>' : '') +
        brand(settings) +
      '</div>';
    },

    achievement: function (d, settings) {
      return '<div class="slide slide--achievement">' +
        confetti(14) +
        '<div class="slide__kicker">' + icon('award', { size: 20 }) + U.esc(d.type) + '</div>' +
        '<div class="slide__name">' + U.esc(d.name) + '</div>' +
        '<div class="slide__role">' + U.esc(d.role || '') +
          (d.department ? ' · <em>' + U.esc(d.department) + '</em>' : '') + '</div>' +
        (d.title ? '<div class="slide__achv">' + icon('sparkles', { size: 26 }) + U.esc(d.title) + '</div>' : '') +
        (d.description ? '<p class="slide__quote">' + U.esc(d.description) + '</p>' : '') +
        brand(settings) +
      '</div>';
    },

    idle: function (d, settings) {
      var name = d.companyName || (settings && settings.companyName) || 'AskEVA';
      return '<div class="slide slide--idle">' +
        '<div class="slide__logo">' + U.esc(name.replace(/EVA$/i, '')) + '<em>' +
          (/eva$/i.test(name) ? 'EVA' : '') + '</em></div>' +
        '<div class="slide__msg">' + U.esc(d.tagline || 'Office TV') + '</div>' +
        '<div class="slide__clock" data-live-clock>' + U.clockTime() + '</div>' +
      '</div>';
    }
  };

  /** Render one slide object to HTML. */
  S.render = function (slide, settings) {
    if (!slide) return S.offCard();
    var fn = RENDER[slide.type];
    if (!fn) return S.offCard('Unsupported slide');
    return fn(slide.data || {}, settings);
  };

  /** The "nothing is playing" card. */
  S.offCard = function (msg) {
    return '<div class="slide slide--off">' +
      '<div class="slide__icon">' + icon('tv', { size: 80 }) + '</div>' +
      '<div class="slide__msg">' + U.esc(msg || 'Display stopped') + '</div>' +
    '</div>';
  };

  S.emptyCard = function () {
    return '<div class="slide slide--off">' +
      '<div class="slide__icon">' + icon('inbox', { size: 80 }) + '</div>' +
      '<div class="slide__msg">Nothing published yet</div>' +
    '</div>';
  };

  /* ==========================================================================
     Player — rotates a deck inside a .slide-stage element.
     Used by the admin preview and by the TV display.
     ========================================================================== */
  S.player = function (stage, opts) {
    opts = opts || {};
    var slides = [];
    var index = 0;
    var timer = null;
    var running = false;
    var settings = opts.settings || null;

    function paint(nextIndex, direction) {
      var old = stage.querySelector('.slide');
      var slide = slides[nextIndex];
      var html = slide ? S.render(slide, settings) : (opts.emptyHtml || S.emptyCard());
      var wrap = document.createElement('div');
      wrap.innerHTML = html;
      var el = wrap.firstElementChild;
      el.classList.add('is-entering');
      stage.appendChild(el);
      if (old) {
        old.classList.add('is-leaving');
        setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 450);
      }
      if (opts.onChange) opts.onChange(nextIndex, slide, slides.length, direction);
    }

    function schedule() {
      clearTimeout(timer);
      if (!running || slides.length === 0) return;
      var secs = (slides[index] && slides[index].duration) || 10;
      if (opts.speed) secs = secs / opts.speed;
      timer = setTimeout(function () { api.next(); }, Math.max(1200, secs * 1000));
    }

    var api = {
      get index() { return index; },
      get length() { return slides.length; },
      get current() { return slides[index] || null; },
      get running() { return running; },

      setSettings: function (s) { settings = s; },

      /** Load a deck. Keeps position when the deck is unchanged. */
      load: function (next, keepPosition) {
        var same = JSON.stringify(next) === JSON.stringify(slides);
        slides = next || [];
        if (!same || !keepPosition) {
          index = Math.min(index, Math.max(0, slides.length - 1));
          if (!keepPosition) index = 0;
          paint(index, 'load');
        }
        if (running) schedule();
        return api;
      },

      start: function () {
        running = true;
        if (!stage.querySelector('.slide')) paint(index, 'start');
        schedule();
        return api;
      },

      stop: function () {
        running = false;
        clearTimeout(timer);
        return api;
      },

      showOff: function (msg) {
        api.stop();
        var old = stage.querySelector('.slide');
        if (old) old.remove();
        stage.innerHTML = S.offCard(msg);
        if (opts.onChange) opts.onChange(-1, null, slides.length, 'off');
        return api;
      },

      next: function () {
        if (!slides.length) return api;
        index = (index + 1) % slides.length;
        paint(index, 'next');
        schedule();
        return api;
      },

      prev: function () {
        if (!slides.length) return api;
        index = (index - 1 + slides.length) % slides.length;
        paint(index, 'prev');
        schedule();
        return api;
      },

      goto: function (i) {
        if (!slides.length) return api;
        index = U.clamp(i, 0, slides.length - 1);
        paint(index, 'goto');
        schedule();
        return api;
      },

      destroy: function () { api.stop(); stage.innerHTML = ''; }
    };

    return api;
  };

  EVA.slides = S;
})(window.EVA = window.EVA || {});
