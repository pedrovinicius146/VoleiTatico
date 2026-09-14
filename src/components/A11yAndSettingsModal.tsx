import React from 'react';
import { CourtTheme, UserProgress } from '../types';
import { BADGES_LIST } from '../engine/gamificationEngine';
import { Eye, Smartphone, WifiOff, Palette, Award, Check, RotateCcw } from 'lucide-react';

interface A11yAndSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProgress: UserProgress;
  onProgressUpdate: (updated: UserProgress) => void;
}

export const A11yAndSettingsModal: React.FC<A11yAndSettingsModalProps> = ({
  isOpen,
  onClose,
  userProgress,
  onProgressUpdate,
}) => {
  const [showResetConfirm, setShowResetConfirm] = React.useState<boolean>(false);

  if (!isOpen) return null;

  const themes: { id: CourtTheme; name: string; desc: string; preview: string }[] = [
    {
      id: 'taraflex_blue',
      name: 'Taraflex Oficial (Azul & Laranja)',
      desc: 'Padrão das Olimpíadas e Liga das Nações (FIVB).',
      preview: 'bg-gradient-to-r from-sky-600 to-orange-600',
    },
    {
      id: 'classic_wood',
      name: 'Madeira Clássica de Ginásio',
      desc: 'Visual de quadra de taco tradicional de escola pública.',
      preview: 'bg-gradient-to-r from-amber-700 to-amber-900',
    },
    {
      id: 'beach_gold',
      name: 'Areia Tropical Dourada (Praia)',
      desc: 'Textura de areia de praia com linhas azuis.',
      preview: 'bg-gradient-to-r from-amber-300 to-amber-500',
    },
    {
      id: 'neon_night',
      name: 'Noite Néon Cyber (Modo Escuro)',
      desc: 'Estética com linhas ciano e alto contraste relaxante.',
      preview: 'bg-gradient-to-r from-slate-900 via-cyan-950 to-indigo-950',
    },
    {
      id: 'high_contrast',
      name: 'Alto Contraste Acessível (WCAG AAA)',
      desc: 'Preto puro com linhas brancas e amarelas para baixa visão.',
      preview: 'bg-black border-2 border-yellow-400',
    },
  ];

  const handleSelectTheme = (themeId: CourtTheme) => {
    onProgressUpdate({
      ...userProgress,
      selectedTheme: themeId,
      highContrast: themeId === 'high_contrast',
    });
  };

  const handleToggleHighContrast = () => {
    const nextVal = !userProgress.highContrast;
    onProgressUpdate({
      ...userProgress,
      highContrast: nextVal,
      selectedTheme: nextVal ? 'high_contrast' : 'taraflex_blue',
    });
  };

  const handleExecuteReset = () => {
    onProgressUpdate({
      ...userProgress,
      xp: 0,
      level: 1,
      completedQuests: {},
      unlockedBadges: [],
    });
    setShowResetConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 w-[calc(100vw-20px)] sm:max-w-xl text-slate-900 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-900 shrink-0" />
            <h3 className="font-black text-base sm:text-lg text-slate-900">Configurações & Acessibilidade</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-bold flex items-center justify-center transition-colors shrink-0 text-base"
            aria-label="Fechar configurações"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {/* Seção de Acessibilidade */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              ♿ Acessibilidade Visual (RNF03)
            </span>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-700" /> Modo de Alto Contraste
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Maximiza a legibilidade das linhas da quadra e avatares com letras grandes.
                </p>
              </div>
              <button
                onClick={handleToggleHighContrast}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  userProgress.highContrast ? 'bg-yellow-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                    userProgress.highContrast ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Seção de Temas da Quadra */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              🎨 Tema Visual da Quadra
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {themes.map((th) => (
                <button
                  key={th.id}
                  onClick={() => handleSelectTheme(th.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    userProgress.selectedTheme === th.id
                      ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${th.preview} shrink-0 mt-0.5 shadow-xs`} />
                  <div className="flex-1">
                    <div className="font-black text-xs text-slate-900 flex items-center justify-between">
                      <span>{th.name}</span>
                      {userProgress.selectedTheme === th.id && <Check className="w-3.5 h-3.5 text-blue-700" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{th.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Guia de Uso Offline e PWA */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              📶 Uso na Quadra Sem Internet (PWA & Offline)
            </span>
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 flex items-start gap-3 text-xs text-slate-700">
              <WifiOff className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-black text-blue-950 mb-0.5">App 100% Autônomo</div>
                <p className="leading-relaxed text-slate-600">
                  Este simulador armazena todos os motores de regras e gráficos no seu navegador. Você pode utilizá-lo no celular diretamente na quadra da escola sem sinal de internet ou gastar dados móveis!
                </p>
                <div className="mt-2 text-[11px] text-blue-800 font-bold flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" /> No Chrome/Safari móvel: Menu ⋮ → "Adicionar à Tela de Início" para instalar como PWA.
                </div>
              </div>
            </div>
          </div>

          {/* Conquistas Rápidas */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              🏆 Galeria de Badges
            </span>
            <div className="grid grid-cols-2 gap-2">
              {BADGES_LIST.map((b) => {
                const isUnlocked = userProgress.unlockedBadges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs ${
                      isUnlocked
                        ? 'bg-yellow-50 border-yellow-300 text-yellow-950'
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}
                  >
                    <span className="text-xl">{b.icon}</span>
                    <div>
                      <strong className="block font-black text-slate-900">{b.title}</strong>
                      <span className="text-[10px] text-slate-500">{b.conditionDescription}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset de Progresso */}
          <div className="pt-3 border-t border-slate-200">
            {showResetConfirm ? (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl space-y-2 animate-in fade-in">
                <p className="text-xs font-bold text-rose-950">
                  ⚠️ Tem certeza que deseja zerar todo o progresso (XP, Quests e Medalhas)? Esta ação não pode ser desfeita.
                </p>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleExecuteReset}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-lg shadow-xs transition-colors"
                  >
                    Sim, Zerar Tudo
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reiniciar Meu Progresso (Zerar XP)
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-lg text-xs transition-all shadow-xs"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
