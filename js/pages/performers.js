/* ==========================================================================
   pages/performers.js — Top Performer of the Day / Week / Month
   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils, ui = EVA.ui, icon = EVA.icon;
  var S = EVA.services;

  var state = { tab: 'all' };

  function employeeOptions(selected) {
    return S.employees.all()
      .filter(function (e) { return e.status !== 'inactive' || e.id === selected; })
      .map(function (e) { return { value: e.id, label: e.name + ' · ' + e.role }; });
  }

  /* ---------------- form ---------------- */

  function openForm(id, period, onSaved) {
    var rec = id ? S.performers.get(id) : null;
    var p = rec ? rec.period : (period || 'day');

    function body(errors) {
      errors = errors || {};
      var r = rec || {};
      return '<form id="perfForm" novalidate>' +
        '<div class="field-row">' +
          ui.field({
            type: 'select', label: 'Employee', name: 'employeeId', required: true,
            value: r.employeeId || '', placeholder: 'Select an employee',
            options: employeeOptions(r.employeeId), error: errors.employeeId
          }) +
          ui.field({
            type: 'select', label: 'Period', name: 'period', value: r.period || p,
            options: S.performers.PERIODS.map(function (x) { return { value: x.key, label: x.title }; })
          }) +
        '</div>' +
        '<div class="field-row">' +
          ui.field({
            label: 'Performance title', name: 'title', required: true, value: r.title || '',
            placeholder: 'e.g. Highest sales today', maxlength: 70, error: errors.title,
            hint: 'Shown large on the TV — keep it punchy.'
          }) +
          ui.field({
            type: 'number', label: 'Rank', name: 'rank', value: r.rank || S.performers.nextRank(p),
            min: 1, max: 20, error: errors.rank, hint: 'Rank 1 is the headline card.'
          }) +
        '</div>' +
        ui.field({
          type: 'textarea', label: 'Achievement description', name: 'description',
          value: r.description || '', maxlength: 220, rows: 3,
          placeholder: 'What did they do? One or two sentences.',
          error: errors.description, hint: 'Appears as the quote underneath their name.'
        }) +
      '</form>';
    }

    ui.modal({
      title: rec ? 'Edit recognition' : 'Add top performer',
      sub: rec ? 'Update this recognition card' : 'Recognise someone on the office TV',
      icon: 'trophy',
      size: 'lg',
      body: body(),
      foot:
        '<button class="btn btn--soft" type="button" data-close>Cancel</button>' +
        '<button class="btn btn--soft" type="button" data-preview>' + icon('eye', { size: 16 }) + 'Preview slide</button>' +
        '<button class="btn btn--primary" type="button" data-save>' + icon('save', { size: 16 }) + 'Save</button>',
      onMount: function (c) {
        var form = c.el.querySelector('#perfForm');

        function collect() {
          var d = ui.readForm(form);
          d.status = rec ? rec.status : 'draft';
          return d;
        }

        c.el.querySelector('[data-preview]').addEventListener('click', function () {
          var d = collect();
          var check = S.performers.validate(d);
          if (!check.valid) { ui.showErrors(form, check.errors); return; }
          var emp = S.employees.display(d.employeeId);
          var meta = S.performers.periodMeta(d.period);
          EVA.publish.preview({
            title: 'Slide preview',
            sub: 'How this recognition will look on the office TV',
            hidePublish: true,
            autoplay: false,
            slides: [{
              id: 'tmp', type: 'performer', duration: 12, label: meta.title,
              data: {
                name: emp.name, role: emp.role, department: emp.department,
                photo: emp.photo, initials: U.initials(emp.name),
                rank: d.rank, title: d.title, description: d.description,
                periodTitle: meta.title, periodLabel: meta.label
              }
            }]
          });
        });

        c.el.querySelector('[data-save]').addEventListener('click', save);
        form.addEventListener('submit', function (e) { e.preventDefault(); save(); });

        function save() {
          var d = collect();
          var check = S.performers.validate(d);
          if (!check.valid) {
            ui.showErrors(form, check.errors);
            ui.toast.error('Check the highlighted fields');
            return;
          }
          if (rec) {
            S.performers.update(id, check.data);
            ui.toast.success('Recognition updated');
          } else {
            S.performers.create(check.data);
            ui.toast.success('Recognition added', 'Publish it to put it on the TV.');
          }
          c.close();
          if (onSaved) onSaved();
          EVA.app.refresh();
        }
      }
    });
  }

  function changeEmployee(id) {
    var rec = S.performers.get(id);
    if (!rec) return;
    ui.modal({
      title: 'Change employee',
      sub: 'Reassign "' + U.truncate(rec.title, 40) + '" to someone else',
      icon: 'users',
      size: 'sm',
      body: '<form id="swapForm">' + ui.field({
        type: 'select', label: 'Employee', name: 'employeeId', value: rec.employeeId,
        options: employeeOptions(rec.employeeId),
        hint: 'Reassigning moves this card back to draft so you can review it before publishing.'
      }) + '</form>',
      foot:
        '<button class="btn btn--soft" type="button" data-close>Cancel</button>' +
        '<button class="btn btn--primary" type="button" data-swap>' + icon('check', { size: 16 }) + 'Change employee</button>',
      onMount: function (c) {
        c.el.querySelector('[data-swap]').addEventListener('click', function () {
          var val = c.el.querySelector('#swapForm').elements.employeeId.value;
          S.performers.changeEmployee(id, val);
          ui.toast.success('Employee changed', S.employees.display(val).name + ' is now on this card.');
          c.close();
          EVA.app.refresh();
        });
      }
    });
  }

  function previewOne(id) {
    var rec = S.performers.get(id);
    if (!rec) return;
    var emp = S.employees.display(rec.employeeId);
    var meta = S.performers.periodMeta(rec.period);
    EVA.publish.preview({
      title: meta.title,
      sub: 'Slide preview',
      autoplay: false,
      hidePublish: rec.status === 'published',
      slides: [{
        id: 'sl_perf_' + rec.id, type: 'performer', duration: 12, label: meta.title + ' — ' + emp.name,
        data: {
          name: emp.name, role: emp.role, department: emp.department,
          photo: emp.photo, initials: U.initials(emp.name),
          rank: rec.rank, title: rec.title, description: rec.description,
          periodTitle: meta.title, periodLabel: meta.label
        }
      }]
    });
  }

  /* ---------------- cards ---------------- */

  function headlineCard(periodKey) {
    var meta = S.performers.periodMeta(periodKey);
    var rec = S.performers.lead(periodKey);
    var mod = ' perf--' + periodKey;

    if (!rec) {
      return '<article class="perf perf--empty' + mod + '">' +
        '<div class="perf__banner"><span class="perf__period">' + icon(meta.icon) + U.esc(meta.label) + '</span>' +
          ui.badge('inactive', { label: 'Not set' }) + '</div>' +
        '<div class="perf__body">' +
          ui.empty({
            icon: 'trophy', title: 'No ' + meta.title.toLowerCase(),
            text: 'Pick someone to celebrate.',
            actions: '<button class="btn btn--primary btn--sm" type="button" data-act="add" data-period="' + periodKey + '">' +
              icon('plus', { size: 15 }) + 'Set performer</button>'
          }) +
        '</div>' +
      '</article>';
    }

    var emp = S.employees.display(rec.employeeId);
    var live = rec.status === 'published';

    return '<article class="perf' + mod + '" data-id="' + U.attr(rec.id) + '">' +
      '<div class="perf__banner">' +
        '<span class="perf__period">' + icon(meta.icon) + U.pad2(rec.rank) + ' · ' + U.esc(meta.label) + '</span>' +
        (live ? ui.badge('live', { label: 'On TV' }) : ui.badge('draft')) +
      '</div>' +
      '<div class="perf__body">' +
        '<div class="perf__rank">' + U.pad2(rec.rank) + '<span>RANK</span></div>' +
        '<div class="perf__main">' +
          '<div class="perf__person">' +
            ui.avatar(emp, { size: 'lg' }) +
            '<div style="min-width:0">' +
              '<div class="perf__name">' + U.esc(emp.name) + '</div>' +
              '<div class="perf__role">' + U.esc(emp.role) + ' · ' + U.esc(emp.department) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="perf__title">' + icon('sparkles') + U.esc(rec.title) + '</div>' +
          (rec.description ? '<p class="perf__desc">' + U.esc(rec.description) + '</p>' : '') +
        '</div>' +
      '</div>' +
      '<div class="perf__foot">' +
        '<span class="btn-group">' +
          '<button class="btn btn--xs btn--soft" data-act="edit">' + icon('edit', { size: 13 }) + 'Edit</button>' +
          '<button class="btn btn--xs btn--soft" data-act="swap">' + icon('users', { size: 13 }) + 'Change</button>' +
          '<button class="btn btn--xs btn--soft btn--icon" data-act="preview" title="Preview">' + icon('eye', { size: 13 }) + '</button>' +
        '</span>' +
        (live
          ? '<button class="btn btn--xs btn--soft" data-act="unpublish">' + icon('eye-off', { size: 13 }) + 'Remove from TV</button>'
          : '<button class="btn btn--xs btn--primary" data-act="publish">' + icon('send', { size: 13 }) + 'Publish to TV</button>') +
      '</div>' +
    '</article>';
  }

  function listRow(rec) {
    var emp = S.employees.display(rec.employeeId);
    var meta = S.performers.periodMeta(rec.period);
    var live = rec.status === 'published';
    return '<div class="lb-row" data-id="' + U.attr(rec.id) + '">' +
      '<span class="lb-row__rank">' + U.pad2(rec.rank) + '</span>' +
      ui.avatar(emp, { size: 'sm' }) +
      '<div style="flex:1;min-width:0">' +
        '<div class="person__name">' + U.esc(emp.name) + ' <span class="muted" style="font-weight:500">— ' + U.esc(rec.title) + '</span></div>' +
        '<div class="person__sub">' + U.esc(meta.title) + ' · ' + U.esc(emp.department) +
          (rec.publishedAt ? ' · published ' + U.esc(U.timeAgo(rec.publishedAt)) : '') + '</div>' +
      '</div>' +
      (live ? ui.badge('live', { label: 'On TV' }) : ui.badge('draft')) +
      '<span class="btn-group">' +
        '<button class="btn btn--xs btn--soft btn--icon" data-act="preview" title="Preview">' + icon('eye', { size: 13 }) + '</button>' +
        '<button class="btn btn--xs btn--soft btn--icon" data-act="edit" title="Edit">' + icon('edit', { size: 13 }) + '</button>' +
        (live
          ? '<button class="btn btn--xs btn--soft btn--icon" data-act="unpublish" title="Remove from TV">' + icon('eye-off', { size: 13 }) + '</button>'
          : '<button class="btn btn--xs btn--primary btn--icon" data-act="publish" title="Publish to TV">' + icon('send', { size: 13 }) + '</button>') +
        '<button class="btn btn--xs btn--soft btn--icon" data-act="delete" title="Delete">' + icon('trash', { size: 13 }) + '</button>' +
      '</span>' +
    '</div>';
  }

  /* ---------------- page ---------------- */

  EVA.pages.performers = {
    title: 'Employee Recognition',
    openForm: openForm,

    render: function () {
      var stats = S.performers.stats();
      var rows = state.tab === 'all'
        ? U.sortBy(S.performers.all(), 'rank', 'asc')
        : S.performers.byPeriod(state.tab);

      var tabs = [{ key: 'all', label: 'All recognition', count: stats.total }].concat(
        S.performers.PERIODS.map(function (p) {
          return { key: p.key, label: p.title.replace('Top Performer of the ', ''), count: S.performers.byPeriod(p.key).length };
        })
      );

      return '<div class="page__head">' +
          '<div class="page__head-text">' +
            '<h1 class="page__title">Employee Recognition</h1>' +
            '<p class="page__desc">Recognise people for the day, the week and the month. ' +
              stats.published + ' of ' + stats.total + ' cards are live on the TV.</p>' +
          '</div>' +
          '<div class="page__actions">' +
            '<button class="btn btn--soft" type="button" data-act="preview-all">' + icon('eye', { size: 16 }) + 'Preview TV</button>' +
            '<button class="btn btn--primary" type="button" data-act="add">' + icon('plus', { size: 16 }) + 'Add recognition</button>' +
          '</div>' +
        '</div>' +

        '<div class="section">' +
          '<div class="rail-label">Headline cards</div>' +
          '<div class="perf-grid">' +
            S.performers.PERIODS.map(function (p) { return headlineCard(p.key); }).join('') +
          '</div>' +
        '</div>' +

        '<div class="section">' +
          '<div class="rail-label">All recognition</div>' +
          '<div class="tabs">' + tabs.map(function (t) {
            return '<button class="tab' + (state.tab === t.key ? ' is-active' : '') + '" type="button" data-tab="' + t.key + '">' +
              U.esc(t.label) + '<span class="tab__count">' + t.count + '</span></button>';
          }).join('') + '</div>' +
          '<div class="card card--soft"><div class="card__body card__body--flush">' +
            (rows.length
              ? '<div class="leaderboard">' + rows.map(listRow).join('') + '</div>'
              : ui.empty({
                  icon: 'trophy', title: 'Nothing here yet',
                  text: 'Add a recognition card to celebrate someone on the office TV.',
                  actions: '<button class="btn btn--primary" type="button" data-act="add">' + icon('plus', { size: 16 }) + 'Add recognition</button>'
                })) +
          '</div></div>' +
        '</div>';
    },

    mount: function (root) {
      root.addEventListener('click', function (e) {
        var t;

        if ((t = e.target.closest('[data-tab]'))) {
          state.tab = t.dataset.tab;
          EVA.app.refresh();
          return;
        }

        t = e.target.closest('[data-act]');
        if (!t) return;
        var act = t.dataset.act;
        var host = t.closest('[data-id]');
        var id = host ? host.dataset.id : null;

        if (act === 'add') { openForm(null, t.dataset.period || 'day'); return; }
        if (act === 'preview-all') { EVA.publish.preview({}); return; }
        if (!id) return;

        if (act === 'edit') openForm(id);
        else if (act === 'swap') changeEmployee(id);
        else if (act === 'preview') previewOne(id);
        else if (act === 'publish') {
          var rec = S.performers.get(id);
          var emp = S.employees.display(rec.employeeId);
          var meta = S.performers.periodMeta(rec.period);
          EVA.publish.item('performers', id, emp.name + ' as ' + meta.title)
            .then(function (ok) { if (ok) EVA.app.refresh(); });
        } else if (act === 'unpublish') {
          S.performers.unpublish(id);
          S.tv.publish({ reason: 'Recognition removed from the TV' });
          ui.toast.info('Removed from TV', 'The slide is back to draft.');
          EVA.app.refresh();
        } else if (act === 'delete') {
          var r = S.performers.get(id);
          ui.confirm({
            title: 'Delete this recognition?',
            html: '<strong>' + U.esc(r.title) + '</strong> will be removed from the panel and the TV.',
            confirmLabel: 'Delete', tone: 'danger'
          }).then(function (ok) {
            if (!ok) return;
            S.performers.remove(id);
            if (r.status === 'published') S.tv.publish({ reason: 'Recognition deleted' });
            ui.toast.success('Recognition deleted');
            EVA.app.refresh();
          });
        }
      });
    }
  };
})(window.EVA = window.EVA || {});
