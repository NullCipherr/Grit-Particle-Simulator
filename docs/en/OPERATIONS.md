# Operations

## Local Runbook

Install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build and Preview

```bash
npm run build
npm run preview
```

## Operational Checklist

- Ensure browser supports WebGL2.
- Validate `npm run typecheck` before shipping.
- Confirm pointer interactions on desktop and touch devices.
- Check FPS/particle counter under heavier presets.

## Known Runtime Constraints

- Browser-based simulation performance depends on GPU/driver quality.
- WebGL context can be lost by the browser under memory pressure.
- Extremely dense collision scenes will stress CPU-side physics.
