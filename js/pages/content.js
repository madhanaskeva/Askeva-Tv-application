/* ==========================================================================\n+   pages/content.js — content media hub\n+   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils, ui = EVA.ui, icon = EVA.icon;
  var S = EVA.services;

  var MODULES = [
    { id: 'employees', label: 'Employee', description: 'Manage the people who appear in office TV content.', icon: 'users', count: function () { return S.employees.stats().total; }, unit: 'people' },
    { id: 'performers', label: 'Employee Recognition', description: 'Publish recognition and celebrate standout work.', icon: 'trophy', count: function () { return S.performers.stats().published; }, unit: 'published' },
    { id: 'birthdays', label: 'Birthday Wishes', description: 'Create birthday messages for the office screen.', icon: 'cake', count: function () { return S.birthdays.stats().today; }, unit: 'today' },
    { id: 'announcements', label: 'Announcements', description: 'Share notices, updates, and office moments.', icon: 'megaphone', count: function () { return S.announcements.stats().active; }, unit: 'active' },
    { id: 'events', label: 'Events', description: 'Keep upcoming events visible to the whole team.', icon: 'calendar', count: function () { return S.events.stats().active; }, unit: 'upcoming' },
    { id: 'events/past', label: 'Past Events Highlights', description: 'Review completed events and keep the best moments visible.', icon: 'clock', count: function () { return S.events.all().filter(function (event) { return event.endDate && event.endDate < U.today(); }).length; }, unit: 'highlights' },
    { id: 'achievements', label: 'Achievements & Awards', description: 'Showcase milestones, awards, and wins from across the team.', icon: 'award', count: function () { return S.achievements.stats().published; }, unit: 'published' }
  ];

  EVA.pages.content = {
    title: 'Content Media',

    render: function () {
      return '<div class="page__head">' +
          '<div class="page__head-text">' +
            '<h1 class="page__title">Content Media</h1>' +
            '<p class="page__desc">Choose a content area to create, manage, and publish what appears on the office TV.</p>' +
          '</div>' +
        '</div>' +
        '<div class="section">' +
          '<div class="content-module-grid">' +
            MODULES.map(function (item) {
              var value = item.count();
              return '<a class="content-module" href="#/' + item.id + '">' +
                '<div class="content-module__top">' +
                  '<span class="content-module__icon">' + icon(item.icon) + '</span>' +
                  '<span class="content-module__arrow">' + icon('arrow-right', { size: 17 }) + '</span>' +
                '</div>' +
                '<div class="content-module__title">' + U.esc(item.label) + '</div>' +
                '<p class="content-module__desc">' + U.esc(item.description) + '</p>' +
                '<div class="content-module__meta"><strong>' + U.esc(String(value)) + '</strong> ' + U.esc(item.unit) + '</div>' +
              '</a>';
            }).join('') +
          '</div>' +
        '</div>';
    }
  };
})(window.EVA = window.EVA || {});