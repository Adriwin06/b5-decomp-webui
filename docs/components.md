# Component reference

Load `b5-ui.css` and place components inside `.b5-ui`. All names below are public
in the 0.2 series. Gallery-specific `garage-*` classes are examples, not part of
the library API. `.b5-ui` is a theme boundary; avoid nesting different themes.

## CSS components

| Component | Classes / native markup |
| --- | --- |
| Actions | `.b5-button`; modifiers `--primary`, `--gold`, `--ghost`, `--ink`, `--paint`; add `--paint-gold` or `--paint-red` to a paint action; `.b5-button__arrow` for its arrow |
| Icon action | `.b5-icon-button` on a button with an accessible label |
| Forms | `.b5-field`, `.b5-label`, `.b5-hint`, `.b5-input`, `.b5-select`, `.b5-textarea`, `.b5-check` |
| Invalid field | `aria-invalid="true"`, `.b5-field-error`, and `aria-describedby` pointing to the error |
| Panel | `.b5-panel`, `__header`, `__body`, `__footer`; optional `.b5-panel--accent` |
| Metric | `.b5-stat`, `__label`, `__value` (a number in `<strong>` and an optional `__context`) |
| Status | `.b5-status` (dot and mono label, `--caps` for uppercase), `.b5-badge` (the same, framed), `.b5-dot` alone; optional `data-tone="success|warning|danger|info"` |
| Alert | `.b5-alert` with optional `data-tone`; add `role="status"` only for dynamic status messages |
| Empty state | `.b5-empty` containing a heading, description and next action |
| Table | `.b5-table-wrap` containing a native `.b5-table`; `.b5-table__action` for row action buttons |
| Toolbar | `.b5-toolbar`; data fetching stays in the application. Pages: `.b5-pagination` below |
| Progress | `<progress class="b5-progress" max="100" value="42">`; optional `--gold`; provide a label |
| Expandable content | `.b5-tree` containing native `<details><summary>` and lists |
| Code / keyboard | `.b5-code`, `.b5-kbd` |
| Layout | `.b5-page` (on `<body>`: the fixed grunge backdrop), `.b5-shell`, `.b5-grid`, `.b5-stack`, `.b5-row` |
| Typography | `.b5-heading`, `.b5-section-title`, `.b5-eyebrow`, `.b5-title-mark`, `.b5-accent` (red text, such as a heading's final dot) |
| Utilities | `.b5-muted`, `.b5-mono`, `.b5-sr-only`, `.b5-skip-link` |

Use native `disabled` on buttons. `aria-disabled` alone does not suppress an
anchor's navigation; applications must handle that behavior themselves. An
`aria-busy="true"` button gets a visual loading indicator; the app owns the
disabled state and a meaningful text label. The paint variant is intended for
prominent calls to action, not loading buttons.

Use visible text in status badges; color alone must not convey the status.
Label every form control. Plain native selects preserve the platform popup.
The optional themed select described below retains the native form control and
provides its own combobox popup, keyboard navigation and type-ahead.

## Initialization

```js
import { enhance } from './ui/b5-ui.js';
const ui = enhance(document.querySelector('#app'));
ui.refresh(); // discover later-inserted tabs, selects, filters and pagers
ui.destroy(); // remove owned listeners and restore owned interactive markup
```

Initialization is idempotent for the same root. Use one enhancement root per
application; avoid overlapping roots, which would duplicate delegated actions.
Dialog and copy actions are delegated and work for later-inserted markup.
Removing an enhancement does not close dialogs or dismiss existing notifications.
Select popup menus are closed and removed on destruction. Refresh also releases
controllers whose elements have been removed from the enhancement root.

## Tabs

```html
<div class="b5-tabs">
  <div class="b5-tablist" role="tablist" aria-label="Directory view">
    <button class="b5-tab" id="tab-all" type="button" role="tab"
      aria-controls="panel-all" aria-selected="true">All</button>
    <button class="b5-tab" id="tab-open" type="button" role="tab"
      aria-controls="panel-open" aria-selected="false">Open</button>
  </div>
  <div class="b5-tabpanel" id="panel-all" role="tabpanel"
    aria-labelledby="tab-all" tabindex="0">All sessions</div>
  <div class="b5-tabpanel" id="panel-open" role="tabpanel"
    aria-labelledby="tab-open" tabindex="0" hidden>Open sessions</div>
</div>
```

Tabs automatically activate on click, Left/Right, Home and End. With
`aria-orientation="vertical"` on the tablist, Up/Down replace Left/Right.
Disabled tabs are skipped. Each tab must reference a distinct panel within its
own `.b5-tabs` container. IDs must be unique across the document. Provide
`tabindex="0"` on a panel whose first meaningful content is not focusable.

For direct control, `createTabs(element)` returns
`{ select(index, { focus?, emit? }), selectedIndex, destroy() }`.
`select()` returns false for an unavailable tab and throws after destruction.
The bubbling `b5:tabchange` event includes `{ index, tab, panel }` in `detail`.
Use automatic activation for already-available content. Remote data loading
belongs to the app and should not delay tab activation.

## Dialogs and drawers

```html
<button class="b5-button" type="button" data-b5-dialog-open="settings">
  Settings
</button>
<dialog class="b5-dialog" id="settings" aria-labelledby="settings-title">
  <header class="b5-dialog__header">
    <h2 id="settings-title" tabindex="-1" data-b5-initial-focus>Settings</h2>
    <button class="b5-icon-button" type="button" data-b5-dialog-close
      aria-label="Close settings">×</button>
  </header>
  <div class="b5-dialog__body">Your settings controls.</div>
</dialog>
```

Add `.b5-dialog--drawer` for the right-edge presentation. Both use native
`showModal()`: background content is inert and focus remains in the dialog.
Escape, a backdrop click, and `data-b5-dialog-close` close the dialog. Initial
focus can be placed on `[data-b5-initial-focus]`; focus returns to the opener
on close. Always provide an accessible name and a visible close action.

`openDialog(dialog, { trigger? })` and `closeDialog(dialog, returnValue?)` also
work directly. `b5:dialogopen` and `b5:dialogclose` bubble; the latter includes
`{ returnValue }`. Set `data-b5-dialog-close="saved"` to provide a return value.
This release requires browsers with native modal dialog support.

These keyboard and focus conventions follow the WAI-ARIA APG
[tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) and
[modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) patterns.

## Notifications and copy

```js
import { notify } from './ui/b5-ui.js';
const notice = notify('Directory refreshed.', {
  tone: 'success', // info | success | warning | danger
  duration: 5000, // 0 keeps it open until dismissal
  root: document.querySelector('#app')
});
notice.dismiss();
```

Notifications render plain text. They pause dismissal while hovered or focused.
Danger notifications use an alert; other tones use a polite status. A region is
created within the provided root as needed, or inside its active managed dialog
so the notification remains visible in the modal top layer. `notify()` returns
`{ element, dismiss }`.

```html
<code id="server-address">example.invalid:27900</code>
<button class="b5-button" type="button" data-b5-copy="server-address">Copy</button>
```

`data-b5-copy` accepts an element ID, not a selector. It copies the control's
value or the element's text. Clipboard failure shows a persistent fallback
instruction. A bubbling `b5:copy` event reports `{ success }`. Clipboard access
requires a secure browser context and can be denied by browser policy.

## Pagination helper

```js
import { paginate } from './ui/b5-ui.js';
const result = paginate(filteredItems, { page: 2, pageSize: 20 });
// { items, page, pageCount, total, from, to, hasPrevious, hasNext }
```

Ranges are one-based, or `0–0` for an empty list. Requested pages clamp to the
available range; an empty list has one page. Options must be integers with a
positive page size. The input collection is never mutated. Server-backed
pagination should use the application's response metadata instead.

## Page composition

Both dashboards share one page skeleton. Paradise Online is the reference; the decomp
progress dashboard uses the same pieces with its own content:

```html
<body class="b5-ui b5-page">
  <a class="b5-skip-link" href="#main-section">Skip to content</a>
  <div class="b5-scenery" aria-hidden="true"></div>
  <header class="b5-site-header b5-shell">
    <a class="b5-brand" href="/"><img class="b5-brand__mark" src="/ui/assets/seal-paradise-city.png"
      width="54" height="54" alt=""><span>BURNOUT PARADISE<span class="b5-brand__subtitle">DECOMP /
      COMMUNITY ONLINE</span></span></a>
    <nav class="b5-site-nav" aria-label="Main navigation">
      <a href="#lobbies" aria-current="location"><span>01</span> Live lobbies</a>
      <a class="b5-site-nav__external" href="https://decomp.example/">Decomp progress ↗</a>
    </nav>
  </header>
  <main class="b5-shell">
    <section class="b5-hero">…eyebrow, title with __line and __mark, copy, paint action…
      <div class="b5-destination">…art, then a .b5-connection block…</div></section>
    <section class="b5-stat-strip">…one .b5-stat per figure…</section>
    <section>
      <div class="b5-section-header"><div><div class="b5-eyebrow">EASY DRIVE / THE LIVE
        DIRECTORY</div><h2 class="b5-heading">Find your crew<span class="b5-accent">.</span></h2></div></div>
      …panels, lists, rosters…
    </section>
  </main>
  <footer class="b5-site-footer b5-shell"><a class="b5-site-footer__brand" href="/">PARADISE
    ONLINE <span>/</span> BUILT FOR THE COMMUNITY</a><div class="b5-site-footer__meta">…</div></footer>
</body>
```

Each site links to the other with `.b5-site-nav__external` and in its footer. The hero
title's `__mark` uses the title mark's paint, which reaches well past both ends of the
word.

The site header stays at the top of the window (`position: sticky`). Its backdrop
fades in over the first 72px of scrolling, so the scenery shows through it at the top
of the page; browsers without scroll-driven animations show the backdrop all the time.
The root gets `scroll-padding-top` so anchored sections land below the header; a page
stylesheet that sets its own `scroll-padding-top` on `html` overrides it. `enhance()`
keeps `aria-current` on the `.b5-site-nav` link whose section is being read (links to
other pages are left alone; while a section the nav does not list is read, no link is
current); `createNavSpy(nav)` does the same for a nav it is given.
Put `.b5-ui` on `<html>` instead when page scripts read tokens from the root element.
`data-b5-density="compact"` on a dense area (a data dashboard's `<main>`) shrinks its
controls without touching the header, hero or stat strip.

## Paradise component families

The searchable catalog at `gallery/` includes 40 live families. The
[coverage inventory](coverage.md) maps these to the supplied references and the
two dashboards. Catalog specimens have copyable source before enhancement;
generated combobox markup is not presented as the authoring interface.

| Presentation | Shared public classes |
| --- | --- |
| Textured action strips | `.b5-button--paint` (original white), `--paint-gold`, `--paint-red`, `.b5-button__arrow` |
| Angled count / finding labels | `.b5-ribbons`, `.b5-ribbon`, `--gold`, `--muted`, `data-tone` |
| Menu controls | `.b5-tabs--paint`, `.b5-filter-group--paint`, `.b5-select-trigger`, `.b5-button--ink`, `.b5-page-button`: italic menu caps at rest, the red paint once chosen; `--menu` variants render the same |
| Single-choice painted filters | `.b5-filter-group`, `--paint`, `--compact` (smaller, for long or many choices), `.b5-filter` and `data-b5-value` |
| Framed or quiet live status | `.b5-badge`, `.b5-status`, `.b5-status--caps`, `.b5-dot`, `data-tone` |
| Quiet directory tools | `.b5-search`, `.b5-refresh`, `.b5-directory-tools`, `.b5-section-header` |
| Shared identity | `.b5-brand`, `__mark`, `__subtitle`, `.b5-site-header`, `.b5-site-nav`, `.b5-site-nav__external` |
| Hero and scenery | `.b5-hero`, `__copy`, `__title`, `__line`, `__mark`, `.b5-scenery` (a decorative band, first in `<body>`) |
| Paradise artwork composition | `.b5-destination`, `__art`, `__logo`, `__label` |
| Copyable server connection | `.b5-connection`, `__top`, `__kicker`, `__address` |
| Public directory layout | `.b5-directory`, `.b5-directory-note`, `__aside`, `.b5-stat-strip` |
| Painted surfaces | `.b5-panel--board` (`.b5-board__label`, `__tools`), `.b5-panel--ink`, `.b5-panel--paint`, `.b5-panel--hazard`, `.b5-count-tile` |
| Roster states | `.b5-roster`, `__count`, `__empty`, `__list`, `__list--scroll`, existing panel sections |
| People and membership | `.b5-person`, `__body`, `__name`, `__meta`, `__role`, `.b5-avatar`, `.b5-member`, `__host` |
| Lobby presentation | `.b5-lobby`, `__header`, `__title`, `__meta`, `__mode`, `__capacity`, `__seats`, `__members` |
| Cards | `.b5-card`, `--compact`, `__header`, `__title`: the lobby card's surface for any list or summary block |
| Illustrated empty state | `.b5-empty--illustrated`, `.b5-empty__symbol`, `.b5-link` |
| Release controls | `.b5-download-group`, `.b5-download`, `.b5-download-counter`, `.b5-download-preview`; optional `[data-b5-download-menu]` |
| Radial metrics | `.b5-metric-card`, `__body`, `.b5-ring`, `__track`, `__fill`, `__label` |
| Segmented meters | `.b5-meter`, `__label`, `__value`, `__bar`; `setProgress()` (or `data-b5-progress`) fills it like a ring; optional `data-tone="success|info|danger"`, or `--b5-meter-color` |
| License strip | `.b5-license`, `__class`, `__id`, `__kicker`, `__rank`, `__next`, `__stats` (one or more meters), `__stamp`; wraps on narrow screens |
| Section numbers and frames | `data-b5-index="01"` on a `.b5-section-header` (a hollow number behind it), `.b5-hud` (gold corners round a map or chart) |
| News ticker | `.b5-ticker` (`--b5-ticker-pitch`, the size of one LED), `__window`, `__track` (its items twice, the second copy `aria-hidden`; `--b5-ticker-duration`), `__item` (amber LED type, `--b5-font-led`), `__toggle` (a visually hidden "Pause" label; `aria-pressed` turns its icon to a play arrow); `createTicker()` or `enhance()` |
| Work/profile summaries | `.b5-summary-grid`, `.b5-summary`, `data-tone` |
| Shared menu selection | `.b5-menu-list`, `.b5-menu-item`, `__title`, `__meta`, `__trailing`, `.b5-table--menu` |
| Events and commits | `.b5-timeline` with native list, time and text elements |
| Detail presentation | `.b5-kv`, `.b5-detail-section`, `.b5-dialog--ink`, `.b5-back`, `.b5-close--game` |
| Activity and comparisons | `.b5-sparkline`, `.b5-bar-row`, `__label`, native progress bars |
| Configuration | `.b5-config`, `__header`, `__action`, `__note`, `__stamp`, `.b5-code__comment`, `__section`, `__value` |
| Instructions and footer | `.b5-steps`, `.b5-site-footer`, `__brand`, `__meta` |
| Loading states | `.b5-loading`, `.b5-skeleton`, `--title`, `--short`; provide a live text label |
| Files and hints | `.b5-tree--menu`, `.b5-tooltip`, `.b5-icon` |

`__name` entries mean a class with the preceding component's prefix. Keep
headings appropriate to the host page's outline; decorative styles do not
determine heading levels. Supply meaningful labels for every icon-only action.

### Paint geometry and original textures

Paint components retain the source artwork's texture, not just its silhouette.
The white action and destination strip use `strip-white.png` at its native
`165 / 45` aspect ratio. The strip's built-in slope is counter-rotated by
`6.7deg`, then the text and paint rotate together. Avoid overriding the
pseudo-element's height or stretching it to `100% 100%`; doing so tilts the
paint away from the text. Gold action strips use the flat `strip-gold.png`.
Paint actions reserve at least 160px of width so short labels stay within the
solid paint core, and an inline margin keeps the brush clear of adjacent actions.

Red title marks and public filter selections use the original banner's RGB
texture and brightness/saturation treatment. Title marks use
`--b5-art-banner-level`: a self-contained SVG wrapper levels the original PNG
in its native coordinates before CSS resizes it. The text and background then
share one rotation. Do not add a separate fixed rotation to the title's
pseudo-element: its required angle would change with the label's proportions.
Painted filter controls retain their original menu treatment.
Developer tabs and dropdowns instead retain the
original clipped black-brush control geometry, with the self-hosted
`--b5-font-head` (Oswald) for their labels. `--b5-font-display` (Anton) remains
the display face used by public headings and painted actions.

The download group supplies one clipped outline and a continuous gold underline.
The trigger, inline count and preview share the same surface, separated by quiet
vertical rules. Preserve `.b5-download-group` around those pieces. A two-line
counter can contain a `<strong>` number and a `<small>` label. The eye is a
separate contents preview. The default tire-burn treatment pairs the original
red brush behind the title with visible tire marks and an italic gold counter.
The download icon and metadata sit on the asphalt surface. Other skins provide
optional artwork treatments on the trigger.

Download treatments use `data-skin="asphalt|streak|skyline|tireburn|torn|split"`.
They change presentation; download URLs and analytics belong to the consumer.

## Build download chooser

Use a native popover to offer a full game and an update package. A plain
`.b5-download` anchor remains available for direct downloads. For a chooser,
use a button and give its group `data-b5-download-menu`:

```html
<div class="b5-download-group" data-b5-download-menu>
  <button class="b5-download" type="button" data-skin="tireburn"
    popovertarget="build-downloads" aria-controls="build-downloads">
    <span><strong>Download build</strong><small>Latest release</small></span>
  </button>
  <span class="b5-download-counter"><strong>128</strong><small>Downloads</small></span>
  <!-- Optional .b5-download-preview button opens the application's file preview. -->
  <div class="b5-download-menu" id="build-downloads" popover="auto"
    role="region" aria-label="Build downloads">
    <a class="b5-download-option" href="/download/full" download>
      <span class="b5-download-option__icon" aria-hidden="true">↓</span>
      <span class="b5-download-option__title">Full game</span>
      <span class="b5-download-option__size">4.69 GB</span>
      <span class="b5-download-option__description">For a first install, including assets.</span>
    </a>
    <a class="b5-download-option" href="/download/update" download>
      <span class="b5-download-option__icon" aria-hidden="true">↓</span>
      <span class="b5-download-option__title">Update only</span>
      <span class="b5-download-option__size">8.2 MB</span>
      <span class="b5-download-option__description">Extract over an existing game folder.</span>
    </a>
    <footer class="b5-download-menu__note">
      <span class="b5-status" data-tone="success">Assets unchanged</span>
      <p>Already have the game folder? <strong>Update only</strong> is all you need.</p>
    </footer>
  </div>
</div>
```

Supply real URLs, sizes, release metadata and asset-change guidance from the
application. The gallery uses illustrative sizes and downloads documentation.
The optional `.b5-download-menu__header` holds a label and release identifier.
Give each popover a unique ID and an accessible name. The native Popover API
provides the top layer, light dismissal and invoker Tab order; the button still
opens the native popover without the library enhancement.

`enhance(root)` discovers download groups and positions the chooser beside its
control, flips it above a low toolbar and keeps it inside the viewport. Enter
and Space toggle it; Tab moves through the links. Up/Down, Home and End navigate
choices, and Escape returns focus to the button. Following a package link
closes the chooser; the preview action remains independent.

For direct control, `createDownloadMenu(group)` returns
`{ element, opened, open({ focus? }), close({ restoreFocus? }), destroy() }`.
`focus` accepts `false`, `'first'` or `'last'`. Creation is idempotent;
`destroy()` closes the popover and restores owned attributes and placement.
An enhancement refresh releases removed groups and discovers inserted ones.

## Roster composition

Avatar colors use `data-color="gold|green|blue"`; the default is red.
Use `.b5-roster__list` for a bounded scroll region and give a keyboard-scrollable
region a `tabindex="0"` and accessible name. Remove that tab stop when replacing
the list with an empty or loading state; links in an empty state remain focusable.

The gold masthead (`.b5-panel--paint`) spans the top of the panel and covers its top
border; its bottom edge climbs to the right and the title stays upright. Set
`--b5-paint-inset` on the panel to change its side padding; the masthead follows. An
optional `.b5-roster__count` puts a visible label such as "Online" beside the count
tile; `role="status"` announces count updates. A stale snapshot should label
its count "Last seen", and a loading count should use a dash rather than zero.
Connection state and live data stay with the consuming application.

An empty roster is one quiet line, `.b5-roster__empty`, which keeps line breaks
(`white-space: pre-line`): the illustrated empty state belongs to the main list
beside it, so the two never repeat the same sign and skyline. Use a loading status
instead of the empty-state line while waiting for the first snapshot.
`.b5-roster__list` spaces the rows; add `--scroll` to bound a long list.

## Themed selects

```html
<label class="b5-field">
  <span class="b5-label">Status</span>
  <select class="b5-select" data-b5-select name="status">
    <option value="all">All statuses</option>
    <option value="active">In progress</option>
    <option value="done">Completed</option>
  </select>
</label>
```

The trigger belongs to the menu controls: italic caps over the quiet search's
underline, gold under the pointer and painted red while its list is open.

`enhance()` discovers `select[data-b5-select]`. For direct control,
`createSelect(select)` returns `{ element, open(), close({ commit? }), refresh(),
destroy() }`, where `element` is the visible combobox button. Only native
single-select controls are supported; omit the data attribute on a multi-select.

Arrows, Home, End, Page Up/Down and type-ahead explore enabled options. Disabled
options and disabled groups are skipped. Enter, Space, Tab and leaving the
control commit a highlighted option; Escape cancels exploration. DOM focus
remains on the combobox. These conventions follow the WAI-ARIA APG
[select-only combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/).

The native select retains its name, form association, value, required constraint
and option data. User selection emits native bubbling `input` and `change`
events, so consumers read `select.value` and submit normal `FormData`. Native
form resets are synchronized after the browser's reset action. Validation moves
focus to the visible control, and native `disabled`, `hidden` and ARIA labels
are mirrored. Use the `hidden` property rather than an application-specific
class to hide the entire enhanced control.

Option/attribute changes are observed. After a programmatic `.value` assignment,
dispatch the appropriate native event or call `controller.refresh()`. Labels
must be visible or supplied through `aria-label` / `aria-labelledby`.

Modern browsers render the popup through the native Popover API, escaping
ancestor clipping while retaining DOM/theme ancestry. There is a positioned
fallback for browsers without the API; plain native selects remain available
when no enhancement is requested. Test the consumer's browser and assistive
technology combinations before deployment.

## Filter groups

```html
<div class="b5-filter-group b5-filter-group--paint"
     role="group" aria-label="Filter lobbies">
  <button class="b5-filter" type="button" data-b5-value="all"
          aria-pressed="true">All lobbies <span>12</span></button>
  <button class="b5-filter" type="button" data-b5-value="space">
    With space <span>3</span>
  </button>
</div>
```

Add `.b5-filter-group--compact` for long labels or many choices, such as state
filters with counts. A group whose buttons have no `data-b5-value` is left to the
application, which then sets `aria-pressed` itself.

Each group has unique values and one enabled selection. Native button activation
and Left/Right/Home/End update it. The bubbling `b5:filterchange` event provides
`{ value, button }`. `createFilterGroup(element)` exposes `value`,
`select(value, { focus?, emit? })` and `destroy()`. This is a filter control, not
a tab list; use actual tabs when switching named panels. Data and counts remain
application-owned.

## Pagination controls

```html
<nav class="b5-pagination" data-b5-pager data-b5-total="4319"
     data-b5-page-size="50" aria-label="Explorer pages"></nav>
```

Add `data-b5-unit="results"` (or the `unit` option) to name what is counted. Numbers
are formatted for the document language. When the total arrives with the data, leave
out `data-b5-pager` and call `createPager()` on the first response: `enhance()` would
otherwise start the pager at a total of 0, reading "No results" while the data loads.
Placeholder content inside the container (such as a `—` range) shows until then.

`createPager(container, { total?, pageSize?, page?, unit?, locale? })` returns a controller with
read-only `state`, `set(options, { emit? })` and `destroy()`. State contains
`page`, `pageCount`, `pageSize`, `total`, `from` and `to`. Totals must be
nonnegative integers, page size a positive integer and page an integer. Pages
clamp when the total shrinks. Empty results expose `0–0` on one empty page, and the
range reads "No results" (or "No files" with that unit) instead of `0–0 of 0`.

The widget renders Previous/Next, page numbers with elisions, an announced range
and a labeled jump field. User navigation emits bubbling `b5:pagechange` with
the state in `detail`. `set()` updates silently unless `emit: true` is supplied.
The consumer uses this event to render or fetch data and supplies the resulting
total; the pager never contacts a backend.

## Progress rings and activity

```html
<div class="b5-ring" data-b5-progress="63.7" aria-label="Unit coverage">
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <circle class="b5-ring__track" cx="60" cy="60" r="52"></circle>
    <circle class="b5-ring__fill" cx="60" cy="60" r="52" pathLength="100"></circle>
  </svg>
  <span class="b5-ring__label">
    <strong data-b5-progress-label>63.7%</strong><small>Matched</small>
  </span>
</div>
```

`enhance()` initializes elements with `data-b5-progress`. `setProgress(element,
value, { max: 100 })` updates a ring or native `<progress>`, clamps its finite
value to the valid range, and returns a percentage. Rings get progressbar roles
and current/min/max metadata; provide their accessible name. `data-tone` selects
red (default), `warning` (gold), `info` (blue), or `success` (green).

`renderSparkline(element, values, { label })` renders nonnegative finite activity
values and an accessible label containing the numeric series. It is a small
histogram, not a time-series data provider. Contribution comparisons can pair
`.b5-bar-row` labels with native progress bars.

## Artwork, symbols and source specimens

Keep the distribution's asset directory alongside the CSS. Direct HTML image
and SVG `<use>` references should use your application's static prefix:

```html
<svg class="b5-icon" aria-hidden="true">
  <use href="./ui/assets/icons.svg#search"></use>
</svg>
```

The texture custom properties (`--b5-art-banner`, `--b5-art-brush` and the rest)
hold URLs relative to `b5-ui.css`. Browsers resolve such a URL where the variable is
used, so they only work inside the library's own rules. In an application stylesheet,
reference the file by its served path, such as `url('/ui/assets/brush-black.png')`;
override a variable only with an absolute URL.

The sprite includes search, refresh, copy, download, eye, arrow, back, close,
check, chevron, folder and file symbols. Decorative symbols use `aria-hidden`;
their containing action supplies the accessible name. A `.b5-tooltip` pairs a
button's `aria-describedby` with a uniquely identified `role="tooltip"` span.
Hints appear on hover/focus; Escape dismisses the current hint until departure.

The catalog's source snippets use example IDs and paths. Keep IDs unique when
combining specimens. Gallery-only controls marked `data-demo-*`, treatment
pickers, and sample data handlers illustrate application behavior; they are not
backend integrations or additional framework APIs.
