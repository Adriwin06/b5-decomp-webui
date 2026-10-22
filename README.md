# b5-decomp-webui

Shared UI framework and design system for web projects around the Burnout Paradise decompilation.

The initial Paradise preset brings shared typography, colors, components and
interaction patterns to public dashboards and development tools. It is plain
CSS and browser-native JavaScript, with no runtime dependencies. Projects keep
their own backend, data fetching and application state.

## Run the component gallery

Requires Node.js 22.12 or newer for development:

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:4175/gallery/** for the searchable catalog of **37 component
families**, live specimens and copyable markup. The supplied reference patterns
appear first: slanted counters, brush tabs, themed dropdowns, Paradise artwork,
painted filters, roster panels, illustrated empty states and quiet search/refresh.

The **Application examples** page composes them into a working online directory
and developer explorer with clearly marked sample data. Changes to `src/`,
`tokens/` and `assets/` rebuild the library; reload the browser to see them. Use
`PORT` to select another local port.

## Use the library

```sh
npm run build
```

Copy the **whole `dist/` directory** into your project's static files. Keep
`assets/` alongside the stylesheet, including its font license and attribution.
Node.js is not needed by the consuming application.

```html
<link rel="stylesheet" href="/ui/b5-ui.css">

<main class="b5-ui">
  <button class="b5-button b5-button--primary" type="button">
    Take me to Paradise
  </button>
</main>

<script type="module" src="/app.js"></script>
```

```js
// app.js — optional for interactive components
import { enhance, notify } from '/ui/b5-ui.js';

const ui = enhance(document.querySelector('.b5-ui'));
notify('Ready for the road.', { tone: 'success' });
// ui.refresh() after adding new tab groups; ui.destroy() when unmounting.
```

The stylesheet scopes its base styles and tokens to `.b5-ui`; components use
the `b5-` prefix. Set `data-b5-density="compact"` on the wrapper or a subtree for
compact controls. Touch devices retain 44px controls in either density.

Bundlers can import `b5-decomp-webui/style.css` and named exports from
`b5-decomp-webui`. Type declarations accompany the module. Generate a
distributable package with `npm pack`; applications should pin a release version
or a specific Git commit rather than following a moving branch.

## Included in 0.1.0

- DTCG-format theme tokens, generated CSS variables, and self-hosted typography.
- Brush tabs, painted filters, slanted ribbons, textured dropdowns, gold-header
  panels, illustrated empty states and the shared Paradise artwork kit.
- Site headers, hero/destination compositions, server connection blocks, lobbies,
  player rows, rosters, configuration panels and numbered setup steps.
- Six download treatments, release counters, contents previews, progress rings,
  activity charts, timelines, metadata sections and menu cursor rows.
- Buttons, native form controls, panels, metrics, badges, alerts and loading states.
- Keyboard-operable tabs, native modal dialogs and drawers, copy actions and
  dismissible notifications.
- Table, toolbar, numbered pagination with jump controls and expandable-content patterns.
- A searchable component catalog, per-component source and two working application examples.

The JS module has no automatic initialization or DOM side effects on import.
CSS-only components do not require JavaScript. Framework-specific adapters can
be added as real consumer needs emerge.

## Develop and verify

```sh
npm test
```

Tests cover token generation, asset provenance, pagination, keyboard navigation,
select type-ahead and form behavior, dialog focus, notifications, scope isolation,
the catalog, application examples and responsive layouts. Browser tests use installed Edge on Windows and Playwright Chromium on
other platforms. To use another installed channel, set `PLAYWRIGHT_CHANNEL`
(for example `chrome`). On Linux/CI, install the browser once:

```sh
npx playwright install --with-deps chromium
```

Source layout:

```text
src/       Shared CSS, optional ESM behavior and TypeScript declarations
tokens/    Portable Paradise design tokens
assets/    Shared artwork, font, license and provenance hashes
gallery/   Component gallery and example applications
docs/      Component API, integration and contribution guidance
tools/     Dependency-free token build and local preview server
tests/     Unit tests and real-browser interaction checks
dist/      Generated distribution; ignored by Git
```

See the [component reference](docs/components.md),
[coverage inventory](docs/coverage.md),
[integration guide](docs/integration.md), and
[contribution guide](docs/contributing.md).

## Licensing

Framework code and documentation are [MIT licensed](LICENSE). The bundled font
and original game artwork have separate licensing and ownership, documented in
[THIRD_PARTY.md](THIRD_PARTY.md). The MIT license does not relicense game artwork.
