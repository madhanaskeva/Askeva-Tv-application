# Node Description Batch 4 of 6

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

- "pages_employees_formhtml": "formHtml()" | kind=code-symbol | source=js/pages/employees.js:L24 | neighbors=[employees.js, openForm()]
- "pages_employees_openrandompushtotv": "openRandomPushToTv()" | kind=code-symbol | source=js/pages/employees.js:L254 | neighbors=[employees.js, openPushToTv()]
- "pages_employees_th": "th()" | kind=code-symbol | source=js/pages/employees.js:L760 | neighbors=[employees.js, tableView()]
- "pages_engagement_defaultquestions": "defaultQuestions()" | kind=code-symbol | source=js/pages/engagement.js:L8 | neighbors=[engagement.js, creator()]
- "pages_engagement_input": "input()" | kind=code-symbol | source=js/pages/engagement.js:L57 | neighbors=[engagement.js, esc()]
- "pages_engagement_mountqr": "mountQR()" | kind=code-symbol | source=js/pages/engagement.js:L23 | neighbors=[engagement.js, details()]
- "pages_engagement_tvhtml": "tvHTML()" | kind=code-symbol | source=js/pages/engagement.js:L19 | neighbors=[engagement.js, details()]
- "pages_events_openform": "openForm()" | kind=code-symbol | source=js/pages/events.js:L22 | neighbors=[events.js, slideFor()]
- "pages_events_slidefor": "slideFor()" | kind=code-symbol | source=js/pages/events.js:L12 | neighbors=[events.js, openForm()]
- "pages_performers_changeemployee": "changeEmployee()" | kind=code-symbol | source=js/pages/performers.js:L127 | neighbors=[performers.js, employeeOptions()]
- "pages_performers_composer": "composer()" | kind=code-symbol | source=js/pages/performers.js:L258 | neighbors=[performers.js, employeeOptions()]
- "pages_performers_matchingemployees": "matchingEmployees()" | kind=code-symbol | source=js/pages/performers.js:L471 | neighbors=[performers.js, renderEmployeeResults()]
- "pages_performers_recognitionrecords": "recognitionRecords()" | kind=code-symbol | source=js/pages/performers.js:L304 | neighbors=[performers.js, recordTable()]
- "pages_performers_recordtable": "recordTable()" | kind=code-symbol | source=js/pages/performers.js:L314 | neighbors=[performers.js, recognitionRecords()]
- "pages_performers_renderemployeeresults": "renderEmployeeResults()" | kind=code-symbol | source=js/pages/performers.js:L478 | neighbors=[performers.js, matchingEmployees()]
- "pages_sales_kpis_getactiverecord": "getActiveRecord()" | kind=code-symbol | source=js/pages/sales-kpis.js:L53 | neighbors=[sales-kpis.js, getPreviewRecord()]
- "pages_sales_kpis_rendereditorform": "renderEditorForm()" | kind=code-symbol | source=js/pages/sales-kpis.js:L158 | neighbors=[sales-kpis.js, render()]
- "pages_sales_kpis_renderhistorysection": "renderHistorySection()" | kind=code-symbol | source=js/pages/sales-kpis.js:L386 | neighbors=[sales-kpis.js, render()]
- "pages_sales_kpis_renderstats": "renderStats()" | kind=code-symbol | source=js/pages/sales-kpis.js:L140 | neighbors=[sales-kpis.js, render()]
- "pages_sales_kpis_syncformfromrecord": "syncFormFromRecord()" | kind=code-symbol | source=js/pages/sales-kpis.js:L104 | neighbors=[sales-kpis.js, mount()]
- "services_achievements": "achievements.js" | kind=code-symbol | source=js/services/achievements.js:L1 | neighbors=[a8d167d UI Design, normalize()]
- "services_birthdays_currentyear": "currentYear()" | kind=code-symbol | source=js/services/birthdays.js:L17 | neighbors=[birthdays.js, wishFor()]
- "services_birthdays_entry": "entry()" | kind=code-symbol | source=js/services/birthdays.js:L25 | neighbors=[birthdays.js, wishFor()]
- "services_engagements_endlabel": "endLabel()" | kind=code-symbol | source=js/services/engagements.js:L47 | neighbors=[engagements.js, formatTime()]
- "services_engagements_expired": "expired()" | kind=code-symbol | source=js/services/engagements.js:L41 | neighbors=[engagements.js, endDateTime()]
- "services_engagements_formattime": "formatTime()" | kind=code-symbol | source=js/services/engagements.js:L42 | neighbors=[engagements.js, endLabel()]
- "services_engagements_validateend": "validateEnd()" | kind=code-symbol | source=js/services/engagements.js:L52 | neighbors=[engagements.js, endDateTime()]
- "services_sales_kpis_getmonthname": "getMonthName()" | kind=code-symbol | source=js/services/sales-kpis.js:L402 | neighbors=[sales-kpis.js, getISOWeekInfo()]
- "services_sales_kpis_getweeksformonth": "getWeeksForMonth()" | kind=code-symbol | source=js/services/sales-kpis.js:L410 | neighbors=[sales-kpis.js, getISOWeekInfo()]
- "services_sales_kpis_ismonthlypublished": "isMonthlyPublished()" | kind=code-symbol | source=js/services/sales-kpis.js:L206 | neighbors=[sales-kpis.js, readPublishedMonths()]
- "services_sales_kpis_readrecords": "readRecords()" | kind=code-symbol | source=js/services/sales-kpis.js:L240 | neighbors=[sales-kpis.js, writeRecords()]
- "services_sales_kpis_writepublishedmonths": "writePublishedMonths()" | kind=code-symbol | source=js/services/sales-kpis.js:L198 | neighbors=[sales-kpis.js, setMonthlyPublished()]
- "services_sales_kpis_writerecords": "writeRecords()" | kind=code-symbol | source=js/services/sales-kpis.js:L270 | neighbors=[sales-kpis.js, readRecords()]
- "vendor_qrcode_min_r": "r()" | kind=code-symbol | source=js/vendor/qrcode.min.js:L1 | neighbors=[qrcode.min.js, s()]
- "vendor_qrcode_min_s": "s()" | kind=code-symbol | source=js/vendor/qrcode.min.js:L1 | neighbors=[qrcode.min.js, r()]
- "components_publish_decksummary": "deckSummary()" | kind=code-symbol | source=js/components/publish.js:L22 | neighbors=[publish.js]
- "components_slides_avatar": "avatar()" | kind=code-symbol | source=js/components/slides.js:L13 | neighbors=[slides.js]
- "components_slides_brand": "brand()" | kind=code-symbol | source=js/components/slides.js:L20 | neighbors=[slides.js]
- "components_slides_confetti": "confetti()" | kind=code-symbol | source=js/components/slides.js:L25 | neighbors=[slides.js]
- "components_slides_current": "current()" | kind=code-symbol | source=js/components/slides.js:L553 | neighbors=[slides.js]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: E:\Madhan\AskEva T V application\.graphify\description-instructions\batch-003.json

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
