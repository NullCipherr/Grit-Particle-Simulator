# Architecture

## High-Level Design

The simulator is split into two major layers:

1. **UI orchestration layer** (`src/components`)
2. **Simulation + rendering engine package** (`@nullcipherr/grit-engine`)

This separation keeps React concerns (UI, controls, layout) independent from simulation internals (physics, spatial indexing, and rendering).

## Runtime Flow

1. `main.tsx` mounts React.
2. `App.tsx` provides a full-screen container.
3. `ParticleSimulator.tsx` instantiates `GritEngine` with:
   - `canvas` and `overlayCanvas`
   - `SimConfig` values from UI state
   - stats callback (`onStats`) for FPS and particle count
4. UI interactions (pointer, obstacle mode, presets, pause/resume, clear) call imperative engine methods.
5. `@nullcipherr/grit-engine` executes the simulation loop and renders frames.

## Integration Boundary

- The app does not import engine internals directly.
- The contract is the public package API (`GritEngine`, `DEFAULT_SIM_CONFIG`, `SimConfig`).
- Engine internals are versioned and maintained in the dedicated engine repository.

## State Boundaries

- React state is used for UI-level concerns and current config values.
- Engine instance is held in `engineRef` to avoid per-frame React re-renders.
- UI counters (`FPS`, particle count) are throttled to reduce update overhead.
