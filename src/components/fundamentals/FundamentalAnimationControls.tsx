import React from 'react';
import {
  FundamentalCameraPreset,
  FundamentalStep,
} from '../../types/fundamentals';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Minus,
  Plus,
  Gauge,
  Camera,
  Eye,
  Activity,
} from 'lucide-react';

interface FundamentalAnimationControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  currentTime: number;
  duration: number;
  onScrub: (time: number) => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  speed: number;
  onChangeSpeed: (nextSpeed: number) => void;
  activeCamera: FundamentalCameraPreset;
  onChangeCamera: (preset: FundamentalCameraPreset) => void;
  steps: FundamentalStep[];
  activeStepNumber: number;
  focusedStepNumber: number | null;
  onSelectStep: (step: FundamentalStep, loopFocused: boolean) => void;
  showBodyHighlight: boolean;
  onToggleBodyHighlight: () => void;
  showTrajectory: boolean;
  onToggleTrajectory: () => void;
}

const CAMERA_OPTIONS: { id: FundamentalCameraPreset; label: string }[] = [
  { id: 'arena', label: 'Arena 3/4' },
  { id: 'side', label: 'Lateral (Perfil)' },
  { id: 'front', label: 'Frente / Rede' },
  { id: 'top', label: 'Superior' },
  { id: 'feet', label: 'Base & Pés' },
];

const SPEED_PRESETS = [0.25, 0.5, 1.0, 1.5];

export const FundamentalAnimationControls: React.FC<
  FundamentalAnimationControlsProps
> = ({
  isPlaying,
  onTogglePlay,
  onRestart,
  currentTime,
  duration,
  onScrub,
  onStepBackward,
  onStepForward,
  speed,
  onChangeSpeed,
  activeCamera,
  onChangeCamera,
  steps,
  activeStepNumber,
  focusedStepNumber,
  onSelectStep,
  showBodyHighlight,
  onToggleBodyHighlight,
  showTrajectory,
  onToggleTrajectory,
}) => {
  const isSlowMotion = speed <= 0.5;

  const decreaseSpeed = () => {
    const next = Math.max(0.25, Number((speed - 0.25).toFixed(2)));
    onChangeSpeed(next);
  };

  const increaseSpeed = () => {
    const next = Math.min(2.0, Number((speed + 0.25).toFixed(2)));
    onChangeSpeed(next);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
      {/* Row 1: Timeline Scrubber with Time & Step Markers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Linha do tempo do movimento</span>
          <span className="font-mono tabular-nums text-amber-400">
            {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
          </span>
        </div>

        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={duration}
            step={0.01}
            value={Math.min(currentTime, duration)}
            onChange={(e) => onScrub(parseFloat(e.target.value))}
            aria-label="Linha do tempo da animação 3D"
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>
      </div>

      {/* Row 2: Main Playback + Speed & Slow-Motion Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Primary Transport Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Reproduzir</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onRestart}
            title="Reiniciar movimento do zero"
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar</span>
          </button>

          <div className="flex items-center bg-slate-800 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={onStepBackward}
              title="Retroceder movimento (quadro/etapa anterior)"
              aria-label="Retroceder movimento"
              className="min-h-[36px] px-2.5 rounded-lg hover:bg-slate-700 text-slate-200 inline-flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
            >
              <SkipBack className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Retroceder</span>
            </button>
            <button
              type="button"
              onClick={onStepForward}
              title="Avançar movimento (próximo quadro/etapa)"
              aria-label="Avançar movimento"
              className="min-h-[36px] px-2.5 rounded-lg hover:bg-slate-700 text-slate-200 inline-flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">Avançar</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Speed & Slow-motion Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onChangeSpeed(isSlowMotion ? 1.0 : 0.35)}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isSlowMotion
                ? 'bg-sky-600 border-sky-400 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Câmera Lenta {isSlowMotion ? '(Ativa)' : ''}</span>
          </button>

          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={decreaseSpeed}
              disabled={speed <= 0.25}
              aria-label="Diminuir velocidade"
              title="Diminuir velocidade"
              className="min-h-[34px] w-9 rounded-lg hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center text-slate-200 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="px-2 text-xs font-mono font-bold tabular-nums text-amber-300 min-w-[46px] text-center">
              {speed.toFixed(2).replace(/\.00$/, '.0')}x
            </span>

            <button
              type="button"
              onClick={increaseSpeed}
              disabled={speed >= 2.0}
              aria-label="Aumentar velocidade"
              title="Aumentar velocidade"
              className="min-h-[34px] w-9 rounded-lg hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center text-slate-200 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-1 bg-slate-800 rounded-xl p-1">
            {SPEED_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChangeSpeed(preset)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold tabular-nums transition-colors cursor-pointer ${
                  Math.abs(speed - preset) < 0.05
                    ? 'bg-slate-950 text-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {preset}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Camera Presets + Visual Aids Toggles */}
      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 inline-flex items-center gap-1.5 mr-1">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            Ângulo da câmera:
          </span>
          {CAMERA_OPTIONS.map((cam) => (
            <button
              key={cam.id}
              type="button"
              onClick={() => onChangeCamera(cam.id)}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeCamera === cam.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cam.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleBodyHighlight}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showBodyHighlight
                ? 'bg-emerald-950 border-emerald-500/70 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Destaque anatômico</span>
          </button>

          <button
            type="button"
            onClick={onToggleTrajectory}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showTrajectory
                ? 'bg-amber-950 border-amber-500/70 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Trajetória da bola</span>
          </button>
        </div>
      </div>

      {/* Row 4: Individual Step / Phase Focus Selector */}
      <div className="pt-3 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-300">
            Visualizar etapa individualmente:
          </span>
          {focusedStepNumber !== null && (
            <button
              type="button"
              onClick={() => onSelectStep(steps[0], false)}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 underline cursor-pointer"
            >
              Ver movimento completo
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {steps.map((step) => {
            const isCurrent = activeStepNumber === step.stepNumber;
            const isFocused = focusedStepNumber === step.stepNumber;
            return (
              <button
                key={step.stepNumber}
                type="button"
                onClick={() => onSelectStep(step, true)}
                className={`text-left p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isFocused
                    ? 'bg-amber-400/15 border-amber-400 text-white'
                    : isCurrent
                    ? 'bg-slate-800 border-blue-500/70 text-white'
                    : 'bg-slate-800/50 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-xs font-bold">
                  <span className="tabular-nums text-amber-400">
                    Etapa {step.stepNumber}
                  </span>
                  <span className="font-mono tabular-nums text-[11px] text-slate-400">
                    {step.startTime.toFixed(1)}s–{step.endTime.toFixed(1)}s
                  </span>
                </div>
                <p className="text-xs font-semibold mt-0.5 line-clamp-1">
                  {step.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
