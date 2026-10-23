# Component coverage

The library's acceptance target is the visual and interaction vocabulary of
`BP-work-server` and `b5-decomp-server`, plus the supplied reference screenshots.
The catalog now contains 37 component families, with live specimens and
copyable markup. A family can serve several domain views; queues, dependencies
and blocked work share the menu-row component rather than separate renderers.

Paint geometry and background layers follow the original selectors in
`b5-decomp-server/web/app.css` (`.title-live`, `.paint-button`,
`.destination-label`, `.filter-tabs`, `.players-heading`) and
`BP-work-server/bp_work_server/static/app.css` (`.explorer-tabs`, `.filter`,
`.badge`, `.download-group`, `.dv-*`). The white strips preserve their source
aspect ratio; the red paint retains its RGB grunge instead of a flat mask.
Developer controls use the original Oswald face. See the component reference
for the rotation and texture-sizing rules.

The title paint is leveled in an SVG wrapper before resizing, so its baseline
stays aligned with labels of different lengths. Browser checks compare actual
glyph pixels with the paint beneath them at desktop and mobile sizes; ordinary
control and viewport tests do not establish that visual alignment.

## Reference screenshot coverage

| Reference | Shared implementation | Catalog specimen |
| --- | --- | --- |
| Findings / no-body / case / event / callee / assert counters | `.b5-ribbons`, `.b5-ribbon`, semantic tones | `#counters` |
| Translation units / functions / available-in-build tabs | `.b5-tabs--menu`, keyboard-enhanced tabs | `#menu-tabs` |
| Black brush status / source / goal controls | `createSelect()`, `.b5-select-trigger`, `.b5-select-menu` | `#dropdowns` |
| Paradise City artwork and copyable server block | `.b5-destination`, `.b5-connection`, `.b5-status` | `#destination` |
| Painted All lobbies / With space selection | `.b5-filter-group--paint`, `b5:filterchange` | `#filters` |
| Gold Who's driving panel, count and footer | `.b5-panel--paint`, `.b5-roster`, `.b5-count-tile` | `#roster` |
| Illustrated empty directory, sign and skyline | `.b5-empty--illustrated`, `.b5-directory-note` | `#empty-state` |
| Minimal search and refresh controls | `.b5-search`, `.b5-refresh`, shared SVG symbols | `#search-refresh` |

## Broader dashboard inventory

| Dashboard area | Component families / catalog anchors |
| --- | --- |
| Public identity and layout | `#navigation`, `#destination`, `#footers`; `.b5-hero`, `.b5-directory`, `.b5-scenery`, layout utilities |
| Primary, secondary and textured actions | `#buttons`, `#downloads`, `#tooltips`, `#copy-actions` |
| Release CTA, package chooser, sizes, asset note, count, preview and six skins | `#downloads`; `createDownloadMenu()`; asphalt, streak, skyline, tireburn, torn, split |
| Translation-unit, function and executable metrics | `#progress-rings`, `#linear-progress`, `#summary-tiles`, `#statistics` |
| Active goals and work-state summaries | `#summary-tiles`, `#panel-treatments`, `#menu-rows` |
| Explorer modes, filtering, result navigation and rows | `#menu-tabs`, `#dropdowns`, `#search-refresh`, `#data-tables`, `#pagination` |
| Agent, contributor and player identities | `#people`, `#lobby-cards`, `#roster` |
| Live work, next queue, blocked work and dependencies | `#menu-rows`, `#status-labels`, `#panel-treatments`, `#metadata` |
| Repository overview, commits and file browsing | `#timelines`, `#trees`, `#statistics`, `#metadata` |
| TU, function, profile and goal detail presentation | `#drawers`, `#metadata`, `#counters`, `#people`, `#activity-charts` |
| Profile activity and contribution breakdowns | `#activity-charts`, `#linear-progress`, `#summary-tiles` |
| Lobby identity, capacity, availability and memberships | `#lobby-cards`, `#people`, `#status-labels` |
| Connection instructions and configuration | `#configuration`, `#steps`, `#copy-actions` |
| Loading, stale, error and empty content | `#loading-states`, `#empty-state`, `#notifications` |
| Native inputs, checks, radios and validation | `#forms`, `#dropdowns` |
| Dialogs and focused settings | `#dialogs`, `#drawers` |
| Game UI texture and decal inventory | `#artwork`; source paths and SHA-256 in `assets/provenance.json` |

## Working application examples

`gallery/examples.html` composes the library into two sample applications:

- **Online directory:** shared header, hero artwork, connection block, stats,
  painted filters, searchable lobbies, player roster, connection instructions
  and configuration. Its state selector demonstrates active sessions, an empty
  directory, loading and a stale retained snapshot. One sample room is full so
  the With space filter has a visible effect.
- **Developer explorer:** release controls, progress rings, findings ribbons,
  translation-unit/function/build modes, brush status/source/goal filters,
  sorting, paging, a detail drawer and a build-contents preview.

These use clearly identified sample data. They do not replace either running
dashboard. Migrating a consumer requires checking its real API flows and
removing the old presentation code after verification.

## Boundary of the shared package

The package owns presentation, control state, keyboard behavior, accessibility
metadata and generic interaction events. Consumers still own lobby polling,
SSE, server queries, attribution, work claims, downloads, game records, history
entries and domain-specific rendering. The drawer example demonstrates an
application-owned view history inside the shared drawer.

The coverage inventory describes current implementations. New workflow screens
should extend a documented family or introduce a tested component and catalog
specimen; matching a color palette alone is not sufficient coverage.
