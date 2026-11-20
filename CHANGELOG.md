# Changelog

## 0.2.0 — Unreleased

The first version adopted by both dashboards. Paradise Online (b5-decomp-server) is
the reference look: its page now renders from this library unchanged, and the decomp
progress dashboard (BP-work-server) uses the same chrome and controls.

- Calibrate the tokens to the online dashboard: red `#e72530`, muted `#c6b9ab`,
  line `#39302e`, success `#a5d379`, its panel and card surfaces, and square corners.
  Add `soft`, `faint`, `edge` and `red-deep`. Solid red fills that carry white text
  use the derived `--b5-color-accent-fill` to keep AA contrast.
- Reproduce the online dashboard's page exactly: `.b5-page` backdrop, `.b5-scenery`
  band, shell widths and breakpoints, site header, brand, numbered navigation with a
  `.b5-site-nav__external` link to the sibling site, hero (`__line`, `__mark`), paint
  action arrow, destination art, connection block, stat strip (`__label`, `__value`,
  `__context`), directory tools, quiet underlined search, refresh, painted filters,
  lobby cards (`__mode`, `__seats`, `.b5-member__host`), roster panel with its tilted
  gold masthead, person rows, illustrated empty state, directory note, numbered steps,
  configuration panel (`__header`, `__action`), footer (`__brand`, `__meta`) and the
  gold notification slip. Add `.b5-dot`, `.b5-accent` and `.b5-status--caps`.
- Remove duplicates: one skewed dot for dots, statuses and badges; one red paint rule
  for paint actions, painted filters and painted tabs; one white strip for actions and
  the destination label; one brush plate for ink actions, dropdown triggers, menu tabs
  and the new `.b5-filter-group--menu`. Drop `.b5-pager` (use `.b5-pagination`),
  `.b5-button--paint-white` (the default paint) and the roster's second illustrated
  empty state (the directory already has one); `.b5-roster__list--scroll` bounds a list.
- `enhance()` only takes control of filter groups that have values, so a group can be
  used for its look alone. The pager formats numbers for the page language and accepts
  a `unit` ("of 4,413 results"); an empty list reads "No results" (or "No files").
  Ink drawer titles keep the case of an identifier.
- Publish builds on a `dist` branch that the sites check out as a git submodule:
  `npm run release` commits the build of the current commit, with a `webui.json`
  naming it. `npm run export -- <folder>` writes the same files into any folder,
  keeping a checkout's `.git` link, to try unreleased changes in a site.
- Ship the B5 mark as `assets/favicon.svg` for both sites.

## 0.1.0

- Redesign the build download control with one clipped asphalt surface, red
  title paint, tire marks, an inline counter, integrated preview and package chooser. Add
  shared popover positioning, keyboard navigation, asset guidance and examples.
- Refine shared surfaces, search fields, focus treatments and panel footers;
  make lobby cards more compact and distinguish hosts in player rosters.
- Level gold header text over the paint, label roster counts and add a Downtown
  sign, skyline and connection action to empty rosters. Show distinct loading
  and last-snapshot states in the directory example.
- Polish catalog navigation, artwork, preview surfaces and source disclosures;
  bring search and category filters together on wide screens.
- Fix title paint drifting from the text when resized; add rendered glyph/paint
  coverage checks for heading lengths and painted controls on desktop and mobile.
- Restore original paint geometry, RGB textures, developer typography, panel
  backgrounds and all six layered download treatments after visual comparison
  with both source dashboards.
- Expand the catalog to 37 families covering the supplied dashboard references.
- Add brush tabs and dropdowns, slanted ribbons, painted selection groups, gold
  roster headers, Paradise destination artwork and illustrated empty states.
- Add themed release controls, progress rings, activity charts, timelines,
  metadata, menu cursor rows, configuration panels and shared layout patterns.
- Add a native-backed select-only combobox and a numbered pager with jump entry.
- Rebuild both application examples around the shared Paradise components.
- Add shared Paradise tokens, scoped styles and local font/artwork assets.
- Add native controls, layout primitives, panels, feedback states and progress.
- Add optional ESM enhancements for tabs, dialogs/drawers, copy and notifications.
- Add a non-mutating pagination helper and TypeScript declarations.
- Add the local component gallery, example applications and integration guides.
- Add unit and browser checks for the shared consumer contract.
