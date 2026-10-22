# Contributing

Develop shared components against both gallery patterns. A public directory and
a dense developer tool should feel related while retaining layouts appropriate
to their tasks.

- Prefer semantic HTML and native controls. Interactive components need an
  accessible name, keyboard behavior, visible focus and a clear disabled state.
- Add semantic values to `tokens/paradise.tokens.json`. Use existing `--b5-*`
  variables in components. App-specific layouts and decorative experiments
  belong in the gallery or a consuming app.
- Keep public classes prefixed with `b5-`. Scope base element selectors to
  `.b5-ui`, and verify the library does not change surrounding host content.
- Keep backend APIs, data fetching, game-specific records and application state
  in the consumer. Accept native elements and plain values at library boundaries.
- New interactive behavior needs a working gallery example and a meaningful
  browser test. Check normal and compact densities and a narrow viewport.
- Add asset provenance and the correct attribution for any new imported file.
  Do not represent original game artwork as MIT-licensed framework code.

Run `npm test` before proposing a change. Build output, test reports and archives
are generated and should not be committed. Update public API documentation and
the changelog whenever the consuming project's contract changes.

## Versioning

The initial series is `0.1.x`. Patch releases preserve documented APIs and token
names. Breaking changes increment the minor version while the library is below
1.0, with migration instructions. A stable 1.0 should follow adoption and
verification in both existing dashboards.

To prepare a release, update the version and changelog, run the checks, then run
`npm pack`. Its archive includes built assets, declarations, tokens, guides and
license notices. Publishing a registry package or creating a GitHub release is
a separate maintainer action; CI only validates the code.
