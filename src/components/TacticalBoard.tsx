import React, { useState, useEffect, useCallback } from 'react';
import { SystemType, RotationIndex, GamePhase, PlayerPosition, CourtTheme, PositionalFault } from '../types';
import { SYSTEMS_CATALOG, SYSTEM_5X1_COVERAGE_GUIDE } from '../constants/tacticsData';
import { tacticsRepository } from '../repositories/tacticsRepository';
import { validatePositionalFaults } from '../engine/rulesValidator';
import { Court2D } from './Court2D';
import { Play, Pause, RotateCcw, AlertTriangle, CheckCircle2, Info, ChevronRight, ChevronLeft, Sparkles, BookOpen, Shield, HelpCircle } from 'lucide-react';

interface TacticalBoardProps {
  theme: CourtTheme;
  onOpenTeacherView?: () => void;
}

export const TacticalBoard: React.FC<TacticalBoardProps> = ({ theme, onOpenTeacherView }) => {
  const [system, setSystem] = useState<SystemType>('5x1');
  const [rotation, setRotation] = useState<RotationIndex>(1);
  const [phase, setPhase] = useState<GamePhase>('reception');
  const [players, setPlayers] = useState<PlayerPosition[]>([]);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerPosition | null>(null);
  const [faults, setFaults] = useState<PositionalFault[]>([]);
  const [showZoneNumbers, setShowZoneNumbers] = useState<boolean>(true);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Load preset formation when system, rotation or phase changes via tacticsRepository
  const loadPresetFormation = useCallback((sys: SystemType, rot: RotationIndex, ph: GamePhase) => {
    const formation = tacticsRepository.getFormation(sys, rot, ph);
    if (formation) {
      // Clone players array
      const loaded = formation.players.map((p) => ({ ...p }));
      setPlayers(loaded);
    }
  }, []);

  useEffect(() => {
    loadPresetFormation(system, rotation, phase);
  }, [system, rotation, phase, loadPresetFormation]);

  // Validar faltas de posição sempre que os jogadores mudarem
  useEffect(() => {
    // Faltas de posição só são válidas na fase de recepção/saque (antes do golpe do saque)
    if (phase === 'reception' && system !== 'beach_2x2') {
      const result = validatePositionalFaults(players);
      setFaults(result.faults);
    } else {
      setFaults([]);
    }
  }, [players, phase, system]);

  // Movimento interativo do jogador
  const handlePlayerMove = (playerId: string, newX: number, newY: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, x: newX, y: newY } : p))
    );
  };

  // Animação automatizada da transição (Fase 1 -> Fase 2 -> Fase 3)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingAnimation) {
      timer = setTimeout(() => {
        setPhase((curr) => {
          if (curr === 'reception') return 'serve_hit';
          if (curr === 'serve_hit') return 'transition';
          setIsPlayingAnimation(false);
          return 'reception';
        });
      }, 1800);
    }
    return () => clearTimeout(timer);
  }, [isPlayingAnimation, phase]);

  const currentTip = tacticsRepository.getFormation(system, rotation, phase)?.pedagogicalTip || '';
  const currentSystemInfo = SYSTEMS_CATALOG.find((s) => s.id === system)!;

  const nextRotation = () => {
    setRotation((r) => (r === 6 ? 1 : ((r + 1) as RotationIndex)));
    setPhase('reception');
  };

  const prevRotation = () => {
    setRotation((r) => (r === 1 ? 6 : ((r - 1) as RotationIndex)));
    setPhase('reception');
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Barra de Seleção de Sistema Tático */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block">
              Sistema Tático de Jogo
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              {currentSystemInfo.name}
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {currentSystemInfo.difficulty}
              </span>
            </h2>
          </div>

          {/* Seletor Rápido de Sistemas com Rolagem Horizontal Touch no Mobile */}
          <div className="flex flex-nowrap sm:flex-wrap overflow-x-auto pb-1.5 sm:pb-0 gap-1.5 sm:gap-2 no-scrollbar w-full min-w-0">
            {SYSTEMS_CATALOG.map((sys) => (
              <button
                key={sys.id}
                onClick={() => {
                  setSystem(sys.id);
                  setRotation(1);
                  setPhase('reception');
                }}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 sm:shrink ${
                  system === sys.id
                    ? 'bg-blue-600 text-white shadow-sm font-black ring-2 ring-blue-500'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {sys.id === '6x0' && '6x0 Básico'}
                {sys.id === '4x2_simple' && '4x2 Simples'}
                {sys.id === '4x2_inversion' && '4x2 Invertido'}
                {sys.id === '5x1' && '5x1 Especializado'}
                {sys.id === 'beach_2x2' && 'Praia (2x2)'}
              </button>
            ))}
          </div>
        </div>

        {/* Resumo Pedagógico do Sistema */}
        <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
          💡 <strong className="text-blue-900 font-bold">Lógica de Base:</strong> {currentSystemInfo.logic}
        </p>
      </div>

      {/* Grid Principal: Controles + Quadra 2D + Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Painel Esquerdo: Controles de Rodízio e Fases (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Navegador de Rodízio R1 a R6 */}
          {system !== 'beach_2x2' ? (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-full min-w-0 box-border overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Ordem de Rodízio
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Sentido Horário ↻
                </span>
              </div>

              {/* Botões das 6 rotações oficiais distribuídos perfeitamente em grid */}
              <div className="grid grid-cols-6 gap-1.5 mb-2.5 w-full min-w-0">
                {[1, 2, 3, 4, 5, 6].map((r) => (
                  <button
                    key={`rot-btn-${r}`}
                    onClick={() => {
                      setRotation(r as RotationIndex);
                      setPhase('reception');
                    }}
                    className={`py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center ${
                      rotation === r
                        ? 'bg-yellow-500 text-slate-950 shadow-sm ring-2 ring-yellow-400 font-black'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                    title={`Ir para Rotação R${r}`}
                  >
                    R{r}
                  </button>
                ))}
              </div>

              {/* Botões Anterior e Próxima distribuídos em 2 colunas responsivas */}
              <div className="grid grid-cols-2 gap-2 mb-3 w-full min-w-0">
                <button
                  onClick={prevRotation}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1 text-xs border border-slate-200 whitespace-nowrap"
                  title="Rotação Anterior"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" /> Anterior
                </button>

                <button
                  onClick={nextRotation}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1 text-xs border border-slate-200 whitespace-nowrap"
                  title="Próxima Rotação"
                >
                  Próxima <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              </div>

              <div className="text-center bg-blue-50 py-2 px-3 rounded-lg border border-blue-200 text-xs font-semibold text-blue-900">
                {system === '5x1' && (
                  <>
                    Levantador está na{' '}
                    <strong className="text-blue-950 font-black">
                      {rotation === 1 && 'Posição 1 (Fundo/Saque)'}
                      {rotation === 2 && 'Posição 6 (Fundo Centro)'}
                      {rotation === 3 && 'Posição 5 (Fundo Esquerda)'}
                      {rotation === 4 && 'Posição 4 (Rede Esquerda)'}
                      {rotation === 5 && 'Posição 3 (Rede Centro)'}
                      {rotation === 6 && 'Posição 2 (Rede Direita)'}
                    </strong>
                  </>
                )}
                {system !== '5x1' && `Posicionamento Oficial na Rotação ${rotation}`}
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Sacador no Vôlei de Praia
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRotation(1)}
                  className={`py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                    rotation === 1 ? 'bg-yellow-500 text-slate-950 ring-2 ring-yellow-400 font-black' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  🏐 Sacador 1 (Dupla 1)
                </button>
                <button
                  onClick={() => setRotation(2)}
                  className={`py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                    rotation === 2 ? 'bg-yellow-500 text-slate-950 ring-2 ring-yellow-400 font-black' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  🏐 Sacador 2 (Dupla 2)
                </button>
              </div>
            </div>
          )}

          {/* Alternador de 3 Fases da Jogada (RF03) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Fase da Jogada (RF03)
              </span>
              <button
                onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isPlayingAnimation
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                }`}
              >
                {isPlayingAnimation ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Animar Transição
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setPhase('reception');
                  setIsPlayingAnimation(false);
                }}
                className={`p-2.5 rounded-lg text-left text-xs sm:text-sm font-bold flex items-start gap-2.5 transition-all border ${
                  phase === 'reception'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  phase === 'reception' ? 'bg-white text-blue-700' : 'bg-slate-200 text-slate-700'
                }`}>
                  1
                </span>
                <div>
                  <div className="font-black">1. Posicionamento de Recepção / Saque</div>
                  <div className={`text-[11px] font-medium ${phase === 'reception' ? 'text-blue-100' : 'text-slate-500'}`}>
                    Regra formal obrigatória (Validação de Falta de Posição).
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setPhase('serve_hit');
                  setIsPlayingAnimation(false);
                }}
                className={`p-2.5 rounded-lg text-left text-xs sm:text-sm font-bold flex items-start gap-2.5 transition-all border ${
                  phase === 'serve_hit'
                    ? 'bg-yellow-500 text-slate-950 border-yellow-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  phase === 'serve_hit' ? 'bg-slate-900 text-yellow-400' : 'bg-slate-200 text-slate-700'
                }`}>
                  2
                </span>
                <div>
                  <div className="font-black">2. Momento do Golpe do Saque</div>
                  <div className={`text-[11px] font-medium ${phase === 'serve_hit' ? 'text-slate-900' : 'text-slate-500'}`}>
                    Início das corridas de infiltração e trocas de rede.
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setPhase('transition');
                  setIsPlayingAnimation(false);
                }}
                className={`p-2.5 rounded-lg text-left text-xs sm:text-sm font-bold flex items-start gap-2.5 transition-all border ${
                  phase === 'transition'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  phase === 'transition' ? 'bg-white text-emerald-700' : 'bg-slate-200 text-slate-700'
                }`}>
                  3
                </span>
                <div>
                  <div className="font-black">3. Transição Ofensiva / Defensiva</div>
                  <div className={`text-[11px] font-medium ${phase === 'transition' ? 'text-emerald-100' : 'text-slate-500'}`}>
                    Posição tática final onde cada atleta ataca ou bloqueia.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Botões de Ação Rápida */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadPresetFormation(system, rotation, phase)}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" /> Restaurar Posição Ideal
            </button>
            <button
              onClick={() => setShowZoneNumbers(!showZoneNumbers)}
              className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                showZoneNumbers
                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {showZoneNumbers ? 'Zonas 1-6 [ON]' : 'Zonas [OFF]'}
            </button>
          </div>
        </div>

        {/* Painel Central: Quadra 2D Interativa (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Status do Validador de Falta de Posição (RF04) */}
          {system !== 'beach_2x2' && phase === 'reception' && (
            <div
              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 shadow-sm ${
                faults.length === 0
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-red-50 border-red-300 text-red-950 animate-pulse'
              }`}
            >
              {faults.length === 0 ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black text-sm text-emerald-900">
                      Posicionamento Legal! (Sem Falta de Posição)
                    </div>
                    <p className="text-xs text-emerald-800 mt-0.5 font-medium">
                      Todos os atletas respeitam a adjacência com seus pares da frente/trás e da esquerda/direita. O saque pode ser autorizado pelo árbitro.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black text-sm text-red-900 flex items-center gap-1.5">
                      FALTA DE POSIÇÃO DETECTADA! ({faults.length} infração{faults.length > 1 ? 'ões' : ''})
                    </div>
                    <ul className="mt-1 text-xs space-y-1 text-red-800">
                      {faults.map((f, i) => (
                        <li key={`fault-item-${i}`} className="flex items-start gap-1 font-semibold">
                          <span>•</span>
                          <span>{f.description}</span>
                        </li>
                      ))}
                    </ul>
                    <span className="text-[11px] text-red-700 mt-1 block font-bold">
                      👉 Dica: Arraste as fichas destacadas com borda vermelha na quadra para corrigir a infração.
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Renderização da Quadra 2D */}
          <div className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
            <Court2D
              players={players}
              onPlayerMove={handlePlayerMove}
              onPlayerClick={(p) => setSelectedPlayer(p)}
              faults={faults}
              theme={theme}
              system={system}
              isBeach={system === 'beach_2x2'}
              showZoneNumbers={showZoneNumbers}
              selectedPlayerId={selectedPlayer?.id}
            />

            {/* Barra Didática de Instrução Gestual */}
            <div className="w-full mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span><strong>1 Clique rápido:</strong> Detalhes da função tática</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span>✋ <strong>Clique e segure ou arraste:</strong> Apenas muda de lugar</span>
              </span>
            </div>
          </div>

          {/* Dica Pedagógica do Professor (Didática Especial para Escolas Públicas) */}
          <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-[#1e3a8a] border-t border-r border-b border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <BookOpen className="w-4 h-4 text-[#1e3a8a]" />
              <span className="text-xs font-black text-[#1e3a8a] uppercase tracking-wide">
                Explicação Pedagógica da Jogada ({system === '5x1' ? `5x1 Rotação ${rotation}` : system})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {currentTip}
            </p>
          </div>

          {/* Seção Exclusiva: Guia Pedagógico de Passe vs Cobertura no Sistema 5x1 */}
          {system === '5x1' && (
            <div className="bg-white p-4 sm:p-5 rounded-xl border-2 border-slate-200 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-yellow-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs">
                    5x1
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">
                      Divisão de Papéis: Quem Realiza o Passe vs Quem Faz Cobertura?
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Conceito fundamental para alunos e professores no voleibol moderno
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Regra Tática
                </span>
              </div>

              {/* Banner da Regra de Ouro */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 text-xs font-bold leading-relaxed flex items-start gap-2 shadow-xs">
                <span className="text-lg shrink-0">🛡️</span>
                <div>
                  <strong className="text-amber-900 font-black block">REGRA DE OURO DO 5x1:</strong>
                  {SYSTEM_5X1_COVERAGE_GUIDE.goldenRule}
                </div>
              </div>

              {/* Grid Didático de Papéis dos Atletas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-1">
                {SYSTEM_5X1_COVERAGE_GUIDE.roles.map((item, idx) => (
                  <div
                    key={`coverage-role-${idx}`}
                    className={`p-3 rounded-xl border flex flex-col justify-between gap-1.5 transition-all hover:shadow-sm ${item.colorClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-xs">
                        <span className="text-base">{item.icon}</span>
                        <span>{item.roleName}</span>
                      </div>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          item.isPasser
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        {item.isPasser ? '✅ Passador' : '🚫 Não Passa'}
                      </span>
                    </div>

                    <div className="text-[11px] leading-snug space-y-1">
                      <p className="font-bold">{item.passRoleDescription}</p>
                      <p className="opacity-90 font-medium">
                        <strong className="font-bold">Cobertura/Ataque:</strong> {item.coverageRoleDescription}
                      </p>
                    </div>

                    <div className="text-[10px] pt-1.5 border-t border-current/20 italic opacity-80">
                      💡 <strong>Por quê?</strong> {item.tacticalWhy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal / Detalhes de Função do Atleta Selecionado (Mobile-First & Touch-Friendly) */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
          <div className="bg-white border-2 border-[#1e3a8a] rounded-2xl p-4 sm:p-5 w-[calc(100vw-20px)] sm:max-w-md text-slate-900 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-10 h-10 rounded-full font-black flex items-center justify-center text-sm shadow-sm shrink-0 ${
                  selectedPlayer.isLibero
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-500'
                    : 'bg-[#1e3a8a] text-yellow-400'
                }`}>
                  {selectedPlayer.isLibero ? '🛡️' : selectedPlayer.label}
                </span>
                <div className="min-w-0">
                  <h3 className="font-black text-sm sm:text-base text-slate-900 truncate">
                    {selectedPlayer.roleName}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                    Camisa #{selectedPlayer.jerseyNumber || 10} | Posição: P{selectedPlayer.rotationIndex}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-bold flex items-center justify-center border border-slate-200 shrink-0 text-base active:scale-95"
                aria-label="Fechar modal do atleta"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-700">
              {/* Destaque se for Líbero */}
              {selectedPlayer.isLibero && (
                <div className="p-3 bg-amber-50 rounded-xl border-2 border-amber-400 text-amber-950 font-medium space-y-1">
                  <strong className="text-amber-900 font-black flex items-center gap-1">
                    🛡️ Identificação do Líbero:
                  </strong>
                  <p className="text-xs">
                    • <strong>Uniforme Contrastante:</strong> Usa camisa de cor diferente de toda a equipe para fácil identificação da arbitragem.
                  </p>
                  <p className="text-xs">
                    • <strong>Substituição Especial:</strong> Entra e sai livremente no fundo de quadra no lugar de um dos Centrais, sem contar nas substituições normais.
                  </p>
                  <p className="text-xs">
                    • <strong>Restrições Oficiais:</strong> Proibido sacar, bloquear, tentar bloquear ou concluir ataque acima da borda superior da rede.
                  </p>
                </div>
              )}

              {/* Status de Passe no 5x1 */}
              {system === '5x1' && (
                <div className={`p-3 rounded-xl border font-medium ${
                  selectedPlayer.isLibero || selectedPlayer.role === 'OH1' || selectedPlayer.role === 'OH2' || selectedPlayer.role === 'P1' || selectedPlayer.role === 'P2'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}>
                  <strong className="block mb-1 font-bold">
                    {selectedPlayer.isLibero || selectedPlayer.role === 'OH1' || selectedPlayer.role === 'OH2' || selectedPlayer.role === 'P1' || selectedPlayer.role === 'P2'
                      ? '📥 Ação no Passe de Saque: REALIZA O PASSE'
                      : '🚫 Ação no Passe de Saque: NÃO PASSA (ESCONDIDO)'}
                  </strong>
                  <p className="text-xs">
                    {selectedPlayer.isLibero && 'Especialista máximo do passe e defesa. Cobre a maior área do fundo com os dois ponteiros.'}
                    {(selectedPlayer.role === 'OH1' || selectedPlayer.role === 'OH2') && 'Forma a linha de recepção em W/U de 3 passadores junto com o Líbero.'}
                    {selectedPlayer.role === 'S' && 'Fica escondido para não tocar no 1º passe e poder dar o levantamento com precisão na 2ª bola. Faz cobertura logo após o levantamento.'}
                    {selectedPlayer.role === 'OP' && 'Não toca na bola de passe para focar 100% no ataque de potência na saída de rede e no fundo.'}
                    {(selectedPlayer.role === 'MB1' || selectedPlayer.role === 'MB2') && 'Na rede não passa para puxar o ataque rápido de 1º tempo e cobertura curta de toco. No fundo dá lugar ao Líbero.'}
                  </p>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-blue-900 block mb-1 font-bold">Missão Principal em Quadra:</strong>
                {selectedPlayer.role === 'S' && 'Distribuir os levantamentos com precisão, escolher o melhor atacante livre e infiltrar no momento certo.'}
                {selectedPlayer.role === 'OP' && 'Maior pontuador da equipe. Ataca na saída de rede (Posição 2) e ataca do fundo atrás da linha dos 3 metros.'}
                {(selectedPlayer.role === 'OH1' || selectedPlayer.role === 'OH2') && 'Receber o saque (manchete), atacar na entrada de rede (Posição 4) e compor o bloqueio duplo.'}
                {(selectedPlayer.role === 'MB1' || selectedPlayer.role === 'MB2') && 'Bloquear os ataques no centro e nas extremidades, e atacar bolas rápidas de primeiro tempo no meio da rede.'}
                {selectedPlayer.isLibero && 'Especialista em defesa e passe. Substituição livre pelo central de fundo. Proibido atacar acima da rede ou bloquear.'}
                {(selectedPlayer.role === 'P1' || selectedPlayer.role === 'P2') && system === 'beach_2x2' && 'Dupla completa: ambos devem saber passar, levantar, atacar, bloquear e defender no chão.'}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-blue-900 block mb-1 font-bold">Regra da Linha dos 3 Metros:</strong>
                {selectedPlayer.rotationIndex === 1 || selectedPlayer.rotationIndex === 6 || selectedPlayer.rotationIndex === 5 ? (
                  <span className="text-amber-800 font-bold">
                    ⚠️ Atualmente no FUNDO (Posição {selectedPlayer.rotationIndex}). NÃO pode atacar acima da rede saltando à frente da linha dos 3 metros.
                  </span>
                ) : (
                  <span className="text-emerald-800 font-bold">
                    ✅ Atualmente na REDE (Posição {selectedPlayer.rotationIndex}). Livre para atacar e bloquear na zona de ataque!
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedPlayer(null)}
              className="mt-5 w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-lg transition-all shadow-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
