/* ==========================================================================
   pages/notices.js — Notices & Holidays page matching the mockups
   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils, icon = EVA.icon;

  var state = {
    notices: [
      { priority: 'HIGH', title: 'Quarterly All-Hands Meeting', text: 'Join us on Friday at 3 PM in the main conference room for Q3 updates and team recognition.' },
      { priority: 'NORMAL', title: 'New Coffee Machine Installed', text: 'The new espresso machine is live in the pantry. Enjoy responsibly!' },
      { priority: 'LOW', title: 'Office WiFi Maintenance', text: 'Network will be briefly unavailable Saturday 2-4 AM for infrastructure upgrades.' }
    ],
    holidays: [
      { title: 'Independence Day', sub: 'National holiday — office closed', date: 'Aug 15, 2026' },
      { title: 'Company holiday', sub: 'holiday', date: 'Sep 9, 2026' },
      { title: 'Gandhi Jayanti', sub: 'National holiday — office closed', date: 'Oct 2, 2026' },
      { title: 'Diwali', sub: 'Festival of lights — office closed', date: 'Nov 1, 2026' },
      { title: 'Christmas', sub: 'Office closed for Christmas', date: 'Dec 25, 2026' }
    ]
  };

  function renderNotice(n) {
    var pTone = 'background: var(--cream); border: 1px solid var(--ink); color: var(--gray);';
    if (n.priority === 'HIGH') pTone = 'background: var(--lime); border: 1px solid var(--ink); color: var(--ink);';
    if (n.priority === 'NORMAL') pTone = 'background: var(--white); border: 1px solid var(--ink); color: var(--ink);';
    
    return '<div class="card card--flat" style="margin-bottom: 10px; padding: 14px; border: 1.5px solid var(--ink); display: flex; gap: 12px; align-items: flex-start;">' +
      '<div style="font-size: 9px; font-weight: 700; font-family: var(--font-mono); padding: 3px 6px; border-radius: 2px; text-transform: uppercase; letter-spacing: 0.5px; ' + pTone + '">' + n.priority + '</div>' +
      '<div style="flex: 1; min-width: 0;">' +
        '<div style="font-weight: 650; font-size: 13.5px; margin-bottom: 4px; color: var(--ink);">' + U.esc(n.title) + '</div>' +
        '<div style="font-size: 12px; color: var(--gray); line-height: 1.4;">' + U.esc(n.text) + '</div>' +
      '</div>' +
    '</div>';
  }

  function renderHoliday(h) {
    return '<div class="card card--flat" style="margin-bottom: 10px; padding: 14px 16px; border: 1.5px solid var(--ink); display: flex; justify-content: space-between; align-items: center; gap: 16px;">' +
      '<div style="flex: 1; min-width: 0;">' +
        '<div style="font-weight: 650; font-size: 13.5px; margin-bottom: 4px; color: var(--ink);">' + U.esc(h.title) + '</div>' +
        '<div style="font-size: 12px; color: var(--gray);">' + U.esc(h.sub) + '</div>' +
      '</div>' +
      '<div style="font-family: var(--font-mono); font-size: 10.5px; font-weight: 700; color: var(--ink); flex: none;">' + h.date + '</div>' +
    '</div>';
  }

  EVA.pages.notices = {
    title: 'Notices & Holidays',
    
    render: function () {
      var html = '<div class="page__head">' +
        '<div class="page__head-text">' +
          '<h1 class="page__title">Notices & Holidays</h1>' +
          '<p class="page__desc">Manage office notices and holiday calendar</p>' +
        '</div>' +
      '</div>';

      html += '<div class="split">';
      
      // LEFT COLUMN: NOTICES
      html += '<div>';
      html += '<h3 style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 15px; font-weight: 650;">' + icon('megaphone', {size: 18}) + ' Notices</h3>';
      
      // Notice Form
      html += '<div class="card card--flat" style="padding: 16px; margin-bottom: 24px; border: 2px solid var(--ink);">';
      html += '<input type="text" placeholder="Notice title" style="width: 100%; border: 1.5px solid var(--ink); padding: 10px 12px; margin-bottom: 12px; border-radius: 2px; outline: none; font-size: 13px;">';
      html += '<textarea placeholder="Notice details..." rows="3" style="width: 100%; border: 1.5px solid var(--ink); padding: 10px 12px; margin-bottom: 14px; border-radius: 2px; resize: none; outline: none; font-size: 13px; font-family: inherit;"></textarea>';
      html += '<div style="display: flex; gap: 12px; align-items: center;">';
      html += '<select style="border: 1.5px solid var(--ink); padding: 8px 12px; border-radius: 2px; font-size: 13px; background: #fff; outline: none;"><option>Normal</option><option>High</option><option>Low</option></select>';
      html += '<button class="btn btn--primary" style="border-radius: 2px; font-weight: 700;">+ Add</button>';
      html += '</div>';
      html += '</div>'; // End Form

      html += '<div class="list">' + state.notices.map(renderNotice).join('') + '</div>';
      html += '</div>';

      // RIGHT COLUMN: HOLIDAYS
      html += '<div>';
      html += '<h3 style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 15px; font-weight: 650;">' + icon('calendar', {size: 18}) + ' Holidays</h3>';
      
      // Holiday Form
      html += '<div class="card card--flat" style="padding: 16px; margin-bottom: 24px; border: 2px solid var(--ink);">';
      html += '<input type="text" placeholder="Holiday name" style="width: 100%; border: 1.5px solid var(--ink); padding: 10px 12px; margin-bottom: 12px; border-radius: 2px; outline: none; font-size: 13px;">';
      html += '<div style="position: relative; margin-bottom: 12px;">';
      html += '<input type="text" placeholder="dd----yyyy" style="width: 100%; border: 1.5px solid var(--ink); padding: 10px 12px; border-radius: 2px; outline: none; font-size: 13px;">';
      html += '<span style="position: absolute; right: 12px; top: 11px; color: var(--ink);">' + icon('calendar', {size: 16}) + '</span>';
      html += '</div>';
      html += '<input type="text" placeholder="Description (optional)" style="width: 100%; border: 1.5px solid var(--ink); padding: 10px 12px; margin-bottom: 14px; border-radius: 2px; outline: none; font-size: 13px;">';
      html += '<button class="btn btn--primary" style="border-radius: 2px; font-weight: 700;">+ Add Holiday</button>';
      html += '</div>'; // End Form

      html += '<div class="list">' + state.holidays.map(renderHoliday).join('') + '</div>';
      html += '</div>';

      html += '</div>'; // End split
      return html;
    },

    mount: function (el) {
      // Stub functionality to ensure app flow is unbroken
    }
  };

})(window.EVA = window.EVA || {});

