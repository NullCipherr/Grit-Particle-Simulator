# Performance

## Implemented Optimizations

- Spatial hash grid for local neighbor lookup.
- Throttled flocking and capped neighbor sets.
- Fixed-size reusable typed arrays in renderer upload path.
- Cached HSL-to-RGB palette to avoid repeated color conversions.
- Throttled UI updates (`UI_UPDATE_INTERVAL_MS`) to reduce React overhead.
- Device pixel ratio cap (`MAX_DPR`) to avoid over-rendering on high-DPI screens.

## Practical Tips

- Disable `collisions` and `flocking` to stress-test raw render throughput.
- Reduce browser zoom and background tab load for cleaner FPS readings.
- Start from low `particleSize` and lower `attraction/repulsion` for stable high counts.

## Future Improvements

- Optional worker-based physics update.
- Simple benchmark harness with reproducible spawn scenarios.
- GPU timer query instrumentation for render pass timing.
