type SpawnPoint = {
  x: number;
  y: number;
};

type BuildSpawnPlanPayload = {
  requestId: number;
  type: 'buildSpawnPlan';
  frames: number;
  width: number;
  height: number;
  pattern: 'ring' | 'cross' | 'spiral';
};

type AnalyzeSamplesPayload = {
  requestId: number;
  type: 'analyzeSamples';
  fpsSamples: number[];
  particleSamples: number[];
};

type IncomingPayload = BuildSpawnPlanPayload | AnalyzeSamplesPayload;

const buildPointForFrame = (
  frame: number,
  width: number,
  height: number,
  pattern: 'ring' | 'cross' | 'spiral'
): SpawnPoint => {
  const cx = width / 2;
  const cy = height / 2;
  const minDimension = Math.max(32, Math.min(width, height));

  if (pattern === 'cross') {
    const axis = frame % 4;
    const offset = ((frame % 20) / 20) * minDimension * 0.3;
    if (axis === 0) return { x: cx + offset, y: cy };
    if (axis === 1) return { x: cx - offset, y: cy };
    if (axis === 2) return { x: cx, y: cy + offset };
    return { x: cx, y: cy - offset };
  }

  if (pattern === 'spiral') {
    const angle = frame * 0.35;
    const radius = Math.min(minDimension * 0.4, 18 + frame * 1.4);
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius
    };
  }

  const angle = frame * 0.45;
  const radius = minDimension * 0.22;
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius
  };
};

const computeStats = (values: number[]) => {
  if (values.length === 0) {
    return { average: 0, min: 0, max: 0 };
  }

  let sum = 0;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const value of values) {
    sum += value;
    if (value < min) min = value;
    if (value > max) max = value;
  }

  return {
    average: Number((sum / values.length).toFixed(1)),
    min: Number(min.toFixed(1)),
    max: Number(max.toFixed(1))
  };
};

self.onmessage = (event: MessageEvent<IncomingPayload>) => {
  const payload = event.data;

  if (payload.type === 'buildSpawnPlan') {
    const points = Array.from({ length: payload.frames }, (_, frame) =>
      buildPointForFrame(frame, payload.width, payload.height, payload.pattern)
    );
    self.postMessage({
      requestId: payload.requestId,
      type: 'buildSpawnPlanResult',
      points
    });
    return;
  }

  if (payload.type === 'analyzeSamples') {
    self.postMessage({
      requestId: payload.requestId,
      type: 'analyzeSamplesResult',
      fps: computeStats(payload.fpsSamples),
      particles: computeStats(payload.particleSamples)
    });
  }
};
