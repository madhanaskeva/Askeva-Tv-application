# Node Description Batch 6 of 6

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

- "services_activity": "activity.js" | kind=code-symbol | source=js/services/activity.js:L1 | neighbors=[a8d167d UI Design]
- "services_announcements_inwindow": "inWindow()" | kind=code-symbol | source=js/services/announcements.js:L32 | neighbors=[announcements.js]
- "services_announcements_normalize": "normalize()" | kind=code-symbol | source=js/services/announcements.js:L17 | neighbors=[announcements.js]
- "services_employees_normalize": "normalize()" | kind=code-symbol | source=js/services/employees.js:L20 | neighbors=[employees.js]
- "services_engagements_cleanquestion": "cleanQuestion()" | kind=code-symbol | source=js/services/engagements.js:L12 | neighbors=[engagements.js]
- "services_engagements_id": "id()" | kind=code-symbol | source=js/services/engagements.js:L8 | neighbors=[engagements.js]
- "services_engagements_normalize": "normalize()" | kind=code-symbol | source=js/services/engagements.js:L24 | neighbors=[engagements.js]
- "services_engagements_urlfor": "urlFor()" | kind=code-symbol | source=js/services/engagements.js:L32 | neighbors=[engagements.js]
- "services_events_inwindow": "inWindow()" | kind=code-symbol | source=js/services/events.js:L32 | neighbors=[events.js]
- "services_events_normalize": "normalize()" | kind=code-symbol | source=js/services/events.js:L17 | neighbors=[events.js]
- "services_performers_normalize": "normalize()" | kind=code-symbol | source=js/services/performers.js:L19 | neighbors=[performers.js]
- "services_sales_kpis_calculatemetricgrowth": "calculateMetricGrowth()" | kind=code-symbol | source=js/services/sales-kpis.js:L382 | neighbors=[sales-kpis.js]
- "services_sales_kpis_calculatemonthdaysoverlap": "calculateMonthDaysOverlap()" | kind=code-symbol | source=js/services/sales-kpis.js:L102 | neighbors=[sales-kpis.js]
- "services_sales_kpis_formatgrowthdisplay": "formatGrowthDisplay()" | kind=code-symbol | source=js/services/sales-kpis.js:L393 | neighbors=[sales-kpis.js]
- "services_sales_kpis_sortchronological": "sortChronological()" | kind=code-symbol | source=js/services/sales-kpis.js:L364 | neighbors=[sales-kpis.js]
- "services_sales_kpis_sortreversechronological": "sortReverseChronological()" | kind=code-symbol | source=js/services/sales-kpis.js:L368 | neighbors=[sales-kpis.js]
- "services_tv_person": "person()" | kind=code-symbol | source=js/services/tv.js:L37 | neighbors=[tv.js]
- "vendor_qrcode_min_a": "a()" | kind=code-symbol | source=js/vendor/qrcode.min.js:L1 | neighbors=[qrcode.min.js]
- "vendor_qrcode_min_b": "b()" | kind=code-symbol | source=js/vendor/qrcode.min.js:L1 | neighbors=[qrcode.min.js]
- "vendor_qrcode_min_d": "d()" | kind=code-symbol | source=js/vendor/qrcode.min.js:L1 | neighbors=[qrcode.min.js]
- "vendor_qrcode_min_g": "g()" | kind=code-symbol | source=js/vendor/qrcode.min.js:L1 | neighbors=[qrcode.min.js]
- "vendor_qrcode_min_i": "i()" | kind=code-symbol | source=js/vendor/qrcode.min.js:L1 | neighbors=[qrcode.min.js]
- "vendor_qrcode_min_j": "j()" | kind=code-symbol | source=js/vendor/qrcode.min.js:L1 | neighbors=[qrcode.min.js]
- "vendor_qrcode_min_k": "k()" | kind=code-symbol | source=js/vendor/qrcode.min.js:L1 | neighbors=[qrcode.min.js]
- "vendor_qrcode_min_m": "m()" | kind=code-symbol | source=js/vendor/qrcode.min.js:L1 | neighbors=[qrcode.min.js]
- "vendor_qrcode_min_n": "n()" | kind=code-symbol | source=js/vendor/qrcode.min.js:L1 | neighbors=[qrcode.min.js]
- "icons": "icons.js" | kind=code-symbol | source=js/icons.js:L1

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: E:\Madhan\AskEva T V application\.graphify\description-instructions\batch-005.json

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
