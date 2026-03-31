# Testing

## Current Automated Checks

- `npm run typecheck`
- `npm run build`
- CI pipeline in `.github/workflows/ci.yml`

## Local Validation

```bash
npm run typecheck
npm run build
npm run preview
```

## Manual Test Matrix

- Canvas interaction (mouse/touch): spawn, drag, stop.
- Obstacle mode: creation and collision behavior.
- Preset switching while simulation is running.
- Pause/resume/reset controls.
- Browser compatibility with hardware acceleration enabled.

## Suggested Next Tests

- Contract tests for integration points with `@nullcipherr/grit-engine` (config updates, pointer input, pause/resume).
- Integration tests for UI controls with Playwright.
- Performance regression baseline checks.
