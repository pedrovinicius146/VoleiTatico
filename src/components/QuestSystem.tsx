import React, { useState, useEffect } from 'react';
import { Quest, UserProgress, PlayerPosition, CourtTheme } from '../types';
import { LEARNING_TRAILS, BADGES_LIST, recordQuestCompletion, getLevelInfo } from '../engine/gamificationEngine';
import { TACTICAL_FORMATIONS } from '../constants/tacticsData';
import { validatePositionalFaults } from '../engine/rulesValidator';
import { Court2D } from './Court2D';
import { Court3D } from './Court3D';
import { CertificateModal } from './CertificateModal';
import confetti from 'canvas-confetti';
import {
  Star,
  Trophy,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Lightbulb,
  Zap,
  Shield,
  RotateCcw,
  ChevronRight,
  Award,
  Compass,
  Layers,
  HelpCircle,
  Medal,
} from 'lucide-react';

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
  const [questViewMode, setQuestViewMode] = useState<'3d' | '2d'>('3d');
  const [blitzTimer, setBlitzTimer] = useState<number>(0);
  const [blitzActive, setBlitzActive] = useState<boolean>(false);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
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
    setSelectedChoiceId(null);

    // Carregar formação base para a quest
    const preset = TACTICAL_FORMATIONS[quest.system]?.[quest.rotation]?.[quest.phase];
    let initial = preset ? preset.players.map((p) => ({ ...p })) : [];

    // Se for uma quest com falta proposital (identify_fault), injetar a falta de posição
    if (quest.id === 'q4_front_back_fault') {
      // Injetar jogador 5 à frente do 4
      initial = initial.map((p) => {
        if (p.id === 'OH1' || p.rotationIndex === 5) {
          return { ...p, y: 15 };
        }
        return p;
      });
    } else if (quest.id === 'q5_lateral_fault') {
      // Injetar central 3 à esquerda do ponta 4
      initial = initial.map((p) => {
        if (p.id === 'MB2' || p.rotationIndex === 3) {
          return { ...p, x: 10 };
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
    } else if (quest.id === 'q17_exam_final_challenge') {
      // Falta no R5: Levantador adiantado na linha da frente
      initial = initial.map((p) => {
        if (p.rotationIndex === 1 || p.role === 'S') {
          return { ...p, y: 22 };
        }
        return p;
      });
    }

    setQuestPlayers(initial);

    // Se for time-attack blitz
    if (quest.type === 'blitz_decision') {
      setBlitzTimer(quest.blitzTimeLimit || 8);
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
      completeSuccess('Troca de Líbero Regulamentar!', 'O Líbero entrou no lugar do Central para cobrir a defesa de fundo sem gastar substituição.');
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

  // Tratar Escolha de Múltipla Escolha em Exames Táticos
  const handleTacticalChoice = (choice: { id: string; label: string; isCorrect: boolean; explanation: string }) => {
    setSelectedChoiceId(choice.id);
    if (choice.isCorrect) {
      completeSuccess('Decisão Tática Aprovada!', choice.explanation);
    } else {
      completeFailure(choice.explanation);
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
      particleCount: 80,
      spread: 75,
      origin: { y: 0.6 },
    });
  };

  const completeFailure = (message: string) => {
    setQuestFeedback({
      success: false,
      stars: 0,
      title: 'Ajuste Necessário',
      message,
    });
  };

  const totalQuestsCount = LEARNING_TRAILS.reduce((acc, t) => acc + t.quests.length, 0);
  const completedCount = Object.keys(userProgress.completedQuests).length;

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Header Profissional de Status do Aluno / Treinador */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-blue-950 text-white font-black text-2xl flex items-center justify-center shadow-lg border border-slate-800 shrink-0">
            {levelInfo.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                Nível {levelInfo.level}
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                {levelInfo.title}
              </span>
              {userProgress.hasCertified && (
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Certificado FIVB
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              {userProgress.studentName || 'Atleta da Base'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {userProgress.schoolName || 'Escola de Voleibol'} • Turma {userProgress.classCode || 'CBV-2026'}
            </p>
          </div>
        </div>

        {/* Painel de Pontos & Ação do Certificado */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Barra de XP */}
          <div className="w-full sm:w-60 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-900 flex items-center gap-1 font-black">
                <Zap className="w-4 h-4 fill-amber-400 text-amber-500" /> {userProgress.xp} XP
              </span>
              <span className="text-slate-500 text-[11px]">Próximo: {levelInfo.nextLevelXp} XP</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 font-semibold text-right">
              {completedCount} de {totalQuestsCount} desafios concluídos
            </div>
          </div>

          {/* Botão de Certificado Oficial */}
          <button
            onClick={() => setShowCertificateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
            title="Visualizar ou Imprimir Certificado de Habilitação Tática"
          >
            <Award className="w-4 h-4" />
            <span>Emitir Certificado</span>
          </button>
        </div>
      </div>

      {/* Seletor das 5 Trilhas de Formação Tática */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {LEARNING_TRAILS.map((trail) => {
          const isSelected = selectedTrailId === trail.id;
          const completedInTrail = trail.quests.filter((q) => userProgress.completedQuests[q.id]?.stars > 0).length;
          const isTrailDone = completedInTrail === trail.quests.length;

          return (
            <button
              key={trail.id}
              onClick={() => {
                setSelectedTrailId(trail.id);
                setActiveQuest(null);
                setQuestFeedback(null);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-700 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200/90 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl">{trail.icon}</span>
                  {isTrailDone && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      Concluída
                    </span>
                  )}
                </div>
                <h3 className={`font-black text-xs sm:text-sm leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {trail.title}
                </h3>
                <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {trail.subtitle}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/40 flex items-center justify-between text-[11px] font-bold">
                <span className={isSelected ? 'text-teal-400 font-bold' : 'text-blue-700'}>
                  {completedInTrail} de {trail.quests.length} feitos
                </span>
                <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-400' : 'text-slate-400'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Lista de Quests da Trilha Ativa OU Área de Jogo da Quest */}
      {!activeQuest ? (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md flex flex-col gap-4">
          <div className="border-b border-slate-200 pb-3 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeTrail.icon}</span>
                <h3 className="font-black text-lg text-slate-900">{activeTrail.title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">{activeTrail.description}</p>
            </div>
            {activeTrail.id === 'exam_fivb' && (
              <span className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black shrink-0">
                ⭐ Exame Oficial
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeTrail.quests.map((quest, idx) => {
              const progress = userProgress.completedQuests[quest.id];
              const stars = progress ? progress.stars : 0;

              return (
                <div
                  key={quest.id}
                  className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90 flex flex-col justify-between hover:border-blue-400 transition-all shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-white text-slate-700 border border-slate-200">
                        Desafio {idx + 1}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h4 className="font-black text-sm text-slate-900">
                      {quest.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                      {quest.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">
                      +{quest.xpReward} XP
                    </span>
                    <button
                      onClick={() => handleStartQuest(quest)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                    >
                      <span>{stars > 0 ? 'Refazer' : 'Praticar'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Área de Jogo / Simulação da Quest Ativa */
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md flex flex-col gap-4">
          {/* Header da Quest Ativa */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveQuest(null);
                    setQuestFeedback(null);
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-slate-950 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-all"
                >
                  ← Voltar aos Exercícios
                </button>
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  +{activeQuest.xpReward} XP em Jogo
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-2">{activeQuest.title}</h3>
              <p className="text-xs text-slate-600 font-medium">
                <strong>Objetivo pedagógico:</strong> {activeQuest.objective}
              </p>
            </div>

            {/* Timer do Modo Blitz se ativo */}
            {activeQuest.type === 'blitz_decision' && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl shadow-xs">
                <Clock className="w-4 h-4 text-red-600 animate-spin" />
                <span className="text-sm font-black text-red-900">
                  Tempo Restante: {blitzTimer}s
                </span>
              </div>
            )}
          </div>

          {/* Dica da Quest */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Dica do Treinador:</strong> {activeQuest.hint}
            </div>
          </div>

          {/* Renderização da Quest: Cenário de Múltipla Escolha OU Quadra Interativa (3D / 2D) */}
          {activeQuest.type === 'tactical_choice' && activeQuest.choices ? (
            <div className="flex flex-col gap-3 my-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Selecione a interpretação regulamentar correta conforme as Regras Oficiais FIVB:
              </span>
              <div className="grid grid-cols-1 gap-2.5">
                {activeQuest.choices.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id;
                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleTacticalChoice(choice)}
                      className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-start gap-3 ${
                        isSelected
                          ? choice.isCorrect
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/20'
                            : 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-400/20'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-xs'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        isSelected
                          ? choice.isCorrect
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'border-slate-300 text-slate-600'
                      }`}>
                        {choice.id.replace('c', '')}
                      </div>
                      <div className="flex-1">
                        <div>{choice.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Barra de Seleção de Visualização na Quest (3D Arena vs 2D) */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setQuestViewMode('3d')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      questViewMode === '3d'
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5 text-teal-300" />
                    <span>Arena 3D Real</span>
                  </button>
                  <button
                    onClick={() => setQuestViewMode('2d')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      questViewMode === '2d'
                        ? 'bg-blue-600 text-white shadow-sm font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Prancheta 2D</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  Arraste os atletas para a posição regulamentar
                </span>
              </div>

              {/* Quadra Interativa da Quest */}
              {questViewMode === '3d' ? (
                <Court3D
                  players={questPlayers}
                  onPlayerMove={handlePlayerMove}
                  theme={theme}
                  system={activeQuest.system}
                  showZoneNumbers={true}
                  interactive={true}
                />
              ) : (
                <div className="bg-slate-50 p-2 sm:p-4 rounded-2xl border border-slate-200 flex flex-col items-center">
                  <Court2D
                    players={questPlayers}
                    onPlayerMove={handlePlayerMove}
                    theme={theme}
                    system={activeQuest.system}
                    isBeach={activeQuest.system === 'beach_2x2'}
                  />
                </div>
              )}
            </div>
          )}

          {/* Botões de Ação do Desafio */}
          {activeQuest.type !== 'blitz_decision' && activeQuest.type !== 'tactical_choice' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <button
                onClick={handleValidateQuest}
                className="flex-1 min-h-[44px] py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-md text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" /> Conferir Posicionamento
              </button>
              <button
                onClick={() => handleStartQuest(activeQuest)}
                className="min-h-[44px] py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-200"
                title="Recomeçar o exercício do estado inicial"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Recomeçar
              </button>
            </div>
          )}

          {activeQuest.type === 'blitz_decision' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleBlitzChoice(true)}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" /> Posição Legal ✅
              </button>
              <button
                onClick={() => handleBlitzChoice(false)}
                className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <XCircle className="w-5 h-5" /> Falta de Posição ❌
              </button>
            </div>
          )}

          {/* Feedback de Resultado */}
          {questFeedback && (
            <div
              className={`p-4 rounded-2xl border transition-all animate-in fade-in zoom-in-95 shadow-md ${
                questFeedback.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 font-black text-base">
                  {questFeedback.success ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="text-emerald-900">{questFeedback.title}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span className="text-rose-900">{questFeedback.title}</span>
                    </>
                  )}
                </div>

                {questFeedback.success && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((s) => (
                      <Star key={s} className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {questFeedback.message}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-blue-950 font-bold flex-1 min-w-[200px]">
                  💡 {activeQuest.pedagogicalTip}
                </span>
                {questFeedback.success && (
                  <button
                    onClick={() => {
                      setActiveQuest(null);
                      setQuestFeedback(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap"
                  >
                    Próximo Exercício →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vitrine de Conquistas & Medalhas Esportivas (Anti-Slop & Design Elegante) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Medal className="w-4 h-4 text-amber-500" />
              <span>Quadro de Medalhas & Conquistas Oficiais</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Reconhecimento das suas competências táticas e de arbitragem
            </p>
          </div>
          <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
            {userProgress.unlockedBadges.length} de {BADGES_LIST.length} desbloqueadas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BADGES_LIST.map((badge) => {
            const isUnlocked = userProgress.unlockedBadges.includes(badge.id);

            const tierClasses = {
              bronze: 'border-amber-700/30 bg-amber-50/40 text-amber-900',
              silver: 'border-slate-300 bg-slate-50 text-slate-800',
              gold: 'border-yellow-500/50 bg-yellow-50/50 text-yellow-950',
              diamond: 'border-cyan-500/50 bg-cyan-50/50 text-cyan-950',
            }[badge.tier || 'bronze'];

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                  isUnlocked
                    ? `${tierClasses} shadow-sm`
                    : 'bg-slate-50/50 border-slate-200/60 opacity-60 grayscale'
                }`}
              >
                <div className="text-2xl shrink-0 mt-0.5">{badge.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-black text-xs text-slate-900 truncate">{badge.title}</h4>
                    {isUnlocked && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        Ativa
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                    {badge.description}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                    {badge.conditionDescription}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Certificado */}
      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        userProgress={userProgress}
      />
    </div>
  );
};
