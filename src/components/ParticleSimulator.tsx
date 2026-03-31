/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  MousePointer2,
  Sparkles,
  Settings,
  Shield,
  ChevronDown,
  Layers,
  Keyboard,
  HelpCircle,
  Download,
  Upload,
  Gauge,
  Cpu
} from 'lucide-react';
import { GritEngine, DEFAULT_SIM_CONFIG, type SimConfig } from '@nullcipherr/grit-engine';

import { PRESETS } from '../constants/presets';
import { SettingsPanel } from './SettingsPanel';

const MAX_PARTICLES = 50_000;
const MAX_DPR = 2;

type BenchmarkScenario = {
  id: string;
  label: string;
  presetKey: string;
  durationMs: number;
  tickMs: number;
  spawnsPerTick: number;
  pattern: 'ring' | 'cross' | 'spiral';
};

type BenchmarkScenarioResult = {
  id: string;
  label: string;
  presetKey: string;
  fps: {
    average: number;
    min: number;
    max: number;
  };
  particles: {
    average: number;
    min: number;
    max: number;
  };
};

type BenchmarkReport = {
  generatedAt: string;
  workerAssistEnabled: boolean;
  scenarios: BenchmarkScenarioResult[];
};

type WorkerBuildSpawnPlanRequest = {
  type: 'buildSpawnPlan';
  frames: number;
  width: number;
  height: number;
  pattern: 'ring' | 'cross' | 'spiral';
};

type WorkerAnalyzeSamplesRequest = {
  type: 'analyzeSamples';
  fpsSamples: number[];
  particleSamples: number[];
};

type WorkerRequest = WorkerBuildSpawnPlanRequest | WorkerAnalyzeSamplesRequest;

const BENCHMARK_SCENARIOS: BenchmarkScenario[] = [
  {
    id: 'baseline-nebula',
    label: 'Baseline Nebula',
    presetKey: 'nebula',
    durationMs: 5000,
    tickMs: 80,
    spawnsPerTick: 1,
    pattern: 'ring'
  },
  {
    id: 'collision-stress',
    label: 'Collision Stress',
    presetKey: 'pulse',
    durationMs: 5000,
    tickMs: 60,
    spawnsPerTick: 2,
    pattern: 'cross'
  },
  {
    id: 'vortex-heavy',
    label: 'Vortex Heavy',
    presetKey: 'blackhole',
    durationMs: 5000,
    tickMs: 60,
    spawnsPerTick: 2,
    pattern: 'spiral'
  }
];

const NUMERIC_CONFIG_KEYS: Array<keyof Pick<SimConfig, 'gravity' | 'friction' | 'attraction' | 'repulsion' | 'particleLife' | 'particleSize'>> = [
  'gravity',
  'friction',
  'attraction',
  'repulsion',
  'particleLife',
  'particleSize'
];

