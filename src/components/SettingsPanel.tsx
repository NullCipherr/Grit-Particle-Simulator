/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { X, Sliders } from 'lucide-react';
import { SimConfig } from '../types/simulation';

type NumericConfigKey = 'gravity' | 'attraction' | 'friction' | 'particleSize';
type BooleanConfigKey = 'vortex' | 'bloom' | 'flocking' | 'collisions' | 'obstacleMode';

interface SettingsPanelProps {
  config: SimConfig;
  setConfig: React.Dispatch<React.SetStateAction<SimConfig>>;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, setConfig, onClose }) => {
  const numericControls: Array<{
    label: string;
    key: NumericConfigKey;
    min: number;
    max: number;
    step: number;
  }> = [
    { label: 'Gravity', key: 'gravity', min: -0.5, max: 0.5, step: 0.01 },
    { label: 'Attraction', key: 'attraction', min: 0, max: 50, step: 1 },
    { label: 'Friction', key: 'friction', min: 0.9, max: 1, step: 0.01 },
    { label: 'Size', key: 'particleSize', min: 1, max: 10, step: 1 }
  ];

  const booleanControls: Array<{ label: string; key: BooleanConfigKey }> = [
    { label: 'Vortex Mode', key: 'vortex' },
    { label: 'Bloom Effect', key: 'bloom' },
    { label: 'Flocking (AI)', key: 'flocking' },
    { label: 'Collisions', key: 'collisions' },
    { label: 'Obstacle Mode', key: 'obstacleMode' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      role="dialog"
      aria-modal="false"
      aria-label="Painel de parâmetros da simulação"
      className="absolute right-6 top-44 z-20 w-72 bg-[#1d1f29]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl pointer-events-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#668aff]" />
          <h2 className="text-white font-medium">Parameters</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/30 hover:text-white"
          aria-label="Fechar painel de parâmetros"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-5">
        <fieldset className="space-y-5">
          <legend className="sr-only">Ajustes numéricos da simulação</legend>
          {numericControls.map((item) => {
            const inputId = `sim-config-${item.key}`;
            return (
              <div key={item.key} className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase tracking-wider text-white/40">
                  <label htmlFor={inputId}>{item.label}</label>
                  <span>{config[item.key]}</span>
                </div>
                <input
                  id={inputId}
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={config[item.key]}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setConfig((prev) => ({ ...prev, [item.key]: value }));
                  }}
                  className="w-full accent-[#668aff] bg-white/5 rounded-lg h-1 appearance-none cursor-pointer"
                />
              </div>
            );
          })}
        </fieldset>

        <fieldset className="flex flex-col gap-3 pt-2">
          <legend className="sr-only">Ajustes booleanos da simulação</legend>
          {booleanControls.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-white/40">{item.label}</span>
              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                }
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  config[item.key] ? 'bg-[#668aff]' : 'bg-white/10'
                }`}
                aria-label={`Alternar ${item.label}`}
                aria-pressed={config[item.key]}
              >
                <motion.div
                  animate={{ x: config[item.key] ? 20 : 2 }}
                  className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
          ))}
        </fieldset>
      </div>
    </motion.div>
  );
};
