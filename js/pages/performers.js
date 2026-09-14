/* ==========================================================================
   pages/performers.js — Top Performer of the Day / Week / Month
   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils, ui = EVA.ui, icon = EVA.icon;
  var S = EVA.services;

  var state = { tab: 'all', view: 'create', search: '', status: 'all', previewIndex: 0 };

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

  function composer() {
    var employees = employeeOptions('');
    return '<section class="recognition-composer card">' +
      '<div class="recognition-card__head"><div><h2 class="card__title">' + icon('trophy') + 'Recognition Details</h2><p class="card__sub">Create and save a recognition for an employee.</p></div></div>' +
      '<div class="recognition-composer__body"><form id="recognitionComposer" novalidate>' +
        '<div class="recognition-employee-picker field">' +
          '<span class="field__label">Select employee<span class="req">*</span></span>' +
          '<div class="recognition-employee-search"><span>' + icon('search', { size: 15 }) + '</span><input type="search" data-recognition-employee-search placeholder="Search employee name..." autocomplete="off"><button class="recognition-employee-search__key" type="button" data-recognition-employee-commit>Add</button></div>' +
          '<select class="input recognition-employee-select" name="employeeId" required aria-label="Select employee"><option value="">Choose an employee</option>' + employees.map(function (employee) {
            var emp = S.employees.get(employee.value);
            return '<option value="' + U.attr(employee.value) + '">' + U.esc(employee.label) + '</option>';
          }).join('') + '</select>' +
          '<div class="recognition-employee-results" data-recognition-employee-results hidden></div>' +
          '<div class="recognition-employee-result" data-recognition-employee-result hidden></div>' +
          '<span class="field__error" data-error-for="employeeId" hidden></span>' +
        '</div>' +
        '<div class="field-row">' +
          ui.field({ type: 'select', label: 'Recognition period', name: 'period', value: 'day', options: S.performers.PERIODS.map(function (p) { return { value: p.key, label: p.title }; }) }) +
          ui.field({ label: 'Recognition category', name: 'title', required: true, placeholder: 'e.g. Outstanding Performance', maxlength: 70 }) +
        '</div>' +
        ui.field({ type: 'textarea', label: 'Recognition message', name: 'description', rows: 4, maxlength: 220, placeholder: 'Recognize an achievement or contribution...', hint: 'Shown on the TV preview.' }) +
        ui.imageUpload({ label: 'Upload image (optional)', name: 'photo', hint: 'This image is used on the recognition TV slide.' }) +
        '<div class="recognition-composer__actions">' +
          '<button class="btn btn--soft" type="button" data-composer-save>' + icon('save', { size: 16 }) + 'Save as Draft</button>' +
          '<button class="btn btn--primary" type="button" data-composer-publish>' + icon('send', { size: 16 }) + 'Push to TV</button>' +
        '</div>' +
      '</form></div>' +
    '</section>';
  }

  function previewSlides() {
    return S.performers.forTV().map(function (rec) {
      var emp = S.employees.display(rec.employeeId);
      var meta = S.performers.periodMeta(rec.period);
      return {
        id: 'sl_perf_' + rec.id, type: 'performer', duration: 8,
        label: meta.title + ' — ' + emp.name,
        data: {
          name: emp.name, role: emp.role, department: emp.department, photo: rec.photo || emp.photo,
          initials: U.initials(emp.name), rank: rec.rank, title: rec.title,
          description: rec.description, periodTitle: meta.title, periodLabel: meta.label
        }
      };
    });
  }

  function recognitionRecords() {
    var rows = state.tab === 'all' ? S.performers.all() : S.performers.byPeriod(state.tab);
    var term = state.search.trim().toLowerCase();
    return rows.filter(function (rec) {
      var emp = S.employees.display(rec.employeeId);
      var matchesSearch = !term || (emp.name + ' ' + rec.title + ' ' + rec.description).toLowerCase().indexOf(term) > -1;
      return matchesSearch && (state.status === 'all' || rec.status === state.status);
    }).sort(function (a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); });
  }

  function recordTable() {
    var rows = recognitionRecords();
    return '<section class="recognition-records card">' +
      '<div class="recognition-records__head"><div><h2 class="card__title">' + icon('list') + 'Employee Recognition Records</h2><p class="card__sub">View and manage previously created recognitions.</p></div>' +
      '<div class="recognition-records__filters"><label class="recognition-search">' + icon('search', { size: 15 }) + '<input type="search" data-recognition-search placeholder="Search recognitions..." value="' + U.attr(state.search) + '"></label>' +
      ui.field({ type: 'select', label: '', name: 'recognitionStatus', value: state.status, options: [{ value: 'all', label: 'All statuses' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }] }) + '</div></div>' +
      '<div class="recognition-history-tabs"><button type="button" class="' + (state.tab === 'all' ? 'is-active' : '') + '" data-history-tab="all">All recognition <b>' + S.performers.stats().total + '</b></button>' +
      S.performers.PERIODS.map(function (p) { return '<button type="button" class="' + (state.tab === p.key ? 'is-active' : '') + '" data-history-tab="' + p.key + '">' + U.esc(p.label.replace('This ', '')) + ' <b>' + S.performers.byPeriod(p.key).length + '</b></button>'; }).join('') + '</div>' +
      (rows.length ? '<div class="recognition-table-wrap"><table class="recognition-table"><thead><tr><th>#</th><th>Employee</th><th>Category</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>' + rows.map(function (rec, index) {
        var emp = S.employees.display(rec.employeeId);
        var meta = S.performers.periodMeta(rec.period);
        var live = rec.status === 'published';
        return '<tr data-id="' + U.attr(rec.id) + '"><td>' + (index + 1) + '</td><td><div class="recognition-person">' + ui.avatar(emp, { size: 'sm' }) + '<span><strong>' + U.esc(emp.name) + '</strong><small>' + U.esc(emp.role) + '</small></span></div></td><td>' + icon(meta.icon, { size: 14 }) + ' ' + U.esc(rec.title) + '</td><td>' + U.esc(rec.publishedAt ? U.formatDate(rec.publishedAt, true) : U.formatDate(rec.createdAt, true)) + '</td><td>' + ui.badge(live ? 'live' : 'draft', live ? { label: 'Published' } : {}) + '</td><td><div class="recognition-table__actions"><button class="btn btn--soft btn--icon" data-act="edit" title="Edit">' + icon('edit', { size: 14 }) + '</button><button class="btn btn--soft btn--icon" data-act="preview" title="Preview">' + icon('eye', { size: 14 }) + '</button>' + (live ? '<button class="btn btn--soft btn--icon" data-act="unpublish" title="Remove from TV">' + icon('eye-off', { size: 14 }) + '</button>' : '<button class="btn btn--primary btn--icon" data-act="publish" title="Publish to TV">' + icon('send', { size: 14 }) + '</button>') + '<button class="btn btn--soft btn--icon recognition-table__danger" data-act="delete" title="Delete">' + icon('trash', { size: 14 }) + '</button></div></td></tr>';
      }).join('') + '</tbody></table></div>' : ui.empty({ icon: 'trophy', title: 'No recognition records', text: 'Create a recognition to begin the history.' })) +
    '</section>';
  }

  /* ---------------- page ---------------- */

  EVA.pages.performers = {
    title: 'Employee Recognition',
    openForm: openForm,

    render: function () {
      var stats = S.performers.stats();
      return '<div class="recognition-page">' +
        '<div class="recognition-page__head"><div><h1 class="page__title">Employee Recognition</h1><p class="page__desc">Appreciate and celebrate your team members</p></div><button class="btn btn--soft" type="button" data-act="preview-all">' + icon('eye', { size: 16 }) + 'Preview TV</button></div>' +
        '<div class="recognition-page__tabs"><button type="button" class="' + (state.view === 'create' ? 'is-active' : '') + '" data-view="create">Create Recognition</button><button type="button" class="' + (state.view === 'history' ? 'is-active' : '') + '" data-view="history">Recognition History</button><button type="button" class="recognition-page__drafts" data-status-shortcut="draft">' + icon('file-text', { size: 15 }) + ' Drafts (' + stats.drafts + ')</button></div>' +
        (state.view === 'create' ? '<div class="recognition-workbench">' + composer() + '<section class="recognition-live card"><div class="recognition-card__head"><div><h2 class="card__title">' + icon('tv') + 'Live TV Preview</h2><p class="card__sub">Automatic recognition slideshow</p></div><button class="btn btn--soft btn--xs" type="button" data-act="preview-all">' + icon('eye', { size: 14 }) + 'Preview TV</button></div><div class="recognition-preview-stage slide-stage" data-recognition-stage></div><div class="recognition-preview-controls"><button class="btn btn--soft btn--icon" type="button" data-preview="previous" title="Previous slide">' + icon('chevron-left', { size: 16 }) + '</button><span data-preview-label>1 of 1</span><button class="btn btn--soft btn--icon" type="button" data-preview="next" title="Next slide">' + icon('chevron-right', { size: 16 }) + '</button></div></section></div>' : '') +
        '<div class="recognition-page__records">' + recordTable() + '</div>' +
      '</div>';
    },

    mount: function (root) {
      var stage = root.querySelector('[data-recognition-stage]');
      var player;
      if (stage) {
        var slides = previewSlides();
        if (!slides.length) slides = [{ id: 'empty', type: 'idle', duration: 8, label: 'Recognition preview', data: { tagline: 'Create a recognition to preview it here.' } }];
        player = EVA.slides.player(stage, {
          settings: S.settings.get(),
          onChange: function (index, slide, total) {
            var label = root.querySelector('[data-preview-label]');
            if (label) label.textContent = (index + 1) + ' of ' + total;
          }
        });
        player.load(slides).start();
      }

      function saveComposer(publish) {
        var form = root.querySelector('#recognitionComposer');
        if (!form) return;
        var data = ui.readForm(form);
        data.status = publish ? 'published' : 'draft';
        var check = S.performers.validate(data);
        if (!check.valid) { ui.showErrors(form, check.errors); ui.toast.error('Check the highlighted fields'); return; }
        var saved = S.performers.create(check.data);
        if (publish) {
          S.performers.publish(saved.id);
          S.tv.publish({ reason: 'Recognition for <strong>' + U.esc(S.employees.display(saved.employeeId).name) + '</strong> pushed to the TV' });
          ui.toast.success('Recognition published', 'The recognition is now live on the TV.');
        } else {
          ui.toast.success('Draft saved', 'Publish it when you are ready.');
        }
        EVA.app.refresh();
      }

      root.addEventListener('click', function (e) {
        var t;

        if ((t = e.target.closest('[data-view]'))) {
          state.view = t.dataset.view;
          EVA.app.refresh();
          return;
        }

        if ((t = e.target.closest('[data-status-shortcut]'))) {
          state.view = 'history';
          state.status = t.dataset.statusShortcut;
          EVA.app.refresh();
          return;
        }

        if ((t = e.target.closest('[data-preview]'))) {
          if (!player) return;
          if (t.dataset.preview === 'next') player.next(); else player.prev();
          return;
        }

        if ((t = e.target.closest('[data-composer-save]'))) { saveComposer(false); return; }
        if ((t = e.target.closest('[data-composer-publish]'))) { saveComposer(true); return; }

        if ((t = e.target.closest('[data-recognition-employee-choice]'))) {
          showEmployee(t.dataset.recognitionEmployeeChoice);
          employeeResults.hidden = true;
          return;
        }

        if ((t = e.target.closest('[data-tab]'))) {
          state.tab = t.dataset.tab;
          EVA.app.refresh();
          return;
        }

        if ((t = e.target.closest('[data-history-tab]'))) {
          state.tab = t.dataset.historyTab;
          EVA.app.refresh();
          return;
        }

        if ((t = e.target.closest('[data-recognition-search]'))) return;

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

      var employeeSearch = root.querySelector('[data-recognition-employee-search]');
      var employeeSelect = root.querySelector('.recognition-employee-select');
      var employeeResult = root.querySelector('[data-recognition-employee-result]');
      var employeeResults = root.querySelector('[data-recognition-employee-results]');

      function matchingEmployees(term) {
        term = String(term || '').trim().toLowerCase();
        return S.employees.all().filter(function (employee) {
          return employee.status !== 'inactive' && (!term || employee.name.toLowerCase().indexOf(term) > -1);
        });
      }

      function renderEmployeeResults(term) {
        var matches = matchingEmployees(term);
        if (!term) {
          employeeResults.hidden = true;
          employeeResults.innerHTML = '';
          return matches;
        }
        employeeResults.innerHTML = matches.length
          ? matches.map(function (employee) {
            return '<button type="button" class="recognition-employee-option" data-recognition-employee-choice="' + U.attr(employee.id) + '">' +
              ui.avatar(employee, { size: 'sm' }) + '<span><strong>' + U.esc(employee.name) + '</strong><small>' + U.esc(employee.role) + '</small></span></button>';
          }).join('')
          : '<div class="recognition-employee-no-results">No employees found</div>';
        employeeResults.hidden = false;
        return matches;
      }

      function showEmployee(id) {
        var employee = S.employees.get(id);
        if (!employee) {
          employeeResult.hidden = true;
          employeeResult.innerHTML = '';
          return;
        }
        employeeSelect.value = employee.id;
        employeeSearch.value = employee.name;
        employeeResult.innerHTML = ui.person(employee, { size: 'sm', sub: employee.role });
        employeeResult.hidden = false;
      }

      if (employeeSearch && employeeSelect && employeeResult) {
        employeeSearch.addEventListener('keydown', function (e) {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          var match = matchingEmployees(this.value)[0];
          if (match) showEmployee(match.id);
          else ui.toast.info('Employee not found', 'Enter a matching employee name.');
          employeeResults.hidden = true;
        });
        employeeSearch.addEventListener('input', function () {
          var term = this.value.trim().toLowerCase();
          if (!term) {
            employeeSelect.value = '';
            employeeResult.hidden = true;
            Array.prototype.forEach.call(employeeSelect.options, function (option) { option.hidden = false; });
            renderEmployeeResults('');
            return;
          }
          renderEmployeeResults(term);
          Array.prototype.forEach.call(employeeSelect.options, function (option) {
            if (!option.value) return;
            option.hidden = option.textContent.toLowerCase().indexOf(term) === -1;
          });
        });
        employeeSelect.addEventListener('change', function () { showEmployee(this.value); });
        root.querySelector('[data-recognition-employee-commit]').addEventListener('click', function () {
          var match = matchingEmployees(employeeSearch.value)[0];
          if (match) showEmployee(match.id);
          else ui.toast.info('Employee not found', 'Enter a matching employee name.');
          employeeResults.hidden = true;
        });
      }

      root.addEventListener('change', function (e) {
        if (e.target.matches('[name="recognitionStatus"]')) {
          state.status = e.target.value;
          EVA.app.refresh();
        }
        if (e.target.matches('[data-recognition-search]')) {
          state.search = e.target.value || '';
          EVA.app.refresh();
        }
      });
    }
  };
})(window.EVA = window.EVA || {});
