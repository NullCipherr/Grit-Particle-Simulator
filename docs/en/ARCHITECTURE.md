# Architecture

## High-Level Design

The simulator is split into two major layers:

1. **UI orchestration layer** (`src/components`)
2. **Simulation + rendering layer** (`src/engine`)

This separation keeps rendering/physics logic independent from React rendering concerns.

## Runtime Flow

1. `main.tsx` mounts React.
2. `App.tsx` provides a full-screen container.
3. `ParticleSimulator.tsx` manages:
   - animation loop
   - pointer interactions
   - simulation state/config
   - overlay drawing for obstacles
4. `SpatialGrid` is rebuilt each frame for local neighbor queries.
5. Each `Particle` receives forces and resolves interactions.
6. `WebGLRenderer` uploads instance data and draws via `drawArraysInstanced`.

## Core Modules

- `Particle.ts`: force integration, flocking, collisions, lifetime, boundaries.
- `SpatialGrid.ts`: hashed grid to avoid global neighbor scans.
- `Obstacle.ts`: static circular colliders and overlay drawing.
- `WebGLRenderer.ts`: WebGL2 setup, shader compilation, frame passes, blend modes.

## State Boundaries

- React state is used for UI-level concerns and current config values.
- Engine state is held in refs/objects to avoid per-frame React re-renders.
- UI counters (`FPS`, particle count) are throttled to reduce update overhead.
