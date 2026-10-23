# Integrating a project

## Distribution and paths

Build with `npm ci && npm run build`, or unpack a versioned `npm pack` artifact.
Serve the complete `dist/` folder at any static prefix, such as `/ui/` or
`/static/b5-ui/`. Font and texture URLs are relative to `b5-ui.css` and work under
subdirectories. No font CDN, runtime dependency or Node server is required.
The ESM entry imports `select.js`, `pager.js` and `download.js`; keep all three
next to `b5-ui.js`.

Load `b5-ui.js` as an ES module. Under a strict Content Security Policy, put
initialization code in an external module allowed by `script-src 'self'`.
The library does not need `unsafe-inline`, `eval`, or external requests. Permit
same-origin styles, fonts and images. Its CSS uses a named cascade layer;
application overrides can live in an unlayered stylesheet loaded afterwards.

If consuming through npm, import:

```js
import 'b5-decomp-webui/style.css';
import { enhance } from 'b5-decomp-webui';
```

The package build also runs during `npm install` from a Git checkout and
`npm pack`. Pin an existing release tag or commit. The repository starts at
0.1.0 in development; no registry publication or release tag is implied.

## Theme and density

Wrap the application in `.b5-ui`. Shared foundations and resets are scoped to
that wrapper; class names are prefixed to avoid incidental host-page collisions.
Components outside it do not receive the required tokens. Toasts created with
the default root use the first `.b5-ui`; multiple isolated applications should
pass their own root to `notify()`.

```css
/* App-owned overrides; keep semantic meanings consistent. */
.my-app.b5-ui {
  --b5-color-accent: #b91e2a;
  --b5-color-focus: #ffdc80;
}
```

Set `data-b5-density="compact"` on the wrapper or a section. This reduces
control height to 36px and panel padding to 16px. Coarse-pointer devices keep
44px controls. A consumer can choose a density without offering a user toggle.
Motion responds to `prefers-reduced-motion`.

The token source uses the
[DTCG 2025.10 format](https://www.designtokens.org/tr/2025.10/format/).
The dependency-free generator supports this preset's sRGB colors, dimensions,
durations, font families, inherited types and whole-token aliases. It is not a
general implementation of the complete DTCG specification.

## Rust / b5-decomp-server

Keep the existing dashboard HTTP and JSON routes. Embed the built CSS, ESM and
its fixed asset list using the server's existing `include_bytes!` approach.
Preserve the relative directory structure when exposing the files:

```text
/ui/b5-ui.css
/ui/b5-ui.js
/ui/select.js
/ui/pager.js
/ui/download.js
/ui/assets/anton-latin.ttf
/ui/assets/banner-red.png
... the remaining distribution files
```

Map the existing paint action to `.b5-button--paint`, live indicators to
`.b5-badge`, cards to `.b5-panel`, and notices to `.b5-alert`. Keep lobby
rendering, the five-second refresh, stale data and connection logic in the app.
The UI package does not know about `/v1/dashboard` or any server address.

## Python / BP-work-server

Place the distribution under `bp_work_server/static/b5-ui/` and serve it with the
existing static mount. Include nested files in Python package-data rules; a
top-level `static/*` glob alone is not enough for the asset subdirectory.

Migrate shared tokens and native controls first. Replace panel and status
classes, then move tabs and the detail overlay to the shared markup. Preserve
the existing drawer's TU/profile/goal navigation history in the application;
the shared drawer owns presentation and opening/closing behavior.

Replace the old hand-built dropdown with `<select class="b5-select" data-b5-select>`
and the shared `enhance()` initializer. The native select remains the form value
source; the shared combobox supplies the textured popup and keyboard behavior.
Omit `data-b5-select` when a plain native popup is preferred. Keep
explorer queries, SSE/polling, Git attribution, download tracking and server
state out of the UI package. Use `paginate()` only for complete client-side
collections; the server's explorer pagination already supplies its own metadata.

## Adoption sequence

1. Pin one package version and add `.b5-ui` around the application.
2. Replace foundations, buttons, form controls, panels and status presentation.
3. Adopt the shared tabs and native dialog/drawer with accessible names.
4. Check the application's real data flows, keyboard use, small-screen layouts,
   asset paths and content policy.
5. Remove superseded styles and behavior once the consumer has been verified.

See [coverage.md](coverage.md) for the reference screenshots, component inventory
and all major dashboard areas. Both existing dashboards remain separate consumers. Their examples in this
repository use sample data, and do not constitute a migration of either app.

Native editors and in-game menus can consume token values and design guidance;
they need renderers appropriate to their own UI technology. This package's
actual components target browsers and compatible webviews.
