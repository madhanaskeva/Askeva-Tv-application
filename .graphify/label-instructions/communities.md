# Community Labeling

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the community listing below
and write 2-5 word plain-language names for each.

## Language

LANGUAGE: each community line ends with a `[lang=…]` marker giving the
language of its source nodes. Write that community's name in EXACTLY that
language. Do not normalize every name to one common language.

## Communities

Community 0: main, 3683c82 Merge branch 'Kabilan' of https://github.com/madhana, 377cffd latest update, 472b4df latest update, 65d5871 update contentmedia, 95ce69b Update, a6b84e6 update content page, a8d167d UI Design, af7d679 check display, b39ad28 Merge branch 'Kabilan' of https://github.com/madhana, b8741f2 update ui, c24b012 Merge branch 'Kabilan' of https://github.com/madhana [lang=pt]
Community 1: hoursAgo(, seed.js, birthdayIn(, buildAchievements(, buildActivity(, buildAnnouncements(, buildBroadcast(, buildEmployees(, buildEvents(, buildKpiRecords(, buildPerformers(, buildPlaylist( [lang=en]
Community 2: getISOWeekInfo(, sales-kpis.js, calculateMetricGrowth(, calculateMonthDaysOverlap(, formatGrowthDisplay(, getMonthName(, getWeekMonthKey(, getWeeksForMonth(, isMonthlyPublished(, normalizeRecord(, readPublishedMonths(, readRecords( [lang=en]
Community 3: bindShell(, onHashChange(, renderPage(, renderSidebar(, app.js, appAction(, captureFocus(, groupHasActive(, isNavActive(, navCounts(, parseHash(, renderHeader( [lang=en]
Community 4: panel(, dashboard.js, activityPanel(, greeting(, hero(, meter(, nowPlaying(, openCurrentEditor(, pct(, performersPanel(, readyItems(, readyPanel( [lang=en]
Community 5: employees.js, cardsView(, confirmDelete(, emptyState(, exportCsv(, formHtml(, openForm(, openProfile(, openPushToTv(, openRandomPushToTv(, openRoleModal(, roleCardsHtml( [lang=en]
Community 6: details(, esc(, engagement.js, badge(, copy(, creator(, defaultQuestions(, input(, mountQR(, pushToTV(, renderCard(, resultHTML( [lang=en]
Community 7: performers.js, changeEmployee(, composer(, employeeOptions(, headlineCard(, listRow(, matchingEmployees(, openForm(, previewOne(, previewSlides(, recognitionRecords(, recordTable( [lang=en]
Community 8: qrcode.min.js, a(, b(, d(, g(, i(, j(, k(, m(, n(, r(, s( [lang=pt]
Community 9: slides.js, avatar(, brand(, confetti(, current(, index(, length(, paint(, running(, schedule( [lang=en]
Community 10: render(, sales-kpis.js, getActiveRecord(, getPreviewRecord(, mount(, renderEditorForm(, renderHistorySection(, renderPreviewSection(, renderStats(, syncFormFromRecord( [lang=en]
Community 11: engagements.js, cleanQuestion(, endDateTime(, endLabel(, expired(, formatTime(, id(, normalize(, urlFor(, validateEnd( [lang=en]
Community 12: birthdays.js, bucketRows(, card(, openEditor(, openTemplateEditor(, previewEmployees(, slideFor(, transitionPreview( [lang=en]
Community 13: ui.js, close(, mountOverlay(, toastHost(, trapFocus( [lang=en]
Community 14: store.js, emit(, key(, readRaw(, writeRaw( [lang=en]
Community 15: achievements.js, employeeOptions(, listRow(, openForm(, previewOne( [lang=en]
Community 16: announcements.js, card(, openForm(, sel(, slideFor( [lang=en]
Community 17: events.js, card(, openForm(, sel(, slideFor( [lang=en]
Community 18: announcements.js, inWindow(, normalize( [lang=en]
Community 19: events.js, inWindow(, normalize( [lang=en]
Community 20: icons.js [lang=en]

## Instructions

Write a single JSON object mapping each community id (as a string) to its
2-5 word name to: E:\Madhan\AskEva T V application\.graphify\label-instructions\communities.json

Example:
```json
{
  "0": "Authentication Flow",
  "1": "Authentication Flow",
  "2": "Authentication Flow"
}
```

Then re-run `graphify update` (or `graphify label`) to ingest the names.
