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
    'Operations', 'People & Culture', 'Design', 'Finance'
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

  function buildEmployees() {
    var now = new Date().toISOString();
    return EMPLOYEES.map(function (e, i) {
      return Object.assign({
        id: 'emp_' + U.pad2(i + 1),
        photo: '',
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
      { id: 'slot_idle',  type: 'idle',        name: 'AskEVA Standby Card',  enabled: false, duration: 8,  order: 6 }
    ];
  }

  function buildSettings() {
    return {
      companyName: 'AskEVA',
      logo: '',
      tagline: 'Office TV',
      defaultBirthdayMessage: 'Wishing you an amazing year ahead — from all of us at AskEVA!',
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
    broadcast: buildBroadcast
  };
})(window.EVA = window.EVA || {});
