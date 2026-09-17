# Node Description Batch 5 of 6

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

- "components_slides_index": "index()" | kind=code-symbol | source=js/components/slides.js:L551 | neighbors=[slides.js]
- "components_slides_length": "length()" | kind=code-symbol | source=js/components/slides.js:L552 | neighbors=[slides.js]
- "components_slides_paint": "paint()" | kind=code-symbol | source=js/components/slides.js:L525 | neighbors=[slides.js]
- "components_slides_running": "running()" | kind=code-symbol | source=js/components/slides.js:L554 | neighbors=[slides.js]
- "components_slides_schedule": "schedule()" | kind=code-symbol | source=js/components/slides.js:L542 | neighbors=[slides.js]
- "components_ui_toasthost": "toastHost()" | kind=code-symbol | source=js/components/ui.js:L204 | neighbors=[ui.js]
- "components_ui_trapfocus": "trapFocus()" | kind=code-symbol | source=js/components/ui.js:L251 | neighbors=[ui.js]
- "core_store_emit": "emit()" | kind=code-symbol | source=js/core/store.js:L54 | neighbors=[store.js]
- "core_utils": "utils.js" | kind=code-symbol | source=js/core/utils.js:L1 | neighbors=[a8d167d UI Design]
- "data_seed_birthdayin": "birthdayIn()" | kind=code-symbol | source=js/data/seed.js:L13 | neighbors=[seed.js]
- "data_seed_buildbroadcast": "buildBroadcast()" | kind=code-symbol | source=js/data/seed.js:L735 | neighbors=[seed.js]
- "data_seed_buildkpirecords": "buildKpiRecords()" | kind=code-symbol | source=js/data/seed.js:L277 | neighbors=[seed.js]
- "data_seed_buildplaylist": "buildPlaylist()" | kind=code-symbol | source=js/data/seed.js:L213 | neighbors=[seed.js]
- "data_seed_buildsettings": "buildSettings()" | kind=code-symbol | source=js/data/seed.js:L226 | neighbors=[seed.js]
- "pages_achievements_employeeoptions": "employeeOptions()" | kind=code-symbol | source=js/pages/achievements.js:L12 | neighbors=[achievements.js]
- "pages_achievements_listrow": "listRow()" | kind=code-symbol | source=js/pages/achievements.js:L141 | neighbors=[achievements.js]
- "pages_achievements_openform": "openForm()" | kind=code-symbol | source=js/pages/achievements.js:L20 | neighbors=[achievements.js]
- "pages_achievements_previewone": "previewOne()" | kind=code-symbol | source=js/pages/achievements.js:L119 | neighbors=[achievements.js]
- "pages_announcements_card": "card()" | kind=code-symbol | source=js/pages/announcements.js:L146 | neighbors=[announcements.js]
- "pages_announcements_sel": "sel()" | kind=code-symbol | source=js/pages/announcements.js:L194 | neighbors=[announcements.js]
- "pages_birthdays_card": "card()" | kind=code-symbol | source=js/pages/birthdays.js:L303 | neighbors=[birthdays.js]
- "pages_birthdays_opentemplateeditor": "openTemplateEditor()" | kind=code-symbol | source=js/pages/birthdays.js:L198 | neighbors=[birthdays.js]
- "pages_dashboard_nowplaying": "nowPlaying()" | kind=code-symbol | source=js/pages/dashboard.js:L137 | neighbors=[dashboard.js]
- "pages_dashboard_opencurrenteditor": "openCurrentEditor()" | kind=code-symbol | source=js/pages/dashboard.js:L484 | neighbors=[dashboard.js]
- "pages_employees_exportcsv": "exportCsv()" | kind=code-symbol | source=js/pages/employees.js:L1097 | neighbors=[employees.js]
- "pages_employees_openrolemodal": "openRoleModal()" | kind=code-symbol | source=js/pages/employees.js:L577 | neighbors=[employees.js]
- "pages_employees_rolecardshtml": "roleCardsHtml()" | kind=code-symbol | source=js/pages/employees.js:L634 | neighbors=[employees.js]
- "pages_employees_toolbar": "toolbar()" | kind=code-symbol | source=js/pages/employees.js:L674 | neighbors=[employees.js]
- "pages_engagement_stat": "stat()" | kind=code-symbol | source=js/pages/engagement.js:L16 | neighbors=[engagement.js]
- "pages_events_card": "card()" | kind=code-symbol | source=js/pages/events.js:L150 | neighbors=[events.js]
- "pages_events_sel": "sel()" | kind=code-symbol | source=js/pages/events.js:L204 | neighbors=[events.js]
- "pages_performers_headlinecard": "headlineCard()" | kind=code-symbol | source=js/pages/performers.js:L179 | neighbors=[performers.js]
- "pages_performers_listrow": "listRow()" | kind=code-symbol | source=js/pages/performers.js:L234 | neighbors=[performers.js]
- "pages_performers_openform": "openForm()" | kind=code-symbol | source=js/pages/performers.js:L20 | neighbors=[performers.js]
- "pages_performers_previewone": "previewOne()" | kind=code-symbol | source=js/pages/performers.js:L155 | neighbors=[performers.js]
- "pages_performers_previewslides": "previewSlides()" | kind=code-symbol | source=js/pages/performers.js:L288 | neighbors=[performers.js]
- "pages_performers_savecomposer": "saveComposer()" | kind=code-symbol | source=js/pages/performers.js:L363 | neighbors=[performers.js]
- "pages_performers_showemployee": "showEmployee()" | kind=code-symbol | source=js/pages/performers.js:L495 | neighbors=[performers.js]
- "pages_settings": "settings.js" | kind=code-symbol | source=js/pages/settings.js:L1 | neighbors=[e10dcd5 update page]
- "services_achievements_normalize": "normalize()" | kind=code-symbol | source=js/services/achievements.js:L13 | neighbors=[achievements.js]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: E:\Madhan\AskEva T V application\.graphify\description-instructions\batch-004.json

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
