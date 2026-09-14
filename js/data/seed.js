/* ==========================================================================
   seed.js — first-run demo dataset.
   Only used when a collection has never been written. Replace this file with
   API bootstrapping when a backend exists.
   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils;

  /* Birthdays are generated relative to today so the demo always has a
     believable "today / upcoming / past" spread on any day of the year. */
  function birthdayIn(dayOffset, birthYear) {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + dayOffset);
    return birthYear + '-' + U.pad2(d.getMonth() + 1) + '-' + U.pad2(d.getDate());
  }
  function daysAgoISO(n) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    return U.toISO(d);
  }
  function hoursAgo(n) {
    return new Date(Date.now() - n * 3600000).toISOString();
  }
  function inDays(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return U.toISO(d);
  }

  var DEPARTMENTS = [
    'Sales', 'Engineering', 'Marketing', 'Customer Success',
    'Operations', 'People & Culture', 'Design', 'Finance', 'Developers'
  ];

  var EMPLOYEES = [
    { name: 'Priya Sharma',   employeeId: 'EVA-001', role: 'Sales Lead',            department: 'Sales',            birthday: birthdayIn(0, 1994),   joiningDate: '2021-03-15', status: 'active' },
    { name: 'Sana Khan',      employeeId: 'EVA-002', role: 'Customer Success Lead', department: 'Customer Success', birthday: birthdayIn(0, 1996),   joiningDate: '2022-07-04', status: 'active' },
    { name: 'Arjun Mehta',    employeeId: 'EVA-003', role: 'Customer Support Executive', department: 'Customer Success', birthday: birthdayIn(1, 1997), joiningDate: '2023-01-09', status: 'active' },
    { name: 'Neha Patel',     employeeId: 'EVA-004', role: 'Marketing Manager',     department: 'Marketing',        birthday: birthdayIn(4, 1993),   joiningDate: '2020-11-23', status: 'active' },
    { name: 'Rahul Verma',    employeeId: 'EVA-005', role: 'Senior Engineer',       department: 'Engineering',      birthday: birthdayIn(9, 1992),   joiningDate: '2019-06-02', status: 'active' },
    { name: 'Divya Nair',     employeeId: 'EVA-006', role: 'Product Designer',      department: 'Design',           birthday: birthdayIn(16, 1995),  joiningDate: '2022-02-14', status: 'active' },
    { name: 'Karthik Raman',  employeeId: 'EVA-007', role: 'Backend Engineer',      department: 'Engineering',      birthday: birthdayIn(23, 1991),  joiningDate: '2021-08-30', status: 'active' },
    { name: 'Ananya Iyer',    employeeId: 'EVA-008', role: 'HR Business Partner',   department: 'People & Culture', birthday: birthdayIn(-3, 1990),  joiningDate: '2018-05-21', status: 'active' },
    { name: 'Vikram Desai',   employeeId: 'EVA-009', role: 'Account Executive',     department: 'Sales',            birthday: birthdayIn(-11, 1994), joiningDate: '2023-09-11', status: 'active' },
    { name: 'Meera Joshi',    employeeId: 'EVA-010', role: 'Operations Analyst',    department: 'Operations',       birthday: birthdayIn(38, 1996),  joiningDate: '2024-01-08', status: 'on-leave' },
    { name: 'Rohit Bansal',   employeeId: 'EVA-011', role: 'Finance Manager',       department: 'Finance',          birthday: birthdayIn(52, 1989),  joiningDate: '2020-02-17', status: 'active' },
    { name: 'Tanvi Rao',      employeeId: 'EVA-012', role: 'Content Strategist',    department: 'Marketing',        birthday: birthdayIn(-26, 1998), joiningDate: '2024-06-03', status: 'inactive' }
  ];

  function demoAvatar(initials, bg, fg) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">' +
      '<defs>' +
        '<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" stop-color="' + (bg || '#0d281a') + '"/>' +
          '<stop offset="100%" stop-color="#05100a"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<rect width="200" height="200" rx="100" fill="url(#g)"/>' +
      '<circle cx="100" cy="78" r="40" fill="' + (fg || '#C7F53F') + '" opacity="0.9"/>' +
      '<path d="M35 178 C45 132 70 120 100 120 C130 120 155 132 165 178 Z" fill="' + (fg || '#C7F53F') + '" opacity="0.85"/>' +
      '<text x="100" y="88" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="#08150E" text-anchor="middle">' + initials + '</text>' +
      '</svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function buildEmployees() {
    var now = new Date().toISOString();
    return EMPLOYEES.map(function (e, i) {
      var inits = U.initials(e.name);
      return Object.assign({
        id: 'emp_' + U.pad2(i + 1),
        photo: demoAvatar(inits, '#113322', '#C7F53F'),
        email: e.name.toLowerCase().split(' ')[0] + '@askeva.io',
        createdAt: now,
        updatedAt: now
      }, e);
    });
  }

  function buildPerformers() {
    var now = new Date().toISOString();
    return [
      {
        id: 'perf_01', employeeId: 'emp_03', period: 'day', rank: 1,
        title: 'Fastest response time',
        description: 'Closed 32 support tickets with a 4 minute average first response.',
        status: 'published', publishedAt: hoursAgo(3), createdAt: now, updatedAt: now
      },
      {
        id: 'perf_02', employeeId: 'emp_04', period: 'week', rank: 1,
        title: 'Campaign of the week',
        description: 'Launched the September product campaign — 14 qualified demos booked.',
        status: 'published', publishedAt: hoursAgo(26), createdAt: now, updatedAt: now
      },
      {
        id: 'perf_03', employeeId: 'emp_02', period: 'month', rank: 1,
        title: 'Highest customer satisfaction',
        description: '98% CSAT across 300+ conversations, with zero escalations this month.',
        status: 'published', publishedAt: hoursAgo(50), createdAt: now, updatedAt: now
      },
      {
        id: 'perf_04', employeeId: 'emp_01', period: 'month', rank: 2,
        title: 'Top revenue contributor',
        description: 'Closed ₹42L in new business and renewed three enterprise accounts.',
        status: 'draft', publishedAt: null, createdAt: now, updatedAt: now
      },
      {
        id: 'perf_05', employeeId: 'emp_05', period: 'week', rank: 2,
        title: 'Shipped the release',
        description: 'Delivered the v2.4 release two days early with no rollbacks.',
        status: 'draft', publishedAt: null, createdAt: now, updatedAt: now
      }
    ];
  }

  function buildWishes() {
    var now = new Date().toISOString();
    return [
      {
        id: 'wish_01', employeeId: 'emp_01',
        message: 'Wishing you an amazing year ahead, Priya — thank you for everything you bring to the team!',
        status: 'published', publishedAt: hoursAgo(2), year: new Date().getFullYear(),
        createdAt: now, updatedAt: now
      },
      {
        id: 'wish_02', employeeId: 'emp_02',
        message: 'Happy birthday Sana! Here is to another year of brilliant customer stories.',
        status: 'draft', publishedAt: null, year: new Date().getFullYear(),
        createdAt: now, updatedAt: now
      },
      {
        id: 'wish_03', employeeId: 'emp_03',
        message: 'Happy birthday Arjun! Wishing you a fantastic day and an even better year.',
        status: 'draft', publishedAt: null, year: new Date().getFullYear(),
        createdAt: now, updatedAt: now
      }
    ];
  }

  function buildAnnouncements() {
    var now = new Date().toISOString();
    return [
      {
        id: 'ann_02',
        title: 'New Coffee Machine in the Pantry',
        description: 'The pantry now has a fresh bean-to-cup machine. Please rinse the tray after use — the office gods are watching.',
        image: '', category: 'Notice', priority: 'normal',
        startDate: daysAgoISO(2), endDate: inDays(10), duration: 10,
        status: 'published', publishedAt: hoursAgo(48),
        createdAt: now, updatedAt: now
      },
      {
        id: 'ann_04',
        title: 'Server Maintenance Window',
        description: 'Internal tools will be unavailable on Sunday between 1:00 AM and 4:00 AM while we upgrade the database.',
        image: '', category: 'Important Notice', priority: 'urgent',
        startDate: inDays(3), endDate: inDays(4), duration: 10,
        status: 'draft', publishedAt: null,
        createdAt: now, updatedAt: now
      }
    ];
  }

  function buildEvents() {
    var now = new Date().toISOString();
    return [
      {
        id: 'evt_01',
        title: 'All-Hands: Q4 Kickoff',
        description: 'Join us in the main conference room on Friday at 4:00 PM for the Q4 roadmap, hiring plan and the team awards.',
        location: 'Main Conference Room',
        image: '', category: 'All-Hands', priority: 'high',
        startDate: U.today(), endDate: inDays(5), duration: 12,
        status: 'published', publishedAt: hoursAgo(5),
        createdAt: now, updatedAt: now
      },
      {
        id: 'evt_02',
        title: 'Diwali Celebration — Save the Date',
        description: 'Team lunch, rangoli contest and the annual quiz. Dress code: festive. Family members welcome.',
        location: 'Cafeteria',
        image: '', category: 'Celebration', priority: 'normal',
        startDate: inDays(12), endDate: inDays(16), duration: 12,
        status: 'scheduled', publishedAt: null,
        createdAt: now, updatedAt: now
      }
    ];
  }

  function buildAchievements() {
    var now = new Date().toISOString();
    return [
      {
        id: 'ach_01', employeeId: 'emp_03', type: 'Intern to Full-Time',
        title: 'Promoted to Customer Support Executive!',
        description: 'Arjun successfully completed his internship and is now full-time.',
        status: 'published', publishedAt: hoursAgo(1),
        createdAt: now, updatedAt: now
      },
      {
        id: 'ach_02', employeeId: 'emp_05', type: 'Work Anniversary',
        title: '5 Years at AskEVA!',
        description: 'Thank you Rahul for 5 amazing years of engineering excellence.',
        status: 'published', publishedAt: hoursAgo(24),
        createdAt: now, updatedAt: now
      }
    ];
  }

  function buildPlaylist() {
    return [
      { id: 'slot_bday',  type: 'birthday',    name: 'Birthday Wishes',      enabled: true,  duration: 12, order: 0 },
      { id: 'slot_perf',  type: 'performer',   name: 'Top Performers',       enabled: true,  duration: 14, order: 1 },
      { id: 'slot_ann',   type: 'announcement',name: 'Announcements',        enabled: true,  duration: 12, order: 2 },
      { id: 'slot_recog', type: 'recognition', name: 'Employee Recognition', enabled: true,  duration: 15, order: 3 },
      { id: 'slot_evt',   type: 'event',       name: 'Events & Celebrations',enabled: true,  duration: 12, order: 4 },
      { id: 'slot_ach',   type: 'achievement', name: 'Achievements & Milestones', enabled: true, duration: 12, order: 5 },
      { id: 'slot_kpi',   type: 'kpi',         name: 'Sales KPI Metrics',    enabled: true,  duration: 14, order: 6 },
      { id: 'slot_idle',  type: 'idle',        name: 'AskEVA Standby Card',  enabled: false, duration: 8,  order: 7 }
    ];
  }

  function buildSettings() {
    return {
      companyName: 'AskEVA',
      logo: '',
      tagline: 'Office TV',
      defaultBirthdayMessage: 'Wishing you an amazing year ahead — from all of us at AskEVA!',
      birthdayTemplate: {
        brandSuffix: ' SIGNAGE',
        brandSubtitle: 'CELEBRATION REEL',
        feedText: 'FEED: CHANNEL 01',
        feedMeta: '1080p60 · HDR10',
        photoBadge: 'SPOTLIGHT HONOREE',
        kicker: 'SPECIAL MILESTONE BROADCAST',
        titleMain: 'HAPPY',
        titleAccent: 'BIRTHDAY!',
        footerLeft: 'CINEMATRIX ENGINE',
        footerRight: 'EDID: 3840x2160@60HZ · UHD CANVAS',
        backgroundTheme: 'midnight',
        backgroundColor: 'rgb(8, 21, 14)',
        backgroundAccent: 'rgb(22, 53, 36)',
        accentColor: 'rgb(199, 245, 63)',
        textColor: 'rgb(255, 255, 255)',
        mutedColor: 'rgb(169, 178, 171)',
        panelColor: 'rgb(16, 40, 27)',
        particleCount: 14,
        particleColor: 'rgb(199, 245, 63)',
        particleOpacity: 0.5,
        particleSpeed: 18
      },
      defaultDuration: 12,
      refreshInterval: 15,
      theme: 'askeva-dark',
      showClock: true,
      showBrand: true,
      showProgress: true,
      transition: 'fade',
      tvPath: 'tv.html'
    };
  }

  function buildActivity() {
    return [
      { id: 'act_01', type: 'tv',        text: 'TV playlist published to the office display', actor: 'Admin', at: hoursAgo(2) },
      { id: 'act_02', type: 'birthday',  text: 'Birthday message for <strong>Priya Sharma</strong> published', actor: 'Admin', at: hoursAgo(2.4) },
      { id: 'act_03', type: 'performer', text: 'Top Performer of the Day set to <strong>Arjun Mehta</strong>', actor: 'Admin', at: hoursAgo(3) },
      { id: 'act_04', type: 'announcement', text: 'Announcement <strong>All-Hands: Q4 Kickoff</strong> published', actor: 'Admin', at: hoursAgo(5) },
      { id: 'act_05', type: 'employee',  text: 'Employee <strong>Tanvi Rao</strong> added to the directory', actor: 'Admin', at: hoursAgo(27) },
      { id: 'act_06', type: 'performer', text: 'Top Performer of the Month set to <strong>Sana Khan</strong>', actor: 'Admin', at: hoursAgo(50) }
    ];
  }

  function buildKpiRecords() {
    var now = new Date().toISOString();
    return [
      // --- 2025 Historical baseline ---
      {
        id: 'kpi_2025_w51',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 51, December 2025',
        periodKey: '2025-W51',
        periodStart: '2025-12-15',
        periodEnd: '2025-12-21',
        scope: 'team',
        metrics: { leads: 70, meetings: 22, dealsWon: 7, newClients: 3 },
        leads: 70, meetings: 22, dealsWon: 7, newClients: 3,
        customContent: {
          heading: '2025 Year-End Push',
          message: 'Solid momentum into annual closing.',
          subMessage: 'Enterprise pipeline building.',
          footer: 'AskEVA Revenue Intelligence'
        },
        chartType: 'line',
        status: 'approved',
        createdAt: '2025-12-22T10:00:00.000Z',
        updatedAt: '2025-12-22T10:00:00.000Z'
      },

      // --- June 2026 (Enterprise Sales) ---
      {
        id: 'kpi_w23',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 23, June 2026',
        periodKey: '2026-W23',
        periodStart: '2026-06-01',
        periodEnd: '2026-06-07',
        scope: 'team',
        metrics: { leads: 95, meetings: 28, dealsWon: 9, newClients: 4 },
        leads: 95, meetings: 28, dealsWon: 9, newClients: 4,
        customContent: { heading: 'June Kickoff', message: 'Steady outbound discovery calls.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      },
      {
        id: 'kpi_w24',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 24, June 2026',
        periodKey: '2026-W24',
        periodStart: '2026-06-08',
        periodEnd: '2026-06-14',
        scope: 'team',
        metrics: { leads: 105, meetings: 30, dealsWon: 11, newClients: 4 },
        leads: 105, meetings: 30, dealsWon: 11, newClients: 4,
        customContent: { heading: 'Mid June Acceleration', message: '11 enterprise deals progressed.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      },
      {
        id: 'kpi_w25',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 25, June 2026',
        periodKey: '2026-W25',
        periodStart: '2026-06-15',
        periodEnd: '2026-06-21',
        scope: 'team',
        metrics: { leads: 108, meetings: 31, dealsWon: 10, newClients: 5 },
        leads: 108, meetings: 31, dealsWon: 10, newClients: 5,
        customContent: { heading: 'Late June Progress', message: 'High meeting volume.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      },
      {
        id: 'kpi_w26',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 26, June 2026',
        periodKey: '2026-W26',
        periodStart: '2026-06-22',
        periodEnd: '2026-06-28',
        scope: 'team',
        metrics: { leads: 112, meetings: 31, dealsWon: 12, newClients: 5 },
        leads: 112, meetings: 31, dealsWon: 12, newClients: 5,
        customContent: { heading: 'Q2 Closing', message: 'Quarter end targets met.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      },

      // --- July 2026 (Enterprise Sales) ---
      {
        id: 'kpi_w27',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 27, July 2026',
        periodKey: '2026-W27',
        periodStart: '2026-06-29',
        periodEnd: '2026-07-05',
        scope: 'team',
        metrics: { leads: 115, meetings: 33, dealsWon: 12, newClients: 5 },
        leads: 115, meetings: 33, dealsWon: 12, newClients: 5,
        customContent: { heading: 'July Launch', message: 'Q3 pipeline expansion.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      },
      {
        id: 'kpi_w28',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 28, July 2026',
        periodKey: '2026-W28',
        periodStart: '2026-07-06',
        periodEnd: '2026-07-12',
        scope: 'team',
        metrics: { leads: 118, meetings: 35, dealsWon: 12, newClients: 6 },
        leads: 118, meetings: 35, dealsWon: 12, newClients: 6,
        customContent: { heading: 'Tier 1 Outbound', message: 'High response rate on campaigns.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      },
      {
        id: 'kpi_w29',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 29, July 2026',
        periodKey: '2026-W29',
        periodStart: '2026-07-13',
        periodEnd: '2026-07-19',
        scope: 'team',
        metrics: { leads: 122, meetings: 36, dealsWon: 13, newClients: 6 },
        leads: 122, meetings: 36, dealsWon: 13, newClients: 6,
        customContent: { heading: 'Mid-July Surge', message: 'Strong inbound lead volume.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      },
      {
        id: 'kpi_w30',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 30, July 2026',
        periodKey: '2026-W30',
        periodStart: '2026-07-20',
        periodEnd: '2026-07-26',
        scope: 'team',
        metrics: { leads: 125, meetings: 36, dealsWon: 13, newClients: 6 },
        leads: 125, meetings: 36, dealsWon: 13, newClients: 6,
        customContent: { heading: 'Late July Momentum', message: 'Closing deals ahead of August.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      },

      // --- August 2026 (Enterprise Sales) ---
      {
        id: 'kpi_w31',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 31, July 2026',
        periodKey: '2026-W31',
        periodStart: '2026-07-27',
        periodEnd: '2026-08-02',
        scope: 'team',
        metrics: { leads: 122, meetings: 32, dealsWon: 11, newClients: 5 },
        leads: 122, meetings: 32, dealsWon: 11, newClients: 5,
        customContent: { heading: 'Late July Push', message: 'Strong July month-end pipeline.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      },
      {
        id: 'kpi_w32',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 32, August 2026',
        periodKey: '2026-W32',
        periodStart: '2026-08-03',
        periodEnd: '2026-08-09',
        scope: 'team',
        metrics: { leads: 133, meetings: 33, dealsWon: 12, newClients: 6 },
        leads: 133, meetings: 33, dealsWon: 12, newClients: 6,
        customContent: { heading: 'Summer Campaign', message: 'Consistent meetings booked.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      },
      {
        id: 'kpi_w33',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 33, August 2026',
        periodKey: '2026-W33',
        periodStart: '2026-08-10',
        periodEnd: '2026-08-16',
        scope: 'team',
        metrics: { leads: 80, meetings: 25, dealsWon: 8, newClients: 4 },
        leads: 80, meetings: 25, dealsWon: 8, newClients: 4,
        customContent: {
          heading: 'Q3 Enterprise Momentum',
          message: 'Solid opening week for Enterprise campaigns.',
          subMessage: 'Focusing on mid-market outbound pipeline.',
          footer: 'AskEVA Revenue Intelligence'
        },
        chartType: 'line',
        status: 'approved',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'kpi_w34',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 34, August 2026',
        periodKey: '2026-W34',
        periodStart: '2026-08-17',
        periodEnd: '2026-08-23',
        scope: 'team',
        metrics: { leads: 95, meetings: 30, dealsWon: 11, newClients: 5 },
        leads: 95, meetings: 30, dealsWon: 11, newClients: 5,
        customContent: {
          heading: 'Accelerating Outbound',
          message: 'Key meetings scheduled with Tier-1 accounts.',
          subMessage: 'BDA outbound conversion rate up 12%.',
          footer: 'AskEVA Revenue Intelligence'
        },
        chartType: 'line',
        status: 'approved',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'kpi_w35',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 35, August 2026',
        periodKey: '2026-W35',
        periodStart: '2026-08-24',
        periodEnd: '2026-08-30',
        scope: 'team',
        metrics: { leads: 100, meetings: 35, dealsWon: 15, newClients: 7 },
        leads: 100, meetings: 35, dealsWon: 15, newClients: 7,
        customContent: {
          heading: 'Triple-Digit Lead Milestone',
          message: 'Reached 100 leads milestone before September kickoff.',
          subMessage: '7 enterprise deals signed.',
          footer: 'AskEVA Revenue Intelligence'
        },
        chartType: 'line',
        status: 'approved',
        createdAt: now,
        updatedAt: now
      },

      // --- September 2026 (Enterprise Sales) - Exact user specified numbers ---
      {
        id: 'kpi_w36',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 36, September 2026',
        periodKey: '2026-W36',
        periodStart: '2026-08-31',
        periodEnd: '2026-09-06',
        scope: 'team',
        metrics: { leads: 128, meetings: 42, dealsWon: 18, newClients: 9 },
        leads: 128, meetings: 42, dealsWon: 18, newClients: 9,
        customContent: {
          heading: 'Record-Breaking Week 36!',
          message: 'Exceptional performance across all four metrics.',
          subMessage: 'Highest single-week closed deals in Q3.',
          footer: 'AskEVA Revenue Intelligence'
        },
        chartType: 'line',
        status: 'published',
        publishedAt: now,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'kpi_w37',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 37, September 2026',
        periodKey: '2026-W37',
        periodStart: '2026-09-07',
        periodEnd: '2026-09-13',
        scope: 'team',
        metrics: { leads: 140, meetings: 45, dealsWon: 20, newClients: 11 },
        leads: 140, meetings: 45, dealsWon: 20, newClients: 11,
        customContent: {
          heading: 'Mid-September Outbound Surge',
          message: 'Outbound campaigns delivering 140 leads.',
          subMessage: '20 closed deals this week.',
          footer: 'AskEVA Revenue Intelligence'
        },
        chartType: 'line',
        status: 'approved',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'kpi_w38',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 38, September 2026',
        periodKey: '2026-W38',
        periodStart: '2026-09-14',
        periodEnd: '2026-09-20',
        scope: 'team',
        metrics: { leads: 155, meetings: 50, dealsWon: 22, newClients: 13 },
        leads: 155, meetings: 50, dealsWon: 22, newClients: 13,
        customContent: {
          heading: '50 Meetings Milestone',
          message: 'Record 50 qualified prospect meetings booked.',
          subMessage: 'Enterprise SDRs leading across all quotas.',
          footer: 'AskEVA Revenue Intelligence'
        },
        chartType: 'line',
        status: 'approved',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'kpi_w39',
        department: 'BDA',
        teamName: 'Enterprise Sales',
        periodType: 'weekly',
        periodLabel: 'Week 39, September 2026',
        periodKey: '2026-W39',
        periodStart: '2026-09-21',
        periodEnd: '2026-09-27',
        scope: 'team',
        metrics: { leads: 170, meetings: 55, dealsWon: 25, newClients: 15 },
        leads: 170, meetings: 55, dealsWon: 25, newClients: 15,
        customContent: {
          heading: 'September All-Time Peak',
          message: 'Historic record: 170 leads and 25 closed enterprise deals.',
          subMessage: 'September sums to 593 leads, 192 meetings, 85 deals, 48 clients.',
          footer: 'AskEVA Revenue Intelligence'
        },
        chartType: 'line',
        status: 'published',
        publishedAt: now,
        createdAt: now,
        updatedAt: now
      },

      // --- SMB Sales weekly records for team comparison ---
      {
        id: 'kpi_smb_w33',
        department: 'BDA',
        teamName: 'SMB Sales',
        periodType: 'weekly',
        periodLabel: 'Week 33, August 2026',
        periodKey: '2026-W33',
        periodStart: '2026-08-10',
        periodEnd: '2026-08-16',
        scope: 'team',
        metrics: { leads: 60, meetings: 20, dealsWon: 6, newClients: 2 },
        leads: 60, meetings: 20, dealsWon: 6, newClients: 2,
        customContent: { heading: 'SMB Outbound', message: 'SMB inbound pacing well.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      },
      {
        id: 'kpi_smb_w34',
        department: 'BDA',
        teamName: 'SMB Sales',
        periodType: 'weekly',
        periodLabel: 'Week 34, August 2026',
        periodKey: '2026-W34',
        periodStart: '2026-08-17',
        periodEnd: '2026-08-23',
        scope: 'team',
        metrics: { leads: 72, meetings: 24, dealsWon: 7, newClients: 3 },
        leads: 72, meetings: 24, dealsWon: 7, newClients: 3,
        customContent: { heading: 'SMB Growth', message: 'Steady increase in deals.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      },
      {
        id: 'kpi_smb_w35',
        department: 'BDA',
        teamName: 'SMB Sales',
        periodType: 'weekly',
        periodLabel: 'Week 35, August 2026',
        periodKey: '2026-W35',
        periodStart: '2026-08-24',
        periodEnd: '2026-08-30',
        scope: 'team',
        metrics: { leads: 75, meetings: 26, dealsWon: 9, newClients: 4 },
        leads: 75, meetings: 26, dealsWon: 9, newClients: 4,
        customContent: { heading: 'SMB Momentum', message: 'Approaching monthly quota.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      },
      {
        id: 'kpi_smb_w36',
        department: 'BDA',
        teamName: 'SMB Sales',
        periodType: 'weekly',
        periodLabel: 'Week 36, September 2026',
        periodKey: '2026-W36',
        periodStart: '2026-08-31',
        periodEnd: '2026-09-06',
        scope: 'team',
        metrics: { leads: 90, meetings: 30, dealsWon: 11, newClients: 6 },
        leads: 90, meetings: 30, dealsWon: 11, newClients: 6,
        customContent: { heading: 'SMB Strong September', message: 'Crossed 90 leads in Week 36.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      },
      {
        id: 'kpi_smb_w37',
        department: 'BDA',
        teamName: 'SMB Sales',
        periodType: 'weekly',
        periodLabel: 'Week 37, September 2026',
        periodKey: '2026-W37',
        periodStart: '2026-09-07',
        periodEnd: '2026-09-13',
        scope: 'team',
        metrics: { leads: 98, meetings: 33, dealsWon: 13, newClients: 7 },
        leads: 98, meetings: 33, dealsWon: 13, newClients: 7,
        customContent: { heading: 'SMB Expansion', message: 'Higher conversion on trials.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      },
      {
        id: 'kpi_smb_w38',
        department: 'BDA',
        teamName: 'SMB Sales',
        periodType: 'weekly',
        periodLabel: 'Week 38, September 2026',
        periodKey: '2026-W38',
        periodStart: '2026-09-14',
        periodEnd: '2026-09-20',
        scope: 'team',
        metrics: { leads: 110, meetings: 37, dealsWon: 15, newClients: 8 },
        leads: 110, meetings: 37, dealsWon: 15, newClients: 8,
        customContent: { heading: 'SMB Triple Digits', message: '110 leads recorded this week.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      },
      {
        id: 'kpi_smb_w39',
        department: 'BDA',
        teamName: 'SMB Sales',
        periodType: 'weekly',
        periodLabel: 'Week 39, September 2026',
        periodKey: '2026-W39',
        periodStart: '2026-09-21',
        periodEnd: '2026-09-27',
        scope: 'team',
        metrics: { leads: 122, meetings: 40, dealsWon: 17, newClients: 10 },
        leads: 122, meetings: 40, dealsWon: 17, newClients: 10,
        customContent: { heading: 'SMB September Finale', message: 'Record closing for SMB accounts.', subMessage: '', footer: 'AskEVA Revenue Intelligence' },
        chartType: 'line', status: 'approved', createdAt: now, updatedAt: now
      }
    ];
  }

  function buildBroadcast() {
    return {
      live: true,
      slides: [],          // filled by tvService.publish()
      publishedAt: null,
      publishedBy: 'Admin',
      revision: 0,
      settings: null
    };
  }

  EVA.seed = {
    departments: DEPARTMENTS,
    roles: function () {
      return U.unique(EMPLOYEES.map(function (e) { return e.role; })).sort();
    },
    employees: buildEmployees,
    performers: buildPerformers,
    wishes: buildWishes,
    announcements: buildAnnouncements,
    events: buildEvents,
    achievements: buildAchievements,
    playlist: buildPlaylist,
    settings: buildSettings,
    activity: buildActivity,
    broadcast: buildBroadcast,
    kpiRecords: buildKpiRecords,
    salesKpis: buildKpiRecords
  };
})(window.EVA = window.EVA || {});
