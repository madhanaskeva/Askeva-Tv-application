/* ==========================================================================
   utils.js — pure helpers (no DOM state, no side effects)
   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = {};

  /* ---------------- Strings ---------------- */

  U.esc = function (v) {
    if (v === null || v === undefined) return '';
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  U.attr = function (v) { return U.esc(v); };

  U.initials = function (name) {
    if (!name) return '?';
    var parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  U.titleCase = function (s) {
    return String(s || '').replace(/\w\S*/g, function (t) {
      return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    });
  };

  U.truncate = function (s, n) {
    s = String(s || '');
    return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
  };

  U.greeting = function () {
    var h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  };

  U.slug = function (s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  U.pluralize = function (n, one, many) {
    return n === 1 ? one : (many || one + 's');
  };

  /* ---------------- IDs ---------------- */

  var counter = 0;
  U.uid = function (prefix) {
    counter += 1;
    return (prefix || 'id') + '_' + Date.now().toString(36) + counter.toString(36) +
      Math.random().toString(36).slice(2, 6);
  };

  /* ---------------- Dates ----------------
     Dates are stored as ISO 'YYYY-MM-DD' strings so they survive JSON
     round-trips and map cleanly onto a future REST API.                     */

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  var MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  U.MONTHS = MONTHS;
  U.MONTHS_SHORT = MONTHS_SHORT;

  U.today = function () { return U.toISO(new Date()); };

  U.toISO = function (d) {
    if (!d) return '';
    if (typeof d === 'string') return d.slice(0, 10);
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  };

  /** Parse 'YYYY-MM-DD' as a LOCAL date (avoids the UTC off-by-one of new Date(str)). */
  U.parseISO = function (iso) {
    if (!iso) return null;
    var p = String(iso).slice(0, 10).split('-');
    if (p.length !== 3) return null;
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d.getTime()) ? null : d;
  };

  U.isValidISO = function (iso) {
    var d = U.parseISO(iso);
    if (!d) return false;
    return U.toISO(d) === String(iso).slice(0, 10);
  };

  /** '2026-09-05' -> '5 September' (or '5 Sep' when short) */
  U.formatDay = function (iso, short) {
    var d = U.parseISO(iso);
    if (!d) return '—';
    return d.getDate() + ' ' + (short ? MONTHS_SHORT : MONTHS)[d.getMonth()];
  };

  /** '2026-09-05' -> '5 September 2026' */
  U.formatDate = function (iso, short) {
    var d = U.parseISO(iso);
    if (!d) return '—';
    return d.getDate() + ' ' + (short ? MONTHS_SHORT : MONTHS)[d.getMonth()] + ' ' + d.getFullYear();
  };

  U.formatDayName = function (iso) {
    var d = U.parseISO(iso);
    return d ? DAYS[d.getDay()] : '—';
  };

  U.monthName = function (i, short) { return (short ? MONTHS_SHORT : MONTHS)[i] || ''; };

  /** Human relative time from an ISO timestamp (with time part). */
  U.timeAgo = function (ts) {
    if (!ts) return '';
    var then = new Date(ts).getTime();
    if (isNaN(then)) return '';
    var secs = Math.floor((Date.now() - then) / 1000);
    if (secs < 45) return 'just now';
    if (secs < 90) return 'a minute ago';
    var mins = Math.floor(secs / 60);
    if (mins < 60) return mins + ' min ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + (hrs === 1 ? ' hour ago' : ' hours ago');
    var days = Math.floor(hrs / 24);
    if (days === 1) return 'yesterday';
    if (days < 7) return days + ' days ago';
    if (days < 30) return Math.floor(days / 7) + 'w ago';
    return U.formatDate(U.toISO(new Date(then)), true);
  };

  U.clockTime = function (d) {
    d = d || new Date();
    var h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0');
    var ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    return h + ':' + m + ' ' + ap;
  };

  U.longDate = function (d) {
    d = d || new Date();
    return DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  };

  /* ---------------- Birthday maths ---------------- */

  /** Days until the next occurrence of this birthday (0 = today). */
  U.daysUntilBirthday = function (iso, from) {
    var b = U.parseISO(iso);
    if (!b) return null;
    var now = from ? new Date(from) : new Date();
    now.setHours(0, 0, 0, 0);
    var next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
    if (next < now) next = new Date(now.getFullYear() + 1, b.getMonth(), b.getDate());
    return Math.round((next - now) / 86400000);
  };

  /** Days since the most recent occurrence (0 = today). */
  U.daysSinceBirthday = function (iso, from) {
    var b = U.parseISO(iso);
    if (!b) return null;
    var now = from ? new Date(from) : new Date();
    now.setHours(0, 0, 0, 0);
    var last = new Date(now.getFullYear(), b.getMonth(), b.getDate());
    if (last > now) last = new Date(now.getFullYear() - 1, b.getMonth(), b.getDate());
    return Math.round((now - last) / 86400000);
  };

  U.isBirthdayToday = function (iso) { return U.daysUntilBirthday(iso) === 0; };

  U.age = function (iso) {
    var b = U.parseISO(iso);
    if (!b) return null;
    var now = new Date();
    var a = now.getFullYear() - b.getFullYear();
    var m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
    return a;
  };

  U.tenure = function (iso) {
    var d = U.parseISO(iso);
    if (!d) return '—';
    var months = (new Date().getFullYear() - d.getFullYear()) * 12 + (new Date().getMonth() - d.getMonth());
    if (months < 1) return 'New joiner';
    if (months < 12) return months + ' ' + U.pluralize(months, 'month');
    var y = Math.floor(months / 12), rm = months % 12;
    return y + ' ' + U.pluralize(y, 'year') + (rm ? ' ' + rm + 'm' : '');
  };

  /* ---------------- Numbers ---------------- */

  U.pad2 = function (n) { return String(n).padStart(2, '0'); };

  U.clamp = function (n, min, max) { return Math.min(max, Math.max(min, n)); };

  U.duration = function (secs) {
    secs = Number(secs) || 0;
    if (secs < 60) return secs + 's';
    var m = Math.floor(secs / 60), s = secs % 60;
    return m + 'm' + (s ? ' ' + s + 's' : '');
  };

  /* ---------------- Functional ---------------- */

  U.debounce = function (fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait || 200);
    };
  };

  U.clone = function (o) { return o == null ? o : JSON.parse(JSON.stringify(o)); };

  U.sortBy = function (arr, key, dir) {
    var mul = dir === 'desc' ? -1 : 1;
    return arr.slice().sort(function (a, b) {
      var x = typeof key === 'function' ? key(a) : a[key];
      var y = typeof key === 'function' ? key(b) : b[key];
      if (x === null || x === undefined) x = '';
      if (y === null || y === undefined) y = '';
      if (typeof x === 'string' && typeof y === 'string') {
        return x.localeCompare(y, undefined, { sensitivity: 'base' }) * mul;
      }
      return (x < y ? -1 : x > y ? 1 : 0) * mul;
    });
  };

  U.unique = function (arr) {
    return arr.filter(function (v, i) { return arr.indexOf(v) === i; });
  };

  U.groupBy = function (arr, key) {
    return arr.reduce(function (acc, item) {
      var k = typeof key === 'function' ? key(item) : item[key];
      (acc[k] = acc[k] || []).push(item);
      return acc;
    }, {});
  };

  /* ---------------- Validation ---------------- */

  U.required = function (v) {
    return (v === null || v === undefined || String(v).trim() === '') ? 'This field is required' : '';
  };

  U.minLen = function (v, n) {
    return String(v || '').trim().length < n ? 'Must be at least ' + n + ' characters' : '';
  };

  U.dateField = function (v, required) {
    if (!v) return required ? 'Please pick a date' : '';
    return U.isValidISO(v) ? '' : 'Enter a valid date';
  };

  U.rangeField = function (start, end) {
    if (!start || !end) return '';
    return U.parseISO(end) < U.parseISO(start) ? 'End date must be after the start date' : '';
  };

  EVA.utils = U;
})(window.EVA = window.EVA || {});
