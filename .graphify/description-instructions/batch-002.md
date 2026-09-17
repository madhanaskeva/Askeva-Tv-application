# Node Description Batch 3 of 6

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the prompt below and write
your JSON answer to the answer file.

## Prompt

You are documenting nodes in a knowledge graph.
For each entry below, write ONE concise factual plain-language sentence
describing what it is or does. Use only the provided context.
For a code symbol (kind=code-symbol — a function, class, or constant),
describe what the function/symbol does based on its name, source location
and neighbors — e.g. "Resolves the configured ontology profile from graphify.yaml.".
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "services_engagements_enddatetime": "endDateTime()" | kind=code-symbol | source=js/services/engagements.js:L33 | neighbors=[engagements.js, expired(), validateEnd()]
- "services_events": "events.js" | kind=code-symbol | source=js/services/events.js:L1 | neighbors=[a8d167d UI Design, inWindow(), normalize()]
- "services_sales_kpis_getweekmonthkey": "getWeekMonthKey()" | kind=code-symbol | source=js/services/sales-kpis.js:L142 | neighbors=[sales-kpis.js, getISOWeekInfo(), normalizeRecord()]
- "services_sales_kpis_normalizerecord": "normalizeRecord()" | kind=code-symbol | source=js/services/sales-kpis.js:L285 | neighbors=[sales-kpis.js, getISOWeekInfo(), getWeekMonthKey()]
- "services_sales_kpis_readpublishedmonths": "readPublishedMonths()" | kind=code-symbol | source=js/services/sales-kpis.js:L185 | neighbors=[sales-kpis.js, isMonthlyPublished(), setMonthlyPublished()]
- "services_sales_kpis_setmonthlypublished": "setMonthlyPublished()" | kind=code-symbol | source=js/services/sales-kpis.js:L216 | neighbors=[sales-kpis.js, readPublishedMonths(), writePublishedMonths()]
- "app_capturefocus": "captureFocus()" | kind=code-symbol | source=js/app.js:L310 | neighbors=[app.js, renderPage()]
- "app_isnavactive": "isNavActive()" | kind=code-symbol | source=js/app.js:L61 | neighbors=[app.js, groupHasActive()]
- "app_navcounts": "navCounts()" | kind=code-symbol | source=js/app.js:L107 | neighbors=[app.js, renderSidebar()]
- "app_parsehash": "parseHash()" | kind=code-symbol | source=js/app.js:L83 | neighbors=[app.js, onHashChange()]
- "app_restorefocus": "restoreFocus()" | kind=code-symbol | source=js/app.js:L320 | neighbors=[app.js, renderPage()]
- "app_showpending": "showPending()" | kind=code-symbol | source=js/app.js:L501 | neighbors=[app.js, appAction()]
- "components_ui_close": "close()" | kind=code-symbol | source=js/components/ui.js:L234 | neighbors=[ui.js, mountOverlay()]
- "components_ui_mountoverlay": "mountOverlay()" | kind=code-symbol | source=js/components/ui.js:L261 | neighbors=[ui.js, close()]
- "core_store_readraw": "readRaw()" | kind=code-symbol | source=js/core/store.js:L27 | neighbors=[store.js, key()]
- "core_store_writeraw": "writeRaw()" | kind=code-symbol | source=js/core/store.js:L39 | neighbors=[store.js, key()]
- "data_seed_buildachievements": "buildAchievements()" | kind=code-symbol | source=js/data/seed.js:L193 | neighbors=[seed.js, hoursAgo()]
- "data_seed_buildactivity": "buildActivity()" | kind=code-symbol | source=js/data/seed.js:L266 | neighbors=[seed.js, hoursAgo()]
- "data_seed_buildemployees": "buildEmployees()" | kind=code-symbol | source=js/data/seed.js:L69 | neighbors=[seed.js, demoAvatar()]
- "data_seed_buildperformers": "buildPerformers()" | kind=code-symbol | source=js/data/seed.js:L83 | neighbors=[seed.js, hoursAgo()]
- "data_seed_buildwishes": "buildWishes()" | kind=code-symbol | source=js/data/seed.js:L119 | neighbors=[seed.js, hoursAgo()]
- "data_seed_daysagoiso": "daysAgoISO()" | kind=code-symbol | source=js/data/seed.js:L19 | neighbors=[seed.js, buildAnnouncements()]
- "data_seed_demoavatar": "demoAvatar()" | kind=code-symbol | source=js/data/seed.js:L53 | neighbors=[seed.js, buildEmployees()]
- "pages_announcements_openform": "openForm()" | kind=code-symbol | source=js/pages/announcements.js:L22 | neighbors=[announcements.js, slideFor()]
- "pages_announcements_slidefor": "slideFor()" | kind=code-symbol | source=js/pages/announcements.js:L12 | neighbors=[announcements.js, openForm()]
- "pages_birthdays_bucketrows": "bucketRows()" | kind=code-symbol | source=js/pages/birthdays.js:L350 | neighbors=[birthdays.js, previewEmployees()]
- "pages_birthdays_openeditor": "openEditor()" | kind=code-symbol | source=js/pages/birthdays.js:L25 | neighbors=[birthdays.js, slideFor()]
- "pages_birthdays_previewemployees": "previewEmployees()" | kind=code-symbol | source=js/pages/birthdays.js:L357 | neighbors=[birthdays.js, bucketRows()]
- "pages_birthdays_transitionpreview": "transitionPreview()" | kind=code-symbol | source=js/pages/birthdays.js:L365 | neighbors=[birthdays.js, slideFor()]
- "pages_dashboard_activitypanel": "activityPanel()" | kind=code-symbol | source=js/pages/dashboard.js:L333 | neighbors=[dashboard.js, panel()]
- "pages_dashboard_greeting": "greeting()" | kind=code-symbol | source=js/pages/dashboard.js:L506 | neighbors=[dashboard.js, hero()]
- "pages_dashboard_hero": "hero()" | kind=code-symbol | source=js/pages/dashboard.js:L52 | neighbors=[dashboard.js, greeting()]
- "pages_dashboard_meter": "meter()" | kind=code-symbol | source=js/pages/dashboard.js:L28 | neighbors=[dashboard.js, statsRow()]
- "pages_dashboard_pct": "pct()" | kind=code-symbol | source=js/pages/dashboard.js:L24 | neighbors=[dashboard.js, statsRow()]
- "pages_dashboard_performerspanel": "performersPanel()" | kind=code-symbol | source=js/pages/dashboard.js:L298 | neighbors=[dashboard.js, panel()]
- "pages_dashboard_readyitems": "readyItems()" | kind=code-symbol | source=js/pages/dashboard.js:L200 | neighbors=[dashboard.js, readyPanel()]
- "pages_dashboard_todaypanel": "todayPanel()" | kind=code-symbol | source=js/pages/dashboard.js:L262 | neighbors=[dashboard.js, panel()]
- "pages_dashboard_upcomingitems": "upcomingItems()" | kind=code-symbol | source=js/pages/dashboard.js:L357 | neighbors=[dashboard.js, upcomingPanel()]
- "pages_employees_cardsview": "cardsView()" | kind=code-symbol | source=js/pages/employees.js:L856 | neighbors=[employees.js, emptyState()]
- "pages_employees_confirmdelete": "confirmDelete()" | kind=code-symbol | source=js/pages/employees.js:L557 | neighbors=[employees.js, openProfile()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: E:\Madhan\AskEva T V application\.graphify\description-instructions\batch-002.json

Keep each description factual and concise (one sentence). No markdown, no prose
outside the JSON object. It is acceptable to omit a node if context is
insufficient — but include every node you can ground confidently.

Example answer format:
```json
{
  "node_id_1": "Resolves the configured ontology profile from graphify.yaml.",
  "node_id_2": "Colonel James Barclay, an antagonist in The Crooked Man."
}
```
