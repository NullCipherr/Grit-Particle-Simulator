<div align="center">
  <h1>WebGL Particle Simulator</h1>
  <p><i>A real-time GPU-accelerated particle sandbox built with React, TypeScript, and WebGL2</i></p>

  <p>
    <a href="https://github.com/NullCipherr/WebGL-Particle-Simulator/actions/workflows/ci.yml"><img src="https://github.com/NullCipherr/WebGL-Particle-Simulator/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-1f6feb?style=flat-square" alt="License" /></a>
    <img src="https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-2f74c0?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/WebGL-2.0-111111?style=flat-square" alt="WebGL2" />
  </p>
</div>

---

## 🎥 Preview

<p align="center">
  <img src="./docs/demo.gif" width="800" />
</p>

---

## ⚡ Visão Geral

O **WebGL Particle Simulator** é uma aplicação interativa que simula sistemas de partículas em tempo real com aceleração via **WebGL2**.

A simulação é executada em um **motor imperativo independente**, enquanto o React atua exclusivamente como camada de interface e controle, garantindo alta performance e desacoplamento arquitetural.

O projeto combina computação gráfica, física em tempo real e otimizações de baixo nível para suportar grandes volumes de partículas com fluidez.

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

### 🖥️ Renderização via GPU (WebGL2)
- Instancing para renderização em lote
- Suporte a até **50.000 partículas**
- Trilhas com fade temporal entre frames
- Efeito de bloom opcional

### ⚙️ Física em tempo real
- Gravidade, atrito e forças dinâmicas
- Atração/repulsão baseada no ponteiro
- Colisões:
  - Partícula-partícula
  - Partícula-obstáculo
- Integração baseada em **delta time**

### 🚀 Otimizações de desempenho
- Spatial Hash Grid para busca eficiente de vizinhos *(O(n²) → O(n))*
- Reuso de buffers para evitar garbage collection
- Loop de simulação desacoplado da UI
- Minimização de draw calls via batching

### 🎮 Controles interativos
- Spawn de partículas via clique/arrasto
- Pausar / resetar simulação
- Criação de obstáculos dinâmicos
- Painel de controle com sliders e toggles

### 🎨 Biblioteca de presets
- `Nebula`
- `Black Hole`
- `Firestorm`
- `Quantum`
- `Cyberpunk`
- e outros modos visuais

---

## 🧠 Arquitetura do Sistema

O projeto é dividido em três camadas principais:

- **Engine (Simulação)**  
  Responsável por toda a lógica física, colisões e atualização de estado.  
  Totalmente desacoplada da interface.

- **Renderer (WebGL2)**  
  Gerencia buffers, shaders e draw calls.  
  Utiliza instancing para renderização altamente eficiente.

- **UI (React)**  
  Interface de controle e interação com o usuário.  
  Não interfere diretamente no loop da simulação.

---

## 📊 Performance

- Até **50.000 partículas** em tempo real
- ~60 FPS em máquinas modernas
- Redução de complexidade de colisão: **O(n²) → O(n)**
- Uso otimizado de memória com buffers reutilizáveis

---

## 🧩 Desafios Técnicos

- Evitar gargalo de colisões *(O(n²))* → uso de **Spatial Hash Grid**
- Minimizar garbage collection → reuso de estruturas de dados
- Separação entre loop imperativo e React
- Controle de estabilidade física com delta time
- Redução de draw calls com instancing

---

## 🔮 Roadmap

- [ ] Paralelização com Web Workers
- [ ] Migração para WebGPU
- [ ] Exportação de simulações (GIF / JSON)
- [ ] Editor de presets customizados
- [ ] Sistema de partículas em 3D


## Preview

- **Core**: React 19 + TypeScript
- **Build**: Vite 6
- **UI / Motion**: Tailwind CSS 4, Lucide, Motion
- **Rendering**: WebGL2
- **Deploy**: Cloudflare Pages

---

- Local URL: `http://localhost:3000`
- Main component: `src/components/ParticleSimulator.tsx`

---

## Overview

**WebGL Particle Simulator** is a browser-based physics sandbox focused on smooth real-time visuals and direct interaction.

The project is built around:

- A custom particle engine with configurable forces and collisions;
- GPU instanced rendering for high particle counts;
- Spatial partitioning (`SpatialGrid`) to reduce neighbor-search cost;
- Preset-driven behavior switching for experimentation;
- Lightweight CI (`typecheck + build`) and static deployment flow.

---

## Features

- **WebGL2 renderer** with instanced particles and optional bloom.
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
3. `ParticleSimulator.tsx` orchestrates UI, input, simulation loop, and metrics.
4. `Particle.ts` applies forces, flocking, collisions, boundaries, and life decay.
5. `SpatialGrid.ts` indexes particles each frame for local neighbor queries.
6. `WebGLRenderer.ts` uploads instance data and renders particles on GPU.
7. `SettingsPanel.tsx` updates `SimConfig` without polluting engine modules.

---

## Performance Notes

Current performance-focused decisions:

- Neighbor search via grid hashing instead of `O(n²)` full scans.
- Throttled flocking calculations (`~30Hz`) and capped neighbor counts.
- Reused temporary arrays to reduce GC pressure.
- GPU-side color lookup via precomputed hue palette.
- Fade pass and blend mode switching for visual trails/bloom.
- UI counters updated at intervals (not every frame) to avoid unnecessary React work.

For detailed guidance, see [Performance](docs/en/PERFORMANCE.md).

---

## Technical Decisions

- **Separated engine primitives** (`engine/`) from UI components.
- **Declarative config contract** through `SimConfig` type.
- **WebGL context resilience** with context lost/restored handlers.
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
- **Rendering**: WebGL2 (custom renderer)
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
│   ├── engine/
│   │   ├── Obstacle.ts
│   │   ├── Particle.ts
│   │   ├── SpatialGrid.ts
│   │   └── WebGLRenderer.ts
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
- [Guia em Português](docs/pt-br/DEPLOYMENT.md)

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

<div align="center">
  <p>Desenvolvido por <a href="https://github.com/NullCipherr">Andrei Costa</a></p>

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
