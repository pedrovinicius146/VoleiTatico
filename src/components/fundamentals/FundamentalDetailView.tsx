import React, { Suspense, lazy, useState, useEffect } from 'react';
import { CourtTheme } from '../../types';
import {
  FundamentalData,
  FundamentalId,
  FundamentalStep,
} from '../../types/fundamentals';
import { FundamentalDidacticContent } from './FundamentalDidacticContent';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Heart,
  RotateCcw,
} from 'lucide-react';

// On-demand lazy loading of the Three.js 3D viewport for performance (Section 8)
const LazyFundamentals3DViewer = lazy(() =>
  import('./Fundamentals3DViewer').then((m) => ({
    default: m.Fundamentals3DViewer,
  }))
);

interface FundamentalDetailViewProps {
  fundamental: FundamentalData;
  allFundamentals: FundamentalData[];
  theme: CourtTheme;
  isCompleted: boolean;
  isFavorite: boolean;
  onBackToList: () => void;
  onSelectFundamental: (id: FundamentalId) => void;
  onToggleCompleted: (id: FundamentalId) => void;
  onToggleFavorite: (id: FundamentalId) => void;
  onRepeatLesson: (id: FundamentalId) => void;
}

export const FundamentalDetailView: React.FC<FundamentalDetailViewProps> = ({
  fundamental,
  allFundamentals,
  theme,
  isCompleted,
  isFavorite,
  onBackToList,
  onSelectFundamental,
  onToggleCompleted,
  onToggleFavorite,
  onRepeatLesson,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    fundamental.variants[0].id
  );
  const [activeStepNumber, setActiveStepNumber] = useState<number>(1);
  const [seekRequest, setSeekRequest] = useState<{
    time: number;
    seq: number;
  } | null>(null);
  const [resetSignal, setResetSignal] = useState<number>(0);

  // Reset variant when switching fundamental
  useEffect(() => {
    setSelectedVariantId(fundamental.variants[0].id);
    setActiveStepNumber(1);
    setSeekRequest(null);
  }, [fundamental]);

  const activeVariant =
    fundamental.variants.find((v) => v.id === selectedVariantId) ||
    fundamental.variants[0];

  const currentIdx = allFundamentals.findIndex((f) => f.id === fundamental.id);
  const prevFundamental = currentIdx > 0 ? allFundamentals[currentIdx - 1] : null;
  const nextFundamental =
    currentIdx >= 0 && currentIdx < allFundamentals.length - 1
      ? allFundamentals[currentIdx + 1]
      : null;

  const handleJumpToStep = (step: FundamentalStep) => {
    setActiveStepNumber(step.stepNumber);
    setSeekRequest((prev) => ({
      time: step.startTime,
      seq: (prev?.seq || 0) + 1,
    }));
  };

  const handleRepeatLesson = () => {
    setActiveStepNumber(1);
    setResetSignal((n) => n + 1);
    onRepeatLesson(fundamental.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Lesson Header & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <button
            type="button"
            onClick={onBackToList}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Todos os fundamentos</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleFavorite(fundamental.id)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isFavorite
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              <span>{isFavorite ? 'Favoritado' : 'Favoritar'}</span>
            </button>

            <button
              type="button"
              onClick={handleRepeatLesson}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Repetir aula</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleCompleted(fundamental.id)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-900 hover:bg-blue-700 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isCompleted ? 'Fundamento concluído' : 'Marcar como concluído'}
              </span>
            </button>
          </div>
        </div>

        {/* Title & Clean Metadata */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="tabular-nums">Aula 0{fundamental.order} de 07</span>
            <span aria-hidden="true">·</span>
            <span>{fundamental.difficulty}</span>
            <span aria-hidden="true">·</span>
            <span>{fundamental.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {fundamental.estimatedMinutes} min
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {fundamental.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
            {fundamental.shortDescription}
          </p>
        </div>

        {/* Technique Variant Selector (Switch between Saque por Baixo / Cima / Flutuante / Viagem etc.) */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
          <p className="text-xs font-bold text-slate-600">
            Selecione a técnica para demonstrar em 3D:
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {fundamental.variants.map((variant) => {
              const isSelected = variant.id === activeVariant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => {
                    setSelectedVariantId(variant.id);
                    setActiveStepNumber(1);
                    setSeekRequest(null);
                  }}
                  className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-700 border-blue-700 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {variant.name}
                </button>
              );
            })}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 pt-1">
            {activeVariant.description}
          </p>
        </div>
      </div>

      {/* Prominent 3D Interactive Stage + Controls */}
      <Suspense
        fallback={
          <div className="w-full h-[460px] rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-slate-300 gap-3">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold">
              Carregando arena e modelo 3D articulado...
            </p>
          </div>
        }
      >
        <LazyFundamentals3DViewer
          fundamental={fundamental}
          variant={activeVariant}
          theme={theme}
          onActiveStepChange={(step) => setActiveStepNumber(step.stepNumber)}
          externalSeekRequest={seekRequest}
          resetSignal={resetSignal}
        />
      </Suspense>

      {/* Tabbed Didactic Explanation */}
      <FundamentalDidacticContent
        fundamental={fundamental}
        activeVariant={activeVariant}
        activeStepNumber={activeStepNumber}
        onJumpToStep={handleJumpToStep}
      />

      {/* Previous / Next Fundamental Lesson Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {prevFundamental ? (
          <button
            type="button"
            onClick={() => onSelectFundamental(prevFundamental.id)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior: {prevFundamental.title}</span>
          </button>
        ) : (
          <div />
        )}

        {nextFundamental && (
          <button
            type="button"
            onClick={() => onSelectFundamental(nextFundamental.id)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Próximo: {nextFundamental.title}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
