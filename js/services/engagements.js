/* Frontend engagement repository. Swap these store calls for API calls later. */
(function (EVA) {
  'use strict';
  var store = EVA.store, U = EVA.utils, COLL = 'engagements';
  var TYPES = ['poll', 'survey', 'quiz', 'feedback', 'rating', 'form'];
  var STATUSES = ['draft', 'active', 'scheduled', 'completed'];

  function id() {
    var raw = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID().replace(/-/g, '') : (Date.now().toString(36) + Math.random().toString(36).slice(2));
    return 'eng_' + raw.slice(0, 12);
  }
  function cleanQuestion(q, i) {
    q = q || {};
    var options = (q.options || []).map(function (x) { return String(x).trim(); }).filter(Boolean);
    /* Index is stable while an engagement is edited and avoids a free-text
       "correct answer" value. Keep correctAnswer for existing saved records. */
    var correctIndex = Number(q.correctOptionIndex);
    if (!isFinite(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
      correctIndex = options.indexOf(String(q.correct || q.correctAnswer || ''));
    }
    if (correctIndex < 0 || correctIndex >= options.length) correctIndex = 0;
    return { id: q.id || 'q_' + i + '_' + Math.random().toString(36).slice(2, 7), label: String(q.label || '').trim(), type: q.type || 'single', required: q.required !== false, options: options, correctOptionIndex: correctIndex, correctAnswer: options[correctIndex] || '', points: Number(q.points) || 1 };
  }
  function normalize(d) {
    var type = TYPES.indexOf(d.type) > -1 ? d.type : 'poll';
    return {
      title: String(d.title || '').trim(), message: String(d.message || '').trim(), type: type,
      status: STATUSES.indexOf(d.status) > -1 ? d.status : 'active', startDate: d.startDate || U.today(), endDate: d.endDate || '', endTime: d.endTime || '',
      questions: (d.questions || []).map(cleanQuestion), responses: Array.isArray(d.responses) ? d.responses : []
    };
  }
  function urlFor(engagementId) { return window.location.origin + '/engage/' + engagementId; }
  function endDateTime(e) {
    if (!e || !e.endDate || !U.isValidISO(e.endDate)) return null;
    /* A date without a time preserves the previous behaviour: it is open
       through the end of that local day. */
    var time = /^([01]\d|2[0-3]):[0-5]\d$/.test(e.endTime || '') ? e.endTime : '23:59';
    var parts = e.endDate.split('-');
    return new Date(+parts[0], +parts[1] - 1, +parts[2], +time.slice(0, 2), +time.slice(3, 5));
  }
  function expired(e) { var end = endDateTime(e); return e.status === 'completed' || !!(end && end.getTime() < Date.now()); }
  function formatTime(value) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value || '')) return '';
    var h = +value.slice(0, 2), m = value.slice(3);
    return (h % 12 || 12) + ':' + m + (h >= 12 ? ' PM' : ' AM');
  }
  function endLabel(e) {
    if (!e || !e.endDate) return 'Open now';
    var label = 'Ends ' + U.formatDate(e.endDate, true);
    return e.endTime ? label + ' · ' + formatTime(e.endTime) : label;
  }
  function validateEnd(e) {
    if (!e.endDate && !e.endTime) return '';
    if (!e.endDate) return 'Choose an end date before setting an end time';
    if (!U.isValidISO(e.endDate)) return 'Choose a valid end date';
    if (e.endTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(e.endTime)) return 'Choose a valid end time';
    var end = endDateTime(e);
    if (end && end.getTime() <= Date.now()) return 'End date and time must be in the future';
    return '';
  }

  var api = {
    TYPES: TYPES, STATUSES: STATUSES, all: function () { return store.list(COLL); }, get: function (x) { return store.get(COLL, x); }, urlFor: urlFor, expired: expired, endLabel: endLabel, formatTime: formatTime, validateEnd: validateEnd,
    create: function (data) {
      var rec = normalize(data); rec.id = id(); rec.engagementUrl = urlFor(rec.id); rec.createdAt = new Date().toISOString();
      return store.insert(COLL, rec);
    },
    update: function (id, data) { var rec = normalize(data); rec.engagementUrl = urlFor(id); return store.update(COLL, id, rec); },
    remove: function (id) { return store.remove(COLL, id); },
    submit: function (id, answers) {
      var e = api.get(id); if (!e || expired(e)) return null;
      var response = { id: 'res_' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)), answers: answers || {}, submittedAt: new Date().toISOString() };
      store.update(COLL, id, { responses: e.responses.concat([response]) }); return response;
    },
    stats: function () { var all = api.all(), responses = all.reduce(function (n, e) { return n + e.responses.length; }, 0); return { active: all.filter(function(e){ return e.status === 'active' && !expired(e); }).length, responses: responses, completed: all.filter(function(e){return expired(e);}).length, participation: all.length ? Math.round(responses / (all.length * 10) * 100) : 0 }; },
    results: function (e) {
      var count = e.responses.length, out = { total: count, options: [], average: 0, score: 0 };
      var q = e.questions[0] || {};
      if (['poll', 'quiz'].indexOf(e.type) > -1) out.options = q.options.map(function (o) { var n = e.responses.filter(function (r) { return r.answers[q.id] === o; }).length; return { label:o, count:n, pct: count ? Math.round(n / count * 100) : 0 }; });
      if (e.type === 'rating') { var sum = e.responses.reduce(function(n,r){return n + Number(r.answers[q.id] || 0);},0); out.average = count ? (sum/count).toFixed(1) : '0.0'; }
      if (e.type === 'quiz') out.score = e.responses.filter(function(r){ return r.answers[q.id] === q.correctAnswer; }).length;
      return out;
    }
  };
  EVA.services = EVA.services || {}; EVA.services.engagements = api;
})(window.EVA = window.EVA || {});
