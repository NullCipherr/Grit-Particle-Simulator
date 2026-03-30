# Simulation Model

## Configuration Contract

`SimConfig` fields:

- `gravity`
- `friction`
- `attraction`
- `repulsion`
- `particleLife`
- `particleSize`
- `vortex`
- `bloom`
- `flocking`
- `collisions`
- `obstacleMode`

## Update Pipeline per Particle

1. Pointer force (attraction/repulsion + optional vortex)
2. Flocking (alignment + cohesion)
3. Particle-particle collision resolution
4. Obstacle collision resolution
5. Euler integration with delta time
6. Boundary response + life decay

## Interaction Modes

- **Spawn mode**: click/drag creates particles in batches.
- **Obstacle mode**: click places circular static barriers.

## Presets

Presets are defined in `src/constants/presets.ts` and map style/behavior profiles to partial config objects.
