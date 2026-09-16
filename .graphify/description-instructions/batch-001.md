# Node Description Batch 2 of 6

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
For an entity node (any other kind — e.g. a person, place, event, object),
describe what the entity is and its role, grounded in its type, its
relations (neighbors) and the provided citations/evidence — e.g.
"Lady Carfax, a wealthy heiress who disappears en route to Lausanne.".
Ground entity descriptions in the citations/evidence when present; do not
speculate beyond the context, so a node with no supporting context may be
left out of the reply.
Write every description in Portuguese (pt). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "services_sales_kpis_getisoweekinfo": "getISOWeekInfo()" | kind=code-symbol | source=js/services/sales-kpis.js:L47 | neighbors=[sales-kpis.js, getMonthName(), getWeekMonthKey(), getWeeksForMonth(), normalizeRecord()]
- "services_settings": "settings.js" | kind=code-symbol | source=js/services/settings.js:L1 | neighbors=[3683c82 Merge branch 'Kabilan' of https…, 95ce69b Update, a8d167d UI Design, cd387c4 Update Engagement and Sales Kpi, f016885 Merge branch 'Kiruthick' of htt…]
- "app_grouphasactive": "groupHasActive()" | kind=code-symbol | source=js/app.js:L69 | neighbors=[app.js, isNavActive(), onHashChange(), renderSidebar()]
- "app_rendershell": "renderShell()" | kind=code-symbol | source=js/app.js:L297 | neighbors=[app.js, bindShell(), renderHeader(), renderSidebar()]
- "commit:repo:github.com/madhanaskeva/Askeva-Tv-application@377cffdf27059888f92643ddad261b3656b34029": "377cffd latest update" | kind=Commit | source=git | neighbors=[main, c24b012 Merge branch 'Kabilan' of https…, f016885 Merge branch 'Kiruthick' of htt…, 65d5871 update contentmedia]
- "commit:repo:github.com/madhanaskeva/Askeva-Tv-application@472b4dfc67debf486ac5a0e3f8a6cae1ffe7f1f9": "472b4df latest update" | kind=Commit | source=git | neighbors=[main, f016885 Merge branch 'Kiruthick' of htt…, sales-kpis.js, cd387c4 Update Engagement and Sales Kpi]
- "commit:repo:github.com/madhanaskeva/Askeva-Tv-application@a6b84e6fe9efcc6f5a6ec830c3266832e23bb6fb": "a6b84e6 update content page" | kind=Commit | source=git | neighbors=[65d5871 update contentmedia, main, b8741f2 update ui, store.js]
- "commit:repo:github.com/madhanaskeva/Askeva-Tv-application@af7d679684b1160a2674295e56ea51e63adb35f2": "af7d679 check display" | kind=Commit | source=git | neighbors=[3683c82 Merge branch 'Kabilan' of https…, main, b39ad28 Merge branch 'Kabilan' of https…, employees.js]
- "commit:repo:github.com/madhanaskeva/Askeva-Tv-application@b39ad2880162699740d2b1684be9c52a8fafcd23": "b39ad28 Merge branch 'Kabilan' of https://github.com/madhanaskeva/Askeva-Tv-app…" | kind=Commit | source=git | neighbors=[af7d679 check display, main, dashboard.js, fc87452 Alignment]
- "commit:repo:github.com/madhanaskeva/Askeva-Tv-application@c24b01257deddb874f98c6a0edbd88a25f2f3b0d": "c24b012 Merge branch 'Kabilan' of https://github.com/madhanaskeva/Askeva-Tv-app…" | kind=Commit | source=git | neighbors=[377cffd latest update, b8741f2 update ui, main, 3683c82 Merge branch 'Kabilan' of https…]
- "commit:repo:github.com/madhanaskeva/Askeva-Tv-application@fc874527b9d2899d89a15fa147d92b1b80310d2c": "fc87452 Alignment" | kind=Commit | source=git | neighbors=[95ce69b Update, main, b39ad28 Merge branch 'Kabilan' of https…, dashboard.js]
- "data_seed_buildannouncements": "buildAnnouncements()" | kind=code-symbol | source=js/data/seed.js:L143 | neighbors=[seed.js, daysAgoISO(), hoursAgo(), inDays()]
- "pages_employees_openprofile": "openProfile()" | kind=code-symbol | source=js/pages/employees.js:L427 | neighbors=[employees.js, confirmDelete(), openForm(), openPushToTv()]
- "pages_engagement_success": "success()" | kind=code-symbol | source=js/pages/engagement.js:L58 | neighbors=[engagement.js, copy(), creator(), esc()]
- "pages_sales_kpis_getpreviewrecord": "getPreviewRecord()" | kind=code-symbol | source=js/pages/sales-kpis.js:L69 | neighbors=[sales-kpis.js, getActiveRecord(), mount(), renderPreviewSection()]
- "app_appaction": "appAction()" | kind=code-symbol | source=js/app.js:L463 | neighbors=[app.js, showPending(), bindShell()]
- "app_renderheader": "renderHeader()" | kind=code-symbol | source=js/app.js:L224 | neighbors=[app.js, renderPage(), renderShell()]
- "app_savenavgroups": "saveNavGroups()" | kind=code-symbol | source=js/app.js:L44 | neighbors=[app.js, bindShell(), onHashChange()]
- "core_store_key": "key()" | kind=code-symbol | source=js/core/store.js:L25 | neighbors=[store.js, readRaw(), writeRaw()]
- "data_seed_buildevents": "buildEvents()" | kind=code-symbol | source=js/data/seed.js:L167 | neighbors=[seed.js, hoursAgo(), inDays()]
- "data_seed_indays": "inDays()" | kind=code-symbol | source=js/data/seed.js:L27 | neighbors=[seed.js, buildAnnouncements(), buildEvents()]
- "pages_birthdays_slidefor": "slideFor()" | kind=code-symbol | source=js/pages/birthdays.js:L12 | neighbors=[birthdays.js, openEditor(), transitionPreview()]
- "pages_dashboard_readypanel": "readyPanel()" | kind=code-symbol | source=js/pages/dashboard.js:L233 | neighbors=[dashboard.js, panel(), readyItems()]
- "pages_dashboard_statsrow": "statsRow()" | kind=code-symbol | source=js/pages/dashboard.js:L92 | neighbors=[dashboard.js, meter(), pct()]
- "pages_dashboard_upcomingpanel": "upcomingPanel()" | kind=code-symbol | source=js/pages/dashboard.js:L383 | neighbors=[dashboard.js, panel(), upcomingItems()]
- "pages_employees_emptystate": "emptyState()" | kind=code-symbol | source=js/pages/employees.js:L922 | neighbors=[employees.js, cardsView(), tableView()]
- "pages_employees_openform": "openForm()" | kind=code-symbol | source=js/pages/employees.js:L143 | neighbors=[employees.js, formHtml(), openProfile()]
- "pages_employees_openpushtotv": "openPushToTv()" | kind=code-symbol | source=js/pages/employees.js:L269 | neighbors=[employees.js, openProfile(), openRandomPushToTv()]
- "pages_employees_tableview": "tableView()" | kind=code-symbol | source=js/pages/employees.js:L778 | neighbors=[employees.js, emptyState(), th()]
- "pages_engagement_badge": "badge()" | kind=code-symbol | source=js/pages/engagement.js:L7 | neighbors=[engagement.js, details(), renderCard()]
- "pages_engagement_copy": "copy()" | kind=code-symbol | source=js/pages/engagement.js:L24 | neighbors=[engagement.js, success(), details()]
- "pages_engagement_creator": "creator()" | kind=code-symbol | source=js/pages/engagement.js:L35 | neighbors=[engagement.js, defaultQuestions(), success()]
- "pages_engagement_pushtotv": "pushToTV()" | kind=code-symbol | source=js/pages/engagement.js:L25 | neighbors=[engagement.js, details(), esc()]
- "pages_engagement_rendercard": "renderCard()" | kind=code-symbol | source=js/pages/engagement.js:L17 | neighbors=[engagement.js, badge(), esc()]
- "pages_engagement_resulthtml": "resultHTML()" | kind=code-symbol | source=js/pages/engagement.js:L18 | neighbors=[engagement.js, details(), esc()]
- "pages_performers_employeeoptions": "employeeOptions()" | kind=code-symbol | source=js/pages/performers.js:L12 | neighbors=[performers.js, changeEmployee(), composer()]
- "pages_sales_kpis_mount": "mount()" | kind=code-symbol | source=js/pages/sales-kpis.js:L678 | neighbors=[sales-kpis.js, getPreviewRecord(), syncFormFromRecord()]
- "pages_sales_kpis_renderpreviewsection": "renderPreviewSection()" | kind=code-symbol | source=js/pages/sales-kpis.js:L347 | neighbors=[sales-kpis.js, render(), getPreviewRecord()]
- "services_announcements": "announcements.js" | kind=code-symbol | source=js/services/announcements.js:L1 | neighbors=[a8d167d UI Design, inWindow(), normalize()]
- "services_birthdays_wishfor": "wishFor()" | kind=code-symbol | source=js/services/birthdays.js:L19 | neighbors=[birthdays.js, entry(), currentYear()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: E:\Madhan\AskEva T V application\.graphify\description-instructions\batch-001.json

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
