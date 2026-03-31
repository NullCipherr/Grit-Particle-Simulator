<div align="center">
  <h1>Grit Particle Simulator</h1>
  <p><i>A real-time GPU-accelerated particle sandbox built with React and TypeScript</i></p>

  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-1f6feb?style=flat-square" alt="License" /></a>
    <img src="https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-2f74c0?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  </p>
</div>

---

## Documentation

Technical docs are organized by topic for faster onboarding and easier maintenance.
English is the primary language; Portuguese translations are available under `docs/pt-br/`.

- [Documentation Index](docs/README.md)
- [Architecture](docs/en/ARCHITECTURE.md)
- [Simulation Model](docs/en/SIMULATION.md)
- [Operations](docs/en/OPERATIONS.md)
- [Performance](docs/en/PERFORMANCE.md)
- [Deployment](docs/en/DEPLOYMENT.md)
- [Testing](docs/en/TESTING.md)
- [Roadmap](docs/en/ROADMAP.md)

---

## Preview

Interactive canvas served at `/`:

- Local URL: `http://localhost:3000`
- Main component: `src/components/ParticleSimulator.tsx`

---

## Overview

**Grit Particle Simulator** is a browser-based physics sandbox focused on smooth real-time visuals and direct interaction.

The project is built around:

- The GRIT Engine package (`@nullcipherr/grit-engine`) with configurable forces and collisions;
- GPU instanced rendering for high particle counts;
- Spatial hashing for scalable neighbor lookup;
- Preset-driven behavior switching for experimentation;
- Lightweight CI (`typecheck + build`) and static deployment flow.

---

## Features

- **Engine-driven rendering** with high particle throughput and optional bloom.
- **Up to 50,000 particles** (`MAX_PARTICLES`) in a single simulation.
- **Real-time controls** for gravity, attraction, friction, size, and toggles.
- **Pointer interaction**: click/drag to spawn matter.
- **Obstacle mode**: place circular barriers directly on canvas.
- **Behavior presets** (Nebula, Black Hole, Firestorm, Quantum, Cyberpunk, and more).
- **Spatial hashing** to optimize neighbor lookups for flocking/collisions.
- **Responsive canvas handling** with DPR cap to protect performance.
- **Cloudflare Pages ready** static deployment setup.

---

## Architecture

Main runtime flow:

1. `src/main.tsx` bootstraps React.
2. `src/App.tsx` mounts the full-screen simulator shell.
3. `src/components/ParticleSimulator.tsx` handles UI, pointer events, and engine lifecycle.
4. `src/components/ParticleSimulator.tsx` acts as wrapper between React state and the engine imperative API.
5. `@nullcipherr/grit-engine` concentrates physics, spatial partitioning, and rendering.
6. `src/components/SettingsPanel.tsx` updates `SimConfig` without polluting rendering modules.

---

## Performance Notes

Current performance-focused decisions:

- Neighbor search via spatial hashing instead of `O(n²)` full scans.
- Throttled flocking calculations (`~30Hz`) and capped neighbor counts.
- Reused temporary arrays to reduce GC pressure.
- GPU-side color lookup via precomputed hue palette in the engine package.
- Optional bloom/trail behavior controlled by engine configuration.
- UI counters updated at intervals (not every frame) to avoid unnecessary React work.

For detailed guidance, see [Performance](docs/en/PERFORMANCE.md).

---

## Technical Decisions

- **Dedicated engine package** (`@nullcipherr/grit-engine`) consumed as dependency.
- **Declarative config contract** through `SimConfig` type.
- **Engine lifecycle isolation** in a React wrapper component.
- **No backend dependency**: static-first architecture for low operational overhead.

---

## Roadmap

Production-maturity next steps:

- Add deterministic replay/seed mode for reproducible simulations.
- Expand profiling and benchmark automation (`frame time`, `memory`).
- Add keyboard shortcuts and accessibility affordances.
- Introduce optional worker-based simulation step for heavier scenes.
- Publish shareable preset import/export format.

See full plan in [Roadmap](docs/en/ROADMAP.md).

---

## Tech Stack

- **Core**: React 19 + TypeScript
- **Build**: Vite 6
- **Rendering**: `@nullcipherr/grit-engine`
- **UI**: Tailwind CSS 4 + Lucide + Motion
- **Deploy**: Cloudflare Pages
- **CI**: GitHub Actions

---

## Project Structure

```text
.
├── docs/
│   ├── README.md
│   ├── assets/
│   │   └── README.md
│   ├── en/
│   │   ├── ARCHITECTURE.md
│   │   ├── DEPLOYMENT.md
│   │   ├── OPERATIONS.md
│   │   ├── PERFORMANCE.md
│   │   ├── ROADMAP.md
│   │   ├── SIMULATION.md
│   │   └── TESTING.md
│   └── pt-br/
│       ├── ARCHITECTURE.md
│       ├── DEPLOYMENT.md
│       ├── OPERATIONS.md
│       ├── PERFORMANCE.md
│       ├── ROADMAP.md
│       ├── SIMULATION.md
│       └── TESTING.md
├── public/
│   ├── _headers
│   └── _redirects
├── src/
│   ├── components/
│   │   ├── ParticleSimulator.tsx
│   │   └── SettingsPanel.tsx
│   ├── constants/
│   │   └── presets.ts
│   ├── types/
│   │   └── simulation.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── SECURITY.md
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── wrangler.toml
```

---

## Getting Started

### Prerequisites

- Node.js `18+` (CI runs on Node `22`)
- npm `9+`

### Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If you are validating local changes in the sibling engine repository (`../grit-engine`), build it first:

```bash
cd ../grit-engine
npm install
npm run build
```

### Type Check

```bash
npm run typecheck
```

### Production Build

```bash
npm run build
npm run preview
```

---

## Deployment

### Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Node version: `22`

Step-by-step guide:

- [English Deployment Guide](docs/en/DEPLOYMENT.md)
- [Portuguese Deployment Guide](docs/pt-br/DEPLOYMENT.md)

---

## Scripts

- `npm run dev`: start local dev server on port `3000`.
- `npm run build`: generate production build.
- `npm run preview`: preview built app locally.
- `npm run typecheck`: run TypeScript checks.
- `npm run lint`: alias to `typecheck`.
- `npm run clean`: remove `dist`.

---

## License

This project is open source under the **MIT License**.

See [LICENSE](LICENSE) for details.

---

## Contributing

Contributions are welcome. Please review:

- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)

<div align="center">
  Built for real-time experimentation with graphics programming, interaction design, and performance engineering.
</div>
