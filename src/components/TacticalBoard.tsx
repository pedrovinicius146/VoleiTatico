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
              Formato de Jogo (Como o time joga)
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              {currentSystemInfo.name}
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {currentSystemInfo.difficulty === 'Iniciante' ? '🟢 Iniciante (Fácil)' : currentSystemInfo.difficulty === 'Intermediário' ? '🟡 Intermediário' : '🔴 Avançado'}
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
                {sys.id === '6x0' && '6x0 (Iniciante)'}
                {sys.id === '4x2_simple' && '4x2 Simples'}
                {sys.id === '4x2_inversion' && '4x2 Invertido'}
                {sys.id === '5x1' && '5x1 (Oficial Avançado)'}
                {sys.id === 'beach_2x2' && 'Vôlei de Praia (Dupla)'}
              </button>
            ))}
          </div>
        </div>

        {/* Resumo Pedagógico do Sistema em Linguagem Simples */}
        <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200 text-xs sm:text-sm text-slate-700 flex items-start gap-2">
          <span className="text-base shrink-0">💡</span>
          <div>
            <strong className="text-blue-950 font-bold">Como funciona este formato: </strong>
            <span>{currentSystemInfo.logic}</span>
          </div>
        </div>
      </div>

      {/* Cartão Didático de Ajuda Rápida para Quem Nunca Mexeu no Simulador */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 sm:p-4 text-xs text-amber-950">
        <div className="flex items-center gap-2 font-black text-amber-900 mb-1">
          <span>🏐</span>
          <span className="text-sm">Passo a passo rápido para aprender:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-amber-900">
          <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
            <strong>1. Gire o Rodízio:</strong> Use os números de 1 a 6 abaixo para ver como o time gira no sentido horário a cada ponto de saque.
          </div>
          <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
            <strong>2. Veja as Fases:</strong> Alterne entre antes do saque, na batida e bola em jogo para entender as movimentações.
          </div>
          <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
            <strong>3. Toque ou Arraste:</strong> Toque em qualquer jogador para ler sua função ou arraste para testar se gera falta de posição!
          </div>
        </div>
      </div>

      {/* Grid Principal: Controles + Quadra 2D + Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Painel Esquerdo: Controles de Rodízio e Fases (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Navegador de Rodízio R1 a R6 */}
          {system !== 'beach_2x2' ? (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-full min-w-0 box-border overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Rodízio Oficial das Posições
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Posição atual: <strong>Posição {rotation} (R{rotation})</strong>
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Giro Horário ↻
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
                    className={`py-2 rounded-lg text-xs font-black transition-all flex flex-col items-center justify-center ${
                      rotation === r
                        ? 'bg-yellow-500 text-slate-950 shadow-sm ring-2 ring-yellow-400 font-black'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                    title={`Ver Posicionamento no Rodízio Posição ${r}`}
                  >
                    <span>P{r}</span>
                    <span className="text-[9px] font-normal">{r === 1 ? 'Saque' : `Pos ${r}`}</span>
                  </button>
                ))}
              </div>

              {/* Botões Voltar e Avançar Posição */}
              <div className="grid grid-cols-2 gap-2 mb-3 w-full min-w-0">
                <button
                  onClick={prevRotation}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1 text-xs border border-slate-200 whitespace-nowrap"
                  title="Girar para a posição anterior"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" /> Posição Anterior
                </button>

                <button
                  onClick={nextRotation}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1 text-xs border border-slate-200 whitespace-nowrap"
                  title="Girar para a próxima posição do rodízio"
                >
                  Próxima Posição <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              </div>

              <div className="text-center bg-blue-50 py-2.5 px-3 rounded-lg border border-blue-200 text-xs font-semibold text-blue-900 leading-snug">
                {system === '5x1' && (
                  <>
                    No 5x1: Levantador está na{' '}
                    <strong className="text-blue-950 font-black">
                      {rotation === 1 && 'Posição 1 (Fundo/Sacador)'}
                      {rotation === 2 && 'Posição 6 (Fundo Meio)'}
                      {rotation === 3 && 'Posição 5 (Fundo Esquerda)'}
                      {rotation === 4 && 'Posição 4 (Rede Entrada)'}
                      {rotation === 5 && 'Posição 3 (Rede Meio)'}
                      {rotation === 6 && 'Posição 2 (Rede Saída)'}
                    </strong>
                  </>
                )}
                {system !== '5x1' && `Posições dos 6 jogadores no Rodízio ${rotation}`}
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Quem vai sacar na Dupla de Praia
              </span>
              <p className="text-xs text-slate-500 mb-2.5">
                No vôlei de praia não há rodízio obrigatório de posições, apenas alternância de quem saca.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRotation(1)}
                  className={`py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                    rotation === 1 ? 'bg-yellow-500 text-slate-950 ring-2 ring-yellow-400 font-black' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  🏐 Atleta 1 (Sacando)
                </button>
                <button
                  onClick={() => setRotation(2)}
                  className={`py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                    rotation === 2 ? 'bg-yellow-500 text-slate-950 ring-2 ring-yellow-400 font-black' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  🏐 Atleta 2 (Sacando)
                </button>
              </div>
            </div>
          )}

          {/* Alternador dos 3 Momentos da Jogada (Antes do Saque, Batida e Durante o Ponto) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Momento da Jogada
                </span>
                <span className="text-xs text-slate-500 font-medium">Veja onde os jogadores vão</span>
              </div>
              <button
                onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                  isPlayingAnimation
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
                title="Ver os jogadores correndo e trocando de lugar"
              >
                {isPlayingAnimation ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pausar Movimento
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Ver Movimento
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
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  phase === 'reception' ? 'bg-white text-blue-700' : 'bg-slate-200 text-slate-700'
                }`}>
                  1
                </span>
                <div>
                  <div className="font-black">1. Antes do Saque (Esperando o Apito)</div>
                  <div className={`text-[11px] font-medium leading-tight mt-0.5 ${phase === 'reception' ? 'text-blue-100' : 'text-slate-500'}`}>
                    Posições obrigatórias pelas regras. Se alguém sair antes da hora, o juiz apita falta de posição.
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
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  phase === 'serve_hit' ? 'bg-slate-900 text-yellow-400' : 'bg-slate-200 text-slate-700'
                }`}>
                  2
                </span>
                <div>
                  <div className="font-black">2. No Toque do Saque (Hora da Corrida)</div>
                  <div className={`text-[11px] font-medium leading-tight mt-0.5 ${phase === 'serve_hit' ? 'text-slate-900' : 'text-slate-500'}`}>
                    A bola foi sacada! Agora os jogadores estão autorizados a correr para suas posições ideais de ataque e defesa.
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
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  phase === 'transition' ? 'bg-white text-emerald-700' : 'bg-slate-200 text-slate-700'
                }`}>
                  3
                </span>
                <div>
                  <div className="font-black">3. Durante o Ponto (Ataque e Bloqueio)</div>
                  <div className={`text-[11px] font-medium leading-tight mt-0.5 ${phase === 'transition' ? 'text-emerald-100' : 'text-slate-500'}`}>
                    A bola está em jogo. Cada atleta fica no seu melhor lugar para cortar ou bloquear na rede.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Botões de Ação Rápida */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadPresetFormation(system, rotation, phase)}
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all border border-slate-200"
              title="Colocar todos os jogadores nos lugares recomendados para esta posição"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" /> ↺ Voltar Lugares Certos
            </button>
            <button
              onClick={() => setShowZoneNumbers(!showZoneNumbers)}
              className={`py-2.5 px-3 text-xs font-bold rounded-lg border transition-all ${
                showZoneNumbers
                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title="Mostrar os números de 1 a 6 desenhados no chão da quadra"
            >
              {showZoneNumbers ? 'Zonas 1-6 (Ligadas)' : 'Zonas 1-6 (Desligadas)'}
            </button>
          </div>
        </div>

        {/* Painel Central: Quadra 2D Interativa (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Status do Validador de Posição sem siglas técnicas */}
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
                      ✅ Posições 100% Corretas! Sem Falta de Posição
                    </div>
                    <p className="text-xs text-emerald-800 mt-0.5 font-medium leading-relaxed">
                      Todos os jogadores estão respeitando os colegas da frente, de trás, da esquerda e da direita. O juiz pode autorizar o saque!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black text-sm text-red-900 flex items-center gap-1.5">
                      ⚠️ Atenção: Jogador Fora do Lugar! ({faults.length} ajuste{faults.length > 1 ? 's' : ''} necessário{faults.length > 1 ? 's' : ''})
                    </div>
                    <ul className="mt-1 text-xs space-y-1 text-red-800">
                      {faults.map((f, i) => (
                        <li key={`fault-item-${i}`} className="flex items-start gap-1 font-semibold">
                          <span>•</span>
                          <span>{f.description}</span>
                        </li>
                      ))}
                    </ul>
                    <span className="text-[11px] text-red-700 mt-1.5 block font-bold">
                      👉 Como corrigir: Arraste a ficha destacada com borda vermelha na quadra para o lugar correto ou clique em "Voltar Lugares Certos".
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

            {/* Barra Didática de Instrução Gestual em Linguagem Simples */}
            <div className="w-full mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                <span>👆 <strong>Toque rápido no jogador:</strong> Abre a explicação do que ele faz</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <span>✋ <strong>Clique e arraste com o dedo ou mouse:</strong> Move o jogador pela quadra</span>
              </span>
            </div>
          </div>

          {/* Dica Pedagógica do Professor em Linguagem Clara */}
          <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-[#1e3a8a] border-t border-r border-b border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <BookOpen className="w-4 h-4 text-[#1e3a8a]" />
              <span className="text-xs font-black text-[#1e3a8a] uppercase tracking-wide">
                Dica do Professor ({system === '5x1' ? `Sistema 5x1 • Posição ${rotation}` : system})
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
              Fechar e Voltar para a Quadra
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
