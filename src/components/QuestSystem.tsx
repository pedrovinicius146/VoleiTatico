import React, { useState, useEffect } from 'react';
import { Quest, UserProgress, PlayerPosition, CourtTheme } from '../types';
import { LEARNING_TRAILS, recordQuestCompletion, getLevelInfo } from '../engine/gamificationEngine';
import { TACTICAL_FORMATIONS } from '../constants/tacticsData';
import { validatePositionalFaults } from '../engine/rulesValidator';
import { Court2D } from './Court2D';
import confetti from 'canvas-confetti';
import { Star, Trophy, ArrowRight, CheckCircle2, XCircle, Clock, Lightbulb, Zap, Shield, RotateCcw, ChevronRight } from 'lucide-react';

interface QuestSystemProps {
  userProgress: UserProgress;
  onProgressUpdate: (updated: UserProgress) => void;
  theme: CourtTheme;
}

export const QuestSystem: React.FC<QuestSystemProps> = ({
  userProgress,
  onProgressUpdate,
  theme,
}) => {
  const [selectedTrailId, setSelectedTrailId] = useState<string>('fundamentals');
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [questPlayers, setQuestPlayers] = useState<PlayerPosition[]>([]);
  const [blitzTimer, setBlitzTimer] = useState<number>(0);
  const [blitzActive, setBlitzActive] = useState<boolean>(false);
  const [questFeedback, setQuestFeedback] = useState<{
    success: boolean;
    stars: number;
    title: string;
    message: string;
  } | null>(null);

  const activeTrail = LEARNING_TRAILS.find((t) => t.id === selectedTrailId) || LEARNING_TRAILS[0];
  const levelInfo = getLevelInfo(userProgress.xp);

  // Iniciar uma Quest
  const handleStartQuest = (quest: Quest) => {
    setActiveQuest(quest);
    setQuestFeedback(null);

    // Carregar formação base para a quest
    const preset = TACTICAL_FORMATIONS[quest.system]?.[quest.rotation]?.[quest.phase];
    let initial = preset ? preset.players.map((p) => ({ ...p })) : [];

    // Se for uma quest com falta proposital (identify_fault), injetar a falta de posição
    if (quest.id === 'q4_front_back_fault') {
      // Injetar jogador 5 à frente do 4
      initial = initial.map((p) => {
        if (p.id === 'OH1' || p.rotationIndex === 5) {
          return { ...p, y: 15 }; // Colocar na rede (ilegal para quem está no fundo!)
        }
        return p;
      });
    } else if (quest.id === 'q5_lateral_fault') {
      // Injetar central 3 à esquerda do ponta 4
      initial = initial.map((p) => {
        if (p.id === 'MB2' || p.rotationIndex === 3) {
          return { ...p, x: 10 }; // Mais à esquerda que o 4
        }
        return p;
      });
    } else if (quest.id === 'q1_zones_serve') {
      // Jogador do saque fora da zona 1
      initial = initial.map((p) => {
        if (p.rotationIndex === 1) {
          return { ...p, x: 50, y: 50 };
        }
        return p;
      });
    } else if (quest.id === 'q2_three_meter_rule') {
      // Jogador de fundo dentro da zona de ataque
      initial = initial.map((p) => {
        if (p.rotationIndex === 6) {
          return { ...p, x: 50, y: 20 };
        }
        return p;
      });
    }

    setQuestPlayers(initial);

    // Se for time-attack blitz
    if (quest.type === 'blitz_decision') {
      setBlitzTimer(quest.blitzTimeLimit || 6);
      setBlitzActive(true);
    } else {
      setBlitzActive(false);
    }
  };

  // Timer para modo Blitz Time-Attack
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (blitzActive && blitzTimer > 0) {
      timer = setTimeout(() => {
        setBlitzTimer((t) => t - 1);
      }, 1000);
    } else if (blitzActive && blitzTimer === 0) {
      // Tempo esgotado
      setBlitzActive(false);
      setQuestFeedback({
        success: false,
        stars: 0,
        title: 'Tempo Esgotado!',
        message: 'O apito do árbitro tocou antes da sua decisão. Tente novamente!',
      });
    }
    return () => clearTimeout(timer);
  }, [blitzActive, blitzTimer]);

  const handlePlayerMove = (playerId: string, newX: number, newY: number) => {
    setQuestPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, x: newX, y: newY } : p))
    );
  };

  // Validar a Quest Atual
  const handleValidateQuest = () => {
    if (!activeQuest) return;

    if (activeQuest.id === 'q1_zones_serve') {
      const server = questPlayers.find((p) => p.rotationIndex === 1);
      if (server && server.x >= 65 && server.y >= 65) {
        completeSuccess('Excelente!', 'Você posicionou o sacador corretamente na Zona 1 (Fundo à Direita).');
      } else {
        completeFailure('A Zona 1 fica no canto inferior direito da quadra de defesa (X > 65%, Y > 65%).');
      }
    } else if (activeQuest.id === 'q2_three_meter_rule') {
      // Jogadores de fundo devem estar com Y > 35 (atrás da linha de 3 metros)
      const backPlayers = questPlayers.filter((p) => p.rotationIndex === 1 || p.rotationIndex === 6 || p.rotationIndex === 5);
      const isAllBehind = backPlayers.every((p) => p.y >= 35);
      if (isAllBehind) {
        completeSuccess('Regra dos 3 Metros Compreendida!', 'Todos os jogadores de trás estão posicionados na zona de defesa, prontos para a recepção.');
      } else {
        completeFailure('Ainda há jogadores de trás (1, 6 ou 5) posicionados à frente da linha dos 3 metros.');
      }
    } else if (activeQuest.type === 'identify_fault') {
      const faultCheck = validatePositionalFaults(questPlayers);
      if (faultCheck.isValid) {
        completeSuccess('Falta Corrigida com Maestria!', 'Você ajustou a posição relativa e a formação agora é 100% legal perante as regras oficiais.');
      } else {
        completeFailure(`Ainda existe falta de posição: ${faultCheck.faults[0]?.description || 'Ajuste as posições.'}`);
      }
    } else if (activeQuest.type === 'libero_swap') {
      completeSuccess('Troca de Líbero Executada!', 'O Líbero entrou no lugar do Central para cobrir a defesa de fundo sem gastar substituição.');
    } else if (activeQuest.type === 'drag_target') {
      const faultCheck = validatePositionalFaults(questPlayers);
      if (faultCheck.isValid) {
        completeSuccess('Tática Perfeita!', 'A equipe está estruturada para infiltrar e defender com máxima eficiência.');
      } else {
        completeFailure('Atenção: há uma falta de posição impedindo o início da jogada.');
      }
    } else if (activeQuest.type === 'beach_defense') {
      completeSuccess('Defesa Cobriu a Área Livre!', 'A sintonia entre o sinal do bloqueador e o posicionamento da defesa garantiu a cobertura.');
    }
  };

  // Decisão do Modo Blitz (Legal vs Falta)
  const handleBlitzChoice = (chosenLegal: boolean) => {
    if (!activeQuest) return;
    setBlitzActive(false);

    const actualCheck = validatePositionalFaults(questPlayers);
    const isActuallyLegal = actualCheck.isValid;

    if (chosenLegal === isActuallyLegal) {
      completeSuccess(
        'Olho de Águia!',
        `Você acertou em ${activeQuest.blitzTimeLimit! - blitzTimer} segundos! A equipe estava realmente ${isActuallyLegal ? 'LEGAL' : 'EM FALTA DE POSIÇÃO'}.`
      );
    } else {
      completeFailure(
        `Decisão incorreta. A formação estava na verdade ${isActuallyLegal ? 'LEGAL' : 'EM FALTA DE POSIÇÃO'}.`
      );
    }
  };

  const completeSuccess = (title: string, message: string) => {
    if (!activeQuest) return;
    const stars = 3;
    const earnedXp = activeQuest.xpReward;

    const { updated } = recordQuestCompletion(userProgress, activeQuest.id, stars, earnedXp);
    onProgressUpdate(updated);

    setQuestFeedback({
      success: true,
      stars,
      title,
      message,
    });

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const completeFailure = (message: string) => {
    setQuestFeedback({
      success: false,
      stars: 0,
      title: 'Quase lá!',
      message,
    });
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Header com XP e Nível do Aluno */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-xl bg-yellow-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-sm border border-yellow-600">
            {levelInfo.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                Nível {levelInfo.level}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-100 text-yellow-900 border border-yellow-300 font-black">
                {levelInfo.title}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              {userProgress.studentName}
            </h3>
            <span className="text-xs text-slate-500 font-medium">{userProgress.schoolName}</span>
          </div>
        </div>

        {/* Barra de Progresso de XP */}
        <div className="w-full md:w-64 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-blue-900 flex items-center gap-1 font-black">
              <Zap className="w-3.5 h-3.5 fill-yellow-500 text-yellow-600" /> {userProgress.xp} XP Total
            </span>
            <span className="text-slate-500 text-[11px]">Próximo: {levelInfo.nextLevelXp} XP</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
            <div
              className="h-full bg-yellow-500 rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Seletor das 4 Trilhas de Aprendizagem (Responsivo) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {LEARNING_TRAILS.map((trail) => {
          const isSelected = selectedTrailId === trail.id;
          const completedInTrail = trail.quests.filter((q) => userProgress.completedQuests[q.id]?.stars > 0).length;

          return (
            <button
              key={trail.id}
              onClick={() => {
                setSelectedTrailId(trail.id);
                setActiveQuest(null);
                setQuestFeedback(null);
              }}
              className={`p-3 sm:p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50 border-blue-600 shadow-sm ring-2 ring-blue-600/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div>
                <div className="text-xl sm:text-2xl mb-1">{trail.icon}</div>
                <h4 className="font-black text-xs sm:text-sm text-slate-900 leading-tight">
                  {trail.title}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 leading-snug line-clamp-2">
                  {trail.subtitle}
                </p>
              </div>

              <div className="mt-2.5 sm:mt-3 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-blue-700">
                <span>{completedInTrail}/{trail.quests.length}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Lista de Quests da Trilha Ativa OU Área de Jogo da Quest */}
      {!activeQuest ? (
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <span>{activeTrail.icon}</span> {activeTrail.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">{activeTrail.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {activeTrail.quests.map((quest, idx) => {
              const progress = userProgress.completedQuests[quest.id];
              const stars = progress ? progress.stars : 0;

              return (
                <div
                  key={quest.id}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-blue-500 transition-all shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white text-blue-900 border border-slate-200">
                        Quest {idx + 1}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= stars
                                ? 'text-yellow-500 fill-yellow-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h4 className="font-black text-sm sm:text-base text-slate-900">
                      {quest.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                      {quest.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-black text-blue-900">
                      +{quest.xpReward} XP
                    </span>
                    <button
                      onClick={() => handleStartQuest(quest)}
                      className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
                    >
                      {stars > 0 ? 'Jogar de Novo' : 'Iniciar Desafio'} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Modo de Jogo / Execução da Quest Ativa */
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
          {/* Header da Quest Ativa */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveQuest(null);
                    setQuestFeedback(null);
                  }}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200"
                >
                  ← Voltar para Trilhas
                </button>
                <span className="text-xs font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  +{activeQuest.xpReward} XP em jogo
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">{activeQuest.title}</h3>
              <p className="text-xs text-slate-600 font-medium">{activeQuest.objective}</p>
            </div>

            {/* Timer do Modo Blitz se ativo */}
            {activeQuest.type === 'blitz_decision' && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-lg shadow-xs">
                <Clock className="w-4 h-4 text-red-600 animate-spin" />
                <span className="text-sm font-black text-red-900">
                  Tempo: {blitzTimer}s
                </span>
              </div>
            )}
          </div>

          {/* Dica da Quest */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
            <Lightbulb className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Dica:</strong> {activeQuest.hint}
            </div>
          </div>

          {/* Quadra Interativa do Desafio */}
          <div className="bg-slate-50 p-2 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
            <Court2D
              players={questPlayers}
              onPlayerMove={handlePlayerMove}
              theme={theme}
              system={activeQuest.system}
              isBeach={activeQuest.system === 'beach_2x2'}
            />
          </div>

          {/* Botões de Ação do Desafio (Mobile-First) */}
          {activeQuest.type !== 'blitz_decision' ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <button
                onClick={handleValidateQuest}
                className="flex-1 min-h-[44px] py-3 px-4 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-xl shadow-sm text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" /> Conferir Minha Resposta
              </button>
              <button
                onClick={() => handleStartQuest(activeQuest)}
                className="min-h-[44px] py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-200"
                title="Reiniciar Desafio"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
              </button>
            </div>
          ) : (
            /* Botões de Decisão Rápida para o Time-Attack Blitz */
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleBlitzChoice(true)}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" /> FORMAÇÃO LEGAL ✅
              </button>
              <button
                onClick={() => handleBlitzChoice(false)}
                className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <XCircle className="w-5 h-5" /> FALTA DE POSIÇÃO ❌
              </button>
            </div>
          )}

          {/* Feedback de Resultado */}
          {questFeedback && (
            <div
              className={`p-4 rounded-xl border transition-all animate-in fade-in zoom-in-95 shadow-sm ${
                questFeedback.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 font-black text-base">
                  {questFeedback.success ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-emerald-900">{questFeedback.title}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600" />
                      <span className="text-rose-900">{questFeedback.title}</span>
                    </>
                  )}
                </div>

                {questFeedback.success && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((s) => (
                      <Star key={s} className="w-5 h-5 text-yellow-500 fill-yellow-400 animate-bounce" />
                    ))}
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-800 mt-1 leading-relaxed font-medium">
                {questFeedback.message}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-blue-900 font-bold flex-1 min-w-[200px]">
                  {activeQuest.pedagogicalTip}
                </span>
                {questFeedback.success && (
                  <button
                    onClick={() => {
                      setActiveQuest(null);
                      setQuestFeedback(null);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 text-white font-black rounded-lg text-xs hover:bg-emerald-700 transition-all shadow-xs shrink-0 whitespace-nowrap"
                  >
                    Próxima Quest →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
