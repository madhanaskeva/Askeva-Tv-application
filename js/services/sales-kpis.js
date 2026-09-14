/* ==========================================================================
   sales-kpis.js — Centralized KPI Service & Persistence Layer
   Persists to localStorage key: askeva_kpi_records.
   Sole source of truth: Weekly KPI records.
   Monthly performance and MoM analytics are derived dynamically.
   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils;
  var STORAGE_KEY = 'askeva_kpi_records';

  var METRICS = [
    { key: 'leads', label: 'Leads', color: '#C7F53F', short: 'LDS' },
    { key: 'meetings', label: 'Meetings', color: '#38BDF8', short: 'MTG' },
    { key: 'dealsWon', label: 'Deals Won', color: '#59B22E', short: 'DLS' },
    { key: 'newClients', label: 'New Clients', color: '#F59E0B', short: 'CLN' }
  ];

  var CHARTS = [
    { value: 'line', label: 'Line chart (Recommended for trends)' },
    { value: 'bars', label: 'Bar chart (Grouped by period)' },
    { value: 'pie', label: 'Pie chart (Metric activity distribution)' }
  ];

  var memoryFallback = null;

  /* ---------------- storage layer ---------------- */

  /**
   * Calendar / ISO Week Utility:
   * Rule for Month Boundaries (Majority-Days Rule):
   * An ISO week runs Monday to Sunday (7 days).
   * A week belongs to the calendar month that contains at least 4 of its days.
   * This is mathematically equivalent to checking which month the week's
   * Thursday (midpoint / 4th day) falls in.
   *
   * Example:
   * 2026-W36 (Mon Aug 31 – Sun Sep 06):
   * Thursday is Sep 03 -> 6 days in September, 1 in August -> Month is 2026-09.
   *
   * This rule guarantees:
   * 1. No week is double-counted across two months.
   * 2. Every week is assigned to exactly one calendar month.
   * 3. Monthly sum of weekly values equals the total activity for that month.
   */
  function getISOWeekInfo(year, weekNum) {
    year = parseInt(year, 10) || 2026;
    weekNum = parseInt(weekNum, 10) || 1;

    // Jan 4th is always in ISO Week 1
    var jan4 = new Date(year, 0, 4);
    var day = jan4.getDay() || 7; // 1 = Monday ... 7 = Sunday
    var mon1 = new Date(jan4.getTime() - (day - 1) * 86400000);

    // Monday of the requested week
    var targetMon = new Date(mon1.getTime() + (weekNum - 1) * 7 * 86400000);
    // Thursday of the requested week (midpoint / majority indicator)
    var targetThu = new Date(targetMon.getTime() + 3 * 86400000);
    // Sunday of the requested week
    var targetSun = new Date(targetMon.getTime() + 6 * 86400000);

    var assignedYear = targetThu.getFullYear();
    var assignedMonth = targetThu.getMonth() + 1;
    var padMonth = String(assignedMonth).padStart(2, '0');
    var monthKey = assignedYear + '-' + padMonth;
    var periodKey = year + '-W' + String(weekNum).padStart(2, '0');

    function fmtDate(d) {
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var dayStr = String(d.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + dayStr;
    }

    return {
      year: assignedYear,
      calendarYear: year,
      month: assignedMonth,
      monthKey: monthKey,
      weekNumber: weekNum,
      periodKey: periodKey,
      startDate: fmtDate(targetMon),
      endDate: fmtDate(targetSun),
      thursdayDate: fmtDate(targetThu),
      label: 'Week ' + weekNum,
      periodLabel: 'Week ' + weekNum + ', ' + getMonthName(assignedMonth) + ' ' + assignedYear
    };
  }

  /**
   * Calculate exact day overlap between a weekly record [wStartStr, wEndStr]
   * and a calendar month (targetYear, targetMonth).
   *
   * Apportions weekly metrics strictly by the number of days falling
   * within that calendar month:
   *   fraction = overlapDays / totalWeekDays
   *
   * Guarantees that across consecutive months, sum of fractions === 1.0 (100%),
   * with no double-counting or skipped days.
   */
  function calculateMonthDaysOverlap(wStartStr, wEndStr, targetYear, targetMonth) {
    if (!wStartStr || !wEndStr) return { overlapDays: 0, totalWeekDays: 7, fraction: 0 };

    var wStart = new Date(wStartStr + 'T00:00:00');
    var wEnd = new Date(wEndStr + 'T00:00:00');
    if (isNaN(wStart.getTime()) || isNaN(wEnd.getTime()) || wEnd < wStart) {
      return { overlapDays: 0, totalWeekDays: 7, fraction: 0 };
    }

    targetYear = parseInt(targetYear, 10);
    targetMonth = parseInt(targetMonth, 10);

    // First day of target month
    var mStart = new Date(targetYear, targetMonth - 1, 1);
    // Last day of target month (day 0 of next month)
    var mEnd = new Date(targetYear, targetMonth, 0);

    var overlapStart = new Date(Math.max(wStart.getTime(), mStart.getTime()));
    var overlapEnd = new Date(Math.min(wEnd.getTime(), mEnd.getTime()));

    var totalWeekDays = Math.round((wEnd.getTime() - wStart.getTime()) / 86400000) + 1;
    if (totalWeekDays <= 0) totalWeekDays = 7;

    if (overlapStart.getTime() > overlapEnd.getTime()) {
      return { overlapDays: 0, totalWeekDays: totalWeekDays, fraction: 0 };
    }

    var overlapDays = Math.round((overlapEnd.getTime() - overlapStart.getTime()) / 86400000) + 1;
    var fraction = Math.max(0, Math.min(1, overlapDays / totalWeekDays));

    return {
      overlapDays: overlapDays,
      totalWeekDays: totalWeekDays,
      fraction: fraction
    };
  }

  /**
   * Determine the month key ('YYYY-MM') for any record or date pair.
   */
  function getWeekMonthKey(recOrStart, maybeEnd) {
    var start = (typeof recOrStart === 'object' && recOrStart !== null)
      ? (recOrStart.periodStart || recOrStart.startDate)
      : recOrStart;
    var end = (typeof recOrStart === 'object' && recOrStart !== null)
      ? (recOrStart.periodEnd || recOrStart.endDate)
      : maybeEnd;

    if (start && end) {
      var s = new Date(start + 'T00:00:00');
      var e = new Date(end + 'T00:00:00');
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        // Midpoint of the week (Thursday) determines default ISO month key
        var mid = new Date(s.getTime() + (e.getTime() - s.getTime()) / 2);
        var y = mid.getFullYear();
        var m = String(mid.getMonth() + 1).padStart(2, '0');
        return y + '-' + m;
      }
    }

    if (typeof recOrStart === 'object' && recOrStart !== null && recOrStart.monthKey && recOrStart.monthKey.indexOf('-') > -1) {
      return recOrStart.monthKey;
    }

    var pKey = (typeof recOrStart === 'object' && recOrStart !== null) ? recOrStart.periodKey : recOrStart;
    if (typeof pKey === 'string') {
      var parts = pKey.split('-W');
      if (parts.length === 2) {
        var yr = parseInt(parts[0], 10);
        var wn = parseInt(parts[1], 10);
        if (!isNaN(yr) && !isNaN(wn)) {
          return getISOWeekInfo(yr, wn).monthKey;
        }
      }
      if (pKey.length >= 7 && pKey.indexOf('-') === 4) return pKey.slice(0, 7);
    }
    return new Date().toISOString().slice(0, 7);
  }

  /* ---------------- monthly published storage ---------------- */

  var PUBLISHED_MONTHS_KEY = 'askeva_kpi_published_months';

  function readPublishedMonths() {
    try {
      var raw = window.localStorage.getItem(PUBLISHED_MONTHS_KEY);
      if (raw !== null) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('[kpiService] readPublishedMonths error:', e);
    }
    return null; // null means default: publish latest month for each team
  }

  function writePublishedMonths(list) {
    try {
      window.localStorage.setItem(PUBLISHED_MONTHS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('[kpiService] writePublishedMonths error:', e);
    }
  }

  function isMonthlyPublished(monthKey, teamName) {
    var list = readPublishedMonths();
    var composite = monthKey + '|' + (teamName || 'Enterprise Sales');
    if (list === null) {
      // Default: true for all available aggregated months so TV shows monthly slides
      return true;
    }
    return list.indexOf(composite) > -1 || list.indexOf(monthKey) > -1;
  }

  function setMonthlyPublished(monthKey, teamName, isPub) {
    var list = readPublishedMonths();
    if (list === null) {
      // Initialize with all existing months if first modification
      var allMonths = service.getMonthlyAggregatedHistory({ oldest: true });
      list = allMonths.map(function (m) { return m.periodKey + '|' + m.teamName; });
    }
    var composite = monthKey + '|' + (teamName || 'Enterprise Sales');
    var idx = list.indexOf(composite);
    if (isPub && idx === -1) {
      list.push(composite);
    } else if (!isPub && idx > -1) {
      list.splice(idx, 1);
    }
    writePublishedMonths(list);

    // Auto-trigger broadcast compilation to TV
    if (EVA.services && EVA.services.tv && typeof EVA.services.tv.publish === 'function') {
      EVA.services.tv.publish({
        reason: 'Monthly KPI slide (' + monthKey + ' - ' + teamName + ') ' + (isPub ? 'published' : 'removed from TV')
      });
    }
  }

  function readRecords() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // STRICT WEEKLY INPUT: purge any legacy manual monthly records from storage
          var cleaned = parsed.filter(function (r) {
            return r && r.periodType !== 'monthly' && r.reportingPeriod !== 'monthly';
          });
          if (cleaned.length !== parsed.length) {
            writeRecords(cleaned);
          }
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch (e) {
      console.warn('[kpiService] localStorage read error:', e);
    }

    if (memoryFallback !== null && memoryFallback.length > 0) return memoryFallback;

    // Populate default seed records (weekly only)
    var seeded = (EVA.seed && typeof EVA.seed.kpiRecords === 'function')
      ? EVA.seed.kpiRecords()
      : [];
    writeRecords(seeded);
    return seeded;
  }

  function writeRecords(records) {
    memoryFallback = records;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('[kpiService] localStorage write error:', e);
    }
    if (EVA.store && typeof EVA.store.emit === 'function') {
      EVA.store.emit('kpi_records', { action: 'change', count: records.length });
    }
    return records;
  }

  /* ---------------- normalization & validation ---------------- */

  function normalizeRecord(d) {
    d = d || {};
    var pType = 'weekly';

    var pKey = String(d.periodKey || '').trim().toUpperCase();
    if (!pKey || pKey.indexOf('-W') === -1) {
      var label = String(d.periodLabel || d.weekLabel || '');
      var yearMatch = label.match(/20\d{2}/);
      var year = yearMatch ? yearMatch[0] : (d.year || new Date().getFullYear());
      var numMatch = label.match(/\d+/);
      var num = numMatch ? numMatch[0] : (d.weekNumber || '1');
      pKey = year + '-W' + String(num).padStart(2, '0');
    }

    var weekParts = pKey.split('-W');
    var yrInt = parseInt(weekParts[0], 10) || new Date().getFullYear();
    var wkInt = parseInt(weekParts[1], 10) || 1;
    var weekInfo = getISOWeekInfo(yrInt, wkInt);

    var pStart = d.periodStart || d.startDate || weekInfo.startDate;
    var pEnd = d.periodEnd || d.endDate || weekInfo.endDate;
    var mKey = getWeekMonthKey({ periodStart: pStart, periodEnd: pEnd, periodKey: pKey });
    var pLabel = String(d.periodLabel || d.weekLabel || weekInfo.periodLabel).trim();

    // Application department is strictly BDA
    var dept = 'BDA';
    var scope = d.scope === 'sales' || d.scope === 'department' ? 'department' : 'team';
    var team = scope === 'department' ? 'Whole Department' : String(d.teamName || 'Enterprise Sales').trim();

    var metrics = {
      leads: Math.max(0, Math.round(Number(d.metrics && d.metrics.leads !== undefined ? d.metrics.leads : d.leads) || 0)),
      meetings: Math.max(0, Math.round(Number(d.metrics && d.metrics.meetings !== undefined ? d.metrics.meetings : d.meetings) || 0)),
      dealsWon: Math.max(0, Math.round(Number(d.metrics && d.metrics.dealsWon !== undefined ? d.metrics.dealsWon : d.dealsWon) || 0)),
      newClients: Math.max(0, Math.round(Number(d.metrics && d.metrics.newClients !== undefined ? d.metrics.newClients : d.newClients) || 0))
    };

    var custom = Object.assign({
      heading: '',
      message: '',
      subMessage: '',
      footer: ''
    }, d.customContent || {});

    if (d.customMessage && !custom.message) {
      custom.message = String(d.customMessage).trim();
    }

    var chartType = (d.chartType === 'bars' || d.chartType === 'pie') ? d.chartType : 'line';
    var status = ['draft', 'approved', 'published'].indexOf(d.status) > -1 ? d.status : 'draft';
    var now = new Date().toISOString();

    return {
      id: d.id || ('kpi_' + (U.uid ? U.uid('kpi') : Date.now().toString(36))),
      department: dept,
      teamName: team,
      scope: scope,
      periodType: pType,
      reportingPeriod: pType,
      periodLabel: pLabel,
      periodKey: pKey,
      periodStart: pStart,
      periodEnd: pEnd,
      monthKey: mKey,
      weekNumber: wkInt,
      metrics: metrics,
      leads: metrics.leads,
      meetings: metrics.meetings,
      dealsWon: metrics.dealsWon,
      newClients: metrics.newClients,
      customContent: custom,
      chartType: chartType,
      status: status,
      approvedAt: d.approvedAt || (status === 'approved' ? now : null),
      publishedAt: d.publishedAt || (status === 'published' ? now : null),
      createdAt: d.createdAt || now,
      updatedAt: now
    };
  }

  function sortChronological(a, b) {
    return String(a.periodKey || '').localeCompare(String(b.periodKey || ''));
  }

  function sortReverseChronological(a, b) {
    return String(b.periodKey || '').localeCompare(String(a.periodKey || ''));
  }

  /* ---------------- growth calculations ---------------- */

  /**
   * Safely calculate percentage growth:
   * ((current - previous) / previous) * 100
   * Handles:
   * - previous === 0 and current > 0 -> 'new' (New activity)
   * - previous === 0 and current === 0 -> 0 (+0.0%)
   * - previous === null/undefined -> null (N/A)
   */
  function calculateMetricGrowth(currVal, prevVal) {
    if (prevVal === null || prevVal === undefined || isNaN(prevVal)) return null;
    currVal = Number(currVal) || 0;
    prevVal = Number(prevVal) || 0;

    if (prevVal === 0) {
      return currVal > 0 ? 'new' : 0;
    }
    return ((currVal - prevVal) / prevVal) * 100;
  }

  function formatGrowthDisplay(val) {
    if (val === 'new') return 'New activity';
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    var num = Number(val);
    return (num >= 0 ? '+' : '') + num.toFixed(1) + '%';
  }

  /* ---------------- calendar helpers ---------------- */

  function getMonthName(month) {
    return new Date(2026, month - 1, 1).toLocaleString('en', { month: 'long' });
  }

  /**
   * Return all ISO weeks whose majority of days (>=4 days / Thursday)
   * belong to the specified month and year.
   */
  function getWeeksForMonth(year, month) {
    year = Number(year) || 2026;
    month = Number(month) || 9;
    var padMonth = String(month).padStart(2, '0');
    var targetMonthKey = year + '-' + padMonth;

    var weeks = [];
    for (var w = 1; w <= 53; w++) {
      var info = getISOWeekInfo(year, w);
      if (info.monthKey === targetMonthKey) {
        weeks.push({
          weekNumber: info.weekNumber,
          monthKey: info.monthKey,
          periodKey: info.periodKey,
          label: info.label,
          periodLabel: info.periodLabel,
          startDate: info.startDate,
          endDate: info.endDate
        });
      }
    }
    return weeks;
  }

  /* ---------------- service API ---------------- */

  var service = {
    METRICS: METRICS,
    CHARTS: CHARTS,
    STORAGE_KEY: STORAGE_KEY,

    formatGrowth: formatGrowthDisplay,
    getMonthName: getMonthName,
    getWeeksForMonth: getWeeksForMonth,

    getAll: function () {
      return readRecords();
    },

    all: function () {
      return readRecords();
    },

    getById: function (id) {
      if (!id) return null;
      var rows = readRecords();
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].id === id) return rows[i];
      }
      return null;
    },

    get: function (id) {
      return service.getById(id);
    },

    create: function (data) {
      var record = normalizeRecord(data);
      var records = readRecords().slice();

      // Check if duplicate periodKey + department + teamName already exists
      var existingIndex = -1;
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.periodKey === record.periodKey &&
            r.periodType === record.periodType &&
            r.department.toLowerCase() === record.department.toLowerCase() &&
            r.teamName.toLowerCase() === record.teamName.toLowerCase()) {
          existingIndex = i;
          break;
        }
      }

      if (existingIndex > -1) {
        // Update existing record rather than create duplicate key
        record.id = records[existingIndex].id;
        record.createdAt = records[existingIndex].createdAt;
        records[existingIndex] = record;
        writeRecords(records);
        return { duplicate: true, updated: true, record: record, id: record.id };
      }

      records.push(record);
      writeRecords(records);
      return { duplicate: false, record: record, id: record.id };
    },

    update: function (id, patch) {
      if (!id) return null;
      var records = readRecords().slice();
      var found = null;

      for (var i = 0; i < records.length; i++) {
        if (records[i].id === id) {
          found = normalizeRecord(Object.assign({}, records[i], patch, { id: id }));
          records[i] = found;
          break;
        }
      }

      if (found) {
        writeRecords(records);
      }
      return found;
    },

    delete: function (id) {
      if (!id) return false;
      var records = readRecords();
      var filtered = records.filter(function (r) { return r.id !== id; });
      if (filtered.length !== records.length) {
        writeRecords(filtered);
        return true;
      }
      return false;
    },

    remove: function (id) {
      return service.delete(id);
    },

    duplicate: function (id) {
      var source = service.getById(id);
      if (!source) return null;
      var copy = JSON.parse(JSON.stringify(source));
      delete copy.id;
      copy.periodLabel += ' (Copy)';
      copy.status = 'draft';
      copy.createdAt = new Date().toISOString();
      copy.updatedAt = copy.createdAt;
      return service.create(copy);
    },

    getByPeriod: function (periodType) {
      return readRecords().filter(function (r) {
        return r.periodType === periodType;
      });
    },

    getByTeam: function (teamName) {
      return readRecords().filter(function (r) {
        return r.teamName.toLowerCase() === String(teamName || '').toLowerCase();
      });
    },

    getByDepartment: function (department) {
      return readRecords().filter(function (r) {
        return r.department.toLowerCase() === String(department || '').toLowerCase();
      });
    },

    getWeekMonthKey: getWeekMonthKey,

    /**
     * Filter and search historical weekly records.
     * Year and Month filtering strictly respect the majority-days rule.
     */
    getHistory: function (filters) {
      filters = filters || {};
      var rows = readRecords();
      var term = String(filters.search || '').trim().toLowerCase();

      var result = rows.filter(function (r) {
        if (filters.period && filters.period !== 'all' && r.periodType !== filters.period) {
          return false;
        }
        if (filters.team && filters.team !== 'all' && r.teamName.toLowerCase() !== filters.team.toLowerCase()) {
          return false;
        }
        var mKey = getWeekMonthKey(r);
        if (filters.year && filters.year !== 'all') {
          var y = mKey.slice(0, 4);
          if (y !== String(filters.year)) return false;
        }
        if (filters.month && filters.month !== 'all') {
          var monthNum = mKey.split('-')[1];
          var targetMonth = String(filters.month).padStart(2, '0');
          if (filters.month.indexOf('-') > -1) {
            if (mKey !== filters.month) return false;
          } else {
            if (monthNum !== targetMonth) return false;
          }
        }
        if (filters.status && filters.status !== 'all' && r.status !== filters.status) {
          return false;
        }
        if (term) {
          var searchCorpus = [
            r.periodLabel, r.periodKey, r.department, r.teamName,
            r.status, (r.customContent && r.customContent.heading) || '', (r.customContent && r.customContent.message) || ''
          ].join(' ').toLowerCase();
          if (searchCorpus.indexOf(term) === -1) return false;
        }
        return true;
      });

      return filters.oldest ? result.sort(sortChronological) : result.sort(sortReverseChronological);
    },

    history: function (filters) {
      return service.getHistory(filters);
    },

    weeklyHistory: function (filters) {
      return service.getHistory(Object.assign({}, filters || {}, { period: 'weekly' }));
    },

    /**
     * Dynamically derive monthly aggregated records from primary weekly records.
     * Calculates monthly metrics strictly by ALL the days in the calendar month:
     * Apportions boundary weeks crossing month borders by their exact day fraction (overlapDays / 7).
     * Calculates sums without double-counting and derives MoM growth comparisons.
     */
    getMonthlyAggregatedHistory: function (filters) {
      filters = filters || {};
      var weeklyRows = readRecords().filter(function (r) {
        return r.periodType === 'weekly';
      }).sort(sortChronological);

      // 1. Identify all candidate (year, month, teamName) combinations
      var monthTeamMap = {};
      var candidateMonths = [];

      weeklyRows.forEach(function (r) {
        var team = r.teamName || 'Enterprise Sales';
        var ws = r.periodStart;
        var we = r.periodEnd;
        if (!ws || !we) {
          var pParts = (r.periodKey || '').split('-W');
          var yr = parseInt(pParts[0], 10) || 2026;
          var wn = parseInt(pParts[1], 10) || 1;
          var info = getISOWeekInfo(yr, wn);
          ws = ws || info.startDate;
          we = we || info.endDate;
        }

        var dStart = new Date(ws + 'T00:00:00');
        var dEnd = new Date(we + 'T00:00:00');
        if (!isNaN(dStart.getTime()) && !isNaN(dEnd.getTime())) {
          var sy = dStart.getFullYear();
          var sm = dStart.getMonth() + 1;
          var ey = dEnd.getFullYear();
          var em = dEnd.getMonth() + 1;

          var k1 = sy + '-' + String(sm).padStart(2, '0') + '|' + team;
          var k2 = ey + '-' + String(em).padStart(2, '0') + '|' + team;
          monthTeamMap[k1] = { year: sy, month: sm, team: team };
          monthTeamMap[k2] = { year: ey, month: em, team: team };
        }
      });

      // 2. For each (monthKey, team), aggregate by exact day fraction
      var grouped = {};
      Object.keys(monthTeamMap).forEach(function (composite) {
        var meta = monthTeamMap[composite];
        var y = meta.year;
        var m = meta.month;
        var t = meta.team;
        var mKey = y + '-' + String(m).padStart(2, '0');

        var leadsSum = 0;
        var meetingsSum = 0;
        var dealsWonSum = 0;
        var newClientsSum = 0;
        var weeksIncluded = [];
        var sampleChartType = 'line';

        weeklyRows.forEach(function (r) {
          if ((r.teamName || 'Enterprise Sales').toLowerCase() !== t.toLowerCase()) return;
          var ws = r.periodStart;
          var we = r.periodEnd;
          if (!ws || !we) {
            var pParts = (r.periodKey || '').split('-W');
            var yr = parseInt(pParts[0], 10) || 2026;
            var wn = parseInt(pParts[1], 10) || 1;
            var info = getISOWeekInfo(yr, wn);
            ws = ws || info.startDate;
            we = we || info.endDate;
          }

          var overlap = calculateMonthDaysOverlap(ws, we, y, m);
          if (overlap.fraction > 0) {
            var rm = r.metrics || r;
            leadsSum += (Number(rm.leads) || 0) * overlap.fraction;
            meetingsSum += (Number(rm.meetings) || 0) * overlap.fraction;
            dealsWonSum += (Number(rm.dealsWon) || 0) * overlap.fraction;
            newClientsSum += (Number(rm.newClients) || 0) * overlap.fraction;
            weeksIncluded.push(r.periodLabel || r.periodKey);
            if (r.chartType) sampleChartType = r.chartType;
          }
        });

        if (weeksIncluded.length > 0) {
          var isPub = isMonthlyPublished(mKey, t);
          grouped[composite] = {
            id: 'monthly_' + composite.replace(/[^a-zA-Z0-9_-]/g, '_'),
            periodType: 'monthly',
            reportingPeriod: 'monthly',
            periodKey: mKey,
            monthKey: mKey,
            periodLabel: getMonthName(m) + ' ' + y,
            year: y,
            month: m,
            department: 'BDA',
            teamName: t,
            scope: 'team',
            status: isPub ? 'published' : 'derived',
            chartType: sampleChartType,
            weeksIncluded: weeksIncluded,
            leads: Math.round(leadsSum),
            meetings: Math.round(meetingsSum),
            dealsWon: Math.round(dealsWonSum),
            newClients: Math.round(newClientsSum),
            customContent: {
              heading: getMonthName(m) + ' ' + y + ' Aggregated Summary',
              message: 'Derived from ' + t + ' daily/weekly performance metrics.',
              subMessage: 'Day-based aggregation across ' + weeksIncluded.length + ' reporting weeks.',
              footer: 'AskEVA Revenue Intelligence'
            }
          };
        }
      });

      var teamChronological = {};
      var list = Object.keys(grouped).map(function (k) {
        var item = grouped[k];
        item.metrics = {
          leads: item.leads,
          meetings: item.meetings,
          dealsWon: item.dealsWon,
          newClients: item.newClients
        };
        item.weeksCount = item.weeksIncluded.length;
        if (!teamChronological[item.teamName]) teamChronological[item.teamName] = [];
        teamChronological[item.teamName].push(item);
        return item;
      });

      // Compute sequential MoM comparisons within each team
      Object.keys(teamChronological).forEach(function (teamName) {
        var seq = teamChronological[teamName].sort(function (a, b) {
          return String(a.periodKey).localeCompare(String(b.periodKey));
        });
        for (var i = 0; i < seq.length; i++) {
          var curr = seq[i];
          var prev = i > 0 ? seq[i - 1] : null;
          var growth = {};
          METRICS.forEach(function (metric) {
            growth[metric.key] = calculateMetricGrowth(curr.metrics[metric.key], prev ? prev.metrics[metric.key] : null);
          });
          curr.previousPeriodKey = prev ? prev.periodKey : null;
          curr.growth = growth;
          curr.averageGrowth = service.calculateAverageGrowth(growth);
        }
      });

      // Filter
      var term = String(filters.search || '').trim().toLowerCase();
      var filtered = list.filter(function (m) {
        if (filters.team && filters.team !== 'all' && m.teamName.toLowerCase() !== filters.team.toLowerCase()) {
          return false;
        }
        if (filters.year && filters.year !== 'all' && String(m.year) !== String(filters.year)) {
          return false;
        }
        if (filters.month && filters.month !== 'all') {
          var moStr = String(filters.month).padStart(2, '0');
          if (filters.month.indexOf('-') > -1) {
            if (m.monthKey !== filters.month) return false;
          } else {
            if (String(m.month).padStart(2, '0') !== moStr) return false;
          }
        }
        if (filters.status && filters.status !== 'all' && m.status !== filters.status) {
          return false;
        }
        if (term) {
          var corpus = (m.periodLabel + ' ' + m.teamName + ' ' + m.periodKey).toLowerCase();
          if (corpus.indexOf(term) === -1) return false;
        }
        return true;
      });

      return filters.oldest
        ? filtered.sort(function (a, b) { return String(a.periodKey).localeCompare(String(b.periodKey)); })
        : filtered.sort(function (a, b) { return String(b.periodKey).localeCompare(String(a.periodKey)); });
    },

    monthlyHistory: function (filters) {
      return service.getMonthlyAggregatedHistory(filters);
    },

    monthlyAggregated: function (filters) {
      return service.getMonthlyAggregatedHistory(filters);
    },

    isMonthlyPublished: isMonthlyPublished,
    setMonthlyPublished: setMonthlyPublished,

    publishMonthly: function (monthKey, teamName) {
      setMonthlyPublished(monthKey, teamName, true);
      return true;
    },

    unpublishMonthly: function (monthKey, teamName) {
      setMonthlyPublished(monthKey, teamName, false);
      return false;
    },

    /**
     * TV Display: Get latest chronological weeks (default strictly 4).
     */
    getLatestWeeks: function (team, count) {
      count = count || 4;
      var rows = readRecords().filter(function (r) {
        return r.periodType === 'weekly' &&
          (!team || team === 'all' || r.teamName.toLowerCase() === team.toLowerCase());
      }).sort(sortChronological);
      return rows.slice(-count);
    },

    /**
     * TV Display: Get latest chronological aggregated months (default strictly 4).
     */
    getLatestMonths: function (team, count) {
      count = count || 4;
      var rows = service.getMonthlyAggregatedHistory({ team: team, oldest: true });
      return rows.slice(-count);
    },

    /**
     * Finds the immediate consecutive previous period record for comparison.
     */
    getPrevious: function (record) {
      if (!record) return null;

      if (record.periodType === 'monthly') {
        var months = service.getMonthlyAggregatedHistory({ team: record.teamName, oldest: true });
        var prevMonth = null;
        for (var i = 0; i < months.length; i++) {
          if (months[i].periodKey === record.periodKey) break;
          prevMonth = months[i];
        }
        return prevMonth;
      }

      var sameScopeRecords = readRecords().filter(function (r) {
        return r.id !== record.id &&
               r.periodType === record.periodType &&
               r.teamName.toLowerCase() === record.teamName.toLowerCase() &&
               String(r.periodKey) < String(record.periodKey);
      }).sort(sortChronological);

      return sameScopeRecords.length ? sameScopeRecords[sameScopeRecords.length - 1] : null;
    },

    previous: function (record) {
      return service.getPrevious(record);
    },

    /**
     * Compare current and previous periods, returning safe growth metrics.
     */
    comparePeriods: function (current, previous) {
      if (!current) return null;
      var prev = previous !== undefined ? previous : service.getPrevious(current);

      var growth = {};
      METRICS.forEach(function (m) {
        var cVal = current.metrics ? current.metrics[m.key] : current[m.key];
        var pVal = prev ? (prev.metrics ? prev.metrics[m.key] : prev[m.key]) : null;
        growth[m.key] = calculateMetricGrowth(cVal, pVal);
      });

      return {
        current: current,
        previous: prev,
        growth: growth,
        averageGrowth: service.calculateAverageGrowth(growth)
      };
    },

    calculateGrowth: function (current, previous) {
      return service.comparePeriods(current, previous);
    },

    calculateWeeklyGrowth: function (history) {
      if (!history || !history.length) return null;
      var curr = history[history.length - 1];
      var prev = history.length > 1 ? history[history.length - 2] : null;
      return service.comparePeriods(curr, prev);
    },

    calculateMonthlyGrowth: function (weeklyRecords) {
      var aggregated = service.getMonthlyAggregatedHistory({ oldest: true });
      if (!aggregated.length) return null;
      var curr = aggregated[aggregated.length - 1];
      var prev = aggregated.length > 1 ? aggregated[aggregated.length - 2] : null;
      return service.comparePeriods(curr, prev);
    },

    details: function (record) {
      return service.comparePeriods(record);
    },

    /**
     * Calculate normalized average activity growth score:
     * Average of the 4 metric growth percentages.
     */
    calculateAverageGrowth: function (growthMap) {
      if (!growthMap) return null;
      var numerics = [];
      METRICS.forEach(function (m) {
        var v = growthMap[m.key];
        if (typeof v === 'number' && isFinite(v)) {
          numerics.push(v);
        } else if (v === 'new') {
          numerics.push(100);
        }
      });
      if (!numerics.length) return null;
      return numerics.reduce(function (sum, val) { return sum + val; }, 0) / numerics.length;
    },

    /**
     * Get multi-period chronological trend array ending at record (strictly 4 periods for TV).
     */
    getTrend: function (record, limit) {
      limit = limit || 4;
      if (!record) return [];

      if (record.periodType === 'monthly') {
        var months = service.getMonthlyAggregatedHistory({ team: record.teamName, oldest: true });
        var filteredMonths = months.filter(function (m) {
          return String(m.periodKey) <= String(record.periodKey);
        });
        return filteredMonths.slice(-limit);
      }

      var rows = readRecords().filter(function (r) {
        return r.periodType === record.periodType &&
               r.teamName.toLowerCase() === record.teamName.toLowerCase() &&
               String(r.periodKey) <= String(record.periodKey);
      }).sort(sortChronological);

      return rows.slice(-limit);
    },

    trend: function (record, limit) {
      return service.getTrend(record, limit);
    },

    getTeamHistory: function (team) {
      return service.getHistory({ team: team, oldest: true });
    },

    compareTeams: function (teams) {
      var allRows = readRecords();
      var result = {};
      (teams || service.teams()).forEach(function (t) {
        result[t] = allRows.filter(function (r) {
          return r.teamName.toLowerCase() === t.toLowerCase();
        }).sort(sortChronological);
      });
      return result;
    },

    /**
     * Get published records compiled for TV display.
     * Returns both published weekly slides AND published monthly derived slides.
     */
    forTV: function () {
      var results = [];

      // 1. Weekly published slides (latest per team)
      var weeklyPublished = readRecords().filter(function (r) {
        return r.periodType === 'weekly' && (r.status === 'published' || r.status === 'approved');
      }).sort(sortReverseChronological);

      var seenWeekly = {};
      weeklyPublished.forEach(function (r) {
        var key = r.teamName;
        if (!seenWeekly[key]) {
          seenWeekly[key] = true;
          results.push(r);
        }
      });

      // 2. Monthly published slides (derived calendar month aggregation)
      var monthlyDerived = service.getMonthlyAggregatedHistory({ oldest: false });
      var seenMonthly = {};
      monthlyDerived.forEach(function (m) {
        if (isMonthlyPublished(m.periodKey, m.teamName)) {
          var key = m.teamName;
          if (!seenMonthly[key]) {
            seenMonthly[key] = true;
            results.push(m);
          }
        }
      });

      return results;
    },

    approve: function (id) {
      return service.update(id, { status: 'approved', approvedAt: new Date().toISOString() });
    },

    publish: function (id) {
      var updated = service.update(id, { status: 'published', publishedAt: new Date().toISOString() });
      if (EVA.services && EVA.services.tv) {
        var playlist = EVA.services.tv.playlist();
        var kpiSlot = playlist.filter(function (s) { return s.type === 'kpi'; })[0];
        if (kpiSlot && !kpiSlot.enabled) {
          EVA.services.tv.toggleSlot(kpiSlot.id);
        }
        EVA.services.tv.publish({
          reason: 'Sales KPI record (' + (updated ? updated.periodLabel : id) + ') published to TV'
        });
      }
      return updated;
    },

    unpublish: function (id) {
      var updated = service.update(id, { status: 'draft' });
      if (EVA.services && EVA.services.tv) {
        EVA.services.tv.publish({ reason: 'Sales KPI record removed from TV' });
      }
      return updated;
    },

    departments: function () {
      return ['BDA'];
    },

    teams: function () {
      var rows = readRecords();
      var list = ['Enterprise Sales', 'SMB Sales', 'Outbound BDA', 'Inbound SDRs'];
      rows.forEach(function (r) {
        if (r.teamName && list.indexOf(r.teamName) === -1 && r.teamName !== 'Whole Department') {
          list.push(r.teamName);
        }
      });
      return list;
    },

    years: function () {
      var yrs = [];
      readRecords().forEach(function (r) {
        var mKey = getWeekMonthKey(r);
        var y = parseInt(mKey.slice(0, 4), 10);
        if (y && yrs.indexOf(y) === -1) yrs.push(y);
        if (r.periodKey && r.periodKey.indexOf('-W') > -1) {
          var py = parseInt(r.periodKey.split('-W')[0], 10);
          if (py && yrs.indexOf(py) === -1) yrs.push(py);
        }
      });
      if (!yrs.length) yrs = [new Date().getFullYear()];
      return yrs.sort(function (a, b) { return b - a; });
    },

    months: function () {
      var list = [];
      for (var m = 1; m <= 12; m++) {
        list.push({ value: String(m).padStart(2, '0'), label: getMonthName(m), num: m });
      }
      return list;
    },

    stats: function () {
      var rows = readRecords();
      var weeklyCount = rows.filter(function (r) { return r.periodType === 'weekly'; }).length;
      var monthlyCount = service.getMonthlyAggregatedHistory().length;
      return {
        total: weeklyCount,
        weekly: weeklyCount,
        monthly: monthlyCount,
        drafts: rows.filter(function (r) { return r.status === 'draft'; }).length,
        approved: rows.filter(function (r) { return r.status === 'approved'; }).length,
        published: rows.filter(function (r) { return r.status === 'published'; }).length
      };
    },

    validate: function (d) {
      var errors = {};
      d = d || {};

      if (!d.periodLabel && !d.periodKey) {
        errors.periodLabel = 'Period label is required';
      }
      if (d.scope === 'team' && (!d.teamName || !String(d.teamName).trim())) {
        errors.teamName = 'Team name is required';
      }

      var m = d.metrics || d;
      METRICS.forEach(function (metric) {
        var val = m[metric.key];
        if (val === '' || val === null || val === undefined || isNaN(Number(val)) || Number(val) < 0) {
          errors[metric.key] = 'Enter a valid non-negative number';
        }
      });

      return {
        valid: Object.keys(errors).length === 0,
        errors: errors
      };
    }
  };

  // Cross-window storage listener
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) {
      if (EVA.store && typeof EVA.store.emit === 'function') {
        EVA.store.emit('kpi_records', { action: 'external' });
      }
    }
  });

  EVA.services = EVA.services || {};
  EVA.services.salesKpis = service;
  EVA.services.kpi = service;
})(window.EVA = window.EVA || {});
