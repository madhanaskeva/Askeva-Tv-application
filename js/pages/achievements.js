/* ==========================================================================
   pages/achievements.js — Employee Achievements
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

  function openForm(id, onSaved) {
    var rec = id ? S.achievements.get(id) : null;

    function body(errors) {
      errors = errors || {};
      var r = rec || {};
      return '<form id="achForm" novalidate>' +
        '<div class="field-row">' +
          ui.field({
            type: 'select', label: 'Employee', name: 'employeeId', required: true,
            value: r.employeeId || '', placeholder: 'Select an employee',
            options: employeeOptions(r.employeeId), error: errors.employeeId
          }) +
          ui.field({
            label: 'Achievement Type', name: 'type', required: true, value: r.type || 'Intern to Full-Time',
            placeholder: 'e.g. Intern to Full-Time, Work Anniversary', maxlength: 50, error: errors.type,
            hint: 'The category of the achievement.'
          }) +
        '</div>' +
        ui.field({
          label: 'Achievement Title', name: 'title', required: true, value: r.title || '',
          placeholder: 'e.g. Promoted to full-time SWE!', maxlength: 70, error: errors.title,
          hint: 'Shown large on the TV.'
        }) +
        ui.field({
          type: 'textarea', label: 'Description', name: 'description',
          value: r.description || '', maxlength: 220, rows: 3,
          placeholder: 'Add a small celebratory message.',
          error: errors.description, hint: 'Appears underneath the title.'
        }) +
      '</form>';
    }

    ui.modal({
      title: rec ? 'Edit achievement' : 'Add achievement',
      sub: rec ? 'Update this achievement' : 'Recognise a special milestone on the TV',
      icon: 'sparkles',
      size: 'lg',
      body: body(),
      foot:
        '<button class="btn btn--soft" type="button" data-close>Cancel</button>' +
        '<button class="btn btn--soft" type="button" data-preview>' + icon('eye', { size: 16 }) + 'Preview slide</button>' +
        '<button class="btn btn--primary" type="button" data-save>' + icon('save', { size: 16 }) + 'Save</button>',
      onMount: function (c) {
        var form = c.el.querySelector('#achForm');

        function collect() {
          var d = ui.readForm(form);
          d.status = rec ? rec.status : 'draft';
          return d;
        }

        c.el.querySelector('[data-preview]').addEventListener('click', function () {
          var d = collect();
          var check = S.achievements.validate(d);
          if (!check.valid) { ui.showErrors(form, check.errors); return; }
          var emp = S.employees.display(d.employeeId);
          EVA.publish.preview({
            title: 'Slide preview',
            sub: 'How this achievement will look on the office TV',
            hidePublish: true,
            autoplay: false,
            slides: [{
              id: 'tmp', type: 'achievement', duration: 12, label: d.type,
              data: {
                name: emp.name, role: emp.role, department: emp.department,
                photo: emp.photo, initials: U.initials(emp.name),
                type: d.type, title: d.title, description: d.description
              }
            }]
          });
        });

        c.el.querySelector('[data-save]').addEventListener('click', save);
        form.addEventListener('submit', function (e) { e.preventDefault(); save(); });

        function save() {
          var d = collect();
          var check = S.achievements.validate(d);
          if (!check.valid) {
            ui.showErrors(form, check.errors);
            ui.toast.error('Check the highlighted fields');
            return;
          }
          if (rec) {
            S.achievements.update(id, check.data);
            ui.toast.success('Achievement updated');
          } else {
            S.achievements.create(check.data);
            ui.toast.success('Achievement added', 'Publish it to put it on the TV.');
          }
          c.close();
          if (onSaved) onSaved();
          EVA.app.refresh();
        }
      }
    });
  }

  function previewOne(id) {
    var rec = S.achievements.get(id);
    if (!rec) return;
    var emp = S.employees.display(rec.employeeId);
    EVA.publish.preview({
      title: rec.type,
      sub: 'Slide preview',
      autoplay: false,
      hidePublish: rec.status === 'published',
      slides: [{
        id: 'sl_ach_' + rec.id, type: 'achievement', duration: 12, label: rec.type + ' — ' + emp.name,
        data: {
          name: emp.name, role: emp.role, department: emp.department,
          photo: emp.photo, initials: U.initials(emp.name),
          type: rec.type, title: rec.title, description: rec.description
        }
      }]
    });
  }

  /* ---------------- cards ---------------- */

  function listRow(rec) {
    var emp = S.employees.display(rec.employeeId);
    var live = rec.status === 'published';
    return '<div class="lb-row" data-id="' + U.attr(rec.id) + '">' +
      ui.avatar(emp, { size: 'sm' }) +
      '<div style="flex:1;min-width:0">' +
        '<div class="person__name">' + U.esc(emp.name) + ' <span class="muted" style="font-weight:500">— ' + U.esc(rec.title) + '</span></div>' +
        '<div class="person__sub">' + U.esc(rec.type) + ' · ' + U.esc(emp.department) +
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

  EVA.pages.achievements = {
    title: 'Achievements & Awards',
    openForm: openForm,

    render: function () {
      var stats = S.achievements.stats();
      var rows = state.tab === 'all'
        ? S.achievements.all().sort(function(a,b) { return new Date(b.createdAt) - new Date(a.createdAt); })
        : (state.tab === 'published' ? S.achievements.published() : S.achievements.all().filter(function(a) { return a.status === 'draft'; }));

      var tabs = [
        { key: 'all', label: 'All achievements', count: stats.total },
        { key: 'published', label: 'Published', count: stats.published },
        { key: 'draft', label: 'Drafts', count: stats.drafts }
      ];

      return '<div class="page__head">' +
          '<div class="page__head-text">' +
            '<h1 class="page__title">Achievements & Awards</h1>' +
            '<p class="page__desc">Celebrate Intern to Full-Time conversions and other major milestones. ' +
              stats.published + ' of ' + stats.total + ' cards are live on the TV.</p>' +
          '</div>' +
          '<div class="page__actions">' +
            '<button class="btn btn--soft" type="button" data-act="preview-all">' + icon('eye', { size: 16 }) + 'Preview TV</button>' +
            '<button class="btn btn--primary" type="button" data-act="add">' + icon('plus', { size: 16 }) + 'Add achievement</button>' +
          '</div>' +
        '</div>' +

        '<div class="section">' +
          '<div class="tabs">' + tabs.map(function (t) {
            return '<button class="tab' + (state.tab === t.key ? ' is-active' : '') + '" type="button" data-tab="' + t.key + '">' +
              U.esc(t.label) + '<span class="tab__count">' + t.count + '</span></button>';
          }).join('') + '</div>' +
          '<div class="card card--soft"><div class="card__body card__body--flush">' +
            (rows.length
              ? '<div class="leaderboard">' + rows.map(listRow).join('') + '</div>'
              : ui.empty({
                  icon: 'sparkles', title: 'Nothing here yet',
                  text: 'Add a new achievement card to celebrate someone on the office TV.',
                  actions: '<button class="btn btn--primary" type="button" data-act="add">' + icon('plus', { size: 16 }) + 'Add achievement</button>'
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

        if (act === 'add') { openForm(null); return; }
        if (act === 'preview-all') { EVA.publish.preview({}); return; }
        if (!id) return;

        if (act === 'edit') openForm(id);
        else if (act === 'preview') previewOne(id);
        else if (act === 'publish') {
          var rec = S.achievements.get(id);
          var emp = S.employees.display(rec.employeeId);
          EVA.publish.item('achievements', id, emp.name + ' - ' + rec.type)
            .then(function (ok) { if (ok) EVA.app.refresh(); });
        } else if (act === 'unpublish') {
          S.achievements.unpublish(id);
          S.tv.publish({ reason: 'Achievement removed from the TV' });
          ui.toast.info('Removed from TV', 'The slide is back to draft.');
          EVA.app.refresh();
        } else if (act === 'delete') {
          var r = S.achievements.get(id);
          ui.confirm({
            title: 'Delete this achievement?',
            html: '<strong>' + U.esc(r.title) + '</strong> will be removed from the panel and the TV.',
            confirmLabel: 'Delete', tone: 'danger'
          }).then(function (ok) {
            if (!ok) return;
            S.achievements.remove(id);
            if (r.status === 'published') S.tv.publish({ reason: 'Achievement deleted' });
            ui.toast.success('Achievement deleted');
            EVA.app.refresh();
          });
        }
      });
    }
  };
})(window.EVA = window.EVA || {});
