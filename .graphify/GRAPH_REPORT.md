# Graph Report - .  (2026-09-14)

## Corpus Check
- Corpus is ~47,615 words - fits in a single context window. You may not need a graph.

## Summary
- 227 nodes · 406 edges · 16 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: contains: 181 · calls: 97 · MODIFIES: 95 · PARENT_OF: 18 · ON_BRANCH: 15


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 32 · Candidates: 41
- Excluded: 47 untracked · 0 ignored · 0 sensitive · 1 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `b39ad28`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `details()` - 8 edges
2. `renderPage()` - 7 edges
3. `hoursAgo()` - 7 edges
4. `esc()` - 7 edges
5. `panel()` - 6 edges
6. `renderSidebar()` - 5 edges
7. `bindShell()` - 5 edges
8. `onHashChange()` - 5 edges
9. `render()` - 5 edges
10. `getISOWeekInfo()` - 5 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.14
Nodes (19): main, 3683c82 Merge branch 'Kabilan' of https://github.com/madhanaskeva/Askeva-Tv-application, 377cffd latest update, 472b4df latest update, 65d5871 update contentmedia, 95ce69b Update, a6b84e6 update content page, a8d167d UI Design (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.19
Nodes (11): buildAchievements(), buildActivity(), buildAnnouncements(), buildEmployees(), buildEvents(), buildPerformers(), buildWishes(), daysAgoISO() (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (11): getISOWeekInfo(), getMonthName(), getWeekMonthKey(), getWeeksForMonth(), isMonthlyPublished(), normalizeRecord(), readPublishedMonths(), readRecords() (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.28
Nodes (15): appAction(), bindShell(), captureFocus(), groupHasActive(), isNavActive(), navCounts(), onHashChange(), parseHash() (+7 more)

### Community 4 - "Community 4"
Cohesion: 0.21
Nodes (13): activityPanel(), greeting(), hero(), meter(), panel(), pct(), performersPanel(), readyItems() (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.21
Nodes (10): cardsView(), confirmDelete(), emptyState(), formHtml(), openForm(), openProfile(), openPushToTv(), openRandomPushToTv() (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (13): badge(), copy(), creator(), defaultQuestions(), details(), esc(), input(), mountQR() (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.17
Nodes (7): changeEmployee(), composer(), employeeOptions(), matchingEmployees(), recognitionRecords(), recordTable(), renderEmployeeResults()

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (2): r(), s()

### Community 10 - "Community 10"
Cohesion: 0.38
Nodes (9): getActiveRecord(), getPreviewRecord(), mount(), render(), renderEditorForm(), renderHistorySection(), renderPreviewSection(), renderStats() (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.27
Nodes (5): endDateTime(), endLabel(), expired(), formatTime(), validateEnd()

### Community 12 - "Community 12"
Cohesion: 0.36
Nodes (5): bucketRows(), openEditor(), previewEmployees(), slideFor(), transitionPreview()

### Community 13 - "Community 13"
Cohesion: 0.50
Nodes (2): close(), mountOverlay()

### Community 14 - "Community 14"
Cohesion: 0.60
Nodes (3): key(), readRaw(), writeRaw()

### Community 16 - "Community 16"
Cohesion: 0.50
Nodes (2): openForm(), slideFor()

### Community 17 - "Community 17"
Cohesion: 0.50
Nodes (2): openForm(), slideFor()

## Knowledge Gaps
- **Thin community `Community 8`** (2 nodes): `r()`, `s()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (2 nodes): `close()`, `mountOverlay()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `openForm()`, `slideFor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `openForm()`, `slideFor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1354723707664884 - nodes in this community are weakly interconnected._