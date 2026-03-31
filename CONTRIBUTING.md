# Contributing Guide

Thanks for your interest in contributing to **Grit Particle Simulator**.

## Development Setup

```bash
npm install
npm run dev
```

## Before Opening a PR

1. Run `npm run typecheck`.
2. Run `npm run build`.
3. Keep changes focused and documented.
4. Update docs when behavior or architecture changes.

## Pull Request Guidelines

- Use clear and descriptive titles.
- Explain motivation, approach, and trade-offs.
- Include screenshots/GIFs for visual UI changes.
- Avoid unrelated refactors in the same PR.

## Code Style

- Keep engine logic outside purely presentational UI components.
- Consume simulation internals through `@nullcipherr/grit-engine` public APIs only.
- Prefer explicit naming for modules and configs.
- Add comments only for architectural or non-obvious decisions.