const BOOLEAN_CONFIG_KEYS: Array<keyof Pick<SimConfig, 'vortex' | 'bloom' | 'flocking' | 'collisions' | 'obstacleMode'>> = [
  'vortex',
  'bloom',
  'flocking',
  'collisions',
  'obstacleMode'
];

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const sanitizeImportedConfig = (input: unknown): Partial<SimConfig> | null => {
  if (!input || typeof input !== 'object') return null;

  const candidate = input as Record<string, unknown>;
  const output: Partial<SimConfig> = {};

  for (const key of NUMERIC_CONFIG_KEYS) {
    const value = candidate[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      output[key] = value;
    }
  }

  for (const key of BOOLEAN_CONFIG_KEYS) {
    const value = candidate[key];
    if (typeof value === 'boolean') {
      output[key] = value;
    }
  }

  return Object.keys(output).length > 0 ? output : null;
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

const localSpawnPointForFrame = (
  frame: number,
  width: number,
  height: number,
  pattern: 'ring' | 'cross' | 'spiral'
) => {
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

export const ParticleSimulator: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const engineRef = useRef<GritEngine | null>(null);
  const benchmarkAbortRef = useRef(false);
  const toastTimeoutRef = useRef<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const workerRequestIdRef = useRef(1);
  const workerPendingMapRef = useRef(new Map<number, (payload: any) => void>());

  const [config, setConfig] = useState<SimConfig>(DEFAULT_SIM_CONFIG);
  const [particleCount, setParticleCount] = useState(0);
  const [fps, setFps] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('nebula');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [benchmarkRunning, setBenchmarkRunning] = useState(false);
  const [benchmarkReport, setBenchmarkReport] = useState<BenchmarkReport | null>(null);
  const [useWorkerAssist, setUseWorkerAssist] = useState(false);

  const presetKeys = useMemo(() => Object.keys(PRESETS), []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  }, []);

  const applyPreset = useCallback((key: string) => {
    const preset = PRESETS[key];
    if (!preset) return;

    const { label: _label, icon: _icon, ...presetConfig } = preset;
    setConfig((prev) => ({
      ...prev,
      ...presetConfig
    }));
    setActivePreset(key);
  }, []);

  const cyclePreset = useCallback((direction: -1 | 1) => {
    if (presetKeys.length === 0) return;
    const currentIndex = presetKeys.indexOf(activePreset);
    const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeCurrentIndex + direction + presetKeys.length) % presetKeys.length;
    applyPreset(presetKeys[nextIndex]);
  }, [activePreset, applyPreset, presetKeys]);

  const clearSimulation = useCallback(() => {
    engineRef.current?.clear();
  }, []);

  const toggleObstacleMode = useCallback(() => {
    setConfig((prev) => {
      const nextObstacleMode = !prev.obstacleMode;
      if (nextObstacleMode) {
        engineRef.current?.clearPointer();
      }
      return { ...prev, obstacleMode: nextObstacleMode };
    });
  }, []);

  const togglePause = useCallback(() => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    engineRef.current?.setPaused(nextPaused);
  }, [isPaused]);

  const requestWorker = useCallback((request: WorkerRequest): Promise<any> => {
    const worker = workerRef.current;
    if (!worker) {
      return Promise.reject(new Error('Worker auxiliar indisponível no navegador atual.'));
    }

    const requestId = workerRequestIdRef.current++;
    return new Promise((resolve, reject) => {
      workerPendingMapRef.current.set(requestId, resolve);
      worker.postMessage({ requestId, ...request });

      window.setTimeout(() => {
        if (workerPendingMapRef.current.has(requestId)) {
          workerPendingMapRef.current.delete(requestId);
          reject(new Error('Timeout aguardando resposta do worker.'));
        }
      }, 3000);
    });
  }, []);

  const exportCurrentPreset = useCallback(() => {
    const payload = {
      name: PRESETS[activePreset]?.label ?? 'Custom Preset',
      sourcePresetKey: activePreset,
      exportedAt: new Date().toISOString(),
      config
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const safeName = payload.name.toLowerCase().replace(/\s+/g, '-');
    link.href = URL.createObjectURL(blob);
    link.download = `preset-${safeName}.json`;
    link.click();
    URL.revokeObjectURL(link.href);

    showToast('Preset exportado em JSON.');
  }, [activePreset, config, showToast]);

  const importPresetFromFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const sourceConfig = (parsed && typeof parsed === 'object' && 'config' in parsed)
        ? (parsed as { config: unknown }).config
        : parsed;
      const importedConfig = sanitizeImportedConfig(sourceConfig);

      if (!importedConfig) {
        throw new Error('Arquivo inválido: nenhum campo de configuração reconhecido.');
      }

      setConfig((prev) => ({ ...prev, ...importedConfig }));
      setActivePreset('custom');
      showToast('Preset importado com sucesso.');
    } catch (error) {
      console.error('Falha ao importar preset', error);
      showToast('Falha ao importar preset JSON.');
    } finally {
      event.target.value = '';
    }
  }, [showToast]);

  const getPointerPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return null;

    const rect = overlayCanvas.getBoundingClientRect();
    const clientX =
      'touches' in e ? e.touches[0]?.clientX ?? 0 : (e as React.MouseEvent).clientX;
    const clientY =
      'touches' in e ? e.touches[0]?.clientY ?? 0 : (e as React.MouseEvent).clientY;

    const scaleX = rect.width > 0 ? overlayCanvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? overlayCanvas.height / rect.height : 1;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      e.preventDefault();
    }

    const engine = engineRef.current;
    const pos = getPointerPosition(e);
    if (!engine || !pos) return;

    if (config.obstacleMode) {
      engine.clearPointer();
      return;
    }

    engine.setPointer(pos.x, pos.y);

    if (('buttons' in e && e.buttons === 1) || 'touches' in e) {
      engine.spawnAt(pos.x, pos.y);
    }
  }, [config.obstacleMode, getPointerPosition]);

  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      e.preventDefault();
    }

    const engine = engineRef.current;
    const pos = getPointerPosition(e);
    if (!engine || !pos) return;

    if (config.obstacleMode) {
      engine.addObstacle(pos.x, pos.y);
      engine.clearPointer();
      return;
    }

    engine.setPointer(pos.x, pos.y);
    engine.spawnAt(pos.x, pos.y);
  }, [config.obstacleMode, getPointerPosition]);

  const handlePointerLeave = useCallback(() => {
    engineRef.current?.clearPointer();
  }, []);

  const runBenchmark = useCallback(async () => {
    if (benchmarkRunning) {
      benchmarkAbortRef.current = true;
      return;
    }

    const engine = engineRef.current;
    const canvas = canvasRef.current;

    if (!engine || !canvas) {
      showToast('Engine não inicializada para benchmark.');
      return;
    }

    setBenchmarkRunning(true);
    benchmarkAbortRef.current = false;
    setBenchmarkReport(null);
    setIsPaused(false);
    engine.setPaused(false);

    const scenarioResults: BenchmarkScenarioResult[] = [];

    try {
      for (const scenario of BENCHMARK_SCENARIOS) {
        if (benchmarkAbortRef.current) {
          break;
        }

        engine.clear();
        applyPreset(scenario.presetKey);
        await sleep(160);

        const frames = Math.max(1, Math.floor(scenario.durationMs / scenario.tickMs));
        const fpsSamples: number[] = [];
        const particleSamples: number[] = [];

        let spawnPlan: Array<{ x: number; y: number }> = [];
        if (useWorkerAssist) {
          try {
            const response = await requestWorker({
              type: 'buildSpawnPlan',
              frames,
              width: canvas.width,
              height: canvas.height,
              pattern: scenario.pattern
            });
            if (Array.isArray(response.points)) {
              spawnPlan = response.points;
            }
          } catch (error) {
            console.warn('Worker assist indisponível para spawn plan, usando fallback local.', error);
          }
        }

        for (let frame = 0; frame < frames; frame += 1) {
          if (benchmarkAbortRef.current) {
            break;
          }

          const point = spawnPlan[frame] ?? localSpawnPointForFrame(frame, canvas.width, canvas.height, scenario.pattern);

          for (let i = 0; i < scenario.spawnsPerTick; i += 1) {
            const jitter = i === 0 ? 0 : (Math.random() - 0.5) * 12;
            engine.spawnAt(point.x + jitter, point.y - jitter);
          }

          const stats = engine.getStats();
          fpsSamples.push(stats.fps);
          particleSamples.push(stats.particleCount);

          await sleep(scenario.tickMs);
        }

        let fpsResult = computeStats(fpsSamples);
        let particleResult = computeStats(particleSamples);

        if (useWorkerAssist) {
          try {
            const analyzed = await requestWorker({
              type: 'analyzeSamples',
              fpsSamples,
              particleSamples
            });
            if (analyzed?.fps && analyzed?.particles) {
              fpsResult = analyzed.fps;
              particleResult = analyzed.particles;
            }
          } catch (error) {
            console.warn('Worker assist indisponível para análise de benchmark, mantendo análise local.', error);
          }
        }

        scenarioResults.push({
          id: scenario.id,
          label: scenario.label,
          presetKey: scenario.presetKey,
          fps: fpsResult,
          particles: particleResult
        });
      }

      if (scenarioResults.length > 0) {
        const report: BenchmarkReport = {
          generatedAt: new Date().toISOString(),
          workerAssistEnabled: useWorkerAssist,
          scenarios: scenarioResults
        };
        setBenchmarkReport(report);
        showToast('Benchmark concluído.');
      } else if (benchmarkAbortRef.current) {
        showToast('Benchmark interrompido.');
      }
    } finally {
      setBenchmarkRunning(false);
      benchmarkAbortRef.current = false;
    }
  }, [applyPreset, benchmarkRunning, requestWorker, showToast, useWorkerAssist]);

  const exportBenchmarkReport = useCallback(() => {
    if (!benchmarkReport) {
      showToast('Execute um benchmark antes de exportar.');
      return;
    }

    const blob = new Blob([JSON.stringify(benchmarkReport, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `benchmark-report-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(link.href);

    showToast('Relatório de benchmark exportado.');
  }, [benchmarkReport, showToast]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    if (!canvas || !overlayCanvas || engineRef.current) {
      return;
    }

    try {
      const engine = new GritEngine({
        canvas,
        overlayCanvas,
        maxParticles: MAX_PARTICLES,
        maxDpr: MAX_DPR,
        config,
        onStats: ({ particleCount: nextParticleCount, fps: nextFps }) => {
          setParticleCount(nextParticleCount);
          setFps(nextFps);
        }
      });

      engine.start();
      engineRef.current = engine;
    } catch (error) {
      console.error('Falha ao inicializar engine de renderização', error);
      setErrorMessage('A engine não pôde ser inicializada neste navegador.');
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      engineRef.current?.resize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      engineRef.current?.dispose();
      engineRef.current = null;
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    engineRef.current?.updateSettings(config);
  }, [config]);

  useEffect(() => {
    if (!config.obstacleMode) return;
    engineRef.current?.clearPointer();
  }, [config.obstacleMode]);

  useEffect(() => {
    if (typeof Worker === 'undefined') {
      return;
    }

    const worker = new Worker(new URL('../workers/simulationAssistant.worker.ts', import.meta.url), {
      type: 'module'
    });

    worker.onmessage = (event: MessageEvent<any>) => {
      const payload = event.data;
      const requestId = payload?.requestId;
      if (typeof requestId !== 'number') return;

      const resolver = workerPendingMapRef.current.get(requestId);
      if (!resolver) return;

      workerPendingMapRef.current.delete(requestId);
      resolver(payload);
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
      workerPendingMapRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      if (isTyping) return;

      if (event.key === ' ') {
        event.preventDefault();
        togglePause();
        return;
      }

      if (event.key.toLowerCase() === 'r') {
        clearSimulation();
        showToast('Simulação limpa.');
        return;
      }

      if (event.key.toLowerCase() === 'o') {
        toggleObstacleMode();
        return;
      }

      if (event.key.toLowerCase() === 's') {
        setShowSettings((prev) => !prev);
        return;
      }

      if (event.key.toLowerCase() === 'h' || event.key === '?') {
        setShowHelp((prev) => !prev);
        return;
      }

      if (event.key === 'ArrowRight') {
        cyclePreset(1);
        return;
      }

      if (event.key === 'ArrowLeft') {
        cyclePreset(-1);
        return;
      }

      if (event.key.toLowerCase() === 'b') {
        void runBenchmark();
        return;
      }

      if (event.key === 'Escape') {
        setShowHelp(false);
        setShowPresets(false);
        setShowSettings(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [clearSimulation, cyclePreset, runBenchmark, showToast, toggleObstacleMode, togglePause]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#11131c] overflow-hidden flex flex-col"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <canvas
        ref={overlayCanvasRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerLeave}
        className="absolute inset-0 w-full h-full cursor-crosshair"
      />

      <div className="relative z-10 p-6 flex justify-between items-start pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl pointer-events-auto shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-1">
            <Sparkles className="w-5 h-5 text-[#668aff]" />
            <h1 className="text-white font-medium tracking-tight">Grit Engine</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest">
              Live: <span className="text-[#668aff]">{particleCount}</span>
            </p>
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest">
              FPS: <span className="text-[#4cd137]">{fps}</span>
            </p>
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest">
              Preset: <span className="text-[#9c87bc]">{activePreset}</span>
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-2"
            role="toolbar"
            aria-label="Controles principais da simulação"
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPresets((prev) => !prev)}
                aria-label="Abrir lista de presets"
                aria-expanded={showPresets}
                aria-controls="preset-menu"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all active:scale-95 backdrop-blur-xl h-full ${
                  showPresets
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <Layers size={18} className="text-[#9c87bc]" />
                <span className="text-xs font-medium uppercase tracking-wider hidden sm:inline">
                  {PRESETS[activePreset]?.label || 'Presets'}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${showPresets ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {showPresets && (
                  <motion.div
                    id="preset-menu"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-[#1d1f29]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 grid grid-cols-1 gap-2"
                  >
                    <div className="max-h-[42vh] overflow-y-auto custom-scrollbar">
                      {Object.entries(PRESETS).map(([key, preset]) => (
                        <button
                          type="button"
                          key={key}
                          onClick={() => {
                            applyPreset(key);
                            setShowPresets(false);
                          }}
                          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all ${
                            activePreset === key
                              ? 'bg-[#668aff]/20 text-[#668aff]'
                              : 'hover:bg-white/5 text-white/60 hover:text-white'
                          }`}
                          aria-label={`Aplicar preset ${preset.label}`}
                        >
                          <preset.icon size={16} />
                          <span className="text-[11px] font-medium uppercase tracking-wider">
                            {preset.label}
                          </span>
                          {activePreset === key && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#668aff]" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                      <button
                        type="button"
                        onClick={exportCurrentPreset}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-white/80 hover:text-white bg-white/5 hover:bg-white/10"
                        aria-label="Exportar preset atual em JSON"
                      >
                        <Download size={14} />
                        Export
                      </button>
                      <button
                        type="button"
                        onClick={() => importInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-white/80 hover:text-white bg-white/5 hover:bg-white/10"
                        aria-label="Importar preset em JSON"
                      >
                        <Upload size={14} />
                        Import
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={toggleObstacleMode}
              className={`p-3 backdrop-blur-xl border border-white/10 rounded-xl text-white transition-all active:scale-95 ${
                config.obstacleMode ? 'bg-[#ff6b6b]' : 'bg-white/5 hover:bg-white/10'
              }`}
              title="Modo obstáculo"
              aria-label="Alternar modo obstáculo"
              aria-pressed={config.obstacleMode}
            >
              <Shield size={20} />
            </button>

            <button
              type="button"
              onClick={togglePause}
              className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all active:scale-95"
              aria-label={isPaused ? 'Retomar simulação' : 'Pausar simulação'}
              aria-pressed={isPaused}
            >
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
            </button>

            <button
              type="button"
              onClick={() => {
                clearSimulation();
                showToast('Simulação limpa.');
              }}
              className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all active:scale-95"
              aria-label="Limpar partículas e obstáculos"
            >
              <RotateCcw size={20} />
            </button>

            <button
              type="button"
              onClick={() => setShowSettings((prev) => !prev)}
              className={`p-3 backdrop-blur-xl border border-white/10 rounded-xl text-white transition-all active:scale-95 ${
                showSettings ? 'bg-[#668aff]' : 'bg-white/5 hover:bg-white/10'
              }`}
              aria-label="Abrir ou fechar painel de configurações"
              aria-expanded={showSettings}
              aria-controls="settings-panel"
            >
              <Settings size={20} />
            </button>

            <button
              type="button"
              onClick={() => setShowHelp((prev) => !prev)}
              className={`p-3 backdrop-blur-xl border border-white/10 rounded-xl text-white transition-all active:scale-95 ${
                showHelp ? 'bg-[#34d399]' : 'bg-white/5 hover:bg-white/10'
              }`}
              aria-label="Mostrar ajuda rápida"
              aria-pressed={showHelp}
            >
              <HelpCircle size={20} />
            </button>

            <button
              type="button"
              onClick={() => void runBenchmark()}
              className={`p-3 backdrop-blur-xl border border-white/10 rounded-xl text-white transition-all active:scale-95 ${
                benchmarkRunning ? 'bg-[#f59f00]' : 'bg-white/5 hover:bg-white/10'
              }`}
              aria-label={benchmarkRunning ? 'Parar benchmark' : 'Executar benchmark'}
              aria-pressed={benchmarkRunning}
            >
              <Gauge size={20} />
            </button>
          </motion.div>

          <div className="flex items-center gap-2 bg-[#1d1f29]/70 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-xl">
            <Cpu size={14} className={useWorkerAssist ? 'text-[#34d399]' : 'text-white/40'} />
            <label htmlFor="worker-assist" className="text-[10px] uppercase tracking-wider text-white/60">
              Worker Assist
            </label>
            <button
              id="worker-assist"
              type="button"
              onClick={() => setUseWorkerAssist((prev) => !prev)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                useWorkerAssist ? 'bg-[#34d399]' : 'bg-white/15'
              }`}
              aria-label="Alternar etapa opcional assistida por worker"
              aria-pressed={useWorkerAssist}
            >
              <motion.div
                animate={{ x: useWorkerAssist ? 20 : 2 }}
                className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>
        </div>
      </div>

      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={importPresetFromFile}
      />

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 bg-red-500/20 backdrop-blur-xl border border-red-500/50 px-6 py-3 rounded-2xl text-white text-sm font-medium shadow-2xl"
          >
            {errorMessage}
          </motion.div>
        )}

        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="absolute bottom-10 right-6 z-50 bg-[#11131c]/85 backdrop-blur-xl border border-white/15 px-4 py-2 rounded-xl text-white text-xs font-medium shadow-2xl"
          >
            {toastMessage}
          </motion.div>
        )}

        {showSettings && (
          <div id="settings-panel">
            <SettingsPanel
              config={config}
              setConfig={setConfig}
              onClose={() => setShowSettings(false)}
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute left-6 bottom-6 z-20 w-[min(90vw,360px)] bg-[#1d1f29]/88 border border-white/10 rounded-2xl p-4 text-white/80 backdrop-blur-2xl shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <Keyboard size={15} className="text-[#34d399]" />
              <p className="text-xs uppercase tracking-wider text-white/90">Ajuda rápida</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <p><span className="text-white">Espaço</span> pausar/retomar</p>
              <p><span className="text-white">R</span> limpar cena</p>
              <p><span className="text-white">O</span> modo obstáculo</p>
              <p><span className="text-white">S</span> abrir ajustes</p>
              <p><span className="text-white">H</span> abrir ajuda</p>
              <p><span className="text-white">B</span> benchmark</p>
              <p><span className="text-white">← / →</span> trocar preset</p>
              <p><span className="text-white">Esc</span> fechar painéis</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {benchmarkReport && !benchmarkRunning && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="absolute left-6 top-28 z-20 w-[min(92vw,420px)] bg-[#1d1f29]/88 border border-white/10 rounded-2xl p-4 text-white/80 backdrop-blur-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/90">Benchmark</p>
                <p className="text-[10px] text-white/50">
                  {new Date(benchmarkReport.generatedAt).toLocaleString('pt-BR')} · Worker assist: {benchmarkReport.workerAssistEnabled ? 'ON' : 'OFF'}
                </p>
              </div>
              <button
                type="button"
                onClick={exportBenchmarkReport}
                className="px-3 py-1.5 rounded-lg text-[11px] text-white/80 hover:text-white bg-white/5 hover:bg-white/10"
              >
                Exportar JSON
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              {benchmarkReport.scenarios.map((scenario) => (
                <div key={scenario.id} className="rounded-xl bg-white/5 border border-white/10 p-2.5">
                  <p className="text-white/90 font-medium">{scenario.label}</p>
                  <p className="text-white/50">Preset: {scenario.presetKey}</p>
                  <p className="text-white/70">
                    FPS avg/min/max: {scenario.fps.average} / {scenario.fps.min} / {scenario.fps.max}
                  </p>
                  <p className="text-white/70">
                    Partículas avg/min/max: {scenario.particles.average} / {scenario.particles.min} / {scenario.particles.max}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {particleCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center gap-4 text-white/20">
              <MousePointer2 className="w-8 h-8 animate-pulse" />
              <p className="text-xs font-medium uppercase tracking-[0.3em]">
                {config.obstacleMode ? 'Clique para criar obstáculos' : 'Arraste para gerar partículas'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParticleSimulator;
