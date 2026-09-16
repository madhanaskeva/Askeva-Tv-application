# Node Description Batch 1 of 6

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
LANGUAGE: each entry has a `lang=` marker giving the language of its source.
Write that entry's description in EXACTLY that language. Do not translate to
a single common language — match each node's source language individually.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "commit:repo:github.com/madhanaskeva/Askeva-Tv-application@a8d167de7227b545ea6a0395bd11d0c873c625de": "a8d167d UI Design" | kind=Commit | source=git | neighbors=[main, e10dcd5 update page, publish.js, slides.js, ui.js, store.js] | lang=pt
- "pages_employees": "employees.js" | kind=code-symbol | source=js/pages/employees.js:L1 | neighbors=[3683c82 Merge branch 'Kabilan' of https…, 65d5871 update contentmedia, a8d167d UI Design, af7d679 check display, b8741f2 update ui, cd387c4 Update Engagement and Sales Kpi] | lang=en
- "commit:repo:github.com/madhanaskeva/Askeva-Tv-application@f016885891235d78554999ccc1a5e695a8b2d765": "f016885 Merge branch 'Kiruthick' of https://github.com/madhanaskeva/Askeva-Tv-a…" | kind=Commit | source=git | neighbors=[377cffd latest update, 472b4df latest update, main, 95ce69b Update, publish.js, slides.js] | lang=en
- "data_seed": "seed.js" | kind=code-symbol | source=js/data/seed.js:L1 | neighbors=[3683c82 Merge branch 'Kabilan' of https…, 65d5871 update contentmedia, a8d167d UI Design, cd387c4 Update Engagement and Sales Kpi, f016885 Merge branch 'Kiruthick' of htt…, birthdayIn()] | lang=en
- "commit:repo:github.com/madhanaskeva/Askeva-Tv-application@3683c8250bc392620ae8fb47c494938ab3b3746b": "3683c82 Merge branch 'Kabilan' of https://github.com/madhanaskeva/Askeva-Tv-app…" | kind=Commit | source=git | neighbors=[main, af7d679 check display, publish.js, slides.js, seed.js, birthdays.js] | lang=en
- "commit:repo:github.com/madhanaskeva/Askeva-Tv-application@cd387c49e68a0e2298defcfc11c221fa9c0ac696": "cd387c4 Update Engagement and Sales Kpi" | kind=Commit | source=git | neighbors=[b8741f2 update ui, main, 472b4df latest update, publish.js, slides.js, seed.js] | lang=en
- "pages_dashboard": "dashboard.js" | kind=code-symbol | source=js/pages/dashboard.js:L1 | neighbors=[a8d167d UI Design, b39ad28 Merge branch 'Kabilan' of https…, e10dcd5 update page, fc87452 Alignment, activityPanel(), greeting()] | lang=en
- "pages_performers": "performers.js" | kind=code-symbol | source=js/pages/performers.js:L1 | neighbors=[3683c82 Merge branch 'Kabilan' of https…, a8d167d UI Design, cd387c4 Update Engagement and Sales Kpi, e10dcd5 update page, f016885 Merge branch 'Kiruthick' of htt…, changeEmployee()] | lang=en
- "services_sales_kpis": "sales-kpis.js" | kind=code-symbol | source=js/services/sales-kpis.js:L1 | neighbors=[3683c82 Merge branch 'Kabilan' of https…, cd387c4 Update Engagement and Sales Kpi, f016885 Merge branch 'Kiruthick' of htt…, calculateMetricGrowth(), calculateMonthDaysOverlap(), formatGrowthDisplay()] | lang=en
- "pages_engagement": "engagement.js" | kind=code-symbol | source=js/pages/engagement.js:L1 | neighbors=[3683c82 Merge branch 'Kabilan' of https…, cd387c4 Update Engagement and Sales Kpi, f016885 Merge branch 'Kiruthick' of htt…, badge(), copy(), creator()] | lang=en
- "app": "app.js" | kind=code-symbol | source=js/app.js:L1 | neighbors=[appAction(), bindShell(), captureFocus(), groupHasActive(), isNavActive(), navCounts()] | lang=en
- "branch:repo:github.com/madhanaskeva/Askeva-Tv-application#main": "main" | kind=Branch | source=git | neighbors=[3683c82 Merge branch 'Kabilan' of https…, 377cffd latest update, 472b4df latest update, 65d5871 update contentmedia, 95ce69b Update, a6b84e6 update content page] | lang=en
- "components_slides": "slides.js" | kind=code-symbol | source=js/components/slides.js:L1 | neighbors=[3683c82 Merge branch 'Kabilan' of https…, 65d5871 update contentmedia, a8d167d UI Design, cd387c4 Update Engagement and Sales Kpi, f016885 Merge branch 'Kiruthick' of htt…, avatar()] | lang=en
- "pages_birthdays": "birthdays.js" | kind=code-symbol | source=js/pages/birthdays.js:L1 | neighbors=[3683c82 Merge branch 'Kabilan' of https…, 65d5871 update contentmedia, a8d167d UI Design, b8741f2 update ui, cd387c4 Update Engagement and Sales Kpi, e10dcd5 update page] | lang=en
- "vendor_qrcode_min": "qrcode.min.js" | kind=code-symbol | source=js/vendor/qrcode.min.js:L1 | neighbors=[3683c82 Merge branch 'Kabilan' of https…, cd387c4 Update Engagement and Sales Kpi, f016885 Merge branch 'Kiruthick' of htt…, a(), b(), d()] | lang=en
- "pages_sales_kpis": "sales-kpis.js" | kind=code-symbol | source=js/pages/sales-kpis.js:L1 | neighbors=[3683c82 Merge branch 'Kabilan' of https…, 472b4df latest update, cd387c4 Update Engagement and Sales Kpi, f016885 Merge branch 'Kiruthick' of htt…, getActiveRecord(), getPreviewRecord()] | lang=en
- "commit:repo:github.com/madhanaskeva/Askeva-Tv-application@65d587136bfcc8cee557518f5404435814aae580": "65d5871 update contentmedia" | kind=Commit | source=git | neighbors=[main, 377cffd latest update, a6b84e6 update content page, slides.js, ui.js, seed.js] | lang=en
- "services_engagements": "engagements.js" | kind=code-symbol | source=js/services/engagements.js:L1 | neighbors=[3683c82 Merge branch 'Kabilan' of https…, cd387c4 Update Engagement and Sales Kpi, f016885 Merge branch 'Kiruthick' of htt…, cleanQuestion(), endDateTime(), endLabel()] | lang=en
- "commit:repo:github.com/madhanaskeva/Askeva-Tv-application@e10dcd5280d4fb7e399baff28762e1d261dbe2bd": "e10dcd5 update page" | kind=Commit | source=git | neighbors=[a8d167d UI Design, main, 65d5871 update contentmedia, achievements.js, birthdays.js, dashboard.js] | lang=en
- "pages_engagement_details": "details()" | kind=code-symbol | source=js/pages/engagement.js:L30 | neighbors=[engagement.js, badge(), copy(), esc(), mountQR(), pushToTV()] | lang=en
- "services_birthdays": "birthdays.js" | kind=code-symbol | source=js/services/birthdays.js:L1 | neighbors=[3683c82 Merge branch 'Kabilan' of https…, 65d5871 update contentmedia, a8d167d UI Design, cd387c4 Update Engagement and Sales Kpi, f016885 Merge branch 'Kiruthick' of htt…, currentYear()] | lang=en
- "app_renderpage": "renderPage()" | kind=code-symbol | source=js/app.js:L338 | neighbors=[app.js, onHashChange(), bindShell(), captureFocus(), renderHeader(), renderSidebar()] | lang=en
- "commit:repo:github.com/madhanaskeva/Askeva-Tv-application@b8741f25f7379e0e211a93897199d3f707b0e9b3": "b8741f2 update ui" | kind=Commit | source=git | neighbors=[a6b84e6 update content page, main, c24b012 Merge branch 'Kabilan' of https…, cd387c4 Update Engagement and Sales Kpi, birthdays.js, employees.js] | lang=en
- "core_store": "store.js" | kind=code-symbol | source=js/core/store.js:L1 | neighbors=[a6b84e6 update content page, a8d167d UI Design, f016885 Merge branch 'Kiruthick' of htt…, emit(), key(), readRaw()] | lang=en
- "data_seed_hoursago": "hoursAgo()" | kind=code-symbol | source=js/data/seed.js:L24 | neighbors=[seed.js, buildAchievements(), buildActivity(), buildAnnouncements(), buildEvents(), buildPerformers()] | lang=en
- "pages_engagement_esc": "esc()" | kind=code-symbol | source=js/pages/engagement.js:L6 | neighbors=[engagement.js, details(), input(), pushToTV(), renderCard(), resultHTML()] | lang=en
- "services_employees": "employees.js" | kind=code-symbol | source=js/services/employees.js:L1 | neighbors=[3683c82 Merge branch 'Kabilan' of https…, 65d5871 update contentmedia, a8d167d UI Design, b8741f2 update ui, cd387c4 Update Engagement and Sales Kpi, f016885 Merge branch 'Kiruthick' of htt…] | lang=en
- "components_ui": "ui.js" | kind=code-symbol | source=js/components/ui.js:L1 | neighbors=[65d5871 update contentmedia, a8d167d UI Design, close(), mountOverlay(), toastHost(), trapFocus()] | lang=en
- "pages_achievements": "achievements.js" | kind=code-symbol | source=js/pages/achievements.js:L1 | neighbors=[a8d167d UI Design, e10dcd5 update page, employeeOptions(), listRow(), openForm(), previewOne()] | lang=en
- "pages_dashboard_panel": "panel()" | kind=code-symbol | source=js/pages/dashboard.js:L34 | neighbors=[dashboard.js, activityPanel(), performersPanel(), readyPanel(), todayPanel(), upcomingPanel()] | lang=en
- "pages_events": "events.js" | kind=code-symbol | source=js/pages/events.js:L1 | neighbors=[a8d167d UI Design, e10dcd5 update page, card(), openForm(), sel(), slideFor()] | lang=en
- "services_tv": "tv.js" | kind=code-symbol | source=js/services/tv.js:L1 | neighbors=[3683c82 Merge branch 'Kabilan' of https…, 65d5871 update contentmedia, a8d167d UI Design, cd387c4 Update Engagement and Sales Kpi, f016885 Merge branch 'Kiruthick' of htt…, person()] | lang=en
- "app_bindshell": "bindShell()" | kind=code-symbol | source=js/app.js:L388 | neighbors=[app.js, appAction(), saveNavGroups(), renderPage(), renderShell()] | lang=en
- "app_onhashchange": "onHashChange()" | kind=code-symbol | source=js/app.js:L554 | neighbors=[app.js, groupHasActive(), parseHash(), renderPage(), saveNavGroups()] | lang=en
- "app_rendersidebar": "renderSidebar()" | kind=code-symbol | source=js/app.js:L118 | neighbors=[app.js, renderPage(), renderShell(), groupHasActive(), navCounts()] | lang=en
- "commit:repo:github.com/madhanaskeva/Askeva-Tv-application@95ce69bc8af4a9c1eacfc877a6c4ea8beb6cb835": "95ce69b Update" | kind=Commit | source=git | neighbors=[main, 3683c82 Merge branch 'Kabilan' of https…, fc87452 Alignment, settings.js, f016885 Merge branch 'Kiruthick' of htt…] | lang=fr
- "components_publish": "publish.js" | kind=code-symbol | source=js/components/publish.js:L1 | neighbors=[3683c82 Merge branch 'Kabilan' of https…, a8d167d UI Design, cd387c4 Update Engagement and Sales Kpi, f016885 Merge branch 'Kiruthick' of htt…, deckSummary()] | lang=en
- "pages_announcements": "announcements.js" | kind=code-symbol | source=js/pages/announcements.js:L1 | neighbors=[a8d167d UI Design, card(), openForm(), sel(), slideFor()] | lang=en
- "pages_sales_kpis_render": "render()" | kind=code-symbol | source=js/pages/sales-kpis.js:L651 | neighbors=[sales-kpis.js, renderEditorForm(), renderHistorySection(), renderPreviewSection(), renderStats()] | lang=en
- "services_performers": "performers.js" | kind=code-symbol | source=js/services/performers.js:L1 | neighbors=[3683c82 Merge branch 'Kabilan' of https…, a8d167d UI Design, cd387c4 Update Engagement and Sales Kpi, f016885 Merge branch 'Kiruthick' of htt…, normalize()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: E:\Madhan\AskEva T V application\.graphify\description-instructions\batch-000.json

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
