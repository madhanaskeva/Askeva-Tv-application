/* ==========================================================================
   pages/sales-kpis.js — Sales & BDA KPI Historical Management Workbench
   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils;
  var ui = EVA.ui;
  var icon = EVA.icon;
  var S = EVA.services.salesKpis;

  var now = new Date();
  var currentYear = now.getFullYear();
  var currentMonth = now.getMonth() + 1;

  var state = {
    periodType: 'weekly',
    year: currentYear,
    month: currentMonth,
    weekNumber: 36,
    scope: 'team',
    department: 'BDA',
    teamName: 'Enterprise Sales',
    chartType: 'line',
    editingId: null,
    historyTab: 'weekly', // 'weekly' | 'monthly'

    // Form inputs (cached for live preview before saving)
    formMetrics: {
      leads: 128,
      meetings: 42,
      dealsWon: 18,
      newClients: 9
    },
    customContent: {
      heading: 'Record-Breaking Week 36!',
      message: 'Exceptional performance across all four metrics.',
      subMessage: 'Highest single-week closed deals in Q3.',
      footer: 'AskEVA Revenue Intelligence'
    },

    // History filters
    historyFilter: {
      team: 'all',
      year: 'all',
      month: 'all',
      search: ''
    }
  };

  /* ---------------- helper utilities ---------------- */

  function getActiveRecord() {
    if (state.editingId) {
      var found = S.getById(state.editingId);
      if (found) return found;
    }

    var pKey = state.year + '-W' + String(state.weekNumber).padStart(2, '0');
    var existing = S.getHistory({
      team: state.teamName
    }).filter(function (r) {
      return r.periodKey === pKey;
    })[0];

    return existing || null;
  }

  function getPreviewRecord() {
    var pKey = state.year + '-W' + String(state.weekNumber).padStart(2, '0');
    var weeks = S.getWeeksForMonth(state.year, state.month);
    var matchingWeek = weeks.filter(function (w) { return w.weekNumber === state.weekNumber; })[0];
    var pLabel = matchingWeek ? matchingWeek.periodLabel : ('Week ' + state.weekNumber + ', ' + S.getMonthName(state.month) + ' ' + state.year);
    var pStart = matchingWeek ? matchingWeek.startDate : '';
    var pEnd = matchingWeek ? matchingWeek.endDate : '';

    var active = getActiveRecord();

    return {
      id: state.editingId || (active ? active.id : 'preview_temp'),
      department: 'BDA',
      teamName: state.teamName,
      scope: 'team',
      periodType: 'weekly',
      reportingPeriod: 'weekly',
      periodLabel: pLabel,
      periodKey: pKey,
      periodStart: pStart,
      periodEnd: pEnd,
      monthKey: S.getWeekMonthKey({ periodStart: pStart, periodEnd: pEnd, periodKey: pKey }),
      weekNumber: state.weekNumber,
      metrics: {
        leads: Number(state.formMetrics.leads) || 0,
        meetings: Number(state.formMetrics.meetings) || 0,
        dealsWon: Number(state.formMetrics.dealsWon) || 0,
        newClients: Number(state.formMetrics.newClients) || 0
      },
      customContent: Object.assign({}, state.customContent),
      chartType: state.chartType,
      status: active ? active.status : 'draft'
    };
  }

  function syncFormFromRecord(rec) {
    if (!rec) return;
    state.department = 'BDA';
    state.teamName = rec.teamName || state.teamName;
    state.chartType = rec.chartType || state.chartType;

    if (rec.periodKey && rec.periodKey.indexOf('-W') > -1) {
      var parts = rec.periodKey.split('-W');
      state.year = parseInt(parts[0], 10) || state.year;
      state.weekNumber = parseInt(parts[1], 10) || state.weekNumber;
    }
    if (rec.monthKey) {
      var mParts = rec.monthKey.split('-');
      if (mParts.length === 2) {
        state.month = parseInt(mParts[1], 10) || state.month;
      }
    }

    var m = rec.metrics || rec;
    state.formMetrics = {
      leads: m.leads !== undefined ? m.leads : 0,
      meetings: m.meetings !== undefined ? m.meetings : 0,
      dealsWon: m.dealsWon !== undefined ? m.dealsWon : 0,
      newClients: m.newClients !== undefined ? m.newClients : 0
    };

    state.customContent = Object.assign({
      heading: '',
      message: rec.customMessage || '',
      subMessage: '',
      footer: ''
    }, rec.customContent || {});
  }

  /* ---------------- UI Renderers ---------------- */

  function renderStats() {
    var stats = S.stats();
    return '<div class="kpi-stats-strip">' +
      '<div class="kpi-stat-item">' +
        '<span class="kpi-stat-item__val">' + stats.weekly + '</span>' +
        '<span class="kpi-stat-item__label">Weekly Records (Source)</span>' +
      '</div>' +
      '<div class="kpi-stat-item">' +
        '<span class="kpi-stat-item__val">' + stats.monthly + '</span>' +
        '<span class="kpi-stat-item__label">Derived Monthly Periods</span>' +
      '</div>' +
      '<div class="kpi-stat-item">' +
        '<span class="kpi-stat-item__val kpi-stat-item__val--live">' + stats.published + '</span>' +
        '<span class="kpi-stat-item__label">Live On Office TV</span>' +
      '</div>' +
    '</div>';
  }

  function renderEditorForm() {
    var isEditing = Boolean(state.editingId);
    var weeks = S.getWeeksForMonth(state.year, state.month);

    // Make sure current weekNumber is valid for the selected month/year
    var hasWeek = weeks.some(function (w) { return w.weekNumber === state.weekNumber; });
    if (!hasWeek && weeks.length > 0) {
      state.weekNumber = weeks[0].weekNumber;
    }

    var teamOptions = S.teams().map(function (t) {
      return { value: t, label: t };
    });

    var yearOptions = S.years().map(function (y) {
      return { value: y, label: String(y) };
    });

    var monthOptions = S.months().map(function (m) {
      return { value: m.num, label: m.label };
    });

    var chartOptions = S.CHARTS.map(function (c) {
      return { value: c.value, label: c.label };
    });

    return '<section class="card kpi-editor-card">' +
      '<div class="card__head">' +
        '<div>' +
          '<h2 class="card__title">' +
            icon('activity') +
            (isEditing ? 'Edit Historical Weekly Record' : 'Record Weekly Sales KPI Period') +
          '</h2>' +
          '<p class="card__sub">Weekly records are the sole source of truth. Monthly performance and MoM growth are automatically derived.</p>' +
        '</div>' +
        (isEditing ? '<button class="btn btn--soft btn--sm" data-kpi-action="cancel-edit">Cancel Edit</button>' : '') +
      '</div>' +
      '<div class="card__body">' +
        '<form id="kpiForm" novalidate>' +
          '<div class="kpi-field-row">' +
            '<div class="kpi-field-col">' +
              ui.field({
                type: 'select',
                label: 'Team Name (BDA)',
                name: 'teamName',
                value: state.teamName,
                options: teamOptions,
                hint: 'Sales & BDA execution team'
              }) +
            '</div>' +
            '<div class="kpi-field-col">' +
              ui.field({
                type: 'select',
                label: 'Calendar Year',
                name: 'year',
                value: state.year,
                options: yearOptions
              }) +
            '</div>' +
            '<div class="kpi-field-col">' +
              ui.field({
                type: 'select',
                label: 'Month',
                name: 'month',
                value: state.month,
                options: monthOptions
              }) +
            '</div>' +
          '</div>' +

          '<div class="kpi-field-row">' +
            '<div class="kpi-field-col kpi-field-col--grow">' +
              ui.field({
                type: 'select',
                label: 'Calendar Week (Start – End)',
                name: 'weekNumber',
                value: state.weekNumber,
                options: weeks.map(function (w) {
                  return { value: w.weekNumber, label: w.label + ' (' + w.startDate + ' – ' + w.endDate + ')' };
                }),
                hint: 'Boundary weeks crossing months follow the >=4 days majority rule'
              }) +
            '</div>' +
            '<div class="kpi-field-col">' +
              ui.field({
                type: 'select',
                label: 'Chart Style on TV',
                name: 'chartType',
                value: state.chartType,
                options: chartOptions,
                hint: 'Line (Progression), Bars (Periods), or Pie (Metric activity distribution)'
              }) +
            '</div>' +
          '</div>' +

          '<div class="kpi-form-metrics-box">' +
            '<div class="kpi-form-metrics-box__title">' +
              icon('award', { size: 14 }) +
              ' KPI Metric Values (Week Total)' +
            '</div>' +
            '<div class="kpi-metrics-row">' +
              '<div class="kpi-metric-field">' +
                ui.field({
                  type: 'number',
                  label: '1. Leads',
                  name: 'leads',
                  value: state.formMetrics.leads,
                  min: 0,
                  required: true
                }) +
              '</div>' +
              '<div class="kpi-metric-field">' +
                ui.field({
                  type: 'number',
                  label: '2. Meetings',
                  name: 'meetings',
                  value: state.formMetrics.meetings,
                  min: 0,
                  required: true
                }) +
              '</div>' +
              '<div class="kpi-metric-field">' +
                ui.field({
                  type: 'number',
                  label: '3. Deals Won',
                  name: 'dealsWon',
                  value: state.formMetrics.dealsWon,
                  min: 0,
                  required: true
                }) +
              '</div>' +
              '<div class="kpi-metric-field">' +
                ui.field({
                  type: 'number',
                  label: '4. New Clients',
                  name: 'newClients',
                  value: state.formMetrics.newClients,
                  min: 0,
                  required: true
                }) +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="kpi-field-row">' +
            '<div class="kpi-field-col kpi-field-col--full">' +
              ui.field({
                label: 'Custom TV Heading (Optional)',
                name: 'customHeading',
                value: state.customContent.heading || '',
                placeholder: 'e.g. Record-Breaking Performance',
                maxlength: 60
              }) +
            '</div>' +
          '</div>' +

          '<div class="kpi-field-row">' +
            '<div class="kpi-field-col kpi-field-col--full">' +
              ui.field({
                type: 'textarea',
                label: 'Custom TV Message / Commentary (Optional)',
                name: 'customMessage',
                value: state.customContent.message || '',
                rows: 2,
                maxlength: 220,
                placeholder: 'e.g. Exceptional team conversion this week. Keep up the great pace!'
              }) +
            '</div>' +
          '</div>' +
        '</form>' +

        '<div class="kpi-editor-actions">' +
          '<button class="btn btn--soft" type="button" data-kpi-action="save-draft">' +
            icon('save', { size: 16 }) +
            (isEditing ? 'Update Draft' : 'Save Draft') +
          '</button>' +
          '<button class="btn btn--primary" type="button" data-kpi-action="approve">' +
            icon('check', { size: 16 }) +
            'Approve Metrics' +
          '</button>' +
          '<button class="btn btn--primary btn--push-kpi" type="button" data-kpi-action="publish">' +
            icon('send', { size: 16 }) +
            'Push to TV' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function renderPreviewSection() {
    var previewRecord = getPreviewRecord();
    var details = S.details(previewRecord);
    var trend = S.trend(previewRecord, 4);
    if (!trend.length) trend = [previewRecord];

    var slideHtml = EVA.slides.renderKpi({
      record: previewRecord,
      details: details,
      trend: trend
    }, EVA.services.settings ? EVA.services.settings.get() : {});

    return '<section class="card kpi-preview-card">' +
      '<div class="card__head">' +
        '<div>' +
          '<h2 class="card__title">' +
            icon('eye') +
            'Live TV Template Preview' +
          '</h2>' +
          '<p class="card__sub">Exact rendering shown on 16:9 office display, dynamically driven by your historical records.</p>' +
        '</div>' +
        '<div class="kpi-preview-card__badge">' +
          '<i class="kpi-status-dot"></i> LIVE CANVAS' +
        '</div>' +
      '</div>' +
      '<div class="card__body kpi-preview-card__body">' +
        '<div class="kpi-preview-stage-wrap">' +
          '<div class="slide-stage kpi-preview-stage">' +
            slideHtml +
          '</div>' +
        '</div>' +
        '<div class="kpi-preview-hints">' +
          '<span>' + icon('check-circle', { size: 13 }) + ' TV display strictly limits trend to latest 4 chronological periods</span>' +
          '<span>' + icon('activity', { size: 13 }) + ' WoW / MoM compares against immediate previous period</span>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function renderHistorySection() {
    var isMonthlyTab = state.historyTab === 'monthly';
    var filters = state.historyFilter;
    var teams = ['all'].concat(S.teams());
    var years = ['all'].concat(S.years());
    var months = [{ value: 'all', label: 'All Months' }].concat(
      S.months().map(function (m) {
        return { value: m.value, label: m.label };
      })
    );

    var contentHtml = '';

    if (isMonthlyTab) {
      // Monthly Aggregated Derived History
      var monthlyRecords = S.getMonthlyAggregatedHistory(filters);
      var mRowsHtml = monthlyRecords.map(function (m) {
        var leadsG = S.formatGrowth(m.growth ? m.growth.leads : null);
        var meetingsG = S.formatGrowth(m.growth ? m.growth.meetings : null);
        var dealsG = S.formatGrowth(m.growth ? m.growth.dealsWon : null);
        var clientsG = S.formatGrowth(m.growth ? m.growth.newClients : null);
        var isLiveOnTv = S.isMonthlyPublished(m.periodKey, m.teamName);

        var avgGrowthHtml = '';
        if (m.averageGrowth !== null && m.averageGrowth !== undefined) {
          var aNum = Number(m.averageGrowth);
          var aText = (aNum >= 0 ? '+' : '') + aNum.toFixed(1) + '%';
          avgGrowthHtml = '<small class="kpi-table-avg" title="Month-over-month average activity growth">' + aText + ' MoM</small>';
        }

        var statusBadge = '<span class="badge badge--' + (isLiveOnTv ? 'live' : 'neutral') + '">' + (isLiveOnTv ? 'ON TV' : 'DERIVED') + '</span>';

        return '<tr data-kpi-monthly-key="' + U.attr(m.periodKey) + '" data-kpi-team="' + U.attr(m.teamName) + '">' +
          '<td>' +
            '<strong>' + U.esc(m.periodLabel) + '</strong>' +
            '<span class="kpi-table-sub">CALENDAR AGGREGATION · ' + U.esc(m.periodKey) + '</span>' +
          '</td>' +
          '<td>' +
            '<strong>' + U.esc(m.teamName) + '</strong>' +
            '<span class="kpi-table-sub">Department: BDA</span>' +
          '</td>' +
          '<td>' +
            '<b class="kpi-val">' + m.leads.toLocaleString() + '</b>' +
            (m.previousPeriodKey ? '<span class="kpi-g-pill">' + leadsG + '</span>' : '') +
          '</td>' +
          '<td>' +
            '<b class="kpi-val">' + m.meetings.toLocaleString() + '</b>' +
            (m.previousPeriodKey ? '<span class="kpi-g-pill">' + meetingsG + '</span>' : '') +
          '</td>' +
          '<td>' +
            '<b class="kpi-val">' + m.dealsWon.toLocaleString() + '</b>' +
            (m.previousPeriodKey ? '<span class="kpi-g-pill">' + dealsG + '</span>' : '') +
          '</td>' +
          '<td>' +
            '<b class="kpi-val">' + m.newClients.toLocaleString() + '</b>' +
            (m.previousPeriodKey ? '<span class="kpi-g-pill">' + clientsG + '</span>' : '') +
          '</td>' +
          '<td>' +
            statusBadge +
            avgGrowthHtml +
          '</td>' +
          '<td>' +
            '<div class="kpi-table-actions">' +
              '<button class="btn btn--soft btn--sm" type="button" data-kpi-action="preview-monthly" title="Preview Monthly TV Slide">' +
                icon('eye', { size: 14 }) + ' Preview' +
              '</button>' +
              (isLiveOnTv
                ? '<button class="btn btn--soft btn--sm" type="button" data-kpi-action="unpublish-monthly" title="Remove Monthly Slide from TV">' +
                    icon('eye-off', { size: 14 }) + ' Remove TV' +
                  '</button>'
                : '<button class="btn btn--primary btn--sm" type="button" data-kpi-action="publish-monthly" title="Push Monthly Slide to TV">' +
                    icon('send', { size: 14 }) + ' Push to TV' +
                  '</button>') +
            '</div>' +
          '</td>' +
        '</tr>';
      }).join('');

      if (!monthlyRecords.length) {
        mRowsHtml = '<tr><td colspan="8" class="kpi-table-empty">No monthly aggregated records found matching your filters.</td></tr>';
      }

      contentHtml = '<div class="kpi-table-wrap">' +
        '<table class="kpi-table">' +
          '<thead>' +
            '<tr>' +
              '<th>Month & Year</th>' +
              '<th>Team</th>' +
              '<th>Leads (Sum)</th>' +
              '<th>Meetings (Sum)</th>' +
              '<th>Deals Won (Sum)</th>' +
              '<th>New Clients (Sum)</th>' +
              '<th>Status & MoM Growth</th>' +
              '<th>Actions</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            mRowsHtml +
          '</tbody>' +
        '</table>' +
      '</div>';
    } else {
      // Weekly Records (Primary Source)
      var records = S.getHistory(filters);
      var wRowsHtml = records.map(function (r) {
        var details = S.details(r);
        var growth = details.growth || {};
        var prev = details.previous;

        var leadsG = S.formatGrowth(growth.leads);
        var meetingsG = S.formatGrowth(growth.meetings);
        var dealsG = S.formatGrowth(growth.dealsWon);
        var clientsG = S.formatGrowth(growth.newClients);

        var isLive = r.status === 'published';
        var statusTone = isLive ? 'live' : (r.status === 'approved' ? 'lime' : 'neutral');
        var statusBadge = '<span class="badge badge--' + statusTone + '">' + (isLive ? 'ON TV' : U.esc(r.status.toUpperCase())) + '</span>';

        var avgGrowthHtml = '';
        if (details.averageGrowth !== null && details.averageGrowth !== undefined) {
          var aNum = Number(details.averageGrowth);
          var aText = (aNum >= 0 ? '+' : '') + aNum.toFixed(1) + '%';
          avgGrowthHtml = '<small class="kpi-table-avg" title="Week-over-week activity growth">' + aText + ' WoW</small>';
        }

        return '<tr data-kpi-id="' + U.attr(r.id) + '">' +
          '<td>' +
            '<strong>' + U.esc(r.periodLabel) + '</strong>' +
            '<span class="kpi-table-sub">' + U.esc(r.periodKey) + (r.periodStart && r.periodEnd ? ' (' + r.periodStart + ' to ' + r.periodEnd + ')' : '') + '</span>' +
          '</td>' +
          '<td>' +
            '<strong>' + U.esc(r.teamName) + '</strong>' +
            '<span class="kpi-table-sub">Department: BDA</span>' +
          '</td>' +
          '<td>' +
            '<b class="kpi-val">' + r.leads + '</b>' +
            (prev ? '<span class="kpi-g-pill">' + leadsG + '</span>' : '') +
          '</td>' +
          '<td>' +
            '<b class="kpi-val">' + r.meetings + '</b>' +
            (prev ? '<span class="kpi-g-pill">' + meetingsG + '</span>' : '') +
          '</td>' +
          '<td>' +
            '<b class="kpi-val">' + r.dealsWon + '</b>' +
            (prev ? '<span class="kpi-g-pill">' + dealsG + '</span>' : '') +
          '</td>' +
          '<td>' +
            '<b class="kpi-val">' + r.newClients + '</b>' +
            (prev ? '<span class="kpi-g-pill">' + clientsG + '</span>' : '') +
          '</td>' +
          '<td>' +
            statusBadge +
            avgGrowthHtml +
          '</td>' +
          '<td>' +
            '<div class="kpi-table-actions">' +
              '<button class="btn btn--soft btn--icon" type="button" data-kpi-action="edit-row" title="Edit this period">' +
                icon('edit', { size: 14 }) +
              '</button>' +
              '<button class="btn btn--soft btn--icon" type="button" data-kpi-action="duplicate-row" title="Duplicate record">' +
                icon('copy', { size: 14 }) +
              '</button>' +
              '<button class="btn btn--soft btn--icon" type="button" data-kpi-action="preview-row" title="Preview TV slide">' +
                icon('eye', { size: 14 }) +
              '</button>' +
              (isLive
                ? '<button class="btn btn--soft btn--icon" type="button" data-kpi-action="unpublish-row" title="Remove from TV">' +
                    icon('eye-off', { size: 14 }) +
                  '</button>'
                : '<button class="btn btn--primary btn--icon" type="button" data-kpi-action="publish-row" title="Push to TV">' +
                    icon('send', { size: 14 }) +
                  '</button>') +
              '<button class="btn btn--soft btn--icon kpi-btn--danger" type="button" data-kpi-action="delete-row" title="Delete record">' +
                icon('trash', { size: 14 }) +
              '</button>' +
            '</div>' +
          '</td>' +
        '</tr>';
      }).join('');

      if (!records.length) {
        wRowsHtml = '<tr><td colspan="8" class="kpi-table-empty">No historical weekly records found matching your filters.</td></tr>';
      }

      contentHtml = '<div class="kpi-table-wrap">' +
        '<table class="kpi-table">' +
          '<thead>' +
            '<tr>' +
              '<th>Period & Dates</th>' +
              '<th>Team</th>' +
              '<th>Leads</th>' +
              '<th>Meetings</th>' +
              '<th>Deals Won</th>' +
              '<th>New Clients</th>' +
              '<th>Status & WoW Growth</th>' +
              '<th>Actions</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            wRowsHtml +
          '</tbody>' +
        '</table>' +
      '</div>';
    }

    return '<section class="card kpi-history-card">' +
      '<div class="card__head">' +
        '<div>' +
          '<h2 class="card__title">' +
            icon('list') +
            'KPI Performance History' +
          '</h2>' +
          '<p class="card__sub">Inspect individual weekly performance records or view derived monthly aggregated history.</p>' +
        '</div>' +
        '<div class="kpi-history-tabs">' +
          '<button class="kpi-tab-btn ' + (!isMonthlyTab ? 'is-active' : '') + '" type="button" data-kpi-tab="weekly">' +
            icon('calendar', { size: 14 }) + ' Weekly Records (Input)' +
          '</button>' +
          '<button class="kpi-tab-btn ' + (isMonthlyTab ? 'is-active' : '') + '" type="button" data-kpi-tab="monthly">' +
            icon('pie-chart', { size: 14 }) + ' Derived Monthly History' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="card__body">' +
        '<div class="kpi-history-filters">' +
          '<div class="kpi-filter-group">' +
            '<label>Team' +
              '<select data-filter-key="team">' +
                teams.map(function (t) {
                  return '<option value="' + U.attr(t) + '"' + (filters.team === t ? ' selected' : '') + '>' + (t === 'all' ? 'All Teams' : U.esc(t)) + '</option>';
                }).join('') +
              '</select>' +
            '</label>' +
          '</div>' +
          '<div class="kpi-filter-group">' +
            '<label>Year' +
              '<select data-filter-key="year">' +
                years.map(function (y) {
                  return '<option value="' + U.attr(y) + '"' + (String(filters.year) === String(y) ? ' selected' : '') + '>' + (y === 'all' ? 'All Years' : y) + '</option>';
                }).join('') +
              '</select>' +
            '</label>' +
          '</div>' +
          '<div class="kpi-filter-group">' +
            '<label>Month' +
              '<select data-filter-key="month">' +
                months.map(function (m) {
                  return '<option value="' + U.attr(m.value) + '"' + (filters.month === m.value ? ' selected' : '') + '>' + U.esc(m.label) + '</option>';
                }).join('') +
              '</select>' +
            '</label>' +
          '</div>' +
          '<div class="kpi-filter-group kpi-filter-group--search">' +
            '<label>Search' +
              '<input type="search" placeholder="Search team, period, heading…" value="' + U.attr(filters.search) + '" data-filter-key="search">' +
            '</label>' +
          '</div>' +
        '</div>' +
        contentHtml +
      '</div>' +
    '</section>';
  }

  /* ---------------- main render ---------------- */

  function render() {
    return '<div class="kpi-page">' +
      '<div class="page__head">' +
        '<div>' +
          '<h1 class="page__title">Sales & BDA KPI Metrics</h1>' +
          '<p class="page__desc">Weekly performance entry (single source of truth), derived monthly aggregation, and TV trend broadcasting.</p>' +
        '</div>' +
        '<div style="display:flex;gap:10px;align-items:center;">' +
          '<button class="btn btn--soft" type="button" data-kpi-action="preview-tv-deck">' +
            icon('eye', { size: 16 }) + ' Preview TV Deck' +
          '</button>' +
          '<button class="btn btn--primary" type="button" data-kpi-action="push-all-tv">' +
            icon('send', { size: 16 }) + ' Push All to TV' +
          '</button>' +
        '</div>' +
      '</div>' +
      renderStats() +
      '<div class="kpi-workbench">' +
        renderEditorForm() +
        renderPreviewSection() +
      '</div>' +
      renderHistorySection() +
    '</div>';
  }

  /* ---------------- mount & interactions ---------------- */

  function mount(root) {
    function readFormValues() {
      var formEl = root.querySelector('#kpiForm');
      if (!formEl) return null;
      var data = ui.readForm(formEl);

      state.teamName = data.teamName || state.teamName;
      state.chartType = data.chartType || state.chartType;

      if (data.year) state.year = parseInt(data.year, 10) || state.year;
      if (data.month) state.month = parseInt(data.month, 10) || state.month;
      if (data.weekNumber) state.weekNumber = parseInt(data.weekNumber, 10) || state.weekNumber;

      state.formMetrics = {
        leads: Math.max(0, parseInt(data.leads, 10) || 0),
        meetings: Math.max(0, parseInt(data.meetings, 10) || 0),
        dealsWon: Math.max(0, parseInt(data.dealsWon, 10) || 0),
        newClients: Math.max(0, parseInt(data.newClients, 10) || 0)
      };

      state.customContent = {
        heading: data.customHeading || '',
        message: data.customMessage || '',
        subMessage: state.customContent.subMessage || '',
        footer: state.customContent.footer || 'AskEVA Revenue Intelligence'
      };

      return getPreviewRecord();
    }

    function handleSave(targetStatus) {
      var record = readFormValues();
      var check = S.validate(record);
      if (!check.valid) {
        return ui.showErrors(root.querySelector('#kpiForm'), check.errors);
      }

      record.status = targetStatus || 'draft';
      var res;
      if (state.editingId) {
        res = S.update(state.editingId, record);
        if (targetStatus === 'published') {
          S.publish(state.editingId);
          EVA.publish.success({
            text: 'KPI metrics for ' + (record.periodLabel || 'this period') + ' (' + record.teamName + ') are now live on Office TV!'
          });
        } else {
          ui.toast.success(targetStatus === 'approved' ? 'KPI metrics approved!' : 'KPI draft updated.');
        }
      } else {
        var createRes = S.create(record);
        if (targetStatus && targetStatus !== 'draft') {
          S.update(createRes.id, { status: targetStatus });
        }
        res = createRes.record;
        if (targetStatus === 'published') {
          S.publish(createRes.id);
          EVA.publish.success({
            text: 'KPI metrics for ' + (record.periodLabel || 'this period') + ' (' + record.teamName + ') are now live on Office TV!'
          });
        } else {
          ui.toast.success(targetStatus === 'approved' ? 'KPI metrics saved and approved!' : 'New weekly KPI record saved to history.');
        }
      }

      state.editingId = null;
      EVA.app.refresh();
    }

    // Live form inputs listener to update state and re-render preview
    root.addEventListener('input', function (e) {
      if (e.target.closest('#kpiForm')) {
        readFormValues();
        var previewStage = root.querySelector('.kpi-preview-stage');
        if (previewStage) {
          var rec = getPreviewRecord();
          var details = S.details(rec);
          var trend = S.trend(rec, 4);
          if (!trend.length) trend = [rec];
          previewStage.innerHTML = EVA.slides.renderKpi({
            record: rec,
            details: details,
            trend: trend
          }, EVA.services.settings ? EVA.services.settings.get() : {});
        }
      }

      // History search filter
      if (e.target.dataset.filterKey === 'search') {
        state.historyFilter.search = e.target.value;
        EVA.app.refresh();
      }
    });

    // Change listener for select drop-downs
    root.addEventListener('change', function (e) {
      if (e.target.closest('#kpiForm')) {
        readFormValues();
        EVA.app.refresh();
      }

      if (e.target.dataset.filterKey) {
        state.historyFilter[e.target.dataset.filterKey] = e.target.value;
        EVA.app.refresh();
      }
    });

    // Click actions
    root.addEventListener('click', function (e) {
      // Tab click
      var tabBtn = e.target.closest('[data-kpi-tab]');
      if (tabBtn) {
        state.historyTab = tabBtn.dataset.kpiTab;
        return EVA.app.refresh();
      }

      var btn = e.target.closest('[data-kpi-action]');
      if (!btn) return;
      var action = btn.dataset.kpiAction;

      if (action === 'save-draft') {
        return handleSave('draft');
      }
      if (action === 'approve') {
        return handleSave('approved');
      }
      if (action === 'publish') {
        return handleSave('published');
      }
      if (action === 'cancel-edit') {
        state.editingId = null;
        return EVA.app.refresh();
      }

      if (action === 'push-all-tv') {
        if (EVA.services && EVA.services.tv) {
          var playlist = EVA.services.tv.playlist();
          var kpiSlot = playlist.filter(function (s) { return s.type === 'kpi'; })[0];
          if (kpiSlot && !kpiSlot.enabled) {
            EVA.services.tv.toggleSlot(kpiSlot.id);
          }
          EVA.services.tv.publish({ reason: 'Sales KPI metrics updated on Office TV' });
          EVA.publish.success({
            text: 'All published Sales KPI slides (weekly and monthly) are now live on the Office TV broadcast!'
          });
        }
        return;
      }

      if (action === 'preview-tv-deck') {
        if (EVA.publish && typeof EVA.publish.preview === 'function') {
          EVA.publish.preview({
            title: 'Office TV KPI Slide Deck',
            sub: 'All active and published slides broadcast to the office display.'
          });
        }
        return;
      }

      // Monthly preview row
      if (action === 'preview-monthly') {
        var mRow = btn.closest('[data-kpi-monthly-key]');
        if (mRow) {
          var mKey = mRow.dataset.kpiMonthlyKey;
          var team = mRow.dataset.kpiTeam;
          var found = S.getMonthlyAggregatedHistory({ team: team }).filter(function (m) {
            return m.periodKey === mKey;
          })[0];
          if (found) {
            var mDetails = S.details(found);
            var mTrend = S.trend(found, 4);
            if (!mTrend.length) mTrend = [found];
            var mHtml = EVA.slides.renderKpi({
              record: found,
              details: mDetails,
              trend: mTrend
            }, EVA.services.settings ? EVA.services.settings.get() : {});

            ui.modal({
              title: 'Monthly Aggregated Slide Preview — ' + found.periodLabel + ' (' + found.teamName + ')',
              size: 'lg',
              body: '<div class="slide-stage" style="aspect-ratio:16/9;border-radius:10px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.5);">' + mHtml + '</div>',
              foot: '<button class="btn btn--soft" data-close>Close</button>'
            });
          }
        }
        return;
      }

      // Monthly publish toggle
      if (action === 'publish-monthly' || action === 'unpublish-monthly') {
        var mTargetRow = btn.closest('[data-kpi-monthly-key]');
        if (mTargetRow) {
          var mTargetKey = mTargetRow.dataset.kpiMonthlyKey;
          var targetTeam = mTargetRow.dataset.kpiTeam;
          if (action === 'publish-monthly') {
            S.publishMonthly(mTargetKey, targetTeam);
            EVA.publish.success({
              text: 'Monthly KPI slide for ' + mTargetKey + ' (' + targetTeam + ') published to Office TV.'
            });
          } else {
            S.unpublishMonthly(mTargetKey, targetTeam);
            ui.toast.info('Removed from TV', 'Monthly KPI slide removed from broadcast.');
          }
          EVA.app.refresh();
        }
        return;
      }

      var row = btn.closest('[data-kpi-id]');
      var id = row && row.dataset.kpiId;
      if (!id) return;

      if (action === 'publish-row') {
        S.publish(id);
        var pubRec = S.getById(id);
        EVA.publish.success({
          text: (pubRec ? pubRec.periodLabel : 'Record') + ' published to Office TV.'
        });
        return EVA.app.refresh();
      }

      if (action === 'unpublish-row') {
        S.unpublish(id);
        ui.toast.info('Removed from TV', 'KPI slide moved to draft.');
        return EVA.app.refresh();
      }

      if (action === 'edit-row') {
        var rec = S.getById(id);
        if (rec) {
          state.editingId = id;
          syncFormFromRecord(rec);
          EVA.app.refresh();
          var top = root.querySelector('.kpi-editor-card');
          if (top) top.scrollIntoView({ behavior: 'smooth' });
        }
      }

      if (action === 'duplicate-row') {
        var dup = S.duplicate(id);
        if (dup) {
          ui.toast.success('Record duplicated as a draft.');
          EVA.app.refresh();
        }
      }

      if (action === 'delete-row') {
        ui.confirm({
          title: 'Delete KPI Record?',
          text: 'Are you sure you want to delete this weekly historical record? Derived monthly summaries and WoW analytics will automatically recalculate.',
          confirmLabel: 'Delete Record',
          tone: 'danger'
        }).then(function (ok) {
          if (ok) {
            S.delete(id);
            if (state.editingId === id) state.editingId = null;
            ui.toast.success('Record deleted.');
            EVA.app.refresh();
          }
        });
      }

      if (action === 'preview-row') {
        var targetRec = S.getById(id);
        if (targetRec) {
          var d = S.details(targetRec);
          var tr = S.trend(targetRec, 4);
          if (!tr.length) tr = [targetRec];
          var html = EVA.slides.renderKpi({
            record: targetRec,
            details: d,
            trend: tr
          }, EVA.services.settings ? EVA.services.settings.get() : {});

          ui.modal({
            title: 'KPI Slide Preview — ' + targetRec.periodLabel + ' (' + targetRec.teamName + ')',
            size: 'lg',
            body: '<div class="slide-stage" style="aspect-ratio:16/9;border-radius:10px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.5);">' + html + '</div>',
            foot: '<button class="btn btn--soft" data-close>Close</button>'
          });
        }
      }
    });
  }

  EVA.pages.salesKpis = {
    title: 'Sales KPI Metrics',
    render: render,
    mount: mount
  };

  // Support both hash aliases #/salesKpis and #/sales-kpis
  EVA.pages['sales-kpis'] = EVA.pages.salesKpis;
})(window.EVA = window.EVA || {});

