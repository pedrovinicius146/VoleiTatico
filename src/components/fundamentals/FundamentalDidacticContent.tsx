import React, { useState } from 'react';
import {
  FundamentalData,
  FundamentalStep,
  FundamentalTechniqueVariant,
} from '../../types/fundamentals';
import {
  BookOpen,
  AlertCircle,
  Dumbbell,
  CheckCircle2,
  Play,
  Lightbulb,
} from 'lucide-react';

interface FundamentalDidacticContentProps {
  fundamental: FundamentalData;
  activeVariant: FundamentalTechniqueVariant;
  activeStepNumber: number;
  onJumpToStep: (step: FundamentalStep) => void;
}

type DidacticTab = 'execution' | 'errors_tips' | 'drills';

export const FundamentalDidacticContent: React.FC<
  FundamentalDidacticContentProps
> = ({ fundamental, activeVariant, activeStepNumber, onJumpToStep }) => {
  const [activeTab, setActiveTab] = useState<DidacticTab>('execution');

  const { didactic } = fundamental;

  return (
    <section
      aria-label="Conteúdo didático do fundamento"
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
    >
      {/* Section Tabs (prevents information overload) */}
      <div className="border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('execution')}
          className={`min-h-[44px] px-4 py-2.5 text-sm font-bold border-b-2 inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeTab === 'execution'
              ? 'border-blue-700 text-blue-800 bg-white rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Como Executar &amp; Postura</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('errors_tips')}
          className={`min-h-[44px] px-4 py-2.5 text-sm font-bold border-b-2 inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeTab === 'errors_tips'
              ? 'border-blue-700 text-blue-800 bg-white rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Principais Erros &amp; Dicas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('drills')}
          className={`min-h-[44px] px-4 py-2.5 text-sm font-bold border-b-2 inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeTab === 'drills'
              ? 'border-blue-700 text-blue-800 bg-white rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Exercícios Práticos</span>
        </button>
      </div>

      {/* Tab 1: Como Executar, Posicionamento Corporal e Passo a Passo Sincronizado */}
      {activeTab === 'execution' && (
        <div className="p-5 sm:p-8 space-y-8">
          {/* Como Executar */}
          <div className="max-w-3xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Como executar
            </h3>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {didactic.howToExecute}
            </p>
          </div>

          <hr className="border-slate-200" />

          {/* Posicionamento Corporal */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Posicionamento corporal
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Ajustes biomecânicos de pernas, tronco, braços e foco visual.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Pernas e Pés (Base)
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {didactic.bodyPositioning.legsAndFeet}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Tronco e Centro de Gravidade
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {didactic.bodyPositioning.torsoAndCore}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Braços e Mãos
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {didactic.bodyPositioning.armsAndHands}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Visão e Tempo de Bola
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {didactic.bodyPositioning.visionAndTiming}
                </p>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Execução Passo a Passo Sincronizada com a Animação 3D */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Execução passo a passo — {activeVariant.name}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Clique em qualquer etapa para posicionar a animação 3D
                  exatamente nesse momento.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {activeVariant.steps.map((step) => {
                const isActive = step.stepNumber === activeStepNumber;
                return (
                  <button
                    key={step.stepNumber}
                    type="button"
                    onClick={() => onJumpToStep(step)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors flex items-start gap-4 cursor-pointer ${
                      isActive
                        ? 'bg-blue-50/70 border-blue-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg font-bold text-sm tabular-nums flex items-center justify-center shrink-0 mt-0.5 ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {step.stepNumber}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">
                          {step.title}
                        </h4>
                        <span className="text-xs font-mono tabular-nums text-slate-500 inline-flex items-center gap-1">
                          <Play className="w-3 h-3 text-blue-700" />
                          {step.startTime.toFixed(1)}s – {step.endTime.toFixed(1)}s
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mt-1">
                        {step.summary}
                      </p>
                      <p className="text-xs font-semibold text-blue-800 mt-2">
                        Ponto de atenção: {step.keyCue}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Principais Erros & Dicas Técnicas */}
      {activeTab === 'errors_tips' && (
        <div className="p-5 sm:p-8 space-y-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Principais erros e como corrigir
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Identifique os desvios mais frequentes de iniciantes e aplique a
                correção imediata.
              </p>
            </div>

            <div className="space-y-3">
              {didactic.commonErrors.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 lg:grid-cols-3 gap-4"
                >
                  <div>
                    <span className="text-xs font-bold text-rose-700 block mb-1">
                      Erro comum
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {item.error}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 block mb-1">
                      Consequência em quadra
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.consequence}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-700 block mb-1">
                      Como corrigir
                    </span>
                    <p className="text-sm text-slate-800 font-medium leading-relaxed">
                      {item.correction}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-200" />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900">
                Dicas técnicas de consistência
              </h3>
            </div>

            <ul className="space-y-3">
              {didactic.technicalTips.map((tip, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-sm text-slate-800 leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Exercícios Práticos */}
      {activeTab === 'drills' && (
        <div className="p-5 sm:p-8 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Exercícios práticos recomendados
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Séries objetivas para desenvolver controle motor e transferência
              para o jogo real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {didactic.practicalDrills.map((drill, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-500 mb-2">
                    <span>{drill.level}</span>
                    <span className="tabular-nums text-blue-700 font-bold">
                      {drill.reps}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {drill.title}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed mt-2">
                    {drill.instructions}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/80 text-xs font-semibold text-slate-700">
                  Foco do treino: {drill.focus}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
