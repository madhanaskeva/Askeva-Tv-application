/* ==========================================================================
   pages/birthdays.js — today / upcoming / past birthdays + wish messages
   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils, ui = EVA.ui, icon = EVA.icon;
  var S = EVA.services;

  var state = { tab: 'today' };

  function slideFor(emp, message) {
    return {
      id: 'sl_bday_' + emp.id, type: 'birthday', duration: 12,
      label: 'Birthday — ' + emp.name,
      data: {
        name: emp.name, role: emp.role, department: emp.department,
        photo: emp.photo, initials: U.initials(emp.name), message: message
      }
    };
  }

  /* ---------------- message editor ---------------- */

  function openEditor(employeeId, opts) {
    opts = opts || {};
    var emp = S.employees.get(employeeId);
    var wish = employeeId ? S.birthdays.wishFor(employeeId) : null;
    var locked = !!employeeId;

    var body = '<form id="wishForm" novalidate>' +
      (locked
        ? '<div class="emp-hero" style="margin-bottom:18px;padding:14px">' +
            ui.avatar(emp, { size: 'lg' }) +
            '<div><div class="person__name" style="font-size:16px">' + U.esc(emp.name) + '</div>' +
            '<div class="person__sub">Editing role and birthday content · ' + U.esc(emp.department) + '</div>' +
            '<div style="margin-top:8px"><span class="chip">' + icon('cake') + U.esc(U.formatDay(emp.birthday)) + '</span></div></div>' +
            '<input type="hidden" name="employeeId" value="' + U.attr(employeeId) + '">' +
          '</div>'
        : ui.field({
            type: 'select', label: 'Employee', name: 'employeeId', required: true,
            placeholder: 'Select an employee',
            options: S.employees.all().map(function (e) {
              return { value: e.id, label: e.name + ' · ' + U.formatDay(e.birthday, true) };
            })
          })) +
      ui.field({
        label: 'Role shown on TV', name: 'role', value: emp ? emp.role || '' : '', required: true,
        placeholder: 'e.g. Sales Lead', error: null
      }) +
      ui.imageUpload({
        label: 'Birthday image', name: 'photo', value: emp ? emp.photo || '' : '',
        hint: 'Optional image shown in the birthday TV spotlight. Keep it under 2MB.'
      }) +
      ui.field({
        type: 'textarea', label: 'Birthday message', name: 'message', required: true, rows: 4,
        maxlength: 200,
        value: wish ? wish.message : (emp ? S.birthdays.defaultMessage(emp) : ''),
        placeholder: 'Wishing you an amazing year ahead…',
        hint: 'Shown under their name on the TV. Keep it under 200 characters.'
      }) +
      '<div class="hint-bar" style="margin-top:4px">' + icon('sparkles') +
        '<span style="flex:1">Need a starting point? Use the default template from Settings.</span>' +
        '<button class="btn btn--xs btn--dark" type="button" data-template>Use template</button>' +
      '</div>' +
    '</form>';

    ui.modal({
      title: wish ? 'Edit birthday message' : 'Add birthday wish',
      sub: emp ? 'For ' + emp.name : 'Pick who to celebrate',
      icon: 'cake',
      size: 'lg',
      body: body,
      foot:
        '<button class="btn btn--soft" type="button" data-close>Cancel</button>' +
        '<button class="btn btn--soft" type="button" data-preview>' + icon('eye', { size: 16 }) + 'Preview slide</button>' +
        '<button class="btn btn--soft" type="button" data-save>' + icon('save', { size: 16 }) + 'Save draft</button>' +
        '<button class="btn btn--primary" type="button" data-publish>' + icon('send', { size: 16 }) + 'Publish to TV</button>',
      onMount: function (c) {
        var form = c.el.querySelector('#wishForm');
        var photoInput = form.elements.photo;
        var photoPreview = c.el.querySelector('#photo_preview');

        function setPhotoPreview(photo) {
          if (photoInput) photoInput.value = photo || '';
          if (photoPreview) {
            photoPreview.innerHTML = photo
              ? '<img src="' + U.attr(photo) + '" alt="" style="max-height:120px;border-radius:6px;margin-top:8px;display:block;border:1px solid rgba(8,21,14,0.1);">'
              : '';
          }
        }

        c.el.querySelector('[data-template]').addEventListener('click', function () {
          var id = form.elements.employeeId.value;
          var e = S.employees.get(id);
          form.elements.message.value = e
            ? S.birthdays.defaultMessage(e)
            : S.settings.get().defaultBirthdayMessage;
          if (form.elements.role) form.elements.role.value = e ? e.role || '' : '';
          setPhotoPreview(e ? e.photo : '');
          form.elements.message.focus();
        });

        if (!locked) {
          form.elements.employeeId.addEventListener('change', function () {
            var e = S.employees.get(this.value);
            var existing = e ? S.birthdays.wishFor(e.id) : null;
            form.elements.role.value = e ? e.role || '' : '';
            setPhotoPreview(e ? e.photo : '');
            form.elements.message.value = existing ? existing.message : (e ? S.birthdays.defaultMessage(e) : '');
          });
        }

        c.el.querySelector('[data-preview]').addEventListener('click', function () {
          var d = ui.readForm(form);
          var check = S.birthdays.validate(d);
          if (!check.valid) { ui.showErrors(form, check.errors); return; }
          var e = S.employees.get(d.employeeId);
          e = e ? Object.assign({}, e, { role: d.role, photo: d.photo }) : e;
          EVA.publish.preview({
            title: 'Slide preview', sub: 'How this birthday will look on the office TV',
            hidePublish: true, autoplay: false,
            slides: [slideFor(e, d.message)]
          });
        });

        function persist(publish) {
          var d = ui.readForm(form);
          var check = S.birthdays.validate(d);
          if (!check.valid) {
            ui.showErrors(form, check.errors);
            ui.toast.error('Check the highlighted fields');
            return null;
          }
          var existing = S.birthdays.wishFor(check.data.employeeId);
          var selectedEmployee = S.employees.get(check.data.employeeId);
          if (selectedEmployee) {
            var employeeData = Object.assign({}, selectedEmployee, { role: d.role, photo: d.photo });
            var employeeCheck = S.employees.validate(employeeData, selectedEmployee.id);
            if (!employeeCheck.valid) {
              ui.showErrors(form, employeeCheck.errors);
              return null;
            }
            S.employees.update(selectedEmployee.id, employeeCheck.data);
          }
          var saved;
          if (existing) {
            saved = S.birthdays.saveMessage(existing.id, check.data.message, d.photo);
          } else {
            saved = S.birthdays.create({ employeeId: check.data.employeeId, message: check.data.message, photo: d.photo });
          }
          if (publish) S.birthdays.publish(saved.id);
          return saved;
        }

        c.el.querySelector('[data-save]').addEventListener('click', function () {
          var saved = persist(false);
          if (!saved) return;
          ui.toast.success('Message saved', 'Publish it when you are ready.');
          c.close();
          if (opts.onSaved) opts.onSaved();
          EVA.app.refresh();
        });

        c.el.querySelector('[data-publish]').addEventListener('click', function () {
          var d = ui.readForm(form);
          var check = S.birthdays.validate(d);
          if (!check.valid) { ui.showErrors(form, check.errors); return; }
          var e = S.employees.get(check.data.employeeId);
          if (e && form.elements.role) e = Object.assign({}, e, { role: form.elements.role.value });

          ui.confirm({
            title: 'Publish this content to the office TV?',
            html: 'The birthday slide for <strong>' + U.esc(e.name) + '</strong> will go live on the office display.',
            confirmLabel: 'Push to TV', icon: 'send'
          }).then(function (ok) {
            if (!ok) return;
            persist(true);
            S.tv.publish({
              birthdayEmployeeId: e.id,
              reason: 'Birthday wish for <strong>' + U.esc(e.name) + '</strong> pushed to the TV'
            });
            c.close();
            EVA.publish.success({ text: e.name + '’s birthday slide is now on the office TV.' });
            if (opts.onSaved) opts.onSaved();
            EVA.app.refresh();
          });
        });
      }
    });
  }

  /* ---------------- cards ---------------- */

  function card(entry, bucket) {
    var emp = entry.employee;
    var wish = entry.wish;
    var live = wish && wish.status === 'published';
    var d = U.parseISO(emp.birthday);
    var mod = bucket === 'today' ? ' bday--today' : bucket === 'past' ? ' bday--past' : '';

    var countdown = bucket === 'today' ? 'Today' :
      bucket === 'upcoming' ? 'In ' + entry.daysUntil + ' ' + U.pluralize(entry.daysUntil, 'day') :
      entry.daysSince + ' ' + U.pluralize(entry.daysSince, 'day') + ' ago';

    var status = live ? ui.badge('live', { label: 'On TV' })
      : wish ? ui.badge('draft')
      : ui.badge('inactive', { label: 'No message' });

    return '<article class="bday' + mod + '" data-id="' + U.attr(emp.id) + '">' +
      '<div class="bday__top">' +
        ui.avatar(emp, { size: 'lg' }) +
        '<div style="min-width:0;flex:1">' +
          '<div class="person__name" style="font-size:15.5px">' +
            (bucket === 'today' ? '🎂 ' : '') + U.esc(emp.name) + '</div>' +
          '<div class="person__sub">' + U.esc(emp.role) + '</div>' +
          '<div style="margin-top:8px">' + status + '</div>' +
        '</div>' +
        '<div class="bday__date">' +
          '<div class="bday__date-d">' + (d ? d.getDate() : '—') + '</div>' +
          '<div class="bday__date-m">' + U.esc(d ? U.monthName(d.getMonth(), true) : '') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="bday__msg">' +
        '<div class="bday__msg-head"><span>Birthday message</span>' +
          '<span>' + U.esc(emp.department) + '</span></div>' +
        (wish ? U.esc(wish.message) : '<span class="muted">No message yet — the default template will be used.</span>') +
      '</div>' +
      '<div class="bday__foot">' +
        '<span class="bday__countdown">' + U.esc(countdown) + '</span>' +
        '<span class="btn-group">' +
          '<button class="btn btn--xs btn--soft" data-act="edit">' + icon('edit', { size: 13 }) + (wish ? 'Edit' : 'Write') + '</button>' +
          '<button class="btn btn--xs btn--soft btn--icon" data-act="preview" title="Preview TV slide">' + icon('eye', { size: 13 }) + '</button>' +
          (live
            ? '<button class="btn btn--xs btn--soft" data-act="unpublish">' + icon('eye-off', { size: 13 }) + 'Remove</button>'
            : '<button class="btn btn--xs btn--primary" data-act="publish">' + icon('send', { size: 13 }) + 'Publish</button>') +
        '</span>' +
      '</div>' +
    '</article>';
  }

  function bucketRows() {
    if (state.tab === 'today') return { rows: S.birthdays.today(), bucket: 'today' };
    if (state.tab === 'upcoming') return { rows: S.birthdays.upcoming(), bucket: 'upcoming' };
    return { rows: S.birthdays.past(), bucket: 'past' };
  }

  /* ---------------- page ---------------- */

  EVA.pages.birthdays = {
    title: 'Birthday Wishes',
    openEditor: openEditor,

    render: function () {
      var stats = S.birthdays.stats();
      var data = bucketRows();

      var tabs = [
        { key: 'today', label: 'Today', count: stats.today },
        { key: 'upcoming', label: 'Upcoming', count: S.birthdays.upcoming().length },
        { key: 'past', label: 'Past', count: S.birthdays.past().length }
      ];

      var empty = {
        today: { icon: 'cake', title: 'No birthdays today', text: 'Check the Upcoming tab to prepare messages in advance.' },
        upcoming: { icon: 'calendar', title: 'Nothing in the next 30 days', text: 'Birthdays are read from the employee directory.' },
        past: { icon: 'clock', title: 'No recent birthdays', text: 'Birthdays from the last 30 days appear here.' }
      }[state.tab];

      return '<div class="page__head">' +
          '<div class="page__head-text">' +
            '<h1 class="page__title">Birthday Wishes</h1>' +
            '<p class="page__desc">' +
              (stats.today
                ? stats.today + ' ' + U.pluralize(stats.today, 'birthday') + ' today · ' + stats.live + ' live on the TV'
                : 'No birthdays today — ' + stats.upcoming7 + ' coming up this week') +
              '. Messages only reach the TV once published.</p>' +
          '</div>' +
          '<div class="page__actions">' +
            '<button class="btn btn--soft" type="button" data-act="preview-all">' + icon('eye', { size: 16 }) + 'Preview TV</button>' +
            '<button class="btn btn--primary" type="button" data-act="add">' + icon('plus', { size: 16 }) + 'Add birthday wish</button>' +
          '</div>' +
        '</div>' +

        (stats.readyToPublish
          ? '<div class="hint-bar" style="margin-bottom:18px">' + icon('info') +
            '<span style="flex:1"><strong>' + stats.readyToPublish + ' ' +
            U.pluralize(stats.readyToPublish, 'message') + '</strong> for today is written but not on the TV yet.</span>' +
            '<button class="btn btn--xs btn--dark" type="button" data-act="publish-today">' +
              icon('send', { size: 13 }) + 'Publish all</button></div>'
          : '') +

        '<div class="tabs">' + tabs.map(function (t) {
          return '<button class="tab' + (state.tab === t.key ? ' is-active' : '') + '" type="button" data-tab="' + t.key + '">' +
            icon(t.key === 'today' ? 'cake' : t.key === 'upcoming' ? 'calendar' : 'clock', { size: 15 }) +
            U.esc(t.label) + '<span class="tab__count">' + t.count + '</span></button>';
        }).join('') + '</div>' +

        (data.rows.length
          ? '<div class="grid grid--3">' + data.rows.map(function (r) { return card(r, data.bucket); }).join('') + '</div>'
          : '<div class="card card--soft"><div class="card__body">' + ui.empty(empty) + '</div></div>');
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
        var empId = host ? host.dataset.id : null;

        if (act === 'add') { openEditor(null); return; }
        if (act === 'preview-all') { EVA.publish.preview({}); return; }

        if (act === 'publish-today') {
          var pending = S.birthdays.today().filter(function (b) { return b.wish && b.wish.status === 'draft'; });
          ui.confirm({
            title: 'Publish this content to the office TV?',
            html: '<strong>' + pending.length + ' birthday ' + U.pluralize(pending.length, 'slide') +
              '</strong> will go live on the office display.',
            confirmLabel: 'Push to TV', icon: 'send'
          }).then(function (ok) {
            if (!ok) return;
            pending.forEach(function (b) { S.birthdays.publish(b.wish.id); });
            S.tv.publish({ reason: 'Today’s birthday wishes pushed to the TV' });
            EVA.publish.success({ text: pending.length + ' birthday ' + U.pluralize(pending.length, 'slide') + ' now on the office TV.' });
            EVA.app.refresh();
          });
          return;
        }

        if (!empId) return;
        var emp = S.employees.get(empId);
        var wish = S.birthdays.wishFor(empId);

        if (act === 'edit') openEditor(empId);
        else if (act === 'preview') {
          EVA.publish.preview({
            title: 'Slide preview', sub: 'Birthday slide for ' + emp.name,
            hidePublish: true, autoplay: false,
            slides: [slideFor(emp, wish ? wish.message : S.birthdays.defaultMessage(emp))]
          });
        } else if (act === 'publish') {
          var ensured = S.birthdays.ensure(empId);
          ui.confirm({
            title: 'Publish this content to the office TV?',
            html: 'The birthday slide for <strong>' + U.esc(emp.name) + '</strong> will go live on the office display.',
            confirmLabel: 'Push to TV', icon: 'send',
            preview: '<div class="kv"><span class="kv__k">Message</span></div>' +
              '<p style="font-size:12.5px;line-height:1.55;font-style:italic">' + U.esc(ensured.message) + '</p>'
          }).then(function (ok) {
            if (!ok) return;
            S.birthdays.publish(ensured.id);
            S.tv.publish({
              birthdayEmployeeId: emp.id,
              reason: 'Birthday wish for <strong>' + U.esc(emp.name) + '</strong> pushed to the TV'
            });
            EVA.publish.success({ text: emp.name + '’s birthday slide is now on the office TV.' });
            EVA.app.refresh();
          });
        } else if (act === 'unpublish') {
          S.birthdays.unpublish(wish.id);
          S.tv.publish({ reason: 'Birthday slide removed from the TV' });
          ui.toast.info('Removed from TV', 'The message is back to draft.');
          EVA.app.refresh();
        }
      });
    }
  };
})(window.EVA = window.EVA || {});
