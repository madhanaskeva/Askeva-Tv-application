/* ==========================================================================
   publish.js — the "Push to TV" workflow.
   Edit -> Preview -> Confirm -> Published, in one place so every module
   publishes identically.
   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils;
  var ui = EVA.ui;
  var icon = EVA.icon;
  var tv = function () { return EVA.services.tv; };

  var P = {};

  var TYPE_LABEL = {
    birthday: 'Birthday', performer: 'Top performer',
    announcement: 'Announcement', recognition: 'Recognition', idle: 'Standby'
  };

  /** Small summary block used inside the confirm dialog. */
  function deckSummary(slides) {
    if (!slides.length) {
      return '<div class="empty" style="padding:14px 0">' +
        '<p class="empty__text">Nothing is ready to publish. Publish a birthday wish, a performer or an announcement first.</p></div>';
    }
    var counts = {};
    slides.forEach(function (s) { counts[s.type] = (counts[s.type] || 0) + 1; });
    var loop = slides.reduce(function (t, s) { return t + (s.duration || 0); }, 0);

    var rows = Object.keys(counts).map(function (t) {
      return '<div class="kv"><span class="kv__k">' + U.esc(TYPE_LABEL[t] || t) + '</span>' +
        '<span class="kv__v">' + counts[t] + ' ' + U.pluralize(counts[t], 'slide') + '</span></div>';
    }).join('');

    return rows +
      '<div class="kv"><span class="kv__k">Full loop</span><span class="kv__v">' + U.duration(loop) + '</span></div>' +
      '<div class="kv"><span class="kv__k">First slide</span><span class="kv__v">' + U.esc(U.truncate(slides[0].label, 34)) + '</span></div>';
  }

  /**
   * The confirmation step. Resolves true when the deck was published.
   * P.push({ reason, title, text })
   */
  P.push = function (opts) {
    opts = opts || {};
    var pending = tv().pending();

    if (pending.empty) {
      ui.toast.error('Nothing to publish', 'Publish some content first, then push it to the TV.');
      return Promise.resolve(false);
    }

    return ui.confirm({
      title: opts.title || 'Publish this content to the office TV?',
      html: opts.text
        ? U.esc(opts.text)
        : 'The office display will switch to this deck within a few seconds. ' +
          '<strong>' + pending.count + ' ' + U.pluralize(pending.count, 'slide') + '</strong> will go live.',
      confirmLabel: 'Push to TV',
      icon: 'send',
      preview: deckSummary(pending.slides)
    }).then(function (ok) {
      if (!ok) return false;
      tv().publish({ reason: opts.reason });
      P.success();
      return true;
    });
  };

  /** The "✓ Published Successfully" confirmation panel. */
  P.success = function (o) {
    o = o || {};
    var stats = tv().stats();
    ui.toast.success('Published successfully', 'TV display updated · ' + stats.slides + ' ' + U.pluralize(stats.slides, 'slide') + ' live');

    var ctrl = ui.modal({
      size: 'sm',
      body:
        '<div class="confirm">' +
          '<div class="confirm__icon">' + icon('check', { size: 28 }) + '</div>' +
          '<h2 class="confirm__title">Published Successfully</h2>' +
          '<p class="confirm__text">' + U.esc(o.text || 'TV display updated.') + '</p>' +
          '<div class="confirm__preview">' +
            '<div class="kv"><span class="kv__k">Slides live</span><span class="kv__v">' + stats.slides + '</span></div>' +
            '<div class="kv"><span class="kv__k">Loop length</span><span class="kv__v">' + U.duration(stats.loopSeconds) + '</span></div>' +
            '<div class="kv"><span class="kv__k">Revision</span><span class="kv__v mono">#' + stats.revision + '</span></div>' +
          '</div>' +
        '</div>',
      foot:
        '<button class="btn btn--soft" type="button" data-close>Done</button>' +
        '<a class="btn btn--dark" href="' + U.attr(EVA.services.settings.tvUrl()) + '" target="_blank" rel="noopener">' +
          icon('external-link', { size: 16 }) + 'Open TV Display</a>'
    });

    setTimeout(function () { try { ctrl.close(); } catch (e) { /* already closed */ } }, 4200);
    return ctrl;
  };

  /**
   * Publish a single item, then push the deck.
   * P.item('performers', id, 'Priya Sharma as Top Performer of the Day')
   */
  P.item = function (serviceName, id, label) {
    var svc = EVA.services[serviceName];
    if (!svc || !svc.publish) return Promise.resolve(false);

    return ui.confirm({
      title: 'Publish this content to the office TV?',
      html: label
        ? 'Publishing <strong>' + U.esc(label) + '</strong>. It will be added to the TV playlist and go live immediately.'
        : 'This content will be added to the TV playlist and go live immediately.',
      confirmLabel: 'Push to TV',
      icon: 'send'
    }).then(function (ok) {
      if (!ok) return false;
      svc.publish(id);
      tv().publish({ reason: label ? '<strong>' + U.esc(label) + '</strong> pushed to the TV' : null });
      P.success({ text: label ? U.truncate(label, 60) + ' is now on the office TV.' : 'TV display updated.' });
      return true;
    });
  };

  /**
   * Full-screen-ish preview of what the TV is (or would be) showing.
   * P.preview({ slides, title, autoplay })
   */
  P.preview = function (o) {
    o = o || {};
    var slides = o.slides || tv().buildSlides();
    var settings = EVA.services.settings.get();
    var live = tv().isLive();

    var body =
      '<div class="slide-stage" data-preview-stage></div>' +
      '<div class="preview-meta">' +
        '<div class="preview-dots" data-preview-dots></div>' +
        '<div style="display:flex;gap:7px;align-items:center">' +
          '<button class="btn btn--soft btn--sm btn--icon" type="button" data-prev title="Previous slide">' + icon('chevron-left', { size: 15 }) + '</button>' +
          '<button class="btn btn--soft btn--sm" type="button" data-toggle>' + icon('pause', { size: 15 }) + '<span>Pause</span></button>' +
          '<button class="btn btn--soft btn--sm btn--icon" type="button" data-next title="Next slide">' + icon('chevron-right', { size: 15 }) + '</button>' +
        '</div>' +
      '</div>' +
      '<p class="field__hint" data-preview-label style="margin-top:10px;text-align:center"></p>';

    var foot =
      '<div class="mono muted">' + slides.length + ' ' + U.pluralize(slides.length, 'slide') +
        ' · ' + U.duration(slides.reduce(function (t, s) { return t + (s.duration || 0); }, 0)) + ' loop</div>' +
      '<div style="display:flex;gap:8px">' +
        '<button class="btn btn--soft" type="button" data-close>Close</button>' +
        (o.hidePublish ? '' :
          '<button class="btn btn--primary" type="button" data-publish>' + icon('send', { size: 16 }) +
          (live ? 'Update TV' : 'Push to TV') + '</button>') +
      '</div>';

    return ui.modal({
      size: 'lg',
      title: o.title || (live ? 'Currently on the office TV' : 'TV preview'),
      sub: o.sub || (live ? 'This is exactly what the office screen is showing right now.' : 'This is what will appear after you push to the TV.'),
      icon: 'tv',
      body: body,
      foot: foot,
      footSplit: true,
      onMount: function (ctrl) {
        var stage = ctrl.el.querySelector('[data-preview-stage]');
        var dots = ctrl.el.querySelector('[data-preview-dots]');
        var label = ctrl.el.querySelector('[data-preview-label]');
        var toggle = ctrl.el.querySelector('[data-toggle]');

        var player = EVA.slides.player(stage, {
          settings: settings,
          onChange: function (i, slide, total) {
            if (dots) {
              dots.innerHTML = slides.map(function (_, di) {
                return '<i class="preview-dot' + (di === i ? ' is-active' : '') + '" data-dot="' + di + '"></i>';
              }).join('');
            }
            if (label) {
              label.textContent = slide
                ? (i + 1) + ' / ' + total + '  ·  ' + slide.label + '  ·  ' + slide.duration + 's'
                : 'No slides to show';
            }
          }
        });

        player.load(slides);
        if (o.autoplay !== false && slides.length > 1) player.start();
        else if (slides.length <= 1) {
          toggle.innerHTML = icon('play', { size: 15 }) + '<span>Play</span>';
        }

        ctrl.el.querySelector('[data-next]').addEventListener('click', function () { player.next(); });
        ctrl.el.querySelector('[data-prev]').addEventListener('click', function () { player.prev(); });
        toggle.addEventListener('click', function () {
          if (player.running) {
            player.stop();
            toggle.innerHTML = icon('play', { size: 15 }) + '<span>Play</span>';
          } else {
            player.start();
            toggle.innerHTML = icon('pause', { size: 15 }) + '<span>Pause</span>';
          }
        });
        if (dots) {
          dots.addEventListener('click', function (e) {
            var dot = e.target.closest('[data-dot]');
            if (dot) player.goto(parseInt(dot.dataset.dot, 10));
          });
        }

        var pub = ctrl.el.querySelector('[data-publish]');
        if (pub) {
          pub.addEventListener('click', function () {
            player.stop();
            ctrl.close();
            P.push({ reason: 'TV updated from preview' });
          });
        }

        ctrl.onDestroy = function () { player.destroy(); };
      },
      onClose: function () { /* player is garbage collected with the node */ }
    });
  };

  EVA.publish = P;
})(window.EVA = window.EVA || {});
