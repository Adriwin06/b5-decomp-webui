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
0.2.0 in development; no registry publication or release tag is implied.

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

Paradise Online uses the library as-is: `web/ui/` is an export (see below), embedded
by `src/web.rs` from a fixed file list and served under `/ui/`. A test checks that the
list matches the folder. The page's own `web/` files hold only its markup, layout and
directory logic: lobby polling, the five-second refresh, stale data and copy text stay
in the app, and the UI package knows nothing about `/v1/dashboard`.

```sh
npm run export -- ../b5-decomp-server/web/ui
```

The server's Content Security Policy (`script-src 'self'; style-src 'self'`) needs no
exception: the module is loaded from the same origin and sets styles through the CSSOM.

## Python / BP-work-server

The progress dashboard serves an export from `bp_work_server/static/b5-ui/` with its
existing static mount; `pyproject.toml` lists the nested folders in its package data.
`<html>` carries `.b5-ui` because the progress map reads its colours and fonts from the
root element. `app.js` is an ES module that imports the library:

- Native selects marked `data-b5-select` replace the dashboard's former hand-built
  dropdown; menu filter groups replace its tabs and segmented toggles, with
  `b5:filterchange` events.
- The explorer and console-gap lists page with `createPager()`; the small panels keep
  their own previous/next buttons in `.b5-page-button`.
- The TU/profile/goal drawer is the shared native drawer (`openDialog`), while the app
  keeps its navigation history; the release chooser is the shared download group.

```sh
npm run export -- ../BP-work-server/bp_work_server/static/b5-ui
```

Explorer queries, SSE, Git attribution, download tracking and server state stay out of
the UI package. Use `paginate()` only for complete client-side collections.

## Exporting a build

`npm run export -- <folder>` builds the library and replaces `<folder>` with the
distribution (it refuses a non-empty folder that holds no earlier export). It writes
`webui.json` there with the version and commit, so a deployed site can be traced to
the library revision it uses. Commit the exported files in the consuming project.

## Adoption sequence

1. Pin one package version and add `.b5-ui` around the application.
2. Replace foundations, buttons, form controls, panels and status presentation.
3. Adopt the shared tabs and native dialog/drawer with accessible names.
4. Check the application's real data flows, keyboard use, small-screen layouts,
   asset paths and content policy.
5. Remove superseded styles and behavior once the consumer has been verified.

See [coverage.md](coverage.md) for the reference screenshots, component inventory
and all major dashboard areas. Both dashboards consume the library; the examples in this repository use sample data.

Native editors and in-game menus can consume token values and design guidance;
they need renderers appropriate to their own UI technology. This package's
actual components target browsers and compatible webviews.
