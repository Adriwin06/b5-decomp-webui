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
  for paint actions and every chosen control; one white strip for actions and the
  destination label; one menu-control family, after the painted filters, for filters,
  tabs, dropdown triggers, ink actions and page buttons (italic caps, the red paint
  once chosen, dropdowns underlined like fields). The black brush plates are gone and
  the `--menu` tab and filter variants render the same. Drop `.b5-pager` (use `.b5-pagination`),
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
- The site header stays at the top of the window, its backdrop fading in once the
  page scrolls, and anchored sections land below it. `enhance()` marks the nav link
  of the section being read (`createNavSpy()`).
- The hero mark uses the title mark's paint, which now covers both ends of the word.
- The gold masthead spans its panel, covers the top border and keeps the title
  upright; `.b5-roster__count` sets its label beside the count.
- Add `.b5-card` (`--compact`, `__header`, `__title`), the lobby card's surface for any
  list or summary, and `.b5-filter-group--compact` for long or many painted choices.
- Add `.b5-panel--board`, the configuration panel's frame around a large data view, with
  `.b5-board__label` and `.b5-board__tools` in its header.
- Add game-menu pieces for a dashboard: the `.b5-license` card, a progress rank with
  segmented `.b5-meter` bars that `setProgress()` fills like the rings, and
  `.b5-license-chip`, the same license folded into a header button; the `.b5-ticker`
  news crawl in amber LED type after the game's own, paused on hover or by its toggle
  (`createTicker()`) and still under reduced motion; hollow section numbers
  (`data-b5-index` on a section header) and `.b5-hud` gold corners.
- `.b5-download-group--cluster` turns the download control into an instrument cluster: a
  tachometer pod (`.b5-gauge`, drawn by `renderGauge()` or `data-b5-gauge`) whose needle
  sweeps when shown and revs to the redline on hover or focus, the build's number on its
  face and the download odometer in its opening, the bar running out from under it and
  the preview as a knob on its rim.
- The download control can read as a dashboard: `.b5-download__boost` streams speed lines
  past and charges a boost bar along its bottom edge on hover, `.b5-plate` puts a short
  identifier on a licence plate, and `.b5-odometer` with `setOdometer()` shows a count on
  rolling digit drums.
- The stat strip's content sits inset from the band's ends, and each divider has the same
  gutter on both sides (`--b5-stat-gutter`), so a wide stat no longer runs into the divider
  or the band's edge.
- The drawer leans: a slanted leading edge (`--b5-drawer-cut`) with a red-to-gold blade, a
  title plate whose `.b5-dialog__kind` sits on the red menu paint, slanted close and back
  plates, hatched section titles (`.b5-drawer-heading`), leaning tiles, smaller painted
  filters and diagonal speed lines behind it. `.b5-empty__symbol--diamond` gives an
  illustrated empty state the blank diamond road sign.
- Add B5 LED (`--b5-font-led`, `assets/b5-led.woff2`), a pixel font drawn for the
  ticker and generated by `tools/led-font.py`.

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
