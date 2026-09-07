/* ==========================================================================
   pages/events.js — company events, celebrations
   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils, ui = EVA.ui, icon = EVA.icon;
  var S = EVA.services;

  var state = { search: '', status: 'all', priority: 'all', sort: 'startDate', dir: 'desc' };

  function slideFor(a) {
    return {
      id: 'sl_evt_' + (a.id || 'tmp'), type: 'event', duration: a.duration || 10,
      label: 'Event — ' + a.title,
      data: { title: a.title, text: a.description, image: a.image, category: a.category, priority: a.priority, location: a.location }
    };
  }

  /* ---------------- form ---------------- */

  function openForm(id, onSaved) {
    var evt = id ? S.events.get(id) : null;
    var defaults = S.settings.get();

    function body(errors) {
      errors = errors || {};
      var a = evt || {};
      return '<form id="evtForm" novalidate>' +
        ui.field({
          label: 'Event Title', name: 'title', required: true, value: a.title || '',
          placeholder: 'e.g. Diwali Celebration', maxlength: 80, error: errors.title, autofocus: true
        }) +
        ui.field({
          type: 'textarea', label: 'Description', name: 'description', required: true, rows: 4,
          value: a.description || '', maxlength: 400,
          placeholder: 'What are the details of the event?', error: errors.description
        }) +
        '<div class="field-row">' +
          ui.field({
            type: 'select', label: 'Category', name: 'category', value: a.category || 'All-Hands',
            options: S.events.CATEGORIES
          }) +
          ui.field({
            type: 'select', label: 'Priority', name: 'priority', value: a.priority || 'normal',
            options: S.events.PRIORITIES.map(function (p) { return { value: p, label: U.titleCase(p) }; }),
            hint: 'Urgent slides are styled red on the TV.'
          }) +
        '</div>' +
        ui.field({
          label: 'Location (Optional)', name: 'location', value: a.location || '',
          placeholder: 'e.g. Main Conference Room or Zoom Link', hint: 'Where is this event taking place?'
        }) +
        ui.imageUpload({
          label: 'Banner Image', name: 'image', value: a.image || '',
          hint: 'Optional banner shown above the title.'
        }) +
        '<div class="field-row--3 field-row">' +
          ui.field({ type: 'date', label: 'Start date', name: 'startDate', required: true, value: a.startDate || U.today(), error: errors.startDate }) +
          ui.field({ type: 'date', label: 'End date', name: 'endDate', value: a.endDate || '', error: errors.endDate }) +
          ui.field({
            type: 'number', label: 'Duration (s)', name: 'duration',
            value: a.duration || defaults.defaultDuration, min: 3, max: 120, error: errors.duration
          }) +
        '</div>' +
        ui.field({
          type: 'select', label: 'Status', name: 'status', value: a.status || 'draft',
          options: [
            { value: 'draft', label: 'Draft — not on the TV' },
            { value: 'scheduled', label: 'Scheduled — publishes on the start date' },
            { value: 'published', label: 'Published — live on the TV' },
            { value: 'inactive', label: 'Inactive — hidden' }
          ]
        }) +
      '</form>';
    }

    ui.modal({
      title: evt ? 'Edit event' : 'Create event',
      sub: evt ? U.truncate(evt.title, 50) : 'Company events, celebrations, and gatherings',
      icon: 'calendar',
      size: 'lg',
      body: body(),
      foot:
        '<button class="btn btn--soft" type="button" data-close>Cancel</button>' +
        '<button class="btn btn--soft" type="button" data-preview>' + icon('eye', { size: 16 }) + 'Preview</button>' +
        '<button class="btn btn--soft" type="button" data-draft>' + icon('save', { size: 16 }) + 'Save draft</button>' +
        '<button class="btn btn--primary" type="button" data-publish>' + icon('send', { size: 16 }) + 'Publish to TV</button>',
      onMount: function (c) {
        var form = c.el.querySelector('#evtForm');

        c.el.querySelector('[data-preview]').addEventListener('click', function () {
          var d = ui.readForm(form);
          var check = S.events.validate(d);
          if (!check.valid) { ui.showErrors(form, check.errors); return; }
          EVA.publish.preview({
            title: 'Slide preview', sub: 'How this event will look on the office TV',
            hidePublish: true, autoplay: false, slides: [slideFor(check.data)]
          });
        });

        function persist(status) {
          var d = ui.readForm(form);
          if (status) d.status = status;
          var check = S.events.validate(d);
          if (!check.valid) {
            ui.showErrors(form, check.errors);
            ui.toast.error('Check the highlighted fields');
            return null;
          }
          return evt ? S.events.update(id, check.data) : S.events.create(check.data);
        }

        c.el.querySelector('[data-draft]').addEventListener('click', function () {
          var saved = persist(form.elements.status.value === 'published' ? null : form.elements.status.value);
          if (!saved) return;
          ui.toast.success('Event saved', saved.status === 'published' ? 'It is live on the TV.' : 'Saved as ' + saved.status + '.');
          c.close();
          if (onSaved) onSaved();
          EVA.app.refresh();
        });

        c.el.querySelector('[data-publish]').addEventListener('click', function () {
          var d = ui.readForm(form);
          var check = S.events.validate(d);
          if (!check.valid) { ui.showErrors(form, check.errors); return; }

          ui.confirm({
            title: 'Publish this event to the office TV?',
            html: '<strong>' + U.esc(check.data.title) + '</strong> will appear in the TV loop for ' +
              check.data.duration + ' seconds per rotation.',
            confirmLabel: 'Push to TV', icon: 'send'
          }).then(function (ok) {
            if (!ok) return;
            var saved = persist('published');
            if (!saved) return;
            S.tv.publish({ reason: 'Event <strong>' + U.esc(saved.title) + '</strong> pushed to the TV' });
            c.close();
            EVA.publish.success({ text: '“' + U.truncate(saved.title, 46) + '” is now on the office TV.' });
            if (onSaved) onSaved();
            EVA.app.refresh();
          });
        });
      }
    });
  }

  /* ---------------- cards ---------------- */

  function card(a) {
    var live = a.status === 'published' && S.events.inWindow(a);
    var expired = a.status === 'published' && !S.events.inWindow(a);

    return '<article class="ann' + (a.priority === 'urgent' ? ' ann--urgent' : '') + '" data-id="' + U.attr(a.id) + '">' +
      '<div class="ann__media' + (a.image ? '' : ' ann__media--placeholder') + '">' +
        (a.image
          ? '<img src="' + U.attr(a.image) + '" alt="" onerror="this.parentNode.classList.add(\'ann__media--placeholder\');this.remove()">'
          : icon('calendar', { size: 30 })) +
        '<div class="ann__badges">' +
          (live ? ui.badge('live', { label: 'On TV' }) : ui.badge(expired ? 'inactive' : a.status, expired ? { label: 'Expired' } : {})) +
          ui.priorityBadge(a.priority) +
        '</div>' +
      '</div>' +
      '<div class="ann__body">' +
        '<div class="eyebrow" style="margin-bottom:7px">' + U.esc(a.category) + '</div>' +
        '<h3 class="ann__title">' + U.esc(a.title) + '</h3>' +
        '<p class="ann__desc">' + U.esc(a.description) + '</p>' +
        (a.location ? '<p class="ann__desc" style="margin-top: 4px; font-weight: bold;">' + icon('map-pin', { size: 12 }) + ' ' + U.esc(a.location) + '</p>' : '') +
        '<div class="ann__meta">' +
          '<span>' + icon('calendar') + U.esc(U.formatDate(a.startDate, true)) +
            (a.endDate ? ' → ' + U.esc(U.formatDate(a.endDate, true)) : '') + '</span>' +
          '<span>' + icon('clock') + a.duration + 's</span>' +
        '</div>' +
      '</div>' +
      '<div class="ann__foot">' +
        '<span class="btn-group">' +
          '<button class="btn btn--xs btn--soft" data-act="edit">' + icon('edit', { size: 13 }) + 'Edit</button>' +
          '<button class="btn btn--xs btn--soft btn--icon" data-act="preview" title="Preview">' + icon('eye', { size: 13 }) + '</button>' +
          '<button class="btn btn--xs btn--soft btn--icon" data-act="delete" title="Delete">' + icon('trash', { size: 13 }) + '</button>' +
        '</span>' +
        (live
          ? '<button class="btn btn--xs btn--soft" data-act="unpublish">' + icon('eye-off', { size: 13 }) + 'Remove</button>'
          : '<button class="btn btn--xs btn--primary" data-act="publish">' + icon('send', { size: 13 }) + 'Publish</button>') +
      '</div>' +
    '</article>';
  }

  /* ---------------- page ---------------- */

  EVA.pages.events = {
    title: 'Events',
    openForm: openForm,

    render: function () {
      var rows = S.events.query(state);
      var stats = S.events.stats();
      var filtering = state.search || state.status !== 'all' || state.priority !== 'all';

      function sel(name, value, options, label) {
        return '<div class="select-wrap">' +
          '<select class="select' + (value !== 'all' ? ' is-filtered' : '') + '" data-filter="' + name + '">' +
            '<option value="all">' + U.esc(label) + '</option>' +
            options.map(function (o) {
              return '<option value="' + U.attr(o) + '"' + (o === value ? ' selected' : '') + '>' + U.esc(U.titleCase(o)) + '</option>';
            }).join('') +
          '</select>' + icon('chevron-down', { size: 14 }) + '</div>';
      }

      return '<div class="page__head">' +
          '<div class="page__head-text">' +
            '<h1 class="page__title">Events</h1>' +
            '<p class="page__desc">' + stats.active + ' active on the TV · ' + stats.scheduled +
              ' scheduled · ' + stats.drafts + ' ' + U.pluralize(stats.drafts, 'draft') +
              '. Events only display between their start and end dates.</p>' +
          '</div>' +
          '<div class="page__actions">' +
            '<button class="btn btn--soft" type="button" data-act="preview-all">' + icon('eye', { size: 16 }) + 'Preview TV</button>' +
            '<button class="btn btn--primary" type="button" data-act="add">' + icon('plus', { size: 16 }) + 'Create event</button>' +
          '</div>' +
        '</div>' +

        '<div class="toolbar">' +
          '<div class="toolbar__search">' + icon('search') +
            '<input type="search" data-search data-focus-key="evtSearch" placeholder="Search events…" value="' + U.attr(state.search) + '">' +
          '</div>' +
          sel('status', state.status, S.events.STATUSES, 'Any status') +
          sel('priority', state.priority, S.events.PRIORITIES, 'Any priority') +
          (filtering ? '<button class="btn btn--ghost btn--sm" type="button" data-act="clear">' + icon('x', { size: 14 }) + 'Clear</button>' : '') +
          '<div class="toolbar__spacer"></div>' +
          '<div class="segment">' +
            '<button class="segment__btn' + (state.sort === 'startDate' ? ' is-active' : '') + '" type="button" data-sort="startDate">' + icon('calendar', { size: 14 }) + 'Date</button>' +
            '<button class="segment__btn' + (state.sort === 'priority' ? ' is-active' : '') + '" type="button" data-sort="priority">' + icon('flag', { size: 14 }) + 'Priority</button>' +
            '<button class="segment__btn' + (state.sort === 'title' ? ' is-active' : '') + '" type="button" data-sort="title">' + icon('sort', { size: 14 }) + 'Title</button>' +
          '</div>' +
        '</div>' +

        (rows.length
          ? '<div class="grid grid--3">' + rows.map(card).join('') + '</div>'
          : '<div class="card card--soft"><div class="card__body">' + ui.empty({
              icon: filtering ? 'search' : 'calendar',
              title: filtering ? 'No events match' : 'No events yet',
              text: filtering
                ? 'Try a different search or clear the filters.'
                : 'Create your first event to share news on the office TV.',
              actions: filtering
                ? '<button class="btn btn--soft" type="button" data-act="clear">Clear filters</button>'
                : '<button class="btn btn--primary" type="button" data-act="add">' + icon('plus', { size: 16 }) + 'Create event</button>'
            }) + '</div></div>');
    },

    mount: function (root) {
      var search = root.querySelector('[data-search]');
      if (search) {
        search.addEventListener('input', U.debounce(function () {
          state.search = search.value;
          EVA.app.refresh();
        }, 220));
      }

      Array.prototype.forEach.call(root.querySelectorAll('[data-filter]'), function (sel) {
        sel.addEventListener('change', function () {
          state[sel.dataset.filter] = sel.value;
          EVA.app.refresh();
        });
      });

      root.addEventListener('click', function (e) {
        var t;

        if ((t = e.target.closest('[data-sort]'))) {
          state.sort = t.dataset.sort;
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
        if (act === 'clear') {
          state.search = ''; state.status = 'all'; state.priority = 'all';
          EVA.app.refresh();
          return;
        }
        if (!id) return;

        var a = S.events.get(id);
        if (act === 'edit') openForm(id);
        else if (act === 'preview') {
          EVA.publish.preview({
            title: 'Slide preview', sub: U.truncate(a.title, 50),
            hidePublish: true, autoplay: false, slides: [slideFor(a)]
          });
        } else if (act === 'publish') {
          EVA.publish.item('events', id, a.title).then(function (ok) { if (ok) EVA.app.refresh(); });
        } else if (act === 'unpublish') {
          S.events.unpublish(id);
          S.tv.publish({ reason: 'Event removed from the TV' });
          ui.toast.info('Removed from TV', 'The event is now inactive.');
          EVA.app.refresh();
        } else if (act === 'delete') {
          ui.confirm({
            title: 'Delete this event?',
            html: '<strong>' + U.esc(a.title) + '</strong> will be permanently removed.',
            confirmLabel: 'Delete', tone: 'danger'
          }).then(function (ok) {
            if (!ok) return;
            var wasLive = a.status === 'published';
            S.events.remove(id);
            if (wasLive) S.tv.publish({ reason: 'Event deleted' });
            ui.toast.success('Event deleted');
            EVA.app.refresh();
          });
        }
      });
    }
  };
})(window.EVA = window.EVA || {});
