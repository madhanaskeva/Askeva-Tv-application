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

  function logoTile(company) {
    return '<b class="slide-logo"><img src="assets/askeva%20logo.jfif" alt="' + U.attr(company) + ' logo" onerror="this.remove()">' +
      U.esc(String(company).charAt(0).toUpperCase()) + '</b>';
  }

  /* Laurel wreath: leaves placed along the left arc, mirrored for the right. */
  var PERF_LAUREL = (function () {
    function branch() {
      var R = 88, out = '';
      out += '<path d="M' + pt(112, R).join(' ') + ' A' + R + ' ' + R + ' 0 0 1 ' + pt(242, R).join(' ') +
        '" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>';
      for (var i = 0; i < 9; i++) {
        var a = 116 + i * 15;
        var size = 1 - i * 0.045;
        [[R + 8, -32], [R - 8, 32]].forEach(function (leaf, j) {
          var p = pt(a + (j ? 7 : 0), leaf[0]);
          out += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="' + (11 * size).toFixed(1) + '" ry="' + (4.4 * size).toFixed(1) +
            '" transform="rotate(' + (a + 90 + leaf[1]) + ' ' + p[0] + ' ' + p[1] + ')" fill="currentColor" opacity="' + (j ? .7 : .95) + '"/>';
        });
      }
      return out;
    }
    function pt(deg, r) {
      var rad = deg * Math.PI / 180;
      return [(100 + r * Math.cos(rad)).toFixed(1), (100 + r * Math.sin(rad)).toFixed(1)];
    }
    var b = branch();
    return '<svg class="perf-slide__laurel" viewBox="0 0 200 200" aria-hidden="true">' +
      '<g>' + b + '</g><g transform="translate(200 0) scale(-1 1)">' + b + '</g></svg>';
  })();

  var PERF_STARS = [
    [50, 1, 3.4], [37, 5, 2.1], [63, 5, 2.1], [26, 13, 1.4], [74, 13, 1.4]
  ].map(function (s) {
    return '<span class="perf-slide__star" style="left:' + s[0] + '%;top:' + s[1] + '%;width:' + s[2] + 'cqi;height:' + s[2] + 'cqi">' +
      EVA.icon('star', { size: 24 }) + '</span>';
  }).join('');

  /* Two-layer city skyline along the bottom edge. */
  var PERF_SKYLINE = (function () {
    function layer(heights, width, cls) {
      var x = 0, d = 'M0 120';
      heights.forEach(function (h, i) {
        var w = width[i % width.length];
        d += ' L' + x + ' ' + (120 - h) + ' L' + (x + w) + ' ' + (120 - h);
        x += w;
      });
      return '<path class="' + cls + '" d="' + d + ' L' + x + ' 120 Z"/>';
    }
    return '<svg class="perf-slide__skyline" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">' +
      layer([40, 72, 55, 96, 60, 110, 48, 80, 66, 102, 52, 88, 44, 76, 98, 58, 84, 50, 70, 92, 46, 64], [44, 36, 52, 30, 48, 40], 'is-back') +
      layer([26, 44, 34, 58, 30, 50, 38, 62, 28, 46, 36, 54, 24, 42, 56, 32, 48, 30, 40, 52, 34, 44, 28, 38], [40, 46, 34, 52, 38], 'is-front') +
    '</svg>';
  })();

  function confetti(n, template) {
    var out = '';
    var color = U.attr(template.particleColor || template.accentColor || '#C7F53F');
    var opacity = Math.max(0, Math.min(1, template.particleOpacity === undefined ? 0.5 : Number(template.particleOpacity)));
    var speed = Math.max(4, Math.min(60, template.particleSpeed === undefined ? 18 : Number(template.particleSpeed)));
    for (var i = 0; i < n; i++) {
      var top = (Math.random() * 90 + 3).toFixed(1);
      var left = (Math.random() * 94 + 3).toFixed(1);
      var rot = Math.floor(Math.random() * 90);
      var delay = (-Math.random() * speed).toFixed(2);
      var drift = (Math.random() * 3 - 1.5).toFixed(2);
      var op = (Math.random() * opacity * 0.7 + opacity * 0.3).toFixed(2);
      out += '<i class="confetti" style="top:' + top + '%;left:' + left + '%;--particle-drift:' + drift + 'cqi;--particle-delay:' + delay + 's;--particle-opacity:' + op + ';--particle-rotation:' + rot + 'deg;background:' + color + ';animation-duration:' + speed + 's"></i>';
    }
    return out;
  }

  /* ---------------- per-type renderers ---------------- */

  var RENDER = {
    birthday: function (d, settings) {
      var company = (settings && settings.companyName) || 'AskEVA';
      var t = (settings && settings.birthdayTemplate) || {};
      var escStyle = function (value) { return U.attr(value || ''); };
      var style = '--birthday-bg:' + escStyle(t.backgroundColor || '#08150E') + ';' +
        '--birthday-bg-alt:' + escStyle(t.backgroundAccent || '#163524') + ';' +
        '--birthday-accent:' + escStyle(t.accentColor || '#C7F53F') + ';' +
        '--birthday-text:' + escStyle(t.textColor || '#FFFFFF') + ';' +
        '--birthday-muted:' + escStyle(t.mutedColor || '#A7B1AA') + ';' +
        '--birthday-panel:' + escStyle(t.panelColor || '#10281B') + ';';
      return '<div class="slide slide--birthday" data-theme="' + U.attr(t.backgroundTheme || 'midnight') + '" style="' + style + '">' +
        confetti(Math.max(0, Math.min(50, t.particleCount === undefined ? 14 : Number(t.particleCount))), t) +
        '<div class="birthday__topline">' +
          '<span class="birthday__brand"><b class="birthday__logo">' +
            '<img src="assets/askeva%20logo.jfif" alt="' + U.attr(company) + ' logo" onerror="this.remove()">A</b><span>' + U.esc(company.toUpperCase()) + '<em>' + U.esc(t.brandSuffix || ' SIGNAGE') + '</em><small>' + U.esc(t.brandSubtitle || 'CELEBRATION REEL') + '</small></span></span>' +
          '<span class="birthday__feed"><i></i> ' + U.esc(t.feedText || 'FEED: CHANNEL 01') + ' <em>· ' + U.esc(t.feedMeta || '1080p60 · HDR10') + '</em></span>' +
        '</div>' +
        '<div class="birthday__body">' +
          '<div class="birthday__photo-panel">' +
            '<div class="birthday__photo' + (d.photo ? '' : ' has-initials') + '">' +
              (d.photo
                ? '<img src="' + U.attr(d.photo) + '" alt="' + U.attr(d.name || 'Employee') + '" onerror="this.style.display=\'none\';if(this.nextElementSibling)this.nextElementSibling.style.display=\'grid\';">' +
                  '<span class="birthday__photo-initials" style="display:none">' + U.esc(d.initials || U.initials(d.name || 'E')) + '</span>'
                : '<span class="birthday__photo-initials">' + U.esc(d.initials || U.initials(d.name || 'E')) + '</span>') +
            '</div>' +
            '<div class="birthday__photo-badge">' + icon('sparkles', { size: 15 }) + ' ' + U.esc(company.toUpperCase()) + ' ' + U.esc(t.photoBadge || 'SPOTLIGHT HONOREE') + ' · ' + U.esc(d.name || 'Employee') + '</div>' +
          '</div>' +
          '<div class="birthday__content">' +
            '<div class="birthday__kicker">' + icon('send', { size: 13 }) + ' ' + U.esc(t.kicker || 'SPECIAL MILESTONE BROADCAST') + '</div>' +
            '<div class="slide__title"><span>' + U.esc(t.titleMain || 'HAPPY') + '<br><em>' + U.esc(t.titleAccent || 'BIRTHDAY!') + '</em></span></div>' +
            '<div class="birthday__employee-name">' + U.esc(d.name || 'Employee') + '</div>' +
            (d.message ? '<p class="slide__quote">' + U.esc(d.message) + '</p>' : '') +
            '<div class="birthday__name-strip"><strong>' + U.esc(d.name) + '</strong><span><i></i>' + U.esc(d.role || '') + '</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="birthday__footer"><span><i></i>' + U.esc(company.toUpperCase()) + ' ' + U.esc(t.footerLeft || 'CINEMATRIX ENGINE') + '</span><span>' + U.esc(t.footerRight || 'EDID: 3840x2160@60HZ · UHD CANVAS') + '</span></div>' +
      '</div>';
    },

    /* Recognition poster: copy on the left, laurel-framed portrait on the right. */
    performer: function (d, settings) {
      var company = (settings && settings.companyName) || 'AskEVA';
      var rank = '#' + U.pad2(d.rank || 1);
      var period = String(d.periodTitle || 'Top Performer').replace(/^Top Performer\s*/i, '') || 'Recognition';
      var initials = U.esc(d.initials || U.initials(d.name || 'E'));

      return '<div class="slide slide--performer">' +
        PERF_SKYLINE +
        '<div class="perf-slide__top">' +
          '<span class="perf-slide__brand">' + logoTile(company) +
            '<span><b>' + U.esc(company) + '</b><small>Office TV</small></span></span>' +
          '<span class="perf-slide__motto">Our people<br><em>Our strength</em></span>' +
        '</div>' +

        '<div class="perf-slide__copy">' +
          '<div class="perf-slide__eyebrow">' + rank + ' · ' + U.esc(period) + '</div>' +
          '<h1 class="perf-slide__title">Top<br><em>Performer</em></h1>' +
          '<i class="perf-slide__rule"></i>' +
          (d.title ? '<div class="perf-slide__achv">' + icon('trophy', { size: 24 }) + '<span>' + U.esc(d.title) + '</span></div>' : '') +
          (d.description ? '<p class="perf-slide__quote">' + U.esc(d.description) + '</p>' : '') +
        '</div>' +

        '<div class="perf-slide__portrait">' +
          '<span class="perf-slide__glow"></span>' +
          PERF_STARS +
          PERF_LAUREL +
          '<div class="perf-slide__photo">' +
            (d.photo
              ? '<img src="' + U.attr(d.photo) + '" alt="' + U.attr(d.name || '') + '" onerror="this.remove()">'
              : '') +
            '<span>' + initials + '</span>' +
          '</div>' +
          '<span class="perf-slide__rank">' + rank + '</span>' +
          '<div class="perf-slide__ribbon"><span>' + U.esc(d.name) + '</span></div>' +
          '<div class="perf-slide__role">' + U.esc(d.role || '') +
            (d.department ? ' · <em>' + U.esc(d.department) + '</em>' : '') + '</div>' +
        '</div>' +

        '<div class="perf-slide__foot">People <i></i> Ideas <i></i> Impact</div>' +
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

    /* Engagement Hub uses the same shared slide shell as all other TV content. */
    engagement: function (d, settings) {
      return '<div class="slide slide--engagement">' +
        '<div class="slide__kicker slide__kicker--ghost">' +
          icon('sparkles', { size: 20 }) + U.esc(d.typeLabel || 'Engagement') + '</div>' +
        '<div class="engagement-slide__layout">' +
          '<div class="engagement-slide__copy">' +
            '<h1 class="slide__title">' + U.esc(d.title || 'Join the conversation') + '</h1>' +
            (d.message ? '<p class="slide__text">' + U.esc(d.message) + '</p>' : '') +
            (d.question ? '<p class="engagement-slide__question">' + U.esc(d.question) + '</p>' : '') +
            ((d.options || []).length ? '<div class="engagement-slide__options">' + d.options.slice(0, 4).map(function (option, index) { return '<span><b>' + (index + 1) + '</b>' + U.esc(option) + '</span>'; }).join('') + '</div>' : '') +
            (d.endLabel ? '<div class="engagement-slide__end">' + U.esc(d.endLabel) + '</div>' : '') +
          '</div>' +
          '<div class="engagement-slide__scan">' +
            '<div class="engagement-slide__qr" data-engagement-qr data-engagement-url="' + U.attr(d.engagementUrl || '') + '" aria-label="QR code for participation"></div>' +
            '<div class="engagement-slide__cta">SCAN TO PARTICIPATE</div>' +
          '</div>' +
        '</div>' +
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

    kpi: function (d, settings) {
      var rec = d.record || d;
      var metrics = rec.metrics || rec;
      var details = d.details || (EVA.services && EVA.services.salesKpis && EVA.services.salesKpis.details(rec)) || { growth: {} };
      var growth = details.growth || {};
      var trend = (d.trend || (EVA.services && EVA.services.salesKpis && EVA.services.salesKpis.trend(rec, 4)) || [rec]).slice(-4);
      var chartType = (rec.chartType === 'bars' || rec.chartType === 'pie') ? rec.chartType : 'line';
      var METRICS = (EVA.services && EVA.services.salesKpis && EVA.services.salesKpis.METRICS) || [
        { key: 'leads', label: 'Leads', color: '#C7F53F' },
        { key: 'meetings', label: 'Meetings', color: '#38BDF8' },
        { key: 'dealsWon', label: 'Deals Won', color: '#59B22E' },
        { key: 'newClients', label: 'New Clients', color: '#F59E0B' }
      ];

      var formatGrowth = function (val) {
        if (val === 'new') return 'New activity';
        if (val === null || val === undefined || isNaN(val)) return 'N/A';
        var num = Number(val);
        return (num >= 0 ? '+' : '') + num.toFixed(1) + '%';
      };

      var prevLabel = details.previous ? details.previous.periodLabel : (rec.periodType === 'monthly' ? 'prev month' : 'prev week');

      // Metric cards
      var metricCardsHtml = METRICS.map(function (m) {
        var val = metrics[m.key] !== undefined ? metrics[m.key] : (rec[m.key] || 0);
        var gVal = growth[m.key];
        var gText = formatGrowth(gVal);
        var isPositive = typeof gVal === 'number' && gVal > 0;
        var isNegative = typeof gVal === 'number' && gVal < 0;
        var pillClass = isPositive ? 'kpi-pill--up' : (isNegative ? 'kpi-pill--down' : 'kpi-pill--neutral');

        return '<div class="kpi-metric-card" style="--metric-accent:' + m.color + '">' +
          '<div class="kpi-metric-card__header">' +
            '<span class="kpi-metric-card__dot" style="background:' + m.color + '"></span>' +
            '<span class="kpi-metric-card__label">' + U.esc(m.label) + '</span>' +
          '</div>' +
          '<div class="kpi-metric-card__value">' + Number(val).toLocaleString() + '</div>' +
          '<div class="kpi-metric-card__footer">' +
            '<span class="kpi-pill ' + pillClass + '">' +
              (isPositive ? '↑ ' : (isNegative ? '↓ ' : '')) + U.esc(gText) +
            '</span>' +
            '<span class="kpi-metric-card__compare">vs ' + U.esc(prevLabel) + '</span>' +
          '</div>' +
        '</div>';
      }).join('');

      // Average growth badge
      var avgGrowthHtml = '';
      if (details.averageGrowth !== null && details.averageGrowth !== undefined) {
        var avgNum = Number(details.averageGrowth);
        var avgText = (avgNum >= 0 ? '+' : '') + avgNum.toFixed(1) + '%';
        avgGrowthHtml = '<div class="kpi-average-badge">' +
          icon('activity', { size: 14 }) +
          '<span>Average activity growth: <strong>' + U.esc(avgText) + '</strong></span>' +
        '</div>';
      }

      // Custom message panel
      var custom = rec.customContent || {};
      var msgHtml = '';
      if (custom.heading || custom.message || rec.customMessage) {
        msgHtml = '<div class="kpi-custom-panel">' +
          (custom.heading ? '<h3 class="kpi-custom-panel__heading">' + U.esc(custom.heading) + '</h3>' : '') +
          '<p class="kpi-custom-panel__message">' + U.esc(custom.message || rec.customMessage || '') + '</p>' +
          (custom.subMessage ? '<div class="kpi-custom-panel__sub">' + U.esc(custom.subMessage) + '</div>' : '') +
        '</div>';
      }

      // Chart generation
      var chartHtml = '';

      if (chartType === 'pie') {
        // Pie / Donut chart visualizing metric activity distribution for the latest period
        var totalActivity = METRICS.reduce(function (sum, m) {
          var val = metrics[m.key] !== undefined ? metrics[m.key] : (rec[m.key] || 0);
          return sum + (Number(val) || 0);
        }, 0);

        var pieCircumference = 2 * Math.PI * 72; // r=72 => ~452.389
        var accumulatedOffset = 0;

        var slicesSvg = '';
        if (totalActivity === 0) {
          slicesSvg = '<circle cx="150" cy="140" r="72" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="26" />';
        } else {
          slicesSvg = METRICS.map(function (m) {
            var val = Number(metrics[m.key] !== undefined ? metrics[m.key] : (rec[m.key] || 0)) || 0;
            var fraction = val / totalActivity;
            var strokeLen = fraction * pieCircumference;
            var dashOffset = -accumulatedOffset;
            accumulatedOffset += strokeLen;

            return '<circle cx="150" cy="140" r="72" fill="none" stroke="' + m.color + '" ' +
              'stroke-width="26" ' +
              'stroke-dasharray="' + strokeLen.toFixed(2) + ' ' + (pieCircumference - strokeLen).toFixed(2) + '" ' +
              'stroke-dashoffset="' + dashOffset.toFixed(2) + '" ' +
              'transform="rotate(-90 150 140)" class="kpi-pie-slice">' +
              '<title>' + U.attr(m.label + ': ' + val + ' (' + (fraction * 100).toFixed(1) + '%)') + '</title>' +
            '</circle>';
          }).join('');
        }

        var breakdownHtml = METRICS.map(function (m) {
          var val = Number(metrics[m.key] !== undefined ? metrics[m.key] : (rec[m.key] || 0)) || 0;
          var pctStr = totalActivity > 0 ? ((val / totalActivity) * 100).toFixed(1) + '%' : '0.0%';
          return '<div class="kpi-pie-breakdown-row">' +
            '<div class="kpi-pie-breakdown-left">' +
              '<span class="kpi-pie-breakdown-dot" style="background:' + m.color + '"></span>' +
              '<span class="kpi-pie-breakdown-name">' + U.esc(m.label) + '</span>' +
            '</div>' +
            '<div class="kpi-pie-breakdown-right">' +
              '<span class="kpi-pie-breakdown-val">' + val.toLocaleString() + '</span>' +
              '<span class="kpi-pie-breakdown-pct" style="color:' + m.color + '">' + pctStr + '</span>' +
            '</div>' +
          '</div>';
        }).join('');

        chartHtml = '<div class="kpi-pie-wrap">' +
          '<div class="kpi-pie-svg-col">' +
            '<svg viewBox="0 0 300 280" class="kpi-pie-svg">' +
              slicesSvg +
              '<text x="150" y="135" text-anchor="middle" class="kpi-pie-center-val">' + totalActivity.toLocaleString() + '</text>' +
              '<text x="150" y="154" text-anchor="middle" class="kpi-pie-center-label">TOTAL ACTIVITY</text>' +
            '</svg>' +
          '</div>' +
          '<div class="kpi-pie-breakdown-col">' +
            '<div class="kpi-pie-breakdown-title">Activity Breakdown · ' + U.esc(rec.periodLabel) + '</div>' +
            breakdownHtml +
          '</div>' +
        '</div>';
      } else {
        var maxVal = Math.max.apply(null, trend.reduce(function (acc, r) {
          var rm = r.metrics || r;
          return acc.concat(METRICS.map(function (m) { return Number(rm[m.key]) || 0; }));
        }, [10]));
        maxVal = Math.ceil(maxVal * 1.15);

        if (chartType === 'bars') {
          // Grouped bar chart by period (up to 4 periods)
          var barGroups = trend.map(function (r) {
            var rm = r.metrics || r;
            var bars = METRICS.map(function (m) {
              var val = Number(rm[m.key]) || 0;
              var pct = Math.max(4, Math.min(100, (val / maxVal) * 100));
              return '<div class="kpi-group-bar" title="' + U.attr(m.label + ': ' + val) + '">' +
                '<div class="kpi-group-bar__fill" style="height:' + pct + '%;background:' + m.color + '">' +
                  '<span class="kpi-group-bar__val">' + val + '</span>' +
                '</div>' +
              '</div>';
            }).join('');

            var shortLabel = r.periodLabel.split(',')[0];
            return '<div class="kpi-bar-group">' +
              '<div class="kpi-bar-group__bars">' + bars + '</div>' +
              '<div class="kpi-bar-group__label">' + U.esc(shortLabel) + '</div>' +
            '</div>';
          }).join('');

          chartHtml = '<div class="kpi-bars-wrap">' +
            '<div class="kpi-bars-grid">' + barGroups + '</div>' +
          '</div>';
        } else {
          // SVG Line chart (Recommended default, up to 4 periods)
          var svgW = 600;
          var svgH = 260;
          var padT = 30;
          var padB = 40;
          var padL = 45;
          var padR = 25;
          var plotW = svgW - padL - padR;
          var plotH = svgH - padT - padB;

          // Grid lines (4 steps)
          var gridLines = '';
          var yLabels = '';
          for (var gi = 0; gi <= 4; gi++) {
            var gy = padT + (plotH / 4) * gi;
            var gVal = Math.round(maxVal * (1 - gi / 4));
            gridLines += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (svgW - padR) + '" y2="' + gy + '" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />';
            yLabels += '<text x="' + (padL - 8) + '" y="' + (gy + 4) + '" fill="rgba(255,255,255,0.4)" font-size="11" text-anchor="end">' + gVal + '</text>';
          }

          var pointCount = Math.max(1, trend.length);
          var getX = function (idx) {
            if (pointCount === 1) return padL + plotW / 2;
            return padL + (plotW / (pointCount - 1)) * idx;
          };
          var getY = function (val) {
            return padT + plotH - ((Number(val) || 0) / maxVal) * plotH;
          };

          var xLabels = trend.map(function (r, idx) {
            var x = getX(idx);
            var short = r.periodLabel.split(',')[0];
            return '<text x="' + x + '" y="' + (svgH - 12) + '" fill="rgba(255,255,255,0.7)" font-size="11" font-weight="600" text-anchor="middle">' + U.esc(short) + '</text>';
          }).join('');

          var metricLines = METRICS.map(function (m) {
            var pts = trend.map(function (r, idx) {
              var rm = r.metrics || r;
              var val = Number(rm[m.key]) || 0;
              return { x: getX(idx), y: getY(val), val: val };
            });

            var pathD = pts.map(function (p, idx) {
              return (idx === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1);
            }).join(' ');

            var dots = pts.map(function (p) {
              return '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="5" fill="' + m.color + '" stroke="#08150E" stroke-width="2">' +
                '<title>' + U.attr(m.label + ': ' + p.val) + '</title>' +
              '</circle>' +
              '<text x="' + p.x.toFixed(1) + '" y="' + (p.y - 8).toFixed(1) + '" fill="' + m.color + '" font-size="10" font-weight="bold" text-anchor="middle">' + p.val + '</text>';
            }).join('');

            return '<g class="kpi-svg-series">' +
              '<path d="' + pathD + '" fill="none" stroke="' + m.color + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />' +
              dots +
            '</g>';
          }).join('');

          chartHtml = '<div class="kpi-svg-container">' +
            '<svg viewBox="0 0 ' + svgW + ' ' + svgH + '" preserveAspectRatio="xMidYMid meet" class="kpi-trend-svg">' +
              gridLines +
              yLabels +
              xLabels +
              metricLines +
            '</svg>' +
          '</div>';
        }
      }

      // Legend (show for line and bars)
      var legendHtml = chartType === 'pie' ? '' : ('<div class="kpi-chart-legend">' +
        METRICS.map(function (m) {
          return '<span class="kpi-chart-legend__item">' +
            '<i style="background:' + m.color + '"></i>' +
            U.esc(m.label) +
          '</span>';
        }).join('') +
      '</div>');

      var rightSectionTitle = chartType === 'pie'
        ? (icon('layers', { size: 15 }) + ' Metric Activity Distribution · ' + U.esc(rec.periodLabel) + ' (Latest Period)')
        : (icon('layers', { size: 15 }) + ' Historical Trend Progression (' + (chartType === 'bars' ? 'Latest 4 Periods Bar' : 'Latest 4 Periods Line') + ')');

      return '<div class="slide slide--kpi">' +
        '<div class="kpi-slide__topline">' +
          '<div class="kpi-slide__brand">' +
            '<b>A</b>' +
            '<span>' + U.esc((rec.department || 'BDA').toUpperCase()) +
              '<em> ' + (rec.scope === 'department' ? 'ALL-TEAMS' : U.esc((rec.teamName || 'SALES').toUpperCase())) + '</em>' +
              '<small>' + (rec.periodType === 'monthly' ? 'MONTHLY GROWTH INTELLIGENCE (DERIVED)' : 'WEEKLY PERFORMANCE REEL') + '</small>' +
            '</span>' +
          '</div>' +
          '<div class="kpi-slide__period-tag">' +
            '<span class="kpi-slide__period-badge">' + icon('activity', { size: 14 }) + ' ' + U.esc(rec.periodLabel.toUpperCase()) + '</span>' +
            (rec.periodStart && rec.periodEnd ? '<small>' + U.esc(rec.periodStart) + ' – ' + U.esc(rec.periodEnd) + '</small>' : '') +
          '</div>' +
        '</div>' +
        '<div class="kpi-slide__body">' +
          '<div class="kpi-slide__left">' +
            '<div class="kpi-slide__section-title">' + icon('activity', { size: 15 }) + ' Latest Performance Summary</div>' +
            '<div class="kpi-metrics-grid">' + metricCardsHtml + '</div>' +
            avgGrowthHtml +
            msgHtml +
          '</div>' +
          '<div class="kpi-slide__right">' +
            '<div class="kpi-slide__section-title">' +
              rightSectionTitle +
            '</div>' +
            '<div class="kpi-chart-panel">' +
              chartHtml +
              legendHtml +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="kpi-slide__footer">' +
          '<span><i></i> ASKEVA REVENUE INTELLIGENCE</span>' +
          '<span>' + (custom.footer ? U.esc(custom.footer) + ' · ' : '') + 'LIVE SYNC · 3840x2160 UHD</span>' +
        '</div>' +
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

  /** Render QR codes after the shared slide markup has entered the DOM. */
  S.mountEngagementQRCodes = function (root) {
    if (!root || !window.QRCode) return;
    Array.prototype.forEach.call(root.querySelectorAll('[data-engagement-qr]'), function (el) {
      var url = el.getAttribute('data-engagement-url');
      if (!url) return;
      el.innerHTML = '';
      new window.QRCode(el, {
        text: url,
        width: 1024,
        height: 1024,
        colorDark: '#08150E',
        colorLight: '#FFFFFF',
        correctLevel: window.QRCode.CorrectLevel.M
      });
    });
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
      S.mountEngagementQRCodes(el);
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

  S.renderKpi = function (d, settings) {
    return RENDER.kpi(d, settings);
  };

  EVA.slides = S;
})(window.EVA = window.EVA || {});
