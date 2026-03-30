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
- Browser compatibility with WebGL2 support.

## Suggested Next Tests

- Deterministic simulation unit tests around `Particle.update`.
- Integration tests for UI controls with Playwright.
- Performance regression baseline checks.
